## Enumeration

枚举

### nmap scan

扫描全端口

```shell
nmap -sT --min-rate=10000 -p- 192.168.56.1 -oN nmap_result/port
```

```shell
sudo nmap -sU --min-rate 10000 -p- 192.168.56.1 -oN nmap_result/udp
```

剪切开放端口

```shell
nmap -p- --min-rate=10000 -T4 192.168.56.1 | grep ^[0-9] | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//
```

```shell
cat nmap_result/port | grep 'open' | awk -F'/' '{print $1}'| tr "\n" ','
```

详细扫描

```shell
sudo nmap -sT -sV -sC -O -p port -oN nmap_result/details 192.168.56.1
```

漏洞扫描

```shell
nmap --script=vuln 192.168.56.1 -p port -oN nmap_result/vuln 
```

### web

```shell
whatweb http://192.168.56.1
```

```shell
nikto -h http://192.168.56.1
```

目录扫描

```shell
dirb http://192.168.56.1 -X .txt,.html,.tar,.zip,.php
```

```shell
 dirsearch -u http://192.168.56.1
```

## Foothold

立足点





## Lateral Movement (optional)

横向移动

`fscan`

端口转发

```shell
socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.89.7:8080 &
```

```shell
ssh -L 8080:127.0.0.1:80 root@192.168.1.7 # Local Port
```

```shell
ssh -R 8080:127.0.0.1:80 root@192.168.1.7 # Remote Port
```

## Privilege Escalation

提权

```
find / -type f -perm -4000 2>/dev/null
```

```
sudo -l
```

```
find / -writable 2>/dev/null
```

