/**
 * Created by Administrator on 2017/3/10.
 */
const express = require('express'),
       router = express.Router(),
       dateformat = require('moment'),
       sql = require('../module/mysql');
       //首页
       router.get('/',(req, res)=>{
           if(req.session.admin){
               res.locals.admin = req.session.admin;
           }
           sql('select * from article order by time desc limit 0,10',(err, data)=>{
               sql('select count(*) as articlenum  from article',(errs,counts)=>{
                   console.log(counts);
                   console.log(data);
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
       router.get('/list-:page.html',(req, res)=>{
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
                            var id = req.params.id;
                            console.log(id);
                            if(err){
                                console.log(err);
                            }
                            if(data.length < 1){
                                //status 返回页面的状态码
                                res.status(404).render('404');
                            }else {
                                sql('select * from articlecomments where aid = ?',[id],(err,comments)=>{
                                    res.render('article-detail',{comments: comments,data: data});
                                });
                            }
                            sql('update article set views = views + 1 where id = ?',[id],(err) => {
                               if(err){
                                   console.log(err);
                               } else {
                                   console.log('浏览量自增1');
                               }
                            });
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

      //顶
      router.post('/ding', (req, res) => {
            let articleId = req.body.id;
            console.log('ding:');
            console.log(articleId);
            sql('update article set ding = ding + 1 where id = ?',[articleId],(err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    sql('select ding from article where id = ?',[articleId],(error, ding) => {
                        if (error) {
                           console.log(error);
                        } else {
                            console.log(ding);
                            res.json({
                                dm: ding
                            });
                        }
                    });

                }

            });
      });

     //踩
     router.post('/cai', (req, res) => {
    let articleId = req.body.id;
    console.log('ding:');
    console.log(articleId);
    sql('update article set cai = cai + 1 where id = ?',[articleId],(err, data) => {
        if (err) {
            console.log(err);
        } else {
            sql('select cai from article where id = ?',[articleId],(error, cai) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(cai);
                    res.json({
                        c: cai
                    });
                }
            });

        }

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