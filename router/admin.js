/**
 * Created by Administrator on 2017/3/18.
 */
const express = require('express'),
       sql = require('../module/mysql'),
       utils = require('../module/utils'),
       router = express.Router(),

       //上传文件模块
       upload = require('../module/upload'),
       dateformat = utils.dateFormat,
       fs = require('fs');

//get post 任何形式的访问都会走这一条路由
router.use((req,res,next)=>{
     if(req.session.admin){
         next();
     }else {
         res.send('请用管理员账号登陆');
     }
});

//进入后台
router.get('/',(req,res) => {
    res.render('admin/admin');
});

//用户管理
router.get('/user',(req, res)=> {
    sql('select * from user',(err,data)=>{
            if(err){
                res.status(500).send('服务器错误！');
                return;
            }
            res.render('admin/user',{data: data});
    });
});

//删除用户
router.post('/user/delete',(req, res)=> {
    let userid = req.body.userid;
    sql('delete from user where id = ?',[userid],(err,data)=>{
            if(err){
                return;
            }
            res.send('删除成功');
    });

});

//查询要修改的那条数据
router.get('/user/updateuser',(req,res)=>{
    sql('select * from user where id = ?',[req.query.id],(err, data)=>{
            res.render('admin/updateuser', {data: data});
    });
});

//执行修改
router.get('/user/update',(req, res)=> {
    let formData = req.query;
   sql('update user set username = ?,admin = ? where id= ?',[formData.username,formData.isadmin,formData.ids],(err,data)=>{
            if(err){
                return;
            }
            res.send("修改成功");
   });
});


router.get('/gettypes', (req, res) => {
    sql('select * from articletype', (err, types) => {

        if(err){
            res.json({
                status: 0,
                des: '数据错误！'
            });
        } else {
            res.json(types)
        }
    });
});

//跳转到发表文章后台页面
router.get('/writearticle',(req, res)=>{

    //查询所有标签
    sql('select * from articletag',(error, tags) =>{
        if(error){
            res.json({
                status: 0,
                des: '数据错误！'
            });
        } else {
            sql('select * from articletype', (err, types) => {

                if(err){
                    res.json({
                        status: 0,
                        des: '数据错误！'
                    });
                } else {
                   res.json({
                        types: types,
                        tags: tags
                    });
                  /* res.render('admin/article.ejs',{
                       tags: tags
                   });*/
                }
            });
        }
    });

});

//添加分类
router.post('/addtype', (req, res) => {

    let typename = req.body.typename;
    sql('insert into articletype(typename) values(?)', [typename], (err) => {
            if(err){
                res.json({
                    status: 0,
                    des: '数据错误！'
                });
            } else {
                res.json({
                    status: 1,
                    des: '添加分类成功！'
                });
            }
    });

});

// 发表文章  upload.single 用来接收一个文件 ,upload.single('uploadfile')
router.post('/article',(req,res)=>{
    let summeryContent =  req.body.summery,
        title = req.body.title,

        //新标签名字
        newTags = req.body.newTags,

        //旧标签id
        oldTagIds = req.body.oldTagIds,

        //所属的类别
        typeId = parseInt(req.body.type),
        author = req.body.author,
        content = req.body.content,
        //img = '/image/' + req.file.filename,
        img = req.body.imgSrc,
        summery =  summeryContent.length>200?summeryContent.substr(0,200) + '...':summeryContent,
        time = dateformat(new Date(),'YYYY-MM-DD HH:mm:ss');

        if(!!newTags) {
            let tagsAry = newTags.split(','),
                arr = [],
                fn = function(tag){

                    return new Promise(function(resolve,reject){
                        sql('insert into articletag(tagname) values (?)',[tag],(err) => {

                            if(err){
                               reject(err);
                            } else {
                                sql('select tag_id from articletag where tagname = ?',[tag],(err, tagdata) => {
                                    if(err){
                                        reject(err);
                                    } else {
                                        resolve(tagdata[0].tag_id);
                                    }
                                });
                            }
                        });
                    });
                };

            for(let i = 0, j = tagsAry.length; i < j; i++){
                arr.push(fn(tagsAry[i]));
            }
            Promise.all(arr).then(function(finaldata){
                let finalTag = '';
                if(finaldata.length > 1) {
                    finalTag = finaldata.join(',');
                } else {
                    finalTag = finaldata[0];
                }
                executQuery(finalTag);
            },function(error) {
                if(error) throw error;
            });
        } else {
                executQuery();
        }

        function executQuery(finalTag) {

            if(!finalTag){
               finalTag = oldTagIds;
            }

            sql('insert into article(title,tags,author,content,time,img,summery,typeid) values(?,?,?,?,?,?,?,?)',[title,finalTag,author,content,time,img,summery,typeId],(err,data)=>{
                if(err){
                    res.json({
                        status: 0,
                        des: '添加文章失败！'
                    });
                    return;
                }
                res.json({
                    status: 1,
                    des: '添加文章成功！',
                    insertId: data.insertId
                });
               // res.redirect('/article-detail/'+data.insertId+'.html')
            });
        }
});

