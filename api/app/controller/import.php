<?php
class Import
{

  private $db;
  private $wocid;
  private $wocdata;
  private $type;
  private $xml;

  // Called as //localhost/wocdb/api/import/<filetype>/<dir>/<wocid>/<save>

  // if <save> is save then the db will be updated at the end of the import
  // for any other value, or if it is missing, the import will run but not update

  // Assumptions
  // 1: WOC already set up in woc table
  // 2: Files in XML format in c:\tmp\<dir>
  // 3: Files named e.g. Long-xxx where text before - is race type: Long, Middle, Sprint, SprintQual, SprintRelay, Relay, KOSprintQual, KOSprint
  // and xxx is anything
  // 4: <filetype> is "csv" or "xml"

  public function importEvents($fff)
  {
    $this->db = $fff->get("db.instance");

    $dir = "C:/tmp/" . $fff->get('PARAMS.dir');

    $save = $fff->get('PARAMS.save');
    if ($save !== "save") {
      echo "Import test: db will not be updated<br>";
    }
    $this->wocid = $fff->get('PARAMS.wocid');
    echo "Importing results for WOCID " . $this->wocid . " from " . $dir . "<br>";

    $wocs = new DB\SQL\Mapper($this->db, 'woc');
    $this->wocdata = $wocs->load(array('id=?', $this->wocid));

    $files = array_filter(scandir($dir), function ($item) {
      return !is_dir($item);
    });

    // do this as a single transaction: much faster and avoids script timing out
    $this->db->begin();

    foreach ($files as $file) {

      $this->type = substr($file, 0, strpos($file, "-"));
      echo "Type : " . $this->type . "<br>";
      if ($fff->get('PARAMS.filetype') === "xml") {

        if ($this->importXML($dir . "/" . $file)) {
          // <IOFVersion> only present for V2 XML files
          ($this->xml->IOFVersion) ?
            $this->processIOFV2XML() :
            $this->processIOFV3XML();
        }
      } else {
        // import csv files
        $this->importCSV($dir . "/" . $file);
      }
    }

    $runnercount = count($this->db->exec(
      'SELECT DISTINCT personid FROM result WHERE wocid=:wocid',
      array(':wocid' => $this->wocid),
    ));
    $countrycount = count($this->db->exec(
      'SELECT DISTINCT country FROM result WHERE wocid=:wocid',
      array(':wocid' => $this->wocid),
    ));
    echo "Runners : " . $runnercount . "<br>";
    echo "Countries : " . $countrycount . "<br>";
    $this->wocdata->runners = $runnercount;
    $this->wocdata->countries = $countrycount;
    $this->wocdata->save();

    if ($save === "save") {
      $this->db->commit();
      echo "db updated<br>";
    }
  }

  private function importXML($file)
  {
    // extracts info from XML file exported from Winsplits
    $this->xml = simplexml_load_file($file);
    if ($this->xml === false) {
      echo "Invalid XML file: " . $file . "<br>";
      return false;
    }
    echo "Valid XML file: " . $file . " for " . $this->type . "<br>";
    return true;
  }

