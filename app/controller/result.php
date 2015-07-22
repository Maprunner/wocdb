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

private function getRunners($f3, $action) {
  $country = $f3->get('PARAMS.country');
  $db = $f3->get("db.instance");
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
