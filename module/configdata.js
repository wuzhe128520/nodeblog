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
                    console.log('第一个promise');
                    if(!app.locals.nav){
                        console.log('进入第一个promise方法里……');
                        sql('select * from nav',(err, data) => {
                            if(err){
                                reject(err);
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

                    if(!res.locals.login ){
                        res.locals.login = req.cookies.login.name;
                    }

                    //只要用户处于活动状态，重新设置cookie的过期时间
                    //res.cookie('login', req.cookies['login'],{maxAge: 1000*60*60*0.5});

                    //已经登录的状态，设置是否是管理员
                    let p2 = new Promise(function(resolve2, reject2){
                        debugger;
                        console.log('typeof session admin:' + req.session.admin);
                        let sessionAdmin = req.session.admin;
                        if(typeof sessionAdmin === 'undefined'){
                            console.log('进入第2个promise方法里2222222');
                            let loginData = res.locals.login;
                            sql('select admin from user where username = ? or email = ?',[loginData , loginData],(err,data)=> {

                                if(err){
                                    reject2(err);
                                } else {
                                    res.locals.admin = req.session.admin = Number(data[0].admin);
                                    resolve2();
                                }
                            });
                        } else {
                            resolve2();
                        }
                    });

                    p2.then(function(){
                        console.log('出去了……');
                        next();
                    },function(error){
                        throw error;
                    });
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
                    } else {
                        next();
                    }
                }
            },function(err){
                if(err) throw  err;
            });
         });

