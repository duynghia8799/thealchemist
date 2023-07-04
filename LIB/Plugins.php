<?php

/*
  (C) Copyright DOSVN.COM - 2010
  This Plugins had been written by DucMinh
  Last update: 28/04/2010
 */

class Plugins {

    function __contruct() {

    }

    /* ----------------------------------------------------------------------------------------------- *\
      + Manager & upload file folder
      + List functions:
      -getSizeFolder
      -getMaxSizeFileUpload
      -upload
      -uploadImage
      -makedir
      \* ------------------------------------------------------------------------------------------------- */

    /* Manager for folder */

    public function getSizeFolder($d) {
        clearstatcache();
        $h = @opendir($d);
        if (!$h)
            return 0;

        while ($f = readdir($h)) {
            if ($f != ".." && $f != ".") {
                $sf += filesize($nd = $d . "/" . $f);
                if (is_dir($nd)) {
                    $sf += self::getSizeFolder($nd);
                }
            }
        }
        closedir($h);
        return $sf;
    }

    /* get max size file upload */

    public function getMaxSizeFileUpload() {
        $max_upload = (int) (ini_get('upload_max_filesize'));
        $max_post = (int) (ini_get('post_max_size'));
        $memory_limit = (int) (ini_get('memory_limit'));
        return min($max_upload, $max_post, $memory_limit);
    }

    /*
     * 		0: Invalid file type
     * 		1: Exceed size
     *  	-1: Unable to upload file
     * 		2: Not a file
     * 	  $config is a array contains properties:
      {
      oldfile =>
      unique	 => true|false
      maxsize => value in KB
      types	=> list mime type of permited file
      }
     */

    public function upload($path, $file, $config = array()) {
        if (!isset($file['tmp_name'])) {
            return 2;
        }

        //list is MIME TYPE
        $file_types = !isset($config['types']) ? array() : $config['types'];

        if (is_file($file['tmp_name'])) {
            $filetype = $file['type'];
            $filesize = $file['size'];
            $filename = $file['name'];

            //Check max size
            if (isset($config["maxsize"])
                    AND is_numeric($config["maxsize"])
                    AND $new_file['size'] > min($config["maxsize"], $this->getMaxSizeFileUpload())) {
                return 1;
            }

            //always denied .exe
            //if( strtolower($filetype) == "application/octet-stream" ){
            //return -2;
            //}
            //check file type
            if (count($file_types) > 0)
                if (!in_array(strtolower($filetype), $file_types)) {
                    return 0;
                }

            //oldfile
            if (!isset($config["oldfile"]) || ($config["oldfile"] === "")) {
                $unique = (!isset($config["unique"]) OR $config["unique"] === true ) ?
                        dechex(time()) . "_" : "";
                $name = $unique . $filename;
            } else {
                $name = $config["oldfile"];
            }

            $uploaded_file_full_path = str_replace("//", "/", "$path/$name");

            if (@move_uploaded_file($file['tmp_name'], $uploaded_file_full_path)) {
                //@chmod($uploaded_file_full_path, 0777);
                return $name;
            } else {
                return -1;
            }
        } else {
            //not file
            return 2;
        }
    }

    /*
     * 		upload only image file
     * 		0: Invalid file type
     * 		1: Exceed size
     *  	-1: Unable to upload file
     * 		2: Not a file
     * 	  $config is a array contains properties:
      {
      oldfile =>
      unique	 => true|false
      maxsize => value in KB
      }
     */

