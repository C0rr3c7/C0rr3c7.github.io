## HackMyVm-venus(31-50)

### 0x31(curl 指定 UA 访问)

```
################
# MISSION 31 #
################

## EN ##
The user veronica visits a lot http://localhost/waiting.php
```

```shell
kira@venus:~$ curl http://localhost/waiting.php -A "PARADISE"

QTOel6BodTx2cwX
```

### 0x32(别名)

```
################
# MISSION 0x32 #
################

## EN ##
The user veronica uses a lot the password from lana, so she created an alias.
```

```shell
veronica@venus:~$ alias
alias lanapass='UWbc0zNEVVops1v'
alias ls='ls --color=auto'
```

### 0x33(解压缩)

```
################
# MISSION 0x33 #
################

## EN ##
The user noa loves to compress her things.
```

```shell
lana@venus:~$ tar -xvf zip.gz -C /tmp/zip
pwned/lana/zip
```

### 0x34(strings 查看字符)

```
################
# MISSION 0x34 #
################

## EN ##
The password of maia is surrounded by trash
```

```shell
noa@venus:~$ strings trash
O\nh1hnDPHpydEjoEN
```

### 0x35(后两位小写字母爆破)

```
################
# MISSION 0x35 #
################

## EN ##
The user gloria has forgotten the last 2 characters of her password ... They only remember that they were 2 lowercase letters.
```

```shell
echo v7xUVE2e5bjUc{a..z}{a..z} | xargs -n 1 > pass.txt
hydra -l gloria -P pass.txt ssh://venus.hackmyvm.eu:5000
```

### 0x36(二维码)

```
################
# MISSION 0x36 #
################

## EN ##
User alora likes drawings, that's why she saved her password as ...
```

```
gloria@venus:~$ cat image

##########################################################
##########################################################
##########################################################
##########################################################
########              ##########  ##              ########
########  ##########  ##    ##  ####  ##########  ########
########  ##      ##  ##  ##  ######  ##      ##  ########
########  ##      ##  ####  ########  ##      ##  ########
########  ##      ##  ##        ####  ##      ##  ########
########  ##########  ##        ####  ##########  ########
########              ##  ##  ##  ##              ########
########################  ####  ##########################
########    ##  ####    ####  ##  ##      ##    ##########
############    ######  ##    ##      ##          ########
########    ##    ##  ##  ##            ####  ##  ########
##############      ##  ##    ######  ##    ####  ########
############    ##      ##  ########    ##  ##  ##########
########################    ####    ##  ##  ####  ########
########              ##    ####            ##  ##########
########  ##########  ######  ##########  ####  ##########
########  ##      ##  ####  ##      ######        ########
########  ##      ##  ##    ##  ######  ##  ####  ########
########  ##      ##  ####          ##    ##  ##  ########
########  ##########  ##      ####  ##  ##################
########              ##  ##                    ##########
##########################################################
##########################################################
##########################################################
##########################################################
```

扫一下就行了

### 0x37(iso 镜像)

```
################
# MISSION 0x37 #
################

## EN ##
The user julie has created an iso with her password.
```

```shell
alora@venus:~$ strings music.iso
CD001
pwned/alora/music.txtUT
sjDf4i2MSNgSvOv
pwned/alora/music.txtUT
```

iso 特别小直接查看字符串

### 0x38(两个文件的不同)

```
################
# MISSION 0x38 #
################

## EN ##
The user irene believes that the beauty is in the difference.
```

```shell
julie@venus:~$ diff 1.txt 2.txt
174c174
< 8VeRLEFkBpe2DSD
---
> aNHRdohjOiNizlU
```

### 0x39(openssl 解密)

```
################
# MISSION 0x39 #
################

## EN ##
The user adela has lent her password to irene.
```

```shell
irene@venus:~$ openssl rsautl -decrypt -inkey id_rsa.pem -in pass.enc
The command rsautl was deprecated in version 3.0. Use 'pkeyutl' instead.
nbhlQyKuaXGojHx
```

### 0x40(莫斯电码)

```
################
# MISSION 0x40 #
################

## EN ##
User sky has saved her password to something that can be listened to.
```

