define(["exports","./events.js"],function(_exports,_events){Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_events=babelHelpers.interopRequireDefault(_events);var defaultTimeout=2e4,ConnectionMode_Local=0,ConnectionMode_Remote=1,ConnectionMode_Manual=2;function getServerAddress(server,mode){switch(mode){case ConnectionMode_Local:return server.LocalAddress;case ConnectionMode_Manual:return server.ManualAddress;case ConnectionMode_Remote:return server.RemoteAddress;default:return server.ManualAddress||server.LocalAddress||server.RemoteAddress}}function paramsToString(params){var values=[];for(var key in params){var value=params[key];null!=value&&""!==value&&values.push("".concat(encodeURIComponent(key),"=").concat(encodeURIComponent(value)))}return values.join("&")}function mergeServers(credentialProvider,list1,list2){for(var i=0,length=list2.length;i<length;i++)credentialProvider.addOrUpdateServer(list1,list2[i]);return list1}function updateServerInfo(server,systemInfo){systemInfo.ServerName&&(server.Name=systemInfo.ServerName),systemInfo.Id&&(server.Id=systemInfo.Id),systemInfo.LocalAddress&&(server.LocalAddress=systemInfo.LocalAddress),systemInfo.WanAddress&&(server.RemoteAddress=systemInfo.WanAddress)}function sortServers(a,b){return(b.DateLastAccessed||0)-(a.DateLastAccessed||0)}function setServerProperties(server){server.Type="Server"}function ajax(request,signal){if(!request)throw new Error("Request cannot be null");return request.headers=request.headers||{},console.log("ConnectionManager requesting url: ".concat(request.url)),function(request,signal){var headers=request.headers||{};"json"===request.dataType&&(headers.accept="application/json");var abortController,boundAbort,fetchRequest={headers:headers,method:request.type,credentials:"same-origin"};request.timeout&&(boundAbort=(abortController=new AbortController).abort.bind(abortController),signal&&signal.addEventListener("abort",boundAbort),setTimeout(boundAbort,request.timeout),signal=abortController.signal),signal&&(fetchRequest.signal=signal);var contentType=request.contentType;return request.data&&("string"==typeof request.data?fetchRequest.body=request.data:(fetchRequest.body=paramsToString(request.data),contentType=contentType||"application/x-www-form-urlencoded; charset=UTF-8")),contentType&&(headers["Content-Type"]=contentType),fetch(request.url,fetchRequest)}(request,signal).then(function(response){return console.log("ConnectionManager response status: ".concat(response.status,", url: ").concat(request.url)),response.status<400?"json"===request.dataType?response.json():"text"===request.dataType?response.text():"application/json"===request.headers.accept?response.json():response:Promise.reject(response)})}function getConnectUrl(handler){return"https://connect.emby.media/service/".concat(handler)}function replaceAll(originalString,strReplace,strWith){var reg=new RegExp(strReplace,"ig");return originalString.replace(reg,strWith)}function normalizeAddress(address){return(address=address.trim()).toLowerCase().startsWith("http")||(address="http://".concat(address)),address=replaceAll(address,"Http:","http:"),address=replaceAll(address,"Https:","https:")}function compareVersions(a,b){a=a.split("."),b=b.split(".");for(var i=0,length=Math.max(a.length,b.length);i<length;i++){var aVal=parseInt(a[i]||"0"),bVal=parseInt(b[i]||"0");if(aVal<bVal)return-1;if(bVal<aVal)return 1}return 0}function addAppInfoToConnectRequest(instance,request){request.headers=request.headers||{},request.headers["X-Application"]="".concat(instance.appName(),"/").concat(instance.appVersion())}function getCacheKey(feature,apiClient,argument_2){var viewOnly=(2<arguments.length&&void 0!==argument_2?argument_2:{}).viewOnly,cacheKey="regInfo-".concat(apiClient.serverId());return viewOnly&&(cacheKey+="-viewonly"),cacheKey}function allowAddress(instance,address){return!(instance.rejectInsecureAddresses&&!address.startsWith("https:"))}function onConnectUserSignIn(instance,user){instance._connectUser=user,_events.default.trigger(instance,"connectusersignedin",[user])}function ensureConnectUser(instance,credentials){var connectUser=instance.connectUser();return(!connectUser||connectUser.Id!==credentials.ConnectUserId)&&credentials.ConnectUserId&&credentials.ConnectAccessToken?(instance._connectUser=null,function(instance,userId,accessToken){if(!userId)throw new Error("null userId");if(!accessToken)throw new Error("null accessToken");return ajax({type:"GET",url:"https://connect.emby.media/service/user?id=".concat(userId),dataType:"json",headers:{"X-Application":"".concat(instance.appName(),"/").concat(instance.appVersion()),"X-Connect-UserToken":accessToken}})}(instance,credentials.ConnectUserId,credentials.ConnectAccessToken).then(function(user){return onConnectUserSignIn(instance,user),Promise.resolve()},function(){return Promise.resolve()})):Promise.resolve()}function findServers(serverDiscoveryFn){function onFinish(foundServers){return foundServers.map(function(foundServer){var info={Id:foundServer.Id,LocalAddress:function(info){if(info.Address&&info.EndpointAddress){var portString,address=info.EndpointAddress.split(":")[0],parts=info.Address.split(":");return 1<parts.length&&(portString=parts[parts.length-1],isNaN(parseInt(portString))||(address+=":".concat(portString))),normalizeAddress(address)}return null}(foundServer)||foundServer.Address,Name:foundServer.Name};return info.LastConnectionMode=info.ManualAddress?ConnectionMode_Manual:ConnectionMode_Local,info})}return serverDiscoveryFn().then(function(serverDiscovery){return serverDiscovery.findServers(1e3).then(onFinish,function(){return onFinish([])})})}function afterConnected(instance,apiClient,argument_2){var options=2<arguments.length&&void 0!==argument_2?argument_2:{};!1!==options.reportCapabilities&&function(instance,apiClient){instance.capabilities().then(function(capabilities){return apiClient.reportCapabilities(capabilities)})}(instance,apiClient),apiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,apiClient.enableWebSocketAutoConnect=!1!==options.enableWebSocket,apiClient.enableWebSocketAutoConnect&&(console.log("calling apiClient.ensureWebSocket"),apiClient.connected=!0,apiClient.ensureWebSocket())}function onLocalUserSignIn(instance,server,serverUrl){return instance._getOrAddApiClient(server,serverUrl),(instance.onLocalUserSignedIn?instance.onLocalUserSignedIn.call(instance,server.Id,server.UserId):Promise.resolve()).then(function(){_events.default.trigger(instance,"localusersignedin",[server.Id,server.UserId])})}function tryReconnectToUrl(instance,url,connectionMode,delay,signal){return console.log("tryReconnectToUrl: "+url),timeout=delay,new Promise(function(resolve,reject){setTimeout(resolve,timeout)}).then(function(){return ajax({url:instance.getEmbyServerUrl(url,"system/info/public"),timeout:defaultTimeout,type:"GET",dataType:"json"},signal).then(function(result){return{url:url,connectionMode:connectionMode,data:result}})});var timeout}function afterConnectValidated(instance,server,credentials,systemInfo,connectionMode,serverUrl,verifyLocalAuthentication,options){if(console.log("connectionManager.afterConnectValidated: "+serverUrl),options=options||{},verifyLocalAuthentication&&server.AccessToken)return function(instance,server,serverUrl){return console.log("connectionManager.validateAuthentication: "+serverUrl),ajax({type:"GET",url:instance.getEmbyServerUrl(serverUrl,"System/Info"),dataType:"json",headers:{"X-MediaBrowser-Token":server.AccessToken}}).then(function(systemInfo){return updateServerInfo(server,systemInfo),systemInfo},function(){return server.UserId=null,server.AccessToken=null,Promise.resolve()})}(instance,server,serverUrl).then(function(fullSystemInfo){return afterConnectValidated(instance,server,credentials,fullSystemInfo||systemInfo,connectionMode,serverUrl,!1,options)});updateServerInfo(server,systemInfo),server.LastConnectionMode=connectionMode,!1!==options.updateDateLastAccessed&&(server.DateLastAccessed=Date.now());var credentialProvider=instance.credentialProvider();credentialProvider.addOrUpdateServer(credentials.Servers,server),credentialProvider.credentials(credentials);var result={Servers:[]};result.ApiClient=instance._getOrAddApiClient(server,serverUrl),result.ApiClient.setSystemInfo(systemInfo),result.State=server.AccessToken&&!1!==options.enableAutoLogin?"SignedIn":"ServerSignIn",result.Servers.push(server),result.ApiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,result.ApiClient.updateServerInfo(server,serverUrl);function resolveActions(){return _events.default.trigger(instance,"connected",[result]),Promise.resolve(result)}return console.log("connectionManager.afterConnectValidated result.State: "+(result.State||"")),"SignedIn"===result.State?(afterConnected(instance,result.ApiClient,options),onLocalUserSignIn(instance,server,serverUrl).then(resolveActions,resolveActions)):resolveActions()}function onSuccessfulConnection(instance,server,systemInfo,connectionMode,serverUrl,options){console.log("connectionManager.onSuccessfulConnection: "+serverUrl);var credentials=instance.credentialProvider().credentials();return options=options||{},credentials.ConnectAccessToken&&!1!==options.enableAutoLogin?ensureConnectUser(instance,credentials).then(function(){return server.ExchangeToken?function(instance,server,serverUrl,credentials){if(!server.ExchangeToken)throw new Error("server.ExchangeToken cannot be null");if(!credentials.ConnectUserId)throw new Error("credentials.ConnectUserId cannot be null");var url=instance.getEmbyServerUrl(serverUrl,"Connect/Exchange?format=json&ConnectUserId=".concat(credentials.ConnectUserId)),headers={"X-Emby-Token":server.ExchangeToken},appName=instance.appName(),appVersion=instance.appVersion(),deviceName=instance.deviceName(),deviceId=instance.deviceId();return appName&&(headers["X-Emby-Client"]=appName),deviceName&&(headers["X-Emby-Device-Name"]=encodeURIComponent(deviceName)),deviceId&&(headers["X-Emby-Device-Id"]=deviceId),appVersion&&(headers["X-Emby-Client-Version"]=appVersion),ajax({type:"GET",url:url,dataType:"json",headers:headers}).then(function(auth){return server.UserId=auth.LocalUserId,server.AccessToken=auth.AccessToken,auth},function(){return server.UserId=null,server.AccessToken=null,Promise.reject()})}(instance,server,serverUrl,credentials).then(function(){return afterConnectValidated(instance,server,credentials,systemInfo,connectionMode,serverUrl,!0,options)},function(){return afterConnectValidated(instance,server,credentials,systemInfo,connectionMode,serverUrl,!0,options)}):afterConnectValidated(instance,server,credentials,systemInfo,connectionMode,serverUrl,!0,options)}):afterConnectValidated(instance,server,credentials,systemInfo,connectionMode,serverUrl,!0,options)}var ConnectionManager=function(){function ConnectionManager(credentialProvider,appStorage,apiClientFactory,serverDiscoveryFn,wakeOnLan,appName,appVersion,deviceName,deviceId,capabilitiesFn,devicePixelRatio,localassetmanager,itemrepository,useractionrepository){if(babelHelpers.classCallCheck(this,ConnectionManager),!appName)throw new Error("Must supply a appName");if(!appVersion)throw new Error("Must supply a appVersion");if(!deviceName)throw new Error("Must supply a deviceName");if(!deviceId)throw new Error("Must supply a deviceId");console.log("Begin ConnectionManager constructor"),_events.default.on(credentialProvider,"credentialsupdated",function(e,data){_events.default.trigger(this,"credentialsupdated",[data])}.bind(this)),this.appStorage=appStorage,this._credentialProvider=credentialProvider,this._apiClients=[],this._apiClientsMap={},this._minServerVersion="4.4.1",this._appName=appName,this._appVersion=appVersion,this._deviceName=deviceName,this._deviceId=deviceId,this.capabilities=capabilitiesFn,this.apiClientFactory=apiClientFactory,this.wakeOnLan=wakeOnLan,this.serverDiscoveryFn=serverDiscoveryFn,this.devicePixelRatio=devicePixelRatio,this.localassetmanager=localassetmanager,this.itemrepository=itemrepository,this.useractionrepository=useractionrepository}return babelHelpers.createClass(ConnectionManager,[{key:"appName",value:function(){return this._appName}},{key:"appVersion",value:function(){return this._appVersion}},{key:"deviceName",value:function(){return this._deviceName}},{key:"deviceId",value:function(){return this._deviceId}},{key:"minServerVersion",value:function(val){return val&&(this._minServerVersion=val),this._minServerVersion}},{key:"connectUser",value:function(){return this._connectUser}},{key:"credentialProvider",value:function(){return this._credentialProvider}},{key:"connectUserId",value:function(){return this.credentialProvider().credentials().ConnectUserId}},{key:"connectToken",value:function(){return this.credentialProvider().credentials().ConnectAccessToken}},{key:"getServerInfo",value:function(id){return this.credentialProvider().credentials().Servers.filter(function(s){return s.Id===id})[0]}},{key:"getLastUsedServer",value:function(){var servers=this.credentialProvider().credentials().Servers;return servers.sort(sortServers),servers.length?servers[0]:null}},{key:"getApiClientFromServerInfo",value:function(server,serverUrlToMatch){server.DateLastAccessed=Date.now(),null==server.LastConnectionMode&&server.ManualAddress&&(server.LastConnectionMode=ConnectionMode_Manual);var credentialProvider=this.credentialProvider(),credentials=credentialProvider.credentials();return credentialProvider.addOrUpdateServer(credentials.Servers,server,serverUrlToMatch),credentialProvider.credentials(credentials),this._getOrAddApiClient(server,getServerAddress(server,server.LastConnectionMode))}},{key:"clearData",value:function(){console.log("connection manager clearing data"),this._connectUser=null;var credentialProvider=this.credentialProvider(),credentials=credentialProvider.credentials();credentials.ConnectAccessToken=null,credentials.ConnectUserId=null,credentials.Servers=[],credentialProvider.credentials(credentials)}},{key:"_getOrAddApiClient",value:function(server,serverUrl){var apiClient=server.Id?this.getApiClient(server.Id):null;if(!apiClient&&server.IsLocalServer)for(var i=0,length=this._apiClients.length;i<length;i++){var current=this._apiClients[i];if(current.serverInfo().IsLocalServer){apiClient=current;break}}return apiClient||((apiClient=new this.apiClientFactory(this.appStorage,this.wakeOnLan,serverUrl,this.appName(),this.appVersion(),this.deviceName(),this.deviceId(),this.devicePixelRatio,this.localassetmanager,this.itemrepository,this.useractionrepository)).rejectInsecureAddresses=this.rejectInsecureAddresses,this._apiClients.push(apiClient),apiClient.serverInfo(server),apiClient.onAuthenticated=function(apiClient,result){var options={},instance=this,credentialProvider=instance.credentialProvider(),credentials=credentialProvider.credentials(),servers=credentials.Servers.filter(function(s){return s.Id===result.ServerId}),server=servers.length?servers[0]:apiClient.serverInfo();return!1!==options.updateDateLastAccessed&&(server.DateLastAccessed=Date.now()),server.Id=result.ServerId,server.UserId=result.User.Id,server.AccessToken=result.AccessToken,credentialProvider.addOrUpdateServer(credentials.Servers,server),credentialProvider.credentials(credentials),apiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,apiClient.serverInfo(server),afterConnected(instance,apiClient,options),apiClient.getPublicSystemInfo().then(function(systemInfo){return updateServerInfo(server,systemInfo),credentialProvider.addOrUpdateServer(credentials.Servers,server),credentialProvider.credentials(credentials),onLocalUserSignIn(instance,server,apiClient.serverAddress())})}.bind(this),_events.default.trigger(this,"apiclientcreated",[apiClient])),console.log("returning instance from getOrAddApiClient"),apiClient}},{key:"logout",value:function(){console.log("begin connectionManager loguot");for(var promises=[],i=0,length=this._apiClients.length;i<length;i++){var apiClient=this._apiClients[i];apiClient.accessToken()&&promises.push(function(instance,apiClient){var logoutInfo={serverId:(apiClient.serverInfo()||{}).Id};return apiClient.logout().then(function(){_events.default.trigger(instance,"localusersignedout",[logoutInfo])},function(){_events.default.trigger(instance,"localusersignedout",[logoutInfo])})}(this,apiClient))}var instance=this;return Promise.all(promises).then(function(){for(var credentialProvider=instance.credentialProvider(),credentials=credentialProvider.credentials(),servers=credentials.Servers,j=0,numServers=servers.length;j<numServers;j++){var server=servers[j];server.UserId=null,server.AccessToken=null,server.ExchangeToken=null}credentials.Servers=servers,credentials.ConnectAccessToken=null,credentials.ConnectUserId=null,credentialProvider.credentials(credentials),instance._connectUser&&(instance._connectUser=null,_events.default.trigger(instance,"connectusersignedout"))})}},{key:"getSavedServers",value:function(){var servers=this.credentialProvider().credentials().Servers.slice(0);return servers.forEach(setServerProperties),servers.sort(sortServers),servers}},{key:"getAvailableServers",value:function(){console.log("Begin getAvailableServers");var credentialProvider=this.credentialProvider(),credentials=credentialProvider.credentials();return Promise.all([function(instance,credentials){return console.log("Begin getConnectServers"),credentials.ConnectAccessToken&&credentials.ConnectUserId?ajax({type:"GET",url:"https://connect.emby.media/service/servers?userId=".concat(credentials.ConnectUserId),dataType:"json",headers:{"X-Application":"".concat(instance.appName(),"/").concat(instance.appVersion()),"X-Connect-UserToken":credentials.ConnectAccessToken}}).then(function(servers){return servers.map(function(i){return{ExchangeToken:i.AccessKey,ConnectServerId:i.Id,Id:i.SystemId,Name:i.Name,RemoteAddress:i.Url,LocalAddress:i.LocalAddres}})},function(){return credentials.Servers.slice(0).filter(function(s){return s.ExchangeToken})}):Promise.resolve([])}(this,credentials),findServers(this.serverDiscoveryFn)]).then(function(responses){var connectServers=responses[0],foundServers=responses[1],servers=credentials.Servers.slice(0);return mergeServers(credentialProvider,servers,foundServers),mergeServers(credentialProvider,servers,connectServers),(servers=function(servers,connectServers){return servers.filter(function(server){return!server.ExchangeToken||0<connectServers.filter(function(connectServer){return server.Id===connectServer.Id}).length})}(servers,connectServers)).forEach(setServerProperties),servers.sort(sortServers),credentials.Servers=servers,credentialProvider.credentials(credentials),servers})}},{key:"connectToServers",value:function(servers,options){console.log("Begin connectToServers, with ".concat(servers.length," servers"));var firstServer=servers.length?servers[0]:null;return firstServer?this.connectToServer(firstServer,options).then(function(result){return"Unavailable"===result.State&&(result.State="ServerSelection"),console.log("resolving connectToServers with result.State: "+result.State),result}):Promise.resolve({Servers:servers,State:servers.length||this.connectUser()?"ServerSelection":"ConnectSignIn",ConnectUser:this.connectUser()})}},{key:"connectToServer",value:function(server,options){console.log("begin connectToServer"),options=options||{};var instance=this;return function(instance,serverInfo,signal){var addresses=[],addressesStrings=[];if(!serverInfo.ManualAddressOnly&&serverInfo.LocalAddress&&!addressesStrings.includes(serverInfo.LocalAddress.toLowerCase())&&allowAddress(instance,serverInfo.LocalAddress)&&(addresses.push({url:serverInfo.LocalAddress,mode:ConnectionMode_Local,timeout:0}),addressesStrings.push(addresses[addresses.length-1].url.toLowerCase())),serverInfo.ManualAddress&&!addressesStrings.includes(serverInfo.ManualAddress.toLowerCase())&&allowAddress(instance,serverInfo.ManualAddress)&&(addresses.push({url:serverInfo.ManualAddress,mode:ConnectionMode_Manual,timeout:100}),addressesStrings.push(addresses[addresses.length-1].url.toLowerCase())),!serverInfo.ManualAddressOnly&&serverInfo.RemoteAddress&&!addressesStrings.includes(serverInfo.RemoteAddress.toLowerCase())&&allowAddress(instance,serverInfo.RemoteAddress)&&(addresses.push({url:serverInfo.RemoteAddress,mode:ConnectionMode_Remote,timeout:200}),addressesStrings.push(addresses[addresses.length-1].url.toLowerCase())),console.log("tryReconnect: "+addressesStrings.join("|")),!addressesStrings.length)return Promise.reject();for(var promises=[],i=0,length=addresses.length;i<length;i++)promises.push(tryReconnectToUrl(instance,addresses[i].url,addresses[i].mode,addresses[i].timeout,signal));return Promise.any(promises)}(this,server).then(function(result){var serverUrl=result.url,connectionMode=result.connectionMode;return result=result.data,1===compareVersions(instance.minServerVersion(),result.Version)||1===compareVersions(result.Version,"8.0")?(console.log("minServerVersion requirement not met. Server version: "+result.Version),{State:"ServerUpdateNeeded",Servers:[server]}):(server.Id&&result.Id!==server.Id&&!1!==instance.validateServerIds&&updateServerInfo(server={Id:result.Id,ManualAddress:serverUrl},result),function(instance,url,server,result,connectionMode,options){return console.log("connectionManager.resolveIfAvailable: "+url),(instance.validateServerAddress?instance.validateServerAddress(instance,ajax,url):Promise.resolve()).then(function(){return onSuccessfulConnection(instance,server,result,connectionMode,url,options)},function(){return console.log("minServerVersion requirement not met. Server version: "+result.Version),{State:"ServerUpdateNeeded",Servers:[server]}})}(instance,serverUrl,server,result,connectionMode,options))},function(){return{State:"Unavailable",ConnectUser:instance.connectUser()}})}},{key:"connectToAddress",value:function(address,options){if(!address)return Promise.reject();address=normalizeAddress(address);var instance=this;var server={ManualAddress:address,LastConnectionMode:ConnectionMode_Manual};return this.connectToServer(server,options).catch(function(){return console.log("connectToAddress ".concat(address," failed")),Promise.resolve({State:"Unavailable",ConnectUser:instance.connectUser()})})}},{key:"loginToConnect",value:function(username,password){if(!username)return Promise.reject();if(!password)return Promise.reject();var credentialProvider=this.credentialProvider(),instance=this;return ajax({type:"POST",url:"https://connect.emby.media/service/user/authenticate",data:{nameOrEmail:username,rawpw:password},dataType:"json",contentType:"application/x-www-form-urlencoded; charset=UTF-8",headers:{"X-Application":"".concat(this.appName(),"/").concat(this.appVersion())}}).then(function(result){var credentials=credentialProvider.credentials();return credentials.ConnectAccessToken=result.AccessToken,credentials.ConnectUserId=result.User.Id,credentialProvider.credentials(credentials),onConnectUserSignIn(instance,result.User),result})}},{key:"signupForConnect",value:function(options){var email=options.email,username=options.username,password=options.password,passwordConfirm=options.passwordConfirm;if(!email)return Promise.reject({errorCode:"invalidinput"});if(!username)return Promise.reject({errorCode:"invalidinput"});if(!password)return Promise.reject({errorCode:"invalidinput"});if(!passwordConfirm)return Promise.reject({errorCode:"passwordmatch"});if(password!==passwordConfirm)return Promise.reject({errorCode:"passwordmatch"});var data={email:email,userName:username,rawpw:password};return options.grecaptcha&&(data.grecaptcha=options.grecaptcha),ajax({type:"POST",url:"https://connect.emby.media/service/register",data:data,dataType:"json",contentType:"application/x-www-form-urlencoded; charset=UTF-8",headers:{"X-Application":"".concat(this.appName(),"/").concat(this.appVersion()),"X-CONNECT-TOKEN":"CONNECT-REGISTER"}}).catch(function(response){return response.json()}).then(function(result){return result&&result.Status?"SUCCESS"===result.Status?Promise.resolve(result):Promise.reject({errorCode:result.Status}):void Promise.reject()})}},{key:"getUserInvitations",value:function(){var connectToken=this.connectToken();if(!connectToken)throw new Error("null connectToken");if(!this.connectUserId())throw new Error("null connectUserId");return ajax({type:"GET",url:"https://connect.emby.media/service/servers?userId=".concat(this.connectUserId(),"&status=Waiting"),dataType:"json",headers:{"X-Connect-UserToken":connectToken,"X-Application":"".concat(this.appName(),"/").concat(this.appVersion())}})}},{key:"deleteServer",value:function(serverId){if(!serverId)throw new Error("null serverId");var credentialProvider=this.credentialProvider(),server=credentialProvider.credentials().Servers.filter(function(s){return s.Id===serverId});function onDone(){var credentials=credentialProvider.credentials();return credentials.Servers=credentials.Servers.filter(function(s){return s.Id!==serverId}),credentialProvider.credentials(credentials),Promise.resolve()}if(!(server=server.length?server[0]:null).ConnectServerId)return onDone();var connectToken=this.connectToken(),connectUserId=this.connectUserId();return connectToken&&connectUserId?ajax({type:"DELETE",url:"https://connect.emby.media/service/serverAuthorizations?serverId=".concat(server.ConnectServerId,"&userId=").concat(connectUserId),headers:{"X-Connect-UserToken":connectToken,"X-Application":"".concat(this.appName(),"/").concat(this.appVersion())}}).then(onDone,onDone):onDone()}},{key:"rejectServer",value:function(serverId){var connectToken=this.connectToken();if(!serverId)throw new Error("null serverId");if(!connectToken)throw new Error("null connectToken");if(!this.connectUserId())throw new Error("null connectUserId");var url="https://connect.emby.media/service/serverAuthorizations?serverId=".concat(serverId,"&userId=").concat(this.connectUserId());return fetch(url,{method:"DELETE",headers:{"X-Connect-UserToken":connectToken,"X-Application":"".concat(this.appName(),"/").concat(this.appVersion())}})}},{key:"acceptServer",value:function(serverId){var connectToken=this.connectToken();if(!serverId)throw new Error("null serverId");if(!connectToken)throw new Error("null connectToken");if(!this.connectUserId())throw new Error("null connectUserId");return ajax({type:"GET",url:"https://connect.emby.media/service/ServerAuthorizations/accept?serverId=".concat(serverId,"&userId=").concat(this.connectUserId()),headers:{"X-Connect-UserToken":connectToken,"X-Application":"".concat(this.appName(),"/").concat(this.appVersion())}})}},{key:"resetRegistrationInfo",value:function(apiClient){var cacheKey=getCacheKey("themes",apiClient,{viewOnly:!0});this.appStorage.removeItem(cacheKey),cacheKey=getCacheKey("themes",apiClient,{viewOnly:!1}),this.appStorage.removeItem(cacheKey),_events.default.trigger(this,"resetregistrationinfo")}},{key:"getRegistrationInfo",value:function(feature,apiClient,options){var params={serverId:apiClient.serverId(),deviceId:this.deviceId(),deviceName:this.deviceName(),appName:this.appName(),appVersion:this.appVersion(),embyUserName:""};(options=options||{}).viewOnly&&(params.viewOnly=options.viewOnly);var cacheKey=getCacheKey(feature,apiClient,options),regInfo=JSON.parse(this.appStorage.getItem(cacheKey)||"{}"),timeSinceLastValidation=Date.now()-(regInfo.lastValidDate||0);if(timeSinceLastValidation<=864e5)return console.log("getRegistrationInfo returning cached info"),Promise.resolve();var regCacheValid=timeSinceLastValidation<=864e5*(regInfo.cacheExpirationDays||7);if(params.embyUserName=apiClient.getCurrentUserName(),!params.serverId)return Promise.reject();var currentUserId=apiClient.getCurrentUserId();if(currentUserId&&"81f53802ea0247ad80618f55d9b4ec3c"===currentUserId.toLowerCase()&&"21585256623b4beeb26d5d3b09dec0ac"===params.serverId.toLowerCase())return Promise.reject();var appStorage=this.appStorage,getRegPromise=ajax({url:"https://crackemby.mb6.top/admin/service/registration/validateDevice.php?"+paramsToString(params),type:"POST",dataType:"json"}).then(function(response){return appStorage.setItem(cacheKey,JSON.stringify({lastValidDate:Date.now(),deviceId:params.deviceId,cacheExpirationDays:response.cacheExpirationDays})),Promise.resolve()},function(response){var status=(response||{}).status;return console.log("getRegistrationInfo response: "+status),403===status?Promise.reject("overlimit"):status&&status<500?Promise.reject():function(err){if(console.log("getRegistrationInfo failed: "+err),regCacheValid)return console.log("getRegistrationInfo returning cached info"),Promise.resolve();throw err}(response)});return regCacheValid?(console.log("getRegistrationInfo returning cached info"),Promise.resolve()):getRegPromise}},{key:"createPin",value:function(){var request={type:"POST",url:getConnectUrl("pin"),data:{deviceId:this.deviceId()},dataType:"json"};return addAppInfoToConnectRequest(this,request),ajax(request)}},{key:"getPinStatus",value:function(pinInfo){if(!pinInfo)throw new Error("pinInfo cannot be null");var queryString={deviceId:pinInfo.DeviceId,pin:pinInfo.Pin},request={type:"GET",url:"".concat(getConnectUrl("pin"),"?").concat(paramsToString(queryString)),dataType:"json"};return addAppInfoToConnectRequest(this,request),ajax(request)}},{key:"exchangePin",value:function(pinInfo){if(!pinInfo)throw new Error("pinInfo cannot be null");var credentialProvider=this.credentialProvider(),instance=this;return function(instance,pinInfo){if(!pinInfo)throw new Error("pinInfo cannot be null");var request={type:"POST",url:getConnectUrl("pin/authenticate"),data:{deviceId:pinInfo.DeviceId,pin:pinInfo.Pin},dataType:"json"};return addAppInfoToConnectRequest(instance,request),ajax(request)}(this,pinInfo).then(function(result){var credentials=credentialProvider.credentials();return credentials.ConnectAccessToken=result.AccessToken,credentials.ConnectUserId=result.UserId,credentialProvider.credentials(credentials),ensureConnectUser(instance,credentials)})}},{key:"connect",value:function(options){console.log("Begin connect");var instance=this;return instance.getAvailableServers().then(function(servers){return instance.connectToServers(servers,options)})}},{key:"handleMessageReceived",value:function(msg){var serverId=msg.ServerId;if(serverId){var apiClient=this.getApiClient(serverId);if(apiClient){if("string"==typeof msg.Data)try{msg.Data=JSON.parse(msg.Data)}catch(err){}apiClient.handleMessageReceived(msg)}}}},{key:"onNetworkChanged",value:function(){for(var apiClients=this._apiClients,i=0,length=apiClients.length;i<length;i++)apiClients[i].onNetworkChanged()}},{key:"onAppResume",value:function(){for(var apiClients=this._apiClients,i=0,length=apiClients.length;i<length;i++)apiClients[i].ensureWebSocket()}},{key:"isLoggedIntoConnect",value:function(){return!(!this.connectToken()||!this.connectUserId())}},{key:"getApiClients",value:function(){for(var servers=this.getSavedServers(),i=0,length=servers.length;i<length;i++){var serverUrl,server=servers[i];!server.Id||(serverUrl=getServerAddress(server,server.LastConnectionMode))&&this._getOrAddApiClient(server,serverUrl)}return this._apiClients}},{key:"getApiClient",value:function(item){if(!item)throw new Error("item or serverId cannot be null");var apiClient,serverId=item.ServerId;if((serverId=serverId||(item.Id&&"Server"===item.Type?item.Id:item))&&(apiClient=this._apiClientsMap[serverId]))return apiClient;for(var apiClients=this._apiClients,i=0,length=apiClients.length;i<length;i++){var serverInfo=(apiClient=apiClients[i]).serverInfo();if(!serverInfo||serverInfo.Id===serverId)return apiClient}return null}},{key:"getEmbyServerUrl",value:function(baseUrl,handler){return"".concat(baseUrl,"/emby/").concat(handler)}}]),ConnectionManager}();_exports.default=ConnectionManager});