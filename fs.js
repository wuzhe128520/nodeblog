/**
 * Created by Administrator on 2017/4/1.
 */
//文件系统   操作文件
const fs = require('fs');
//打开文件，如果这个文件不存在则创建
fs.open('./fs.txt','wx',(err,data)=>{
   console.log(data);
});
/*
//创建文件夹(目录)
fs.mkdir('./wuzhe');

//删除文件夹
fs.rmdir('./wuzhe');

//删除文件
fs.unlink('./fs.txt');

*/

//读取文件信息
fs.stat('./app.js',(err,data)=>{
   console.log(data);
});

//检测文件 是否可读
fs.access('./app.js',fs.constants.R_OK | fs.constants.W_OK,(err,data)=>{
     console.log(data);
});

//把数据追加到  文件里
fs.appendFile('./fs.txt','新家内容',(err,data)=>{

});

//替换
fs.writeFile('./fs.txt','这个方法是替换',(err,data)=>{

});

//读取文件内容
fs.readFile('./app.js','utf-8',(err,data)=>{
console.log(data);
});

fs.readFile('./app.js',(err,data)=>{
    console.log(Buffer.from(data,'utf8'));
});
//读取文件夹
fs.readdir('./views',(err,data)=>{
   console.log(data);
});
console.log(55);
//以上所有方法，都有一个同步的方法，后面加上Sync就行了
var directory =fs.readdirSync('./views');
console.log(directory);

//重命名文件
fs.rename('./fs.txt','./fsnew.txt',function(err,data){
   console.log(data);
});