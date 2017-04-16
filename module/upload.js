/**
 * Created by Administrator on 2017/3/28.
 */
const path = require('path'),
    multer = require('multer');
//上传路径处理  上传之后重命名
let storage = multer.diskStorage({
    //上传路径
    destination: path.join(process.cwd(),'public/image/'),
    filename: function(req,file,callback){
        console.log(file);
        let filename = (file.originalname).split('.');
        callback(null, `${Date.now()}.${filename[filename.length - 1]}`);
    }
});
/*let fileFilter = function(req,file,callback){
    if(file.mimetype === 'image/gif'||file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'){
            callback(null,false);
    }
    else {
        callback(null,false);
    }
};*/
let upload = multer({
    storage: storage,
    limits: {
        //限制上传文件的大小
    }
});
module.exports = upload;