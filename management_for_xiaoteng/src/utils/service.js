import axios from 'axios';
axios.defaults.baseURL = 'http://39.106.198.9:8080/xiaotengcms';

function GetList (condition, status, page, size, from, to) {
    return axios.post('/useinfo/list', {
        "condition": condition,
        "userStatus": status,
        "page": page,
        "size": size,
        "source": "",
        "registerEnd": to,
        "registerStart": from,
    })
}

function GetUserInfo (userId) {
    return axios.get('/useinfo/useInfo/' + userId)
}

function DownloanContacts (userId) {
    window.open(axios.defaults.baseURL + "/useinfo/downloadContactList/" + userId)
}
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

export { GetList, GetUserInfo, DownloanContacts }