    public function uploadImage($path, $file, $config = array()) {
        if (!isset($file['tmp_name'])) {
            return 2;
        }
        $config['cmod'] = '0777';
        $file_types = array(
            "image/jpeg",
            "image/jpg",
            "image/gif",
            "image/png",
            "image/pjpeg",
            "image/x-png",
            "image/bmp");

        if (is_file($file['tmp_name'])) {
            $ext = $file['extension'];
            $filetype = $file['type'];
            $filesize = $file['size'];
            $filename = $file['name'];

            //Check max size
            if (isset($config["maxsize"]) OR!is_numeric($config["maxsize"])) {
                $config["maxsize"] = 0;
            }

            if ($new_file['size'] > min($config["maxsize"], $this->getMaxSizeFileUpload())) {
                return 1;
            }

            //check file type
            if (!in_array(strtolower($filetype), $file_types)) {
                return 0;
            }

            //oldfile
            if (!isset($config["oldfile"]) || ($config["oldfile"] === "")) {
                $unique = (!isset($config["unique"]) OR $config["unique"] === true ) ?
                        dechex(time()) . "_" : "";
                $name = $unique . $this->createAlias($filename);
            } else {
                $name = $config["oldfile"];
            }

            $uploaded_file_full_path = str_replace("//", "/", "$path/$name");
            //die($uploaded_file_full_path);
            if (@move_uploaded_file($file['tmp_name'], $uploaded_file_full_path)) {
                //@chmod($uploaded_file_full_path, isset( $config["chmod"] ) ? $config["chmod"] : '0777');
                if (isset($config['resize'])) {
                    require_once 'Thumb/ThumbLib.inc.php';
                    $thumb = PhpThumbFactory::create($uploaded_file_full_path);
                    $thumb->resize($config['resize'][0], $config['resize'][1]);
                    $thumb->save($uploaded_file_full_path, "png");
                }
                return $name;
            } else {
                return -1;
            }
        } else {
            //not file
            return 2;
        }
    }

    public function fileSize($size) {
        $filesizename = array(" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB");
        return $size ? round($size / pow(1024, ($i = floor(log($size, 1024)))), 2) . $filesizename[$i] : '0 Bytes';
    }

    //make sort
    public function makedir($dir, $cmod = "0777") {
        @mkdir($dir, $cmod);
    }

    /* ----------------------------------------------------------------------------------------------- *\
      + Work with email
      + List functions:
      -isEmail
      -sendMail
      \* ------------------------------------------------------------------------------------------------- */

