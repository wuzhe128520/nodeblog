/**
 * Created by Administrator on 2017/3/10.
 */
const http = require('http'),
       https = require('https'),
       fs = require('fs'),
       express = require('express'),
       app = express(),
       bodyParser = require("body-parser"),
       ejs = require('ejs'),
       cheerio = require('cheerio'),
       //日志中间件
       logger = require('morgan'),

       //日志分隔插件
       rfs = require('rotating-file-stream'),
       //获取cookie
       cookieParser = require('cookie-parser'),
       sql = require('./module/mysql'),
       session = require('express-session'),
       utils = require('./module/utils'),
       path = require('path'),
       ws = require('socket.io');
       module.exports = app;

       let options = {
              key: fs.readFileSync('./ssl.key'),
              cert: fs.readFileSync('./ssl.pem')
       };

       //全局时间格式化
       app.locals.dateFormat = utils.dateFormat;
       app.locals.util = utils;
       //设置模板引擎的目录
       app.set('views',__dirname + '/views');

       //设置使用的模板引擎是ejs
       app.set('view engine','ejs');

       function pad(num) {
           return (num > 9 ? "" : "0") + num;
       }

       function generator(time, index) {
           if(! time)
               return "file.log";

           let month  = time.getFullYear() + "" + pad(time.getMonth() + 1),
               day    = pad(time.getDate()),
               hour   = pad(time.getHours()),
               minute = pad(time.getMinutes());

           return "/storage/" + month + "/" + month +
               day + "-" + hour + minute + "-" + index + "-file.log";
       }

       let logDirectory = path.join(__dirname, 'log');

       // ensure log directory exists
       fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

       // create a rotating write stream
       let accessLogStream = rfs('access.log', {
           interval: '1d', // rotate daily
           path: logDirectory
       });

       // setup the logger
       app.use(logger('combined', {stream: accessLogStream}));

       //设置存放静态文件的路由
       app.use(express.static(path.join(__dirname,'/public')));

       //在访问静态文件时，必须使加上bc这个路径
       //app.use('/article-detail',express.static(__dirname + '/article-detail/public'));

       //用来接收json的数据
       app.use(bodyParser.json({limit: '50mb'}));
       app.use(bodyParser.urlencoded({limit: '50mb',extended: true}));
       app.use(cookieParser('wuzhe128520'));//密钥
       app.use(session({secret:'wuzhe128520',resave: false, saveUninitialized: true}));//设置密钥

       //configdata 没有暴露出去任何内容  引入所有代码
       require('./module/configdata');

       //访问当前路径的时候，交给index文件里的路由方法来处理
       app.use('/',require('./router/index'));

       //配置富文本编辑器路由
       app.use('/ueditor/ue',require('./ue'));

       //配置404页面
       app.use(function(req,res){
              res.render('404');
       });

       let server =http.createServer(app).listen(3000);
       https.createServer(options, app).listen(443);
