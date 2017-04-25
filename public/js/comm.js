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
   /* let config = {
        common: obj.common||{},
        share: obj.share||[],
        slide: obj.slide||[],
        image: obj.image||[],
        selectShare: obj.selectShare||[]
    };*/
   /* for(let i in config){
        let isArray = typeof config[i]==='object'&&config[i] instanceof Array;
        let isObject = typeof config[i] ==='object'&&!(config[i] instanceof Function);
        if(isArray||isObject){
            /!*
            * 如果是对象
            *   !obj[i] 为真 则是 空 删除这个属性
            * 如果是数组
            *   obj[i].length < 1 则是空 删除这个属性
            * *!/
            let lg = (!config[i]&&config[i].length===undefined)||config[i].length < 1;
            console.log("length：",lg);
            if(lg){
                console.log('删除：',config[i]);
                delete config[i];
            }
        }
    }*/
            window._bd_share_config = obj;
    with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?cdnversion='+~(-new Date()/36e5)];
}


