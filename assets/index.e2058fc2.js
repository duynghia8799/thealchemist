import{d as l,k as _,i as f}from"./immutable.00a43afd.js";const{Transform:y}=l.exports;var d=o=>class u extends y{constructor(t,r,n,a,c){super(c),this._rate=t,this._capacity=r,this._delimitedSuffix=n,this._hashBitLength=a,this._options=c,this._state=new o,this._state.initialize(t,r),this._finalized=!1}_transform(t,r,n){let a=null;try{this.update(t,r)}catch(c){a=c}n(a)}_flush(t){let r=null;try{this.push(this.digest())}catch(n){r=n}t(r)}update(t,r){if(!Buffer.isBuffer(t)&&typeof t!="string")throw new TypeError("Data must be a string or a buffer");if(this._finalized)throw new Error("Digest already called");return Buffer.isBuffer(t)||(t=Buffer.from(t,r)),this._state.absorb(t),this}digest(t){if(this._finalized)throw new Error("Digest already called");this._finalized=!0,this._delimitedSuffix&&this._state.absorbLastFewBits(this._delimitedSuffix);let r=this._state.squeeze(this._hashBitLength/8);return t!==void 0&&(r=r.toString(t)),this._resetState(),r}_resetState(){return this._state.initialize(this._rate,this._capacity),this}_clone(){const t=new u(this._rate,this._capacity,this._delimitedSuffix,this._hashBitLength,this._options);return this._state.copy(t._state),t._finalized=this._finalized,t}};const{Transform:g}=l.exports;var B=o=>class p extends g{constructor(t,r,n,a){super(a),this._rate=t,this._capacity=r,this._delimitedSuffix=n,this._options=a,this._state=new o,this._state.initialize(t,r),this._finalized=!1}_transform(t,r,n){let a=null;try{this.update(t,r)}catch(c){a=c}n(a)}_flush(){}_read(t){this.push(this.squeeze(t))}update(t,r){if(!Buffer.isBuffer(t)&&typeof t!="string")throw new TypeError("Data must be a string or a buffer");if(this._finalized)throw new Error("Squeeze already called");return Buffer.isBuffer(t)||(t=Buffer.from(t,r)),this._state.absorb(t),this}squeeze(t,r){this._finalized||(this._finalized=!0,this._state.absorbLastFewBits(this._delimitedSuffix));let n=this._state.squeeze(t);return r!==void 0&&(n=n.toString(r)),n}_resetState(){return this._state.initialize(this._rate,this._capacity),this}_clone(){const t=new p(this._rate,this._capacity,this._delimitedSuffix,this._options);return this._state.copy(t._state),t._finalized=this._finalized,t}};const m=d,k=B;var w=function(o){const i=m(o),t=k(o);return function(r,n){switch(typeof r=="string"?r.toLowerCase():r){case"keccak224":return new i(1152,448,null,224,n);case"keccak256":return new i(1088,512,null,256,n);case"keccak384":return new i(832,768,null,384,n);case"keccak512":return new i(576,1024,null,512,n);case"sha3-224":return new i(1152,448,6,224,n);case"sha3-256":return new i(1088,512,6,256,n);case"sha3-384":return new i(832,768,6,384,n);case"sha3-512":return new i(576,1024,6,512,n);case"shake128":return new t(1344,256,31,n);case"shake256":return new t(1088,512,31,n);default:throw new Error("Invald algorithm: "+r)}}},F=w(_),b=x;function x(o){o=o||{};var i=o.max||Number.MAX_SAFE_INTEGER,t=typeof o.start<"u"?o.start:Math.floor(Math.random()*i);return function(){return t=t%i,t++}}const T=f,S=b();var A=e;function e(o){const i=this;i.currentProvider=o}e.prototype.getBalance=h(2,"eth_getBalance");e.prototype.getCode=h(2,"eth_getCode");e.prototype.getTransactionCount=h(2,"eth_getTransactionCount");e.prototype.getStorageAt=h(3,"eth_getStorageAt");e.prototype.call=h(2,"eth_call");e.prototype.protocolVersion=s("eth_protocolVersion");e.prototype.syncing=s("eth_syncing");e.prototype.coinbase=s("eth_coinbase");e.prototype.mining=s("eth_mining");e.prototype.hashrate=s("eth_hashrate");e.prototype.gasPrice=s("eth_gasPrice");e.prototype.accounts=s("eth_accounts");e.prototype.blockNumber=s("eth_blockNumber");e.prototype.getBlockTransactionCountByHash=s("eth_getBlockTransactionCountByHash");e.prototype.getBlockTransactionCountByNumber=s("eth_getBlockTransactionCountByNumber");e.prototype.getUncleCountByBlockHash=s("eth_getUncleCountByBlockHash");e.prototype.getUncleCountByBlockNumber=s("eth_getUncleCountByBlockNumber");e.prototype.sign=s("eth_sign");e.prototype.sendTransaction=s("eth_sendTransaction");e.prototype.sendRawTransaction=s("eth_sendRawTransaction");e.prototype.estimateGas=s("eth_estimateGas");e.prototype.getBlockByHash=s("eth_getBlockByHash");e.prototype.getBlockByNumber=s("eth_getBlockByNumber");e.prototype.getTransactionByHash=s("eth_getTransactionByHash");e.prototype.getTransactionByBlockHashAndIndex=s("eth_getTransactionByBlockHashAndIndex");e.prototype.getTransactionByBlockNumberAndIndex=s("eth_getTransactionByBlockNumberAndIndex");e.prototype.getTransactionReceipt=s("eth_getTransactionReceipt");e.prototype.getUncleByBlockHashAndIndex=s("eth_getUncleByBlockHashAndIndex");e.prototype.getUncleByBlockNumberAndIndex=s("eth_getUncleByBlockNumberAndIndex");e.prototype.getCompilers=s("eth_getCompilers");e.prototype.compileLLL=s("eth_compileLLL");e.prototype.compileSolidity=s("eth_compileSolidity");e.prototype.compileSerpent=s("eth_compileSerpent");e.prototype.newFilter=s("eth_newFilter");e.prototype.newBlockFilter=s("eth_newBlockFilter");e.prototype.newPendingTransactionFilter=s("eth_newPendingTransactionFilter");e.prototype.uninstallFilter=s("eth_uninstallFilter");e.prototype.getFilterChanges=s("eth_getFilterChanges");e.prototype.getFilterLogs=s("eth_getFilterLogs");e.prototype.getLogs=s("eth_getLogs");e.prototype.getWork=s("eth_getWork");e.prototype.submitWork=s("eth_submitWork");e.prototype.submitHashrate=s("eth_submitHashrate");e.prototype.sendAsync=function(o,i){this.currentProvider.sendAsync(z(o),function(r,n){if(!r&&n.error&&(r=new Error("EthQuery - RPC Error - "+n.error.message)),r)return i(r);i(null,n.result)})};function s(o){return function(){const i=this;var t=[].slice.call(arguments),r=t.pop();i.sendAsync({method:o,params:t},r)}}function h(o,i){return function(){const t=this;var r=[].slice.call(arguments),n=r.pop();r.length<o&&r.push("latest"),t.sendAsync({method:i,params:r},n)}}function z(o){return T({id:S(),jsonrpc:"2.0",params:[]},o)}export{A as e,F as j};
