<?php

class Woc {

public static function getStartPage($f3) {
  // main entry point to load complete application: after this it's just AJAX and JSON
  // set up various things that wll get written into the initial HTML
  // add <base > to HTML to avoid relative addressing problems in deep urls
  if (strpos($_SERVER['SERVER_NAME'], 'localhost') !== FALSE) {
    $base = 'http://'.$_SERVER['SERVER_NAME'].'/wocdb/';
  } else {
    $base = 'https://'.$_SERVER['SERVER_NAME'].'/wocdb/';
  }
  // horrid hack to get over domain set-up
  $base = str_replace("//maprunner", "//www.maprunner", $base);
  $f3->set('base', $base);
  // preload list of WOCS: always needed
  $wocdata = self::getWOCS($f3);
  $f3->set('wocs', $wocdata);
  $f3->set('countries', self::getCountries($f3));
  // serve full page
  $f3->set('content','app/template/wocdb.htm');
  echo Template::instance()->render('/app/template/page.htm');
}

private static function getWOCs($f3) {
  $db = $f3->get("db.instance");
  $wocTable = new DB\SQL\Mapper($db,'woc');
  $raceTable = new DB\SQL\Mapper($db,'race');
  // dummy virtual fields that get filled in later
  $wocTable->races = 1;
  $wocTable->raceids = 1;
  $wocTable->classes = 1;
  $wocTable->links = 1;
  $data = $wocTable->find(array(), array('order'=>'year DESC, type DESC'));
  foreach ($data as &$record) {
    $races = $raceTable->find(array("wocid=?", $record->id), array('order'=>'class ASC, type ASC'));
    $raceids = array();
    $racetypes = array();
    $raceclasses = array();
    $racelinks = array();
    foreach ($races as $race) {
      $raceids[] = $race->id;
      $racetypes[] = $race->type;
      $raceclasses[] = $race->class;
      if ($race->link) {
        $racelinks[] = $race->link;
      } else {
        $racelinks[] = "";
      }
    }
    $record = $record->cast();
    $record["races"] = implode(",", $racetypes);
    $record["classes"] = implode(",", $raceclasses);
    $record["raceids"] = implode(",", $raceids);
    $record["links"] = implode(",", $racelinks);
  }
  return json_encode($data);
}

private static function getCountries($f3) {
  $db = $f3->get("db.instance");
  $resultTable = new DB\SQL\Mapper($db,'country');
  // exclude countries with no results
  $data=$db->exec('SELECT country, code, abbr FROM (select distinct country as d from result) as r JOIN country as c ON c.abbr = r.d ORDER BY abbr ASC');
  return json_encode($data);
}

}