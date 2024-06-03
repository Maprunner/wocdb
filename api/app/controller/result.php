<?php

class Result
{

  public function import($f3)
  {
    $imp = new Import($f3);
    $imp->importEvents($f3);
  }

  public function getBestResults($f3)
  {
    $db = $f3->get("db.instance");
    $country = strtoupper($f3->get('PARAMS.country'));
    $type = $f3->get('PARAMS.type');
    if ($type == "woc") {
      $typefilter = "r.wocid<1000";
      $typefilterw = "w.wocid<1000";
      $typefilterz = "z.wocid<1000";
    } else {
      $typefilter = "r.wocid>999";
      $typefilterw = "w.wocid>999";
      $typefilterz = "z.wocid>999";
    }
    $class = ucfirst($f3->get('PARAMS.class'));
    $race = $f3->get('PARAMS.race');
    switch ($race) {
      case 'long':
        $racefilter = 1;
        break;
      case 'middle':
      case 'short':
        $racefilter = 2;
        break;
      case 'sprint':
        $racefilter = 3;
        break;
      case 'relay':
        $racefilter = 4;
        break;
      case 'sprintrelay':
        $racefilter = 5;
        break;
      case 'kosprint':
        $racefilter = 6;
        break;
      default:
        $racefilter = 1;
        break;
    }
    $type = $f3->get('PARAMS.type');
    if ($country == "ALL") {
      // returns a list of best results by country
      $sql = "SELECT z.personid, z.year, z.time, seconds, percentdown, z.country, z.name, n.plainname, position, z.final, z.class, a.country as venue, a.type, e.type as race FROM ";
      $sql .= "((SELECT r.personid, r.nameid, r.year, r.time, r.seconds, r.percentdown, r.class, r.final, r.wocid, r.raceid, r.country, r.name, r.position FROM result r JOIN ";
      $sql .= "(SELECT w.country, MIN(w.position) AS minposition FROM result w WHERE w.class=:class";
      $sql .= " AND w.final=:racefilter AND " . $typefilterw . " GROUP BY w.country) AS x ON r.position=minposition AND ";
      $sql .= "r.country=x.country) AS z) JOIN name AS n ON z.nameid=n.nameid JOIN woc AS a JOIN race as e ON e.id=z.raceid WHERE z.wocid=a.id AND z.class=:class2 AND z.final=:racefilter2 AND " . $typefilterz;
      $sql .= " ORDER BY z.country ASC, z.year ASC";
      $params = array(
        ':class' => $class,
        ':racefilter' => $racefilter,
        ':class2' => $class,
        ':racefilter2' => $racefilter
      );
    } else {
      // returns a list of best results for given country
      $sql = "SELECT n.personid, n.plainname, percentdown, r.year, r.position, r.name, e.final, r.class, r.country, w.country as venue, w.type, e.type as race, r.time, seconds ";
      $sql .= "FROM result AS r JOIN name AS n ON r.nameid=n.nameid JOIN woc AS w JOIN race AS e ON e.id=r.raceid WHERE (w.id=r.wocid) AND ";
      $sql .= $typefilter . " AND (e.final=:race) AND (r.class=:class) AND (r.country=:country)";
      $sql .= " ORDER BY r.position ASC, r.year DESC, r.name ASC";

      $params = array(
        ':race' => $racefilter,
        ':class' => $class,
        ':country' => $country
      );
    }
    // echo $sql;
    //print_r($params);
    $data = $db->exec($sql, $params);

    echo json_encode($data);
  }

