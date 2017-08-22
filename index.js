var request = require('sync-request');

var authApiUrl = "http://localhost:8080";
var env = process.env.NODE_ENV || "CLOUD";

var customResolver = function (host, url, req) {
    if(env && env === "LOCAL"){
        return;
    }
    console.log("*********");
    console.log("*********");
    console.log("*********");
    console.log("requesting", host + url);


    if (url == "/login" || url.indexOf("/admin") === 0 || url
        == "/logout" || url.indexOf('/register') === 0 || url.indexOf('/auth_public') === 0) {
        console.log('this is a auth service request');
        return authApiUrl + "?continue=" + host;
    }
    try {


        console.log("checking user rights");
        if (req.headers.upgrade || url.indexOf('/socket') === 0) {
            console.log("this is a websocket request don't do auth  ");
            return;
        }

        var res = request('GET', authApiUrl + '/api/user/status?url=' + host, {
            'headers': req.headers, timeout: 2000, maxRetries: 3
        });


        var data = JSON.parse(res.getBody('utf8'));
        console.log(data);

        switch (data.status) {
            case "access_granted" :
                return;
                break;
            case "not_connected":
            default:
                return authApiUrl + "/login";
                break;
            case "no_access_to_farm":
                return authApiUrl + "/login?message=no_acces_to_farm";
                break;

        }
    }
    catch (e) {
        console.error(e);
    }

    console.log("*********");
};

customResolver.priority = 1000;

var proxy = require('redbird')({port: 80, resolvers: [customResolver]});

proxy.register("http://ecf-berlin.predictable.farm", "http://127.0.0.1:4001");
proxy.register("http://ecf-berlin.predictable.farm/automation", "http://127.0.0.1:4002/recipes/");
proxy.register("http://ecf-berlin.predictable.farm/recipes", "http://127.0.0.1:4002/recipes/");
proxy.register("http://ecf-berlin.predictable.farm/socket", "http://127.0.0.1:4003");

proxy.register("http://playground.predictable.farm", "http://127.0.0.1:4007");
proxy.register("http://playground.predictable.farm/recipes", "http://127.0.0.1:4005/recipes/");
proxy.register("http://playground.predictable.farm/socket", "http://127.0.0.1:4006");
