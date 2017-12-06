var request = require('sync-request');


var http = "http://";
var authApiUrlPort = ":8080";
//var authApiUrl = "http://18.195.118.148:8080";
var env = "CLOUD";

function ipFromHostName( host)
{
        if(host == "altec-water-bxl.al-factory.me"
                || host == "alwater-bxl.predictable.zone"
                || host == "altec-water-bxl.predictable.farm") return  "http://52.58.60.136";

                else if(host == "ecf-berlin.predictable.farm"
                || host == "ecf-berlin.al-factory.me") return  "http://35.158.33.67";

                else if(host == "lafactory.predictable.zone"
                || host == "lafactory.al-factory.me"
                ) return  "http://35.158.36.50";
        else return null;
}


var customResolver = function (host, url, req) {
    if(env && env === "LOCAL"){
        return;
    }
    console.log("");
    console.log("");
    console.log("Custom resolver");
    console.log("");
    console.log("requesting", host + url);


   if ( (url.indexOf("login") > -1) 
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
        if (req.headers.upgrade ||  url.indexOf('/socket.io') > 0 || ((url.indexOf('/socket') > -1) && url.indexOf('/socket.io') < 0 ) ) {
            console.log("this is a websocket request don't do auth  ");

            return ipFromHostName(host);
        }

        var res = request('GET', http + host + authApiUrlPort + '/api/user/status?url=' + host, {
            'headers': {cookie:req.headers.cookie}, timeout: 2000, maxRetries: 3
        });


        var data = JSON.parse(res.getBody('utf8'));
        console.log(data);

        switch (data.status) {
            case "access_granted" :
                return ipFromHostName(host);
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





/*
proxy.register("http://playground.predictable.farm", "http://127.0.0.1:4007");
proxy.register("http://playground.predictable.farm/recipes", "http://127.0.0.1:4005/recipes/");
proxy.register("http://playground.predictable.farm/socket", "http://127.0.0.1:4006");
*/