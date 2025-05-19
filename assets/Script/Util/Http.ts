const { ccclass, property } = cc._decorator;

@ccclass
export default class Http {
    static post(url: string, params: object, onFinished: (err: any, json: any) => void) {
        var xhr = new XMLHttpRequest();
        var _params = "";
        if (params !== null) {
            var count = 0;
            var paramsLength = Object.keys(params).length;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    _params += key + "=" + params[key];
                    if (count < paramsLength - 1) {
                        _params += "&";
                    }
                }
                count++;
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = null;
                    var e = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (ex) {
                        e = ex;
                    }
                    onFinished(e, data);
                } else {
                    onFinished(xhr.status, null);
                }
            }
        };
        xhr.open("POST", encodeURI(url), true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(_params);
    }

    static get(url: string, params: object, onFinished: (err: any, json: any) => void) {
        var xhr = new XMLHttpRequest();
        var _params = "";
        params = params || {};
        // if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
        //     params["pf"] = "ad";
        // } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
        //     params["pf"] = "ios";
        // } else if (!cc.sys.isNative) {
        //     params["pf"] = "web";
        // } else {
        //     params["pf"] = "other";
        // }
        if (params !== null) {
            var count = 0;
            var paramsLength = Object.keys(params).length;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    _params += key + "=" + params[key];
                    if (count++ < paramsLength - 1) {
                        _params += "&";
                    }
                }
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = null;
                    var e = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (ex) {
                        e = ex;
                    }
                    onFinished(e, data);
                } else {
                    onFinished(xhr.status, null);
                }
            }
        };
        xhr.open("GET", encodeURI(url + "?" + _params), true);
        xhr.send();
    }
}
