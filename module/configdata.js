/**
 * Created by Administrator on 2017/3/30.
 */
const app = require('../app'),
       sql = require('./mysql'),
        navdata = require('./nav');
        app.use(function(req,res,next){
        if(req.cookies['login']){
            res.locals.login = req.cookies.login.name;
            if(res.locals.login&&!req.session.admin){
                sql('select * from user where username = ?',[res.locals.login],(err,data)=> {

                    console.log(data);
                    req.session.admin = Number(data[0]['admin']);
                    next();
                });
            }
            else {
                next();
            }
        }
        else {
            next();
        }
});
        app.use(function(req,res,next){
                if(req.session.navdata === undefined){
                    navdata(ondata=>{
                        req.session.navdata = ondata;
                        next();
                    });
                }
                else {
                    next();
                }
        });