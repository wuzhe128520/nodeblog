/**
 * Created by Administrator on 2017/4/16.
 */
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: '163',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: '18588750850@163.com',
        //邮箱设置生成的第三方登陆授权码
        pass: 'mfs06101017'
    }
});

var mailOptions = {
    from: '18588750850@163.com', // 发件地址
    to: '969296206@qq.com', // 收件列表
    subject: 'node邮件测试', // 标题
    //text和html两者只支持一种
    text: '这是用node发送的测试邮件！', // 标题
    html: "<h1>这是一封测试邮件！</h1>"

};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log("发送邮件成功！");
    console.log('Message sent: ' + info.response);
});


