/**
 * Created by Administrator on 2017/3/18.
 */
const express = require('express'),
        sql = require('../module/mysql'),
       router = express.Router(),
        //上传文件模块
        upload = require('../module/upload'),
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
                console.log(err);
                return;
            }
            res.render('admin/user',{data: data});
    });
});

//删除用户
router.post('/user/delete',(req, res)=> {
    console.log(req.body.userid);
    let userid = req.body.userid;
    sql('delete from user where id = ?',[userid],(err,data)=>{
            if(err){
                console.log(err);
                return;
            }
            res.send('删除成功');
    });

});

//查询要修改的那条数据
router.get('/user/updateuser',(req,res)=>{
    console.log(req.query);
    sql('select * from user where id = ?',[req.query.id],(err, data)=>{
            res.render('admin/updateuser', {data: data});
    });
});

//执行修改
router.get('/user/update',(req, res)=> {
    console.log("修改用户",req.query);
    let formData = req.query;
   sql('update user set username = ?,admin = ? where id= ?',[formData.username,formData.isadmin,formData.ids],(err,data)=>{
            if(err){
                console.log(err);
                return;
            }
            res.send("修改成功");
   });
});

//跳转到发表文章后台页面
router.get('/writearticle',(req, res)=>{

    //查询所有标签
    sql('select * from articletag',(err, tags) =>{

        if(err){
            console.log(err);
        } else {

            //查询所有分类
            sql('select * from articletype', (err, types) => {

                if(err){
                    console.log(err);
                } else {
                    res.render('admin/article', {
                        tags: tags,
                        types: types
                    });
                }
            });
        }

    });
    //查询分类
});

//upload.single 用来接收一个文件
router.post('/article',upload.single('uploadfile'),(req,res)=>{
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
        img = '/image/' + req.file.filename,
        summery =  summeryContent.length>200?summeryContent.substr(0,200) + '...':summeryContent,
        time = new Date().toLocaleString();
        debugger;
        console.log(req.body.type);
        console.log(title,newTags,oldTagIds,typeId,author,content,img,summery,time);

        if(!!newTags) {
            let tagsAry = newTags.split(','),
                arr = [],
                fn = function(tag){

                    return new Promise(function(resolve,reject){
                        sql('insert into articletag(tagname) values (?)',[tag],(err) => {

                            if(err){
                                 console.log();
                            } else {
                                sql('select tag_id from articletag where tagname = ?',[tag],(err, tagdata) => {
                                    if(err){
                                        console.log(err);
                                        reject();
                                    } else {
                                        resolve(tagdata[0]);
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
                debugger;
                console.log('打印新添加的标签id：');
                console.log(finaldata);
                executQuery();
            });
        } else {
                executQuery();
        }

        function executQuery() {
            sql('insert into article(title,tags,author,content,time,img,summery,typeid) values(?,?,?,?,?,?,?,?)',[title,oldTagIds,author,content,time,img,summery,typeId],(err,data)=>{
                if(err){
                    console.log(err);
                    res.send('添加文章失败！');
                    return;
                }
                res.send("添加文章成功！");

            });
        }
});

router.get('/nav',(req,res)=>{
    //查询父级
    sql('select distinct navid,title  from nav where level = 1',(err,data)=>{
        res.render('admin/nav',{data:data});
            console.log(data);
    });
});

//导航
router.post('/nav',(req,res)=>{
    var navParam =req.body,
        title = navParam.onetitle,
         url = navParam.oneurl,
        navid = navParam.oneid;

    sql('insert into nav (title,navid,level,url) values (?,?,1,?)',[title,navid,url],(err,data)=>{
           if(err){
               console.log(err);
               return;
           }
            res.redirect('/admin/nav');
    });
});

router.get('/views',(req, res)=>{

    //递归读取某个目录里面的所有文件
    function readDir(path){
        var dirAry = [];
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
    console.log('dir',dir);
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
            console.log("输出数据",data);
            if(err){
                console.log(err);
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
                console.log(err);
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