/**
 * Created by Administrator on 2017/7/3.
 */
(function(){

        //加载表情
        $('#say').emoji(
            {
                button: "#btn",
                icons: [
                    {
                        name: "QQ表情",
                        path: '/js/plugin/emoji/img/qq/',
                        maxNum: 104,
                        file: '.gif',
                        placeholder: "#qq_{alias}#",
                        title: {
                            1: "微笑",
                            2: "撇嘴",
                            3: "色",
                            4: "发呆",
                            5: "得意",
                            6: "流泪",
                            7: "害羞",
                            8: "闭嘴",
                            9: "睡",
                            10: "大哭",
                            11: "尴尬",
                            12: "发怒",
                            13: "调皮",
                            14: "龇牙",
                            15: "惊讶",
                            16: "难过",
                            17: "酷",
                            18: "冷汗",
                            19: "抓狂",
                            20: "吐",
                            21: "偷笑",
                            22: "可爱",
                            23: "白眼",
                            24: "傲慢",
                            25: "饥饿",
                            26: "困",
                            27: "惊恐",
                            28: "流汗",
                            29: "憨笑",
                            30: "大兵",
                            31: "奋斗",
                            32: "咒骂",
                            33: "疑问",
                            34: "嘘",
                            35: "晕",
                            36: "折磨",
                            37: "衰",
                            38: "骷髅",
                            39: "敲打",
                            40: "再见",
                            41: "擦汗",
                            42: "抠鼻",
                            43: "鼓掌",
                            44: "糗大了",
                            45: "坏笑",
                            46: "左哼哼",
                            47: "右哼哼",
                            48: "哈欠",
                            49: "鄙视",
                            50: "委屈",
                            51: "快哭了",
                            52: "阴险",
                            53: "亲亲",
                            54: "吓",
                            55: "可怜",
                            56: "眨眼睛",
                            57: "笑哭",
                            58: "doge",
                            59: "泪奔",
                            60: "无奈",
                            61: "托腮",
                            62: "卖萌",
                            63: "斜眼笑",
                            64: "喷血",
                            65: "惊喜",
                            66: "骚扰",
                            67: "小纠结",
                            68: "我最美",
                            69: "啤酒",
                            70: "咖啡",
                            71: "饭",
                            72: "猪",
                            73: "玫瑰",
                            74: "凋谢",
                            75: "示爱",
                            76: "爱心",
                            77: "心碎",
                            78: "蛋糕",
                            79: "闪电",
                            80: "炸弹",
                            81: "刀",
                            82: "菜刀",
                            83: "足球",
                            84: "瓢虫",
                            85: "便便",
                            86: "拥抱",
                            87: "强",
                            88: "弱",
                            89: "握手",
                            90: "胜利",
                            91: "抱拳",
                            92: "勾引",
                            93: "拳头",
                            94: "差劲",
                            95: "爱你",
                            96: "no",
                            97: "ok",
                            98: "跳跳",
                            99: "发抖",
                            100: "怄火",
                            101: "磕头",
                            102: "回头",
                            103: "激动",
                            104: "街舞"
                        }
                    }
                ]
            }
        );

        //webupload多图片上传
        var uploader = WebUploader.create({

            //选完文件后，是否自动上传
            auto: false,

            //swf文件路径
            swf: '../ueditor/third-party/webuploader/Uploader.swf',

            //文件接收服务端
            server: '/multiUpload',

            //选择文件的按钮。可选。
            //内部根据当前运行时创建，可能是input元素，也可能是flash
            pick: '#filePicker',
            fileNumLimit: 9,
            //只允许选择图片文件
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/jpg,image/jpeg,image/png'
            }

        });

        // 当有文件添加进来的时候
        uploader.on( 'fileQueued', function( file ) {
            var $li = $(
                    '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '<div class="func clearfix"><i class="iconfont icon-shanchu delete remove-this"></i></div>' +
                    '<img>' +
                    '<div class="info">' + file.name + '</div>' +
                    '</div>'
                ),
                $list = $(".uploader-list"),
                $img = $li.find('img');


            // $list为容器jQuery实例
            $list.append( $li );

            // 创建缩略图
            // 如果为非图片文件，可以不用调用此方法。
            // thumbnailWidth x thumbnailHeight 为 100 x 100
            uploader.makeThumb( file, function( error, src ) {
                if ( error ) {
                    $img.replaceWith('<span>不能预览</span>');
                    return;
                }

                $img.attr( 'src', src );
            }, "220", "220");

            $li.on('click', '.remove-this', function() {
                uploader.removeFile( file );
                $("#" + file.id).remove();
            });
        });

        // 文件上传过程中创建进度条实时显示。
        uploader.on( 'uploadProgress', function( file, percentage ) {
            debugger;
            var $li = $( '#'+file.id ),
                percent = '',
                $percent = $li.find('.progress span');
            // 避免重复创建
            if ( !$percent.length ) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
            }
            percent = percentage * 100 + '%';
            $percent.css( 'width', percent).find('span').end().text(percent);
        });
            var imgUrls = [],
                isFinished = false;
// 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on( 'uploadSuccess', function( file,response ) {

            var jsonToObject = eval('('+response._raw+')'),
                originUrl = jsonToObject.imgurl,
                newUrl = originUrl.replace(/\\/g,'/'),
                imgstr = '<img src="'+ newUrl +'" alt="" />';
            imgUrls.push(imgstr);

            $( '#'+file.id ).addClass('upload-state-done');
        });

// 文件上传失败，显示上传出错。
        uploader.on( 'uploadError', function( file ) {
            var $li = $( '#'+file.id ),
                $error = $li.find('div.error');

            // 避免重复创建
            if ( !$error.length ) {
                $error = $('<div class="error"></div>').appendTo( $li );
            }

            $error.text('上传失败');
        });

// 完成上传完了，成功或者失败，先删除进度条。
        uploader.on( 'uploadComplete', function( file ) {
          // $( '#'+file.id ).find('.progress').remove();

        });

//全部上传完成时触发关闭弹出层
    uploader.on('uploadFinished', function () {
        isFinished = true;

    });
        $('#declare-say-btn').on('click',function(){
            //up = uploader.upload();
        });

        //点击发表按钮发表说说
        $('#declare-say-btn').on('click',function(){
            //up =
            //说说的内容
            var sayContent = $('#say').html(),
                imgUrlsSrc = '',
                flag = false;
            if($('#fileList').find('img').length > 0){
                    uploader.upload();
                    var loop = setInterval(function(){
                        if(isFinished){
                            imgUrlsSrc = imgUrls.join('');
                            flag = true;
                            clearInterval(loop);
                        }
                    },1000);

            } else {
                flag = true;
            }

            var looptwo = setInterval(function(){
                if(flag){
                    comm.ajax.commAjax({
                        url: '/admin/writesay',
                        type: 'post',
                        data: {
                            content: sayContent,
                            imgs: imgUrlsSrc
                        },
                        successFn: function(data){
                            if(data.status === 1){
                                comm.layer.alert(data.des,function(index){
                                    window.location.replace('/say');
                                });
                            }
                        },
                        errorFn: function(err){
                            comm.layer.alert(err);
                        }
                    });
                    clearInterval(looptwo);
                }
            },2000);
        });
})();
