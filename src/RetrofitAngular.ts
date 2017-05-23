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

import {
    Headers as AngularHeaders,
    Request,
    RequestOptions,
    RequestMethod as RequestMethods,
    Response,
    URLSearchParams, Http, XHRBackend, ResponseOptions, BrowserXhr, Headers, CookieXSRFStrategy, BaseRequestOptions
} from "@angular/http";
import {Observable} from "rxjs/Observable";
 import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {Injectable} from "@angular/core";
 import "reflect-metadata"


@Injectable()
export class RetrofitAngular {

    public static baseUrl="";
    public static isTest=false
    public static responseFromDummyFunction;
    public static defaultHttpHeaderContentType;
    public static globalFunctionBeforeEveryRequest;
    public static globalFunctionAfterEveryRequest;

    public static setConfig(config:any={}):any{
    if(config['baseUrl']) {
        RetrofitAngular.baseUrl = config['baseUrl'];
    }
    RetrofitAngular.isTest=config['isTest'];
    RetrofitAngular.defaultHttpHeaderContentType=config['defaultHttpHeaderContentType'];
     RetrofitAngular.responseFromDummyFunction=config['responseFromDummyFunction'];
    RetrofitAngular.globalFunctionBeforeEveryRequest=config['globalFunctionBeforeEveryRequest'];
    RetrofitAngular.globalFunctionAfterEveryRequest=config['globalFunctionAfterEveryRequest'];
    return   RetrofitAngular;
}


    public static http:Http = new Http(new XHRBackend(new BrowserXhr(), new ResponseOptions({
                body: null,
                headers: (function () {
                    var headers = new Headers();
                    headers.append('Accept', 'application/json')
                    return headers;
                })(),
                status: 200,
                statusText: "Ok",
                type: 2,
                url: null
            }
        ) ,new CookieXSRFStrategy()), new BaseRequestOptions())


    public static   resolve(baseUrl:string, url:string) {
    if (url == "")
    { 
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
        if (!part || part === ".") continue;
        // Interpret ".." to pop the last segment
        if (part === "..") newParts.pop();
        // Push new path segments.
        else newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "") newParts.unshift("");
    // Turn back into a single string path.
    var str= newParts.join("/") || (newParts.length ? "/" : ".");


    if(str.indexOf('://') === -1)
    {
        str= str.replace(':/', '://')
    }
    return str;

}



}

export var Path = paramBuilder("Path");
export var Query = paramBuilder("Query");
export var Body = paramBuilder("Body");
export var BodyAsIs = paramBuilder("BodyAsIs")("BodyAsIs");
export var File = paramBuilder("File")("File");
export function Produces(producesDef:MediaType) {
    return function (target:RetrofitAngular, propertyKey:string, descriptor:any) {
        descriptor.isJSON = producesDef === MediaType.JSON;
        return descriptor;
    };
}
export enum MediaType {
    JSON
}
export var GET = methodBuilder(RequestMethods.Get);
export var POST = methodBuilder(RequestMethods.Post);
export var PUT = methodBuilder(RequestMethods.Put);
export var DELETE = methodBuilder(RequestMethods.Delete);
export var HEAD = methodBuilder(RequestMethods.Head);
export var RoutePrefix = classRoutePrefix;
function classRoutePrefix(url:string) {
    return function (target: Function) {
        //noinspection TypeScriptUnresolvedFunction
        Reflect.defineMetadata("classRoutePrefix", url, target);
    }


}
function paramBuilder(paramName:string) {
    return function (key:string) {
        return function (target:RetrofitAngular, propertyKey:string | symbol, parameterIndex:number) {
            var metadataKey = `${propertyKey}_${paramName}_parameters`;
            var paramObj:any = {
                key: key,
                parameterIndex: parameterIndex
            };
            if (Array.isArray(target[metadataKey])) {
                target[metadataKey].push(paramObj);
            } else {
                target[metadataKey] = [paramObj];
            }
        };
    };
}
export function classHttpHeaders(headers:any) {
    return function (target: Function) {
         Reflect.defineMetadata("classHttpHeaders", headers, target);
    }
}
export function disableGlobalFunction(isDisableGlobalFunctionBeforeRequest:boolean,isDisableGlobalFunctionAfterRequest:boolean) {
    return function (target:RetrofitAngular, propertyKey:string, descriptor:any) {
        descriptor.isDisableGlobalFunctionBeforeRequest = isDisableGlobalFunctionBeforeRequest;
        descriptor.isDisableGlobalFunctionAfterRequest = isDisableGlobalFunctionAfterRequest;
        return descriptor;
    };
}
export function methodHttpHeaders(headersDef:any) {
    return function (target:RetrofitAngular, propertyKey:string, descriptor:any) {
        descriptor.methodHttpHeaders = headersDef;
        return descriptor;
    };
}





