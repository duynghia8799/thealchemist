import{A as O}from"./abstract-connector.esm.e584ac97.js";import"./index.js";function P(){return P=Object.assign||function(t){for(var o=1;o<arguments.length;o++){var n=arguments[o];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},P.apply(this,arguments)}function C(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,t.__proto__=o}function _(t){return _=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)},_(t)}function g(t,o){return g=Object.setPrototypeOf||function(r,e){return r.__proto__=e,r},g(t,o)}function j(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch{return!1}}function p(t,o,n){return j()?p=Reflect.construct:p=function(e,i,c){var u=[null];u.push.apply(u,i);var h=Function.bind.apply(e,u),a=new h;return c&&g(a,c.prototype),a},p.apply(null,arguments)}function S(t){return Function.toString.call(t).indexOf("[native code]")!==-1}function y(t){var o=typeof Map=="function"?new Map:void 0;return y=function(r){if(r===null||!S(r))return r;if(typeof r!="function")throw new TypeError("Super expression must either be null or a function");if(typeof o<"u"){if(o.has(r))return o.get(r);o.set(r,e)}function e(){return p(r,arguments,_(this).constructor)}return e.prototype=Object.create(r.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),g(e,r)},y(t)}function v(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")));typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));function l(t,o){try{var n=t()}catch(r){return o(r)}return n&&n.then?n.then(void 0,o):n}function f(t){return t.hasOwnProperty("result")?t.result:t}var b=function(t){C(o,t);function o(){var n;return n=t.call(this)||this,n.name=n.constructor.name,n.message="No Ethereum provider was found on window.ethereum.",n}return o}(y(Error)),k=function(t){C(o,t);function o(){var n;return n=t.call(this)||this,n.name=n.constructor.name,n.message="The user rejected the request.",n}return o}(y(Error)),E=function(t){C(o,t);function o(r){var e;return e=t.call(this,r)||this,e.handleNetworkChanged=e.handleNetworkChanged.bind(v(e)),e.handleChainChanged=e.handleChainChanged.bind(v(e)),e.handleAccountsChanged=e.handleAccountsChanged.bind(v(e)),e.handleClose=e.handleClose.bind(v(e)),e}var n=o.prototype;return n.handleChainChanged=function(e){this.emitUpdate({chainId:e,provider:window.ethereum})},n.handleAccountsChanged=function(e){e.length===0?this.emitDeactivate():this.emitUpdate({account:e[0]})},n.handleClose=function(e,i){this.emitDeactivate()},n.handleNetworkChanged=function(e){this.emitUpdate({chainId:e,provider:window.ethereum})},n.activate=function(){try{var e=function(s){if(i)return s;function d(){return P({provider:window.ethereum},u?{account:u}:{})}var w=function(){if(!u)return Promise.resolve(window.ethereum.enable().then(function(m){return m&&f(m)[0]})).then(function(m){u=m})}();return w&&w.then?w.then(d):d(w)},i=!1,c=this;if(!window.ethereum)throw new b;window.ethereum.on&&(window.ethereum.on("chainChanged",c.handleChainChanged),window.ethereum.on("accountsChanged",c.handleAccountsChanged),window.ethereum.on("close",c.handleClose),window.ethereum.on("networkChanged",c.handleNetworkChanged)),window.ethereum.isMetaMask&&(window.ethereum.autoRefreshOnNetworkChange=!1);var u,h=l(function(){return Promise.resolve(window.ethereum.send("eth_requestAccounts").then(function(a){return f(a)[0]})).then(function(a){u=a})},function(a){if(a.code===4001)throw new k});return Promise.resolve(h&&h.then?h.then(e):e(h))}catch(a){return Promise.reject(a)}},n.getProvider=function(){try{return Promise.resolve(window.ethereum)}catch(e){return Promise.reject(e)}},n.getChainId=function(){try{var e=function(){function h(){if(!i)try{i=f(window.ethereum.send({method:"net_version"}))}catch{}return i||(window.ethereum.isDapper?i=f(window.ethereum.cachedResults.net_version):i=window.ethereum.chainId||window.ethereum.netVersion||window.ethereum.networkVersion||window.ethereum._chainId),i}var a=function(){if(!i){var s=l(function(){return Promise.resolve(window.ethereum.send("net_version").then(f)).then(function(d){i=d})},function(){});if(s&&s.then)return s.then(function(){})}}();return a&&a.then?a.then(h):h(a)};if(!window.ethereum)throw new b;var i,c=l(function(){return Promise.resolve(window.ethereum.send("eth_chainId").then(f)).then(function(u){i=u})},function(){});return Promise.resolve(c&&c.then?c.then(e):e(c))}catch(u){return Promise.reject(u)}},n.getAccount=function(){try{var e=function(){function h(){return i||(i=f(window.ethereum.send({method:"eth_accounts"}))[0]),i}var a=function(){if(!i){var s=l(function(){return Promise.resolve(window.ethereum.enable().then(function(d){return f(d)[0]})).then(function(d){i=d})},function(){});if(s&&s.then)return s.then(function(){})}}();return a&&a.then?a.then(h):h(a)};if(!window.ethereum)throw new b;var i,c=l(function(){return Promise.resolve(window.ethereum.send("eth_accounts").then(function(u){return f(u)[0]})).then(function(u){i=u})},function(){});return Promise.resolve(c&&c.then?c.then(e):e(c))}catch(u){return Promise.reject(u)}},n.deactivate=function(){window.ethereum&&window.ethereum.removeListener&&(window.ethereum.removeListener("chainChanged",this.handleChainChanged),window.ethereum.removeListener("accountsChanged",this.handleAccountsChanged),window.ethereum.removeListener("close",this.handleClose),window.ethereum.removeListener("networkChanged",this.handleNetworkChanged))},n.isAuthorized=function(){try{return window.ethereum?Promise.resolve(l(function(){return Promise.resolve(window.ethereum.send("eth_accounts").then(function(e){return f(e).length>0}))},function(){return!1})):Promise.resolve(!1)}catch(e){return Promise.reject(e)}},o}(O);export{E as InjectedConnector,b as NoEthereumProviderError,k as UserRejectedRequestError};
