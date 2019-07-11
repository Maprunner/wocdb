<?php
$f3 = require('./lib/f3/base.php');

$s = $f3->get('SERVER');
if (strpos($s['SERVER_NAME'], 'localhost') !== FALSE) {
  $f3->set('DEBUG', 3);
  $f3->set('minified', false);
} else {
  $f3->set('minified', true);
  $f3->set('DEBUG', 0);
}
$f3->set('minFileModTime', filemtime(dirname(__FILE__).'/js/wocdb.min.js'));
$f3->set('cssFileModTime', filemtime(dirname(__FILE__).'/css/wocdb.css'));
$f3->config('wocdb.ini');
$f3->config('wocdb-routes.ini');

$db = new DB\SQL($f3->get('db.type').':'.$f3->get('db.file'));
$f3->set("db.instance", $db);

$f3->run();
echo $db->log();