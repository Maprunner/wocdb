<?php

class Race
{

  public function getWOCResults($f3)
  {
    $this->getResults($f3, 'WOC');
  }

  public function getJWOCResults($f3)
  {
    $this->getResults($f3, 'JWOC');
  }

  private function getResults($f3, $type)
  {
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
    $params = array(':year' => $year, ':race' => $race, ':class' => $class, ':max' => $max, ':min' => $min);
    $data = $db->exec('SELECT * FROM result JOIN name ON result.nameid=name.nameid WHERE year=:year AND lower(race)=:race AND lower(class)=:class AND wocid>:min AND wocid<:max ORDER BY position ASC, country ASC', $params);
    echo json_encode($data);
  }
}
