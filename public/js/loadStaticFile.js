/**
 * Created by Administrator on 2017/5/8.
 */
function loadStaticFile (fileSrcs){
    var element,
        //创建文档碎片
        fragment = document.createDocumentFragment();
    if(Object.prototype.toString.call(fileSrcs).toLowerCase() === '[object array]'){

        var i = 0,
            length = fileSrcs.length;
        for(;i < length; i++){
            create(fileSrcs[i]);
        }
    }
    else if(typeof fileSrcs === 'string'){
        create(fileSrcs);
    }
    function create(fileSrc){

        //匹配以.css或.js结尾的文件名
        var regexp = /(\.css|\.js)$/gi,
            extension = null;

        regexp.test(fileSrc);
        extension = RegExp.$1;

        if(extension.indexOf('js') != -1){
            element = document.createElement('script');
            element.type = "text/javascript";
            element.src = fileSrc;
            element.charset = "utf-8";
           /* element.setAttribute('type','text/javascipt')
            element.setAttribute('src',fileSrc);*/
            element.onload = element.onreadystatechange = function(){
                if(!this.readyState||this.readyState == 'loaded'||this.readyState == 'complete'){
                    console.log(fileSrc + '加载成功');
                }
                console.log(this);
                this.onload = this.onreadystatechange = null;
            };
            element.onerror = function(){
                console.log('加载js出错');
            }
        }
        else if(extension.lastIndexOf('css') != -1) {
            element = document.createElement('link');
            element.setAttribute('rel','stylesheet');
            element.setAttribute('href',fileSrc);
        }
        fragment.appendChild(element);
    }
    document.getElementsByTagName('head')[0].appendChild(fragment);
}


