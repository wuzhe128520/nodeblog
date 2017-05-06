/**
 * Created by Administrator on 2017/4/21.
 */
//封装百度分享功能
/*
    需求：
        1、在首页能够分享主页面
        2、在文章详情页提供按钮分享和划词分享
    需求分析：
        1、分享主页面
            内容是固定的
            通用设置的主要参数：
                bdText: '分享的文本'
                bdDesc: '分享的描述'
                bdUrl: '点击分享的内容要跳转的网址'
                bdPic: '分享内容封面图'
          分享按钮设置：
                主要参数：
                    tag: 表示该配置只会应用于data-tag值一致的分享按钮
                    bdSize: 分享按钮的尺寸
                    bdCustomStyle: 自定义样式，引入样式文件
           浮窗分享设置：
                    bdImg: 浮窗图标的颜色
                    bdPos: 分享浮窗的位置
                    bdTop: 分享浮窗与可视区域顶部的距离
            划词分享设置：
                    bdSelectMiniList: 自定义弹出浮层中的分享按钮类型和排列顺序
                    bdContainerClass: 自定义划词分享的激活区域
            2、划词分享
*/
/*window._bd_share_config = {
    common : {
        bdText : '自定义分享内容',
        bdDesc : '自定义分享摘要',
        bdUrl : window.location.href.split("?")[0],
       /!* bdPic : '自定义分享图片'*!/
        onBeforeClick: function(cmd, config){
            for(let i in config){
                console.log(i,config[i]);
            }
            config.bdText= $('.js_article_title').text();
            return config;
        }
    },
    share : [{
        "bdSize" : 24
    }],
    slide : [{
        bdImg : 0,
        bdPos : "right",
        bdTop : 100
    }],
    image : [{
        viewType : 'list',
        viewPos : 'top',
        viewColor : 'black',
        viewSize : '16',
        viewList : ['qzone','tsina','huaban','tqq','renren']
    }],
    selectShare : [{
        "bdselectMiniList" : ['qzone','tqq','kaixin001','bdxc','tqf']
    }]
};*/
//这个函数主要功能是构建一个对象出来，返回一个对象
function share(obj) {
            window._bd_share_config = obj;
    with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion='+~(-new Date()/36e5)];
}
/* 弹框插件layer */
var comm = {
     /*数据类型判断*/
     /*
     * 判断是函数、数组、对象、布尔值、数值、Null、undefined的通用方法
     * 返回对应的描述字符串(array,object,number,null,boolean,undefined,function,regexp);
     * */
     type: function(value){
         var objStr = Object.prototype.toString.call(value);
         var objAry = objStr.split(' ')[1];
         var str = objAry.substring(0,objAry.length - 1).toLocaleLowerCase();
         return str||-1;
     },
     //随机数
    //产生min到max之间的随机数(包含min，不包含max)
    randomNum: function(min, max) {
        if(max < min) return;
        var num =(Math.random())*(max - min) + min;
        //console.log(Math.ceil(num));
        return Math.floor(num);
    },
     //公用ajax请求
     ajax: {
         //在ajax请求发送之前要执行的函数
         ajaxStart: function(callback){
            $(document).ajaxStart(callback);
         },
         //当Ajax请求完成后注册一个回调函数,callback(event,XMLHttpRequest,ajaxOptions)
         ajaxComplete: function(callback){
            $(document).ajaxComplete(callback);
         },
         //当Ajax请求出错时注册一个回调函数,callback(event,jqXHR,ajaxSettings,thrownError);
         ajaxError: function(callback){
             $(document).ajaxError(callback);
         },
         commAjax: function(config,extendObj){
             comm.ajax.ajaxComplete(function(){console.log("ajax请求完成！")});
             comm.ajax.ajaxStart(function(){console.log("ajax开始请求！")});
             comm.ajax.ajaxError(function(){console.log("亲，请求出错了噢！");});
             //给请求地址加上随机参数
             var num = new Date()*comm.randomNum(1,10);
             if(config.url){
                 if(config.url.indexOf ('?') != -1){
                        config.url += '&timestamp =' + num;
                 }
                 else {
                     config.url += '?timestamp ='+ num;
                 }
             }
             var defaultObj = {
                    //发送请求的地址
                    url: config.url,
                    type: config.type||'get',
                    //发送到服务器的数据
                    data: config.data||{},
                    //设置请求超时时间(毫秒)
                    timeout: 1200000,
                    //请求失败的回调函数
                    error: config.errorFn||null,
                    //请求成功的回调函数
                    success: config.successFn,
                 };
             if(extendObj){
                 $.extend(defaultObj, extendObj);
             }
             $.ajax(defaultObj);
         }
     },
     /*弹框插件*/
     layer: {
          dialog: function(config, extendObj){
                var defaultObj = {
                    type: config.type,
                    title: config.title,
                    content: config.content,
                    closeBtn: 1,
                    scrollbar: false,
                };
                if(config.buttons&&config.methods){
                    //如果是数组
                    if(comm.type(config.buttons === 'array')){
                            if(comm.type(config.methods) === 'function'){
                                var length = config.buttons.length;
                                for(var i =0;i < length; i++){
                                    //如果是第一个按钮，键值为yes
                                    if(i == 0){
                                        defaultObj[yes]  = method[0];
                                    }
                                    else {
                                        defaultObj['btn'+i] = method[i];
                                    }
                                }
                            }
                        }
                }
                $.extend(defaultObj, extendObj);
                layer.open(defaultObj);
          },
          /*
          * type: 0表示id，type：1表示url
          * 如果是id：
          *    config.photos 的值是 id字符串
          *如果是url:
          *    config.photos 的值是 json对象
          * json对象的格式：
          *             {
           "title": "", //相册标题
           "id": 123, //相册id
           "start": 0, //初始显示的图片序号，默认0
           "data": [   //相册包含的图片，数组格式
           {
           "alt": "图片名",
           "pid": 666, //图片id
           "src": "", //原图地址
           "thumb": "" //缩略图地址
           }
           ]
           }
           config是个对象，里面有两个属性：url和id(任选一个)
          * */
          photos: function(config,extendObj){

              var defaultObj = {

                  anim: 5

              };
              if(extendObj){
                  $.extend(defaultObj, extendObj);
              }
              if(config.url){

                   comm.ajax.commAjax({
                      url: config.url,
                      successFn: function(json){
                       defaultObj['photos'] = json;
                       layer.photos(defaultObj);
                      }
                   });

              }
              else if(config.id){

                  defaultObj.photos = id;
                  layer.photos(defaultObj);
              }
          }
     },
};


