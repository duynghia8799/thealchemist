import{_ as s}from"./index.js";import{A as v}from"./abstract-connector.esm.e584ac97.js";function h(){return h=Object.assign||function(n){for(var a=1;a<arguments.length;a++){var o=arguments[a];for(var r in o)Object.prototype.hasOwnProperty.call(o,r)&&(n[r]=o[r])}return n},h.apply(this,arguments)}function f(n,a){n.prototype=Object.create(a.prototype),n.prototype.constructor=n,p(n,a)}function p(n,a){return p=Object.setPrototypeOf||function(r,e){return r.__proto__=e,r},p(n,a)}function l(n){if(n===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}var g=1,P=function(n){f(a,n);function a(r){var e,t=r.url,d=r.appName,c=r.appLogoUrl,i=r.darkMode,u=r.supportedChainIds;return e=n.call(this,{supportedChainIds:u})||this,e.url=t,e.appName=d,e.appLogoUrl=c,e.darkMode=i||!1,e.handleChainChanged=e.handleChainChanged.bind(l(e)),e.handleAccountsChanged=e.handleAccountsChanged.bind(l(e)),e}var o=a.prototype;return o.activate=function(){try{var e=this,t=function(){return Promise.resolve(e.provider.request({method:"eth_requestAccounts"})).then(function(i){var u=i[0];return e.provider.on("chainChanged",e.handleChainChanged),e.provider.on("accountsChanged",e.handleAccountsChanged),{provider:e.provider,account:u}})},d=function(){if(window.ethereum&&window.ethereum.isCoinbaseWallet===!0)e.provider=window.ethereum;else{var c=function(){if(!e.walletLink)return Promise.resolve(s(()=>import("./index.cbdc44b0.js").then(i=>i.i),["assets/index.cbdc44b0.js","assets/index.js","assets/index.css","assets/index.1c9ebec6.js","assets/abstract-connector.esm.e584ac97.js","assets/immutable.420491c8.js","assets/index.95eccb98.js","assets/subscriptionManager.89ffb9a2.js"]).then(function(i){var u;return(u=i==null?void 0:i.default)!=null?u:i})).then(function(i){e.walletLink=new i(h({appName:e.appName,darkMode:e.darkMode},e.appLogoUrl?{appLogoUrl:e.appLogoUrl}:{})),e.provider=e.walletLink.makeWeb3Provider(e.url,g)})}();if(c&&c.then)return c.then(function(){})}}();return Promise.resolve(d&&d.then?d.then(t):t(d))}catch(c){return Promise.reject(c)}},o.getProvider=function(){try{var e=this;return Promise.resolve(e.provider)}catch(t){return Promise.reject(t)}},o.getChainId=function(){try{var e=this;return Promise.resolve(e.provider.chainId)}catch(t){return Promise.reject(t)}},o.getAccount=function(){try{var e=this;return Promise.resolve(e.provider.request({method:"eth_requestAccounts"})).then(function(t){return t[0]})}catch(t){return Promise.reject(t)}},o.deactivate=function(){this.provider.removeListener("chainChanged",this.handleChainChanged),this.provider.removeListener("accountsChanged",this.handleAccountsChanged)},o.close=function(){try{var e=this;return e.provider.close(),e.emitDeactivate(),Promise.resolve()}catch(t){return Promise.reject(t)}},o.handleChainChanged=function(e){this.emitUpdate({chainId:e})},o.handleAccountsChanged=function(e){this.emitUpdate({account:e[0]})},a}(v);export{P as WalletLinkConnector};
