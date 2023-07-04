import{A as j}from"./abstract-connector.esm.0d01eaaa.js";import"./index.js";function P(){return P=Object.assign||function(t){for(var i=1;i<arguments.length;i++){var r=arguments[i];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(t[o]=r[o])}return t},P.apply(this,arguments)}function O(t,i){t.prototype=Object.create(i.prototype),t.prototype.constructor=t,t.__proto__=i}function C(t){return C=Object.setPrototypeOf?Object.getPrototypeOf:function(r){return r.__proto__||Object.getPrototypeOf(r)},C(t)}function y(t,i){return y=Object.setPrototypeOf||function(o,e){return o.__proto__=e,o},y(t,i)}function S(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function m(t,i,r){return S()?m=Reflect.construct:m=function(e,a,n){var u=[null];u.push.apply(u,a);var c=Function.bind.apply(e,u),s=new c;return n&&y(s,n.prototype),s},m.apply(null,arguments)}function k(t){return Function.toString.call(t).indexOf("[native code]")!==-1}function w(t){var i=typeof Map=="function"?new Map:void 0;return w=function(o){if(o===null||!k(o))return o;if(typeof o!="function")throw new TypeError("Super expression must either be null or a function");if(typeof i<"u"){if(i.has(o))return i.get(o);i.set(o,e)}function e(){return m(o,arguments,C(this).constructor)}return e.prototype=Object.create(o.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),y(e,o)},w(t)}function g(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")));typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));function l(t,i){try{var r=t()}catch(o){return i(o)}return r&&r.then?r.then(void 0,i):r}function v(t){return t.hasOwnProperty("result")?t.result:t}var b=function(t){O(i,t);function i(){var r;return r=t.call(this)||this,r.name=r.constructor.name,r.message="No Ethereum provider was passed to the constructor or found on window.ethereum.",r}return i}(w(Error)),N=function(t){O(i,t);function i(){var r;return r=t.call(this)||this,r.name=r.constructor.name,r.message="The user rejected the request.",r}return i}(w(Error)),E=function(t){O(i,t);function i(o){var e,a=o.provider,n=a===void 0?window.ethereum:a,u=o.supportedChainIds;return e=t.call(this,{supportedChainIds:u})||this,e.provider=n,e.handleNetworkChanged=e.handleNetworkChanged.bind(g(e)),e.handleChainChanged=e.handleChainChanged.bind(g(e)),e.handleAccountsChanged=e.handleAccountsChanged.bind(g(e)),e.handleClose=e.handleClose.bind(g(e)),e}var r=i.prototype;return r.handleChainChanged=function(e){this.emitUpdate({chainId:e,provider:this.provider})},r.handleAccountsChanged=function(e){e.length===0?this.emitDeactivate():this.emitUpdate({account:e[0]})},r.handleClose=function(e,a){this.emitDeactivate()},r.handleNetworkChanged=function(e){this.emitUpdate({chainId:e,provider:this.provider})},r.activate=function(){try{var e=function(d){if(a)return d;function f(){return P({provider:n.provider},u?{account:u}:{})}var h=function(){if(!u)return Promise.resolve(n.provider.enable().then(function(p){return p&&v(p)[0]})).then(function(p){u=p})}();return h&&h.then?h.then(f):f(h)},a=!1,n=this;if(!n.provider)throw new b;n.provider.on&&(n.provider.on("chainChanged",n.handleChainChanged),n.provider.on("accountsChanged",n.handleAccountsChanged),n.provider.on("close",n.handleClose),n.provider.on("networkChanged",n.handleNetworkChanged)),n.provider.isMetaMask&&(n.provider.autoRefreshOnNetworkChange=!1);var u,c=l(function(){return Promise.resolve(n.provider.send("eth_requestAccounts").then(function(s){return v(s)[0]})).then(function(s){u=s})},function(s){if(s.code===4001)throw new N});return Promise.resolve(c&&c.then?c.then(e):e(c))}catch(s){return Promise.reject(s)}},r.getProvider=function(){try{var e=this;return Promise.resolve(e.provider)}catch(a){return Promise.reject(a)}},r.getChainId=function(){try{var e=function(){function s(){if(!n)try{n=v(a.provider.send({method:"net_version"}))}catch{}return n||(a.provider.isDapper?n=v(a.provider.cachedResults.net_version):n=a.provider.chainId||a.provider.networkVersion||a.provider._chainId),n}var d=function(){if(!n){var f=l(function(){return Promise.resolve(a.provider.send("net_version").then(v)).then(function(h){n=h})},function(){});if(f&&f.then)return f.then(function(){})}}();return d&&d.then?d.then(s):s(d)},a=this;if(!a.provider)throw new b;var n,u=l(function(){return Promise.resolve(a.provider.send("eth_chainId").then(v)).then(function(c){n=c})},function(){});return Promise.resolve(u&&u.then?u.then(e):e(u))}catch(c){return Promise.reject(c)}},r.getAccount=function(){try{var e=function(){function s(){return n||(n=v(a.provider.send({method:"eth_accounts"}))[0]),n}var d=function(){if(!n){var f=l(function(){return Promise.resolve(a.provider.enable().then(function(h){return v(h)[0]})).then(function(h){n=h})},function(){});if(f&&f.then)return f.then(function(){})}}();return d&&d.then?d.then(s):s(d)},a=this;if(!a.provider)throw new b;var n,u=l(function(){return Promise.resolve(a.provider.send("eth_accounts").then(function(c){return v(c)[0]})).then(function(c){n=c})},function(){});return Promise.resolve(u&&u.then?u.then(e):e(u))}catch(c){return Promise.reject(c)}},r.deactivate=function(){this.provider&&this.provider.removeListener&&(this.provider.removeListener("chainChanged",this.handleChainChanged),this.provider.removeListener("accountsChanged",this.handleAccountsChanged),this.provider.removeListener("close",this.handleClose),this.provider.removeListener("networkChanged",this.handleNetworkChanged))},r.isAuthorized=function(){try{var e=this;return e.provider?Promise.resolve(l(function(){return Promise.resolve(e.provider.send("eth_accounts").then(function(a){return v(a).length>0}))},function(){return!1})):Promise.resolve(!1)}catch(a){return Promise.reject(a)}},i}(j);export{b as NoEthereumProviderError,E as ProvidedConnector,N as UserRejectedRequestError};
