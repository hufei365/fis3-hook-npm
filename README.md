## fis3-hook-npm

基于fis3/fis3-hook-node_modules，主要是在跨模块的情况下，如果已经引用该npm包，则其它项目不需要继续打包。 


## 安装

``` shell
npm install -g fis3-hook-common-npm
```

## 用法

在`okay-conf.js`/`fis-conf.js`中添加如下配置

``` js
fis.hook('common-npm');
```

## 说明

fis3-hook-common-npm会执行以下操作：

``` js
fis.unhook('components');
fis.hook('commonjs', {
    extList: ['.js', '.jsx', '.es6', '.ts', '.tsx', '.vue']
});

fis.hook('node_modules');
```


