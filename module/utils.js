/**
 * Created by Administrator on 2017/5/10.
 */
var moment = require('moment');
exports.dateFormat = function (date) {
    return moment(date).format('YYYY-MM-DD hh:mm:ss');
};