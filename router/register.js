/**
 * Created by Administrator on 2017/3/21.
 */
const express = require('express'),
       sql = require('../module/mysql'),
       crypto = require('crypto'),
       router = express.Router();

router.get('/',(req, res) => {
    res.render('register.ejs');
});

router.post('/',(req, res) => {
    const user = req.body.user,
           pass = req.body.pass,
           md5 = crypto.createHash('md5');
           sql('select * from user where username = ?',[user],(err,data) => {

               if(data.length < 1){
                   console.log("可以注册");
                   //使用md5加密
                   var newpass = md5.update(pass).digest('hex');
                   sql('insert into user (username,password,admin) values (?,?,0)',[user,newpass],(err, data)=>{
                            if(err){
                                    res.render('error.ejs');
                                    return;
                                }
                                //向模板里传递值的方式
                                res.locals.result = '<h1>成功</h1>';
                                res.render('register');
                   });
               }
               else {
                   res.render('error.ejs');
               }
               console.log(data);
           });
});
module.exports = router;