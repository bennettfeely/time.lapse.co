<?php
	$hostname = 'localhost';
	$dbname = 'goofball_timer';
	$db_user = 'goofball_benny';
	$db_password = 'timelapseco';
	$link = mysql_connect($hostname, $db_user, $db_password);

	$connect = mysql_select_db($dbname, $link) or die(mysql_error());
	$row = mysql_query("SELECT * FROM `hitcounter` ");


	$milli = $_POST["timelapselength"];
	$numrow = mysql_num_rows($row);

	if($numrow > 0){

	$chnt = mysql_fetch_assoc($row);

	$value = $chnt['hit'] + $milli;
	$id = $chnt['id'];
	$sql = mysql_query("UPDATE `hitcounter` SET `hit` = $value WHERE `hitcounter`.`id` = $id");

	} else {

	$sql = mysql_query("INSERT INTO `hitcounter` (`hit`) VALUES ('1000')");

	}
?>