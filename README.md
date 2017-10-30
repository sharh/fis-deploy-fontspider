# Usage

> fis3配置：

```js
//开启相对路径，需要安装fis3-hook-relative，如果没有开启此项，会导致读取不到字体文件地址而报错。
fis.hook( 'relative' );

fis.match( '**.html', {
    deploy: [ fis.plugin( 'local-deliver', {
      to: './output'
    } ) , fis.plugin( 'fontspider', options)]
  } );
```

# options

> 参考[font-spider](https://github.com/aui/font-spider/blob/master/API.md#选项)

```js
{

    // 最终输出文件夹，deploy插件是在构建完成之后处理的，所以不影响源文件
    "to": "./output",

    /*下列选项来自font-spider提供的选项*/
    /**
     * 忽略加载的文件规则（支持正则） - 与 `resourceIgnore` 参数互斥
     * @type    {Array<String>}
     */
    "ignore": [],

    /**
     * 映射的文件规则（支持正则） - 与 `resourceMap` 参数互斥 - 可以将远程字体文件映射到本地来
     * @type    {Array<Array<String>>}
     * @example [['http://font-spider.org/font', __diranme + '/font'], ...]
     */
    "map": [],

    /**
     * 是否支持备份原字体
     * @type    {Boolean}
     */
    "backup": true,

    /**
     * 是否对查询到的文本进行去重处理
     * @type    {Boolean}
     */
    "unique": true,

    /**
     * 是否排序查找到的文本
     * @type    {Boolean}
     */
    "sort": true,

    /**
     * 是否开启调试模式
     * @type    {Boolean}
     */
    "debug": false,

    /**
     * 是否支持加载外部 CSS 文件
     */
    "loadCssFile": true,

    /**
     * 是否忽略内部解析错误-关闭它有利于开发调试
     * @type    {Boolean}
     */
    "silent": true,

    /**
     * 请求超时限制
     * @type    {Number}    毫秒
     */
    "resourceTimeout": 8000,

    /**
     * 最大的文件加载数量限制
     * @type    {Number}    数量
     */
    "resourceMaxNumber": 64,

    /**
     * 是否缓存请求成功的资源
     * @type    {Boolean}
     */
    "resourceCache": true,

    /**
     * 映射资源路径 - 与 `map` 参数互斥
     * @param   {String}    旧文件地址
     * @return  {String}    新文件地址
     */
    "resourceMap": function(file) {},

    /**
     * 忽略资源 - 与 `ignore` 参数互斥
     * @param   {String}    文件地址
     * @return  {Boolean}   如果返回 `true` 则忽略当当前文件的加载
     */
    "resourceIgnore": function(file) {},

    /**
     * 资源加载前的事件
     * @param   {String}    文件地址
     */
    "resourceBeforeLoad": function(file) {},

    /**
     * 加载远程资源的自定义请求头
     * @param   {String}    文件地址
     * @return  {Object}
     */
    "resourceRequestHeaders": function(file) {
        return {
            'accept-encoding': 'gzip,deflate'
        };
    }
}

```