    public function isEmail($string) {
        if ($string) {
            $atom = '[-a-z0-9!#$%&\'*+/=?^_`{|}~]';
            $domain = '([a-z]([-a-z0-9]*[a-z0-9]+)?)';
            $regex = '^' . $atom . '+' . '(\.' . $atom . '+)*' . '@' . '(' . $domain . '{1,63}\.)+' . $domain . '{2,63}' . '$';
            if (strlen($string) == 0) {
                return false;
            } else {
                if (eregi($regex, $string)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    public function sendMail($config) {
        $default = array(
            'from' => '',
            'to' => '',
            'subject' => '',
            'content' => '',
            'charset' => 'utf-8',
            'type' => 'text/html',
        );

        foreach ($config as $key => $value) {
            $default[$key] = $value;
        }

        //auto break line & finish dot

        $to = $default['to'];
        $from = $default['from'];
        $type = $default['type'];
        $charset = $default['charset'];
        $path = $default['path'];
        $content = $default['content'];
        $subject = $default['subject'];

        $headers = "MIME-Version: 1.0 \r\n";
        $header .= "Content-Type: $type; charset=$charset\r\n";
        $header .= "From: $from\r\n";
        $header .= "Reply-To: $to\r\n";
        $header .= "Subject: $subject\r\n";
        if (isset($config['cc'])) {
            $headers .= 'Cc: ' . $config['cc'] . ' \r\n';
        }
        if (isset($config['cc'])) {
            $headers .= 'Bcc: ' . $config['bb'] . '\r\n';
        }
        return @mail($to, $subject, $content, $headers) ? true : false;
    }

    /* ----------------------------------------------------------------------------------------------- *\
      + Date & Time
      \* ------------------------------------------------------------------------------------------------- */

    public function time() {
        date_default_timezone_set("Asia/Ho_Chi_Minh");
        return time();
    }

    public function date($str, $time) {
        date_default_timezone_set("Asia/Ho_Chi_Minh");
        return date($str, $time);
    }

    public function strtotime($str) {
        date_default_timezone_set("Asia/Ho_Chi_Minh");
        return strtotime($str);
    }

    /*
      get & convert request
     */

    public function format($data) {
        $data = str_ireplace('"', "&quot;", $data);
        $data = str_ireplace("'", "&#039;", $data);
        $data = str_ireplace('<', '&lt;', $data);
        $data = str_ireplace('>', '&gt;', $data);
        return $data;
    }

    public function get($name, $default = "", $format = true) {
        $value = isset($_REQUEST[$name]) ? $_REQUEST[$name] : $default;
        if (get_magic_quotes_gpc()) {
            return $format ? $this->format(stripslashes($value)) : $value;
        } else {
            return $format ? $this->format(addslashes($value)) : addslashes($value);
        }
    }

    public function parseInt() {
        $arg = func_get_args();
        foreach ($arg as $a) {
            if (is_numeric($a))
                return $a;
        }
        return is_numeric(func_get_arg(0)) ? func_get_arg(0) : 0;
    }

    public function getNum($name, $default = 0, $convert = false) {
        $value = $this->get($name, $default);
        if ($convert) {
            if (preg_match('/^(\d+)/', $value, $array)) {
                $value = $array[1];
            }
        }
        return $this->toNum($value, $default);
    }

    public function getEditor($name, $default = "") {
        $value = isset($_REQUEST[$name]) ? $_REQUEST[$name] : $default;
        if (get_magic_quotes_gpc()) {
            return stripslashes($value);
        } else {
            return $value;
        }
    }

    public function getArray($name, $default = "", $format = true) {
        $values = isset($_REQUEST[$name]) ? $_REQUEST[$name] : array();
        $result = array();
        foreach ($values as $value) {
            if (get_magic_quotes_gpc()) {
                $result[] = $format ? $this->format(stripslashes($value)) : stripslashes($value);
            } else {
                $result[] = $format ? $this->format($value) : $value;
            }
        }
        return implode(",", $result);
    }

    public function isPost() {
        return $_SERVER["REQUEST_METHOD"] == "POST";
    }

    public function isAjax() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }

    /*
      @Some function for manager list catelogy unique
      @These function order a array result from mySQL
      @
      @
     */

    public function toArrayMySQL($items) {
        $result = array();
        foreach ($items as $item) {
            $result[$item['ID']] = $item;
        }
        return $result;
    }

    public function cloneArray($a1) {
        return array_merge($a1, array());
    }

    public function orderArrays($items) {
        $_ALL = $this->toArrayMySQL($items);
        if (!function_exists("get_by_ord")) {

            function get_by_ord($items, $parent = 0, $ord = 0) {
                $result = array();
                foreach ($items as $k => $item) {
                    //treat a parent_id equal 0 if column doesn't exists
                    $curent_parent = (( $item["parent_id"] === "" ) OR!isset($_ALL[$item["parent_id"]]) ) ? "0" : $item["parent_id"];
                    if ($curent_parent == $parent) {
                        $choice = $item;
                        //compact items : remove all items selected
                        unset($items[$k]);
                        $choice['_childs'] = get_by_ord($items, $choice['ID'], $ord + 1, $_ALL);
                        $result[] = $choice;
                    }
                }
                return $result;
            }

        }
        return z_Z($items, 0, 0, $_ALL);
    }

    public function orderItems($config = array(), $callback) {
        $default = array(
            items => array()
        );
        //init new value for default
        foreach ($config as $key => $value) {
            $default[$key] = $value;
        }
        $_ALL = $this->toArrayMySQL($default['items']);

        function z_Z($items, $parent = 0, $ord = 0, $callback, $default, $_ALL) {
            $result = array();
            foreach ($items as $item) {
                $curent_parent = ((!is_numeric($item["parent_id"]) ) OR!isset($_ALL[$item["parent_id"]]) ) ? "0" : $item["parent_id"];
                if ($curent_parent == $parent) {
                    array_push($result, $callback($item, $ord, $default));
                    $new_default = $default;
                    if (isset($default['disabled']) AND ($item['ID'] == $default['disabled'] )) {
                        $new_default["disabled"] = "all";
                    }
                    $result = array_merge($result, z_Z($items, $item['ID'], $ord + 1, $callback, $new_default, $_ALL));
                }
            }
            return $result;
        }

        return z_Z($default['items'], 0, 0, $callback, $default, $_ALL);
    }

    public function orderForCats($config = array()) {
        if (!function_exists('make_option')) {

            function make_option($item, $ord, $setting) {
                if (( $setting['disabled'] == "all" ) OR ( $setting['disabled'] == $item['ID'] ))
                    return array(
                        disabled => 'disable',
                        ord => $ord,
                        info => $item
                    );
                if ($setting['selected'] == $item['ID'])
                    return array(
                        selected => 'selected',
                        ord => $ord,
                        info => $item
                    );
                return array(
                    ord => $ord,
                    info => $item
                );
            }

        }
        return $this->orderItems($config, make_option);
    }

    /*
      @ Create a options
     */

    public function makeFromItems($config = array(), $callback, $callback1 = "") {
        $default = array(items => array());
        //init new value for default
        foreach ($config as $key => $value) {
            $default[$key] = $value;
        }
        if (!function_exists("callback1")) {

            function callback1($a, $i, $j) {
                return $a;
            }

        }
        if ($callback1 == "") {
            $callback1 = callback1;
        }
        $_ALL = $this->toArrayMySQL($default['items']);

        if (!function_exists("get_html")) {

            function get_html($items, $parent = 0, $ord = 0, $callback, $callback1, $default, $_ALL) {
                $html = "";
                foreach ($items as $item) {
                    $curent_parent = (( $item["parent_id"] == "" ) OR!isset($_ALL[$item["parent_id"]]) ) ? "0" : $item["parent_id"];
                    if ($curent_parent == $parent) {
                        $new_default = $default;
                        //disable all child if parent is disabled
                        if (isset($default['disabled']) AND ($item['ID'] == $default['disabled'] )) {
                            $new_default["disabled"] = "all";
                        }
                        $html_append = $callback1(get_html($items, $item['ID'], $ord + 1, $callback, $callback1, $new_default, $_ALL), $ord, $new_default);
                        $html .= $callback($item, $html_append, $ord, $default);
                    }
                }
                return $html;
            }

        }

        return get_html($default['items'], 0, 0, $callback, $callback1, $default, $_ALL);
    }

    //get menu drop commonly
    public function getMenuUL($config = array()) {
        if (!function_exists('get_li')) {

            function get_li($item, $child, $ord, $setting) {
                return "<li class='" . $setting['class_li_name'] . "$ord'>"
                        . $setting['get_url']($item, $ord, @$setting['id_active'])
                        . $child
                        . "</li>";
            }

        }

        if (!function_exists('get_ul')) {

            function get_ul($str, $ord, $setting) {
                return $str == "" ? "" : "<ul class='" . $setting['class_ul_name'] . $ord . "'>\n$str\n</ul>";
            }

        }

        return "<ul" . $config['attr'] . ">\n"
                . $this->makeFromItems($config, get_li, get_ul)
                . "</ul>";
    }

    public function getOptions($config = array()) {
        if (!function_exists("makeoption")) {

            function makeoption($item, $child, $ord, $setting) {
                $before = isset($setting['x']) ? str_repeat($setting['x'], $ord) : "";
                if (( $setting['disabled'] == "all" ) OR ( $setting['disabled'] == $item['ID'] ))
                    return "<option disabled='disable' class='cat_disbaled'>" . $before . $item['title'] . "</option>\n$child";
                if ($setting['selected'] == $item['ID'])
                    return "<option value='" . $item['ID'] . "' selected>" . $before . $item['title'] . "</option>\n$child";
                return "<option value='" . $item['ID'] . "'>" . $before . $item['title'] . "</option>\n$child";
            }

        }
        return "<select " . $config['attr'] . ">\n"
                . (!isset($config['first']) ? "<option value='0'>--</option>\n" : $config['first'] )
                . $this->makeFromItems($config, makeoption)
                . "</select>";
    }

    //get a list checkbox for a name
    //treat with post
//    public function getCheckBoxs($config = array()) {
//
//        function make_option($item, $ord, $setting) {
//            if (isset($setting['selected'])) {
//                $selects = explode(",", $setting['selected']);
//            } else {
//                $selects = array();
//            }
//
//            $before = isset($setting['x']) ? str_repeat($setting['x'], $ord) : "";
//            $lang_onclick = isset($item['lang']) ? ' onclick="$(\'select[name=lang]\').setAttr(\'value\',\'' . $item['lang'] . '\')"' : '';
//
//            if (in_array($item['ID'], $selects))
//                return "<input" . $lang_onclick . " value='" . $item['ID'] . "' name='parent_id[]' type='checkbox' checked>" . $before . $item['title'] . "<br/>\n";
//            return "<input" . $lang_onclick . " value='" . $item['ID'] . "' name='parent_id[]' type='checkbox'>" . $before . $item['title'] . "<br/>\n";
//        }
//
//;
//        return $this->makeFromItems($config, make_option);
//    }
    //get a list checkradio for a name
    //treat with post
    public function getRadios($config = array()) {

        function make_option($item, $ord, $setting) {
            if (isset($setting['selected'])) {
                $selects = explode(",", $setting['selected']);
            } else {
                $selects = array();
            }

            $before = isset($setting['x']) ? str_repeat($setting['x'], $ord) : "";
            $lang_onclick = isset($item['lang']) ? ' onclick="$(\'select[name=lang]\').k(0).value=\'' . $item['lang'] . '\'"' : '';
            if (in_array($item['ID'], $selects))
                return "<input" . $lang_onclick . " value='" . $item['ID'] . "' name='parent_id' type='radio' checked>" . $before . $item['title'] . "<br/>\n";
            return "<input" . $lang_onclick . " value='" . $item['ID'] . "' name='parent_id' type='radio'>" . $before . $item['title'] . "<br/>\n";
        }

        ;
        return $this->makeFromItems($config, make_option);
    }

    /*
      @Menu drop
     */

    public function getMenuDrop($config = array()) {
        $default = array(
            items => array(),
        );
        //init new value for default
        foreach ($config as $key => $value) {
            $default[$key] = $value;
        }

        $_ALL = $this->toArrayMySQL($default['items']);

        function z_Z($items, $parent = 0, $ord = 0, $default, $_ALL) {
            $html = "";
            foreach ($items as $item) {
                $curent_parent = (( $item["parent_id"] == "" ) OR!isset($_ALL[$item["parent_id"]]) ) ? "0" : $item["parent_id"];
                if ($curent_parent == $parent) {
                    $html .= "\n " . str_repeat(" ", $ord) . "<li class='sub$ord'>\n<a href='" . $default['url'] . $item['ID'] . "'>" . $item['title'] . "</a>";
                    $new_default = $default;
                    $child = z_Z($items, $item['ID'], $ord + 1, $new_default, $_ALL);
                    if ($child != "")
                        $html .= "\n" . $child;
                    $html .= "</li>";
                }
            }
            return $html == "" ? "" : str_repeat(" ", $ord) . "<div id='list$ord'><ul>" . $html . "\n\t</ul><div style='clear:both'></div></div>\n";
        }

        return z_Z($default['items'], 0, 0, $default, $_ALL);
    }

    //make option for langs
    public function getLangs($select = "", $langs = array(vn => "Viet Nam", "en" => "English")) {
        $result = "";
        foreach ($langs as $key => $value)
            $result .= "<option value='" . $key . "'" . ($select == $key ? " selected" : "") . ">" . $value . "</option>";
        return "<select name='lang'><option value=''>---</option>" . $result . "</select>";
    }

    //getGroup of user
    public function getGroup($select = "", $groups = array("1" => "Admin", "2" => "Poster")) {
        $result = "";
        foreach ($groups as $key => $value)
            $result .= "<option value='" . $key . "'" . ($select == $key ? " selected" : "") . ">" . $value . "</option>";
        return "<select name='group'>" . $result . "</select>";
    }

    //make sort
    public function getQuery($str = "", $col = "") {
        $names = explode(",", $str);
        if ($col != "")
            $col .= '.';
        $result = array();
        foreach ($names as $name) {
            if (isset($_REQUEST[$name])) {
                $result[] = " $col$name='" . $this->get($name, "") . "'";
            }
        }
        return implode(" AND ", $result);
    }

    //get a query string from request
    //example "parent_id=12 AND ID=13" or "a=100&b=url"
    public function query($str = "", $col = "", $siz = "&") {
        $names = explode(",", $str);
        $result = array();
        foreach ($names as $name) {
            if (isset($_REQUEST[$name])) {
                array_push($result, "$col$name=" . $this->get($name, "") . "");
            }
        }
        return implode($siz, $result);
    }

    public function toNum($data = "", $default = "0") {
        return is_numeric($data) ? $data : $default;
    }

    public function memberOptions($users, $checks) {
        $list = explode(",", $checks);
        $result = "";
        foreach ($users as $user) {
            $checked = in_array($user['ID'], $list) ? " checked" : "";
            $result .= "<input type='checkbox' value='" . $user['ID'] . "' name='member_acp[]'$checked>" . $user['name'] . "&nbsp;&nbsp;";
        }
        return $result;
    }

    /*
      @get languages options
     */

    public function langOptions($current = "") {
        return '<select name="lang">'
                . '<option value="vn"' . ($current == "vn" ? " selected" : "") . '>Tiếng Việt</option>'
                . '<option value="en"' . ($current == "en" ? " selected" : "") . '>Tiếng Anh</option>'
                . '</select>';
    }

    /*
      @update & store for zend lucence

      public function updateSearch( $path, $id, $lang, $title, $content ){
      //remove indexed item

      $this->deleteSearch( $path, $id );
      //now update
      require_once 'Zend/Search/Lucene.php';
      $path = APPLICATION_PATH."/SearchData/$path/";
      clearstatcache();
      if( is_dir($path) ){
      $index = Zend_Search_Lucene::open( $path );
      }else{
      $index = Zend_Search_Lucene::create( $path );
      }

      $doc = new Zend_Search_Lucene_Document();
      $doc->addField(Zend_Search_Lucene_Field::Keyword('i', $id ));
      $doc->addField(Zend_Search_Lucene_Field::Keyword('lang', $lang, 'utf-8' ));
      $doc->addField(Zend_Search_Lucene_Field::Text('title', $title, 'utf-8'));
      $doc->addField(Zend_Search_Lucene_Field::Unstored('content', $content, 'utf-8'));
      $index->addDocument($doc);
      $index->commit();
      $index->optimize();
      }

      public function getSearch( $query, $path ){
      require_once 'Zend/Search/Lucene.php';
      $path = APPLICATION_PATH."/SearchData/$path/";
      if( !is_dir( $path )){
      return array();
      }

      $index = Zend_Search_Lucene::open( $path );
      return $index->find($query);
      }

      public function deleteSearch( $path, $id ){
      require_once 'Zend/Search/Lucene.php';
      $path = APPLICATION_PATH."/SearchData/$path/";
      clearstatcache() ;
      if( is_dir($path) ){
      $index = Zend_Search_Lucene::open( $path );
      }else{
      $index = Zend_Search_Lucene::create( $path );
      }
      $hits = $index->find("i:$id");
      foreach ($hits as $hit) {
      $index->delete($hit->id);
      }
      $index->commit();
      $index->optimize();
      }
     */

    //Convert UTF8 & tag HTML - for Search Full Text
    public function createAlias($data) {
        //data must
        $maTViet = array(
            "à", "á", "ạ", "ả", "ã", "â", "ầ", "ấ", "ậ", "ẩ", "ẫ", "ă",
            "ằ", "ắ", "ặ", "ẳ", "ẵ", "è", "é", "ẹ", "ẻ", "ẽ", "ê", "ề",
            "ế", "ệ", "ể", "ễ",
            "ì", "í", "ị", "ỉ", "ĩ",
            "ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ",
            "ờ", "ớ", "ợ", "ở", "ỡ",
            "ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ",
            "ỳ", "ý", "ỵ", "ỷ", "ỹ",
            "đ",
            "À", "Á", "Ạ", "Ả", "Ã", "Â", "Ầ", "Ấ", "Ậ", "Ẩ", "Ẫ", "Ă",
            "Ằ", "Ắ", "Ặ", "Ẳ", "Ẵ",
            "È", "É", "Ẹ", "Ẻ", "Ẽ", "Ê", "Ề", "Ế", "Ệ", "Ể", "Ễ",
            "Ì", "Í", "Ị", "Ỉ", "Ĩ",
            "Ò", "Ó", "Ọ", "Ỏ", "Õ", "Ô", "Ồ", "Ố", "Ộ", "Ổ", "Ỗ", "Ơ",
            "Ờ", "Ớ", "Ợ", "Ở", "Ỡ",
            "Ù", "Ú", "Ụ", "Ủ", "Ũ", "Ư", "Ừ", "Ứ", "Ự", "Ử", "Ữ",
            "Ỳ", "Ý", "Ỵ", "Ỷ", "Ỹ",
            "Đ", " ", "  ",
            ":", ";", "&"
        );

        $maKoDau = array(
            "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a",
            "a", "a", "a", "a", "a", "a",
            "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e",
            "i", "i", "i", "i", "i",
            "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o",
            "o", "o", "o", "o", "o",
            "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u",
            "y", "y", "y", "y", "y",
            "d",
            "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A",
            "A", "A", "A", "A", "A",
            "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E",
            "I", "I", "I", "I", "I",
            "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O", "O",
            "O", "O", "O", "O", "O",
            "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U",
            "Y", "Y", "Y", "Y", "Y",
            "D", "-", "-",
            "", "", "", "", ""
        );
        $data = str_replace($maTViet, $maKoDau, trim($data));
        return $data;
    }

    public function getWordSearch($name) {
        $value = $this->get($name, "");
        str_replace(array(")", "(", "'", '"', "+", "*", "-"), "", $value);
        return $value;
    }

    public function getCurrentPage($t = "p") {
        $page = $this->get($t);
        return
                (!is_numeric($page) || $page < 1 ) ? 1 : $page;
    }

    public function getPageBarFull($link, $current, $total, $every, $attr = "") {
        $total_page = ceil($total / $every);
        $bar = "";
        if ($total / $every <= 1)
            return "";
        for ($i = 1; $i <= $total_page; $i++) {
            if ($i != $current) {
                $bar .= "<a href='$link$i' class='page_item'>$i</a>";
            } else {
                $bar .= "<a class='page_current'>$i</a>";
            }
        }
        return "<div class='page_full' $attr>$bar</div>";
    }

    public function getPageBarDiv($link, $current, $total, $every, $page_range, $bg = false) {
        $total_page = ceil($total / $every);
        $bar = "<ul>";
        if ($total / $every <= 1)
            return "";
        //if( $total/$every >= 5 )
        $bar .= "<li><a href='{$link}1'>Trang đầu</a></li>";
        //if first
        //if( $current > $page_range ){
        $current_last = ($current - 1) > 1 ? ($current - 1) : 1;
        $bar .= "<li><a href='{$link}$current_last'>" . ($bg ? "<span class='fa fa-angle-double-left'></span>" : "") . "</a></li>";
        //}
        //show first page
        for ($i = max(0, $current - $page_range - 1) + 1; $i <= $current - 1; $i++) {
            $bar .= "<li><a href='$link$i' class='page_item'>$i</a></li>";
        }
        //current
        $bar = $bar . "<li><a class='active'>$current</a>";

        //show next page
        for ($i = $current + 1; $i < min($total_page + 1, $current + $page_range + 1); $i++)
            $bar .= "<li><a href='$link$i'>$i</a></li>";
        //if last
        //if( $current + $page_range < $total_page ){
        $current_next = ($current + 1) < $total_page ? ($current + 1) : $total_page;
        $bar .= "<li><a href='$link$current_next'>" . ($bg ? "<span class='fa fa-angle-double-right'></span>" : "") . "</a></li>";
        //}
        //if( $total/$every >= 5 )
        $bar .= "<li><a href='{$link}$total_page'>Trang cuối</a></li>";
        $bar .= "</ul>";
        return $bar;
    }

    /*
      Append FCK Editor
     */

    public function textEditor($id) {
        return "<script type=\"text/javascript\">
				(function(){
					var editor = new FCKeditor('$id');
					editor.BasePath = \"" . BASE_URL . "/editor/\";
					editor.ReplaceTextarea();
				})();
				</script>";
    }

    /*
      Flash embed
     */

    public function showPlayer($url, $width, $height, $mode = true, $params = array()) {
        $html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" width="' . $width . '" height="' . $height . '">';
        $html .= '<param name="movie" value="' . $url . '"/>';
        $html .= '<param name="quality" value="high"/>';
        if ($mode)
            $html .= '<param name="wmode" value="transparent"/>';
        $html .= '<embed src="' . $url . '" quality="high" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="' . $width . '" height="' . $height . '"/>';
        $html .= '</object>';
        return $html;
    }

    /*
      Append FCK Editor
     */

    public function textEditorSocial($id) {
        return "<script>
                (function ($) {

                    CKEDITOR.replace('editor-{$id}', {
                        toolbar: [

                            {
                                name: 'basicstyles',
                                items: ['Bold', 'Italic', 'Underline', 'Strike']
                            },
                            {
                                name: 'colors',
                                items: ['TextColor', 'BGColor']
                            },
                            {
                                name: 'links',
                                items: ['Link', 'Unlink']
                            },
                            {
                                name: 'paragraph',
                                items: ['NumberedList', 'BulletedList']
                            }
                        ],
                        extraAllowedContent: 'h3{clear};h2{line-height};h2 h3{margin-left,margin-top}',
                        height: 100,
                        removeDialogTabs: 'image:advanced;link:advanced',
                        removeButtons: 'PasteFromWord',
                        startupFocus: true,
                        removePlugins: 'stylescombo',
                        contenteditable: true
                    });

                })(jQuery);

            </script>";
    }

    public static function encode($var) {
        $opt = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
        if (defined('JSON_INVALID_UTF8_IGNORE')) {
            $opt = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE;
        }

        if (rq('@pretty')) {
            $opt = $opt | JSON_PRETTY_PRINT;
        }

        return json_encode($var, $opt);
    }

    /**
     * Encode an object array for query update
     *
     * @param mixed $var
     * @return array
     */
    public static function encodeArray($var) {
        if (!is_array($var)) {
            return [];
        }

        $opt = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT;
        if (defined('JSON_INVALID_UTF8_IGNORE')) {
            $opt = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE;
        }

        $res = [];
        foreach ($var as $k => $v) {
            if (is_array($v)) {
                $res[$k] = json_encode($v, $opt);
            } else {
                $res[$k] = $v;
            }
        }
        return $res;
    }

}
