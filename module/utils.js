/**
 * Created by Administrator on 2017/5/10.
 */
var moment = require('moment');
exports.dateFormat = function (date,fmt) {
    return moment(date).format(fmt);
};