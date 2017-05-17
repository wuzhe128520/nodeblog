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
        //通过路径来获取文件的后缀名
        //匹配以.css或.js结尾的文件
        var regexp = /(\.css|\.js)$/gi;
        regexp.test(fileSrc);
        console.log(RegExp.$1);
        var extension = RegExp.$1;
        if(extension.indexOf('js')!= -1){
            element = document.createElement('script');
            element.setAttribute('type','text/javascipt')
            element.setAttribute('src',fileSrc);
        }
        else if(extension.lastIndexOf('css')!= -1) {
            element = document.createElement('link');
            element.setAttribute('rel','stylesheet');
            element.setAttribute('href',fileSrc);
        }
        fragment.appendChild(element);
    }
    document.getElementsByTagName('head')[0].appendChild(fragment);
}
