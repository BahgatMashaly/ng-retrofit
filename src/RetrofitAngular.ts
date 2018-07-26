import {
  BrowserXhr,

  RequestMethod,

} from "@angular/http";
import {
  HttpClient , HttpHeaders, HttpParams, HttpRequest, HttpXhrBackend,

} from '@angular/common/http';
// import {Observable} from "rxjs/Observable";

// import {}from "stacktrace-js"

import {dummyResponse} from "../shared/dummyResponse";

 import {globalVariables} from "../shared/globalVariables";
import {Observable} from 'rxjs';
import {ServerLogs} from './ServerLogs';
import {catchError, map} from 'rxjs/operators';


export var Path = paramBuilder("Path");
export var Query = paramBuilder("Query");
export var Body = paramBuilder("Body");
export var BodyAsIs = paramBuilder("BodyAsIs")("BodyAsIs");



export class RetrofitAngular {

  public static appHeaders: HttpHeaders;
  public static baseUrl: any;
  public static preFunction: any;
  public static postFunction: any;
  public static funcDummyResponse = dummyResponse.getDummyServiceResponse;


  public static httpClient: HttpClient = new HttpClient( new HttpXhrBackend(new BrowserXhr()));


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


  public static setConfig(config: any = {}): any {
    if (config['baseUrl']) {
      RetrofitAngular.baseUrl = config['baseUrl'];
    }
    if (config['appHeaders']) {
      RetrofitAngular.appHeaders = config['appHeaders'];
    }

    RetrofitAngular.preFunction = config['preFunction'];
    RetrofitAngular.postFunction = config['postFunction'];
    return RetrofitAngular;
  }
}

export var Get = methodBuilder(RequestMethod.Get);
export var Post = methodBuilder(RequestMethod.Post);
export var Put = methodBuilder(RequestMethod.Put);
export var Options = methodBuilder(RequestMethod.Options);



export function methodResponseType(responseType) {
  return function (target:any, propertyKey:string, descriptor:any) {
    descriptor.methodResponseType = responseType;
    return descriptor;
  };
}

export function methodHttpHeaders(headersDef:HttpHeaders) {
  return function (target:any, propertyKey:string, descriptor:any) {
    descriptor.methodHttpHeaders = headersDef;
    return descriptor;
  };
}

export function classHttpHeaders(headers:HttpHeaders) {
  return function (target: Function) {
    (Reflect as any).defineMetadata("classHttpHeaders", headers, target);
  }
}

function paramBuilder(paramName: any) {
  return function (key: string) {
    return function (targetClass: any, methodName: string | symbol, parameterIndex: number) {

      var metadataKey = `${methodName}_${paramName}_parameters`;
      var paramObj: any = {
        key: key,
        parameterIndex: parameterIndex
      };
      if (Array.isArray(targetClass[metadataKey])) {//3alashan ashof hal mawgood walla la2 3alashan law hadeef 2 paths maye3melsh override 3ala wa7ed mawgood
        targetClass[metadataKey].push(paramObj);//the var converted to an array 3ady we haye3mel feha push
      } else {
        targetClass[metadataKey] = [paramObj];//hena ba3mel set ba2olo el key da 7ot feh el object da
      }
    };
  };
}


export function TimeOut(serviceTimeOut: number) {
  return function (target: any, propertyKey: string, descriptor: any) {
    descriptor.serviceTimeOut = serviceTimeOut;
    return descriptor;
  };
}


