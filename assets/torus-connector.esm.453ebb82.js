import{_ as d}from"./index.js";import{A as h}from"./abstract-connector.esm.4a073f3d.js";function f(i,u){i.prototype=Object.create(u.prototype),i.prototype.constructor=i,i.__proto__=u}var m=function(i){f(u,i);function u(o){var r,t=o.chainId,c=o.initOptions,e=c===void 0?{}:c,n=o.constructorOptions,v=n===void 0?{}:n,a=o.loginOptions,p=a===void 0?{}:a;return r=i.call(this,{supportedChainIds:[t]})||this,r.chainId=t,r.initOptions=e,r.constructorOptions=v,r.loginOptions=p,r}var s=u.prototype;return s.activate=function(){try{var r=function(){return Promise.resolve(t.torus.login(t.loginOptions).then(function(n){return n[0]})).then(function(n){return{provider:t.torus.provider,account:n}})},t=this,c=function(){if(!t.torus)return Promise.resolve(d(()=>import("./torus.esm.8780cce8.js"),["assets/torus.esm.8780cce8.js","assets/index.js","assets/index.css","assets/abstract-connector.esm.4a073f3d.js","assets/immutable.00a43afd.js","assets/browser.30bf76c8.js","assets/index.2c11ab41.js"]).then(function(e){var n;return(n=e==null?void 0:e.default)!=null?n:e})).then(function(e){return t.torus=new e(t.constructorOptions),Promise.resolve(t.torus.init(t.initOptions)).then(function(){})})}();return Promise.resolve(c&&c.then?c.then(r):r(c))}catch(e){return Promise.reject(e)}},s.getProvider=function(){try{var r=this;return Promise.resolve(r.torus.provider)}catch(t){return Promise.reject(t)}},s.getChainId=function(){try{var r=this;return Promise.resolve(r.chainId)}catch(t){return Promise.reject(t)}},s.getAccount=function(){try{var r=this;return Promise.resolve(r.torus.ethereum.send("eth_accounts").then(function(t){return t[0]}))}catch(t){return Promise.reject(t)}},s.deactivate=function(){return Promise.resolve()},s.close=function(){try{var r=this;return Promise.resolve(r.torus.cleanUp()).then(function(){r.emitDeactivate()})}catch(t){return Promise.reject(t)}},u}(h);export{m as TorusConnector};
