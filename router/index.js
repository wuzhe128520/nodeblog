/**
 * Created by Administrator on 2017/3/10.
 */
/*const express = require("express");
       router = express.Router();
       router.get('/',(req,res)=>{
           //响应一个文件的方法(必须是绝对路径)
           res.sendFile(process.cwd() + '/views/index.html');
            //res.send("hello");
            //res.json() 响应json数据
       });
       router.get('/123',(req,res)=>{
            res.send("world")
       });*/
const express = require('express'),
       router = express.Router(),
       sql = require('../module/mysql');
/*       router.get('/',(req,res) => {
           sql('select * from user',(err,data)=>{
               //res.render()用来响应模板引擎文件的，第二个参数是向模板文件传递的数据(json)
               res.render('index',{data: data});
           });
       });
       router.get('/reg',(req,res)=>{
           //get方式提交的内容
           // ? 动态数据 1、数据库代码  2、动态的值[]
           //req.query获取get方式提交的表单数据
           sql('insert into user (username,password) values (?,?)',[req.query.name,req.query.pass],(err,data)=>{

               res.json({
                   chenggong: "成功"
               });

           });
       });

       router.get('/qingrenjie',(req, res)=> {

           res.render('post.ejs');

       });

       router.post('/reg',(req,res)=>{

            res.json({
                chenggong: 'post成功'
            });

       });*/
       //首页
       router.get('/',(req, res)=>{
           if(req.session.admin){
               res.locals.admin = req.session.admin;
           }
           sql('select * from article order by time desc limit 0,10',(err, data)=>{
               sql('select count(*) as articlenum  from article',(errs,counts)=>{
                   console.log(counts);
                   res.render('index.ejs',{data: data,counts: counts});
               });
           });
       });
       //模拟导航
       router.get('/nav',(req, res)=>{
           let fn = function(onedata,i){
               return new Promise(function(resolve,reject){
                   sql('select * from nav where level =2 and navid = ?',[onedata[i]['navid']],(err,twodata)=>{
                       onedata[i].child = twodata;
                       resolve();
                   });
               });
           };
           sql('select * from nav where level = 1',(err,onedata)=>{
               let arr = [];
               for(let i in onedata){
                   arr[i] = fn(onedata,i);
               }
               //当arr里面的所有promise执行完后，在执行then()里面的方法
               Promise.all(arr).then(function(){
                    console.log(onedata);
                    res.render('nav',{navdata: onedata});
               });
           });
       });
       //分页的原理
       router.get('/article-detail/list-:page.html',(req, res)=>{
           sql('select * from article order by time desc limit ?,10',[(req.params.page-1)*10],(err, data)=>{
               sql('select count(*) as articlenum  from article',(errs,counts)=>{
                   console.log(counts);
                   res.render('index.ejs',{data: data,counts: counts});
               });
           });
       });
       //搜索
       router.get('/search',(req,res)=>{
           console.log(req.query.search);
           sql(`select * from article where title like '%${req.query.search}%'`,(err,data)=>{
               console.log(data);
               res.send(data);
           });
       });
       //文章详情
       //:id.html方式接收前端页面传递过来的参数,req.params得到:id的值
        router.get('/article-detail/:id.html',(req, res)=>{
            //req.params 同时接收get，post，其他 提交数据的形式
                sql('select * from article where id=?',[req.params.id],(err,data)=>{
                    console.log(data[0]['views']);
                            if(err){
                                console.log(err);
                            }
                            if(data.length < 1){
                                //status 返回页面的状态码
                                res.status(404).render('404');
                            }else {
                                sql('select * from articlecomments where aid = ?',[req.params.id],(err,comments)=>{
                                    res.render('article-detail',{comments: comments,data: data});
                                });
                            }
                });
        });
        //发表评论
        router.post('/article-detail/:id.html',(req, res)=>{
            console.log(req.params.id,req.body.content);
        sql('insert into articlecomments (uid,aid,content) values (0,?,?)',[req.params.id, req.body.content],(err,data)=>{
                if(err){
                    console.log(err);
                    return;
                }
                res.send("评论成功！");
          });
      });
       //退出
       router.get('/logout',(req, res)=>{
           res.clearCookie('login');
           //网址重定向
           res.redirect('/');
       });
       //后台管理
       router.use('/admin',require('./admin'));
       //注册
       router.use('/register',require('./register'));
       //登录
       router.use('/login',require('./login'));

       module.exports = router;