router.get('/nav',(req,res)=>{
    //查询父级
    sql('select distinct navid,title  from nav where level = 1',(err,data)=>{
        res.render('admin/nav',{data:data});
    });
});

//发表说说
router.post('/writesay',(req, res) => {
    let userid = req.cookies['login'].id,
        content = req.body.content,
        imgs = req.body.imgs,
        time = dateformat(new Date(),'YYYY-MM-DD HH:mm:ss');
    sql('insert into say(userid,content,time,dicid,imgs) values (?,?,?,?,?)',[userid,content,time,2,imgs],(err) => {
        if(err){
            res.json({
                status: 0,
                des: '发表说说失败！'
            });
            return;
        } else {
            res.json({
                status: 1,
                des: '发表说说成功！'
            });
        }
    });

});

//导航
router.post('/nav',(req,res)=>{
    let navParam =req.body,
        title = navParam.onetitle,
         url = navParam.oneurl,
        navid = navParam.oneid;

    sql('insert into nav (title,navid,level,url) values (?,?,1,?)',[title,navid,url],(err,data)=>{
           if(err){
               res.status(500).send('服务器错误！');
               return;
           }
            res.redirect('/admin/nav');
    });
});

router.get('/views',(req, res)=>{

    //递归读取某个目录里面的所有文件
    function readDir(path){
        let dirAry = [];
        function loop(path){
            //当前要读取的路径
            let rootPath =path;
            //读取目录的方法readdirSync
            let dirs = fs.readdirSync(rootPath);
            for(let i in dirs){
                let isDir=dirs[i].includes('.');
                if(!isDir){
                    rootPath=`${rootPath}/${dirs[i]}`;
                    loop(rootPath);
                }else {
                    dirAry.push(dirs[i]);
                }
            }
            return dirAry;
        };
        return loop;
    }
    let dir =readDir()(`${process.cwd()}/views`);
    res.render('views', {
            dir: dir
    });
});

router.post('/views',(req, res)=>{
    let dirtype = req.body.dirtype,
        dirname = req.body.dirname,
        content = req.body.content;


    if(dirtype === '1'){
        fs.readFile(`${process.cwd()}/views/${dirname}`,'utf-8',(err, data)=>{
                res.json({
                    dirname: dirname,
                    dirtype: '1',
                    content: data
                });
        });
    }
    else if(dirtype === '2'){
        fs.readdir(`${process.cwd()}/views/${dirname}`,(err, data)=>{
            if(err){
                res.json({
                    status: 0,
                    des: '数据错误！'
                });
            }
            res.json({
                dirtype: '2',
                dirname: dirname,
                content: data
            });
        });
    }
    else if(dirtype === '3'){
        fs.writeFile(`${process.cwd()}/views/${dirname}`,content,(err, data)=>{
            if(err){
                res.json({
                    status: 0,
                    des: '数据错误！'
                });
            }
                res.json({
                    result: '修改成功'
                });
        });
    }
    //let dirs = fs.readdirSync(`${process.cwd()}/views`);


});
/*//使用正则来匹配路径
router.get('/a+b+',(req,res) => {
    res.send('这里是正则a+b+');
});*/
module.exports = router;