  private function importCSV($file)
  {
    // extracts info from csv file created by hand
    // mainly for relays...
    // @ suppresses error report if file does not exist
    if (($handle = @fopen($file, "r")) !== false) {
      $results = new DB\SQL\Mapper($this->db, 'result');
      $names = new DB\SQL\Mapper($this->db, 'name');
      $races = new DB\SQL\Mapper($this->db, 'race');
      // expected format
      $_POSITION = 0;
      $_NAME = 1;
      $_COUNTRY = 2;
      $_TIME = 3;
      // Men, Women or Mixed
      $_CLASS = 4;
      $classname = "";
      while (($data = fgetcsv($handle, 0, ",")) !== false) {
        if ($classname !== $data[$_CLASS]) {
          $classname = $data[$_CLASS];
          echo "Adding class: " . $classname . "<br>";
          // create new race record
          $races->reset();
          // id is set automatically when race is saved
          $races->wocid = $this->wocid;
          $races->year = $this->wocdata->year;
          $races->class = $classname;
          $races->type = $this->type;
          $races->winner = $data[$_NAME];
          $races->country = $data[$_COUNTRY];
          //  $races->country = $this->getCountryCode($data[$_COUNTRY]);
          $races->time = $data[$_TIME];
          $races->timeseconds = 0;

          $races->save();
        }
        $name = $data[$_NAME];
        $names->load(array('name=?', $name));
        if ($names->loaded() == 0) {
          // add a new name
          $names->reset();
          $names->name = $name;
          $names->nameid = 0;
          $names->personid = 0;
          $names->plainname = $this->getPlainName($name);
          $names->save();
          // id now allocated so copy to other fields
          $names->nameid = $names->id;
          $names->personid = $names->id;
          $names->save();
        }
        $results->reset();
        $results->position = 1;
        $results->position = $data[$_POSITION];
        $results->name = $name;
        $results->country = $this->getCountryCode($data[$_COUNTRY]);
        $results->time = $data[$_TIME];
        $results->seconds = 0;
        $results->secsdown = 0;
        $results->percentdown = 0.0;
        $results->class = $classname;
        $results->race = $this->type;
        $results->year = $this->wocdata->year;
        $results->raceid = $races->id;
        $results->wocid = $this->wocid;
        $results->final = $this->getFinalType($classname);
        $results->nameid = $names->nameid;
        $results->personid = $names->personid;
        if (($results->final > 0) && ($results->final < 4)) {
          $results->points = max(51 - $pos, 0);
        } else {
          $results->points = 0;
        }
        $results->save();
        echo "Added new result " . $results->name . ": " . $results->country . ": " . $results->position . ": " . $results->time . "<br>";
      }
      fclose($handle);
    } else {
      echo "Cannot read file: " . $file . "<br>";
    }
  }

  private function processIOFV3XML()
  {
    echo "Processing IOF V3 XML file.<br>";
    $results = new DB\SQL\Mapper($this->db, 'result');
    $names = new DB\SQL\Mapper($this->db, 'name');
    $races = new DB\SQL\Mapper($this->db, 'race');

    foreach ($this->xml->ClassResult as $class) {
      $classname = $class->Class->Name;
      echo "New class: " . $classname . "<br>";
      if ($this->type == 'SprintRelay') {
        $correctedclass = 'Mixed';
      } else {
        $correctedclass = (substr($classname, 0, 1) == 'M') ? "Men" : "Women";
      }

      // create new race record
      $races->reset();
      // id is set automatically when race is saved
      $races->wocid = $this->wocid;
      if (($this->type == 'SprintQual') || ($this->type == 'KOSprintQual')) {
        $races->type = $this->type . '-' . $classname;
      } else {
        $races->type = $this->type;
      }
      $races->year = $this->wocdata->year;
      $races->class = $correctedclass;
      $races->save();

      $firstrecord = true;
      $winnerseconds = 0;

      foreach ($class->PersonResult as $personresult) {
        $status = $this->getV3Status($personresult->Result->Status);
        // don't save Did Not Start records
        if ($status == 'DNS') {
          continue;
        }

        $fullname = $personresult->Person->Name;
        $name = trim($fullname->Given) . " " . trim($fullname->Family);

        $names->load(array('name=?', $name));
        if ($names->loaded() == 0) {
          // add a new name
          $names->reset();
          $names->name = $name;
          $names->nameid = 0;
          $names->personid = 0;
          $names->plainname = $this->getPlainName($name);
          $names->save();
          // id now allocated so copy to other fields
          $names->nameid = $names->id;
          $names->personid = $names->id;
          $names->save();
        }

        if ($personresult->Organisation->Country) {
          $country = $personresult->Organisation->Country;
          // trim ' 1' from relay results
          $country = str_replace(' 1', '', $country);
          // change Great Britain to GBR
          if (strlen($country) > 3) {
            $country = $this->getCountryCode($country);
          }
        } else {
          $country = "XXX";
        }

        $secs = $personresult->Result->Time;
        $time = $this->getTimeFromSeconds($secs);
        $pos = $personresult->Result->Position;
        if ($status != 'OK') {
          $pos = 999;
          $time = $status;
        }

        if ($firstrecord) {
          $winnerseconds = $secs;
        }
        if (($pos < 999) && ($winnerseconds > 0)) {
          $secsbehind = $secs - $winnerseconds;
          // save 1 decimal place
          $percentbehind = number_format(($secsbehind / $winnerseconds) * 100, 1);
        } else {
          $secsbehind = 0;
          $percentbehind = 0.0;
        }
        $results->reset();
        $results->position = $pos;
        $results->name = $name;
        $results->country = $country;
        $results->time = $time;
        $results->seconds = $secs;
        $this->type === 'Relay' ? $results->secsdown = 0 : $results->secsdown = $secsbehind;
        $this->type === 'Relay' ? $results->percentdown = 0 : $results->percentdown = $percentbehind;
        $results->class = $correctedclass;
        $results->race = $this->type;
        $results->year = $this->wocdata->year;
        $results->raceid = $races->id;
        $results->wocid = $this->wocid;
        $results->final = $this->getFinalType($classname);
        $results->nameid = $names->nameid;
        $results->personid = $names->personid;
        if (($results->final > 0) && ($results->final < 4)) {
          $results->points = max(51 - $pos, 0);
        } else {
          $results->points = 0;
        }
        $results->save();

        if ($firstrecord) {
          $races->winner = $results->name;
          $races->country = $results->country;
          $races->time = $results->time;
          $races->timeseconds = $results->seconds;
          if ($class->Course->Length) {
            $races->distance = number_format(($class->Course->Length) / 1000, 1);
          }
          $firstrecord = false;
        }
      }
      // update race record
      $races->save();
    }
  }

