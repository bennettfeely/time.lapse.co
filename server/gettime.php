<?php

	$hostname = 'localhost';
	$dbname = 'goofball_timer';
	$db_user = 'goofball_benny';
	$db_password = 'timelapseco';
	$link = mysql_connect($hostname, $db_user, $db_password);

	$connect = mysql_select_db($dbname, $link) or die(mysql_error());
	$row = mysql_query("SELECT * FROM `hitcounter` ");

	$chnt = mysql_fetch_assoc($row);
	$totaltime = $chnt['hit'];

    echo $totaltime;

?>