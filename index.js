/*
  Copyright (C) Air Liquide S.A,  2017-2018
  Author: Sébastien Lalaurette and Cyril Chapellier, La Factory, Creative Foundry
  This file is part of Predictable Farm project.

  The MIT License (MIT)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
   
  See the LICENSE.txt file in this repository for more information.
*/

var request = require('sync-request');

var http = "http://";
var authApiUrlPort = ":8080";
var env = "CLOUD";

function ipFromHostName(host)
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