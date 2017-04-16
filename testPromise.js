/**
 * Created by Administrator on 2017/4/10.
 */
//1、当查询的数据不相关联，使用Promise.all(arr)
let fn = function(mysql){
    return new Promise(function(a,b){
        sql(mysql,(err,data)=>{
            a(data);
        });
    });
};
let arr = [
    fn('select * from article order by id desc limit 0,10'),
    fn('select * from article where recommend = 1 limit 0,3')
];
Promise.all(arr).then(function(data){
    /*
    * data的数据格式：
    *     data = [
    *           ['第一条sql查询出来的结果'],
    *           ['第二条sql查询出来的结果']
    *     ];
    *
    * */
    console.log(data);
});
//2、查询出来的数据有依赖关系 先把没有依赖的数据提取出来