```shell
adela@venus:~$ file wtf
wtf: ASCII text
adela@venus:~$ cat wtf
.--. .- .--. .- .--. .- .-. .- -.. .. ... .
```

### 0x41(curl 指定 header 访问)

```
################
# MISSION 0x41 #
################

## EN ##
User sarah uses header in http://localhost/key.php
```

```shell
sky@venus:~$ curl http://localhost/key.php

Key header is true?
sky@venus:~$ curl -H "Key:true" http://localhost/key.php

LWOHeRgmIxg7fuS
```

### 0x42(文件名为...)

```
################
# MISSION 0x42 #
################

## EN ##
The password of mercy is hidden in this directory.
```

```shell
sarah@venus:~$ cat ./...
ym5yyXZ163uIS8L
```

### 0x43(查看历史命令)

```
################
# MISSION 0x43 #
################

## EN ##
User mercy is always wrong with the password of paula.
```

```shell
mercy@venus:~$ history
    1  ls -A
    2  ls
    3  rm /
    4  ps
    5  sudo -l
    6  watch tv
    7  vi /etc/logs
    8  su paula
    9  dlHZ6cvX6cLuL8p
   10  history
   11  history -c
   12  logout
   13  ssh paula@localhost
   14  cat .
   15  ls
   16  ls -l
   17  cat flagz.txt
   18  ls -al
   19  cat mission.txt
   20  history
```

### 0x44(根据组名找文件)

```
################
# MISSION 0x44 #
################

## EN ##
The user karla trusts me, she is part of my group of friends.
```

```shell
paula@venus:~$ id
uid=1044(paula) gid=1044(paula) groups=1044(paula),1053(hidden)
paula@venus:~$ find / -group hidden -type f 2>/dev/null
/usr/src/.karl-a
paula@venus:~$ cat /usr/src/.karl-a
gYAmvWY3I7yDKRf
```

### 0x45(exiftool 看图片)

```
################
# MISSION 0x45 #
################

## EN ##
User denise has saved her password in the image.
```

```shell
┌──(root㉿kali)-[/home/kali]
└─# exiftool 1.jpg
About                           : pFg92DpGucMWccA
```

### 0x46(本地提权)

```
################
# MISSION 0x46 #
################

## EN ##
The user zora is screaming doas!
```

```shell
denise@venus:~$ doas
usage: doas [-Lns] [-C config] [-u user] command [args]
denise@venus:~$ doas -u zora bash
```

### 0x47(curl 访问)

```
################
# MISSION 0x47 #
################

## EN ##
The user belen has left her password in venus.hmv
```

```shell
zora@venus:~$ curl -H "Host: venus.hmv" http://127.0.0.1
2jA0E8bQ4WrGwWZ
zora@venus:~$ curl venus.hmv
2jA0E8bQ4WrGwWZ
```

### 0x48(john 爆破 hash)

```
################
# MISSION 0x48 #
################

## EN ##
It seems that belen has stolen the password of the user leona...
```

```shell
john stolen.txt -w=/root/dict/wordlists/rockyou.txt
freedom
```

### 0x49(检查 DNS 服务器配置)

```
################
# MISSION 0x49 #
################

## EN ##
User ava plays a lot with the DNS of venus.hmv lately...
```

```
ls /etc/bind
```

```shell
leona@venus:~$ cat /etc/bind/db.venus.hmv

;
; BIND data file for local loopback interface
;
    604800
@       IN      SOA     ns1.venus.hmv. root.venus.hmv. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL

;@      IN      NS      localhost.
;@      IN      A       127.0.0.1
;@      IN      AAAA    ::1
@       IN      NS      ns1.venus.hmv.

;IP address of Name Server

ns1     IN      A       127.0.0.1
ava IN      TXT     oCXBeeEeYFX34NU
```

### 0x50(莫斯)

```
################
# MISSION 0x50 #
################

## EN ##
The password of maria is somewhere...
```

```
.--. .- .--. .- .--. .- .-. .- -.. .. ... .
```

```
maria@venus:~$ cat mission.txt
################
# MISSION 0x51 #
################
## EN ##
Congrats!
```
