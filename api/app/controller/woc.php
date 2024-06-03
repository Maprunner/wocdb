<?php

class Woc
{
  public static function getWOCs($f3)
  {
    $db = $f3->get("db.instance");
    $wocTable = new DB\SQL\Mapper($db, 'woc');
    $raceTable = new DB\SQL\Mapper($db, 'race');
    // dummy virtual fields that get filled in later
    $wocTable->races = 1;
    $wocTable->raceids = 1;
    $wocTable->classes = 1;
    $wocTable->links = 1;
    $wocTable->finals = 1;
    $data = $wocTable->find(array(), array('order' => 'year DESC, type DESC'));
    foreach ($data as &$record) {
      $races = $raceTable->find(array("wocid=?", $record->id), array('order' => 'class ASC, type ASC'));
      $raceids = array();
      $racetypes = array();
      $raceclasses = array();
      $racelinks = array();
      $finals = array();
      foreach ($races as $race) {
        $raceids[] = $race->id;
        $racetypes[] = $race->type;
        $raceclasses[] = $race->class;
        if ($race->link) {
          $racelinks[] = $race->link;
        } else {
          $racelinks[] = "";
        }
        $finals[] = $race->final;
      }
      $record = $record->cast();
      $record["races"] = implode(",", $racetypes);
      $record["classes"] = implode(",", $raceclasses);
      $record["raceids"] = implode(",", $raceids);
      $record["links"] = implode(",", $racelinks);
      $record["finals"] = implode(",", $finals);
    }
    echo json_encode($data);
  }

  public static function getCountries($f3)
  {
    $db = $f3->get("db.instance");
    // return list of countries that have got results
    $sql = "SELECT * from country where country.abbr in (select distinct country from result) ORDER BY country.abbr ASC";
    $data = $db->exec($sql, array());
    echo json_encode($data);
  }

  public static function reportError($f3)
  {
    // empty array is safest since it will just render empty tables
    $data = array();
    echo json_encode($data);
  }
}
