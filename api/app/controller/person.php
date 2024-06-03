<?php

class Person
{

  public function getResultsByPerson($f3)
  {
    $db = $f3->get("db.instance");
    $person = $f3->get('PARAMS.person');
    $resultTable = new DB\SQL\Mapper($db, 'result');
    $nameTable = new DB\SQL\Mapper($db, 'name');
    $wocTable = new DB\SQL\Mapper($db, 'woc');
    $data = $nameTable->find(array("plainname=?", $person));
    if (count($data) > 0) {
      $personid = $data[0]->personid;
    } else {
      $personid = 0;
    }
    $condition = array("personid=?", $personid);

    $data = $resultTable->find($condition, array('order' => 'year DESC, final ASC'));
    foreach ($data as &$record) {
      $woc = $wocTable->load(array("id=?", $record->wocid));
      $record = $record->cast();
      $record["venue"] = $woc->country;
      $record["type"] = $woc->type;
    }
    echo json_encode($data);
  }

  public function getFightResults($f3)
  {
    $db = $f3->get("db.instance");
    $name1 = $f3->get('PARAMS.name1');
    $name2 = $f3->get('PARAMS.name2');
    $nameTable = new DB\SQL\Mapper($db, 'name');
    $person1 = $nameTable->find(array("plainname=?", $name1));
    if (count($person1) > 0) {
      $personid1 = $person1[0]->personid;
    } else {
      $personid1 = 0;
    }
    $person2 = $nameTable->find(array("plainname=?", $name2));
    if (count($person2) > 0) {
      $personid2 = $person2[0]->personid;
    } else {
      $personid2 = 0;
    }
    $sql = "SELECT * FROM (SELECT a.raceid as raceid, a.name as name1, b.name as name2, a.class as class, a.race as race, a.year as year, a.country as country1, b.country as country2, ";
    $sql .= "a.time as time1, b.time as time2, a.position as position1, b.position as position2, a.wocid as wocid, a.final as final FROM (SELECT * FROM result WHERE result.personid=:p1) ";
    $sql .= "AS a JOIN (SELECT * FROM result WHERE personid=:p2) AS b WHERE a.raceid=b.raceid) AS x JOIN woc as w WHERE x.wocid=w.id ORDER BY w.id DESC, x.raceid ASC";
    $data = $db->exec($sql, array(':p1' => $personid1, ':p2' => $personid2));

    echo json_encode($data);
  }
}
