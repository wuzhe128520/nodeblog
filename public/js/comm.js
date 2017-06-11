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
     //判断数据类型
     judge: {
         //判断是不是空对象
         isEmptyObject: function(obj){
             var i = true;

             for(var i in obj){
                  if(obj.hasOwnProperty(i)){
                        i = false;
                        break;
                  }
              }
              return i;
         }
     },
     //继承，复制对象
     extend: {
         /**
          *
          * @param p 父对象
          * @param c 子对象(不填默认为{})
          * @returns 返回一个和父对象一样结构的对象
          */
         //深拷贝对象
         deepCopy: function(p, c){

            var c = c || {};
            for(let i in p){
                if(p.hasOwnProperty(i)){
                    if(typeof p[i] === 'object'){
                        c[i] = (p[i].constructor === Array) ?[]:{};
                        deepCopy(p[i], c[i]);
                    }else {
                        c[i] = p[i];
                    }
                }

            }
            return c;
        }
     },
     //随机数
    //产生min到max之间的随机数(包含min，不包含max)
    randomNum: function(min, max) {
        if(max < min) return;

        return Math.floor(Math.random()*(max - min) + min);
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
         commAjax: function(config){
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
             if(config){
                 $.extend(defaultObj, config);
             }
             console.log(defaultObj);
             $.ajax(defaultObj);
         }
     },
     /**
      * 弹框插件
      *
      *
      * */
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

          //普通信息框
          alert: function(content,options,yesCallback){
              layer.alert(content,options,yesCallback);
          },

          //询问框
          confirm: function(content,options,yesFn,cancelFn) {
              layer.confirm(content,options,yesFn,cancelFn);
          },
          //提示框
          msg: function(content,options,endCallback) {
              layer.msg(content,options,endCallback);
         },

         //tips层
         tips: function(content,follow,options) {
              layer.tips(content,follow,options);
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
     /*
      *   去除html标签:
      *
     */
     escapeHTML: function(str){
        return str.replace(/<[\/\!]*[^<>]*>/ig,"");
     },
    /**
     * canvas验证码
     * id: 目标元素
     * num: 生成的验证码有几个数字或文字
     */
     validateCode: function(id,num) {

        //canvas的id
        var $canvas = $('#'+id),

            //验证码的文字库
            letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',0,1,2,3,4,5,6,7,8,9],
            lettersLength = letters.length,

            //保存验证码的内容
            codeContent = '123';

        //生成的验证码的宽高
        pic_width = $canvas.width(),
            pic_height = $canvas.height();


        //随机数
        function randomNum(min,max){
            return Math.floor(Math.random()*(max-min)+min);
        }

        //随机颜色
        function randomColor(min,max){

            var _r = randomNum(min,max);
            var _g = randomNum(min,max);
            var _b = randomNum(min,max);

            return "rgb("+_r+","+_g+","+_b+")";
        }

        //画图片
        function drawValidate() {

            //getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。
            ctx = $canvas.get(0).getContext("2d");

            //textBaseline 属性设置或返回在绘制文本时的当前文本基线。
            ctx.textBaseline = "bottom";

            //fillStyle 属性设置或返回用于填充绘画的颜色、渐变或模式。
            ctx.fillStyle = randomColor(180,240);

            //fillRect() 方法绘制“已填色”的矩形。默认的填充颜色是黑色。
            /**
             * context.fillRect(x,y,width,height);
             *  x: 矩形左上角的x坐标
             *  y: 矩形左上角的y坐标
             *  width: 矩形的宽度，以像素计
             *  height: 矩形的高度，以像素计
             *
             */
            ctx.fillRect(0,0,pic_width,pic_height);

            //将验证码数据给validateCode函数的变量codeContent
            codeContent = drawLetter(ctx);
            drawLine(ctx);
            drawCircle(ctx);
        }

        //画文字
        function drawLetter(ctx) {
            var code = '';
            for(var i=0; i<num; i++){

                var x = (pic_width-10)/num*i+10,
                    y = randomNum(pic_height/2,pic_height),
                    deg = randomNum(-45,45),
                    txt = letters[randomNum(0,lettersLength)],
                    code = code+ txt;
                console.log(txt);
                console.log(codeContent);
                ctx.fillStyle = randomColor(10,100);

                //font 属性设置或返回画布上文本内容的当前字体属性。
                ctx.font = randomNum(16,40)+"px SimHei";

                //translate() 方法重新映射画布上的 (0,0) 位置。
                ctx.translate(x,y);

                /**
                 * rotate(angle) 方法旋转当前的绘图。(旋转角度，以弧度计。
                 * 如需将角度转换为弧度，请使用 degrees*Math.PI/180 公式进行计算)
                 */
                ctx.rotate(deg*Math.PI/180);

                //fillText() 方法在画布上绘制填色的文本。文本的默认颜色是黑色。
                ctx.fillText(txt, 0,0);
                ctx.rotate(-deg*Math.PI/180);
                ctx.translate(-x,-y);
            }
            console.log("code:"+code);
            return code;
        }

        //画线条
        function drawLine(ctx) {

            for(var i=0; i<num; i++){

                //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式。
                ctx.strokeStyle = randomColor(90,180);

                /**
                 * beginPath() 方法开始一条路径，或重置当前的路径。
                 * 提示：请使用这些方法来创建路径：moveTo()、lineTo()、quadricCurveTo()、bezierCurveTo()、
                 * arcTo() 以及 arc()。
                 * 提示：请使用 stroke() 方法在画布上绘制确切的路径。
                 */
                ctx.beginPath();

                /*
                 moveTo() 方法将当前位置设置为 (x, y) 并用它作为第一点创建一条新的子路径。
                 如果之前有一条子路径并且它包含刚才的那一点，那么从路径中删除该子路径。
                 */
                ctx.moveTo(randomNum(0,pic_width), randomNum(0,pic_height));

                //lineTo() 方法为当前子路径添加一条直线。
                ctx.lineTo(randomNum(0,pic_width), randomNum(0,pic_height));

                /*
                 * stroke() 方法绘制当前路径的边框。路径定义的几何线条产生了，但线条的可视化取决于
                 * strokeStyle、lineWidth、lineJoin、lineCap 和 miterLimit 等属性。
                 * 术语“勾勒”，指的是钢笔或笔刷的画笔。它意味着“画......轮廓”。
                 * 和 stroke() 方法相对的是 fill()，该方法会填充路径的内部区域而不是勾勒出路径的边框。
                 * */
                ctx.stroke();
            }

        }

        //画圆点
        function drawCircle(ctx) {

            for(var i=0; i < num*10; i++){

                ctx.fillStyle = randomColor(0,255);
                ctx.beginPath();

                /*
                 arc() 方法创建弧/曲线（用于创建圆或部分圆）。
                 提示：如需通过 arc() 来创建圆，请把起始角设置为 0，结束角设置为 2*Math.PI。
                 */
                ctx.arc(randomNum(0,pic_width),randomNum(0,pic_height), 1, 0, 2*Math.PI);

                /*
                 * fill() 方法填充路径。
                 *
                 * */
                ctx.fill();
            }

        }

        //处理点击验证码的事件
        function handleClick(e) {

            e.preventDefault();
            e.stopPropagation();
            drawValidate();

        }

        $($canvas).on('click',handleClick).triggerHandler('click');

        return {

            //获取验证码的内容
            getContent: function() {

                return codeContent.toLowerCase();
            },
            //获取新的验证码
            getNewCode: function() {
                $($canvas).trigger('click');
            }
        }

    },
    scrollEvent: function(){
        console.log($(this).scrollTop());
        var $target = $(this);
        if($target.scrollTop() > 150){
            $("#scrollTop").fadeIn();
        }
        else {
            $("#scrollTop").fadeOut();
        }
    },
    //绑定全局的滚动事件
    scroll: function(){
        $(window).bind("scroll.scrollTop",comm.debounce(comm.scrollEvent,300));
    },
    //滚动到顶部。(在滚动到顶部的时候会触发全局的滚动事件)-
    scrollToTop: function(){
        $(window).unbind("scroll.scrollTop");
        $("html,body").animate({"scrollTop": 0}, 600);
        $("#scrollTop").animate({"bottom": "3000px"},600,function(){
            $(this).hide().css({"bottom": "2em"});
            $(window).bind("scroll.scrollTop",comm.debounce(comm.scrollEvent,300));
        });
    },
    //返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后.
    debounce: function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = comm.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = comm.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    },
    now: Date.now || function() {
        return new Date().getTime();
    },
    //创建并返回一个像节流阀一样的函数，当重复调用函数的时候，最多每隔 wait毫秒调用一次该函数。
    throttle: function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = comm.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    },
    scrollEvent: function(){
        console.log($(this).scrollTop());
        var $target = $(this);
        if($target.scrollTop() > 150){
            $("#scrollTop").fadeIn();
        }
        else {
            $("#scrollTop").fadeOut();
        }
    },
    //绑定全局的滚动事件
    scroll: function(){
        $(window).bind("scroll.scrollTop",comm.debounce(comm.scrollEvent,300));
    },
    //滚动到顶部。(在滚动到顶部的时候会触发全局的滚动事件)-
    scrollToTop: function(){
        $(window).unbind("scroll.scrollTop");
        $("html,body").animate({"scrollTop": 0}, 600);
        $("#scrollTop").animate({"bottom": "3000px"},600,function(){
            $(this).hide().css({"bottom": "2em"});
            $(window).bind("scroll.scrollTop",comm.debounce(comm.scrollEvent,300));
        });
    },
    //返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait 毫秒之后.
    debounce: function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = comm.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = comm.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    },
    now: Date.now || function() {
        return new Date().getTime();
    },
    //创建并返回一个像节流阀一样的函数，当重复调用函数的时候，最多每隔 wait毫秒调用一次该函数。
    throttle: function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : comm.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = comm.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    },

    //添加水印
    waterMark: function() {
        var $waterMark = $("#waterMark"),
            $query = $("#query");
        if($waterMark.length > 0){
            return false;
        }
        var $water = $("input.js_water_mark"),
            target = {},
            offSet = $water.offset();
        target.x = offSet.left;
        target.y = offSet.top;
        target.outerWidth = $water.outerWidth();
        target.outerHeight = $water.outerHeight();
        $water.attr("placeholder","");

        $("<label style='color: red;font-size: 14px;' id='waterMark'>请输入关键字!</label>").
        css({"position":"absolute","paddingLeft": "3px","left": target.x,"top": target.y,"height": target.outerHeight,"width": target.outerWidth,"lineHeight": target.outerHeight + "px"})
            .appendTo("body");

        $waterMark.click(function(){
            $(this).remove();
            $query.attr("placeholder","搜索").removeClass("search-error");
            $query.focus();
        });
    },
    //url相关
    url: {
        getOriginUrl: function(){
            var url = window.location.href,
                originUrl = url.split('?')[0],
                index = originUrl.lastIndexOf('#');

                if(index !== -1){
                    originUrl = originUrl.substring(0,index);
                }
                return originUrl;
        }
    },
    //分页
    page: {
        /**
         *
         * @param url: 后端分页请求地址
         * @param currentPage: 当前页
         * @param showPageNum: 每页显示条数
         * @param $container: 分页组件的父元素(jQuery对象)
         * @param pageTmplId: 分页组件模板id
         * @param dataTmplId: 分页数据模板id
         * @param dataId:  分页数据的父元素id
         *
         */
        pagesData: [],
        typeid: null,
        options: {
            url: null,
            $container: null,
            pageTmplId: '',
            dataTmplId: '',
            dataId: '',
            postData: {
                currentPage: 1,
                showPageNum: 5,
            }
        },
        //显示分页组件
        /**
         *
         * @param templateUrl: 模板的地址
         * @param pageId： 显示分页组件的父元素id
         * @param data:  分页组件的数据
         *  url: '../../views/pages.ejs'
         */
        init: function(options){

            var options = $.extend(comm.page.options,options,true),
                pagesData = this.getPageData(options.url,options.postData);

             comm.page.showPageData(comm.page.options.dataId,comm.page.options.dataTmplId,pagesData.data);
             comm.page.showPage(options,pagesData.pages,comm.page.options.pageTmplId);

        },
        showPage: function(options,pages,pageTmplId){

            options.$container.html('');
            debugger;
            var html = comm.page.render(pageTmplId,{pages: pages});
            options.$container.append(html);
            comm.page.bindPageClick(options.$container,options.postData.showPageNum);
        },
        //展示数据
        showPageData: function(articlesId,dataTmplId,articleData){

            $('#'+ articlesId).html('');
            var html = comm.page.render(dataTmplId,{data: articleData});
            $('#'+ articlesId).append(html);

        },
        /**
         *
         * @param tmplId
         * @param tmplData 键值对 {pages: }
         * @returns {string}
         */
        render: function(tmplId, tmplData){

            //渲染ejs模板
            var template = $('#'+tmplId).html(),
                html = '';

            ejs.delimiter = '$';
            html = ejs.render(template,tmplData);
            return html;
        },

        bindPageClick: function($container){

            $container.off('click').on('click','.page',function(e){

                handlePageClick($(this));

            });

            var handlePageClick = function($pageli){
            debugger;
            comm.page.options.postData.currentPage = parseInt($pageli.children().text());
            console.log(comm.page.options);
             var  pagesData = comm.page.getPageData(comm.page.options.url,comm.page.options.postData);
                comm.page.showPageData(comm.page.options.dataId,comm.page.options.dataTmplId,pagesData.data)
                comm.page.showPage(comm.page.options,pagesData.pages,comm.page.options.pageTmplId);
                comm.scrollToTop();
            }
        },
        //获取分页数据
        /**
         *
         * @param url 后端分页请求地址
         * @param data 传递给后端的数据,对象形式
         */
        getPageData: function(url, postData){
           debugger;
            var pagesData = null;

            comm.ajax.commAjax({
                url: url,
                async: false,
                type: 'post',
                data: postData,
                successFn: function(data){
                    debugger;
                    console.log('打印data：');
                    console.log(data);
                    pagesData = data;

                },
                errorFn: function(err){
                    console.log(err);
                }
            });

            comm.page.pagesData = pagesData;
            return pagesData;


        }

    }
};


