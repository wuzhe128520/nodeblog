/**
 * Created by Administrator on 2017/3/10.
 */
const express = require('express'),
       router = express.Router(),
       dateformat = require('moment'),
       sql = require('../module/mysql');

        //以时间倒序显示10条数据
        function querytendata(start,length) {

            //以时间倒序显示10条数据
            var p2 = new Promise(function(resolve, reject){
                sql('select * from article ac , articletype act where ac.typeid = act.type_id order by ac.time desc limit ?,?',[start,length],(err, data) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    resolve(data);
                });
            });
            return p2;

        }

        //查询顶最多的数据
        function queryding() {
            //查询"顶"最多的6条数据
            let p4 = new Promise(function(resolve, reject){
                sql('select id,title,ding from article order by ding desc limit 0,6', (errs, topsix) => {

                    if (errs) {
                        console.log(errs);
                        return;
                    }
                    resolve(topsix);
                });
            });
            return p4;
        }

        //随机查询10条数据
        function queryRandom() {

            var p5 = new Promise(function(resolve, reject){

                sql('select id,title from article order by rand() limit 10', (errs, random) => {

                    if(errs){
                        console.log(errs);
                    }
                    resolve(random);
                });
            });

            return p5;
        }

        //首页数据和首页分页数据公用函数
        function indexQuery(res,start,length,currentPage) {
            //以时间倒序显示10条数据
            var p2 = querytendata(start,length);

            //查询总页数
            var p3 = new Promise(function(resolve, reject) {
                sql('select count(*) as articlenum  from article',(err,counts)=>{
                    console.log(counts);
                    if(err){
                        console.log(err);
                        return;
                    }
                    resolve(counts);
                });
            });

            //查询"顶"最多的6条数据
            var p4 = queryding();

            //随机查询10条博客
            var p5 = queryRandom();

            //以时间分组查询
            var p6 = new Promise(function(resolve, reject) {
                sql("select time from article group by date_format(time,'%Y%m')", (errs, monthdata) => {

                    if(errs){
                        console.log(err);
                        return;
                    }
                    resolve(monthdata);
                });
            });

            //查询分类
            var p7 = new Promise(function(resolve, reject) {
                sql("select * from articletype", function(err, types){

                    if(err){
                        console.log(err);
                        return;
                    }
                    resolve(types);
                });
            });

            //查询标签
            var p8 = new Promise(function(resolve, reject) {

                sql("select * from articletag", function(err, tags){

                    if(err){
                        console.log(err);
                        return;
                    }
                    resolve(tags);
                });
            });

            //使用Promise让上面的异步操作都执行完之后再渲染页面
            Promise.all([p2,p3,p4,p5,p6,p7,p8]).then(function(data) {

                console.log('data[0]--------------------------------------------------------------------');
                console.log(data[0]);
                let showPageNum = 10;
                res.render('index.ejs',{
                    data: data[0],
                    pages: {
                        counts: data[1],
                        current: currentPage||1,
                        showPageNum: showPageNum
                    },
                    topsix: data[2],
                    random: data[3],
                    monthdata: data[4],
                    typedata: data[5],
                    tagdata: data[6]
                });
            });
        }

        //查询相关文章
        function queryRelative() {
            sql('select id,title from article where typeid = 2 order by rand() limit 3; ');
        }

       //首页
       router.get('/',(req, res)=>{

               if(req.session.admin){
                   res.locals.admin = req.session.admin;
               }
                indexQuery(res,0,10);
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

       //分页
       router.get('/list-:page.html',(req, res)=>{
           //当前页
           let currentPage = req.params.page,
                showPageNum = 10;
                indexQuery(res, (currentPage - 1)*10, showPageNum, currentPage);
       });

       //查询某年某月的数据
       router.get('/querybymonth/:yearmonth.html', (req, res) => {

            sql("select * from article where date_format(time,'%Y%m')=?",[req.params.yearmonth], (errs, ymdata) => {

                if(errs){
                    console.log(errs);
                    return;
                }
                res.send(ymdata);
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
                var id = req.params.id;

                sql('select * from article al,articletype at where al.id = ? and al.typeid=at.type_id',[req.params.id],(err,data)=>{

                            if(err){
                                console.log(err);
                            }
                            if(data.length < 1){
                                //status 返回页面的状态码
                                res.status(404).render('404');
                            }else {
                                //得到标签id
                                var tagsdata = data[0].tags;
                                tagsAry = tagsdata.split(',');
                                var j = 0,
                                tLegnth = tagsAry.length,
                                sqlStr = 'select * from articletag where tag_id in ',
                                       str = '',
                                        param = [];
                                console.log(tLegnth);
                                for(;j < tLegnth; j++) {

                                    if(j===0) {
                                        str = '(?,';
                                    } else if(j === (tLegnth - 1 )) {
                                        str += '?)'
                                    } else {
                                        str += '?,';
                                    }
                                    param.push(tagsAry[j]);
                                }
                                sqlStr += str;
                                console.log(sqlStr);
                                console.log(param);
                                var promise2 = new Promise(function(resolve,reject){

                                   //查询标签
                                   sql(sqlStr,param,(err,tags) => {

                                       if(err){
                                           console.log(err);
                                           return;
                                       }
                                       resolve(tags);
                                   });
                                });

                                var promise = new Promise(function(resolve, reject){

                                    //修改浏览量
                                    sql('update article set views = views + 1 where id = ?',[id],(err) => {
                                        if(err){
                                            console.log(err);
                                        } else {
                                            console.log('浏览量自增1');
                                        }
                                        resolve();
                                    });
                                });

                                //查询上一篇 下一篇
                                var promise3 = new Promise(function(resolve, reject) {

                                    //查询下一篇
                                    sql('select id,title from article where id > ? order by time desc limit 1',[id],(err, next) => {

                                            if(err){
                                                console.log(err);
                                            }

                                        //查询上一篇
                                        sql('select id,title from article where id < ? order by time desc limit 1',[id],(err, last) => {

                                            if(err){
                                                console.log(err);
                                            }
                                            resolve({next: next[0],last: last[0]});
                                        })

                                    });
                                });

                                var promise4 = querytendata(0,10);

                                var promise5 = queryding();

                                Promise.all([promise,promise2,promise3,promise4,promise5]).then(function(alldata){

                                    //查询出当前文章的所有评论
                                    sql('select comm.*,us.username from comments comm left join user us on dicid = 1 where comm.topic_id = ? and comm.from_uid = us.id',[id],(err,comments)=>{

                                        if(err){
                                            console.log(err);
                                            return;
                                        }

                                        //查询当前文章下的所有回复
                                        sql('select * from reply where dicid=1 and comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = 1)',[id],(err, replys) => {
                                                if(err){
                                                    console.log(err);
                                                    return;
                                                }

                                                var comrep=[],
                                                    purereplys = [];
                                                for(var i = 0; i < comments.length; i++){

                                                    var commobj = comments[i],
                                                        child = {
                                                            commid: commobj.commid,
                                                            content: commobj.content,
                                                            from_uid: commobj.from_uid,
                                                            comm_time: commobj.comm_time
                                                        };
                                                    var rpChild = [];

                                                    for(var j = 0; j < replys.length; j++){

                                                        var rpobj = replys[j];

                                                        //找到当前评论下的所有回复
                                                        if(rpobj.comment_id === commobj.commid ) {

                                                           //将当前评论下的所有回复存入新的数组
                                                            purereplys.push(rpobj);

                                                            //针对评论的回复
                                                            if(rpobj.reply_type ===4){

                                                                purereplys.splice(purereplys.length-1,1);

                                                                //第一条回复放到rpChild
                                                                rpChild.push(rpobj);

                                                                //得到第一个评论的回复id(回复表的主键)
                                                                var rpid = rpobj.rpid;

                                                                //得到第一条回复下所有的子孙回复
                                                                var ary = digui(rpid);

                                                                rpChild['replys'] = ary;

                                                            }

                                                        }
                                                    }

                                                    child['replys'] = rpChild;

                                                    comrep.push(child);
                                                }

                                                //递归出第一条回复下的所有回复(除了第一条)
                                                function digui(rpid) {
                                                    var ary = [];
                                                    for(var n = 0; n < purereplys.length; n++){

                                                        var repobj = purereplys[n];
                                                        if(repobj.reply_id === rpid&&repobj.reply_type===5){

                                                                ary.push(repobj);

                                                                replys.splice(n,1);


                                                                var childrpid = rpobj.rpid;

                                                                digui(childrpid);
                                                        }
                                                    }

                                                    return ary;
                                                }

                                                console.log('构建新的数据结构：');
                                                console.log(comrep);
                                               res.render('article-detail',{
                                                    commentsReply: comrep,
                                                    data: data,
                                                    tags: alldata[1],
                                                    sibling: alldata[2],
                                                    lastest: alldata[3],
                                                    topsix: alldata[4]
                                                });

                                        });


                                    });



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