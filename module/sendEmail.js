/**
 * Created by Administrator on 2017/4/16.
 */
const nodemailer = require('nodemailer');

function sendMail(toEmail,content) {

    const mailOptions = {
        from: '无畏滴青春博客 <postmaster@51happybuy.com>', // 发件地址
        to: toEmail, // 收件列表
        subject: '欢迎注册无畏滴青春博客！', // 标题
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
        host: 'smtp.51happybuy.com',
        port: 25, // SMTP 端口
        auth: {
            user: 'postmaster@51happybuy.com',
            //邮箱设置生成的第三方登陆授权码
            pass: 'Fc128610'
        }
    });

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return;
        }
        console.log("发送邮件成功！");
        console.log('Message sent: ' + info.response);
    });
}

module.exports = sendMail;


