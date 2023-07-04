import{e as Ie}from"./index.95eccb98.js";import{r as Se}from"./immutable.420491c8.js";import{e as Ae}from"./abstract-connector.esm.e584ac97.js";import{f as Te,s as X}from"./index.1c9ebec6.js";import{t as Y,c as P}from"./index.js";const ce=(t,e)=>function(){const r=e.promiseModule,n=new Array(arguments.length);for(let s=0;s<arguments.length;s++)n[s]=arguments[s];return new r((s,i)=>{e.errorFirst?n.push(function(o,a){if(e.multiArgs){const c=new Array(arguments.length-1);for(let u=1;u<arguments.length;u++)c[u-1]=arguments[u];o?(c.unshift(o),i(c)):s(c)}else o?i(o):s(a)}):n.push(function(o){if(e.multiArgs){const a=new Array(arguments.length-1);for(let c=0;c<arguments.length;c++)a[c]=arguments[c];s(a)}else s(o)}),t.apply(this,n)})};var Oe=(t,e)=>{e=Object.assign({exclude:[/.+(Sync|Stream)$/],errorFirst:!0,promiseModule:Promise},e);const r=s=>{const i=o=>typeof o=="string"?s===o:o.test(s);return e.include?e.include.some(i):!e.exclude.some(i)};let n;typeof t=="function"?n=function(){return e.excludeMain?t.apply(this,arguments):ce(t,e).apply(this,arguments)}:n=Object.create(Object.getPrototypeOf(t));for(const s in t){const i=t[s];n[s]=typeof i=="function"&&r(s)?ce(i,e):i}return n};const $e=Se,we=Ae.exports;var V=typeof Reflect=="object"?Reflect:null,xe=V&&typeof V.apply=="function"?V.apply:function(e,r,n){return Function.prototype.apply.call(e,r,n)},je=Z;function Z(){we.call(this)}$e.inherits(Z,we);Z.prototype.emit=function(t){for(var e=[],r=1;r<arguments.length;r++)e.push(arguments[r]);var n=t==="error",s=this._events;if(s!==void 0)n=n&&s.error===void 0;else if(!n)return!1;if(n){var i;if(e.length>0&&(i=e[0]),i instanceof Error)throw i;var o=new Error("Unhandled error."+(i?" ("+i.message+")":""));throw o.context=i,o}var a=s[t];if(a===void 0)return!1;if(typeof a=="function")ue(a,this,e);else for(var c=a.length,u=Ne(a,c),r=0;r<c;++r)ue(u[r],this,e);return!0};function ue(t,e,r){try{xe(t,e,r)}catch(n){setTimeout(()=>{throw n})}}function Ne(t,e){for(var r=new Array(e),n=0;n<e;++n)r[n]=t[n];return r}const He=je,qe=1e3,ze=(t,e)=>t+e,le=["sync","latest"];class Je extends He{constructor(e={}){super(),this._blockResetDuration=e.blockResetDuration||20*qe,this._blockResetTimeout,this._currentBlock=null,this._isRunning=!1,this._onNewListener=this._onNewListener.bind(this),this._onRemoveListener=this._onRemoveListener.bind(this),this._resetCurrentBlock=this._resetCurrentBlock.bind(this),this._setupInternalEvents()}isRunning(){return this._isRunning}getCurrentBlock(){return this._currentBlock}async getLatestBlock(){return this._currentBlock?this._currentBlock:await new Promise(r=>this.once("latest",r))}removeAllListeners(e){e?super.removeAllListeners(e):super.removeAllListeners(),this._setupInternalEvents(),this._onRemoveListener()}_start(){}_end(){}_setupInternalEvents(){this.removeListener("newListener",this._onNewListener),this.removeListener("removeListener",this._onRemoveListener),this.on("newListener",this._onNewListener),this.on("removeListener",this._onRemoveListener)}_onNewListener(e,r){!le.includes(e)||this._maybeStart()}_onRemoveListener(e,r){this._getBlockTrackerEventCount()>0||this._maybeEnd()}_maybeStart(){this._isRunning||(this._isRunning=!0,this._cancelBlockResetTimeout(),this._start())}_maybeEnd(){!this._isRunning||(this._isRunning=!1,this._setupBlockResetTimeout(),this._end())}_getBlockTrackerEventCount(){return le.map(e=>this.listenerCount(e)).reduce(ze)}_newPotentialLatest(e){const r=this._currentBlock;r&&de(e)<=de(r)||this._setCurrentBlock(e)}_setCurrentBlock(e){const r=this._currentBlock;this._currentBlock=e,this.emit("latest",e),this.emit("sync",{oldBlock:r,newBlock:e})}_setupBlockResetTimeout(){this._cancelBlockResetTimeout(),this._blockResetTimeout=setTimeout(this._resetCurrentBlock,this._blockResetDuration),this._blockResetTimeout.unref&&this._blockResetTimeout.unref()}_cancelBlockResetTimeout(){clearTimeout(this._blockResetTimeout)}_resetCurrentBlock(){this._currentBlock=null}}var Ue=Je;function de(t){return Number.parseInt(t,16)}const De=Oe,Ve=Ue,We=1e3;class Ge extends Ve{constructor(e={}){if(!e.provider)throw new Error("PollingBlockTracker - no provider specified.");const r=e.pollingInterval||20*We,n=e.retryTimeout||r/10,s=e.keepEventLoopActive!==void 0?e.keepEventLoopActive:!0,i=e.setSkipCacheFlag||!1;super(Object.assign({blockResetDuration:r},e)),this._provider=e.provider,this._pollingInterval=r,this._retryTimeout=n,this._keepEventLoopActive=s,this._setSkipCacheFlag=i}async checkForLatestBlock(){return await this._updateLatestBlock(),await this.getLatestBlock()}_start(){this._performSync().catch(e=>this.emit("error",e))}async _performSync(){for(;this._isRunning;)try{await this._updateLatestBlock(),await fe(this._pollingInterval,!this._keepEventLoopActive)}catch(e){const r=new Error(`PollingBlockTracker - encountered an error while attempting to update latest block:
${e.stack}`);try{this.emit("error",r)}catch{console.error(r)}await fe(this._retryTimeout,!this._keepEventLoopActive)}}async _updateLatestBlock(){const e=await this._fetchLatestBlock();this._newPotentialLatest(e)}async _fetchLatestBlock(){const e={jsonrpc:"2.0",id:1,method:"eth_blockNumber",params:[]};this._setSkipCacheFlag&&(e.skipCache=!0);const r=await De(n=>this._provider.sendAsync(e,n))();if(r.error)throw new Error(`PollingBlockTracker - encountered error fetching block:
${r.error}`);return r.result}}var gr=Ge;function fe(t,e){return new Promise(r=>{const n=setTimeout(r,t);n.unref&&e&&n.unref()})}var Ee={},ee={},j={};Object.defineProperty(j,"__esModule",{value:!0});var he=Y.exports,Qe=function(){function t(e){if(this._maxConcurrency=e,this._queue=[],e<=0)throw new Error("semaphore must be initialized to a positive value");this._value=e}return t.prototype.acquire=function(){var e=this,r=this.isLocked(),n=new Promise(function(s){return e._queue.push(s)});return r||this._dispatch(),n},t.prototype.runExclusive=function(e){return he.__awaiter(this,void 0,void 0,function(){var r,n,s;return he.__generator(this,function(i){switch(i.label){case 0:return[4,this.acquire()];case 1:r=i.sent(),n=r[0],s=r[1],i.label=2;case 2:return i.trys.push([2,,4,5]),[4,e(n)];case 3:return[2,i.sent()];case 4:return s(),[7];case 5:return[2]}})})},t.prototype.isLocked=function(){return this._value<=0},t.prototype.release=function(){if(this._maxConcurrency>1)throw new Error("this method is unavailabel on semaphores with concurrency > 1; use the scoped release returned by acquire instead");if(this._currentReleaser){var e=this._currentReleaser;this._currentReleaser=void 0,e()}},t.prototype._dispatch=function(){var e=this,r=this._queue.shift();if(!!r){var n=!1;this._currentReleaser=function(){n||(n=!0,e._value++,e._dispatch())},r([this._value--,this._currentReleaser])}},t}();j.default=Qe;Object.defineProperty(ee,"__esModule",{value:!0});var me=Y.exports,Ke=j,Xe=function(){function t(){this._semaphore=new Ke.default(1)}return t.prototype.acquire=function(){return me.__awaiter(this,void 0,void 0,function(){var e,r;return me.__generator(this,function(n){switch(n.label){case 0:return[4,this._semaphore.acquire()];case 1:return e=n.sent(),r=e[1],[2,r]}})})},t.prototype.runExclusive=function(e){return this._semaphore.runExclusive(function(){return e()})},t.prototype.isLocked=function(){return this._semaphore.isLocked()},t.prototype.release=function(){this._semaphore.release()},t}();ee.default=Xe;var N={};Object.defineProperty(N,"__esModule",{value:!0});N.withTimeout=void 0;var T=Y.exports;function Ye(t,e,r){var n=this;return r===void 0&&(r=new Error("timeout")),{acquire:function(){return new Promise(function(s,i){return T.__awaiter(n,void 0,void 0,function(){var o,a,c;return T.__generator(this,function(u){switch(u.label){case 0:return o=!1,setTimeout(function(){o=!0,i(r)},e),[4,t.acquire()];case 1:return a=u.sent(),o?(c=Array.isArray(a)?a[1]:a,c()):s(a),[2]}})})})},runExclusive:function(s){return T.__awaiter(this,void 0,void 0,function(){var i,o;return T.__generator(this,function(a){switch(a.label){case 0:i=function(){},a.label=1;case 1:return a.trys.push([1,,7,8]),[4,this.acquire()];case 2:return o=a.sent(),Array.isArray(o)?(i=o[1],[4,s(o[0])]):[3,4];case 3:return[2,a.sent()];case 4:return i=o,[4,s()];case 5:return[2,a.sent()];case 6:return[3,8];case 7:return i(),[7];case 8:return[2]}})})},release:function(){t.release()},isLocked:function(){return t.isLocked()}}}N.withTimeout=Ye;(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.withTimeout=t.Semaphore=t.Mutex=void 0;var e=ee;Object.defineProperty(t,"Mutex",{enumerable:!0,get:function(){return e.default}});var r=j;Object.defineProperty(t,"Semaphore",{enumerable:!0,get:function(){return r.default}});var n=N;Object.defineProperty(t,"withTimeout",{enumerable:!0,get:function(){return n.withTimeout}})})(Ee);var te={},H={},I={};Object.defineProperty(I,"__esModule",{value:!0});I.getUniqueId=void 0;const be=4294967295;let W=Math.floor(Math.random()*be);function Ze(){return W=(W+1)%be,W}I.getUniqueId=Ze;Object.defineProperty(H,"__esModule",{value:!0});H.createIdRemapMiddleware=void 0;const et=I;function tt(){return(t,e,r,n)=>{const s=t.id,i=et.getUniqueId();t.id=i,e.id=i,r(o=>{t.id=s,e.id=s,o()})}}H.createIdRemapMiddleware=tt;var q={};Object.defineProperty(q,"__esModule",{value:!0});q.createAsyncMiddleware=void 0;function rt(t){return async(e,r,n,s)=>{let i;const o=new Promise(h=>{i=h});let a=null,c=!1;const u=async()=>{c=!0,n(h=>{a=h,i()}),await o};try{await t(e,r,u),c?(await o,a(null)):s(null)}catch(h){a?a(h):s(h)}}}q.createAsyncMiddleware=rt;var z={};Object.defineProperty(z,"__esModule",{value:!0});z.createScaffoldMiddleware=void 0;function nt(t){return(e,r,n,s)=>{const i=t[e.method];return i===void 0?n():typeof i=="function"?i(e,r,n,s):(r.result=i,s())}}z.createScaffoldMiddleware=nt;var S={},Re={},M={};Object.defineProperty(M,"__esModule",{value:!0});M.EthereumProviderError=M.EthereumRpcError=void 0;const st=Te;class ke extends Error{constructor(e,r,n){if(!Number.isInteger(e))throw new Error('"code" must be an integer.');if(!r||typeof r!="string")throw new Error('"message" must be a nonempty string.');super(r),this.code=e,n!==void 0&&(this.data=n)}serialize(){const e={code:this.code,message:this.message};return this.data!==void 0&&(e.data=this.data),this.stack&&(e.stack=this.stack),e}toString(){return st.default(this.serialize(),at,2)}}M.EthereumRpcError=ke;class it extends ke{constructor(e,r,n){if(!ot(e))throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');super(e,r,n)}}M.EthereumProviderError=it;function ot(t){return Number.isInteger(t)&&t>=1e3&&t<=4999}function at(t,e){if(e!=="[Circular]")return e}var re={},B={};Object.defineProperty(B,"__esModule",{value:!0});B.errorValues=B.errorCodes=void 0;B.errorCodes={rpc:{invalidInput:-32e3,resourceNotFound:-32001,resourceUnavailable:-32002,transactionRejected:-32003,methodNotSupported:-32004,limitExceeded:-32005,parse:-32700,invalidRequest:-32600,methodNotFound:-32601,invalidParams:-32602,internal:-32603},provider:{userRejectedRequest:4001,unauthorized:4100,unsupportedMethod:4200,disconnected:4900,chainDisconnected:4901}};B.errorValues={"-32700":{standard:"JSON RPC 2.0",message:"Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."},"-32600":{standard:"JSON RPC 2.0",message:"The JSON sent is not a valid Request object."},"-32601":{standard:"JSON RPC 2.0",message:"The method does not exist / is not available."},"-32602":{standard:"JSON RPC 2.0",message:"Invalid method parameter(s)."},"-32603":{standard:"JSON RPC 2.0",message:"Internal JSON-RPC error."},"-32000":{standard:"EIP-1474",message:"Invalid input."},"-32001":{standard:"EIP-1474",message:"Resource not found."},"-32002":{standard:"EIP-1474",message:"Resource unavailable."},"-32003":{standard:"EIP-1474",message:"Transaction rejected."},"-32004":{standard:"EIP-1474",message:"Method not supported."},"-32005":{standard:"EIP-1474",message:"Request limit exceeded."},4001:{standard:"EIP-1193",message:"User rejected the request."},4100:{standard:"EIP-1193",message:"The requested account and/or method has not been authorized by the user."},4200:{standard:"EIP-1193",message:"The requested method is not supported by this Ethereum provider."},4900:{standard:"EIP-1193",message:"The provider is disconnected from all chains."},4901:{standard:"EIP-1193",message:"The provider is disconnected from the specified chain."}};(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.serializeError=t.isValidCode=t.getMessageFromCode=t.JSON_RPC_SERVER_ERROR_MESSAGE=void 0;const e=B,r=M,n=e.errorCodes.rpc.internal,s="Unspecified error message. This is a bug, please report it.",i={code:n,message:o(n)};t.JSON_RPC_SERVER_ERROR_MESSAGE="Unspecified server error.";function o(l,m=s){if(Number.isInteger(l)){const p=l.toString();if(g(e.errorValues,p))return e.errorValues[p].message;if(u(l))return t.JSON_RPC_SERVER_ERROR_MESSAGE}return m}t.getMessageFromCode=o;function a(l){if(!Number.isInteger(l))return!1;const m=l.toString();return!!(e.errorValues[m]||u(l))}t.isValidCode=a;function c(l,{fallbackError:m=i,shouldIncludeStack:p=!1}={}){var R,C;if(!m||!Number.isInteger(m.code)||typeof m.message!="string")throw new Error("Must provide fallback error with integer number code and string message.");if(l instanceof r.EthereumRpcError)return l.serialize();const y={};if(l&&typeof l=="object"&&!Array.isArray(l)&&g(l,"code")&&a(l.code)){const d=l;y.code=d.code,d.message&&typeof d.message=="string"?(y.message=d.message,g(d,"data")&&(y.data=d.data)):(y.message=o(y.code),y.data={originalError:h(l)})}else{y.code=m.code;const d=(R=l)===null||R===void 0?void 0:R.message;y.message=d&&typeof d=="string"?d:m.message,y.data={originalError:h(l)}}const f=(C=l)===null||C===void 0?void 0:C.stack;return p&&l&&f&&typeof f=="string"&&(y.stack=f),y}t.serializeError=c;function u(l){return l>=-32099&&l<=-32e3}function h(l){return l&&typeof l=="object"&&!Array.isArray(l)?Object.assign({},l):l}function g(l,m){return Object.prototype.hasOwnProperty.call(l,m)}})(re);var J={};Object.defineProperty(J,"__esModule",{value:!0});J.ethErrors=void 0;const ne=M,Me=re,v=B;J.ethErrors={rpc:{parse:t=>E(v.errorCodes.rpc.parse,t),invalidRequest:t=>E(v.errorCodes.rpc.invalidRequest,t),invalidParams:t=>E(v.errorCodes.rpc.invalidParams,t),methodNotFound:t=>E(v.errorCodes.rpc.methodNotFound,t),internal:t=>E(v.errorCodes.rpc.internal,t),server:t=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error("Ethereum RPC Server errors must provide single object argument.");const{code:e}=t;if(!Number.isInteger(e)||e>-32005||e<-32099)throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');return E(e,t)},invalidInput:t=>E(v.errorCodes.rpc.invalidInput,t),resourceNotFound:t=>E(v.errorCodes.rpc.resourceNotFound,t),resourceUnavailable:t=>E(v.errorCodes.rpc.resourceUnavailable,t),transactionRejected:t=>E(v.errorCodes.rpc.transactionRejected,t),methodNotSupported:t=>E(v.errorCodes.rpc.methodNotSupported,t),limitExceeded:t=>E(v.errorCodes.rpc.limitExceeded,t)},provider:{userRejectedRequest:t=>L(v.errorCodes.provider.userRejectedRequest,t),unauthorized:t=>L(v.errorCodes.provider.unauthorized,t),unsupportedMethod:t=>L(v.errorCodes.provider.unsupportedMethod,t),disconnected:t=>L(v.errorCodes.provider.disconnected,t),chainDisconnected:t=>L(v.errorCodes.provider.chainDisconnected,t),custom:t=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error("Ethereum Provider custom errors must provide single object argument.");const{code:e,message:r,data:n}=t;if(!r||typeof r!="string")throw new Error('"message" must be a nonempty string');return new ne.EthereumProviderError(e,r,n)}}};function E(t,e){const[r,n]=Be(e);return new ne.EthereumRpcError(t,r||Me.getMessageFromCode(t),n)}function L(t,e){const[r,n]=Be(e);return new ne.EthereumProviderError(t,r||Me.getMessageFromCode(t),n)}function Be(t){if(t){if(typeof t=="string")return[t];if(typeof t=="object"&&!Array.isArray(t)){const{message:e,data:r}=t;if(e&&typeof e!="string")throw new Error("Must specify string message.");return[e||void 0,r]}}return[]}(function(t){Object.defineProperty(t,"__esModule",{value:!0}),t.getMessageFromCode=t.serializeError=t.EthereumProviderError=t.EthereumRpcError=t.ethErrors=t.errorCodes=void 0;const e=M;Object.defineProperty(t,"EthereumRpcError",{enumerable:!0,get:function(){return e.EthereumRpcError}}),Object.defineProperty(t,"EthereumProviderError",{enumerable:!0,get:function(){return e.EthereumProviderError}});const r=re;Object.defineProperty(t,"serializeError",{enumerable:!0,get:function(){return r.serializeError}}),Object.defineProperty(t,"getMessageFromCode",{enumerable:!0,get:function(){return r.getMessageFromCode}});const n=J;Object.defineProperty(t,"ethErrors",{enumerable:!0,get:function(){return n.ethErrors}});const s=B;Object.defineProperty(t,"errorCodes",{enumerable:!0,get:function(){return s.errorCodes}})})(Re);var ct=P&&P.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(S,"__esModule",{value:!0});S.JsonRpcEngine=void 0;const ut=ct(X),b=Re;class k extends ut.default{constructor(){super(),this._middleware=[]}push(e){this._middleware.push(e)}handle(e,r){if(r&&typeof r!="function")throw new Error('"callback" must be a function if provided.');return Array.isArray(e)?r?this._handleBatch(e,r):this._handleBatch(e):r?this._handle(e,r):this._promiseHandle(e)}asMiddleware(){return async(e,r,n,s)=>{try{const[i,o,a]=await k._runAllMiddleware(e,r,this._middleware);return o?(await k._runReturnHandlers(a),s(i)):n(async c=>{try{await k._runReturnHandlers(a)}catch(u){return c(u)}return c()})}catch(i){return s(i)}}}async _handleBatch(e,r){try{const n=await Promise.all(e.map(this._promiseHandle.bind(this)));return r?r(null,n):n}catch(n){if(r)return r(n);throw n}}_promiseHandle(e){return new Promise(r=>{this._handle(e,(n,s)=>{r(s)})})}async _handle(e,r){if(!e||Array.isArray(e)||typeof e!="object"){const o=new b.EthereumRpcError(b.errorCodes.rpc.invalidRequest,`Requests must be plain objects. Received: ${typeof e}`,{request:e});return r(o,{id:void 0,jsonrpc:"2.0",error:o})}if(typeof e.method!="string"){const o=new b.EthereumRpcError(b.errorCodes.rpc.invalidRequest,`Must specify a string method. Received: ${typeof e.method}`,{request:e});return r(o,{id:e.id,jsonrpc:"2.0",error:o})}const n=Object.assign({},e),s={id:n.id,jsonrpc:n.jsonrpc};let i=null;try{await this._processRequest(n,s)}catch(o){i=o}return i&&(delete s.result,s.error||(s.error=b.serializeError(i))),r(i,s)}async _processRequest(e,r){const[n,s,i]=await k._runAllMiddleware(e,r,this._middleware);if(k._checkForCompletion(e,r,s),await k._runReturnHandlers(i),n)throw n}static async _runAllMiddleware(e,r,n){const s=[];let i=null,o=!1;for(const a of n)if([i,o]=await k._runMiddleware(e,r,a,s),o)break;return[i,o,s.reverse()]}static _runMiddleware(e,r,n,s){return new Promise(i=>{const o=c=>{const u=c||r.error;u&&(r.error=b.serializeError(u)),i([u,!0])},a=c=>{r.error?o(r.error):(c&&(typeof c!="function"&&o(new b.EthereumRpcError(b.errorCodes.rpc.internal,`JsonRpcEngine: "next" return handlers must be functions. Received "${typeof c}" for request:
${G(e)}`,{request:e})),s.push(c)),i([null,!1]))};try{n(e,r,a,o)}catch(c){o(c)}})}static async _runReturnHandlers(e){for(const r of e)await new Promise((n,s)=>{r(i=>i?s(i):n())})}static _checkForCompletion(e,r,n){if(!("result"in r)&&!("error"in r))throw new b.EthereumRpcError(b.errorCodes.rpc.internal,`JsonRpcEngine: Response has no error or result for request:
${G(e)}`,{request:e});if(!n)throw new b.EthereumRpcError(b.errorCodes.rpc.internal,`JsonRpcEngine: Nothing ended request:
${G(e)}`,{request:e})}}S.JsonRpcEngine=k;function G(t){return JSON.stringify(t,null,2)}var U={};Object.defineProperty(U,"__esModule",{value:!0});U.mergeMiddleware=void 0;const lt=S;function dt(t){const e=new lt.JsonRpcEngine;return t.forEach(r=>e.push(r)),e.asMiddleware()}U.mergeMiddleware=dt;(function(t){var e=P&&P.__createBinding||(Object.create?function(n,s,i,o){o===void 0&&(o=i),Object.defineProperty(n,o,{enumerable:!0,get:function(){return s[i]}})}:function(n,s,i,o){o===void 0&&(o=i),n[o]=s[i]}),r=P&&P.__exportStar||function(n,s){for(var i in n)i!=="default"&&!Object.prototype.hasOwnProperty.call(s,i)&&e(s,n,i)};Object.defineProperty(t,"__esModule",{value:!0}),r(H,t),r(q,t),r(z,t),r(I,t),r(S,t),r(U,t)})(te);var se={exports:{}},ft=function(e){return(r,n,s,i)=>{const o=e[r.method];return o===void 0?s():typeof o=="function"?o(r,n,s,i):(n.result=o,i())}};(function(t){t.exports=ft})(se);const pe=(t,e,r,n)=>function(...s){const i=e.promiseModule;return new i((o,a)=>{e.multiArgs?s.push((...u)=>{e.errorFirst?u[0]?a(u):(u.shift(),o(u)):o(u)}):e.errorFirst?s.push((u,h)=>{u?a(u):o(h)}):s.push(o),Reflect.apply(t,this===r?n:this,s)})},ge=new WeakMap;var ht=(t,e)=>{e={exclude:[/.+(?:Sync|Stream)$/],errorFirst:!0,promiseModule:Promise,...e};const r=typeof t;if(!(t!==null&&(r==="object"||r==="function")))throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${t===null?"null":r}\``);const n=(o,a)=>{let c=ge.get(o);if(c||(c={},ge.set(o,c)),a in c)return c[a];const u=p=>typeof p=="string"||typeof a=="symbol"?a===p:p.test(a),h=Reflect.getOwnPropertyDescriptor(o,a),g=h===void 0||h.writable||h.configurable,m=(e.include?e.include.some(u):!e.exclude.some(u))&&g;return c[a]=m,m},s=new WeakMap,i=new Proxy(t,{apply(o,a,c){const u=s.get(o);if(u)return Reflect.apply(u,a,c);const h=e.excludeMain?o:pe(o,e,i,o);return s.set(o,h),Reflect.apply(h,a,c)},get(o,a){const c=o[a];if(!n(o,a)||c===Function.prototype[a])return c;const u=s.get(c);if(u)return u;if(typeof c=="function"){const h=pe(c,e,i,o);return s.set(c,h),h}return c}});return i};const mt=X.default;class pt extends mt{constructor(){super(),this.updates=[]}async initialize(){}async update(){throw new Error("BaseFilter - no update method specified")}addResults(e){this.updates=this.updates.concat(e),e.forEach(r=>this.emit("update",r))}addInitialResults(e){}getChangesAndClear(){const e=this.updates;return this.updates=[],e}}var ie=pt;const gt=ie;class yt extends gt{constructor(){super(),this.allResults=[]}async update(){throw new Error("BaseFilterWithHistory - no update method specified")}addResults(e){this.allResults=this.allResults.concat(e),super.addResults(e)}addInitialResults(e){this.allResults=this.allResults.concat(e),super.addInitialResults(e)}getAllResults(){return this.allResults}}var _t=yt,A={minBlockRef:vt,maxBlockRef:wt,sortBlockRefs:oe,bnToHex:Et,blockRefIsNumber:bt,hexToInt:x,incrementHexInt:Rt,intToHex:Ce,unsafeRandomBytes:kt};function vt(...t){return oe(t)[0]}function wt(...t){const e=oe(t);return e[e.length-1]}function oe(t){return t.sort((e,r)=>e==="latest"||r==="earliest"?1:r==="latest"||e==="earliest"?-1:x(e)-x(r))}function Et(t){return"0x"+t.toString(16)}function bt(t){return t&&!["earliest","latest","pending"].includes(t)}function x(t){return t==null?t:Number.parseInt(t,16)}function Rt(t){if(t==null)return t;const e=x(t);return Ce(e+1)}function Ce(t){if(t==null)return t;let e=t.toString(16);return e.length%2&&(e="0"+e),"0x"+e}function kt(t){let e="0x";for(let r=0;r<t;r++)e+=ye(),e+=ye();return e}function ye(){return Math.floor(Math.random()*16).toString(16)}const Mt=Ie,Bt=ht,Ct=_t,{bnToHex:yr,hexToInt:O,incrementHexInt:Ft,minBlockRef:Pt,blockRefIsNumber:Lt}=A;class It extends Ct{constructor({provider:e,params:r}){super(),this.type="log",this.ethQuery=new Mt(e),this.params=Object.assign({fromBlock:"latest",toBlock:"latest",address:void 0,topics:[]},r),this.params.address&&(Array.isArray(this.params.address)||(this.params.address=[this.params.address]),this.params.address=this.params.address.map(n=>n.toLowerCase()))}async initialize({currentBlock:e}){let r=this.params.fromBlock;["latest","pending"].includes(r)&&(r=e),r==="earliest"&&(r="0x0"),this.params.fromBlock=r;const n=Pt(this.params.toBlock,e),s=Object.assign({},this.params,{toBlock:n}),i=await this._fetchLogs(s);this.addInitialResults(i)}async update({oldBlock:e,newBlock:r}){const n=r;let s;e?s=Ft(e):s=r;const i=Object.assign({},this.params,{fromBlock:s,toBlock:n}),a=(await this._fetchLogs(i)).filter(c=>this.matchLog(c));this.addResults(a)}async _fetchLogs(e){return await Bt(n=>this.ethQuery.getLogs(e,n))()}matchLog(e){if(O(this.params.fromBlock)>=O(e.blockNumber)||Lt(this.params.toBlock)&&O(this.params.toBlock)<=O(e.blockNumber))return!1;const r=e.address&&e.address.toLowerCase();return this.params.address&&r&&!this.params.address.includes(r)?!1:this.params.topics.every((s,i)=>{let o=e.topics[i];if(!o)return!1;o=o.toLowerCase();let a=Array.isArray(s)?s:[s];return a.includes(null)?!0:(a=a.map(h=>h.toLowerCase()),a.includes(o))})}}var St=It,ae=At;async function At({provider:t,fromBlock:e,toBlock:r}){e||(e=r);const n=_e(e),i=_e(r)-n+1,o=Array(i).fill().map((c,u)=>n+u).map(Tt);return await Promise.all(o.map(c=>Ot(t,"eth_getBlockByNumber",[c,!1])))}function _e(t){return t==null?t:Number.parseInt(t,16)}function Tt(t){return t==null?t:"0x"+t.toString(16)}function Ot(t,e,r){return new Promise((n,s)=>{t.sendAsync({id:1,jsonrpc:"2.0",method:e,params:r},(i,o)=>{if(i)return s(i);n(o.result)})})}const $t=ie,xt=ae,{incrementHexInt:jt}=A;class Nt extends $t{constructor({provider:e,params:r}){super(),this.type="block",this.provider=e}async update({oldBlock:e,newBlock:r}){const n=r,s=jt(e),o=(await xt({provider:this.provider,fromBlock:s,toBlock:n})).map(a=>a.hash);this.addResults(o)}}var Ht=Nt;const qt=ie,zt=ae,{incrementHexInt:Jt}=A;class Ut extends qt{constructor({provider:e}){super(),this.type="tx",this.provider=e}async update({oldBlock:e}){const r=e,n=Jt(e),s=await zt({provider:this.provider,fromBlock:n,toBlock:r}),i=[];for(const o of s)i.push(...o.transactions);this.addResults(i)}}var Dt=Ut;const Vt=Ee.Mutex,{createAsyncMiddleware:Wt}=te,Gt=se.exports,Qt=St,Kt=Ht,Xt=Dt,{intToHex:Fe,hexToInt:Q}=A;var Yt=Zt;function Zt({blockTracker:t,provider:e}){let r=0,n={};const s=new Vt,i=er({mutex:s}),o=Gt({eth_newFilter:i(K(c)),eth_newBlockFilter:i(K(u)),eth_newPendingTransactionFilter:i(K(h)),eth_uninstallFilter:i($(m)),eth_getFilterChanges:i($(g)),eth_getFilterLogs:i($(l))}),a=async({oldBlock:f,newBlock:d})=>{if(n.length===0)return;const _=await s.acquire();try{await Promise.all(F(n).map(async w=>{try{await w.update({oldBlock:f,newBlock:d})}catch(D){console.error(D)}}))}catch(w){console.error(w)}_()};return o.newLogFilter=c,o.newBlockFilter=u,o.newPendingTransactionFilter=h,o.uninstallFilter=m,o.getFilterChanges=g,o.getFilterLogs=l,o.destroy=()=>{C()},o;async function c(f){const d=new Qt({provider:e,params:f});return await p(d),d}async function u(){const f=new Kt({provider:e});return await p(f),f}async function h(){const f=new Xt({provider:e});return await p(f),f}async function g(f){const d=Q(f),_=n[d];if(!_)throw new Error(`No filter for index "${d}"`);return _.getChangesAndClear()}async function l(f){const d=Q(f),_=n[d];if(!_)throw new Error(`No filter for index "${d}"`);return _.type==="log"?results=_.getAllResults():results=[],results}async function m(f){const d=Q(f),_=n[d],w=Boolean(_);return w&&await R(d),w}async function p(f){const d=F(n).length,_=await t.getLatestBlock();await f.initialize({currentBlock:_}),r++,n[r]=f,f.id=r,f.idHex=Fe(r);const w=F(n).length;return y({prevFilterCount:d,newFilterCount:w}),r}async function R(f){const d=F(n).length;delete n[f];const _=F(n).length;y({prevFilterCount:d,newFilterCount:_})}async function C(){const f=F(n).length;n={},y({prevFilterCount:f,newFilterCount:0})}function y({prevFilterCount:f,newFilterCount:d}){if(f===0&&d>0){t.on("sync",a);return}if(f>0&&d===0){t.removeListener("sync",a);return}}}function K(t){return $(async(...e)=>{const r=await t(...e);return Fe(r.id)})}function $(t){return Wt(async(e,r)=>{const n=await t.apply(null,e.params);r.result=n})}function er({mutex:t}){return e=>async(r,n,s,i)=>{(await t.acquire())(),e(r,n,s,i)}}function F(t,e){const r=[];for(let n in t)r.push(t[n]);return r}const tr=X.default,rr=se.exports,{createAsyncMiddleware:ve}=te,nr=Yt,{unsafeRandomBytes:sr,incrementHexInt:ir}=A,or=ae;var _r=ar;function ar({blockTracker:t,provider:e}){const r={},n=nr({blockTracker:t,provider:e});let s=!1;const i=new tr,o=rr({eth_subscribe:ve(a),eth_unsubscribe:ve(c)});return o.destroy=h,{events:i,middleware:o};async function a(g,l){if(s)throw new Error("SubscriptionManager - attempting to use after destroying");const m=g.params[0],p=sr(16);let R;switch(m){case"newHeads":R=C({subId:p});break;case"logs":const f=g.params[1],d=await n.newLogFilter(f);R=y({subId:p,filter:d});break;default:throw new Error(`SubscriptionManager - unsupported subscription type "${m}"`)}r[p]=R,l.result=p;return;function C({subId:f}){const d={type:m,destroy:async()=>{t.removeListener("sync",d.update)},update:async({oldBlock:_,newBlock:w})=>{const D=w,Pe=ir(_);(await or({provider:e,fromBlock:Pe,toBlock:D})).map(cr).forEach(Le=>{u(f,Le)})}};return t.on("sync",d.update),d}function y({subId:f,filter:d}){return d.on("update",w=>u(f,w)),{type:m,destroy:async()=>await n.uninstallFilter(d.idHex)}}}async function c(g,l){if(s)throw new Error("SubscriptionManager - attempting to use after destroying");const m=g.params[0],p=r[m];if(!p){l.result=!1;return}delete r[m],await p.destroy(),l.result=!0}function u(g,l){i.emit("notification",{jsonrpc:"2.0",method:"eth_subscription",params:{subscription:g,result:l}})}function h(){i.removeAllListeners();for(const g in r)r[g].destroy(),delete r[g];s=!0}}function cr(t){return{hash:t.hash,parentHash:t.parentHash,sha3Uncles:t.sha3Uncles,miner:t.miner,stateRoot:t.stateRoot,transactionsRoot:t.transactionsRoot,receiptsRoot:t.receiptsRoot,logsBloom:t.logsBloom,difficulty:t.difficulty,number:t.number,gasLimit:t.gasLimit,gasUsed:t.gasUsed,nonce:t.nonce,mixHash:t.mixHash,timestamp:t.timestamp,extraData:t.extraData}}export{Yt as e,gr as p,_r as s};