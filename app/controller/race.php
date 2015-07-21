<?php

class Race{
  
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
  Woc::getStartPage($f3);
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

}
