/**
 *
 * 使用到的插件说明：
 *     gulp-load-plugins: ;
 *     gulp-less: 编译less
 *     browser-sync: 自动注入代码，无需刷新浏览器
 *     gulp-changed: 只让修改过的文件通过管道
 *     gulp-jscs: 检查js代码风格
 *     gulp-watch: 只编译修改的文件
 *     gulp-concat: 合并文件
 *     gulp-jshint: js语法检查(在安装这个插件之前，需要先安装jshint,之后记得把package.json里的jshint依赖删除,否则会报错)
 *     gulp-minify-css: css代码压缩 //建议使用最新版：gulp-clean-css
 *     gulp-uglify: js代码压缩
 *     gulp-minify-html: html页面压缩
 *     gulp-rename: 文件重命名
 *     gulp-css-spriter: 生成雪碧图
 * gulp静态资源文件版本管理：
 *     gulp-rev  //更改版本号
 *     gulp-clean  //清空文件夹
 *     gulp-useref //把html里零碎的引入合并成一个文件，但是它不负责代码压缩
 *     gulp-rev-replace//配合 gulp-rev 使用，拿到生成的 manifest.json 后替换对应的文件名称。
 *     gulp-rev-collector //替换html中的引用路径
 */
var gulp = require("gulp"),
     plugins = require("gulp-load-plugins")({
         pattern: '*' //让gulp-load-plugins插件能匹配除了gulp插件之外的其他插件
     }),
    path = {
        HTML : "html/*.html",
        HTMLDIR: "html",
        LESS : "public/less/*.less",
        LESSDIR: "public/less",
        CSSDIR : "public/css",
        CSS: "public/css/*.css",
        JSDIR: "public/js",
        JS : "public/js/*.js"
    };
//确保数组里面的任务完成之后，再运行serve任务
gulp.task("serve", ["less", "js-watch", "html","css"], function() {
    plugins.browserSync.init({
        server : "./"
    });
    gulp.watch(path.LESS, ["less"]); //监听哪个目录的任务
    gulp.watch(path.JS, ["js-watch"]);
    gulp.watch(path.HTML, ["html"]);
    gulp.watch(path.CSS, ["css"]);
});