function methodBuilder(requestMethodNumber: number) {
  return function (url: string, disabePreFunction = false, disablePostFunction = false, customHeader?: any) {//these parameters which are sent from the service like @Post("/login/checkPassword", new Headers) defined above Post
    return function (targetClass: any, methodName: string, descriptor: any) {

      var pPath = targetClass[`${methodName}_Path_parameters`];
      var pQuery = targetClass[`${methodName}_Query_parameters`];
      var pBody = targetClass[`${methodName}_Body_parameters`];
      var pBodyAsIs = targetClass[`${methodName}_BodyAsIs_parameters`];
      var pFile = targetClass[`${methodName}_File_parameters`];

      descriptor.value = function (...args: any[]) {

        // if(RetrofitAngular.funcDummyResponse){
        //   return RetrofitAngular.funcDummyResponse(methodName,0);
        // }

        var tempURL = url;

        if (pPath) {
          tempURL = _substitute(tempURL, args, pPath);
        }

        var queryStringParams = new HttpParams();
        if (pQuery) {
          tempURL = tempURL + "?";
          for (var i = 0; i < pQuery.length; i++) {

            var key = pQuery[i].key;
            var value = args[pQuery[i].parameterIndex];


            // queryStringParams.set(encodeURIComponent(key), encodeURIComponent(value));
            queryStringParams.set( key,  value);

          }
        }

        var bodyJSON = {};
        var bodyForm = "";

        if (pBody) {

          for (var ii = 0; ii < pBody.length; ii++) {
            var key1 = pBody[ii].key;
            var value1 = args[pBody[ii].parameterIndex];

            //below incase of being sent as an json
            //  bodyJSON[key1] = encodeURIComponent(value1);
            bodyJSON[key1] =  value1;
            //----------------------

            ////below incase of being sent as an a key and value in case of 'Content-Type': 'application/x-www-form-urlencoded'
            if (ii > 0) {
              bodyForm = bodyForm + "&";
            }
            //  bodyForm = bodyForm + encodeURIComponent(key1) + "=" + encodeURIComponent(value1);
            bodyForm = bodyForm +   key1 + "=" +  value1;

            //------------------------------------------------------------
          }
        }


        var the_headers;
        if(descriptor.methodHttpHeaders)
        {
          the_headers=descriptor.methodHttpHeaders;
        }
        else if( (Reflect as any).getMetadata("classHttpHeaders", targetClass.constructor))
        {
          the_headers= (Reflect as any).getMetadata("classHttpHeaders", targetClass.constructor);
        }
        else
        {
          the_headers = RetrofitAngular.appHeaders;
        }
        if(pFile) {
          the_headers.set('Content-Type', 'multipart/form-data');
        }


        var finalBody;
        if (pBodyAsIs) {
          finalBody = args[0];
        }
        else {

          var ContentType = the_headers.get('Content-Type');
          if (ContentType && ContentType.toString() == "application/x-www-form-urlencoded")
          {
            finalBody = bodyForm;
          }
          else {
            finalBody = JSON.stringify(bodyJSON);
          }
        }



        var the_url:string;
        if (tempURL.substring(0, 1) == "~") {
          the_url =   tempURL.substring(1);
        }
        else
        {
          let classRoutePrefix:string = (Reflect as any).getMetadata("classRoutePrefix", targetClass.constructor);//class
          if(classRoutePrefix) {
            the_url = RetrofitAngular.resolve(RetrofitAngular.resolve(RetrofitAngular.baseUrl, classRoutePrefix), tempURL)
          }
          else
          {
            the_url = RetrofitAngular.resolve(RetrofitAngular.baseUrl, tempURL);
          }

        }

        var options
        if(descriptor.methodResponseType)
        {
          options =  {
            headers: the_headers,
            responseType: descriptor.methodResponseType,//enum 'arraybuffer' | 'blob' | 'json' | 'text'
            params: queryStringParams  //search is for URLSearchParams
          };
        }
        else
        {
          options =  {
            headers: the_headers,
            params: queryStringParams  //search is for URLSearchParams
          };
        }
//




        var req = new HttpRequest(RequestMethod[requestMethodNumber],the_url,finalBody,options);

        if (!disabePreFunction) {
          // preFunction:any;
          // public static   postFunction:any;
          // RetrofitAngular.preFunction();
          RetrofitAngular.preFunction();
        }
        // console.log("before  data is = ",req);
      // .patch =   function (url, body, options)
      //   post:3
      //   put:(url, body, options)
        var observable: Observable<any>;
        if(RequestMethod[requestMethodNumber].toLowerCase()=="post" || RequestMethod[requestMethodNumber].toLowerCase()=="patch"  || RequestMethod[requestMethodNumber].toLowerCase()=="put"   )
        {
          observable = RetrofitAngular.httpClient[RequestMethod[requestMethodNumber].toLowerCase()](the_url,finalBody,options);

        }
else
        {
          observable = RetrofitAngular.httpClient[RequestMethod[requestMethodNumber].toLowerCase()](the_url,options);

        }

        // var observable: Observable<any> = RetrofitAngular.httpClient.request(req);


        var timeOut = 60000;
        if (descriptor.serviceTimeOut) {
          timeOut = descriptor.serviceTimeOut;
        }

        return observable.pipe(map(res => {
          if (!disablePostFunction) {
            RetrofitAngular.postFunction();
          }
          console.log("after  data is = ",res);

          if(!descriptor.methodResponseAsIs)
          {
            var data;
            try {
              data = (res as any).json();
            }
            catch (ex) {
              return res;  //"Timed Out";
            }
            return data;
          }
          else
          {
            return res;
          }

          //console.log("getPromotions data is = ", data);
          //return JSON.parse(datax.text());

        }),catchError(res_error => {
          try {
            if (!disablePostFunction) {
              RetrofitAngular.postFunction();
            }

            (<any>req).headers = "set_null_from_lib";
            if (req.url.indexOf("checkPassword") >= 0) {
              (<any>req)._body = "set_null_from_lib"
            }

            var temp_error = {};
            temp_error["message"] = globalVariables.getErrorMessage(res_error);
            console.log("service error request:", JSON.stringify(req));//don't remove or comment this line
            console.info("error response:", res_error);
            console.info("errrrrrrrrrrrrrrrrror service error response:", req);

            var item = {};
            item["columnNumber"] = 0;
            item["fileName"] = methodName;
            item["functionName"] = JSON.stringify(temp_error);
            item["lineNumber"] = 0;
            var tempArray = [] as any[];
            tempArray.push(item);
            ServerLogs.sendNonFatalCrash("ServiceError", tempArray)
          }
          catch (ex) {
            console.error("error send error to server", ex);
          }
///////////////////////////////////////////////////////////////////////////////


          try {
            throw  res_error;
          } catch (e) {
            throw e;
          }

        }))

      };

      return descriptor;
    }
  }


}


function _substitute(url: any, args: any, pPath: any) {
  for (var i = 0; i < pPath.length; i++) {
    // url = url.replace("{" + pPath[i].key + "}",encodeURIComponent( args[pPath[i].parameterIndex]));
    url = url.replace("{" + pPath[i].key + "}", args[pPath[i].parameterIndex]);
  }
  return url;
}




