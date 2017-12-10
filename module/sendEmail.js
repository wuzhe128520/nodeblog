/**
 * Created by Administrator on 2017/4/16.
 */
const nodemailer = require('nodemailer');

function sendMail(toEmail,content,subject) {

    const mailOptions = {
        from: '无畏滴青春博客 <postmaster@qdi5.com>', // 发件地址
        to: toEmail, // 收件列表
        subject: subject||'欢迎注册无畏滴青春博客！', // 标题
        html: content
    };

/*    var transporter = nodemailer.createTransport({
        service: '163',
        port: 465, // SMTP 端口
        secureConnection: true, // 使用 SSL
        auth: {
            user: '18588750850@163.com',
            //邮箱设置生成的第三方登陆授权码
            pass: 'mfs06101017'
        }
    });*/
    const transporter = nodemailer.createTransport({
        host: 'smtp.qdi5.com',
        port: 25, // SMTP 端口
        auth: {
            user: 'postmaster@qdi5.com',
            //邮箱设置生成的第三方登陆授权码
            pass: 'Fc128610'
        }
    });

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return 'fail';
        }
        return 'success';
    });
}

module.exports = sendMail;


