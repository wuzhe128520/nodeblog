/**
 * Created by Administrator on 2017/3/10.
 */
//一、全局对象
/**/
//当前文件的路径
console.log(__filename);
//当前文件的目录
console.log(__dirname);
//process对象 node进程工作目录
console.log(process.cwd());
require('http');
let a = `吴哲`;
//告诉所有引用我的文件 可以使用我的a这个变量
module.exports = a;


