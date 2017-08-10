/**
 * Created by Administrator on 2017/5/10.
 */
let moment = require('moment'),
    $ = require('cheerio'),
    ejs = require('ejs'),
    sql = require('./mysql');

let utils = {
    dateFormat: function(date, fmt) {
        return moment(date).format(fmt);
    },
    fromNow: function(date){
        return moment().fromNow();
    },
    //浅拷贝对象
    copy: function(p, c){
        c = c || {};
        for(let i in p){
            if(p.hasOwnProperty(i)){
                c[i] = p[i];
            }
        }
        return c;
    },
    //判断是不是空对象
    isEmptyObject: function(obj){
        let i = true;

        for(let j in obj){
            if(obj.hasOwnProperty(j)){
                i = false;
                break;
            }
        }
        return i;
    },
    //以时间倒序显示10条数据
    querytendata: function(start,length) {

    //以时间倒序显示10条数据
    let p2 = new Promise(function(resolve, reject){
        sql('select  ac.*,act.*,(select count(*) from comments comm where comm.topic_id = ac.id) comment_count from article ac , articletype act where ac.typeid = act.type_id order by ac.time desc limit ?,?',[start,length],(err, data) => {
            if(err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
    return p2;

},
    //查询顶最多的数据
    queryding: function() {
        //查询"顶"最多的6条数据
        let p4 = new Promise(function(resolve, reject){
            sql('select id,title,ding from article order by ding desc limit 0,6', (errs, topsix) => {

                if (errs) {
                    reject(errs);
                    return;
                }
                resolve(topsix);
            });
        });
        return p4;
    },
    //随机查询10条数据
    queryRandom: function() {

    let p5 = new Promise(function(resolve, reject){

        sql('select id,title from article order by rand() limit 10', (errs, random) => {

            if(errs){
                reject(errs);
            }
            resolve(random);
        });
    });

    return p5;
},
    //首页数据和首页分页数据公用函数
    indexQuery: function(res,start,length,currentPage) {
    debugger;
    //以时间倒序显示10条数据
    let p2 = utils.querytendata(start,length);

    //查询总页数
    let p3 = new Promise(function(resolve, reject) {
        sql('select count(*) as articlenum  from article',(err,counts)=>{
            if(err){
                reject(err);
                return;
            }
            resolve(counts);
        });
    });

    //查询"顶"最多的6条数据
    let p4 = utils.queryding();

    //随机查询10条博客
    let p5 = utils.queryRandom();

    //以时间分组查询
    let p6 = new Promise(function(resolve, reject) {
        sql("select time,count(id) as articlenum from article group by date_format(time,'%Y%m')", (errs, monthdata) => {

            if(errs){
                reject(errs);
                return;
            }
            resolve(monthdata);
        });
    });

    //查询分类
    let p7 = new Promise(function(resolve, reject) {
        sql("select * from articletype", function(err, types){

            if(err){
                reject(err);
                return;
            }
            resolve(types);
        });
    });

    //查询标签
    let p8 = new Promise(function(resolve, reject) {

        sql("select * from articletag", function(err, tags){

            if(err){
                reject(err);
            }
            resolve(tags);
        });
    });

    //使用Promise让上面的异步操作都执行完之后再渲染页面
    Promise.all([p2,p3,p4,p5,p6,p7,p8]).then(function(data) {
        console.log(data);
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
    },function(error){
        console.log(error);
        if(error) throw error;
    });
},
        //查询相关文章
    queryRelative: function(typeid) {
        sql('select id,title from article where typeid = 2 order by rand() limit 3',[typeid],function(){

        });
    },
    //查询评论最多的前10条文章
    queryMostComment: function(res) {
    sql('select *,count(comm.commid) counts from article art , comments comm where  art.id = comm.topic_id and comm.dicid = 1 group by art.id order by counts desc limit 10', (err, data) => {
        if(err){
            res.json({
                status: 0,
                des: '数据错误！'
            });
        } else {
            res.json(data);
        }
    });
},

    /**
     *结果页通用ajax分页
     * @param currentPage: 当前页
     * @param showPageNum: 每页显示几条数据
     * @param sqlone: 第一条sql语句  sqlparam: sql对应的参数
     * @param sqltwo 第二条sql语句  sqlparam2: sql对应的参数
     *
     * */
    page: function(currentPage,showPageNum,sqlone,sqlparam,sqltwo,sqlparam2,topic,topicname,res) {

    //分页起始位置
    let startPage = parseInt((currentPage - 1) * showPageNum);

    sqlparam.push(startPage);
    sqlparam.push(showPageNum);
    sql(sqlone,sqlparam,(err, data) => {

        if(err){
            res.json({
                status: 0,
                des: '数据错误！'
            });
        } else {

            sql(sqltwo,sqlparam2,(err,counts) => {
                if(err){
                    res.json({
                        status: 0,
                        des: '数据错误！'
                    });
                } else {

                    let allDataNum = counts[0].counts;

                    res.json({
                        pages: {
                            showPageNum: showPageNum,
                            currentPage: currentPage,
                            allPageNum: allDataNum,
                        },
                        data: {
                            tl: topic + '<span style="color: #F7AF57;">'+topicname+'</span>的文章总共有<span style="color: #F7AF57;">'+ allDataNum + '</span>篇:',
                            pageData: data
                        }
                    });
                }
            });
        }
    });
},
    //公用的评论和回复
    /**
     *
     * @param topicId 查询的主题id
     * @param dicId  主题的类型(1: 表示文章；2：表示说说；3：留言；4：相册)
     */
    commentsAndReplys: function(topicId,dicId,resolve,reject){

    //查询出当前主题下的所有评论
    sql('select comm.*,us.username from comments comm left join user us on comm.dicid = ? where comm.topic_id = ? and comm.from_uid = us.id order by comm.comm_time desc',[dicId,topicId],(err,comments)=>{
        if(err){
            reject(err);
            return;
        }
        if(comments&&comments.length > 0){
            //查询当前主题下的所有回复
            sql('select rp.*,(select username from  user where  id = rp.rp_from_uid) as from_username,(select username from  user where  id = rp.to_uid) as to_username from reply rp where rp.dicid = ? and rp.comment_id in (select comm.commid from comments comm where comm.topic_id = ? and  comm.dicid = ?)',[dicId,topicId,dicId],(err, replys) => {

                if(err){
                    reject(err);
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
                            newObj = utils.copy(rpobj);

                        //找到当前评论下的所有回复
                        if(rpobj.comment_id === commobj.commid ) {

                            //针对评论的回复
                            if(rpobj.reply_type === 4){

                                //回复id
                                let rpid = rpobj.rpid;

                                //通过递归得到当前回复下所有的子孙回复
                                let dg = digui(rpid),
                                    isEmpty = utils.isEmptyObject(dg);

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
};

module.exports = utils;