  private function processIOFV2XML()
  {
    echo "Processing IOF V2 XML file.<br>";
    $results = new DB\SQL\Mapper($this->db, 'result');
    $names = new DB\SQL\Mapper($this->db, 'name');
    $races = new DB\SQL\Mapper($this->db, 'race');

    foreach ($this->xml->ClassResult as $class) {
      $classname = $class->ClassShortName;
      echo "New class: " . $classname . "<br>";
      if ($this->type == 'SprintRelay') {
        $correctedclass = 'Mixed';
      } else {
        $correctedclass = (substr($classname, 0, 1) == 'M') ? "Men" : "Women";
      }
      // create new race record
      $races->reset();
      // id is set automatically when race is saved
      $races->wocid = $this->wocid;
      if (($this->type == 'SprintQual') || ($this->type == 'MiddleQual')) {
        $races->type = $this->type . '-' . $classname;
      } else {
        $races->type = $this->type;
      }
      $races->year = $this->wocdata->year;
      $races->class = $correctedclass;
      $races->save();
      echo "Added new race record " . $races->id . ": " . $correctedclass . " :" . $races->type . "<br>";
      $firstrecord = true;
      $winnerseconds = 0;

      foreach ($class->PersonResult as $personresult) {
        $status = $this->getV2Status(
          $personresult->Result->CompetitorStatus->attributes()
        );
        // don't save Did Not Start records
        if ($status == 'DNS') {
          continue;
        }

        $fullname = $personresult->Person->PersonName;
        $name = trim(trim($fullname->Given) . " " . trim($fullname->Family));
        // WOC 2021 hack for <Given sequence="1">Leake Alice</Given>
        // move everything after last space to front
        // $pos = strrpos($name, chr(32), 0);
        // if ($pos !== false) {
        //   $end = substr($name, $pos + 1);
        //   $start = substr($name, 0, $pos);
        //   $name = $end.' '.$start;
        // }

        $names->load(array('name=?', $name));
        if ($names->loaded() == 0) {
          // add a new name
          $names->reset();
          $names->name = $name;
          $names->nameid = 0;
          $names->personid = 0;
          $names->plainname = $this->getPlainName($name);
          $names->save();
          // id now allocated so copy to other fields
          $names->nameid = $names->id;
          $names->personid = $names->id;
          $names->save();
        }

        if ($personresult->Club) {
          $attrs = $personresult->Person->Country->CountryId->attributes();
          $country = (string) $attrs["value"];
          // trim '-1' from relay results
          // $country = str_replace('-1', '', $country);
          // // change Great Britain to GBR
          // if (strlen($country) > 3) {
          //   $country = $this->getCountryCode($country);
          // }
        } else {
          $country = "XXX";
        }

        $time = $personresult->Result->Time->Clock;
        $pos = $personresult->Result->ResultPosition;
        if ($status != 'OK') {
          $pos = 999;
          $time = $status;
        }

        // convert HH:MM:SS to seconds
        if ($pos < 999) {
          $secs = substr($time, 0, 2) * 3600;
          $secs += substr($time, 3, 2) * 60;
          $secs += substr($time, 6, 2);
        } else {
          $secs = 0;
        }
        if ($firstrecord) {
          $winnerseconds = $secs;
        }
        if (($pos < 999) && ($winnerseconds > 0)) {
          $secsbehind = $secs - $winnerseconds;
          // save 1 decimal place
          $percentbehind = number_format(($secsbehind / $winnerseconds) * 100, 1);
        } else {
          $secsbehind = 0;
          $percentbehind = 0.0;
        }
        // convert HH:MM:SS to MMM:SS
        if (strlen($time) == 8) {
          $time = ((60 * substr($time, 0, 2)) + substr($time, 3, 2)) . substr($time, 5, 3);
        }
        $results->reset();
        $results->position = $pos;
        $results->name = $name;
        $results->country = $country;
        $results->time = $time;
        $results->seconds = $secs;
        $this->type === 'Relay' ? $results->secsdown = 0 : $results->secsdown = $secsbehind;
        $this->type === 'Relay' ? $results->percentdown = 0 : $results->percentdown = $percentbehind;
        $results->class = $correctedclass;
        //$results->race = $this->type;
        if (($this->type == 'SprintQual') || ($this->type == 'MiddleQual')) {
          $results->race = $this->type . '-' . $classname;
        } else {
          if ($this->type == "KOSprint") {
            $results->race = $this->getKOType($classname);
          } else {
            $results->race = $this->type;
          }
        }
        $results->year = $this->wocdata->year;
        $results->raceid = $races->id;
        $results->wocid = $this->wocid;
        $results->final = $this->getFinalType($classname);
        $results->nameid = $names->nameid;
        $results->personid = $names->personid;
        if ($results->final > 0) {
          $results->points = max(51 - $pos, 0);
        } else {
          $results->points = 0;
        }
        $results->save();

        if ($firstrecord) {
          $races->winner = $results->name;
          $races->country = $results->country;
          $races->time = $results->time;
          $races->timeseconds = $results->seconds;
          $races->final = $results->final;
          $races->type = $results->race;
          if ($personresult->Result->CourseLength) {
            $races->distance = number_format(($personresult->Result->CourseLength) / 1000, 1);
          }
          $firstrecord = false;
        }

        echo "Added new result " . $name . ": " . $country . ": " . $pos . ": " . $time . "<br>";
      }
      // update race record
      $races->save();
    }
  }

