---
sidebar_position: 1
---


:::info

hackthebox.com
:::

设置代理

``` TCP
client
dev tun
proto tcp
http-proxy 192.168.27.1 7890
remote edge-sg-free-1.hackthebox.eu 443
resolv-retry infinite
```

