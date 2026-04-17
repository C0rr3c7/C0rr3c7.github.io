---
sidebar_position: 2
---

:::info

挑战内容

前景需要：看监控的时候发现webshell告警，领导让你上机检查你可以救救安服仔吗！！



1,提交攻击者IP

2,提交攻击者修改的管理员密码(明文)

3,提交第一次Webshell的连接URL(http://xxx.xxx.xxx.xx/abcdefg?abcdefg只需要提交abcdefg?abcdefg) 

3,提交Webshell连接密码

4,提交数据包的flag1

5,提交攻击者使用的后续上传的木马文件名称

6,提交攻击者隐藏的flag2 

7,提交攻击者隐藏的flag3 



相关账户密码：

root/Inch@957821.

:::

### 查看web日志

使用宝塔搭建的网站

```bash
cd /www/wwwlogs
cat 127.0.0.1.log
```

![image-20241023182153023](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023182153023.png)

发现IP`192.168.20.1`多次访问`version2.php`，可能是黑客

### 分析家目录里的流量包

过滤`http`流量，蚁剑🐎

![image-20241023182422216](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023182422216.png)

那么第一次webshell的url路径是`/index.php?user-app-register`，密码是`Network2020`

接着看，发现冰蝎🐎，`version2.php`

![image-20241023182723971](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023182723971.png)

![image-20241023182848195](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023182848195.png)



` flag1{Network@_2020_Hack}`

### 查看bash历史记录

```bash
cd
cat .bash_history
```

![image-20241023183006876](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023183006876.png)

`flag3{5LourqoFt5d2zyOVUoVPJbOmeVmoKgcy6OZ}`

发现编辑过`mpnotify.php`,进行查看

`$flag2 = "flag{bL5Frin6JVwVw7tJBdqXlHCMVpAenXI9In9}"`

### 登录宝塔面板

![image-20241023185112136](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023185112136.png)

```bash
/www/wwwroot/127.0.0.1/lib
cat config.inc.php
```

找到数据库战账号密码：`kaoshi:5Sx8mK5ieyLPb84m`

```
/** 数据库设置 */
define('SQLDEBUG',0);
define('DB','kaoshi');//MYSQL数据库名
define('DH','127.0.0.1');//MYSQL主机名，不用改
define('DU','kaoshi');//MYSQL数据库用户名
define('DP','5Sx8mK5ieyLPb84m');//MYSQL数据库用户密码
define('DTH','x2_');//系统表前缀，不用改
```

在`x2_user`表发现账号密码

![image-20241023183428233](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023183428233.png)

md5解密：`Network@2020`

后台写🐎的位置

![image-20241023184614891](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241023184614891.png)

### 总结

猜测是利用序列化漏洞，修改后台密码，登录后台，进行一系列操作

[CVE-2023-6654](https://www.cnblogs.com/kingbridge/articles/18000908)