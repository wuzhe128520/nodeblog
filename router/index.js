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
                sql('select  ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id) comment_count from article ac , articletype act where ac.typeid = act.type_id order by ac.time desc limit ?,?',[start,length],(err, data) => {
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

        //深拷贝对象
        function deepCopy(p, c){
            var c = c || {};
            for(let i in p){
                if(typeof p[i] === 'object'){
                    c[i] = (p[i].constructor === Array) ?[]:{};
                    deepCopy(p[i], c[i]);
                }else {
                    c[i] = p[i];
                }
            }
            return c;
        }

        //判断是不是空对象
        function isEmptyObject (obj){
            var i = true;

            for(var i in obj){
                if(obj.hasOwnProperty(i)){
                    i = false;
                    break;
                }
            }
            return i;
        }

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
                                var tagsdata = data[0].tags,
                                     param = null,
                                    sqlStr = null;
                                if(tagsdata.indexOf(',') != -1){
                                    tagsAry = tagsdata.split(',');
                                    let j = 0,
                                        tLegnth = tagsAry.length,
                                        str = '';
                                    param = [];
                                    sqlStr = 'select * from articletag where tag_id in ';
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
                                } else {
                                    sqlStr = 'select * from articletag where tag_id = ?';
                                    param = tagsdata;
                                }


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
                                    sql('select id,title from article where id > ? order by time asc limit 1',[id],(err, next) => {

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
                                    sql('select comm.*,us.username from comments comm left join user us on dicid = 1 where comm.topic_id = ? and comm.from_uid = us.id order by comm.comm_time desc',[id],(err,comments)=>{

                                        if(err){
                                            console.log(err);
                                            return;
                                        }

                                        //查询当前文章下的所有回复
                                        /*
                                         select rp.*,us.username from reply rp,user us where rp.dicid=1 and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = 1) and rp.rp_from_uid = us.id
                                         */
                                        /*
                                         select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid=1 and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = 56 and  comm.dicid = 1)
                                        */
                                        sql('select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid=1 and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = 1)',[id],(err, replys) => {

                                                if(err){
                                                    console.log(err);
                                                    return;
                                                }

                                                //构建回复的数组对象
                                                var comrep=[];

                                                for(var i = 0; i < comments.length; i++){

                                                    var commobj = comments[i],
                                                        //第一个子对象
                                                        child = {
                                                            commid: commobj.commid,
                                                            content: commobj.content,
                                                            from_uid: commobj.from_uid,
                                                            comm_time: commobj.comm_time,
                                                            username: commobj.username,
                                                            dicid: commobj.dicid
                                                        };

                                                    //child下的子回复
                                                    var rpChild = [];

                                                    //循环回复数据，找到当前评论下的回复
                                                    for(var j = 0; j < replys.length; j++){
                                                        debugger;
                                                        var rpobj = replys[j];

                                                        var newObj = deepCopy(rpobj);

                                                        //找到当前评论下的所有回复
                                                        if(rpobj.comment_id === commobj.commid ) {

                                                            //针对评论的回复
                                                            if(rpobj.reply_type === 4){

                                                                //回复id
                                                                var rpid = rpobj.rpid;

                                                                //通过递归得到当前回复下所有的子孙回复
                                                                //debugger;
                                                                var dg = digui(rpid);
                                                                isEmpty = isEmptyObject(dg);

                                                                if(!isEmpty&&dg['replys'].length > 0){

                                                                    newObj['replys']=[];
                                                                    newObj['replys'].push(dg);

                                                                }
                                                                console.log('递归后的结果：');
                                                                console.log(dg);
                                                                rpChild.push(newObj);
                                                            }
                                                        }
                                                    }
                                                    //将所有递归出来的所有回复数据放入rpChlid的属性replys下
                                                    if(rpChild.length > 0){
                                                        child['replys'] = rpChild;
                                                    }

                                                    comrep.push(child);
                                                }

                                            //递归构建 reply_type为5的回复
                                            function dgs(result,pid) {

                                                debugger;
                                                var rtn = [];
                                                for(var i =0;i < result.length; i++){

                                                    var resultObj = result[i];

                                                    if(resultObj.reply_id === pid && resultObj.reply_type === 5){

                                                        var childrpid = result[i].rpid;
                                                        var dgsData = dgs(result,childrpid);
                                                        console.log('dgsData:');
                                                        console.log(dgsData);
                                                        if(dgsData.length > 0){
                                                            result[i].replys = dgs(result,childrpid);
                                                        }
                                                        rtn.push(result[i]);
                                                    }
                                                }
                                                return rtn;

                                            }

                                            /**
                                             *
                                             * @param rpid 针对评论的回复id
                                             * @returns {{}}
                                             */
                                                function digui(rpid) {
                                                var dgobjs = {};
                                                var dgsTwoData = dgs( replys,rpid);
                                                console.log('dgsTwoData:');
                                                console.log(dgsTwoData);
                                                if(dgsTwoData.length > 0){
                                                    dgobjs['replys'] = dgsTwoData;
                                                    return dgobjs;
                                                }

                                                    //debugger;
                                                   /*     var dgobjs = {};
                                                        for(var n = 0; n < replys.length; n++){

                                                            var repobj = replys[n];

                                                            //reply_type为5，说明是回复的回复
                                                            if(repobj.reply_id === rpid && repobj.reply_type === 5){

                                                                var childrpid = rpobj.rpid;
                                                                    dgobjs = deepCopy(repobj);
                                                               // if(rpid !== childrpid){*/

                                                                    //rpid为childrpid已经加入到数据里了

                                                                //}
                                                       /*     }
                                                        }*/
                                                }

                                                debugger;
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
        router.post('/comment',(req, res)=>{
            console.log('评论数据：');
            console.log(req.body);
            let commentid = req.body.commentid,
                   content = req.body.content,
                    userid = req.cookies['login'].id,
                      time = new Date().toLocaleString();
            console.log(commentid,content);
            /**
             * form_uid: 评论人id
             *    dicid: 评论类型(1代表文章的评论)
             * topic_id: 评论类型的id(这里代表文章的id)
             *  content: 评论内容
             */

            if(userid){
                sql('insert into comments (from_uid,dicid,topic_id,content,comm_time) values (?,?,?,?,?)',[userid,1,commentid, content,time],(err,data)=>{

                    if(err){
                        console.log(err);
                        return;
                    }

                    res.json({
                        des: '评论成功!'
                    });
                });
            } else {
                res.json({
                    des: '评论失败!用户id不存在!'
                });
            }

         });

        //发表回复
        router.post('/reply',(req, res) => {
            let data = req.body,
                 commid = data.commid,
                 replyid = data.replyid,
                 replytype = data.replytype,
                 content = data.content,
                 touid = data.touid,
                 fromuid = req.cookies['login'].id,
                 dicid = data.dicid,
                 time = new Date().toLocaleString();
                 sql('insert into reply(comment_id,reply_id,reply_type,reply_content,rp_from_uid,to_uid,dicid,reply_time) values (?,?,?,?,?,?,?,?)',[commid,replyid,replytype,content,fromuid,touid,dicid,time],(err) => {
                        if(err) {
                            console.log(err);
                            res.json({
                                data: {
                                    status: 0,
                                    des: '回复失败!'+err
                                }
                            });
                        } else {
                            res.json({
                                data: {
                                    status: 1,
                                    des: '回复成功!'
                                }
                            });
                        }
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