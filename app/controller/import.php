<?php
class Import {

private $db;
private $wocid;
private $wocdata;
private $type;
private $xml;

// Called as https://localhost/wocdb/import/<filetype>/<dir>/<wocid>
// Assumptions
// 1: WOC already set up in woc table
// 2: Files in XML format in c:\temp\<dir>
// 3: Files named e.g. Long-xxx where text before - is race type: Long, Middle, Sprint, SprintQual, SprintRelay, Relay
// and xxx is anything
// 4: <filetype> is "csv" or "xml"

public function importEvents($fff) {
  $this->db = $fff->get("db.instance");
  
  $dir = "C:/tmp/".$fff->get('PARAMS.dir');
  $this->wocid = $fff->get('PARAMS.wocid');
  echo "Importing results for WOCID ".$this->wocid." from ".$dir."<br>";

  $wocs = new DB\SQL\Mapper($this->db, 'woc');
  $this->wocdata = $wocs->load(array('id=?',$this->wocid));
  
  $files = array_filter(scandir($dir), function ($item) {
    return !is_dir($dir . $item);
  });

  // do this as a single transaction: much faster and avoids script timing out
  $this->db->begin();
  
  foreach ($files as $file) {

    $this->type = substr($file, 0, strpos($file, "-"));

    if ($fff->get('PARAMS.filetype') === "xml") {
          
      if ($this->importXML($dir."/".$file)) {   
      // <IOFVersion> only present for V2 XML files
      ($this->xml->IOFVersion) ? 
        $this->processIOFV2XML():
        $this->processIOFV3XML();
      }
    } else {
      // import csv files
      $this->importCSV($dir."/".$file);
    }
  }
  $this->db->commit();
}

private function importXML($file) {
  // extracts info from XML file exported from Winsplits
  $this->xml = simplexml_load_file($file);
  if ($this->xml === false) {
    echo "Invalid XML file: ".$file."<br>";
    return false;
  }
  echo "Valid XML file: ".$file." for ".$this->type."<br>";
  return true;
}

private function importCSV($file) {
  // extracts info from csv file created by hand
  // mainly for relays...
  // @ suppresses error report if file does not exist
  if (($handle = @fopen($file, "r")) !== false) {
    echo "Processing CSV file.<br>";
    $results = new DB\SQL\Mapper($this->db, 'result');
    $names = new DB\SQL\Mapper($this->db, 'name');
    $races = new DB\SQL\Mapper($this->db, 'race');
    // expected format
    $_POSITION = 0;
    $_NAME = 1;
    // three letter code
    $_COUNTRY = 2;
    $_TIME = 3;
    // Men, Women or Mixed
    $_CLASS = 4;
    $classname = "";
    while (($data = fgetcsv($handle, 0, ",")) !== false) {
      if ($classname !== $data[$_CLASS]) {
        $classname = $data[$_CLASS];
        echo "Adding class: ".$classname."<br>";
        // create new race record
        $races->reset();
        // id is set automatically when race is saved
        $races->wocid = $this->wocid;
        $races->year = $this->wocdata->year;
        $races->class = $classname;
        $races->type = $this->type;
        $races->winner = $data[$_NAME];
        $races->country = $data[$_COUNTRY];
        $races->time = $data[$_TIME];
        $races->timeseconds = 0;
        $races->save();
      }
      $name = $data[$_NAME];
      $names->load(array('name=?',$name));
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
      $results->position = $data[$_POSITION];
      $results->name = $name;
      $results->country = $data[$_COUNTRY];
      $results->time = $data[$_TIME];
      $results->seconds = 0;
      $results->secsdown = 0;
      $results->percentdown = 0.0;
      $results->class = $classname;
      $results->race = $this->type;
      $results->year = $this->wocdata->year;
      $results->raceid = $races->id;
      $results->wocid = $this->wocid;
      $results->final = $this->getFinalType();
      $results->nameid = $names->nameid;
      $results->personid = $names->personid;
      if (($results->final > 0) && ($results->final < 4)) {
        $results->points = max(51 - $pos, 0);
      } else {
        $results->points = 0;
      }
      $results->save();
    }
    fclose($handle);
  } else {
    echo "Cannot read file: ".$file."<br>";
  }
}

private function processIOFV3XML() {
  echo "Processing IOF V3 XML file.<br>";
  $results = new DB\SQL\Mapper($this->db, 'result');
  $names = new DB\SQL\Mapper($this->db, 'name');
  $races = new DB\SQL\Mapper($this->db, 'race');

  foreach ($this->xml->ClassResult as $class) {
    $classname = $class->Class->Name;
    echo "New class: ".$classname."<br>";
    if ($this->type == 'SprintRelay') {
      $correctedclass = 'Mixed'; 
    } else {
      $correctedclass = (substr($classname, 0, 1) == 'M') ? "Men" : "Women";
    }

    // create new race record
    $races->reset();
    // id is set automatically when race is saved
    $races->wocid = $this->wocid;
    if ($this->type == 'SprintQual') {
      $races->type = $this->type.'-'.$classname;
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
      $name = trim($fullname->Given)." ".trim($fullname->Family);
      
      $names->load(array('name=?',$name));
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
        $percentbehind = number_format(($secsbehind/$winnerseconds) * 100, 1);
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
      $this->type === 'Relay' ? $results->secsdown = 0: $results->secsdown = $secsbehind;
      $this->type === 'Relay' ? $results->percentdown = 0: $results->percentdown = $percentbehind;
      $results->class = $correctedclass;
      $results->race = $this->type;
      $results->year = $this->wocdata->year;
      $results->raceid = $races->id;
      $results->wocid = $this->wocid;
      $results->final = $this->getFinalType();
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
          $races->distance = number_format(($class->Course->Length)/1000, 1);
        }
        $firstrecord = false;
      }
    }
    // update race record
    $races->save();
  }
}
  
