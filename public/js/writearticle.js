/**
 * Created by Administrator on 2017/6/24.
 */
(function(){
    var ue = UE.getEditor('editor'),

        //存储已经有的标签文本
        storeTag = [],
        newTag = [];
    //getTypes();
    $('#tagInput').on('blur', function(e){
        var $target = $(this);

        handleBlurEvent($target, $.trim($target.val()));
    });

    $('#tagInput').on('focus', function(e){

        handleFocusEvent($(this),e);
    });

    $('#addTypeLink').on('click', function(e){
        openAddTypeDialog();
    });

    //生成标签对象
    function createTag(tagTitle) {

        var $span = $('<span></span>');
        $span.text(tagTitle);

        return $span;
    }

    //显示标签(同时给input设置向左的padding)
    function showTag(containerId,$spans) {
        $('#' + containerId).empty().append($spans);
        setInputPadding();
        //给每个标签绑定删除事件
        //给每个标签绑定点击事件 删除自己
        $('#addTag').off('click').on('click','span',function(){
            handleClickEvent($(this));
        });
    }

    //设置input的左填充
    function setInputPadding(){
        $('#tagInput').css('paddingLeft',$('#addTag').width());
    }

    //删除存储标签数组里指定值
    function deleteTagByValue(ary, value) {

        return comm.ary.deleteByValue(ary,value);
    }

    //连接tag字符串 inputValAry：input输入的值(数组)
    function pushTag(inputValAry) {

        var  i = 0,
            length = storeTag.length,
            j = 0,
            jLength = inputValAry.length,

            //新添加的标签是否已经存在了,true表示已存在
            flag = true;

        if(length >= 5 || jLength < 1){

            return false;

        }

        if(length + jLength > 5){
            jLength = 5 - length;

            //将多余的标签放入giveup里，然后取消勾选
            var giveup = inputValAry.slice(jLength - 1);
            debugger;
            for(var g = 0, l = giveup.length; g < l; g++){
                cancelChecked(giveup[g]);
            }
        }

        for(;j < jLength; j++){

            var spanStr = comm.exp.trimAllSpace(inputValAry[j]);

            //如果字符串不为空
            if(!!spanStr&&"," !== spanStr){

                //如果新添加标签不存在于已有的数组里，才添加。
                if(storeTag.indexOf(spanStr) === -1){

                    storeTag.push(spanStr);
                    flag = false;
                }
            }
        }
        return flag;
    }

    //生成标签的字符串
    function createTagStr(){

        var i = 0,
            $spans = "",
            length = storeTag.length;

        for(; i < length; i++){

            var $span = createTag(storeTag[i]);
            $spans += $span.prop('outerHTML');

        }
        showTag('addTag',$spans);
    }

    //同时删除标签dom和标签数组里的数据
    function del() {
        var delObj = deleteTag();
        if(delObj){
            storeTag = deleteTagByValue(storeTag, delObj.text());
        }
    }

    //清除标签dom
    function deleteTag(valueStr) {

        var $spans = $('#addTag').find('span'),
            i = 0,
            $delObj = null,
            length = $spans.length;
        if(typeof valueStr === "string"){
            for(; i < length; i++){
                var $currentSpan = $spans.eq(i);
                if($currentSpan.text() === valueStr) {
                    $delObj = $currentSpan;
                    $delObj.remove();
                    break;
                }
            }
        } else {
            if(length > 0){
                $delObj = $spans.eq(length -1);
                $delObj.remove();
                setInputPadding();
            }
        }
        if(!!$delObj){
            cancelChecked($delObj.text());
        }
        return $delObj;
    }

    //当勾选的tag被移除后，取消勾选状态
    function cancelChecked (tagStr){

        var $inputs = $('#hasTag').find('input:checked');
        debugger;
        $inputs.each(function(i, current){
            var $label = $(this).siblings('label'),
                inputText = $label.text();

            if(tagStr === inputText){
                $(this).get(0).checked = false;
                return false;
            }
        });
    }

    //显示已经有的标签,绑定checkbox的事件
    function showHasTags() {

        var $target = $('#hasTag');
        // choosedTag = [];
        if($target.is(":hidden")){
            $target.show();
            $target.off('click').on('change',"input[type='checkbox']",function(){
                var $this = $(this),
                    tagTitle = $this.siblings('label').eq(0).text(),
                    checked = this.checked;

                //如果选中，同时选择的个数不超过5个，则创建标签
                debugger;
                if(checked){

                    if(limitSelectNum()){
                        var isSelected = pushTag([tagTitle]);

                        //如果添加了新标签到数组，则创建新标签
                        if(!isSelected) {
                            createTagStr();
                        }
                    } else {
                        this.checked = false;
                    }

                } else{
                    //删除标签数据
                    storeTag = deleteTagByValue(storeTag, tagTitle);

                    //移除标签的显示
                    deleteTag(tagTitle);

                    setInputPadding();
                }
            });
        }
    }

    //处理input的blur事件
    function handleBlurEvent($target, inputVal) {

        var inputValAry = null,
            $spans = null;

        //先清除掉input绑定的keyup事件
        $target.off('keyup');

        if(!inputVal){
            return false;
        }

        //首先把中文的逗号，转换为英文的逗号,将多余的逗号去除(包括头尾的)
        inputVal = inputVal.replace(/，/g,',').replace(/,{2,}/g,',').replace(/(^\s*)|(\s*$)/g,"");
        inputValAry = inputVal.split(',');

        //数组去重
        inputValAry = comm.ary.removeDuplicated(inputValAry);
        pushTag(inputValAry);
        createTagStr();
        $target.val('');
    }

    //处理input的focus事件
    function handleFocusEvent($target,event) {

        //记录input值的长度
        var inputVal = $target.val();

        //给input绑定退格 事件(删除离光标最近的标签)
        $target.off('keyup').on('keyup', function(event){

            //如果值为空
            if(inputVal.length === 0){

                //如果input为空，按键是退格键，则直接删除tag
                if(event.keyCode === 8 ){
                    del();
                }
            }

            inputVal =  $.trim($target.val());
        });

        //显示已经有的标签
        showHasTags();

    }

    //处理标签的点击事件
    function handleClickEvent($target) {
        $target.remove();
        storeTag = deleteTagByValue(storeTag, $target.text());
        setInputPadding();
    }

    //限制checkbox选择的个数,最多5个
    function limitSelectNum() {
        debugger;
        var checkedNum = $('#hasTag').find("input[type='checkbox']:checked").length ,
            newTagNum = getNewTag().length + 1;

        return newTagNum + checkedNum > 5 ? false : true;
    }

    //获取新添加的标签
    function getNewTag() {
        debugger;
        var oldTag = getOldTag(),
            i = 0,
            allTag = comm.ary.cloneAry(storeTag),
            length = oldTag.length;

        for(; i < length; i++) {
            var index = allTag.indexOf(oldTag[i]);
            allTag.splice(index, 1);
        }

        return allTag;
    }

    //获取已选择的旧标签ids
    function getOldTagIds() {

        //获取已选择的checkbox
        var $checkedInputs = $('#hasTag').find('input:checked'),
            oldTag = [];
        $checkedInputs.each(function(index,current){

            oldTag.push(parseInt($(this).data('tagid')));
        });
        return oldTag;
    }

    //获取已选择的旧标签
    function getOldTag() {
        debugger;
        //获取已选择的checkbox
        var $checkedInputs = $('#hasTag').find('input:checked'),
            oldTag = [];
        $checkedInputs.each(function(index,current){

            oldTag.push($(this).siblings('label').eq(0).text());
        });
        return oldTag;
    }

    //弹出添加分类框
    function openAddTypeDialog() {
        comm.layer.dialog({
            type: 1,
            area: ['200px','200px'],
            title: '添加分类',
            content: $('#addType').html(),
            btn: ['添加','取消'],
            methods: [function(index){
                var isPassed = validateType();
                if(isPassed){
                    var typename = $.trim($('#addTypeWrap').find('.js_addtype_input').eq(0).val());
                    comm.layer.close(index);
                    addType(typename);
                }
            },function(index){}],
            move: false,
            closeBtn: 0
        });
    }

    //验证类别input是否为空
    function validateType() {
        var $input = $('#addTypeWrap').find('.type-input').eq(0),
            inputVal = $input.val(),
            length = inputVal.length,
            newInputValue = $.trim(inputVal);

        $input.val(newInputValue);
        if(!newInputValue){
            $('.errTip').text('类别不能为空').show();
            $input.focus();
            return false;
        }

        if(!(length > 0 && length <= 10)){
            $('.errTip').text('长度不能大于10').show();
            return false;
        }
        if(!$('.errTip').is(":hidden")){
            $('.errTip').hide();
        }

        return true;
    }

    //提交添加分类的 ajax 请求
    function addType(typename) {

        comm.ajax.commAjax({
            url: '/admin/addtype',
            type: 'post',
            data: {
                typename: typename
            },
            successFn: function(data){
                if(data.status){
                    getTypes();
                    comm.layer.msg(data.des);
                }

            },
            errorFn: function(err){
                comm.layer.alert(err);
            }

        });

    }


    //ajax获取分类信息
    function getTypes() {

        comm.ajax.commAjax({
            url: '/admin/gettypes',
            successFn: function(types){
                if(types) {
                    comm.tmpl.render('addTypeTmpl', {types: types}, "hastype");
                }
            },
            errorFn: function(err){
                comm.layer.msg('查询分类失败' + err);
            }
        });
    }


    //提交数据
    $('#declare').on('click', function(e){
        debugger;
        var content = ue.getContent(),
            summery = ue.getContentTxt(),
            imgSrc = $('#imgSrc').val().replace(/\\/g,'/'),
            newTags = getNewTag(),
            oldTagIds = getOldTagIds();

        console.log(newTags,oldTagIds);
        e.preventDefault();
       /* $("#summery").val(summery);
        $(".content").val(content);
        $('#newTags').val(newTags.join(','));
        $('#oldTagIds').val(oldTagIds.join(','));*/

        comm.ajax.commAjax({
            url: '/admin/article',
            type: 'post',
            data: {
                title: $('#title').val(),
                newTags: newTags.join(','),
                oldTagIds: oldTagIds.join(','),
                type: $('#hastype').find('input:checked').eq(0).val(),
                author: $('#author').val(),
                summery: summery,
                content: content,
                imgSrc: imgSrc
            },
            successFn: function(data) {
                if(data.status){
                    $(".admin-success").show();
                    comm.effect.countDown('seconds',3,function(){
                            window.location.href = '/article-detail/' + data.insertId + '.html';
                    });
                } else {
                    comm.layer.msg('发表文章失败！');
                }
            }
        })

        //$("#form").submit();
    });
    //选择文件
   $("#chooseFile").click(function(){
        $('#file').click();
    });
})();
    /*
     *绑定input的事件
     *   点击 backspace 的事件(删除标签)
     *  离开焦点事件(将输入框的文字转换为 一个个的标签)
     *
     * */
    /*
     生成标签
     创建span标签并追加到addTag容器中
     为每一个创造的标签绑定 删除事件
     */
    /*
     *  保存标签对应的 标签id
     * */


