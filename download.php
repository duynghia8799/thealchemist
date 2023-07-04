<?php
	$download_file = "files/download/".$_GET['f'];
	$download_file_name = $_GET['f'];
	$handle = fopen($download_file, "r");
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.$download_file_name);
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	header('Pragma: public');
	header('Content-Length: ' . filesize($download_file));
	ob_clean();
	flush();
	readfile($download_file);
	fclose($handle);
	exit;
?>