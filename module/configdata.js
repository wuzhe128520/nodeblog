/**
 * Created by Administrator on 2017/3/30.
 */
const app = require('../app'),
       sql = require('./mysql'),
        navdata = require('./nav');

        //首先查询导航
        app.use(function(req,res,next){
            //查询导航信息
            if(typeof app.locals.nav === 'undefined'){
                sql('select * from nav',null,(err, data) => {
                    if(err){
                        throw err;
                    } else {
                        app.locals.nav = data;
                    }
                    next();
                });
            } else {
                next();
            }
        });

        //如果用户未登录
        app.use(function(req, res, next){
            let isLogined = req.cookies['login'];

            //如果未登录，则进入拦截
            if(typeof isLogined === 'undefined'){
                // 获取请求的方法
                let arr = req.path.split('/'),

                    //拦截的请求包括：评论、回复、点赞、踩、后台
                    include = ['comment','reply','ding','cai','admin'];

                // 去除 GET 请求路径上携带的参数
                for (let i = 0, length = arr.length; i < length; i++) {
                    var arrValue = arr[i];
                    if(i === 0 && !arrValue){
                        arr.splice(i,1);
                    }
                }

                //如果请求路径存在于include里，则拦截……
                if(include.indexOf(arr[0]) !== -1){
                    //如果是ajax请求，则使用json返回数据
                    if(req.xhr){
                        res.json({
                            status: 'nologin',
                            des: '您还未登录！'
                        });
                    } else {
                        req.session.returnUrl = req.originalUrl;
                        res.redirect('/login?show=1');  // 将用户重定向到登录页面
                    }
                }
            }
            next();
        });

        //设置管理员
        app.use(function(req, res ,next){
            let loginCookie = req.cookies['login'],
                 sessionAdmin = req.session.admin;

            if(typeof loginCookie !== 'undefined'){
                res.locals.login = loginCookie.name;
            }
            if(typeof sessionAdmin !== 'undefined'){
                res.locals.admin = sessionAdmin;
            }

            if(typeof loginCookie !== 'undefined' && typeof sessionAdmin === 'undefined'){
                let loginData = loginCookie.name;

                sql('select admin from user where username = ? or email = ?',[loginData , loginData],(err,data)=> {
                    if(err){
                        throw err;
                    } else {
                        res.locals.admin = req.session.admin = Number(data[0].admin);
                    }
                    next();
                });
            } else {
                next();
            }
        });

