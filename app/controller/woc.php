<?php

class Woc {
  
public function __construct() {

}

public function getStartPage($f3) {
  // main entry point to load complete application: after this it's just AJAX and JSON
  // set up various things that wll get written into the initial HTML
  // add <base > to HTML to avoid relative addressing problems in deep urls
  $base = 'http://'.$_SERVER['SERVER_NAME'].'/wocdb/';
  // horrid hack to get over domain set-up
  $base = str_replace("//maprunner", "//www.maprunner", $base);
  $f3->set('base', $base);
  // preload list of WOCS: always needed
  $wocdata = $this->getWOCS($f3);
  $f3->set('wocs', $wocdata);
  // serve full page
  $f3->set('content','app/template/wocdb.htm');
  echo Template::instance()->render('/app/template/page.htm');
}

public function getStartPageWithJWOCRace($f3) {
  $this->getStartPageWithRace($f3, 'JWOC');
}

public function getStartPageWithWOCRace($f3) {
  $this->getStartPageWithRace($f3, 'WOC');
}

private function getStartPageWithRace($f3, $type) {
  $racedata = $this->getRace($f3, $type, 'return');
  $f3->set('racedata', $racedata);
  // serve full page
  $this->getStartPage($f3);
}

public function getWOCRace($f3) {
  $this->getRace($f3, 'WOC', 'echo');
}

public function getJWOCRace($f3) {
  $this->getRace($f3, 'JWOC', 'echo');
}

private function getRace($f3, $type, $action) {
  if ($type == "WOC") {
    $max = 1000;
    $min = 0;
  } else {
    $max = 9999;
    $min = 999;
  }
  $year = $f3->get('PARAMS.year');
  $class = $f3->get('PARAMS.class');
  $race = $f3->get('PARAMS.race');
  $db = $f3->get("db.instance");
  // need to be able to specify lower(x) to match url parameters to column names so use exec rather than a built-in function
  $params = array(':year'=>$year, ':race'=>$race, ':class'=>$class, ':max'=>$max, ':min'=>$min);
  $data=$db->exec('SELECT * FROM result WHERE year=:year AND lower(race)=:race AND lower(class)=:class AND wocid>:min AND wocid<:max ORDER BY position ASC, country ASC', $params);
  // result returned for inclusion in HTML at start-up
  if ($action == 'return') {
    return json_encode($data);
  }
  // fall through to JSON output
  echo json_encode($data);
}

private function getWOCs($f3) {
  $db = $f3->get("db.instance");
  $wocTable = new DB\SQL\Mapper($db,'woc');
  $raceTable = new DB\SQL\Mapper($db,'race');
  // dummy virtual fields that get filled in later
  $wocTable->races = 1;
  $wocTable->raceids = 1;
  $wocTable->classes = 1;
  $data = $wocTable->find(array(), array('order'=>'year DESC, type DESC'));
  foreach ($data as &$record) {
    $races = $raceTable->find(array("wocid=?", $record->id), array('order'=>'class ASC, type ASC'));
    $raceids = array();
    $racetypes = array();
    $raceclasses = array();
    foreach ($races as $race) {
      $raceids[] = $race->id;
      $racetypes[] = $race->type;
      $raceclasses[] = $race->class;
    }
    $record->races = implode(",", $racetypes);
    $record->classes = implode(",", $raceclasses);
    $record->raceids = implode(",", $raceids);
    $record = $record->cast();
  }
  return json_encode($data);
}

}