  public function getMedalData($f3)
  {
    $db = $f3->get("db.instance");
    $group = $f3->get('PARAMS.group');
    $type = $f3->get('PARAMS.type');
    if ($type == "woc") {
      $typefilter = " wocid<1000 ";
    } else if ($type == "jwoc") {
      $typefilter = " wocid>999 ";
    } else {
      $typefilter = " wocid>0 ";
    }
    $class = ucfirst($f3->get('PARAMS.class'));
    switch ($class) {
      case 'All':
        $classfilter = "";
        break;
      case 'Men':
        $classfilter = " AND class='Men'";
        break;
      case 'Women':
        $classfilter = " AND class='Women'";
        break;
      default:
        $classfilter = " AND class='Mixed'";
        break;
    }

    $race = $f3->get('PARAMS.race');
    switch ($race) {
      case 'long':
        $racefilter = " AND final=1 ";
        break;
      case 'middle':
        $racefilter = " AND final=2 ";
        break;
      case 'sprint':
        $racefilter = " AND final=3 ";
        break;
      case 'relay':
        $racefilter = " AND final=4 ";
        break;
      case 'sprintrelay':
        $racefilter = " AND final=5 ";
        break;
      case 'kosprint':
        $racefilter = " AND final=6 ";
        break;
      default:
        $racefilter = " AND final>0 ";
        break;
    }

    if ($group == "country") {
      // wow this is fun:  need to avoid multiple counting relays so you select one of each relay result UNION all individual results
      // and use that to extract results
      $sql = "SELECT country, MAX(w.year) AS toYear, MIN(w.year) as fromYear, SUM(CASE WHEN position=1 THEN 1 ELSE 0 END) AS G,";
      $sql .= "SUM(CASE WHEN position=2 THEN 1 ELSE 0 END) AS S, SUM(CASE WHEN position=3 THEN 1 ELSE 0 END) AS B,";
      $sql .= "SUM(CASE WHEN (position=1) OR (position=2) OR (position = 3) THEN 1 ELSE 0 END) AS total FROM result as w ";
      $sql .= "JOIN (SELECT id FROM result AS a WHERE position=1 AND (final=4 OR final=5) GROUP BY raceid ";
      $sql .= "UNION SELECT id FROM result AS b WHERE position=2 AND (final=4 OR final=5) GROUP BY raceid UNION ";
      $sql .= "SELECT id FROM result AS c WHERE position=3 AND (final=4 OR final=5) GROUP BY raceid UNION ";
      $sql .= "SELECT id FROM result AS d WHERE (position<4) AND (final<4 AND final>0)) AS x ON (w.id = x.id) WHERE ";
      $sql .= $typefilter . $racefilter . $classfilter;
      $sql .= " AND (position<4) GROUP BY country";
      $params = array();
    } else if ($group == "person") {
      // returns a list of all individual medal totals
      $sql = "SELECT r.personid as personid, r.name as name, name.plainname as plainname, country, MAX(r.year) AS toYear, MIN(r.year) as fromYear, ";
      $sql .= "SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) AS G,";
      $sql .= "SUM(CASE WHEN position = 2 THEN 1 ELSE 0 END) AS S, SUM(CASE WHEN position = 3 THEN 1 ELSE 0 END) AS B, ";
      $sql .= "SUM(CASE WHEN position<4 THEN 1 ELSE 0 END) AS total FROM result as r JOIN name ON name.nameid=r.nameid WHERE ";
      $sql .= $typefilter . $racefilter . $classfilter;
      $sql .= " AND (position < 4) GROUP BY r.personid";
      $params = array();
    } else {
      // returns a list of all medallists for a given country
      $sql = "SELECT r.id as id, r.name as name, plainname, r.country, time, position, r.year, wocid, race, raceid, class, final, w.country as venue, w.type from result r ";
      $sql .= "JOIN name n ON (n.nameid=r.nameid) JOIN woc w ON (r.wocid=w.id) WHERE " . $typefilter . $racefilter . $classfilter . " AND (position < 4) AND ";
      $sql .= "(r.country='" . strtoupper(substr($group, 0, 3)) . "') ORDER BY position ASC, r.year DESC, raceid ASC";
      $params = array();
    }

    //echo $sql;
    //print_r($params);
    $data = $db->exec($sql, $params);

    echo json_encode($data);
  }

  public function getRunnersByCountry($f3)
  {
    $db = $f3->get("db.instance");
    $country = $f3->get('PARAMS.country');
    // returns a list of all runners for a given country
    $type = $f3->get('PARAMS.type');
    if ($type == "name") {
      $group = "nameid";
    } else {
      $group = "personid";
    }

    $sql = 'SELECT nameid, name, plainname, personid, country, SUM(wocraces) AS wocraces, SUM(jwocraces) AS jwocraces, SUM(CASE WHEN wocid<1000 THEN 1 ELSE 0 END) AS woc, ';
    $sql .=  'SUM(CASE WHEN wocid>999 THEN 1 ELSE 0 END) AS jwoc FROM (SELECT a.nameid as nameid, a.name as name, plainname, a.personid as personid, country, wocid,';
    $sql .= 'CASE WHEN wocid<1000 THEN COUNT(raceid) ELSE 0 END as wocraces, CASE WHEN wocid>999 THEN COUNT(raceid) ELSE 0 END as jwocraces';
    $sql .= ' FROM result AS a JOIN name ON a.nameid=name.nameid WHERE country=:country GROUP BY wocid, a.' . $group . ') GROUP BY ' . $group . ' ORDER BY name ASC';

    $params = array(':country' => strtoupper($country));

    $data = $db->exec($sql, $params);

    echo json_encode($data);
  }


  public function getTopThree($f3)
  {
    $db = $f3->get("db.instance");
    $wocid = $f3->get('PARAMS.wocid');
    $sql = "SELECT raceid, class, race, final, position, name, country, time from result where wocid=:wocid and position<4 and final>0";
    $params = array(':wocid' => $wocid);

    //echo $sql;
    //print_r($params);
    $data = $db->exec($sql, $params);

    echo json_encode($data);
  }
}
