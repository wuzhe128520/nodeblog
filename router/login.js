/**
 * Created by Administrator on 2017/3/21.
 */
const express = require('express'),
            sql = require('../module/mysql'),
         crypto = require('crypto'),
         router = express.Router();

router.get('/',(req, res)=>{
    console.log(req.cookies);
    // if(req.cookies['login']){
    //     res.locals.login = req.cookies.login.name;
    // }
    res.render('login');
});

router.post('/',(req, res)=>{
    const user = req.body['name'],
           pass = req.body['pass'],
           md5 = crypto.createHash('md5');
    let newpass = md5.update(pass).digest('hex');
    sql("select status from user where username = ? and password = ?",[user,newpass],(err,data)=>{
            console.log("是否是激活状态：");
            console.log(data);
            if(data.length === 1){

                //表示未激活
                if(data[0].status === 0){
                    res.json({
                        success: 'noactive'
                    });
                } else {
                    //1、cookie的名称  2、数据  3、过期时间
                    res.cookie('login', {name: user},{maxAge: 1000*60*60*24});
                    // session所有后台页面都是可以访问到的
                    //保存到服务器上面的
                    //session 在关闭页面的时候 session里面保存的所有数据 都会清空
                    req.session.admin = data[0]['admin'];
                    res.json({
                        success: 1
                    });
                }

            }
            else {
                res.send('登录失败');
            }
    });
});
module.exports = router;