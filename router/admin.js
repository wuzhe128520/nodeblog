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
router.get('/',(req,res) => {
    res.render('admin/admin');
});

router.get('/user',(req, res)=> {
    sql('select * from user',(err,data)=>{
            if(err){
                console.log(err);
                return;
            }
            res.render('admin/user',{data: data});
    });
});
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
router.get('/article',(req, res)=>{
    res.render('admin/article');
});
//upload.single 用来接收一个文件
router.post('/article',upload.single('uploadfile'),(req,res)=>{
    console.log(req.file);

    let title = req.body.title,
        tag = req.body.tag,
        author = req.body.author,
        content = req.body.content,
        img = '/image/' + req.file.filename,
        time = new Date().toLocaleString();
        console.log(time);
        sql('insert into article(title,tag,author,content,time,img) values(?,?,?,?,?,?)',[title,tag,author,content,time,img],(err,data)=>{
                if(err){
                    console.log(err);
                    res.send('添加文章失败！');
                    return;
                }
                res.send("添加文章成功！");

        });

});
router.get('/nav',(req,res)=>{
    //查询父级
    sql('select distinct navid,title  from nav where level = 1',(err,data)=>{
        res.render('admin/nav',{data:data});
            console.log(data);
    });
});
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