//编译less
gulp.task("less", function() {
    gulp.src(path.LESS)
        .pipe(plugins.watch(path.LESS)) //只重新编译被更改过的文件
        .pipe(plugins.less())
        .pipe(gulp.dest(path.CSSDIR))
        .pipe(plugins.browserSync.stream());
});
//监控css文件变化
gulp.task("css", function() {
    gulp.src(path.CSS)
        .pipe(plugins.changed(path.CSSDIR))
        .pipe(plugins.browserSync.stream());

});
//监控js文件变化
gulp.task("js-watch", function() {
    gulp.src(path.JS)
        .pipe(plugins.changed(path.JSDIR))
        .pipe(plugins.browserSync.stream());
});
//监控html变化
gulp.task("html", function() {
    gulp.src(path.HTML)
        .pipe(plugins.changed("*.html"))
        .pipe(plugins.browserSync.stream());
});
//js代码检查
gulp.task('jshint', function () {
    gulp.src('public/js/*.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter()); // 输出检查结果
});
//js代码压缩
gulp.task('minify-js', function () {
    gulp.src('public/js/*.js') // 要压缩的js文件
        .pipe(plugins.uglify())  //使用uglify进行压缩,更多配置请参考：
        .pipe(gulp.dest('dist/js')); //压缩后的路径
});
//css文件压缩
gulp.task('minify-css', function () {
    gulp.src('css/*.css') // 要压缩的css文件
        .pipe(plugins.cleanCss()) //压缩css
        .pipe(gulp.dest('dist/css'));
});
//html文件压缩
gulp.task('minify-html', function () {
    gulp.src('html/*.html') // 要压缩的html文件
        .pipe(plugins.minifyHtml()) //压缩
        .pipe(gulp.dest('dist/html'));
});
//文件合并
gulp.task('concat', function () {
    gulp.src('public/js/*.js')  //要合并的文件
        .pipe(plugins.concat('all.js'))  // 合并匹配到的js文件并命名为 "all.js"
        .pipe(gulp.dest('dist/js'));
});
//重命名
/*gulp.task('rename', function () {
 gulp.src('js/jquery.js')
 .pipe(uglify())  //压缩
 .pipe(rename('jquery.min.js')) //会将jquery.js重命名为jquery.min.js
 .pipe(gulp.dest('js'));
 //关于gulp-rename的更多强大的用法请参考https://www.npmjs.com/package/gulp-rename
 });*/
//gulp自动生成css雪碧图

gulp.task("css-sprite",function(){
    return gulp.src("less/sprite.less") //需要使用css sprite的样式表
        .pipe(plugins.cssSpriter({
            /*
             includeMode默认值为implicit：
             则要在不需要用css sprite代替的background(background-image)样式之前加上声明：
             \/* @meta {"spritesheet": {"include": false}} *\/
             (这里的\是在编辑器里的转义，防止编辑器报错，实际在写的时候应该去掉)
             可选值：explicit
             则要在需要用css sprite代替的background(background-image)样式之前声明：
             \/* @meta {"spritesheet": {"include": true}} *\/

             */
            includeMode: "implicit",
            //雪碧图自动合成的图
            "spriteSheet": "image/sprite.png",
            //css引用的图片路径
            "pathToSpriteSheetFromCSS": "../image/sprite.png"

        }))
        .pipe(gulp.dest(path.LESSDIR));//输出编译后的less到css里
});
/*
 *    clean = require('gulp-clean');  //清空文件夹
 *    rev = require('gulp-rev'),                      //更改版本号
 *    revCollector = require('gulp-rev-collector'),   //gulp-rev的插件，用于html模板更改引用路径
 *
 *
 * */
/* gulp静态资源文件版本管理 begin */

//清空文件夹，避免资源冗余
gulp.task('clean',function(){
    return gulp.src('dist',{read:false}).pipe(plugins.clean());
});

//css文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出来
gulp.task('versioncss',function(){
    return gulp.src(['public/css/*.css','public/font/*.css'])
        //.pipe(plugins.concat('wap.min.css') )
        .pipe(plugins.minifyCss())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/css/'))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest('dist/rev/css'));
});

//js文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出
gulp.task('versionjs',function(){
    return gulp.src('public/js/*.js')
        //.pipe(plugins.concat('wap.min.js') )
        .pipe(plugins.jshint())
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest('dist/js/'))
        .pipe(plugins.rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('dist/rev/js'))
});

//通过hash来精确定位到html模板中需要更改的部分,然后将修改成功的文件生成到指定目录
gulp.task('rev',function(){
    return gulp.src(['dist/rev/**/*.json','views/**/*.ejs'])
        .pipe( plugins.revCollector({
            replaceReved: true
        }) )
        .pipe(gulp.dest('dist/views/'));
});

//合并html页面内引用的静态资源文件
gulp.task('versionhtml', function () {
    return gulp.src('views/**/*.ejs')
        .pipe(plugins.useref())
        .pipe(plugins.rev())
        .pipe(plugins.revReplace())
        .pipe(gulp.dest('dist/views/'));
});
/*
 gulp静态资源文件版本管理任务执行顺序：
 gulp clean //清空文件夹，避免资源冗余
 gulp versioncss //css文件压缩，更改版本号，
 //并通过rev.manifest将对应的版本号用json表示出来
 gulp versionjs  //同上
 gulp rev        //通过hash来精确定位到html模板中需要更改的部分，然后将修改成功的文件生成到指定目录
 gulp versionhtml //合并html页面的静态资源
 */

/* gulp静态资源文件版本管理 end */
gulp.task("default", ["serve"]);

