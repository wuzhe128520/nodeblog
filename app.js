/**
 * Created by Administrator on 2017/3/10.
 */
const http = require('http'),
       express = require('express'),
       app = express(),
       bodyParser = require("body-parser"),

       //获取cookie
       cookieParser = require('cookie-parser'),
       sql = require('./module/mysql'),
       session = require('express-session'),
       utils = require('./module/utils'),
       path = require('path'),
       ws = require('socket.io');
       module.exports = app;

       //全局时间格式化
       app.locals.dateFormat = utils.dateFormat;

       //设置模板引擎的目录
       app.set('views',__dirname + '/views');

       //设置使用的模板引擎是ejs
       app.set('view engine','ejs');

       //设置存放静态文件的路由
       app.use(express.static(path.join(__dirname,'/public')));

       //在访问静态文件时，必须使加上bc这个路径
       //app.use('/article-detail',express.static(__dirname + '/article-detail/public'));

       //用来接收json的数据
       app.use(bodyParser.json());
       app.use(bodyParser.urlencoded({extended: true}));
       app.use(cookieParser('wuzhe128520'));//密钥
       app.use(session({secret:'wuzhe128520',resave: false, saveUninitialized: true}));//设置密钥

       //configdata 没有暴露出去任何内容  引入所有代码
       require('./module/configdata');
       let fs = require('fs');
       app.post('/fs',(req,res)=>{
              //console.log(req.body.data);
              var imgdata = req.body.data,
                  //使用正则获取base64的图片值
                  actualData = imgdata.replace(/^data:.+,/i,""),
                  extension = imgdata.match(/image\/(\w{3,4})/),
                  //获取扩展名
                  extension=extension[1],
                  databuffer = Buffer.from(actualData, "base64"),
                      filename = Date.now();
                  fs.writeFile(process.cwd()+`/public/image/${filename}.${extension}`,databuffer,(err,data)=>{
                         res.json({
                                uploadImage: true
                         });
                  });
       });

       //访问当前路径的时候，交给index文件里的路由方法来处理
       app.use('/',require('./router/index'));

       //配置富文本编辑器路由
       app.use('/ueditor/ue',require('./ue'));

       //配置404页面
       app.use(function(req,res){
              res.render('404');
       });

       let server =http.createServer(app).listen(520);

       //使用websocket监听服务
       let io = ws(server);
       //保存加入聊天的用户
       let userList = {},
           usernum = 0;
       //监听事件   connection 当打开
       io.on('connection', socket=>{
              //console.log(socket);
              //io.emit() 发送消息的方法  1、发送的名称  2、内容
              io.emit('wuzhe', {name: '你好啊，吴哲！'});
              socket.on('msg',data=>{
                     io.emit('liaotian', data);

              });

              socket.on('login', (data)=>{
                     userList[data.userid] = data.name;
                     //保存聊天用户的名字
                     socket.name = data.name;
                     socket.userid = data.userid;
                     usernum++;
                     data.num = usernum;

                     //当有用户加入的时候 把加入的用户广播出去
                     io.emit('login', {data: data, userlist: userList});
              });
              //加入聊天房间
              socket.on('joinchat',data=>{
                     //加入房间的方法
                     socket.join('chat');
                     io.sockets.in('chat').emit('chathello','欢迎加入聊天房间！');
              });
              //退出聊天房间
              socket.on('exitchat',data=>{
                 socket.leave('chat');
                 io.sockets.in('chat').emit('chathello','离开房间！');
              });

              //disconnect 退出触发的事件
              socket.on('disconnect',()=>{
                     delete userList[socket.userid];
                     usernum--;
                     console.log('当前退出的用户' + socket.name);
                     io.emit('logout',{name: socket.name,num: usernum,userlist: userList});
             });

       });