private function processIOFV2XML() {
  echo "Processing IOF V2 XML file.<br>";
  $relay2019 = array(
    "WSWE" => 1,
    "WSUI" => 2,
    "WRUS" => 3,
    "WNOR" => 4,
    "WCZE" => 5,
    "WFIN" => 6,
    "WEST" => 7,
    "WDEN" => 8,
    "WGBR" => 9,
    "WAUT" => 10,
    "WLTU" => 11,
    "WGER" => 12,
    "WLAT" => 13,
    "WBUL" => 14,
    "WFRA" => 15,
    "WPOL" => 16,
    "WUKR" => 17,
    "WCAN" => 18,
    "WAUS" => 19,
    "WIRL" => 20,
    "WNZL" => 21,
    "WUSA" => 22,
    "WHUN" => 23,
    "WJPN" => 24,
    "WITA" => 25,
    "WCHN" => 26,
    "WBRA" => 27,
    "WHKG" => 28,
    "WESP" => 999,
    "WKOR" => 999,
    "MSWE" => 1,
    "MFIN" => 2,
    "MFRA" => 3,
    "MCZE" => 4,
    "MNOR" => 5,
    "MSUI" => 6,
    "MAUT" => 7,
    "MUKR" => 8,
    "MLAT" => 9,
    "MGER" => 10,
    "MBLR" => 11,
    "MRUS" => 12,
    "MDEN" => 13,
    "MLTU" => 14,
    "MAUS" => 15,
    "MPOL" => 16,
    "MGBR" => 17,
    "MEST" => 18,
    "MNZL" => 19,
    "MUSA" => 20,
    "MESP" => 21,
    "MIRL" => 22,
    "MBUL" => 23,
    "MITA" => 24,
    "MSVK" => 25,
    "MHUN" => 26,
    "MISR" => 27,
    "MJPN" => 28,
    "MCAN" => 29,
    "MBEL" => 30,
    "MCHN" => 31,
    "MMDA" => 32,
    "MTUR" => 33,
    "MBRA" => 34,
    "MHKG" => 35,
    "MKOR" => 999
    );
  $results = new DB\SQL\Mapper($this->db, 'result');
  $names = new DB\SQL\Mapper($this->db, 'name');
  $races = new DB\SQL\Mapper($this->db, 'race');

  foreach ($this->xml->ClassResult as $class) {
    $classname = $class->ClassShortName;
    echo "New class: ".$classname."<br>";
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
      $races->type = $this->type.'-'.$classname;
    } else {
      $races->type = $this->type;
    }
    $races->year = $this->wocdata->year;
    $races->class = $correctedclass;
    $races->save();
    echo "Added new race record".$races->id."<br>";
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
      $name = trim(trim($fullname->Given)." ".trim($fullname->Family));
      // WOC 2021 hack for <Given sequence="1">Leake Alice</Given>
      // move everything after last space to front
      // $pos = strrpos($name, chr(32), 0);
      // if ($pos !== false) {
      //   $end = substr($name, $pos + 1);
      //   $start = substr($name, 0, $pos);
      //   $name = $end.' '.$start;
      // }
      
      $names->load(array('name=?',$name));
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
        $country = $personresult->Club->Name;
        // trim '-1' from relay results
        $country = str_replace('-1', '', $country);
        // change Great Britain to GBR
        if (strlen($country) > 3) {
          $country = $this->getCountryCode($country);
        }
       } else {
        $country = "XXX";
      }
      
      $time = $personresult->Result->Time->Clock;
      $pos = $personresult->Result->ResultPosition;
      // WOC 2019 relay hack
      if ($this->type == 'Relay') {
        $pos = $relay2019[substr($classname, 0, 1).$country];
        //echo $pos."<br>";
      }

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
        $percentbehind = number_format(($secsbehind/$winnerseconds) * 100, 1);
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
      $this->type === 'Relay' ? $results->secsdown = 0: $results->secsdown = $secsbehind;
      $this->type === 'Relay' ? $results->percentdown = 0: $results->percentdown = $percentbehind;
      $results->class = $correctedclass;
      //$results->race = $this->type;
      if (($this->type == 'SprintQual') || ($this->type == 'MiddleQual')) {
        $results->race = $this->type.'-'.$classname;
      } else {
        $results->race = $this->type;
      }
      $results->year = $this->wocdata->year;
      $results->raceid = $races->id;
      $results->wocid = $this->wocid;
      $results->final = $this->getFinalType();
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
        if ($personresult->Result->CourseLength) {
          $races->distance = number_format(($personresult->Result->CourseLength)/1000, 1);
        }
        $firstrecord = false;
      }
    }
    // update race record
    $races->save();
  }
}

private function getTimeFromSeconds($secs) {
  return sprintf( "%02.2d:%02.2d", floor( $secs / 60 ), $secs % 60 );;
}

private function getPlainName($name) {
  $plainName = iconv("UTF-8", "ASCII//TRANSLIT", $name);
  $plainName = strtolower($plainName);
  $plainName = str_replace(' ', '', $plainName);
  return $plainName;
}

private function getCountryCode($country) {
  $countrydata = new DB\SQL\Mapper($this->db, 'country');
  $countrydata->load(array('country=?',$country));
  if ($countrydata->loaded() == 1) {
    $code = $countrydata->abbr;
  } else {
    $code = $country;
  }
  return $code;
}

private function getV3Status($status) {
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
  
private function getV2Status($attrs) {
  $status = (string) $attrs["value"];
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
  
private function getFinalType() {
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
    default:
      return 0;
  }

}
  
}