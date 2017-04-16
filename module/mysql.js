/**
 * Created by Administrator on 2017/3/13.
 */
const mysql = require("mysql");
module.exports = function(sql,param,callback){
    let config = mysql.createConnection({
        //数据库的地址
        host: "localhost",
        //数据库
        user: "root",
        password: "root",
        port: "3306",
        database: "nodeblog"
    });
//开始连接
//进行数据库操作 1、数据库代码 2、动态的值 3、回调
    config.query(sql,param,(err,data)=>{
        callback(err,data);
    });
//结束连接
    config.end();
};
