var request = require('sync-request');


var http = "http://";
var authApiUrlPort = ":8080";
//var authApiUrl = "http://18.195.118.148:8080";
var env = "CLOUD";

var customResolver = function (host, url, req) {
    if(env && env === "LOCAL"){
        return;
    }
    console.log("");
    console.log("");
    console.log("Custom resolver");
    console.log("");
    console.log("requesting", host + url);


   if ( (url.indexOf("recipes") > -1) 
        || (url.indexOf("login") > -1) 
        || (url.indexOf("auth_public") > -1) 
        || (url.indexOf("admin") > -1) 
        || (url.indexOf("logout") > -1) 
        || (url.indexOf("register") > -1) 
        || (url.indexOf("auth_public") > -1) 
    ){
        console.log('this is a auth service request ' + url);
        return http + host + authApiUrlPort + "?continue=" + host;
    }
    try {


        console.log("checking user rights");
        if (req.headers.upgrade || url.indexOf('/socket') === 0) {
            console.log("this is a websocket request don't do auth  ");
            return;
        }

        var res = request('GET', http + host + authApiUrlPort + '/api/user/status?url=' + host, {
            'headers': {cookie:req.headers.cookie}, timeout: 2000, maxRetries: 3
        });


        var data = JSON.parse(res.getBody('utf8'));
        console.log(data);

        switch (data.status) {
            case "access_granted" :
                return;
                break;
            case "not_connected":
            default:
                return http + host + authApiUrlPort + "/login";
                break;
            case "no_access_to_farm":
                return http + host + authApiUrlPort + "/login?message=no_acces_to_farm";
                break;

        }
    }
    catch (e) {
        console.error(e);
    }

    console.log("***END***");
};

customResolver.priority = 1000;

var proxy = require('redbird')({port: 80, resolvers: [customResolver]});

//proxy.register("al-factory.me/auth_public", "al-factory.me:8080/auth_public");


proxy.register("http://ecf-berlin.predictable.farm", "http://35.158.33.67:4001");
proxy.register("http://ecf-berlin.predictable.farm/automation", "http://35.158.33.67:4002/recipes/");
proxy.register("http://ecf-berlin.predictable.farm/recipes", "http://35.158.33.67:4002/recipes/");
proxy.register("http://ecf-berlin.predictable.farm/socket", "http://35.158.33.67:4003");



proxy.register("http://ecf-berlin.al-factory.me", "http://35.158.33.67:4001");
proxy.register("http://ecf-berlin.al-factory.me/automation", "http://35.158.33.67:4002/recipes/");
proxy.register("http://ecf-berlin.al-factory.merecipes", "http://35.158.33.67:4002/recipes/");
proxy.register("http://ecf-berlin.al-factory.me/socket", "http://35.158.33.67:4003");


proxy.register("http://altec-water-bxl.predictable.farm", "http://52.58.60.136:4001");
proxy.register("http://altec-water-bxl.predictable.farm/automation", "http://52.58.60.136:4002/recipes/");
proxy.register("http://altec-water-bxl.predictable.farm/recipes", "http://52.58.60.136:4002/recipes/");
proxy.register("http://altec-water-bxl.predictable.farm/socket", "http://52.58.60.136:4003");

/*
proxy.register("http://playground.predictable.farm", "http://127.0.0.1:4007");
proxy.register("http://playground.predictable.farm/recipes", "http://127.0.0.1:4005/recipes/");
proxy.register("http://playground.predictable.farm/socket", "http://127.0.0.1:4006");
*/