  private function getKOType($classname)
  {
    if (($classname == "Men Final") || ($classname == "Women Final")) {
      return "KOSprint";
    }
    $class = str_replace('Men ', '', $classname);
    $class = str_replace('Women ', '', $class);
    $class = str_replace(' ', '', $class);
    $race = "KOSprintQual-" . $class;
    echo $classname, $race, "</br>";
    return $race;
  }

  private function getTimeFromSeconds($secs)
  {
    return sprintf("%02.2d:%02.2d", floor($secs / 60), $secs % 60);;
  }

  private function getPlainName($name)
  {
    $plainName = iconv("UTF-8", "ASCII//TRANSLIT", $name);
    $plainName = strtolower($plainName);
    $plainName = str_replace(' ', '', $plainName);
    return $plainName;
  }

  private function getCountryCode($country)
  {
    $countrydata = new DB\SQL\Mapper($this->db, 'country');
    $countrydata->load(array('country=?', $country));
    if ($countrydata->loaded() == 1) {
      $code = $countrydata->abbr;
    } else {
      $code = $country;
    }
    return $code;
  }

  private function getV3Status($status)
  {
    switch ($status) {
      case 'Disqualified':
        return 'DSQ';
      case 'MisPunch':
        return 'DSQ';
      case 'OverTime':
        return 'OT';
      case 'DidNotFinish':
        return 'DNF';
      case 'DidNotStart':
        return 'DNS';
      default:
        return $status;
    }
  }

  private function getV2Status($attrs)
  {
    $status = (string) $attrs["value"];
    switch ($status) {
      case 'Disqualified':
        return 'DSQ';
      case 'MisPunch':
        return 'MP';
      case 'OverTime':
        return 'OT';
      case 'DidNotFinish':
        return 'DNF';
      case 'DidNotStart':
        return 'DNS';
      default:
        return $status;
    }
  }

  private function getFinalType($classname)
  {
    switch ($this->type) {
      case "Long":
        return 1;
      case "Middle":
        return 2;
      case "Sprint":
        return 3;
      case "Relay":
        return 4;
      case "SprintRelay":
        return 5;
      case "KOSprint":
        if (($classname == "Men Final") || ($classname == "Women Final")) {
          return 6;
        } else {
          return 0;
        }
      default:
        return 0;
    }
  }
}
