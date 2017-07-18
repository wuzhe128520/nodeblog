/**
 * Created by Administrator on 2017/3/30.
 */
const app = require('../app'),
       sql = require('./mysql'),
        navdata = require('./nav');

        //全局拦截器
        app.use(function(req,res,next){

            //查询导航信息
            let p = new Promise(function(resolve, reject){

                    if(!app.locals.nav){
                        console.log('查询导航：');
                        sql('select * from nav',(err, data) => {
                            if(err){
                                console.log(err);
                                reject();
                            } else {
                                app.locals.nav = data;

                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }

            });

            p.then(function(){

                if(req.cookies['login']){
                    console.log(req.cookies['login']);
                    res.locals.login = req.cookies.login.name;
                    res.cookie('login', req.cookies['login'],{maxAge: 1000*60*60*0.5});

                    //已经登录的状态，设置是否是管理员
                    if(res.locals.login){
                        let promise = new Promise(function(resolve, reject){
                            sql('select admin from user where username = ?',[res.locals.login],(err,data)=> {

                                if(err){
                                    console.log(err);
                                    reject();
                                } else {
                                    req.session.admin = Number(data[0].admin);
                                    res.locals.admin = req.session.admin;
                                    resolve();
                                }
                            });

                        });

                        promise.then(function(){
                            next();
                        });
                    } else {
                        next();
                    }
                }  else {

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
                    console.log('是否是ajax请求：');
                    console.log(req.xhr);

                    //如果请求路径存在于include里，则拦截……
                    if(include.indexOf(arr[0]) !== -1){
                        debugger;
                        console.log('拦截请求…………');
                        console.log(arr[0]);
                        req.session.originalUrl = req.originalUrl ? req.originalUrl : null;  // 记录用户原始请求路径

                        //如果是ajax请求，则使用json返回数据
                        if(req.xhr){
                            res.json({
                                status: 'nologin'
                            });
                        } else {
                            res.redirect('/login?show=1');  // 将用户重定向到登录页面
                        }
                    } else {
                        next();
                    }
                }
            });
         });
/* 导航数据 */
/*
app.use(function(req,res,next){
                if(req.session.navdata === undefined){
                    navdata(ondata=>{
                        req.session.navdata = ondata;
                        next();
                    });
                }
                else {
                    next();
                }
        });*/
