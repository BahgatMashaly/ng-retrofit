/*

 angular2-rest
 (c) Domonkos Pal
 License: MIT

 Table of Contents:

 - class RESTClient

 - Class Decorators:
 @BaseUrl(String)
 @DefaultHeaders(Object)

 - Method Decorators:
 @GET(url: String)
 @POST(url: String)
 @PUT(url: String)
 @DELETE(url: String)
 @Headers(object)
 @Produces(MediaType)

 - Parameter Decorators:
 @Path(string)
 @Query(string)
 @Header(string)
 @Body
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var http_1 = require("@angular/http");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var core_1 = require("@angular/core");
require("reflect-metadata");
var RetrofitAngular = RetrofitAngular_1 = (function () {
    function RetrofitAngular() {
    }
    RetrofitAngular.setConfig = function (config) {
        if (config === void 0) { config = {}; }
        if (config['baseUrl']) {
            RetrofitAngular_1.baseUrl = config['baseUrl'];
        }
        RetrofitAngular_1.isTest = config['isTest'];
        RetrofitAngular_1.defaultHttpHeaders = config['defaultHttpHeaders'];
        RetrofitAngular_1.responseFromDummyFunction = config['responseFromDummyFunction'];
        RetrofitAngular_1.globalFunctionBeforeEveryRequest = config['globalFunctionBeforeEveryRequest'];
        RetrofitAngular_1.globalFunctionAfterEveryRequest = config['globalFunctionAfterEveryRequest'];
        return RetrofitAngular_1;
    };
    RetrofitAngular.resolve = function (baseUrl, url) {
        if (url == "") {
            return baseUrl;
        }
        var parts = [];
        for (var i = 0, l = arguments.length; i < l; i++) {
            parts = parts.concat(arguments[i].split("/"));
        }
        // Interpret the path commands to get the new resolved path.
        var newParts = [];
        for (i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            // Remove leading and trailing slashes
            // Also remove "." segments
            if (!part || part === ".")
                continue;
            // Interpret ".." to pop the last segment
            if (part === "..")
                newParts.pop();
            else
                newParts.push(part);
        }
        // Preserve the initial slash if there was one.
        if (parts[0] === "")
            newParts.unshift("");
        // Turn back into a single string path.
        var str = newParts.join("/") || (newParts.length ? "/" : ".");
        if (str.indexOf('://') === -1) {
            str = str.replace(':/', '://');
        }
        return str;
    };
    return RetrofitAngular;
}());
RetrofitAngular.baseUrl = "";
RetrofitAngular.isTest = false;
RetrofitAngular.http = new http_1.Http(new http_1.XHRBackend(new http_1.BrowserXhr(), new http_1.ResponseOptions({
    body: null,
    headers: (function () {
        var headers = new http_1.Headers({ 'Accept': 'application/json' });
        // headers.append('Accept', 'application/json')
        return headers;
    })(),
    status: 200,
    statusText: "Ok",
    type: 2,
    url: null
}), new http_1.CookieXSRFStrategy()), new http_1.BaseRequestOptions());
RetrofitAngular = RetrofitAngular_1 = __decorate([
    core_1.Injectable()
], RetrofitAngular);
exports.RetrofitAngular = RetrofitAngular;
exports.Path = paramBuilder("Path");
exports.Query = paramBuilder("Query");
exports.Body = paramBuilder("Body");
exports.BodyAsIs = paramBuilder("BodyAsIs")("BodyAsIs");
exports.File = paramBuilder("File")("File");
function Produces(producesDef) {
    return function (target, propertyKey, descriptor) {
        descriptor.isJSON = producesDef === MediaType.JSON;
        return descriptor;
    };
}
exports.Produces = Produces;
var MediaType;
(function (MediaType) {
    MediaType[MediaType["JSON"] = 0] = "JSON";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
exports.GET = methodBuilder(http_1.RequestMethod.Get);
exports.POST = methodBuilder(http_1.RequestMethod.Post);
exports.PUT = methodBuilder(http_1.RequestMethod.Put);
exports.DELETE = methodBuilder(http_1.RequestMethod.Delete);
exports.HEAD = methodBuilder(http_1.RequestMethod.Head);
exports.RoutePrefix = classRoutePrefix;
function classRoutePrefix(url) {
    return function (target) {
        //noinspection TypeScriptUnresolvedFunction
        Reflect.defineMetadata("classRoutePrefix", url, target);
    };
}
function paramBuilder(paramName) {
    return function (key) {
        return function (target, propertyKey, parameterIndex) {
            var metadataKey = propertyKey + "_" + paramName + "_parameters";
            var paramObj = {
                key: key,
                parameterIndex: parameterIndex
            };
            if (Array.isArray(target[metadataKey])) {
                target[metadataKey].push(paramObj);
            }
            else {
                target[metadataKey] = [paramObj];
            }
        };
    };
}
function classHttpHeaders(headers) {
    return function (target) {
        Reflect.defineMetadata("classHttpHeaders", headers, target);
    };
}
exports.classHttpHeaders = classHttpHeaders;
function disableGlobalFunction(isDisableGlobalFunctionBeforeRequest, isDisableGlobalFunctionAfterRequest) {
    return function (target, propertyKey, descriptor) {
        descriptor.isDisableGlobalFunctionBeforeRequest = isDisableGlobalFunctionBeforeRequest;
        descriptor.isDisableGlobalFunctionAfterRequest = isDisableGlobalFunctionAfterRequest;
        return descriptor;
    };
}
exports.disableGlobalFunction = disableGlobalFunction;
function methodHttpHeaders(headersDef) {
    return function (target, propertyKey, descriptor) {
        descriptor.methodHttpHeaders = headersDef;
        return descriptor;
    };
}
exports.methodHttpHeaders = methodHttpHeaders;
function methodBuilder(method) {
    return function (url) {
        return function (target, propertyKey, descriptor) {
            var pPath = target[propertyKey + "_Path_parameters"];
            var pQuery = target[propertyKey + "_Query_parameters"];
            var pBody = target[propertyKey + "_Body_parameters"];
            var pBodyAsIs = target[propertyKey + "_BodyAsIs_parameters"];
            var pFile = target[propertyKey + "_File_parameters"];
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (RetrofitAngular.isTest) {
                    return RetrofitAngular.responseFromDummyFunction();
                }
                var body = null;
                var formData = [];
                if (pBodyAsIs) {
                    for (var obj1 in args[pBody[0].parameterIndex]) {
                        if (args[pBody[0].parameterIndex][obj1] === undefined) {
                            args[pBody[0].parameterIndex][obj1] = null;
                        }
                    }
                    body = JSON.stringify(args[pBody[0].parameterIndex]);
                }
                else if (pBody) {
                    body = {};
                    pBody
                        .filter(function (p) { return args[p.parameterIndex]; }) // filter out optional parameters
                        .forEach(function (p) {
                        var key = p.key;
                        var value = args[p.parameterIndex];
                        // if the value is a instance of Object, we stringify it
                        // if (value instanceof Object) {
                        //     value = JSON.stringify(value);
                        // }
                        body[key] = value;
                        var encodedKey = encodeURIComponent(key);
                        var encodedValue = encodeURIComponent(value);
                        formData.push(encodedKey + "=" + encodedValue);
                    });
                }
                // if (pBody) {
                //
                //   console.log("hellloooooo"+ args[pBody[0].parameterIndex]);
                //   console.log("hellloooooo"+ args[pBody[1].parameterIndex]);
                //   console.log("without stringify "+args[pBody[0].parameterIndex])
                //   console.log("with stringify "+SV.stringify(args[pBody[0].parameterIndex]))
                //     // body = SV.stringify(args[pBody[0].parameterIndex]);
                //
                //   body = args[pBody[0].parameterIndex];
                // }
                if (pFile) {
                    body = args[pFile[0].parameterIndex];
                }
                // Path
                var resUrl = url;
                if (pPath) {
                    for (var k in pPath) {
                        if (pPath.hasOwnProperty(k)) {
                            resUrl = resUrl.replace("{" + pPath[k].key + "}", args[pPath[k].parameterIndex]);
                        }
                    }
                }
                // Query
                var search = new http_1.URLSearchParams();
                if (pQuery) {
                    pQuery
                        .filter(function (p) { return args[p.parameterIndex]; }) // filter out optional parameters
                        .forEach(function (p) {
                        var key = p.key;
                        var value = args[p.parameterIndex];
                        // if the value is a instance of Object, we stringify it
                        if (value instanceof Object) {
                            value = JSON.stringify(value);
                        }
                        search.set(encodeURIComponent(key), encodeURIComponent(value));
                    });
                }
                // Headers
                // set class default headers
                var headers = new http_1.Headers();
                headers = RetrofitAngular.defaultHttpHeaders;
                // headers= RetrofitAngular.defaultHttpHeaders;
                //noinspection TypeScriptUnresolvedFunction
                var classHttpHeaders = Reflect.getMetadata("classHttpHeaders", target.constructor); //class
                if (classHttpHeaders) {
                    headers = classHttpHeaders;
                }
                // for (var k in classHttpHeaders) { //method
                //     if (descriptor.classHttpHeaders.hasOwnProperty(k)) {
                //         headers.set(k, descriptor.classHttpHeaders[k]);
                //     }
                // }
                if (descriptor.methodHttpHeaders) {
                    headers = descriptor.methodHttpHeaders;
                }
                // set method specific headers
                // for (var k in descriptor.methodHttpHeaders) { //method
                //     if (descriptor.methodHttpHeaders.hasOwnProperty(k)) {
                //         headers.set(k, descriptor.methodHttpHeaders[k]);
                //     }
                // }
                if (pFile) {
                    headers.set('Content-Type', 'multipart/form-data');
                }
                // for (var v in headers.values())
                // {
                //     if(v.toString().concat("application/x-www-form-urlencoded")))
                // }
                var ContentType = headers.get('Content-Type');
                if (ContentType && ContentType.toString() == "application/x-www-form-urlencoded") {
                    body = formData.join("&");
                }
                else {
                    body = JSON.stringify(body);
                }
                // else
                // {
                //   headers.append('Content-Type', 'application/json')
                // }
                //
                // headers.append('Content-Type', 'application/x-www-form-urlencoded');
                // headers.append('Accept', 'application/json');
                var the_url;
                if (resUrl.substring(0, 1) == "~") {
                    the_url = RetrofitAngular.resolve(RetrofitAngular.baseUrl, resUrl.substring(1));
                }
                else {
                    //noinspection TypeScriptUnresolvedFunction
                    var classRoutePrefix_1 = Reflect.getMetadata("classRoutePrefix", target.constructor); //class
                    if (classRoutePrefix_1) {
                        the_url = RetrofitAngular.resolve(RetrofitAngular.resolve(RetrofitAngular.baseUrl, classRoutePrefix_1), resUrl);
                    }
                    else {
                        the_url = RetrofitAngular.resolve(RetrofitAngular.baseUrl, resUrl);
                    }
                }
                // Request options
                var options = new http_1.RequestOptions({
                    method: method,
                    url: the_url,
                    headers: headers,
                    body: body,
                    search: search
                });
                if (descriptor.isDisableGlobalFunctionBeforeRequest) {
                    try {
                        RetrofitAngular.globalFunctionBeforeEveryRequest();
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                var req = new http_1.Request(options);
                // intercept the request
                // this.requestInterceptor(req);
                // make the request and store the observable for later transformation
                var observable = RetrofitAngular.http.request(req);
                // transform the obserable in accordance to the @Produces decorator
                if (descriptor.isJSON) {
                    observable = observable.map(function (res) { return res.json(); });
                }
                // intercept the response
                //  observable = this.responseInterceptor(observable);
                return observable.map(function (res) {
                    if (descriptor.isDisableGlobalFunctionAfterRequest) {
                        try {
                            RetrofitAngular.globalFunctionAfterEveryRequest();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if (res["_body"] != "") {
                        return res.json();
                    }
                    else {
                        return res;
                    }
                })["catch"](function (res_error) {
                    if (descriptor.isDisableGlobalFunctionAfterRequest) {
                        try {
                            RetrofitAngular.globalFunctionAfterEveryRequest();
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    // alert(xx);
                    if (res_error.status === 200 && res_error.type) {
                        //  throw {message: res_error.json().error || 'error connecting to server')};
                        throw new Error('Error connecting to server status code: ' + res_error.status);
                    }
                    else {
                        throw res_error;
                    }
                });
            };
            return descriptor;
        };
    };
}
var RetrofitAngular_1;
//# sourceMappingURL=RetrofitAngular.js.map
