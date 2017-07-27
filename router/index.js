/**
 * Created by Administrator on 2017/3/10.
 */
const express = require('express'),
       router = express.Router(),
       //上传文件模块
       upload = require('../module/upload'),
       sql = require('../module/mysql');

        //浅拷贝对象
        function copy(p, c){
            c = c || {};
            for(let i in p){
                if(p.hasOwnProperty(i)){
                   /* if(typeof p[i] === 'object'){
                        c[i] = (p[i].constructor === Array) ?[]:{};
                        deepCopy(p[i], c[i]);
                    }else {*/
                        c[i] = p[i];
                   /* }*/
                }
            }
            return c;
        }

        //判断是不是空对象
        function isEmptyObject (obj){
            let i = true;

            for(let j in obj){
                if(obj.hasOwnProperty(j)){
                    i = false;
                    break;
                }
            }
            return i;
        }

        //以时间倒序显示10条数据
        function querytendata(start,length) {

            //以时间倒序显示10条数据
            let p2 = new Promise(function(resolve, reject){
                sql('select  ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id) comment_count from article ac , articletype act where ac.typeid = act.type_id order by ac.time desc limit ?,?',[start,length],(err, data) => {
                    if(err) {
                        console.log(err);
                        reject();
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
                        reject();
                        return;
                    }
                    resolve(topsix);
                });
            });
            return p4;
        }

        //随机查询10条数据
        function queryRandom() {

            let p5 = new Promise(function(resolve, reject){

                sql('select id,title from article order by rand() limit 10', (errs, random) => {

                    if(errs){
                        reject();
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
            let p2 = querytendata(start,length);

            //查询总页数
            let p3 = new Promise(function(resolve, reject) {
                sql('select count(*) as articlenum  from article',(err,counts)=>{
                    console.log(counts);
                    if(err){
                        reject();
                        console.log(err);
                        return;
                    }
                    resolve(counts);
                });
            });

            //查询"顶"最多的6条数据
            let p4 = queryding();

            //随机查询10条博客
            let p5 = queryRandom();

            //以时间分组查询
            let p6 = new Promise(function(resolve, reject) {
                sql("select time,count(id) as articlenum from article group by date_format(time,'%Y%m')", (errs, monthdata) => {

                    if(errs){
                        reject();
                        return;
                    }
                    resolve(monthdata);
                });
            });

            //查询分类
            let p7 = new Promise(function(resolve, reject) {
                sql("select * from articletype", function(err, types){

                    if(err){
                        reject();
                        console.log(err);
                        return;
                    }
                    resolve(types);
                });
            });

            //查询标签
            let p8 = new Promise(function(resolve, reject) {

                sql("select * from articletag", function(err, tags){

                    if(err){
                        reject();
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
            sql('select id,title from article where typeid = 2 order by rand() limit 3');
        }

        //查询评论最多的前10条文章
        function queryMostComment(res) {
            sql('select *,count(comm.commid) counts from article art , comments comm where  art.id = comm.topic_id and comm.dicid = 1 group by art.id order by counts desc limit 10', (err, data) => {
                    if(err){
                        console.log(err);
                    } else {
                        res.json(data);
                    }
            });
        }

        //
        router.get('/getmostcomment',function(req, res){
              queryMostComment(res);
        });

        /**
         *通用ajax分页
         * @param currentPage: 当前页
         * @param showPageNum: 每页显示几条数据
         * @param sqlone: 第一条sql语句  sqlparam: sql对应的参数
         * @param sqltwo 第二条sql语句  sqlparam2: sql对应的参数
         *
         * */

        function page(currentPage,showPageNum,sqlone,sqlparam,sqltwo,sqlparam2,topic,topicname,res) {

                    //分页起始位置
                    let startPage = parseInt((currentPage - 1) * showPageNum);

                    sqlparam.push(startPage);
                    sqlparam.push(showPageNum);
                    sql(sqlone,sqlparam,(err, data) => {

                        if(err){
                            console.log(err);
                        } else {

                            sql(sqltwo,sqlparam2,(err,counts) => {
                                if(err){
                                    console.log(err);

                                } else {

                                    let allDataNum = counts[0].counts;

                                    res.json({
                                        pages: {
                                            showPageNum: showPageNum,
                                            currentPage: currentPage,
                                            allPageNum: allDataNum,
                                        },
                                        data: {
                                            tl: topic + '<span class="highlight">'+topicname+'</span>的文章总共有<span class="highlight">'+ allDataNum + '</span>篇:',
                                            pageData: data
                                        }
                                    });
                                }
                            });
                        }
                    });
         }

        //公用的评论和回复
        /**
         *
         * @param topicId 查询的主题id
         * @param dicId  主题的类型(1: 表示文章；2：表示说说；3：留言；4：相册)
         */
        function commentsAndReplys(topicId,dicId,resolve,reject){

            //查询出当前主题下的所有评论
            sql('select comm.*,us.username from comments comm left join user us on comm.dicid = ? where comm.topic_id = ? and comm.from_uid = us.id order by comm.comm_time desc',[dicId,topicId],(err,comments)=>{
                if(err){
                    console.log(err);
                    reject();
                    return;
                }
                if(comments&&comments.length > 0){
                    //查询当前主题下的所有回复
                    sql('select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid = ? and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = ?)',[dicId,topicId,dicId],(err, replys) => {

                        if(err){
                            console.log(err);
                            reject();
                            return;
                        }

                        //构建回复的数组对象
                        let comrep=[];

                        for(let i = 0; i < comments.length; i++){
                            debugger;
                            let commobj = comments[i],
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
                            let rpChild = [];

                            //循环回复数据，找到当前评论下的回复
                            for(let j = 0; j < replys.length; j++){
                                let rpobj = replys[j],
                                 newObj = copy(rpobj);

                                //找到当前评论下的所有回复
                                if(rpobj.comment_id === commobj.commid ) {

                                    //针对评论的回复
                                    if(rpobj.reply_type === 4){

                                        //回复id
                                        let rpid = rpobj.rpid;

                                        //通过递归得到当前回复下所有的子孙回复
                                        let dg = digui(rpid),
                                            isEmpty = isEmptyObject(dg);

                                        if(!isEmpty&&dg['replys'].length > 0){

                                            newObj['replys']=[];
                                            newObj['replys'].push(dg);

                                        }

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

                            let rtn = [];
                            for(let i =0;i < result.length; i++){

                                let resultObj = result[i];

                                if(resultObj.reply_id === pid && resultObj.reply_type === 5){

                                    let childrpid = result[i].rpid,
                                        dgsData = dgs(result,childrpid);
                                    if(dgsData.length > 0){
                                        result[i].replys = dgsData;
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
                            let dgobjs = {},
                                dgsTwoData = dgs( replys,rpid);

                            if(dgsTwoData.length > 0){
                                dgobjs['replys'] = dgsTwoData;
                                return dgobjs;
                            }
                        }
                        resolve(comrep);
                    });
                } else {
                    resolve([]);
                }
            });
        }

       //首页
       router.get('/',(req, res)=>{
                indexQuery(res,0,10);
       });

       //分页
       router.get('/list-:page.html',(req, res)=>{
           //当前页
           let currentPage = req.params.page,
                showPageNum = 10;
                indexQuery(res, (currentPage - 1)*10, showPageNum, currentPage);
       });

       //根据分类查询文章 跳转到目标页面
       router.get('/type/:typeid.html',(req, res) => {

           res.locals.type = {
               topicid: req.params.typeid,
               topicname: req.query.typename,
               typename: 'type'
           };
           res.render('result.ejs');
       });

       //分类查询文章并分页
       router.post('/type',(req, res) => {
           let typeid = req.body.topicid,

               //当前页
               currentPage = parseInt(req.body.currentPage),

               //每页显示条数
               showPageNum = parseInt(req.body.showPageNum),

               topicname = req.body.topicname;

           page(
               currentPage,
               showPageNum,
               'select ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id and comm.dicid = 1) comment_count from article ac , articletype act where ac.typeid = ? and ac.typeid = act.type_id order by ac.time desc limit ?,?',
               [typeid],
               'select count(*) as counts from article where typeid = ?',
               [typeid],
               '类别',
               topicname,
               res
           );
       });

       //根据标签查询
       router.get('/tag/:tagid.html',(req, res) => {
           res.locals.type = {
               topicid:  req.params.tagid,
               topicname: req.query.tagname,
               typename: 'tag'
           };
           res.render('result.ejs');
       });

       //tag ajax查询
       router.post('/tag',(req, res) => {
           let tagid = req.body.topicid,

               //当前页
               currentPage = parseInt(req.body.currentPage),

               //每页显示条数
               showPageNum = parseInt(req.body.showPageNum),

               topicname = req.body.topicname;

           page(
               currentPage,
               showPageNum,
               `select ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id and comm.dicid = 1) comment_count from article ac , articletype act where ac.tags like '%${tagid}%' and ac.typeid = act.type_id order by ac.time desc limit ?,?`,
               [],
               `select count(*) as counts from article where tags like '%${tagid}%'`,
               [],
               '标签',
               topicname,
               res
           );
       });

       //搜索传递参数
       router.get('/search', (req, res) => {
           res.locals.type = {
               topicname: req.query.search,
               typename: 'search'
           };
           res.render('result.ejs');
       });

        //查询某年某月的数据
       router.get('/querybymonth', (req, res) => {
            res.locals.type = {
              topicid: req.query.yearmonth,
              typename: 'querybymonth'
            };
            res.render('result.ejs');
        });

        //ajax根据年月份查询文章
       router.post('/querybymonth', (req, res) => {
            //当前页
            let currentPage = parseInt(req.body.currentPage),

                //每页显示条数
                showPageNum = parseInt(req.body.showPageNum),

                topicname = req.body.topicname,

                yearmonth = parseInt(req.body.topicid),
                year = (yearmonth + '').substr(0,4),
                month = (yearmonth + '').substr(4);

            page(
                currentPage,
                showPageNum,
                `select ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id and comm.dicid = 1) comment_count from article ac , articletype act where date_format(time,'%Y%m')=? and ac.typeid = act.type_id order by ac.time desc limit ?,?`,
                [yearmonth],
                `select count(*) as counts from article where date_format(time,'%Y%m')=?`,
                [yearmonth],
                year + '年',
                month + '月',
                res
            );
        });

       //搜索
       router.post('/search',(req,res)=>{
                //当前页
           let currentPage = parseInt(req.body.currentPage),

               //每页显示条数
               showPageNum = parseInt(req.body.showPageNum),

               topicname = req.body.topicname;

           page(
               currentPage,
               showPageNum,
               `select ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id) comment_count from article ac , articletype act where (ac.title like '%${topicname}%' or ac.content like '%${topicname}%') and ac.typeid = act.type_id order by ac.time desc limit ?,?`,
               [],
               `select count(*) as counts from article where title like '%${topicname}%' or content like '%${topicname}%'`,
               [],
               '搜索',
               topicname,
               res
           );

       });

        //文章详情
       //:id.html方式接收前端页面传递过来的参数,req.params得到:id的值
       router.get('/article-detail/:id.html',(req, res)=>{
            //req.params 同时接收get，post，其他 提交数据的形式
                let id = req.params.id;

                sql('select * from article al,articletype at where al.id = ? and al.typeid=at.type_id',[req.params.id],(err,data)=>{

                            if(err){
                                console.log(err);
                            }
                            if(data.length < 1){
                                //status 返回页面的状态码
                                res.status(404).render('404');
                            }else {
                                //得到标签id
                                let tagsdata = data[0].tags,
                                     param = null,
                                    sqlStr = null;
                                if(tagsdata.indexOf(',') !== -1){
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
                                let promise2 = new Promise(function(resolve,reject){

                                   //查询标签
                                   sql(sqlStr,param,(err,tags) => {

                                       if(err){
                                           console.log(err);
                                           reject();
                                           return;
                                       }
                                       resolve(tags);
                                   });
                                });

                                let promise = new Promise(function(resolve, reject){

                                    //修改浏览量
                                    sql('update article set views = views + 1 where id = ?',[id],(err) => {
                                        if(err){
                                            console.log(err);
                                            reject();
                                        } else {
                                            console.log('浏览量自增1');
                                            resolve();
                                        }
                                    });
                                });

                                //查询上一篇 下一篇
                                let promise3 = new Promise(function(resolve, reject) {

                                    //查询下一篇
                                    sql('select id,title from article where id > ? order by time asc limit 1',[id],(errone, next) => {

                                            if(errone){
                                                console.log(errone);
                                                reject();
                                            } else {
                                                //查询上一篇
                                                sql('select id,title from article where id < ? order by time desc limit 1',[id],(errtwo, last) => {

                                                    if(err){
                                                        reject();
                                                        console.log(err);
                                                    } else {
                                                        resolve({next: next[0],last: last[0]});
                                                    }
                                                });

                                            }
                                    });
                                });

                                let promise4 = querytendata(0,10);

                                let promise5 = queryding();

                                Promise.all([promise,promise2,promise3,promise4,promise5]).then(function(alldata){

                                    //查询出当前文章的所有评论
                                    sql('select comm.*,us.username from comments comm left join user us on dicid = 1 where comm.topic_id = ? and comm.from_uid = us.id order by comm.comm_time desc',[id],(err,comments)=>{

                                        if(err){
                                            console.log(err);
                                            return;
                                        }

                                        //查询当前文章下的所有回复
                                        sql('select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid=1 and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = 1)',[id],(err, replys) => {

                                                if(err){
                                                    console.log(err);
                                                    return;
                                                }

                                                //构建回复的数组对象
                                                let comrep=[];

                                                for(let i = 0; i < comments.length; i++){

                                                    let commobj = comments[i],
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
                                                    let rpChild = [];

                                                    //循环回复数据，找到当前评论下的回复
                                                    for(let j = 0; j < replys.length; j++){
                                                        debugger;
                                                        let rpobj = replys[j];

                                                        let newObj = copy(rpobj);

                                                        //找到当前评论下的所有回复
                                                        if(rpobj.comment_id === commobj.commid ) {

                                                            //针对评论的回复
                                                            if(rpobj.reply_type === 4){

                                                                //回复id
                                                                let rpid = rpobj.rpid;

                                                                //通过递归得到当前回复下所有的子孙回复
                                                                let dg = digui(rpid),
                                                                    isEmpty = isEmptyObject(dg);

                                                                if(!isEmpty&&dg['replys'].length > 0){

                                                                    newObj['replys']=[];
                                                                    newObj['replys'].push(dg);

                                                                }
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
                                                let rtn = [];
                                                for(let i =0;i < result.length; i++){

                                                    let resultObj = result[i];

                                                    if(resultObj.reply_id === pid && resultObj.reply_type === 5){

                                                        let childrpid = result[i].rpid,
                                                            dgsData = dgs(result,childrpid);
                                                        if(dgsData.length > 0){
                                                            result[i].replys = dgsData;
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
                                                    let dgobjs = {},
                                                        dgsTwoData = dgs( replys,rpid);

                                                    if(dgsTwoData.length > 0){
                                                        dgobjs['replys'] = dgsTwoData;
                                                        return dgobjs;
                                                    }
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
            let commentid = req.body.commentid,
                   content = req.body.content,
                    userid = req.cookies['login'].id,
                      dicid = req.body.dicid,
                      time = new Date().toLocaleString();
            /**
             * form_uid: 评论人id
             *    dicid: 评论类型(1代表文章的评论)
             * topic_id: 评论主题的id(这里代表文章的id)
             *  content: 评论内容
             */

            if(userid){
                sql('insert into comments (from_uid,dicid,topic_id,content,comm_time) values (?,?,?,?,?)',[userid,dicid,commentid, content,time],(err)=>{

                    if(err){
                        console.log(err);
                        res.json({
                            des: '数据错误！'
                        });
                        return;
                    }

                    res.json({
                        status: 1,
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
                            //回复成功后，给被回复人和对应的这条评论下相关回复人发送邮件通知

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
                sql('update article set ding = ding + 1 where id = ?',[articleId],(err) => {
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
        sql('update article set cai = cai + 1 where id = ?',[articleId],(err) => {
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

        //跳转到说说页面
       router.get('/say',(req, res) => {
            res.render('say.ejs');
        });

        //ajax查询说说
       router.post('/say',(req, res) => {
           //当前页
           let currentPage = parseInt(req.body.currentPage),

               //每页显示条数
               showPageNum = parseInt(req.body.showPageNum),
               startPage = parseInt((currentPage - 1) * showPageNum);

/*           page(
               currentPage,
               showPageNum,
               `select ss.*,(select count(*) from comments comm where comm.topic_id = ss.sayid and comm.dicid = 2) comment_count from say ss order by ss.time desc  limit ?,?`,
               [],
               `select count(*) as counts from say`,
               [],
               '',
              '',
               res
           );*/
           let promiseSay = new Promise(function(resolved, rejected){
               sql('select ss.*,(select count(*) from comments comm where comm.topic_id = ss.sayid and comm.dicid = 2) comment_count from say ss order by ss.time desc  limit ?,?',[startPage,showPageNum],function(err,says){
                   if(err){
                        console.log(err);
                        rejected(err);
                   } else {
                       resolved(says);
                   }
               });
           });

           function fn(topicId, dicId){
               return new Promise(function(resolved, rejected){
                 commentsAndReplys(topicId, dicId,resolved,rejected);
               })
           }

           promiseSay.then(function(says){
               let i = 0,
                   promiseAry = [],
                   sayLength = says.length;
               if(sayLength > 0){
                   for(; i < sayLength; i++){
                       let sayId = says[i].sayid;
                       promiseAry.push(fn(sayId, 2));
                   }
               }
               Promise.all(promiseAry).then(function(crsAry){

                   //构建说说，评论回复结构
                   let sayComRep = [],
                        j = 0;
                   for(;j < sayLength; j++){
                       if(crsAry[j]){
                           says[j]['comrep'] = crsAry[j];
                       }
                       sayComRep.push(says[j]);
                   }
                   console.log('构建完成后的说说评论回复结构：');
                   console.log(sayComRep);
                   sql('select count(sayid) as counts from say', (err, counts) => {
                      if(err){
                          console.log(err);
                          res.error();
                      } else {
                          let allDataNum = counts[0].counts;
                          res.json({
                              data: sayComRep,
                              pages: {
                                  showPageNum: showPageNum,
                                  currentPage: currentPage,
                                  allPageNum: allDataNum
                              }
                          });
                      }
                   });

               });
           });
           //查询说说对应说说下的评论回复
       });

       //查询当前说说的评论回复
       router.post('/querysaycomment', (req, res) => {
           let topicId = req.body.topicId,
               dicId = req.body.dicId,
               promise = new Promise(function(resolve, reject){
               commentsAndReplys(topicId, dicId,resolve, reject);
           });
           promise.then(function(data){
               if(data.length > 0){

                   res.json(data);
               } else {
                   res.json({
                       status: 0,
                       des: '获取数据失败！'
                   });
               }
           });
       });

       //留言板
       router.get('/message',(req, res) => {
           res.render('message.ejs');
       });

       //留言板 请求数据
       router.post('/message', (req, res) => {

                //当前页
           let currentPage = parseInt(req.body.currentPage),

               //每页显示条数
               showPageNum = parseInt(req.body.showPageNum),

               //分页起始位置
               startPage = parseInt((currentPage - 1) * showPageNum),

               topicId = req.body.topicId,
               dicId = req.body.dicId;
           let promise = new Promise(function(resolve,reject){
               sql('select comm.*,us.username from comments comm left join user us on comm.dicid = ? where comm.topic_id = ? and comm.from_uid = us.id order by comm.comm_time desc limit ?,?',[dicId,topicId,startPage,showPageNum],(err,comments) =>{
                   if(err){
                       return;
                   }
                   if(comments&&comments.length > 0){

                       //查询当前主题下的所有回复
                       sql('select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid = ? and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = ?)',[dicId,topicId,dicId],(err, replys) => {

                           if(err){
                               reject();
                               return;
                           }

                           //构建回复的数组对象
                           let comrep=[];

                           for(let i = 0; i < comments.length; i++){
                               let commobj = comments[i],
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
                               let rpChild = [];

                               //循环回复数据，找到当前评论下的回复
                               for(let j = 0; j < replys.length; j++){
                                   let rpobj = replys[j],
                                       newObj = copy(rpobj);

                                   //找到当前评论下的所有回复
                                   if(rpobj.comment_id === commobj.commid ) {

                                       //针对评论的回复
                                       if(rpobj.reply_type === 4){

                                           //回复id
                                           let rpid = rpobj.rpid;

                                           //通过递归得到当前回复下所有的子孙回复
                                           let dg = digui(rpid),
                                               isEmpty = isEmptyObject(dg);

                                           if(!isEmpty&&dg['replys'].length > 0){

                                               newObj['replys']=[];
                                               newObj['replys'].push(dg);

                                           }

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

                               let rtn = [];
                               for(let i =0;i < result.length; i++){

                                   let resultObj = result[i];

                                   if(resultObj.reply_id === pid && resultObj.reply_type === 5){

                                       let childrpid = result[i].rpid,
                                           dgsData = dgs(result,childrpid);
                                       if(dgsData.length > 0){
                                           result[i].replys = dgsData;
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
                               let dgobjs = {},
                                   dgsTwoData = dgs( replys,rpid);

                               if(dgsTwoData.length > 0){
                                   dgobjs['replys'] = dgsTwoData;
                                   return dgobjs;
                               }
                           }
                           resolve(comrep);
                       });
                   } else {
                       resolve([]);
                   }
               });
           });
           promise.then(function(data){
               if(data.length > 0){
                   sql('select count(commid) as counts from comments where dicid = 3 and topic_id = 0', (err, counts) => {
                       if(err){
                           console.log(err);
                           res.error();
                       } else {
                           let allDataNum = counts[0].counts;
                           res.json({
                               data: data,
                               pages: {
                                   showPageNum: showPageNum,
                                   currentPage: currentPage,
                                   allPageNum: allDataNum
                               }
                           });
                       }
                   });
               } else {
                   res.json({
                       status: 0,
                       des: '暂无数据！'
                   });
               }
           });
       });

       //相册
       router.get('/album', (req, res) => {
           res.render('album.ejs');
       });

        //单文件上传
        router.post('/upload', upload.single('file'),function(req, res, next){
            let fileData = req.file,
                fileName = fileData.filename,
                destination = fileData.destination,
                imgSrc = destination.substr(destination.indexOf('public') + 6);
            res.json({
                status: 1,
                des: "上传成功！",
                pic: imgSrc + fileName
            });
        });

        //多文件上传
        router.post('/multiUpload', upload.array('file',9),function(req,res,next){
            console.log('多文件上传：');
            console.log(req.files);
            let files = req.files;
            if(files.length === 1){
                let destination = files[0].path;
                if(destination) {
                   let imgSrc = destination.substr(destination.indexOf('public') + 6);
                   console.log(imgSrc);
                   res.json({
                        status: '1',
                        imgurl: imgSrc
                    });
                }
            }

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
                for(let i = 0; i < onedata.length; i++){

                    arr[i] = fn(onedata,i);
                }
                //当arr里面的所有promise执行完后，在执行then()里面的方法
                Promise.all(arr).then(function(){
                    console.log(onedata);
                    res.render('nav',{navdata: onedata});
                });
            });
        });

        module.exports = router;