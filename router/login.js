/**
 * Created by Administrator on 2017/3/21.
 */
const express = require('express'),
       sql = require('../module/mysql'),
       crypto = require('crypto'),
       router = express.Router();

router.get('/',(req, res)=>{
    res.locals.title = '无畏滴青春个人网站登录';
    //如果已经是登录状态，则跳回首页
    if(req.cookies['login']){
        res.redirect('/');
    } else {

        //获取登录之前的页面地址,并存入session
        let originalUrl = req.query.returnurl;
        if(originalUrl) req.session.returnUrl = originalUrl;

        res.render('login');
    }
});

router.post('/',(req, res)=>{
    const user = req.body['name'],
           pass = req.body['pass'],
           md5 = crypto.createHash('md5'),
           newpass = md5.update(pass).digest('hex');
    sql("select id,status,admin,username from user where (username = ? or email = ?) and password = ?",[user,user,newpass],(err,data)=>{
            if(err){
               res.json({
                   status: 0,
                   des: '数据错误！'
               });
            } else {
                if(data.length === 1){

                    //表示未激活
                    if(data[0].status === 0){
                        res.json({
                            success: 'noactive'
                        });
                    } else {
                        let originalUrl = '';

                        //1、cookie的名称  2、数据  3、过期时间
                        res.cookie('login', {id: data[0].id,name: data[0].username},{maxAge: 1000*60*60*24});

                        // session所有后台页面都是可以访问到的
                        //保存到服务器上面的
                        //session 在关闭页面的时候 session里面保存的所有数据 都会清空
                        res.locals.admin = req.session.admin = data[0]['admin'];
                        if(req.session.returnUrl){
                            originalUrl = req.session.returnUrl;
                        }
                        res.json({
                            originalUrl: originalUrl,
                            success: 1
                        });
                    }
                }
                else {
                    res.json({
                        success: 0
                    });
                }
            }
    });
});
module.exports = router;