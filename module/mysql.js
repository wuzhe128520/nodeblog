/**
 * Created by Administrator on 2017/3/13.
 */
const mysql = require("mysql");
module.exports = function(sql,param,callback){
/*    var config = null;
    function connect(){
        config = mysql.createConnection({
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
        config.on('error',handleError);
    }
    function handleError (err) {
        if (err) {
            // 如果是连接断开，自动重新连接
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                connect();
            } else {
                console.error(err.stack || err);
            }
        }
    }
    connect();*/
    let pool = mysql.createPool({
        connectionLimit : 10,
        //数据库的地址
        host: "localhost",
        //数据库
        user: "root",
        password: "root",
        port: "3306",
        database: "nodeblog"
    });
    pool.getConnection(function(err,connection){
        connection.query(sql,param,(error,data) => {
            connection.destroy();
            callback(error, data);
        });
    });
};
