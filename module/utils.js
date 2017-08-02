/**
 * Created by Administrator on 2017/5/10.
 */
var moment = require('moment');

var utils = {
    dateFormat: function(date, fmt) {
        return moment(date).format(fmt);
    },
    fromNow: function(date){
        return moment().fromNow();
    }
};

module.exports = utils;
