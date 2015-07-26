<?php

class Name{
  
public function nameSearch($f3) {
  // name search for autocomplete: gets in fragment of name 
  $db = $f3->get("db.instance");
  $name = $f3->get('PARAMS.text');
  $name = str_replace(" ", "", $name);
  $name = '%' . strtolower($name) . '%';
  $nameTable = new DB\SQL\Mapper($db,'name');
  $data = $nameTable->find(array('plainname LIKE ?', $name), array('limit'=>20));
  foreach ($data as &$record) {
    $record = $record->cast();
  }
  echo json_encode($data);
}

}
