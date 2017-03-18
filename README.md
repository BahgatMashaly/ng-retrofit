# ng-retrofit

Installation

```
npm install ng-retrofit

```

ng-retrofit provide additional functions and customization for angular2-rest
https://github.com/Paldom/angular2-rest
 
it's use annotations to consume Angular2 HTTP client RESTful services. 

- No need to implment or extend any interface or class
- Add custom function before every request, like show Progress Dialog
- Add custom function after every request, like dismiss Progress Dialog
- You be able to disable or enable the previous functions for a custom request
- Default header for every request
- Custom header for custom request
- Class routing prefix that will apply to all functions in that class
- You can remove class routing prefix for custom method
- Easy way to return dummy response from dummy function


Using

in your app model add our class RetrofitAngular to your providers like this

{provide: RetrofitAngular, useClass: RetrofitAngular.setConfig(
{
baseUrl:"http://192.168.1.200:3000/",
isTest:true,
responseFromDummyFunction:TEST.getDummyServiceResponse,
defaultHttpHeaderContentType:"application/json",
globalFunctionBeforeEveryRequest:SV.showProgressDialog,
globalFunctionAfterEveryRequest:SV.dismissProgressDialog
}
)
}


then you can make a service like this


@GET("/wcm/promotions/{lang}/{customerNumber}")
public getPromotions(@Path("lang")lang:string,@Path("customerNumber")customerNumber:number): Observable<any>  {return null;};


then consume the request like a method and handle returned Observable 


getPromotions("EN",1234,).subscribe((promotions=>{
that.promotions=promotions;
}), this.handleFailure);










