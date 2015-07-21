<?php

class Person{
  
public function getResultsByPerson($f3) {
  $this->getResults($f3, 'echo');
}

public function getStartPageWithResultsByPerson($f3) {
  $persondata = $this->getResults($f3, 'return');
  $f3->set('persondata', $persondata);
  // serve full page
  Woc::getStartPage($f3);
}

private function getResults($f3, $action) {
  $db = $f3->get("db.instance");
  $person = $f3->get('PARAMS.person');
  $resultTable = new DB\SQL\Mapper($db,'result');
  if (is_numeric($person)) {
    $condition = array("personid=?", $person);
  } else {
    $condition = array("plainname=?", $person);
  }
  $data = $resultTable->find($condition, array('order'=>'year DESC, final ASC'));
  foreach ($data as &$record) {
    $record = $record->cast();
  }
  // result returned for inclusion in HTML at start-up
  if ($action == 'return') {
    return json_encode($data);
  }
  // fall through to JSON output
  echo json_encode($data);
}

}
