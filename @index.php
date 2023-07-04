<?php

session_start();
$root = dirname($_SERVER['PHP_SELF']);
if ($root == "/")
    $root = "";
// Define root web
defined('BASE_URL') || define('BASE_URL', $root);

//define name LIB
defined('LIB_NAME') || define('LIB_NAME', 'LIB');

//define name LIB
defined('APP_NAME') || define('APP_NAME', 'APP');

if (phpversion() < 5.4) {
    error_reporting(E_ALL ^ E_NOTICE);
} else {
    error_reporting(E_ALL ^ E_NOTICE ^ E_STRICT);
}


// Define path to application directory
defined('APPLICATION_PATH') || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/' . APP_NAME));
// Define application environment
defined('APPLICATION_ENV') || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'cms'));

//Ensure library/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH . '/' . LIB_NAME),
    realpath(APPLICATION_PATH . '/../' . LIB_NAME),
    get_include_path(),
)));

require_once 'Zend/Application.php';

//init aplication
$app = new Zend_Application(APPLICATION_ENV, APPLICATION_PATH . '/configs/application.ini');

//config application
$config = new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', APPLICATION_ENV);

$db = Zend_Db::factory($config->database);
Zend_Db_Table_Abstract::setDefaultAdapter($db);

$app
        ->bootstrap()
        ->run();

// cat' doan. van ban? c1
function limit_text($text, $maxlen) {
    $sentenceSymbol = array(" ", ".", "!", "?");  // diem ket' thuc'
    $text = strip_tags($text, "<br /><br/><br><b><i>"); // nhung tag muon giu lai
    for ($i = $maxlen; $i > 0; $i--) {
        $ch = substr($text, $i, 1);
        if (in_array($ch, $sentenceSymbol)) {
            $pos = $i;
            $i = 0;
        }
    }
    $temp = substr($text, 0, $pos + 1);
    return $temp;
}

// cat' doan. van ban? c2
function get_quote($str, $limit, $more = " ...") {
    if ($str == "" || $str == NULL || is_array($str) || strlen($str) == 0)
        return $str;
    $str = trim($str);

    if (strlen($str) <= $limit)
        return $str;
    $str = substr($str, 0, $limit);
    if (!substr_count($str, " ")) {
        if ($more)
            $str .= " ...";
        return $str;
    }
    while (strlen($str) && ($str[strlen($str) - 1] != " ")) {
        $str = substr($str, 0, -1);
    }
    $str = substr($str, 0, -1);
    if ($more)
        $str .= " ...";
    return $str;
}

function createThumbs($pathToImages, $pathToThumbs, $thumbWidth) { // TAO. THUMB ANH?
    // open the directory
    $dir = opendir($pathToImages);

    // loop through it, looking for any/all JPG files:
    while (false !== ($fname = readdir($dir))) {
        // parse path for the extension
        $info = pathinfo($pathToImages . $fname);
        // continue only if this is a JPEG image
        if (strtolower($info['extension']) == 'jpg') {
            // load image and get image size
            $img = imagecreatefromjpeg("{$pathToImages}{$fname}");
            $width = imagesx($img);
            $height = imagesy($img);

            // calculate thumbnail size
            $new_width = $thumbWidth;
            $new_height = floor($height * ( $thumbWidth / $width ));

            // create a new tempopary image
            $tmp_img = imagecreatetruecolor($new_width, $new_height);

            // copy and resize old image into new image
            imagecopyresized($tmp_img, $img, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

            // save thumbnail into a file
            imagejpeg($tmp_img, "{$pathToThumbs}{$fname}");
        }
    }
    // close the directory
    closedir($dir);
}

function smartTime($time, $father = 30, $format = 'd/m/Y') {
    if ($time === null) {
        return '';
    }

    if (!is_numeric($time))
        $time = strtotime($time);

    $diff = time() - $time;

    if ($diff > $father * 24 * 3600)
        return date($format, $time);

    if ($diff < 0) {
        return date($format, $time);
    } else if ($diff == 0) {
        return "vừa mới";
    } else if ($diff < 60) {
        return (floor($diff) . ' giây trước');
    } else if ($diff < 60 * 60) {
        return (floor($diff / 60) . ' phút trước');
    } else if ($diff < 60 * 60 * 24) {
        return (floor($diff / (60 * 60)) . ' giờ trước');
    } else if ($diff < 60 * 60 * 24 * 30) {
        $num_day = $diff / (60 * 60 * 24);
        if ($num_day < 2 && $num_day >= 1)
            return 'Hôm qua';
        if ($num_day >= 2 && $num_day < 3)
            return 'Hôm trước';
        return floor($num_day) . ' ngày trước';
    } else if ($diff < 60 * 60 * 24 * 30 * 12) {
        return (floor($diff / (60 * 60 * 24 * 30)) . ' tháng trước');
    } else {
        return (floor($diff / (60 * 60 * 24 * 30 * 12)) . ' năm trước');
    }

    return date($format, $time);
}

function isMobile() {
    return preg_match("/(android|webos|avantgo|iphone|ipad|ipod|blackberry|iemobile|bolt|boost|cricket|docomo|fone|hiptop|mini|opera mini|kitkat|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

function debug() {
    $s = '';
    $args = func_get_args();
    foreach ($args as $a) {
        $text = print_r($a, true);
        if (preg_match("/^@(.*)/is", $text, $m)) {
            $text = $m[1];
        }

        $s .= "<pre>" . $text . "</pre>";
    }

    $logs = debug_backtrace();
    $log = array_shift($logs);
    if ($log) {
        $s = "<h6 style='background:#f7f8f9;boder:1px solid #ccc;padding:5px'>Debug at line <b>{$log['line']}</b>, in file <b>{$log['file']}</b></h6>" . $s;
    }

    die($s);
    exit;
}

function _e($message = '', $begin = '', $end = '') {
    if ($message !== NULL) {
        echo $begin . $message . $end;
    }
}

function getYoutubeId($url) {
    $pattern = '%^# Match any youtube URL
			(?:https?://)?  # Optional scheme. Either http or https
			(?:www\.)?      # Optional www subdomain
			(?:             # Group host alternatives
			  youtu\.be/    # Either youtu.be,
			| youtube\.com  # or youtube.com
			  (?:           # Group path alternatives
				/embed/     # Either /embed/
			  | /v/         # or /v/
			  | /watch\?v=  # or /watch\?v=
			  )             # End path alternatives.
			)               # End host alternatives.
			([\w-]{10,12})  # Allow 10-12 for 11 char youtube id.
			$%x';

    $result = preg_match($pattern, $url, $matches);
    if (false !== $result) {
        return $matches[1];
    }
    return false;
}

function customer() {
    return $_SESSION['cp__customer'];
}
