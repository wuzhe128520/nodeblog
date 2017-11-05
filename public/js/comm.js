/**
 * Created by Administrator on 2017/4/21.
 */
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

         //安全整数
         MAX_SAFE_INTEGER: 9007199254740991,

         //判断是不是空对象
         isEmptyObject: function(obj){
             var i = true;

             for(var j in obj){
                  if(obj.hasOwnProperty(j)){
                        i = false;
                        break;
                  }
              }
              return i;
         },

         //判断是不是对象
         isObject: function(value){
             var type = typeof value;

             return !!value&&(type == 'object' || type == 'function');
         },

         //判断是不是类似对象
         isObjectLike: function() {

             return !!value && typeof value == 'object';
         },

         //是否是长度
         isLength: function(value){

             return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= this.MAX_SAFE_INTEGER;
         },

         //判断是不是数组
         isArray: function(){
             var isArray = nativeIsArray || function(value) {
                     return this.isObjectLike(value) && this.isLength(value.length) && comm.type(value) == 'array';
                 };
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
         deepCopy: function(p, c, isDeep){

            var c = c || {};
            for(var i in p){
                if(p.hasOwnProperty(i)){
                    if(typeof p[i] === 'object'){
                        c[i] = (p[i].constructor === Array) ?[]:{};
                        deepCopy(p[i], c[i], true);
                    }else {
                        c[i] = p[i];
                    }
                }
            }
            return c;
          }
     },

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
             var flag = true;
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
             return $.ajax(defaultObj);
         }
     },

      // 弹框插件
    /**
     * options参数说明：
     *   type: 0(信息框) 1(页面层) 2(iframe层) 3(加载层) 4(tip层)
     *   title: 标题
     *   content: 内容
     *      1、content可以传入：1、普通文本或html内容 2、指定dom $('#id')
     *      2、如果是用layer.open执行tips层，则 content: ['内容', '#id'] //数组第二项即吸附元素选择器或者dom
     *    area: 宽高
     *    offset: 坐标
     *    icon: 图标。信息框和加载层的私有参数(alert,msg,load)
     *    btn: 按钮。 信息框模式时，btn默认是一个按钮，其它层类型则默认不显示，加载层和tips则无效。
     *    closeBtn: 关闭按钮，可通过配置1和2来展示，如果不显示，则closeBtn: 0
     *    shade: 遮罩。 默认0.3透明度的黑色背景('#000)。shade: 0 不显示遮罩
     *    tips: tips层的私有参数。支持 上 右 下 左，通过1 - 4进行方向设定。设置颜色 tips: [1,'#c00']
     *    zIndex: 层叠顺序
     *    scrollbar: 是否允许浏览器出现滚动条
     *    resize: 是否允许拉伸
     *    maxmin: 最大 最小化 (只对 页面层 iframe层有效)
     *    fixed: 鼠标滚动时，层是否固定在可视区域。
     *    anim: 弹出动画 0-6
     *    isOutAnim: 关闭动画。设置false 关闭这个动画
     *    move: 触发拖动的元素。默认是触发标题区域拖曳。指定DOM可以单独定义。设置false禁止拖动。
     *    success: 层弹出后的成功回调方法
     *    end: 层销毁后触发的回调
     * layer方法：
     *     layer.ready(): 当你在页面一打开就要执行弹出层时，最好是将弹层放入ready方法中。
     */
    layer: {
          dialog: function(config){
                var defaultObj = {
                    type: config.type,
                    title: config.title,
                    content: config.content,
                    closeBtn: 1,
                    scrollbar: false,
                    area: config.area|['200px','200px']
                };
                if(config.btn&&config.methods){
                    //如果是数组
                    if(comm.type(config.btn === 'array')){
                            defaultObj['btn'] = config.btn;
                            if(comm.type(config.methods) === 'array'){
                                var length = config.btn.length,
                                    methods = config.methods;
                                for(var i =0;i < length; i++){
                                    //如果是第一个按钮，键值为yes
                                    if(i == 0){
                                        defaultObj['yes']  = methods[0];
                                    }
                                    else {
                                        defaultObj['btn'+(i+1)] = methods[i];
                                    }
                                }
                            }
                        }
                }
                $.extend(defaultObj, config);
                return layer.open(defaultObj);
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
         //关闭弹层
        close: function(index) {
               layer.close(index);
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

    //   去除html标签:
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

            var _r = randomNum(min,max),
                _g = randomNum(min,max),
                _b = randomNum(min,max);

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
    scrollToElement: function(id,otherheight){
        var offsetTop = $('#' + id).offset().top;
        if(otherheight&&!isNaN(parseInt(otherheight))){
            offsetTop += otherheight;
        }
        $("html,body").animate({"scrollTop": offsetTop +'px'}, 600);
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

    //window滚动事件
    scrollEvent: function(){
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
        address: window.location.href,
        pathname: window.location.pathname,
        //获取原始的url地址(不带参数)
        getOriginUrl: function(){
            var url = this.address,
                originUrl = url.split('?')[0],
                index = originUrl.lastIndexOf('#');

                if(index !== -1){
                    originUrl = originUrl.substring(0,index);
                }
                return originUrl;
        },

        //获取地址栏最新的url地址
        getCurrentUrl: function(){

            return window.location.href;
        },

        //获取地址栏的请求方法
        getRequestMethod: function(){
            var url =this.pathname,
                method = url.match(/\/\w+\/?/);
            if(method){
                return method[0];
            }
            return '/';
        }
    },

    //分页
    page: {
        /**
         *
         * @param url: 后端分页请求地址
         * @param currentPage: 当前页
         * @param showPageNum: 每页显示条数
         * @param container: 分页组件的父元素id
         * @param pageTmplId: 分页组件模板id
         * @param dataTmplId: 分页数据模板id
         * @param dataId:  分页数据的父元素id
         *
         */
        pagesData: [],
        typeid: null,
        options: {
            url: null,
            container: null,
            pageTmplId: '',
            dataTmplId: '',
            dataId: '',
            postData: {
                currentPage: 1,
                showPageNum: 10
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
        init: function(options,callback){
            var options = $.extend(true,comm.page.options,options);
                this.getPageData(options.url,options.postData,function(pagesData){
                    comm.page.showPageData(comm.page.options.dataId,comm.page.options.dataTmplId,pagesData.data);
                    comm.page.showPage(options,pagesData.pages,comm.page.options.pageTmplId);
                    callback&&callback();
                },function(error){
                   if(error) comm.layer.alert(error);
                });
        },
        //展示分页组件
        showPage: function(options,pages,pageTmplId){
            comm.tmpl.render(pageTmplId, {pages: pages},options.container);
            comm.page.bindPageClick(options.container,options.postData.showPageNum);
        },
        //展示数据
        showPageData: function(articlesId,dataTmplId,articleData){
            comm.tmpl.render(dataTmplId,{data: articleData},articlesId);
        },
        //绑定每一页的点击事件
        bindPageClick: function(container){

            $('#' + container).off('click').on('click','.page',function(e){
                handlePageClick($(this));
            });

            var handlePageClick = function($pageli){
                var nowPage = comm.page.options.postData.currentPage,
                    newPage = parseInt($pageli.data('pagenum'));

                //如果是当前页则不请求新数据
                if(nowPage === newPage){
                    return false;
                }
            comm.page.options.postData.currentPage = newPage;
             var  pagesData = comm.page.getPageData(comm.page.options.url,comm.page.options.postData,function(pagesData){
                  comm.page.showPageData(comm.page.options.dataId,comm.page.options.dataTmplId,pagesData.data);
                  comm.page.showPage(comm.page.options,pagesData.pages,comm.page.options.pageTmplId);
             },function(error){
                 if(error) comm.layer.alert(error);
             });
            }
        },
        //获取分页数据
        /**
         *
         * @param url 后端分页请求地址
         * @param data 传递给后端的数据,对象形式
         */
        getPageData: function(url, postData,fnSuccess,fnError){
            $.when(comm.ajax.commAjax({
                url: url,
                type: 'post',
                data: postData
            })).then(fnSuccess,fnError);
        }
    },

    //正则匹配
    exp: {

        //去除所有空格
        trimAllSpace: function(str){
            return str.replace(/\s/g,"");
        }

    },

    //数组操作
    ary: {

        //根据值删除
        deleteByValue: function(ary, value, isDeleteAll){

            var i = 0,
                length = ary.length;

            for(; i < length; i++){

                if(value === ary[i]){
                    ary.splice(i,1);

                    //是否删除所有跟value一样的值,默认只删除最近的一个
                    if(!isDeleteAll){
                        break;
                    }
                }

            }

            return ary;
        },

        //克隆数组
        cloneAry: function(ary){

            return ary.concat();
        },

        //数组去重
        removeDuplicated: function(ary){

            var noDuplicateAry = [];

            for(var i = 0, j = ary.length; i < j; i++) {
                if(noDuplicateAry.indexOf(ary[i]) === -1){
                    noDuplicateAry.push(ary[i]);
                }
            }

            return noDuplicateAry;
        }

    },

    //模板操作
    tmpl: {
        //渲染模板
        /**
         *
         * @param tmplId: 模板的id
         * @param tmplData: 模板填充的数据,对象形式: { data: dataName}
         * @param appendId: 模板填充数据后，追加到哪个dom下？
         */
        render: function(tmplId, tmplData, appendId){

            //渲染ejs模板
            var template = $('#'+tmplId).html(),
                html = '';

            ejs.delimiter = '$';
            html = ejs.render(template,tmplData);
            if(comm.type(appendId) === 'string'){
                $('#' + appendId).html('').append(html);
            } else if(appendId instanceof $) {
                    appendId.html('').append(html);
            }
        }
    },

    //前端效果
    effect: {

        //倒计时，多少秒之后 做什么
        /**
         *
         * @param targetId: 显示秒
         * @param seconds： 多少秒之后
         * @param callback: 回调函数
         */
        countDown: function(targetId, seconds, callback){

                var target = document.getElementById(targetId),
                    i = seconds,
                    index = 0;

                target.innerHTML = seconds;
                index= setInterval(function(){
                    target.innerHTML = --i;
                    if(i === 1){
                        clearInterval(index);
                        callback&&callback();
                    }
                },1000);
        }
    },
    //上传
    upload:  {

        //预览图片
        previewImg: function(){
            var pic = $('#file').get(0).files[0];
            $('#preview').prop("src", window.URL.createObjectURL(pic));
            return pic;
        },

        //使用html5 单文件ajax上传
        h5AjaxUpload: function(){
            var pic = $('#file').get(0).files[0],
                formData = new FormData(),
                that = this;

            formData.append("file", pic);

            comm.ajax.commAjax({
                url: '/upload',
                type: 'post',
                data: formData,
                processData: false,
                //必须false才会自动加上正确的Content-Type
                contentType: false,
                xhr: function(){
                    var xhr = $.ajaxSettings.xhr();
                    if(xhr.upload){
                        xhr.upload.addEventListener('progress', that.onprogress, false);
                        return xhr;
                    }
                },
                successFn: function(data){
                    if(data.status){
                        $('#imgSrc').val(data.pic);
                    }
                }
            })
        },

        //进度条事件
        onprogress: function(evt) {
            var loaded = evt.loaded, //已经上传大小情况
                total = evt.total,    //附件总大小
                $progress = $('#progress'),
                $progressbar = $('#progressbar'),
                per = Math.round(100 * loaded / total);   //已经上传的百分比
            if($progressbar.is(":hidden")){
                $progressbar.show();
            }
            $progress.html(per + '%').css('width' , per + '%');
           if(per >= 1){
                setTimeout(
                        function(){
                            $progress.html('0%').css('width' , 0);
                            $progressbar.hide();
                        },
                        2000
                    );

            }
        }
    },

    //导航操作
    nav: function(){
        var $navs = $('#nav').find('li>a'),
            method = comm.url.getRequestMethod();
        $navs.each(function(i,nav){
           var $nav = $(nav),
                href = $nav.attr('href');
           if(href === method){
               $nav.parent('li').addClass('actived');
               return false;
           }
        });
    },
    //公用发表评论
    declareComment: function(commentid,content){

    }
};
(function(comm){
    comm.ajax.ajaxComplete(function(event,xhr,settins){
        //将json字符串转为js对象
        var data = JSON.parse(xhr.responseText);
        if(!!data.status && data.status === "nologin"){
            comm.layer.confirm(
                '您还未登录，是否跳转到登录界面？',
                null,
                function(index){
                    comm.layer.close(index);
                    setTimeout(function(){
                        var originalUrl = comm.url.getCurrentUrl();
                        window.location.href = "/login?show=1&returnurl=" + originalUrl;
                    },1000);
                });
        }
    });
    comm.ajax.ajaxStart(function(){});
    comm.ajax.ajaxError(function(event,xhr,options,exc){});
})(comm);
//jquery插件扩展
//提示框
/**
 *
 * @param options: {x: 20,y: 20} 偏移量对象
 */
$.fn.toolTip = function(options){
    var $target = this,
        $toolTip,

        //偏移量
        position = {
            x: 10,
            y: 10
        };
    $.extend(position,options);
    function handleMouseover(event) {
        this.myTitle = this.title;
        this.title = '';
        if($('#tooltip').length > 0){
            $('#tooltip').remove();
        }
        //toolTip的偏移量
        $toolTip = $('<p class="hidden" id="tooltip">' + this.myTitle + '</p>');
        $toolTip.appendTo('body');
        $toolTip.css({
            top:  event.pageY + position.x + 'px',
            left: event.pageX + position.y + 'px'
        }).fadeIn();
    }
    $target.on('mouseover.tooltip', function(event){
            handleMouseover.call(this,event);
        }).on('mousemove.tooltip', function(event){
            $target.off('mouseover.tooltip');
            $toolTip.css({
                top:  event.pageY + position.x + 'px',
                left: event.pageX + position.y + 'px'
            });
        }).on('mouseout.tooltip', function(){
            $target.on('mouseover.tooltip',function(event){
                handleMouseover.call(this,event);
            });
            this.title = this.myTitle;
            $toolTip.remove();
        });
};

//加一效果
$.fn.plusOne = function(){
    var $this = this,
        offset = $this.offset(),
        offsetX = offset.left,
        offsetY = offset.top,
        $plusone = $('<div class="plusone hidden">+1</div>');

    $plusone.css({
        position: 'absolute',
        left: offsetX + $this.outerWidth()/2 + 'px',
        top: offsetY - $plusone.height() - $this.outerHeight()  + 'px',
        color: '#F7AF57'
    }).appendTo('body').fadeIn().
    animate({
        top: offsetY - $plusone.height() - 30 + 'px',
        left: offsetX + 50 + 'px',
        opacity: 0,
        fontSize: '24px'
    },600,function(){
        $plusone.remove();
        $plusone = null;
    });
};


