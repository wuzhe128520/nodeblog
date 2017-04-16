/**
 * Created by Administrator on 2017/4/11.
 */
const http = require('http'),
       https = require('https'),
          fs = require('fs'),
       options = {
           hostname: 'www.zhihu.com',
           path: '/',
           port: '443',
           headers: {
               'Content-Length': 'utf-8'
           }
       };

//向外发起http get请求
/*https.get('https://www.zhaopin.com',function(res) {
        let html = '';
        //当请求有数据的时候触发
        res.on('data',function(data){
            html+=data;
        });
        //当请求完成的时候
        res.on('end',function(){
            console.log(html);
        });
});*/

http.get('http://php.weather.sina.com.cn/xml.php?city=%B1%B1%BE%A9&password=DJOYnieT8234jlsK&day=0',function(data){
        console.log('data',typeof data);
        console.log(data);
});

//请求图片
/*
https.get('https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491932456995&di=a2e49153112b647c265cd3bfc9618a4a&imgtype=0&src=http%3A%2F%2Fimg1.imeee.cn%2Fallimg%2Fc141017%2F141352GUK0-102L9.jpg',function(res){
    res.setEncoding('binary');
    let img = '';

    res.on('data',function(data){
        img+=data;
    });
    res.on('end',function(){
        fs.writeFile('./1.png',img,'binary')
    });
});
*/