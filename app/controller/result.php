<?php

class Result{
  
public function getRunnersByCountry($f3) {
  $runnerdata = $this->getRunners($f3, 'echo');
}

public function getStartPageWithRunnersByCountry($f3) {
  $runnerdata = $this->getRunners($f3, 'return');
  $f3->set('runnerdata', $runnerdata);
  // serve full page
  Woc::getStartPage($f3);
}

public function getBestResults($f3) {
  $runnerdata = $this->getBest($f3, 'echo');
}

public function getStartPageWithBestResults($f3) {
  $bestdata = $this->getBest($f3, 'return');
  $f3->set('bestdata', $bestdata);
  // serve full page
  Woc::getStartPage($f3);
}

private function getBest($f3, $action) {
  $db = $f3->get("db.instance");
  $country = strtoupper($f3->get('PARAMS.country'));
  $type = $f3->get('PARAMS.type');
  if ($type == "woc") {
    $typefilter = "wocid<1000";
    $typefilterw = "w.wocid<1000";
    $typefilterz = "z.wocid<1000";
  } else {
    $typefilter = "wocid>999";
    $typefilterw = "w.wocid>999";
    $typefilterz = "z.wocid>999";
  }
  $class = ucfirst($f3->get('PARAMS.class'));
  $race = $f3->get('PARAMS.race');
  switch ($race) {
    case 'long':
        $racefilter=1;
        break;
    case 'middle':
    case 'short':
        $racefilter=2;
        break;
    case 'sprint':
        $racefilter=3;
        break;
    case 'relay':
        $racefilter=4;
        break;
    case 'sprintrelay':
        $racefilter=5;
        break;
    default:
        $racefilter=1;
        break;
  }
  $type = $f3->get('PARAMS.type');
  if ($country == "ALL") {
    // returns a list of best results by country
    $sql = "SELECT personid, z.year AS year, time, percentdown, z.country AS country, name, position, a.country AS venue FROM ";
    $sql .= "(SELECT r.personid, r.year, r.time, r.percentdown, r.class, r.final, r.wocid, r.country, r.name, r.position FROM result r JOIN "; 
    $sql .= "(SELECT w.country, MIN(w.position) AS minposition FROM result w WHERE w.class=:class";
    $sql .= " AND w.final=:racefilter AND ". $typefilterw . " GROUP BY w.country) AS x ON r.position=minposition AND ";
    $sql .= "r.country=x.country) AS z, woc a WHERE z.wocid=a.id AND z.class=:class2 AND z.final=:racefilter2 AND " . $typefilterz;
    $sql .= " ORDER BY z.country ASC, z.year ASC";
    $params = array(
      ':class'=>$class,
      ':racefilter'=>$racefilter,
      ':class2'=>$class,
      ':racefilter2'=>$racefilter
    );
  } else {
    // returns a list of best results for given country
    $sql = "SELECT personid, percentdown, r.Year as year, r.position as position, name, r.country as country, w.country as venue, time FROM result AS r, woc AS w WHERE (w.id=r.wocid) AND ";
    $sql .= $typefilter ." AND (final=:race) AND (class=:class) AND (r.country=:country)";
    $sql .= " ORDER BY position ASC, year DESC, name ASC";
    
    $params = array(
      ':race'=>$racefilter,
      ':class'=>$class,
      ':country'=>$country
    );
  }
  //echo $sql;
  //print_r($params);
    $data = $db->exec($sql, $params);

  // result returned for inclusion in HTML at start-up
  if ($action == 'return') {
    return json_encode($data);
  }
  // fall through to JSON output
  echo json_encode($data);
}

private function getRunners($f3, $action) {
  $db = $f3->get("db.instance");
  $country = $f3->get('PARAMS.country');
  // returns a list of all runners for a given country
  $type = $f3->get('PARAMS.type');
  if ($type == "name") {
    $group = "nameid";
  } else {
    $group = "personid";
  }
  $sql= 'SELECT nameid, name, personid, country, SUM(CASE WHEN wocid<1000 THEN 1 ELSE 0 END) AS woc, SUM(CASE WHEN wocid>999 THEN 1 ELSE 0 END) AS jwoc FROM ';
  $sql .=  '(SELECT DISTINCT nameid, name, personid, country, wocid FROM result AS a) WHERE country=:country GROUP BY '. $group. ' ORDER BY name ASC';
  $params = array(':country'=>strtoupper($country));
  $data = $db->exec($sql, $params);
  // result returned for inclusion in HTML at start-up
  if ($action == 'return') {
    return json_encode($data);
  }
  // fall through to JSON output
  echo json_encode($data);
}

}