function methodBuilder(method:number) {
    return function (url:string) {
        return function (target:RetrofitAngular, propertyKey:string, descriptor:any) {

            var pPath = target[`${propertyKey}_Path_parameters`];
            var pQuery = target[`${propertyKey}_Query_parameters`];
            var pBody = target[`${propertyKey}_Body_parameters`];
            var pBodyAsIs = target[`${propertyKey}_BodyAsIs_parameters`];
            var pFile = target[`${propertyKey}_File_parameters`];
            descriptor.value = function (...args:any[]) {


                if(RetrofitAngular.isTest) {

                return RetrofitAngular.responseFromDummyFunction();

                }

                var body = null;
                var formData = [];
                if(pBodyAsIs)
                {

                    // for (var obj1 in args[pBody[0].parameterIndex]) {//todo// convert undefined to null not to macke exeption
                    //     if (args[pBody[0].parameterIndex][obj1] === undefined) {
                    //         args[pBody[0].parameterIndex][obj1] = null;
                    //     }
                    // }
                    body= JSON.stringify(args[pBodyAsIs[0].parameterIndex])//TODO
                }

                else if (pBody) {
                    body={}
                    pBody
                        .filter(pxxx => args[pxxx.parameterIndex]) // filter out optional parameters
                        .forEach(p => {
                            var key = p.key;
                            var value = args[p.parameterIndex];
                            // if the value is a instance of Object, we stringify it
                            // if (value instanceof Object) {
                            //     value = JSON.stringify(value);
                            // }
                            body[key]=value;
                            var encodedKey = encodeURIComponent( key);
                            var encodedValue = encodeURIComponent( value);
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
                    body =  args[pFile[0].parameterIndex];
                }
                // Path
                var resUrl:string = url;
                if (pPath) {
                    for (var k in pPath) {
                        if (pPath.hasOwnProperty(k)) {
                            resUrl = resUrl.replace("{" + pPath[k].key + "}", args[pPath[k].parameterIndex]);
                        }
                    }
                }

                // Query
                var search = new URLSearchParams();
                if (pQuery) {
                    pQuery
                        .filter(p => args[p.parameterIndex]) // filter out optional parameters
                        .forEach(p => {
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

                var headers = new AngularHeaders();
                headers.append('Content-Type', RetrofitAngular.defaultHttpHeaderContentType);
                //noinspection TypeScriptUnresolvedFunction
                let classHttpHeaders = Reflect.getMetadata("classHttpHeaders", target.constructor);//class

                for (var k in classHttpHeaders) { //method
                    if (descriptor.classHttpHeaders.hasOwnProperty(k)) {
                        headers.set(k, descriptor.classHttpHeaders[k]);
                    }
                }

                // set method specific headers
                for (var k in descriptor.methodHttpHeaders) { //method
                    if (descriptor.methodHttpHeaders.hasOwnProperty(k)) {
                        headers.set(k, descriptor.methodHttpHeaders[k]);
                    }
                }



                if(pFile) {
                    headers.set('Content-Type', 'multipart/form-data');

                }
                // for (var v in headers.values())
                // {
                //     if(v.toString().concat("application/x-www-form-urlencoded")))
                // }


                var ContentType = headers.get('Content-Type')

                if(ContentType && ContentType.toString()=="application/x-www-form-urlencoded")
                {
                    body= formData.join("&");
                }
                else //json
                {
                    body=JSON.stringify(body);
                }

                // else
                // {
                //   headers.append('Content-Type', 'application/json')
                // }
                //



                // headers.append('Content-Type', 'application/x-www-form-urlencoded');

                // headers.append('Accept', 'application/json');
                var the_url:string;


                if (resUrl.substring(0, 1) == "~") {
                    the_url = RetrofitAngular.resolve(RetrofitAngular.baseUrl, resUrl.substring(1))
                }
                else {
                    //noinspection TypeScriptUnresolvedFunction
                    let classRoutePrefix:string = Reflect.getMetadata("classRoutePrefix", target.constructor);//class
                    if(classRoutePrefix) {
                        the_url = RetrofitAngular.resolve(RetrofitAngular.resolve(RetrofitAngular.baseUrl, classRoutePrefix), resUrl)
                    }
                    else {
                        the_url = RetrofitAngular.resolve( RetrofitAngular.baseUrl, resUrl);
                    }

                }

                // Request options
                var options = new RequestOptions({
                    method,
                    url: the_url,
                    headers,
                    body,
                    search
                });


                if(descriptor.isDisableGlobalFunctionBeforeRequest) {
                    try {
                        RetrofitAngular.globalFunctionBeforeEveryRequest()
                    }
                    catch(e)
                    {
                        console.log(e)
                    }

                }

                var req:Request = new Request(options);

                // intercept the request
                // this.requestInterceptor(req);
                // make the request and store the observable for later transformation
                var observable:Observable<Response> = RetrofitAngular.http.request( req );

                // transform the obserable in accordance to the @Produces decorator
                if (descriptor.isJSON) {
                    observable = observable.map(res => res.json());
                }

                // intercept the response
                //  observable = this.responseInterceptor(observable);

                return observable.map(res => {
                        if(descriptor.isDisableGlobalFunctionAfterRequest) {
                            try {
                                RetrofitAngular.globalFunctionAfterEveryRequest()
                            }
                            catch(e)
                            {
                                console.log(e)
                            }
                        }


                        if (res["_body"] != "") {
                            return res.json()
                        }
                        else {

                            return res;
                        }

                    })

                    .catch(res_error=> {

                        if(descriptor.isDisableGlobalFunctionAfterRequest) {
                            try {
                                RetrofitAngular.globalFunctionAfterEveryRequest()
                            }
                            catch(e)
                            {
                                console.log(e)
                            }
                        }
                        // alert(xx);
                        if (res_error.status === 200 && res_error.type) {
                          //  throw {message: res_error.json().error || 'error connecting to server')};
                            throw new Error('Error connecting to server status code: ' + res_error.status);

                            //throw {message: "error connecting to server"};
                        }
                        else {

                            try {
                                var status=res_error.status
                                res_error = res_error.json()
                            }
                            catch(e)
                            {
                                throw new Error('Error connecting to server status code : ' + status);
                               // throw {message: res_error._body};

                            }
                            throw new Error('Error connecting to server status code:: ' + status);



                        }

                    });
            };

            return descriptor;
        };
    };
}



