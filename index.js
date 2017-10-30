/**
 * 整合fis-local-deliver版本的font-spider。
 * 由于默认情况下font-spider会使用当前目录下的字体文件进行裁切，
 * 从而导致原始字体文件丢失，这里改写了fis-local-deliver
 * 在deploy写到指定的to目录下后再进行font-spider操作
 * @sharhhu
 */

var pth = require('path');
var fontSpider = require('font-spider');


function getServerInfo() {
  var conf = pth.join(fis.project.getTempPath('server'), 'conf.json');
  if (fis.util.isFile(conf)) {
    return fis.util.readJSON(conf);
  }
  return {};
}

var serverRoot = (function() {
  var key = 'FIS_SERVER_DOCUMENT_ROOT';
  var serverInfo = getServerInfo();
  if (process.env && process.env[key]) {
    var path = process.env[key];
    if (fis.util.exists(path) && !fis.util.isDir(path)) {
      fis.log.error('invalid environment variable [' + key + '] of document root [' + path + ']');
    }
    return path;
  } else if (serverInfo['root'] && fis.util.is(serverInfo['root'], 'String')) {
    return serverInfo['root'];
  } else {
    return fis.project.getTempPath('www');
  }
})();
var cwd = fis.processCWD || fis.project.getProjectPath();
var htmlFiles = [];
function normalizePath(to, root) {
  if (to[0] === '.') {
    to = fis.util(cwd + '/' + to);
  } else if (/^output\b/.test(to)) {
    to = fis.util(root + '/' + to);
  } else if (to === 'preview') {
    to = serverRoot;
  } else {
    to = fis.util(to);
  }
  return to;
}

var defaultOptions = {
    /**
     * 忽略加载的文件规则（支持正则） - 与 `resourceIgnore` 参数互斥
     * @type    {Array<String>}
     */
    ignore: [],

    /**
     * 映射的文件规则（支持正则） - 与 `resourceMap` 参数互斥 - 可以将远程字体文件映射到本地来
     * @type    {Array<Array<String>>}
     * @example [['http://font-spider.org/font', __diranme + '/font'], ...]
     */
    map: [],

    /**
     * 是否支持备份原字体
     * @type    {Boolean}
     */
    backup: true,

    /**
     * 是否对查询到的文本进行去重处理
     * @type    {Boolean}
     */
    unique: true,

    /**
     * 是否排序查找到的文本
     * @type    {Boolean}
     */
    sort: true,

    /**
     * 是否开启调试模式
     * @type    {Boolean}
     */
    debug: false,

    /**
     * 是否支持加载外部 CSS 文件
     */
    loadCssFile: true,

    /**
     * 是否忽略内部解析错误-关闭它有利于开发调试
     * @type    {Boolean}
     */
    silent: true,

    /**
     * 请求超时限制
     * @type    {Number}    毫秒
     */
    resourceTimeout: 8000,

    /**
     * 最大的文件加载数量限制
     * @type    {Number}    数量
     */
    resourceMaxNumber: 64,

    /**
     * 是否缓存请求成功的资源
     * @type    {Boolean}
     */
    resourceCache: true,

    /**
     * 映射资源路径 - 与 `map` 参数互斥
     * @param   {String}    旧文件地址
     * @return  {String}    新文件地址
     */
    resourceMap: function(file) {},

    /**
     * 忽略资源 - 与 `ignore` 参数互斥
     * @param   {String}    文件地址
     * @return  {Boolean}   如果返回 `true` 则忽略当当前文件的加载
     */
    resourceIgnore: function(file) {},

    /**
     * 资源加载前的事件
     * @param   {String}    文件地址
     */
    resourceBeforeLoad: function(file) {},

    /**
     * 加载远程资源的自定义请求头
     * @param   {String}    文件地址
     * @return  {Object}
     */
    resourceRequestHeaders: function(file) {
        return {
            'accept-encoding': 'gzip,deflate'
        };
    }
}

function deliver(output, release, content, file) {
  if (!release) {
    fis.log.error('unable to get release path of file[' + file.realpath + ']: Maybe this file is neither in current project or releasable');
  }
  if (fis.util.exists(output) && !fis.util.isDir(output)) {
    fis.log.error('unable to deliver file[' + file.realpath + '] to dir[' + output + ']: invalid output dir.');
  }
  var target;
  target = fis.util(output, release);

  fis.util.write(target, content);
  if(file.ext === '.html'){
  	htmlFiles.push(target);
  }
  fis.log.debug(
    'release ' +
    file.subpath.replace(/^\//, '') +
    ' >> '.yellow.bold +
    target
  );
}

function process(options){
	console.log('即将处理如下文件：',htmlFiles);
	console.log('==============分割线==============');
	options.resourceMap = function(file) {

		console.info('资源: ',file);

		return file;
	}
	fontSpider(htmlFiles, options).then(function(webFonts) {
		console.log('==============分割线==============');
	    webFonts.forEach(function(webFont) {
            console.log('Font family', webFont.family);
            console.log('Font style', webFont.style);
            console.log('Font weight', webFont.weight);
            console.log('Original size', webFont.originalSize / 1000 + ' KB');
            console.log('Include chars', webFont.chars);
            console.log('Font id', webFont.id);
            console.log('CSS selectors', webFont.selectors.join(', '));
            console.log('==============分割线==============');
            console.log('字体创建信息:');
            webFont.files.forEach(function(file) {
                console.log('文件格式: '+file.format, '，路径：'+file.url + ' 创建大小: ' +
                    file.size / 1000 + ' KB');
            });
        });
	    console.log('==============分割线==============');
	    console.log('完成！');
	    fis.time('font-spider 耗时');
	    //置空当前文件对象；
	    htmlFiles = [];
	    options.callback && options.callback(null,webFonts);
	}).catch(function(err){
    fis.log.error(err);
		options.callback && options.callback(err);
	});
}

module.exports = function(options, modified, total, next) {
  var to = normalizePath(options.to || options.dest || 'preview', fis.project.getProjectPath());
  fis.time('font-spider 耗时');
  modified.forEach(function(file) {
    deliver(to, file.getHashRelease(), file.getContent(), file);
  });
  fis.util.merge(defaultOptions, options);
  // console.log(defaultOptions);
  process(defaultOptions);
  next();
};
