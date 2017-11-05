/**
 * Created by Administrator on 2017/3/21.
 */
const express = require('express'),
       sql = require('../module/mysql'),
       crypto = require('crypto'),
       uuidV1 = require('uuid/v1'),
       sendMail = require('../module/sendEmail'),
       utils = require('../module/utils'),
       dateformat = utils.dateFormat,
       router = express.Router();

//注册get请求
router.get('/',(req, res) => {

    //获取登录之前的页面地址,并存入session
    let originalUrl = req.query.returnurl;
    if(originalUrl) req.session.returnUrl = originalUrl;
    res.locals.title = '无畏滴青春个人网站注册';
    res.render('login');
});

//注册post请求
router.post('/',(req, res) => {

    const user = req.body['name'],
           pass = req.body['pass'],
           email = req.body['email'],
           md5 = crypto.createHash('md5');

           sql('select * from user where username = ?',[user],(err,data) => {
               if(data.length < 1){
                   sql('select * from user where email = ?', [email], (err, emailData) => {
                       if(emailData.length < 1){
                           const uuid = uuidV1(),
                               time = dateformat(new Date(),'YYYY-MM-DD HH:mm:ss');

                           //使用md5加密
                           let newpass = md5.update(pass).digest('hex');
                           sql('insert into user (username,password,email,code,createtime,status,admin) values (?,?,?,?,?,0,0)',[user,newpass,email,uuid,time],(err)=>{
                               if(err){
                                   res.json({
                                       status: 0,
                                       des: err
                                   });
                               } else {
                                   let promise = new Promise(function(resolve, reject){
                                       let isOk = sendMail(email,'感谢您注册无畏滴青春博客网站！点此<a style="color:red;" href="'+ req.protocol +'://' + req.hostname + '/register/validate/'+ uuid +'.html" >立即激活</a>您的账号。(此链接<span style="color: red">有效时间24小时</span>，请尽快注册！)');
                                       if(isOk === 'fail') {
                                           reject();
                                       } else {
                                           resolve();
                                       }
                                   });
                                   promise.then(function(){
                                       res.json({
                                           status: 1,
                                           des: '发送邮件成功！',
                                           username: user,
                                           email: email
                                       });
                                   },function() {
                                       res.json({
                                           status: -1,
                                           des: '发送邮件失败！'
                                       });
                                   });
                               }
                           });
                       } else {
                           res.json({
                               status: 3,
                               des: '邮箱已被注册！'
                           });
                       }
                   });
               }
               else {
                   res.json({
                       status: 2,
                       des: '用户名已存在！'
                   });
               }
           });
});

//邮件发送成功
router.get('/sendsuccess', (req,res) => {
    let username = decodeURI(decodeURI(req.query.username)),
        email = req.query.email;
        res.locals.data = '邮件发送成功，请进入邮箱'+ email +'激活账号！';
        res.render('tip.ejs');
});

//激活注册
router.get('/validate/:uuid.html',(req,res) => {

    const uuid = req.params.uuid;

    sql('select id,createtime,username,email,status from user where code = ?',[uuid],(err, data) => {
        if(err){
            return;
        } else {

            //如果这个验证码是对的
            if(data.length === 1){

                //如果这个用户没有激活，则开始激活
                if(data[0].status !== 1) {

                    //如果验证码没有过期
                    if(new Date() - data[0].createtime > 1000*60*60*24) {
                        //验证码过期了，重新发送
                        const uuid = uuidV1();
                        let pm = new Promise(function(resolve, reject){
                            let isOk = sendMail(email,'感谢您注册无畏滴青春博客网站！点此<a style="color:red;" href="'+ req.protocol +'://' + req.hostname + '/register/validate/'+ uuid +'.html" >立即激活</a>您的账号。(此链接<span style="color: red">有效时间24小时</span>，请尽快注册！)');
                            if(isOk === 'fail') {
                                reject();
                            } else {
                                resolve();
                            }
                        });
                        pm.then(function(){
                            let time = dateformat(new Date(),'YYYY-MM-DD HH:mm:ss');
                            sql('update user set createtime = ?,code=? where id=?',[time,uuid,data[0].id],(err, data) => {
                                if(err){
                                    res.send('数据查询失败！');
                                } else {
                                    res.send('验证码已经过期,已重新发送验证码，请在邮箱查收！');
                                }
                            });
                        },function(){
                            res.send('重新发送验证码失败，请到邮箱重新激活账号！');
                        });
                    } else {
                        res.locals.data = {active: 1,content: '账号激活成功!',username: data[0].username};
                        sql('update user set status = 1 where id = ?',[data[0].id], (err,data) => {
                            if(err){
                                res.send('数据错误！');
                            } else {
                                res.render('active');
                            }
                        });
                    }
                } else {

                    //如果用户已经激活，则进入登录页面
                    res.locals.data = {active: 1,content: '您的账号已经激活，请不要重复激活!'};
                    res.render('active');
                }
            } else {
                res.locals.data = {active: 0,content:'邮箱验证码错误！'};
                res.render('active');
            }
        }
    });
});

//重发验证码，需要修改数据库验证码的时间和验证码

module.exports = router;