## Gift

### 主机发现

```bash
arp-scan -l
```

```bash
Interface: eth0, type: EN10MB, MAC: 08:00:27:86:fe:3e, IPv4: 192.168.56.101
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.56.111  08:00:27:2a:e9:0c       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.865 seconds (137.27 hosts/sec). 3 responded
```

靶机ip：192.168.56.111

### 端口扫描

```bash
nmap -A 192.168.56.111
```

```bash
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-12 09:14 EDT
Nmap scan report for 192.168.56.111
Host is up (0.00091s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.3 (protocol 2.0)
| ssh-hostkey: 
|   3072 2c:1b:36:27:e5:4c:52:7b:3e:10:94:41:39:ef:b2:95 (RSA)
|   256 93:c1:1e:32:24:0e:34:d9:02:0e:ff:c3:9c:59:9b:dd (ECDSA)
|_  256 81:ab:36:ec:b1:2b:5c:d2:86:55:12:0c:51:00:27:d7 (ED25519)
80/tcp open  http    nginx
|_http-title: Site doesn't have a title (text/html).
MAC Address: 08:00:27:2A:E9:0C (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
```

只有80，22端口

### 目录扫描

啥也没有

### 访问web页面

只有一句话

```
Dont Overthink. Really, Its simple. 
```

### SSH登录

```
ssh root@192.168.56.111
```

```bash
gift:~# ls
root.txt  user.txt
gift:~# cat user.txt
HMV665sXzDS
gift:~# cat root.txt
HMVtyr543FG
```

真是gift！！