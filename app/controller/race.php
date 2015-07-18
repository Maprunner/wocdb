<?php

class Race{
  
public function getRaceResult($f3, $params) {

  $db = $f3->get("db.instance");
  $raceid=intval($f3->get('PARAMS.raceid'));
  $resultTable = new DB\SQL\Mapper($db,'result');
  $data = $resultTable->find(array("raceid=?", $raceid), array('order'=>'position ASC, country ASC'));
  foreach ($data as &$record) {
    $record = $record->cast();
  }
  echo json_encode($data);
}

}
