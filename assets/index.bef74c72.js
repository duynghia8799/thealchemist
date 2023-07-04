import{e as w}from"./abstract-connector.esm.0d01eaaa.js";var D=h;h.default=h;h.stable=b;h.stableStringify=b;var m="[...]",_="[Circular]",d=[],c=[];function L(){return{depthLimit:Number.MAX_SAFE_INTEGER,edgesLimit:Number.MAX_SAFE_INTEGER}}function h(e,i,n,r){typeof r>"u"&&(r=L()),E(e,"",0,[],void 0,0,r);var u;try{c.length===0?u=JSON.stringify(e,i,n):u=JSON.stringify(e,A(i),n)}catch{return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;d.length!==0;){var o=d.pop();o.length===4?Object.defineProperty(o[0],o[1],o[3]):o[0][o[1]]=o[2]}}return u}function l(e,i,n,r){var u=Object.getOwnPropertyDescriptor(r,n);u.get!==void 0?u.configurable?(Object.defineProperty(r,n,{value:e}),d.push([r,n,i,u])):c.push([i,n,e]):(r[n]=e,d.push([r,n,i]))}function E(e,i,n,r,u,o,f){o+=1;var t;if(typeof e=="object"&&e!==null){for(t=0;t<r.length;t++)if(r[t]===e){l(_,e,i,u);return}if(typeof f.depthLimit<"u"&&o>f.depthLimit){l(m,e,i,u);return}if(typeof f.edgesLimit<"u"&&n+1>f.edgesLimit){l(m,e,i,u);return}if(r.push(e),Array.isArray(e))for(t=0;t<e.length;t++)E(e[t],t,t,r,e,o,f);else{var s=Object.keys(e);for(t=0;t<s.length;t++){var y=s[t];E(e[y],y,t,r,e,o,f)}}r.pop()}}function R(e,i){return e<i?-1:e>i?1:0}function b(e,i,n,r){typeof r>"u"&&(r=L());var u=O(e,"",0,[],void 0,0,r)||e,o;try{c.length===0?o=JSON.stringify(u,i,n):o=JSON.stringify(u,A(i),n)}catch{return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;d.length!==0;){var f=d.pop();f.length===4?Object.defineProperty(f[0],f[1],f[3]):f[0][f[1]]=f[2]}}return o}function O(e,i,n,r,u,o,f){o+=1;var t;if(typeof e=="object"&&e!==null){for(t=0;t<r.length;t++)if(r[t]===e){l(_,e,i,u);return}try{if(typeof e.toJSON=="function")return}catch{return}if(typeof f.depthLimit<"u"&&o>f.depthLimit){l(m,e,i,u);return}if(typeof f.edgesLimit<"u"&&n+1>f.edgesLimit){l(m,e,i,u);return}if(r.push(e),Array.isArray(e))for(t=0;t<e.length;t++)O(e[t],t,t,r,e,o,f);else{var s={},y=Object.keys(e).sort(R);for(t=0;t<y.length;t++){var g=y[t];O(e[g],g,t,r,e,o,f),s[g]=e[g]}if(typeof u<"u")d.push([u,i,e]),u[i]=s;else return s}r.pop()}}function A(e){return e=typeof e<"u"?e:function(i,n){return n},function(i,n){if(c.length>0)for(var r=0;r<c.length;r++){var u=c[r];if(u[1]===i&&u[0]===n){n=u[2],c.splice(r,1);break}}return e.call(this,i,n)}}var N={};Object.defineProperty(N,"__esModule",{value:!0});const J=w.exports;function S(e,i,n){try{Reflect.apply(e,i,n)}catch(r){setTimeout(()=>{throw r})}}function P(e){const i=e.length,n=new Array(i);for(let r=0;r<i;r+=1)n[r]=e[r];return n}class j extends J.EventEmitter{emit(i,...n){let r=i==="error";const u=this._events;if(u!==void 0)r=r&&u.error===void 0;else if(!r)return!1;if(r){let f;if(n.length>0&&([f]=n),f instanceof Error)throw f;const t=new Error(`Unhandled error.${f?` (${f.message})`:""}`);throw t.context=f,t}const o=u[i];if(o===void 0)return!1;if(typeof o=="function")S(o,this,n);else{const f=o.length,t=P(o);for(let s=0;s<f;s+=1)S(t[s],this,n)}return!0}}N.default=j;export{D as f,N as s};
