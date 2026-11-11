const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/WorkspaceRegion-C4POu-hq.js","assets/draft-store-KwoiYtx0.js","assets/move-task-CAh5Y0Lr.js","assets/TaskEditor-BxcC-ooL.js","assets/StepTreeEditor-D691zFMs.js","assets/task-actions-fpdlF5qM.js","assets/PlanImporter-DhVoyeL-.js","assets/TaskFocusView-DXsS75w-.js","assets/CanvasIdeas-BJ7e5S5_.js","assets/TodayPlanPanel-DAarIp4A.js"])))=>i.map(i=>d[i]);
var IE=Object.defineProperty;var SE=(t,e,n)=>e in t?IE(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var bp=(t,e,n)=>SE(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function AE(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var vy={exports:{}},au={},_y={exports:{}},le={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Wo=Symbol.for("react.element"),RE=Symbol.for("react.portal"),kE=Symbol.for("react.fragment"),PE=Symbol.for("react.strict_mode"),CE=Symbol.for("react.profiler"),NE=Symbol.for("react.provider"),xE=Symbol.for("react.context"),DE=Symbol.for("react.forward_ref"),VE=Symbol.for("react.suspense"),OE=Symbol.for("react.memo"),LE=Symbol.for("react.lazy"),Fp=Symbol.iterator;function ME(t){return t===null||typeof t!="object"?null:(t=Fp&&t[Fp]||t["@@iterator"],typeof t=="function"?t:null)}var wy={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Ey=Object.assign,Ty={};function ms(t,e,n){this.props=t,this.context=e,this.refs=Ty,this.updater=n||wy}ms.prototype.isReactComponent={};ms.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ms.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Iy(){}Iy.prototype=ms.prototype;function nd(t,e,n){this.props=t,this.context=e,this.refs=Ty,this.updater=n||wy}var rd=nd.prototype=new Iy;rd.constructor=nd;Ey(rd,ms.prototype);rd.isPureReactComponent=!0;var Up=Array.isArray,Sy=Object.prototype.hasOwnProperty,id={current:null},Ay={key:!0,ref:!0,__self:!0,__source:!0};function Ry(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)Sy.call(e,r)&&!Ay.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var u=Array(l),h=0;h<l;h++)u[h]=arguments[h+2];i.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:Wo,type:t,key:s,ref:o,props:i,_owner:id.current}}function bE(t,e){return{$$typeof:Wo,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function sd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Wo}function FE(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var jp=/\/+/g;function nc(t,e){return typeof t=="object"&&t!==null&&t.key!=null?FE(""+t.key):e.toString(36)}function Xa(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case Wo:case RE:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+nc(o,0):r,Up(i)?(n="",t!=null&&(n=t.replace(jp,"$&/")+"/"),Xa(i,e,n,"",function(h){return h})):i!=null&&(sd(i)&&(i=bE(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(jp,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",Up(t))for(var l=0;l<t.length;l++){s=t[l];var u=r+nc(s,l);o+=Xa(s,e,n,u,i)}else if(u=ME(t),typeof u=="function")for(t=u.call(t),l=0;!(s=t.next()).done;)s=s.value,u=r+nc(s,l++),o+=Xa(s,e,n,u,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Ca(t,e,n){if(t==null)return t;var r=[],i=0;return Xa(t,r,"","",function(s){return e.call(n,s,i++)}),r}function UE(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var kt={current:null},Ja={transition:null},jE={ReactCurrentDispatcher:kt,ReactCurrentBatchConfig:Ja,ReactCurrentOwner:id};function ky(){throw Error("act(...) is not supported in production builds of React.")}le.Children={map:Ca,forEach:function(t,e,n){Ca(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ca(t,function(){e++}),e},toArray:function(t){return Ca(t,function(e){return e})||[]},only:function(t){if(!sd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};le.Component=ms;le.Fragment=kE;le.Profiler=CE;le.PureComponent=nd;le.StrictMode=PE;le.Suspense=VE;le.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=jE;le.act=ky;le.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=Ey({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=id.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)Sy.call(e,u)&&!Ay.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var h=0;h<u;h++)l[h]=arguments[h+2];r.children=l}return{$$typeof:Wo,type:t.type,key:i,ref:s,props:r,_owner:o}};le.createContext=function(t){return t={$$typeof:xE,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:NE,_context:t},t.Consumer=t};le.createElement=Ry;le.createFactory=function(t){var e=Ry.bind(null,t);return e.type=t,e};le.createRef=function(){return{current:null}};le.forwardRef=function(t){return{$$typeof:DE,render:t}};le.isValidElement=sd;le.lazy=function(t){return{$$typeof:LE,_payload:{_status:-1,_result:t},_init:UE}};le.memo=function(t,e){return{$$typeof:OE,type:t,compare:e===void 0?null:e}};le.startTransition=function(t){var e=Ja.transition;Ja.transition={};try{t()}finally{Ja.transition=e}};le.unstable_act=ky;le.useCallback=function(t,e){return kt.current.useCallback(t,e)};le.useContext=function(t){return kt.current.useContext(t)};le.useDebugValue=function(){};le.useDeferredValue=function(t){return kt.current.useDeferredValue(t)};le.useEffect=function(t,e){return kt.current.useEffect(t,e)};le.useId=function(){return kt.current.useId()};le.useImperativeHandle=function(t,e,n){return kt.current.useImperativeHandle(t,e,n)};le.useInsertionEffect=function(t,e){return kt.current.useInsertionEffect(t,e)};le.useLayoutEffect=function(t,e){return kt.current.useLayoutEffect(t,e)};le.useMemo=function(t,e){return kt.current.useMemo(t,e)};le.useReducer=function(t,e,n){return kt.current.useReducer(t,e,n)};le.useRef=function(t){return kt.current.useRef(t)};le.useState=function(t){return kt.current.useState(t)};le.useSyncExternalStore=function(t,e,n){return kt.current.useSyncExternalStore(t,e,n)};le.useTransition=function(){return kt.current.useTransition()};le.version="18.3.1";_y.exports=le;var K=_y.exports;const zE=AE(K);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var BE=K,$E=Symbol.for("react.element"),WE=Symbol.for("react.fragment"),qE=Object.prototype.hasOwnProperty,HE=BE.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,KE={key:!0,ref:!0,__self:!0,__source:!0};function Py(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)qE.call(e,r)&&!KE.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:$E,type:t,key:s,ref:o,props:i,_owner:HE.current}}au.Fragment=WE;au.jsx=Py;au.jsxs=Py;vy.exports=au;var z=vy.exports,Cy={exports:{}},Wt={},Ny={exports:{}},xy={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(B,Y){var X=B.length;B.push(Y);e:for(;0<X;){var ce=X-1>>>1,O=B[ce];if(0<i(O,Y))B[ce]=Y,B[X]=O,X=ce;else break e}}function n(B){return B.length===0?null:B[0]}function r(B){if(B.length===0)return null;var Y=B[0],X=B.pop();if(X!==Y){B[0]=X;e:for(var ce=0,O=B.length,W=O>>>1;ce<W;){var ae=2*(ce+1)-1,te=B[ae],oe=ae+1,ye=B[oe];if(0>i(te,X))oe<O&&0>i(ye,te)?(B[ce]=ye,B[oe]=X,ce=oe):(B[ce]=te,B[ae]=X,ce=ae);else if(oe<O&&0>i(ye,X))B[ce]=ye,B[oe]=X,ce=oe;else break e}}return Y}function i(B,Y){var X=B.sortIndex-Y.sortIndex;return X!==0?X:B.id-Y.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],h=[],f=1,p=null,m=3,S=!1,P=!1,N=!1,L=typeof setTimeout=="function"?setTimeout:null,v=typeof clearTimeout=="function"?clearTimeout:null,w=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function A(B){for(var Y=n(h);Y!==null;){if(Y.callback===null)r(h);else if(Y.startTime<=B)r(h),Y.sortIndex=Y.expirationTime,e(u,Y);else break;Y=n(h)}}function x(B){if(N=!1,A(B),!P)if(n(u)!==null)P=!0,ut(D);else{var Y=n(h);Y!==null&&G(x,Y.startTime-B)}}function D(B,Y){P=!1,N&&(N=!1,v(y),y=-1),S=!0;var X=m;try{for(A(Y),p=n(u);p!==null&&(!(p.expirationTime>Y)||B&&!R());){var ce=p.callback;if(typeof ce=="function"){p.callback=null,m=p.priorityLevel;var O=ce(p.expirationTime<=Y);Y=t.unstable_now(),typeof O=="function"?p.callback=O:p===n(u)&&r(u),A(Y)}else r(u);p=n(u)}if(p!==null)var W=!0;else{var ae=n(h);ae!==null&&G(x,ae.startTime-Y),W=!1}return W}finally{p=null,m=X,S=!1}}var b=!1,T=null,y=-1,E=5,I=-1;function R(){return!(t.unstable_now()-I<E)}function k(){if(T!==null){var B=t.unstable_now();I=B;var Y=!0;try{Y=T(!0,B)}finally{Y?_():(b=!1,T=null)}}else b=!1}var _;if(typeof w=="function")_=function(){w(k)};else if(typeof MessageChannel<"u"){var ie=new MessageChannel,ze=ie.port2;ie.port1.onmessage=k,_=function(){ze.postMessage(null)}}else _=function(){L(k,0)};function ut(B){T=B,b||(b=!0,_())}function G(B,Y){y=L(function(){B(t.unstable_now())},Y)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(B){B.callback=null},t.unstable_continueExecution=function(){P||S||(P=!0,ut(D))},t.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):E=0<B?Math.floor(1e3/B):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function(B){switch(m){case 1:case 2:case 3:var Y=3;break;default:Y=m}var X=m;m=Y;try{return B()}finally{m=X}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(B,Y){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var X=m;m=B;try{return Y()}finally{m=X}},t.unstable_scheduleCallback=function(B,Y,X){var ce=t.unstable_now();switch(typeof X=="object"&&X!==null?(X=X.delay,X=typeof X=="number"&&0<X?ce+X:ce):X=ce,B){case 1:var O=-1;break;case 2:O=250;break;case 5:O=1073741823;break;case 4:O=1e4;break;default:O=5e3}return O=X+O,B={id:f++,callback:Y,priorityLevel:B,startTime:X,expirationTime:O,sortIndex:-1},X>ce?(B.sortIndex=X,e(h,B),n(u)===null&&B===n(h)&&(N?(v(y),y=-1):N=!0,G(x,X-ce))):(B.sortIndex=O,e(u,B),P||S||(P=!0,ut(D))),B},t.unstable_shouldYield=R,t.unstable_wrapCallback=function(B){var Y=m;return function(){var X=m;m=Y;try{return B.apply(this,arguments)}finally{m=X}}}})(xy);Ny.exports=xy;var GE=Ny.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var QE=K,$t=GE;function U(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Dy=new Set,go={};function pi(t,e){ts(t,e),ts(t+"Capture",e)}function ts(t,e){for(go[t]=e,t=0;t<e.length;t++)Dy.add(e[t])}var Ln=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Uc=Object.prototype.hasOwnProperty,YE=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,zp={},Bp={};function XE(t){return Uc.call(Bp,t)?!0:Uc.call(zp,t)?!1:YE.test(t)?Bp[t]=!0:(zp[t]=!0,!1)}function JE(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function ZE(t,e,n,r){if(e===null||typeof e>"u"||JE(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Pt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var at={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){at[t]=new Pt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];at[e]=new Pt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){at[t]=new Pt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){at[t]=new Pt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){at[t]=new Pt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){at[t]=new Pt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){at[t]=new Pt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){at[t]=new Pt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){at[t]=new Pt(t,5,!1,t.toLowerCase(),null,!1,!1)});var od=/[\-:]([a-z])/g;function ad(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(od,ad);at[e]=new Pt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(od,ad);at[e]=new Pt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(od,ad);at[e]=new Pt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){at[t]=new Pt(t,1,!1,t.toLowerCase(),null,!1,!1)});at.xlinkHref=new Pt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){at[t]=new Pt(t,1,!1,t.toLowerCase(),null,!0,!0)});function ld(t,e,n,r){var i=at.hasOwnProperty(e)?at[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(ZE(e,n,i,r)&&(n=null),r||i===null?XE(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var $n=QE.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Na=Symbol.for("react.element"),Di=Symbol.for("react.portal"),Vi=Symbol.for("react.fragment"),ud=Symbol.for("react.strict_mode"),jc=Symbol.for("react.profiler"),Vy=Symbol.for("react.provider"),Oy=Symbol.for("react.context"),cd=Symbol.for("react.forward_ref"),zc=Symbol.for("react.suspense"),Bc=Symbol.for("react.suspense_list"),hd=Symbol.for("react.memo"),rr=Symbol.for("react.lazy"),Ly=Symbol.for("react.offscreen"),$p=Symbol.iterator;function Fs(t){return t===null||typeof t!="object"?null:(t=$p&&t[$p]||t["@@iterator"],typeof t=="function"?t:null)}var Ce=Object.assign,rc;function Ks(t){if(rc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);rc=e&&e[1]||""}return`
`+rc+t}var ic=!1;function sc(t,e){if(!t||ic)return"";ic=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(h){var r=h}Reflect.construct(t,[],e)}else{try{e.call()}catch(h){r=h}t.call(e.prototype)}else{try{throw Error()}catch(h){r=h}t()}}catch(h){if(h&&r&&typeof h.stack=="string"){for(var i=h.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var u=`
`+i[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{ic=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Ks(t):""}function eT(t){switch(t.tag){case 5:return Ks(t.type);case 16:return Ks("Lazy");case 13:return Ks("Suspense");case 19:return Ks("SuspenseList");case 0:case 2:case 15:return t=sc(t.type,!1),t;case 11:return t=sc(t.type.render,!1),t;case 1:return t=sc(t.type,!0),t;default:return""}}function $c(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Vi:return"Fragment";case Di:return"Portal";case jc:return"Profiler";case ud:return"StrictMode";case zc:return"Suspense";case Bc:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Oy:return(t.displayName||"Context")+".Consumer";case Vy:return(t._context.displayName||"Context")+".Provider";case cd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case hd:return e=t.displayName||null,e!==null?e:$c(t.type)||"Memo";case rr:e=t._payload,t=t._init;try{return $c(t(e))}catch{}}return null}function tT(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return $c(e);case 8:return e===ud?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Ar(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function My(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function nT(t){var e=My(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function xa(t){t._valueTracker||(t._valueTracker=nT(t))}function by(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=My(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function vl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function Wc(t,e){var n=e.checked;return Ce({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Wp(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=Ar(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Fy(t,e){e=e.checked,e!=null&&ld(t,"checked",e,!1)}function qc(t,e){Fy(t,e);var n=Ar(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?Hc(t,e.type,n):e.hasOwnProperty("defaultValue")&&Hc(t,e.type,Ar(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function qp(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function Hc(t,e,n){(e!=="number"||vl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Gs=Array.isArray;function qi(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+Ar(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function Kc(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(U(91));return Ce({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function Hp(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(U(92));if(Gs(n)){if(1<n.length)throw Error(U(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Ar(n)}}function Uy(t,e){var n=Ar(e.value),r=Ar(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function Kp(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function jy(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Gc(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?jy(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Da,zy=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Da=Da||document.createElement("div"),Da.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Da.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function yo(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var eo={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},rT=["Webkit","ms","Moz","O"];Object.keys(eo).forEach(function(t){rT.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),eo[e]=eo[t]})});function By(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||eo.hasOwnProperty(t)&&eo[t]?(""+e).trim():e+"px"}function $y(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=By(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var iT=Ce({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Qc(t,e){if(e){if(iT[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(U(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(U(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(U(61))}if(e.style!=null&&typeof e.style!="object")throw Error(U(62))}}function Yc(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Xc=null;function dd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Jc=null,Hi=null,Ki=null;function Gp(t){if(t=Ko(t)){if(typeof Jc!="function")throw Error(U(280));var e=t.stateNode;e&&(e=du(e),Jc(t.stateNode,t.type,e))}}function Wy(t){Hi?Ki?Ki.push(t):Ki=[t]:Hi=t}function qy(){if(Hi){var t=Hi,e=Ki;if(Ki=Hi=null,Gp(t),e)for(t=0;t<e.length;t++)Gp(e[t])}}function Hy(t,e){return t(e)}function Ky(){}var oc=!1;function Gy(t,e,n){if(oc)return t(e,n);oc=!0;try{return Hy(t,e,n)}finally{oc=!1,(Hi!==null||Ki!==null)&&(Ky(),qy())}}function vo(t,e){var n=t.stateNode;if(n===null)return null;var r=du(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(U(231,e,typeof n));return n}var Zc=!1;if(Ln)try{var Us={};Object.defineProperty(Us,"passive",{get:function(){Zc=!0}}),window.addEventListener("test",Us,Us),window.removeEventListener("test",Us,Us)}catch{Zc=!1}function sT(t,e,n,r,i,s,o,l,u){var h=Array.prototype.slice.call(arguments,3);try{e.apply(n,h)}catch(f){this.onError(f)}}var to=!1,_l=null,wl=!1,eh=null,oT={onError:function(t){to=!0,_l=t}};function aT(t,e,n,r,i,s,o,l,u){to=!1,_l=null,sT.apply(oT,arguments)}function lT(t,e,n,r,i,s,o,l,u){if(aT.apply(this,arguments),to){if(to){var h=_l;to=!1,_l=null}else throw Error(U(198));wl||(wl=!0,eh=h)}}function mi(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Qy(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Qp(t){if(mi(t)!==t)throw Error(U(188))}function uT(t){var e=t.alternate;if(!e){if(e=mi(t),e===null)throw Error(U(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return Qp(i),t;if(s===r)return Qp(i),e;s=s.sibling}throw Error(U(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(U(189))}}if(n.alternate!==r)throw Error(U(190))}if(n.tag!==3)throw Error(U(188));return n.stateNode.current===n?t:e}function Yy(t){return t=uT(t),t!==null?Xy(t):null}function Xy(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=Xy(t);if(e!==null)return e;t=t.sibling}return null}var Jy=$t.unstable_scheduleCallback,Yp=$t.unstable_cancelCallback,cT=$t.unstable_shouldYield,hT=$t.unstable_requestPaint,Me=$t.unstable_now,dT=$t.unstable_getCurrentPriorityLevel,fd=$t.unstable_ImmediatePriority,Zy=$t.unstable_UserBlockingPriority,El=$t.unstable_NormalPriority,fT=$t.unstable_LowPriority,ev=$t.unstable_IdlePriority,lu=null,mn=null;function pT(t){if(mn&&typeof mn.onCommitFiberRoot=="function")try{mn.onCommitFiberRoot(lu,t,void 0,(t.current.flags&128)===128)}catch{}}var on=Math.clz32?Math.clz32:yT,mT=Math.log,gT=Math.LN2;function yT(t){return t>>>=0,t===0?32:31-(mT(t)/gT|0)|0}var Va=64,Oa=4194304;function Qs(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Tl(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=Qs(l):(s&=o,s!==0&&(r=Qs(s)))}else o=n&~i,o!==0?r=Qs(o):s!==0&&(r=Qs(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-on(e),i=1<<n,r|=t[n],e&=~i;return r}function vT(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function _T(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-on(s),l=1<<o,u=i[o];u===-1?(!(l&n)||l&r)&&(i[o]=vT(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}}function th(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function tv(){var t=Va;return Va<<=1,!(Va&4194240)&&(Va=64),t}function ac(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function qo(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-on(e),t[e]=n}function wT(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-on(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function pd(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-on(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var _e=0;function nv(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var rv,md,iv,sv,ov,nh=!1,La=[],pr=null,mr=null,gr=null,_o=new Map,wo=new Map,sr=[],ET="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Xp(t,e){switch(t){case"focusin":case"focusout":pr=null;break;case"dragenter":case"dragleave":mr=null;break;case"mouseover":case"mouseout":gr=null;break;case"pointerover":case"pointerout":_o.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":wo.delete(e.pointerId)}}function js(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=Ko(e),e!==null&&md(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function TT(t,e,n,r,i){switch(e){case"focusin":return pr=js(pr,t,e,n,r,i),!0;case"dragenter":return mr=js(mr,t,e,n,r,i),!0;case"mouseover":return gr=js(gr,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return _o.set(s,js(_o.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,wo.set(s,js(wo.get(s)||null,t,e,n,r,i)),!0}return!1}function av(t){var e=Gr(t.target);if(e!==null){var n=mi(e);if(n!==null){if(e=n.tag,e===13){if(e=Qy(n),e!==null){t.blockedOn=e,ov(t.priority,function(){iv(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Za(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=rh(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);Xc=r,n.target.dispatchEvent(r),Xc=null}else return e=Ko(n),e!==null&&md(e),t.blockedOn=n,!1;e.shift()}return!0}function Jp(t,e,n){Za(t)&&n.delete(e)}function IT(){nh=!1,pr!==null&&Za(pr)&&(pr=null),mr!==null&&Za(mr)&&(mr=null),gr!==null&&Za(gr)&&(gr=null),_o.forEach(Jp),wo.forEach(Jp)}function zs(t,e){t.blockedOn===e&&(t.blockedOn=null,nh||(nh=!0,$t.unstable_scheduleCallback($t.unstable_NormalPriority,IT)))}function Eo(t){function e(i){return zs(i,t)}if(0<La.length){zs(La[0],t);for(var n=1;n<La.length;n++){var r=La[n];r.blockedOn===t&&(r.blockedOn=null)}}for(pr!==null&&zs(pr,t),mr!==null&&zs(mr,t),gr!==null&&zs(gr,t),_o.forEach(e),wo.forEach(e),n=0;n<sr.length;n++)r=sr[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<sr.length&&(n=sr[0],n.blockedOn===null);)av(n),n.blockedOn===null&&sr.shift()}var Gi=$n.ReactCurrentBatchConfig,Il=!0;function ST(t,e,n,r){var i=_e,s=Gi.transition;Gi.transition=null;try{_e=1,gd(t,e,n,r)}finally{_e=i,Gi.transition=s}}function AT(t,e,n,r){var i=_e,s=Gi.transition;Gi.transition=null;try{_e=4,gd(t,e,n,r)}finally{_e=i,Gi.transition=s}}function gd(t,e,n,r){if(Il){var i=rh(t,e,n,r);if(i===null)yc(t,e,r,Sl,n),Xp(t,r);else if(TT(i,t,e,n,r))r.stopPropagation();else if(Xp(t,r),e&4&&-1<ET.indexOf(t)){for(;i!==null;){var s=Ko(i);if(s!==null&&rv(s),s=rh(t,e,n,r),s===null&&yc(t,e,r,Sl,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else yc(t,e,r,null,n)}}var Sl=null;function rh(t,e,n,r){if(Sl=null,t=dd(r),t=Gr(t),t!==null)if(e=mi(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Qy(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Sl=t,null}function lv(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(dT()){case fd:return 1;case Zy:return 4;case El:case fT:return 16;case ev:return 536870912;default:return 16}default:return 16}}var hr=null,yd=null,el=null;function uv(){if(el)return el;var t,e=yd,n=e.length,r,i="value"in hr?hr.value:hr.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return el=i.slice(t,1<r?1-r:void 0)}function tl(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ma(){return!0}function Zp(){return!1}function qt(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Ma:Zp,this.isPropagationStopped=Zp,this}return Ce(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ma)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ma)},persist:function(){},isPersistent:Ma}),e}var gs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},vd=qt(gs),Ho=Ce({},gs,{view:0,detail:0}),RT=qt(Ho),lc,uc,Bs,uu=Ce({},Ho,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:_d,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Bs&&(Bs&&t.type==="mousemove"?(lc=t.screenX-Bs.screenX,uc=t.screenY-Bs.screenY):uc=lc=0,Bs=t),lc)},movementY:function(t){return"movementY"in t?t.movementY:uc}}),em=qt(uu),kT=Ce({},uu,{dataTransfer:0}),PT=qt(kT),CT=Ce({},Ho,{relatedTarget:0}),cc=qt(CT),NT=Ce({},gs,{animationName:0,elapsedTime:0,pseudoElement:0}),xT=qt(NT),DT=Ce({},gs,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),VT=qt(DT),OT=Ce({},gs,{data:0}),tm=qt(OT),LT={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},MT={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},bT={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function FT(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=bT[t])?!!e[t]:!1}function _d(){return FT}var UT=Ce({},Ho,{key:function(t){if(t.key){var e=LT[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=tl(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?MT[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:_d,charCode:function(t){return t.type==="keypress"?tl(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?tl(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),jT=qt(UT),zT=Ce({},uu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),nm=qt(zT),BT=Ce({},Ho,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:_d}),$T=qt(BT),WT=Ce({},gs,{propertyName:0,elapsedTime:0,pseudoElement:0}),qT=qt(WT),HT=Ce({},uu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),KT=qt(HT),GT=[9,13,27,32],wd=Ln&&"CompositionEvent"in window,no=null;Ln&&"documentMode"in document&&(no=document.documentMode);var QT=Ln&&"TextEvent"in window&&!no,cv=Ln&&(!wd||no&&8<no&&11>=no),rm=" ",im=!1;function hv(t,e){switch(t){case"keyup":return GT.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function dv(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Oi=!1;function YT(t,e){switch(t){case"compositionend":return dv(e);case"keypress":return e.which!==32?null:(im=!0,rm);case"textInput":return t=e.data,t===rm&&im?null:t;default:return null}}function XT(t,e){if(Oi)return t==="compositionend"||!wd&&hv(t,e)?(t=uv(),el=yd=hr=null,Oi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return cv&&e.locale!=="ko"?null:e.data;default:return null}}var JT={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function sm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!JT[t.type]:e==="textarea"}function fv(t,e,n,r){Wy(r),e=Al(e,"onChange"),0<e.length&&(n=new vd("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var ro=null,To=null;function ZT(t){Sv(t,0)}function cu(t){var e=bi(t);if(by(e))return t}function eI(t,e){if(t==="change")return e}var pv=!1;if(Ln){var hc;if(Ln){var dc="oninput"in document;if(!dc){var om=document.createElement("div");om.setAttribute("oninput","return;"),dc=typeof om.oninput=="function"}hc=dc}else hc=!1;pv=hc&&(!document.documentMode||9<document.documentMode)}function am(){ro&&(ro.detachEvent("onpropertychange",mv),To=ro=null)}function mv(t){if(t.propertyName==="value"&&cu(To)){var e=[];fv(e,To,t,dd(t)),Gy(ZT,e)}}function tI(t,e,n){t==="focusin"?(am(),ro=e,To=n,ro.attachEvent("onpropertychange",mv)):t==="focusout"&&am()}function nI(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return cu(To)}function rI(t,e){if(t==="click")return cu(e)}function iI(t,e){if(t==="input"||t==="change")return cu(e)}function sI(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var cn=typeof Object.is=="function"?Object.is:sI;function Io(t,e){if(cn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Uc.call(e,i)||!cn(t[i],e[i]))return!1}return!0}function lm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function um(t,e){var n=lm(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=lm(n)}}function gv(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?gv(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function yv(){for(var t=window,e=vl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=vl(t.document)}return e}function Ed(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function oI(t){var e=yv(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&gv(n.ownerDocument.documentElement,n)){if(r!==null&&Ed(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=um(n,s);var o=um(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var aI=Ln&&"documentMode"in document&&11>=document.documentMode,Li=null,ih=null,io=null,sh=!1;function cm(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;sh||Li==null||Li!==vl(r)||(r=Li,"selectionStart"in r&&Ed(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),io&&Io(io,r)||(io=r,r=Al(ih,"onSelect"),0<r.length&&(e=new vd("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=Li)))}function ba(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Mi={animationend:ba("Animation","AnimationEnd"),animationiteration:ba("Animation","AnimationIteration"),animationstart:ba("Animation","AnimationStart"),transitionend:ba("Transition","TransitionEnd")},fc={},vv={};Ln&&(vv=document.createElement("div").style,"AnimationEvent"in window||(delete Mi.animationend.animation,delete Mi.animationiteration.animation,delete Mi.animationstart.animation),"TransitionEvent"in window||delete Mi.transitionend.transition);function hu(t){if(fc[t])return fc[t];if(!Mi[t])return t;var e=Mi[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in vv)return fc[t]=e[n];return t}var _v=hu("animationend"),wv=hu("animationiteration"),Ev=hu("animationstart"),Tv=hu("transitionend"),Iv=new Map,hm="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Dr(t,e){Iv.set(t,e),pi(e,[t])}for(var pc=0;pc<hm.length;pc++){var mc=hm[pc],lI=mc.toLowerCase(),uI=mc[0].toUpperCase()+mc.slice(1);Dr(lI,"on"+uI)}Dr(_v,"onAnimationEnd");Dr(wv,"onAnimationIteration");Dr(Ev,"onAnimationStart");Dr("dblclick","onDoubleClick");Dr("focusin","onFocus");Dr("focusout","onBlur");Dr(Tv,"onTransitionEnd");ts("onMouseEnter",["mouseout","mouseover"]);ts("onMouseLeave",["mouseout","mouseover"]);ts("onPointerEnter",["pointerout","pointerover"]);ts("onPointerLeave",["pointerout","pointerover"]);pi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));pi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));pi("onBeforeInput",["compositionend","keypress","textInput","paste"]);pi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));pi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));pi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ys="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),cI=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ys));function dm(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,lT(r,e,void 0,t),t.currentTarget=null}function Sv(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,h=l.currentTarget;if(l=l.listener,u!==s&&i.isPropagationStopped())break e;dm(i,l,h),s=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,h=l.currentTarget,l=l.listener,u!==s&&i.isPropagationStopped())break e;dm(i,l,h),s=u}}}if(wl)throw t=eh,wl=!1,eh=null,t}function Se(t,e){var n=e[ch];n===void 0&&(n=e[ch]=new Set);var r=t+"__bubble";n.has(r)||(Av(e,t,2,!1),n.add(r))}function gc(t,e,n){var r=0;e&&(r|=4),Av(n,t,r,e)}var Fa="_reactListening"+Math.random().toString(36).slice(2);function So(t){if(!t[Fa]){t[Fa]=!0,Dy.forEach(function(n){n!=="selectionchange"&&(cI.has(n)||gc(n,!1,t),gc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Fa]||(e[Fa]=!0,gc("selectionchange",!1,e))}}function Av(t,e,n,r){switch(lv(e)){case 1:var i=ST;break;case 4:i=AT;break;default:i=gd}n=i.bind(null,e,n,t),i=void 0,!Zc||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function yc(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;l!==null;){if(o=Gr(l),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}l=l.parentNode}}r=r.return}Gy(function(){var h=s,f=dd(n),p=[];e:{var m=Iv.get(t);if(m!==void 0){var S=vd,P=t;switch(t){case"keypress":if(tl(n)===0)break e;case"keydown":case"keyup":S=jT;break;case"focusin":P="focus",S=cc;break;case"focusout":P="blur",S=cc;break;case"beforeblur":case"afterblur":S=cc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=em;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=PT;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=$T;break;case _v:case wv:case Ev:S=xT;break;case Tv:S=qT;break;case"scroll":S=RT;break;case"wheel":S=KT;break;case"copy":case"cut":case"paste":S=VT;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=nm}var N=(e&4)!==0,L=!N&&t==="scroll",v=N?m!==null?m+"Capture":null:m;N=[];for(var w=h,A;w!==null;){A=w;var x=A.stateNode;if(A.tag===5&&x!==null&&(A=x,v!==null&&(x=vo(w,v),x!=null&&N.push(Ao(w,x,A)))),L)break;w=w.return}0<N.length&&(m=new S(m,P,null,n,f),p.push({event:m,listeners:N}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",m&&n!==Xc&&(P=n.relatedTarget||n.fromElement)&&(Gr(P)||P[Mn]))break e;if((S||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,S?(P=n.relatedTarget||n.toElement,S=h,P=P?Gr(P):null,P!==null&&(L=mi(P),P!==L||P.tag!==5&&P.tag!==6)&&(P=null)):(S=null,P=h),S!==P)){if(N=em,x="onMouseLeave",v="onMouseEnter",w="mouse",(t==="pointerout"||t==="pointerover")&&(N=nm,x="onPointerLeave",v="onPointerEnter",w="pointer"),L=S==null?m:bi(S),A=P==null?m:bi(P),m=new N(x,w+"leave",S,n,f),m.target=L,m.relatedTarget=A,x=null,Gr(f)===h&&(N=new N(v,w+"enter",P,n,f),N.target=A,N.relatedTarget=L,x=N),L=x,S&&P)t:{for(N=S,v=P,w=0,A=N;A;A=Pi(A))w++;for(A=0,x=v;x;x=Pi(x))A++;for(;0<w-A;)N=Pi(N),w--;for(;0<A-w;)v=Pi(v),A--;for(;w--;){if(N===v||v!==null&&N===v.alternate)break t;N=Pi(N),v=Pi(v)}N=null}else N=null;S!==null&&fm(p,m,S,N,!1),P!==null&&L!==null&&fm(p,L,P,N,!0)}}e:{if(m=h?bi(h):window,S=m.nodeName&&m.nodeName.toLowerCase(),S==="select"||S==="input"&&m.type==="file")var D=eI;else if(sm(m))if(pv)D=iI;else{D=nI;var b=tI}else(S=m.nodeName)&&S.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(D=rI);if(D&&(D=D(t,h))){fv(p,D,n,f);break e}b&&b(t,m,h),t==="focusout"&&(b=m._wrapperState)&&b.controlled&&m.type==="number"&&Hc(m,"number",m.value)}switch(b=h?bi(h):window,t){case"focusin":(sm(b)||b.contentEditable==="true")&&(Li=b,ih=h,io=null);break;case"focusout":io=ih=Li=null;break;case"mousedown":sh=!0;break;case"contextmenu":case"mouseup":case"dragend":sh=!1,cm(p,n,f);break;case"selectionchange":if(aI)break;case"keydown":case"keyup":cm(p,n,f)}var T;if(wd)e:{switch(t){case"compositionstart":var y="onCompositionStart";break e;case"compositionend":y="onCompositionEnd";break e;case"compositionupdate":y="onCompositionUpdate";break e}y=void 0}else Oi?hv(t,n)&&(y="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(y="onCompositionStart");y&&(cv&&n.locale!=="ko"&&(Oi||y!=="onCompositionStart"?y==="onCompositionEnd"&&Oi&&(T=uv()):(hr=f,yd="value"in hr?hr.value:hr.textContent,Oi=!0)),b=Al(h,y),0<b.length&&(y=new tm(y,t,null,n,f),p.push({event:y,listeners:b}),T?y.data=T:(T=dv(n),T!==null&&(y.data=T)))),(T=QT?YT(t,n):XT(t,n))&&(h=Al(h,"onBeforeInput"),0<h.length&&(f=new tm("onBeforeInput","beforeinput",null,n,f),p.push({event:f,listeners:h}),f.data=T))}Sv(p,e)})}function Ao(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Al(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=vo(t,n),s!=null&&r.unshift(Ao(t,s,i)),s=vo(t,e),s!=null&&r.push(Ao(t,s,i))),t=t.return}return r}function Pi(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function fm(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,h=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&h!==null&&(l=h,i?(u=vo(n,s),u!=null&&o.unshift(Ao(n,u,l))):i||(u=vo(n,s),u!=null&&o.push(Ao(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var hI=/\r\n?/g,dI=/\u0000|\uFFFD/g;function pm(t){return(typeof t=="string"?t:""+t).replace(hI,`
`).replace(dI,"")}function Ua(t,e,n){if(e=pm(e),pm(t)!==e&&n)throw Error(U(425))}function Rl(){}var oh=null,ah=null;function lh(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var uh=typeof setTimeout=="function"?setTimeout:void 0,fI=typeof clearTimeout=="function"?clearTimeout:void 0,mm=typeof Promise=="function"?Promise:void 0,pI=typeof queueMicrotask=="function"?queueMicrotask:typeof mm<"u"?function(t){return mm.resolve(null).then(t).catch(mI)}:uh;function mI(t){setTimeout(function(){throw t})}function vc(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),Eo(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);Eo(e)}function yr(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function gm(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var ys=Math.random().toString(36).slice(2),pn="__reactFiber$"+ys,Ro="__reactProps$"+ys,Mn="__reactContainer$"+ys,ch="__reactEvents$"+ys,gI="__reactListeners$"+ys,yI="__reactHandles$"+ys;function Gr(t){var e=t[pn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Mn]||n[pn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=gm(t);t!==null;){if(n=t[pn])return n;t=gm(t)}return e}t=n,n=t.parentNode}return null}function Ko(t){return t=t[pn]||t[Mn],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function bi(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(U(33))}function du(t){return t[Ro]||null}var hh=[],Fi=-1;function Vr(t){return{current:t}}function Ae(t){0>Fi||(t.current=hh[Fi],hh[Fi]=null,Fi--)}function Te(t,e){Fi++,hh[Fi]=t.current,t.current=e}var Rr={},wt=Vr(Rr),Dt=Vr(!1),ri=Rr;function ns(t,e){var n=t.type.contextTypes;if(!n)return Rr;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function Vt(t){return t=t.childContextTypes,t!=null}function kl(){Ae(Dt),Ae(wt)}function ym(t,e,n){if(wt.current!==Rr)throw Error(U(168));Te(wt,e),Te(Dt,n)}function Rv(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(U(108,tT(t)||"Unknown",i));return Ce({},n,r)}function Pl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Rr,ri=wt.current,Te(wt,t),Te(Dt,Dt.current),!0}function vm(t,e,n){var r=t.stateNode;if(!r)throw Error(U(169));n?(t=Rv(t,e,ri),r.__reactInternalMemoizedMergedChildContext=t,Ae(Dt),Ae(wt),Te(wt,t)):Ae(Dt),Te(Dt,n)}var An=null,fu=!1,_c=!1;function kv(t){An===null?An=[t]:An.push(t)}function vI(t){fu=!0,kv(t)}function Or(){if(!_c&&An!==null){_c=!0;var t=0,e=_e;try{var n=An;for(_e=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}An=null,fu=!1}catch(i){throw An!==null&&(An=An.slice(t+1)),Jy(fd,Or),i}finally{_e=e,_c=!1}}return null}var Ui=[],ji=0,Cl=null,Nl=0,Kt=[],Gt=0,ii=null,kn=1,Pn="";function qr(t,e){Ui[ji++]=Nl,Ui[ji++]=Cl,Cl=t,Nl=e}function Pv(t,e,n){Kt[Gt++]=kn,Kt[Gt++]=Pn,Kt[Gt++]=ii,ii=t;var r=kn;t=Pn;var i=32-on(r)-1;r&=~(1<<i),n+=1;var s=32-on(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,kn=1<<32-on(e)+i|n<<i|r,Pn=s+t}else kn=1<<s|n<<i|r,Pn=t}function Td(t){t.return!==null&&(qr(t,1),Pv(t,1,0))}function Id(t){for(;t===Cl;)Cl=Ui[--ji],Ui[ji]=null,Nl=Ui[--ji],Ui[ji]=null;for(;t===ii;)ii=Kt[--Gt],Kt[Gt]=null,Pn=Kt[--Gt],Kt[Gt]=null,kn=Kt[--Gt],Kt[Gt]=null}var zt=null,Ut=null,Re=!1,sn=null;function Cv(t,e){var n=Qt(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function _m(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,zt=t,Ut=yr(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,zt=t,Ut=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=ii!==null?{id:kn,overflow:Pn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Qt(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,zt=t,Ut=null,!0):!1;default:return!1}}function dh(t){return(t.mode&1)!==0&&(t.flags&128)===0}function fh(t){if(Re){var e=Ut;if(e){var n=e;if(!_m(t,e)){if(dh(t))throw Error(U(418));e=yr(n.nextSibling);var r=zt;e&&_m(t,e)?Cv(r,n):(t.flags=t.flags&-4097|2,Re=!1,zt=t)}}else{if(dh(t))throw Error(U(418));t.flags=t.flags&-4097|2,Re=!1,zt=t}}}function wm(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;zt=t}function ja(t){if(t!==zt)return!1;if(!Re)return wm(t),Re=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!lh(t.type,t.memoizedProps)),e&&(e=Ut)){if(dh(t))throw Nv(),Error(U(418));for(;e;)Cv(t,e),e=yr(e.nextSibling)}if(wm(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(U(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){Ut=yr(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}Ut=null}}else Ut=zt?yr(t.stateNode.nextSibling):null;return!0}function Nv(){for(var t=Ut;t;)t=yr(t.nextSibling)}function rs(){Ut=zt=null,Re=!1}function Sd(t){sn===null?sn=[t]:sn.push(t)}var _I=$n.ReactCurrentBatchConfig;function $s(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(U(309));var r=n.stateNode}if(!r)throw Error(U(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(U(284));if(!n._owner)throw Error(U(290,t))}return t}function za(t,e){throw t=Object.prototype.toString.call(e),Error(U(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Em(t){var e=t._init;return e(t._payload)}function xv(t){function e(v,w){if(t){var A=v.deletions;A===null?(v.deletions=[w],v.flags|=16):A.push(w)}}function n(v,w){if(!t)return null;for(;w!==null;)e(v,w),w=w.sibling;return null}function r(v,w){for(v=new Map;w!==null;)w.key!==null?v.set(w.key,w):v.set(w.index,w),w=w.sibling;return v}function i(v,w){return v=Er(v,w),v.index=0,v.sibling=null,v}function s(v,w,A){return v.index=A,t?(A=v.alternate,A!==null?(A=A.index,A<w?(v.flags|=2,w):A):(v.flags|=2,w)):(v.flags|=1048576,w)}function o(v){return t&&v.alternate===null&&(v.flags|=2),v}function l(v,w,A,x){return w===null||w.tag!==6?(w=Rc(A,v.mode,x),w.return=v,w):(w=i(w,A),w.return=v,w)}function u(v,w,A,x){var D=A.type;return D===Vi?f(v,w,A.props.children,x,A.key):w!==null&&(w.elementType===D||typeof D=="object"&&D!==null&&D.$$typeof===rr&&Em(D)===w.type)?(x=i(w,A.props),x.ref=$s(v,w,A),x.return=v,x):(x=ll(A.type,A.key,A.props,null,v.mode,x),x.ref=$s(v,w,A),x.return=v,x)}function h(v,w,A,x){return w===null||w.tag!==4||w.stateNode.containerInfo!==A.containerInfo||w.stateNode.implementation!==A.implementation?(w=kc(A,v.mode,x),w.return=v,w):(w=i(w,A.children||[]),w.return=v,w)}function f(v,w,A,x,D){return w===null||w.tag!==7?(w=ei(A,v.mode,x,D),w.return=v,w):(w=i(w,A),w.return=v,w)}function p(v,w,A){if(typeof w=="string"&&w!==""||typeof w=="number")return w=Rc(""+w,v.mode,A),w.return=v,w;if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Na:return A=ll(w.type,w.key,w.props,null,v.mode,A),A.ref=$s(v,null,w),A.return=v,A;case Di:return w=kc(w,v.mode,A),w.return=v,w;case rr:var x=w._init;return p(v,x(w._payload),A)}if(Gs(w)||Fs(w))return w=ei(w,v.mode,A,null),w.return=v,w;za(v,w)}return null}function m(v,w,A,x){var D=w!==null?w.key:null;if(typeof A=="string"&&A!==""||typeof A=="number")return D!==null?null:l(v,w,""+A,x);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case Na:return A.key===D?u(v,w,A,x):null;case Di:return A.key===D?h(v,w,A,x):null;case rr:return D=A._init,m(v,w,D(A._payload),x)}if(Gs(A)||Fs(A))return D!==null?null:f(v,w,A,x,null);za(v,A)}return null}function S(v,w,A,x,D){if(typeof x=="string"&&x!==""||typeof x=="number")return v=v.get(A)||null,l(w,v,""+x,D);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Na:return v=v.get(x.key===null?A:x.key)||null,u(w,v,x,D);case Di:return v=v.get(x.key===null?A:x.key)||null,h(w,v,x,D);case rr:var b=x._init;return S(v,w,A,b(x._payload),D)}if(Gs(x)||Fs(x))return v=v.get(A)||null,f(w,v,x,D,null);za(w,x)}return null}function P(v,w,A,x){for(var D=null,b=null,T=w,y=w=0,E=null;T!==null&&y<A.length;y++){T.index>y?(E=T,T=null):E=T.sibling;var I=m(v,T,A[y],x);if(I===null){T===null&&(T=E);break}t&&T&&I.alternate===null&&e(v,T),w=s(I,w,y),b===null?D=I:b.sibling=I,b=I,T=E}if(y===A.length)return n(v,T),Re&&qr(v,y),D;if(T===null){for(;y<A.length;y++)T=p(v,A[y],x),T!==null&&(w=s(T,w,y),b===null?D=T:b.sibling=T,b=T);return Re&&qr(v,y),D}for(T=r(v,T);y<A.length;y++)E=S(T,v,y,A[y],x),E!==null&&(t&&E.alternate!==null&&T.delete(E.key===null?y:E.key),w=s(E,w,y),b===null?D=E:b.sibling=E,b=E);return t&&T.forEach(function(R){return e(v,R)}),Re&&qr(v,y),D}function N(v,w,A,x){var D=Fs(A);if(typeof D!="function")throw Error(U(150));if(A=D.call(A),A==null)throw Error(U(151));for(var b=D=null,T=w,y=w=0,E=null,I=A.next();T!==null&&!I.done;y++,I=A.next()){T.index>y?(E=T,T=null):E=T.sibling;var R=m(v,T,I.value,x);if(R===null){T===null&&(T=E);break}t&&T&&R.alternate===null&&e(v,T),w=s(R,w,y),b===null?D=R:b.sibling=R,b=R,T=E}if(I.done)return n(v,T),Re&&qr(v,y),D;if(T===null){for(;!I.done;y++,I=A.next())I=p(v,I.value,x),I!==null&&(w=s(I,w,y),b===null?D=I:b.sibling=I,b=I);return Re&&qr(v,y),D}for(T=r(v,T);!I.done;y++,I=A.next())I=S(T,v,y,I.value,x),I!==null&&(t&&I.alternate!==null&&T.delete(I.key===null?y:I.key),w=s(I,w,y),b===null?D=I:b.sibling=I,b=I);return t&&T.forEach(function(k){return e(v,k)}),Re&&qr(v,y),D}function L(v,w,A,x){if(typeof A=="object"&&A!==null&&A.type===Vi&&A.key===null&&(A=A.props.children),typeof A=="object"&&A!==null){switch(A.$$typeof){case Na:e:{for(var D=A.key,b=w;b!==null;){if(b.key===D){if(D=A.type,D===Vi){if(b.tag===7){n(v,b.sibling),w=i(b,A.props.children),w.return=v,v=w;break e}}else if(b.elementType===D||typeof D=="object"&&D!==null&&D.$$typeof===rr&&Em(D)===b.type){n(v,b.sibling),w=i(b,A.props),w.ref=$s(v,b,A),w.return=v,v=w;break e}n(v,b);break}else e(v,b);b=b.sibling}A.type===Vi?(w=ei(A.props.children,v.mode,x,A.key),w.return=v,v=w):(x=ll(A.type,A.key,A.props,null,v.mode,x),x.ref=$s(v,w,A),x.return=v,v=x)}return o(v);case Di:e:{for(b=A.key;w!==null;){if(w.key===b)if(w.tag===4&&w.stateNode.containerInfo===A.containerInfo&&w.stateNode.implementation===A.implementation){n(v,w.sibling),w=i(w,A.children||[]),w.return=v,v=w;break e}else{n(v,w);break}else e(v,w);w=w.sibling}w=kc(A,v.mode,x),w.return=v,v=w}return o(v);case rr:return b=A._init,L(v,w,b(A._payload),x)}if(Gs(A))return P(v,w,A,x);if(Fs(A))return N(v,w,A,x);za(v,A)}return typeof A=="string"&&A!==""||typeof A=="number"?(A=""+A,w!==null&&w.tag===6?(n(v,w.sibling),w=i(w,A),w.return=v,v=w):(n(v,w),w=Rc(A,v.mode,x),w.return=v,v=w),o(v)):n(v,w)}return L}var is=xv(!0),Dv=xv(!1),xl=Vr(null),Dl=null,zi=null,Ad=null;function Rd(){Ad=zi=Dl=null}function kd(t){var e=xl.current;Ae(xl),t._currentValue=e}function ph(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Qi(t,e){Dl=t,Ad=zi=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(xt=!0),t.firstContext=null)}function Xt(t){var e=t._currentValue;if(Ad!==t)if(t={context:t,memoizedValue:e,next:null},zi===null){if(Dl===null)throw Error(U(308));zi=t,Dl.dependencies={lanes:0,firstContext:t}}else zi=zi.next=t;return e}var Qr=null;function Pd(t){Qr===null?Qr=[t]:Qr.push(t)}function Vv(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,Pd(e)):(n.next=i.next,i.next=n),e.interleaved=n,bn(t,r)}function bn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var ir=!1;function Cd(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ov(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Vn(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function vr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,fe&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,bn(t,n)}return i=r.interleaved,i===null?(e.next=e,Pd(r)):(e.next=i.next,i.next=e),r.interleaved=e,bn(t,n)}function nl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,pd(t,n)}}function Tm(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Vl(t,e,n,r){var i=t.updateQueue;ir=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var u=l,h=u.next;u.next=null,o===null?s=h:o.next=h,o=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=h:l.next=h,f.lastBaseUpdate=u))}if(s!==null){var p=i.baseState;o=0,f=h=u=null,l=s;do{var m=l.lane,S=l.eventTime;if((r&m)===m){f!==null&&(f=f.next={eventTime:S,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var P=t,N=l;switch(m=e,S=n,N.tag){case 1:if(P=N.payload,typeof P=="function"){p=P.call(S,p,m);break e}p=P;break e;case 3:P.flags=P.flags&-65537|128;case 0:if(P=N.payload,m=typeof P=="function"?P.call(S,p,m):P,m==null)break e;p=Ce({},p,m);break e;case 2:ir=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,m=i.effects,m===null?i.effects=[l]:m.push(l))}else S={eventTime:S,lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(h=f=S,u=p):f=f.next=S,o|=m;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;m=l,l=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(!0);if(f===null&&(u=p),i.baseState=u,i.firstBaseUpdate=h,i.lastBaseUpdate=f,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);oi|=o,t.lanes=o,t.memoizedState=p}}function Im(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(U(191,i));i.call(r)}}}var Go={},gn=Vr(Go),ko=Vr(Go),Po=Vr(Go);function Yr(t){if(t===Go)throw Error(U(174));return t}function Nd(t,e){switch(Te(Po,e),Te(ko,t),Te(gn,Go),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Gc(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=Gc(e,t)}Ae(gn),Te(gn,e)}function ss(){Ae(gn),Ae(ko),Ae(Po)}function Lv(t){Yr(Po.current);var e=Yr(gn.current),n=Gc(e,t.type);e!==n&&(Te(ko,t),Te(gn,n))}function xd(t){ko.current===t&&(Ae(gn),Ae(ko))}var ke=Vr(0);function Ol(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var wc=[];function Dd(){for(var t=0;t<wc.length;t++)wc[t]._workInProgressVersionPrimary=null;wc.length=0}var rl=$n.ReactCurrentDispatcher,Ec=$n.ReactCurrentBatchConfig,si=0,Pe=null,$e=null,Ye=null,Ll=!1,so=!1,Co=0,wI=0;function mt(){throw Error(U(321))}function Vd(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!cn(t[n],e[n]))return!1;return!0}function Od(t,e,n,r,i,s){if(si=s,Pe=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,rl.current=t===null||t.memoizedState===null?SI:AI,t=n(r,i),so){s=0;do{if(so=!1,Co=0,25<=s)throw Error(U(301));s+=1,Ye=$e=null,e.updateQueue=null,rl.current=RI,t=n(r,i)}while(so)}if(rl.current=Ml,e=$e!==null&&$e.next!==null,si=0,Ye=$e=Pe=null,Ll=!1,e)throw Error(U(300));return t}function Ld(){var t=Co!==0;return Co=0,t}function fn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ye===null?Pe.memoizedState=Ye=t:Ye=Ye.next=t,Ye}function Jt(){if($e===null){var t=Pe.alternate;t=t!==null?t.memoizedState:null}else t=$e.next;var e=Ye===null?Pe.memoizedState:Ye.next;if(e!==null)Ye=e,$e=t;else{if(t===null)throw Error(U(310));$e=t,t={memoizedState:$e.memoizedState,baseState:$e.baseState,baseQueue:$e.baseQueue,queue:$e.queue,next:null},Ye===null?Pe.memoizedState=Ye=t:Ye=Ye.next=t}return Ye}function No(t,e){return typeof e=="function"?e(t):e}function Tc(t){var e=Jt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=$e,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,u=null,h=s;do{var f=h.lane;if((si&f)===f)u!==null&&(u=u.next={lane:0,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null}),r=h.hasEagerState?h.eagerState:t(r,h.action);else{var p={lane:f,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null};u===null?(l=u=p,o=r):u=u.next=p,Pe.lanes|=f,oi|=f}h=h.next}while(h!==null&&h!==s);u===null?o=r:u.next=l,cn(r,e.memoizedState)||(xt=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,Pe.lanes|=s,oi|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function Ic(t){var e=Jt(),n=e.queue;if(n===null)throw Error(U(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);cn(s,e.memoizedState)||(xt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function Mv(){}function bv(t,e){var n=Pe,r=Jt(),i=e(),s=!cn(r.memoizedState,i);if(s&&(r.memoizedState=i,xt=!0),r=r.queue,Md(jv.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||Ye!==null&&Ye.memoizedState.tag&1){if(n.flags|=2048,xo(9,Uv.bind(null,n,r,i,e),void 0,null),Ze===null)throw Error(U(349));si&30||Fv(n,e,i)}return i}function Fv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Pe.updateQueue,e===null?(e={lastEffect:null,stores:null},Pe.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function Uv(t,e,n,r){e.value=n,e.getSnapshot=r,zv(e)&&Bv(t)}function jv(t,e,n){return n(function(){zv(e)&&Bv(t)})}function zv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!cn(t,n)}catch{return!0}}function Bv(t){var e=bn(t,1);e!==null&&an(e,t,1,-1)}function Sm(t){var e=fn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:t},e.queue=t,t=t.dispatch=II.bind(null,Pe,t),[e.memoizedState,t]}function xo(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=Pe.updateQueue,e===null?(e={lastEffect:null,stores:null},Pe.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function $v(){return Jt().memoizedState}function il(t,e,n,r){var i=fn();Pe.flags|=t,i.memoizedState=xo(1|e,n,void 0,r===void 0?null:r)}function pu(t,e,n,r){var i=Jt();r=r===void 0?null:r;var s=void 0;if($e!==null){var o=$e.memoizedState;if(s=o.destroy,r!==null&&Vd(r,o.deps)){i.memoizedState=xo(e,n,s,r);return}}Pe.flags|=t,i.memoizedState=xo(1|e,n,s,r)}function Am(t,e){return il(8390656,8,t,e)}function Md(t,e){return pu(2048,8,t,e)}function Wv(t,e){return pu(4,2,t,e)}function qv(t,e){return pu(4,4,t,e)}function Hv(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Kv(t,e,n){return n=n!=null?n.concat([t]):null,pu(4,4,Hv.bind(null,e,t),n)}function bd(){}function Gv(t,e){var n=Jt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Vd(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function Qv(t,e){var n=Jt();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&Vd(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function Yv(t,e,n){return si&21?(cn(n,e)||(n=tv(),Pe.lanes|=n,oi|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,xt=!0),t.memoizedState=n)}function EI(t,e){var n=_e;_e=n!==0&&4>n?n:4,t(!0);var r=Ec.transition;Ec.transition={};try{t(!1),e()}finally{_e=n,Ec.transition=r}}function Xv(){return Jt().memoizedState}function TI(t,e,n){var r=wr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Jv(t))Zv(e,n);else if(n=Vv(t,e,n,r),n!==null){var i=At();an(n,t,r,i),e_(n,e,r)}}function II(t,e,n){var r=wr(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Jv(t))Zv(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,cn(l,o)){var u=e.interleaved;u===null?(i.next=i,Pd(e)):(i.next=u.next,u.next=i),e.interleaved=i;return}}catch{}finally{}n=Vv(t,e,i,r),n!==null&&(i=At(),an(n,t,r,i),e_(n,e,r))}}function Jv(t){var e=t.alternate;return t===Pe||e!==null&&e===Pe}function Zv(t,e){so=Ll=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function e_(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,pd(t,n)}}var Ml={readContext:Xt,useCallback:mt,useContext:mt,useEffect:mt,useImperativeHandle:mt,useInsertionEffect:mt,useLayoutEffect:mt,useMemo:mt,useReducer:mt,useRef:mt,useState:mt,useDebugValue:mt,useDeferredValue:mt,useTransition:mt,useMutableSource:mt,useSyncExternalStore:mt,useId:mt,unstable_isNewReconciler:!1},SI={readContext:Xt,useCallback:function(t,e){return fn().memoizedState=[t,e===void 0?null:e],t},useContext:Xt,useEffect:Am,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,il(4194308,4,Hv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return il(4194308,4,t,e)},useInsertionEffect:function(t,e){return il(4,2,t,e)},useMemo:function(t,e){var n=fn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=fn();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=TI.bind(null,Pe,t),[r.memoizedState,t]},useRef:function(t){var e=fn();return t={current:t},e.memoizedState=t},useState:Sm,useDebugValue:bd,useDeferredValue:function(t){return fn().memoizedState=t},useTransition:function(){var t=Sm(!1),e=t[0];return t=EI.bind(null,t[1]),fn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=Pe,i=fn();if(Re){if(n===void 0)throw Error(U(407));n=n()}else{if(n=e(),Ze===null)throw Error(U(349));si&30||Fv(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,Am(jv.bind(null,r,s,t),[t]),r.flags|=2048,xo(9,Uv.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=fn(),e=Ze.identifierPrefix;if(Re){var n=Pn,r=kn;n=(r&~(1<<32-on(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=Co++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=wI++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},AI={readContext:Xt,useCallback:Gv,useContext:Xt,useEffect:Md,useImperativeHandle:Kv,useInsertionEffect:Wv,useLayoutEffect:qv,useMemo:Qv,useReducer:Tc,useRef:$v,useState:function(){return Tc(No)},useDebugValue:bd,useDeferredValue:function(t){var e=Jt();return Yv(e,$e.memoizedState,t)},useTransition:function(){var t=Tc(No)[0],e=Jt().memoizedState;return[t,e]},useMutableSource:Mv,useSyncExternalStore:bv,useId:Xv,unstable_isNewReconciler:!1},RI={readContext:Xt,useCallback:Gv,useContext:Xt,useEffect:Md,useImperativeHandle:Kv,useInsertionEffect:Wv,useLayoutEffect:qv,useMemo:Qv,useReducer:Ic,useRef:$v,useState:function(){return Ic(No)},useDebugValue:bd,useDeferredValue:function(t){var e=Jt();return $e===null?e.memoizedState=t:Yv(e,$e.memoizedState,t)},useTransition:function(){var t=Ic(No)[0],e=Jt().memoizedState;return[t,e]},useMutableSource:Mv,useSyncExternalStore:bv,useId:Xv,unstable_isNewReconciler:!1};function nn(t,e){if(t&&t.defaultProps){e=Ce({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function mh(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Ce({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var mu={isMounted:function(t){return(t=t._reactInternals)?mi(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=At(),i=wr(t),s=Vn(r,i);s.payload=e,n!=null&&(s.callback=n),e=vr(t,s,i),e!==null&&(an(e,t,i,r),nl(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=At(),i=wr(t),s=Vn(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=vr(t,s,i),e!==null&&(an(e,t,i,r),nl(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=At(),r=wr(t),i=Vn(n,r);i.tag=2,e!=null&&(i.callback=e),e=vr(t,i,r),e!==null&&(an(e,t,r,n),nl(e,t,r))}};function Rm(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!Io(n,r)||!Io(i,s):!0}function t_(t,e,n){var r=!1,i=Rr,s=e.contextType;return typeof s=="object"&&s!==null?s=Xt(s):(i=Vt(e)?ri:wt.current,r=e.contextTypes,s=(r=r!=null)?ns(t,i):Rr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=mu,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function km(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&mu.enqueueReplaceState(e,e.state,null)}function gh(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},Cd(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=Xt(s):(s=Vt(e)?ri:wt.current,i.context=ns(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(mh(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&mu.enqueueReplaceState(i,i.state,null),Vl(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function os(t,e){try{var n="",r=e;do n+=eT(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function Sc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function yh(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var kI=typeof WeakMap=="function"?WeakMap:Map;function n_(t,e,n){n=Vn(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){Fl||(Fl=!0,kh=r),yh(t,e)},n}function r_(t,e,n){n=Vn(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){yh(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){yh(t,e),typeof r!="function"&&(_r===null?_r=new Set([this]):_r.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function Pm(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new kI;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=zI.bind(null,t,e,n),e.then(t,t))}function Cm(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Nm(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=Vn(-1,1),e.tag=2,vr(n,e,1))),n.lanes|=1),t)}var PI=$n.ReactCurrentOwner,xt=!1;function It(t,e,n,r){e.child=t===null?Dv(e,null,n,r):is(e,t.child,n,r)}function xm(t,e,n,r,i){n=n.render;var s=e.ref;return Qi(e,i),r=Od(t,e,n,r,s,i),n=Ld(),t!==null&&!xt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Fn(t,e,i)):(Re&&n&&Td(e),e.flags|=1,It(t,e,r,i),e.child)}function Dm(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!qd(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,i_(t,e,s,r,i)):(t=ll(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:Io,n(o,r)&&t.ref===e.ref)return Fn(t,e,i)}return e.flags|=1,t=Er(s,r),t.ref=e.ref,t.return=e,e.child=t}function i_(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(Io(s,r)&&t.ref===e.ref)if(xt=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(xt=!0);else return e.lanes=t.lanes,Fn(t,e,i)}return vh(t,e,n,r,i)}function s_(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},Te($i,Ft),Ft|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,Te($i,Ft),Ft|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,Te($i,Ft),Ft|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,Te($i,Ft),Ft|=r;return It(t,e,i,n),e.child}function o_(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function vh(t,e,n,r,i){var s=Vt(n)?ri:wt.current;return s=ns(e,s),Qi(e,i),n=Od(t,e,n,r,s,i),r=Ld(),t!==null&&!xt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Fn(t,e,i)):(Re&&r&&Td(e),e.flags|=1,It(t,e,n,i),e.child)}function Vm(t,e,n,r,i){if(Vt(n)){var s=!0;Pl(e)}else s=!1;if(Qi(e,i),e.stateNode===null)sl(t,e),t_(e,n,r),gh(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,h=n.contextType;typeof h=="object"&&h!==null?h=Xt(h):(h=Vt(n)?ri:wt.current,h=ns(e,h));var f=n.getDerivedStateFromProps,p=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==h)&&km(e,o,r,h),ir=!1;var m=e.memoizedState;o.state=m,Vl(e,r,o,i),u=e.memoizedState,l!==r||m!==u||Dt.current||ir?(typeof f=="function"&&(mh(e,n,f,r),u=e.memoizedState),(l=ir||Rm(e,n,l,r,m,u,h))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=h,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,Ov(t,e),l=e.memoizedProps,h=e.type===e.elementType?l:nn(e.type,l),o.props=h,p=e.pendingProps,m=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=Xt(u):(u=Vt(n)?ri:wt.current,u=ns(e,u));var S=n.getDerivedStateFromProps;(f=typeof S=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==p||m!==u)&&km(e,o,r,u),ir=!1,m=e.memoizedState,o.state=m,Vl(e,r,o,i);var P=e.memoizedState;l!==p||m!==P||Dt.current||ir?(typeof S=="function"&&(mh(e,n,S,r),P=e.memoizedState),(h=ir||Rm(e,n,h,r,m,P,u)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,P,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,P,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=P),o.props=r,o.state=P,o.context=u,r=h):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),r=!1)}return _h(t,e,n,r,s,i)}function _h(t,e,n,r,i,s){o_(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&vm(e,n,!1),Fn(t,e,s);r=e.stateNode,PI.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=is(e,t.child,null,s),e.child=is(e,null,l,s)):It(t,e,l,s),e.memoizedState=r.state,i&&vm(e,n,!0),e.child}function a_(t){var e=t.stateNode;e.pendingContext?ym(t,e.pendingContext,e.pendingContext!==e.context):e.context&&ym(t,e.context,!1),Nd(t,e.containerInfo)}function Om(t,e,n,r,i){return rs(),Sd(i),e.flags|=256,It(t,e,n,r),e.child}var wh={dehydrated:null,treeContext:null,retryLane:0};function Eh(t){return{baseLanes:t,cachePool:null,transitions:null}}function l_(t,e,n){var r=e.pendingProps,i=ke.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),Te(ke,i&1),t===null)return fh(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=vu(o,r,0,null),t=ei(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Eh(n),e.memoizedState=wh,t):Fd(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return CI(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=Er(i,u),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=Er(l,s):(s=ei(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?Eh(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=wh,r}return s=t.child,t=s.sibling,r=Er(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function Fd(t,e){return e=vu({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Ba(t,e,n,r){return r!==null&&Sd(r),is(e,t.child,null,n),t=Fd(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function CI(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=Sc(Error(U(422))),Ba(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=vu({mode:"visible",children:r.children},i,0,null),s=ei(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&is(e,t.child,null,o),e.child.memoizedState=Eh(o),e.memoizedState=wh,s);if(!(e.mode&1))return Ba(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(U(419)),r=Sc(s,r,void 0),Ba(t,e,o,r)}if(l=(o&t.childLanes)!==0,xt||l){if(r=Ze,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,bn(t,i),an(r,t,i,-1))}return Wd(),r=Sc(Error(U(421))),Ba(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=BI.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,Ut=yr(i.nextSibling),zt=e,Re=!0,sn=null,t!==null&&(Kt[Gt++]=kn,Kt[Gt++]=Pn,Kt[Gt++]=ii,kn=t.id,Pn=t.overflow,ii=e),e=Fd(e,r.children),e.flags|=4096,e)}function Lm(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),ph(t.return,e,n)}function Ac(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function u_(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(It(t,e,r.children,n),r=ke.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Lm(t,n,e);else if(t.tag===19)Lm(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(Te(ke,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&Ol(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),Ac(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&Ol(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}Ac(e,!0,n,null,s);break;case"together":Ac(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function sl(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Fn(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),oi|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(U(153));if(e.child!==null){for(t=e.child,n=Er(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Er(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function NI(t,e,n){switch(e.tag){case 3:a_(e),rs();break;case 5:Lv(e);break;case 1:Vt(e.type)&&Pl(e);break;case 4:Nd(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;Te(xl,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(Te(ke,ke.current&1),e.flags|=128,null):n&e.child.childLanes?l_(t,e,n):(Te(ke,ke.current&1),t=Fn(t,e,n),t!==null?t.sibling:null);Te(ke,ke.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return u_(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),Te(ke,ke.current),r)break;return null;case 22:case 23:return e.lanes=0,s_(t,e,n)}return Fn(t,e,n)}var c_,Th,h_,d_;c_=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Th=function(){};h_=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,Yr(gn.current);var s=null;switch(n){case"input":i=Wc(t,i),r=Wc(t,r),s=[];break;case"select":i=Ce({},i,{value:void 0}),r=Ce({},r,{value:void 0}),s=[];break;case"textarea":i=Kc(t,i),r=Kc(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=Rl)}Qc(n,r);var o;n=null;for(h in i)if(!r.hasOwnProperty(h)&&i.hasOwnProperty(h)&&i[h]!=null)if(h==="style"){var l=i[h];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else h!=="dangerouslySetInnerHTML"&&h!=="children"&&h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(go.hasOwnProperty(h)?s||(s=[]):(s=s||[]).push(h,null));for(h in r){var u=r[h];if(l=i!=null?i[h]:void 0,r.hasOwnProperty(h)&&u!==l&&(u!=null||l!=null))if(h==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(h,n)),n=u;else h==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(s=s||[]).push(h,u)):h==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(h,""+u):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&(go.hasOwnProperty(h)?(u!=null&&h==="onScroll"&&Se("scroll",t),s||l===u||(s=[])):(s=s||[]).push(h,u))}n&&(s=s||[]).push("style",n);var h=s;(e.updateQueue=h)&&(e.flags|=4)}};d_=function(t,e,n,r){n!==r&&(e.flags|=4)};function Ws(t,e){if(!Re)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function gt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function xI(t,e,n){var r=e.pendingProps;switch(Id(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return gt(e),null;case 1:return Vt(e.type)&&kl(),gt(e),null;case 3:return r=e.stateNode,ss(),Ae(Dt),Ae(wt),Dd(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(ja(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,sn!==null&&(Nh(sn),sn=null))),Th(t,e),gt(e),null;case 5:xd(e);var i=Yr(Po.current);if(n=e.type,t!==null&&e.stateNode!=null)h_(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(U(166));return gt(e),null}if(t=Yr(gn.current),ja(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[pn]=e,r[Ro]=s,t=(e.mode&1)!==0,n){case"dialog":Se("cancel",r),Se("close",r);break;case"iframe":case"object":case"embed":Se("load",r);break;case"video":case"audio":for(i=0;i<Ys.length;i++)Se(Ys[i],r);break;case"source":Se("error",r);break;case"img":case"image":case"link":Se("error",r),Se("load",r);break;case"details":Se("toggle",r);break;case"input":Wp(r,s),Se("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},Se("invalid",r);break;case"textarea":Hp(r,s),Se("invalid",r)}Qc(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&Ua(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&Ua(r.textContent,l,t),i=["children",""+l]):go.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&Se("scroll",r)}switch(n){case"input":xa(r),qp(r,s,!0);break;case"textarea":xa(r),Kp(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=Rl)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=jy(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[pn]=e,t[Ro]=r,c_(t,e,!1,!1),e.stateNode=t;e:{switch(o=Yc(n,r),n){case"dialog":Se("cancel",t),Se("close",t),i=r;break;case"iframe":case"object":case"embed":Se("load",t),i=r;break;case"video":case"audio":for(i=0;i<Ys.length;i++)Se(Ys[i],t);i=r;break;case"source":Se("error",t),i=r;break;case"img":case"image":case"link":Se("error",t),Se("load",t),i=r;break;case"details":Se("toggle",t),i=r;break;case"input":Wp(t,r),i=Wc(t,r),Se("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Ce({},r,{value:void 0}),Se("invalid",t);break;case"textarea":Hp(t,r),i=Kc(t,r),Se("invalid",t);break;default:i=r}Qc(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var u=l[s];s==="style"?$y(t,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&zy(t,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&yo(t,u):typeof u=="number"&&yo(t,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(go.hasOwnProperty(s)?u!=null&&s==="onScroll"&&Se("scroll",t):u!=null&&ld(t,s,u,o))}switch(n){case"input":xa(t),qp(t,r,!1);break;case"textarea":xa(t),Kp(t);break;case"option":r.value!=null&&t.setAttribute("value",""+Ar(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?qi(t,!!r.multiple,s,!1):r.defaultValue!=null&&qi(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=Rl)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return gt(e),null;case 6:if(t&&e.stateNode!=null)d_(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(U(166));if(n=Yr(Po.current),Yr(gn.current),ja(e)){if(r=e.stateNode,n=e.memoizedProps,r[pn]=e,(s=r.nodeValue!==n)&&(t=zt,t!==null))switch(t.tag){case 3:Ua(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Ua(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[pn]=e,e.stateNode=r}return gt(e),null;case 13:if(Ae(ke),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(Re&&Ut!==null&&e.mode&1&&!(e.flags&128))Nv(),rs(),e.flags|=98560,s=!1;else if(s=ja(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(U(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(U(317));s[pn]=e}else rs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;gt(e),s=!1}else sn!==null&&(Nh(sn),sn=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||ke.current&1?We===0&&(We=3):Wd())),e.updateQueue!==null&&(e.flags|=4),gt(e),null);case 4:return ss(),Th(t,e),t===null&&So(e.stateNode.containerInfo),gt(e),null;case 10:return kd(e.type._context),gt(e),null;case 17:return Vt(e.type)&&kl(),gt(e),null;case 19:if(Ae(ke),s=e.memoizedState,s===null)return gt(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)Ws(s,!1);else{if(We!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=Ol(t),o!==null){for(e.flags|=128,Ws(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return Te(ke,ke.current&1|2),e.child}t=t.sibling}s.tail!==null&&Me()>as&&(e.flags|=128,r=!0,Ws(s,!1),e.lanes=4194304)}else{if(!r)if(t=Ol(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Ws(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!Re)return gt(e),null}else 2*Me()-s.renderingStartTime>as&&n!==1073741824&&(e.flags|=128,r=!0,Ws(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=Me(),e.sibling=null,n=ke.current,Te(ke,r?n&1|2:n&1),e):(gt(e),null);case 22:case 23:return $d(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?Ft&1073741824&&(gt(e),e.subtreeFlags&6&&(e.flags|=8192)):gt(e),null;case 24:return null;case 25:return null}throw Error(U(156,e.tag))}function DI(t,e){switch(Id(e),e.tag){case 1:return Vt(e.type)&&kl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ss(),Ae(Dt),Ae(wt),Dd(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return xd(e),null;case 13:if(Ae(ke),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(U(340));rs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Ae(ke),null;case 4:return ss(),null;case 10:return kd(e.type._context),null;case 22:case 23:return $d(),null;case 24:return null;default:return null}}var $a=!1,_t=!1,VI=typeof WeakSet=="function"?WeakSet:Set,H=null;function Bi(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){De(t,e,r)}else n.current=null}function Ih(t,e,n){try{n()}catch(r){De(t,e,r)}}var Mm=!1;function OI(t,e){if(oh=Il,t=yv(),Ed(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,h=0,f=0,p=t,m=null;t:for(;;){for(var S;p!==n||i!==0&&p.nodeType!==3||(l=o+i),p!==s||r!==0&&p.nodeType!==3||(u=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(S=p.firstChild)!==null;)m=p,p=S;for(;;){if(p===t)break t;if(m===n&&++h===i&&(l=o),m===s&&++f===r&&(u=o),(S=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=S}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(ah={focusedElem:t,selectionRange:n},Il=!1,H=e;H!==null;)if(e=H,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,H=t;else for(;H!==null;){e=H;try{var P=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(P!==null){var N=P.memoizedProps,L=P.memoizedState,v=e.stateNode,w=v.getSnapshotBeforeUpdate(e.elementType===e.type?N:nn(e.type,N),L);v.__reactInternalSnapshotBeforeUpdate=w}break;case 3:var A=e.stateNode.containerInfo;A.nodeType===1?A.textContent="":A.nodeType===9&&A.documentElement&&A.removeChild(A.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(U(163))}}catch(x){De(e,e.return,x)}if(t=e.sibling,t!==null){t.return=e.return,H=t;break}H=e.return}return P=Mm,Mm=!1,P}function oo(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&Ih(e,n,s)}i=i.next}while(i!==r)}}function gu(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function Sh(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function f_(t){var e=t.alternate;e!==null&&(t.alternate=null,f_(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[pn],delete e[Ro],delete e[ch],delete e[gI],delete e[yI])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function p_(t){return t.tag===5||t.tag===3||t.tag===4}function bm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||p_(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Ah(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Rl));else if(r!==4&&(t=t.child,t!==null))for(Ah(t,e,n),t=t.sibling;t!==null;)Ah(t,e,n),t=t.sibling}function Rh(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(Rh(t,e,n),t=t.sibling;t!==null;)Rh(t,e,n),t=t.sibling}var nt=null,rn=!1;function tr(t,e,n){for(n=n.child;n!==null;)m_(t,e,n),n=n.sibling}function m_(t,e,n){if(mn&&typeof mn.onCommitFiberUnmount=="function")try{mn.onCommitFiberUnmount(lu,n)}catch{}switch(n.tag){case 5:_t||Bi(n,e);case 6:var r=nt,i=rn;nt=null,tr(t,e,n),nt=r,rn=i,nt!==null&&(rn?(t=nt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):nt.removeChild(n.stateNode));break;case 18:nt!==null&&(rn?(t=nt,n=n.stateNode,t.nodeType===8?vc(t.parentNode,n):t.nodeType===1&&vc(t,n),Eo(t)):vc(nt,n.stateNode));break;case 4:r=nt,i=rn,nt=n.stateNode.containerInfo,rn=!0,tr(t,e,n),nt=r,rn=i;break;case 0:case 11:case 14:case 15:if(!_t&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&Ih(n,e,o),i=i.next}while(i!==r)}tr(t,e,n);break;case 1:if(!_t&&(Bi(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){De(n,e,l)}tr(t,e,n);break;case 21:tr(t,e,n);break;case 22:n.mode&1?(_t=(r=_t)||n.memoizedState!==null,tr(t,e,n),_t=r):tr(t,e,n);break;default:tr(t,e,n)}}function Fm(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new VI),e.forEach(function(r){var i=$I.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function tn(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:nt=l.stateNode,rn=!1;break e;case 3:nt=l.stateNode.containerInfo,rn=!0;break e;case 4:nt=l.stateNode.containerInfo,rn=!0;break e}l=l.return}if(nt===null)throw Error(U(160));m_(s,o,i),nt=null,rn=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(h){De(i,e,h)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)g_(e,t),e=e.sibling}function g_(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(tn(e,t),dn(t),r&4){try{oo(3,t,t.return),gu(3,t)}catch(N){De(t,t.return,N)}try{oo(5,t,t.return)}catch(N){De(t,t.return,N)}}break;case 1:tn(e,t),dn(t),r&512&&n!==null&&Bi(n,n.return);break;case 5:if(tn(e,t),dn(t),r&512&&n!==null&&Bi(n,n.return),t.flags&32){var i=t.stateNode;try{yo(i,"")}catch(N){De(t,t.return,N)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&Fy(i,s),Yc(l,o);var h=Yc(l,s);for(o=0;o<u.length;o+=2){var f=u[o],p=u[o+1];f==="style"?$y(i,p):f==="dangerouslySetInnerHTML"?zy(i,p):f==="children"?yo(i,p):ld(i,f,p,h)}switch(l){case"input":qc(i,s);break;case"textarea":Uy(i,s);break;case"select":var m=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var S=s.value;S!=null?qi(i,!!s.multiple,S,!1):m!==!!s.multiple&&(s.defaultValue!=null?qi(i,!!s.multiple,s.defaultValue,!0):qi(i,!!s.multiple,s.multiple?[]:"",!1))}i[Ro]=s}catch(N){De(t,t.return,N)}}break;case 6:if(tn(e,t),dn(t),r&4){if(t.stateNode===null)throw Error(U(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(N){De(t,t.return,N)}}break;case 3:if(tn(e,t),dn(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Eo(e.containerInfo)}catch(N){De(t,t.return,N)}break;case 4:tn(e,t),dn(t);break;case 13:tn(e,t),dn(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(zd=Me())),r&4&&Fm(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(_t=(h=_t)||f,tn(e,t),_t=h):tn(e,t),dn(t),r&8192){if(h=t.memoizedState!==null,(t.stateNode.isHidden=h)&&!f&&t.mode&1)for(H=t,f=t.child;f!==null;){for(p=H=f;H!==null;){switch(m=H,S=m.child,m.tag){case 0:case 11:case 14:case 15:oo(4,m,m.return);break;case 1:Bi(m,m.return);var P=m.stateNode;if(typeof P.componentWillUnmount=="function"){r=m,n=m.return;try{e=r,P.props=e.memoizedProps,P.state=e.memoizedState,P.componentWillUnmount()}catch(N){De(r,n,N)}}break;case 5:Bi(m,m.return);break;case 22:if(m.memoizedState!==null){jm(p);continue}}S!==null?(S.return=m,H=S):jm(p)}f=f.sibling}e:for(f=null,p=t;;){if(p.tag===5){if(f===null){f=p;try{i=p.stateNode,h?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=p.stateNode,u=p.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=By("display",o))}catch(N){De(t,t.return,N)}}}else if(p.tag===6){if(f===null)try{p.stateNode.nodeValue=h?"":p.memoizedProps}catch(N){De(t,t.return,N)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;f===p&&(f=null),p=p.return}f===p&&(f=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:tn(e,t),dn(t),r&4&&Fm(t);break;case 21:break;default:tn(e,t),dn(t)}}function dn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(p_(n)){var r=n;break e}n=n.return}throw Error(U(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(yo(i,""),r.flags&=-33);var s=bm(t);Rh(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=bm(t);Ah(t,l,o);break;default:throw Error(U(161))}}catch(u){De(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function LI(t,e,n){H=t,y_(t)}function y_(t,e,n){for(var r=(t.mode&1)!==0;H!==null;){var i=H,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||$a;if(!o){var l=i.alternate,u=l!==null&&l.memoizedState!==null||_t;l=$a;var h=_t;if($a=o,(_t=u)&&!h)for(H=i;H!==null;)o=H,u=o.child,o.tag===22&&o.memoizedState!==null?zm(i):u!==null?(u.return=o,H=u):zm(i);for(;s!==null;)H=s,y_(s),s=s.sibling;H=i,$a=l,_t=h}Um(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,H=s):Um(t)}}function Um(t){for(;H!==null;){var e=H;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:_t||gu(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!_t)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:nn(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Im(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Im(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var h=e.alternate;if(h!==null){var f=h.memoizedState;if(f!==null){var p=f.dehydrated;p!==null&&Eo(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(U(163))}_t||e.flags&512&&Sh(e)}catch(m){De(e,e.return,m)}}if(e===t){H=null;break}if(n=e.sibling,n!==null){n.return=e.return,H=n;break}H=e.return}}function jm(t){for(;H!==null;){var e=H;if(e===t){H=null;break}var n=e.sibling;if(n!==null){n.return=e.return,H=n;break}H=e.return}}function zm(t){for(;H!==null;){var e=H;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{gu(4,e)}catch(u){De(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(u){De(e,i,u)}}var s=e.return;try{Sh(e)}catch(u){De(e,s,u)}break;case 5:var o=e.return;try{Sh(e)}catch(u){De(e,o,u)}}}catch(u){De(e,e.return,u)}if(e===t){H=null;break}var l=e.sibling;if(l!==null){l.return=e.return,H=l;break}H=e.return}}var MI=Math.ceil,bl=$n.ReactCurrentDispatcher,Ud=$n.ReactCurrentOwner,Yt=$n.ReactCurrentBatchConfig,fe=0,Ze=null,Ue=null,st=0,Ft=0,$i=Vr(0),We=0,Do=null,oi=0,yu=0,jd=0,ao=null,Nt=null,zd=0,as=1/0,Sn=null,Fl=!1,kh=null,_r=null,Wa=!1,dr=null,Ul=0,lo=0,Ph=null,ol=-1,al=0;function At(){return fe&6?Me():ol!==-1?ol:ol=Me()}function wr(t){return t.mode&1?fe&2&&st!==0?st&-st:_I.transition!==null?(al===0&&(al=tv()),al):(t=_e,t!==0||(t=window.event,t=t===void 0?16:lv(t.type)),t):1}function an(t,e,n,r){if(50<lo)throw lo=0,Ph=null,Error(U(185));qo(t,n,r),(!(fe&2)||t!==Ze)&&(t===Ze&&(!(fe&2)&&(yu|=n),We===4&&or(t,st)),Ot(t,r),n===1&&fe===0&&!(e.mode&1)&&(as=Me()+500,fu&&Or()))}function Ot(t,e){var n=t.callbackNode;_T(t,e);var r=Tl(t,t===Ze?st:0);if(r===0)n!==null&&Yp(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&Yp(n),e===1)t.tag===0?vI(Bm.bind(null,t)):kv(Bm.bind(null,t)),pI(function(){!(fe&6)&&Or()}),n=null;else{switch(nv(r)){case 1:n=fd;break;case 4:n=Zy;break;case 16:n=El;break;case 536870912:n=ev;break;default:n=El}n=A_(n,v_.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function v_(t,e){if(ol=-1,al=0,fe&6)throw Error(U(327));var n=t.callbackNode;if(Yi()&&t.callbackNode!==n)return null;var r=Tl(t,t===Ze?st:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=jl(t,r);else{e=r;var i=fe;fe|=2;var s=w_();(Ze!==t||st!==e)&&(Sn=null,as=Me()+500,Zr(t,e));do try{UI();break}catch(l){__(t,l)}while(!0);Rd(),bl.current=s,fe=i,Ue!==null?e=0:(Ze=null,st=0,e=We)}if(e!==0){if(e===2&&(i=th(t),i!==0&&(r=i,e=Ch(t,i))),e===1)throw n=Do,Zr(t,0),or(t,r),Ot(t,Me()),n;if(e===6)or(t,r);else{if(i=t.current.alternate,!(r&30)&&!bI(i)&&(e=jl(t,r),e===2&&(s=th(t),s!==0&&(r=s,e=Ch(t,s))),e===1))throw n=Do,Zr(t,0),or(t,r),Ot(t,Me()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(U(345));case 2:Hr(t,Nt,Sn);break;case 3:if(or(t,r),(r&130023424)===r&&(e=zd+500-Me(),10<e)){if(Tl(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){At(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=uh(Hr.bind(null,t,Nt,Sn),e);break}Hr(t,Nt,Sn);break;case 4:if(or(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-on(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=Me()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*MI(r/1960))-r,10<r){t.timeoutHandle=uh(Hr.bind(null,t,Nt,Sn),r);break}Hr(t,Nt,Sn);break;case 5:Hr(t,Nt,Sn);break;default:throw Error(U(329))}}}return Ot(t,Me()),t.callbackNode===n?v_.bind(null,t):null}function Ch(t,e){var n=ao;return t.current.memoizedState.isDehydrated&&(Zr(t,e).flags|=256),t=jl(t,e),t!==2&&(e=Nt,Nt=n,e!==null&&Nh(e)),t}function Nh(t){Nt===null?Nt=t:Nt.push.apply(Nt,t)}function bI(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!cn(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function or(t,e){for(e&=~jd,e&=~yu,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-on(e),r=1<<n;t[n]=-1,e&=~r}}function Bm(t){if(fe&6)throw Error(U(327));Yi();var e=Tl(t,0);if(!(e&1))return Ot(t,Me()),null;var n=jl(t,e);if(t.tag!==0&&n===2){var r=th(t);r!==0&&(e=r,n=Ch(t,r))}if(n===1)throw n=Do,Zr(t,0),or(t,e),Ot(t,Me()),n;if(n===6)throw Error(U(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,Hr(t,Nt,Sn),Ot(t,Me()),null}function Bd(t,e){var n=fe;fe|=1;try{return t(e)}finally{fe=n,fe===0&&(as=Me()+500,fu&&Or())}}function ai(t){dr!==null&&dr.tag===0&&!(fe&6)&&Yi();var e=fe;fe|=1;var n=Yt.transition,r=_e;try{if(Yt.transition=null,_e=1,t)return t()}finally{_e=r,Yt.transition=n,fe=e,!(fe&6)&&Or()}}function $d(){Ft=$i.current,Ae($i)}function Zr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,fI(n)),Ue!==null)for(n=Ue.return;n!==null;){var r=n;switch(Id(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&kl();break;case 3:ss(),Ae(Dt),Ae(wt),Dd();break;case 5:xd(r);break;case 4:ss();break;case 13:Ae(ke);break;case 19:Ae(ke);break;case 10:kd(r.type._context);break;case 22:case 23:$d()}n=n.return}if(Ze=t,Ue=t=Er(t.current,null),st=Ft=e,We=0,Do=null,jd=yu=oi=0,Nt=ao=null,Qr!==null){for(e=0;e<Qr.length;e++)if(n=Qr[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}Qr=null}return t}function __(t,e){do{var n=Ue;try{if(Rd(),rl.current=Ml,Ll){for(var r=Pe.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}Ll=!1}if(si=0,Ye=$e=Pe=null,so=!1,Co=0,Ud.current=null,n===null||n.return===null){We=1,Do=e,Ue=null;break}e:{var s=t,o=n.return,l=n,u=e;if(e=st,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var h=u,f=l,p=f.tag;if(!(f.mode&1)&&(p===0||p===11||p===15)){var m=f.alternate;m?(f.updateQueue=m.updateQueue,f.memoizedState=m.memoizedState,f.lanes=m.lanes):(f.updateQueue=null,f.memoizedState=null)}var S=Cm(o);if(S!==null){S.flags&=-257,Nm(S,o,l,s,e),S.mode&1&&Pm(s,h,e),e=S,u=h;var P=e.updateQueue;if(P===null){var N=new Set;N.add(u),e.updateQueue=N}else P.add(u);break e}else{if(!(e&1)){Pm(s,h,e),Wd();break e}u=Error(U(426))}}else if(Re&&l.mode&1){var L=Cm(o);if(L!==null){!(L.flags&65536)&&(L.flags|=256),Nm(L,o,l,s,e),Sd(os(u,l));break e}}s=u=os(u,l),We!==4&&(We=2),ao===null?ao=[s]:ao.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var v=n_(s,u,e);Tm(s,v);break e;case 1:l=u;var w=s.type,A=s.stateNode;if(!(s.flags&128)&&(typeof w.getDerivedStateFromError=="function"||A!==null&&typeof A.componentDidCatch=="function"&&(_r===null||!_r.has(A)))){s.flags|=65536,e&=-e,s.lanes|=e;var x=r_(s,l,e);Tm(s,x);break e}}s=s.return}while(s!==null)}T_(n)}catch(D){e=D,Ue===n&&n!==null&&(Ue=n=n.return);continue}break}while(!0)}function w_(){var t=bl.current;return bl.current=Ml,t===null?Ml:t}function Wd(){(We===0||We===3||We===2)&&(We=4),Ze===null||!(oi&268435455)&&!(yu&268435455)||or(Ze,st)}function jl(t,e){var n=fe;fe|=2;var r=w_();(Ze!==t||st!==e)&&(Sn=null,Zr(t,e));do try{FI();break}catch(i){__(t,i)}while(!0);if(Rd(),fe=n,bl.current=r,Ue!==null)throw Error(U(261));return Ze=null,st=0,We}function FI(){for(;Ue!==null;)E_(Ue)}function UI(){for(;Ue!==null&&!cT();)E_(Ue)}function E_(t){var e=S_(t.alternate,t,Ft);t.memoizedProps=t.pendingProps,e===null?T_(t):Ue=e,Ud.current=null}function T_(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=DI(n,e),n!==null){n.flags&=32767,Ue=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{We=6,Ue=null;return}}else if(n=xI(n,e,Ft),n!==null){Ue=n;return}if(e=e.sibling,e!==null){Ue=e;return}Ue=e=t}while(e!==null);We===0&&(We=5)}function Hr(t,e,n){var r=_e,i=Yt.transition;try{Yt.transition=null,_e=1,jI(t,e,n,r)}finally{Yt.transition=i,_e=r}return null}function jI(t,e,n,r){do Yi();while(dr!==null);if(fe&6)throw Error(U(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(U(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(wT(t,s),t===Ze&&(Ue=Ze=null,st=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Wa||(Wa=!0,A_(El,function(){return Yi(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Yt.transition,Yt.transition=null;var o=_e;_e=1;var l=fe;fe|=4,Ud.current=null,OI(t,n),g_(n,t),oI(ah),Il=!!oh,ah=oh=null,t.current=n,LI(n),hT(),fe=l,_e=o,Yt.transition=s}else t.current=n;if(Wa&&(Wa=!1,dr=t,Ul=i),s=t.pendingLanes,s===0&&(_r=null),pT(n.stateNode),Ot(t,Me()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(Fl)throw Fl=!1,t=kh,kh=null,t;return Ul&1&&t.tag!==0&&Yi(),s=t.pendingLanes,s&1?t===Ph?lo++:(lo=0,Ph=t):lo=0,Or(),null}function Yi(){if(dr!==null){var t=nv(Ul),e=Yt.transition,n=_e;try{if(Yt.transition=null,_e=16>t?16:t,dr===null)var r=!1;else{if(t=dr,dr=null,Ul=0,fe&6)throw Error(U(331));var i=fe;for(fe|=4,H=t.current;H!==null;){var s=H,o=s.child;if(H.flags&16){var l=s.deletions;if(l!==null){for(var u=0;u<l.length;u++){var h=l[u];for(H=h;H!==null;){var f=H;switch(f.tag){case 0:case 11:case 15:oo(8,f,s)}var p=f.child;if(p!==null)p.return=f,H=p;else for(;H!==null;){f=H;var m=f.sibling,S=f.return;if(f_(f),f===h){H=null;break}if(m!==null){m.return=S,H=m;break}H=S}}}var P=s.alternate;if(P!==null){var N=P.child;if(N!==null){P.child=null;do{var L=N.sibling;N.sibling=null,N=L}while(N!==null)}}H=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,H=o;else e:for(;H!==null;){if(s=H,s.flags&2048)switch(s.tag){case 0:case 11:case 15:oo(9,s,s.return)}var v=s.sibling;if(v!==null){v.return=s.return,H=v;break e}H=s.return}}var w=t.current;for(H=w;H!==null;){o=H;var A=o.child;if(o.subtreeFlags&2064&&A!==null)A.return=o,H=A;else e:for(o=w;H!==null;){if(l=H,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:gu(9,l)}}catch(D){De(l,l.return,D)}if(l===o){H=null;break e}var x=l.sibling;if(x!==null){x.return=l.return,H=x;break e}H=l.return}}if(fe=i,Or(),mn&&typeof mn.onPostCommitFiberRoot=="function")try{mn.onPostCommitFiberRoot(lu,t)}catch{}r=!0}return r}finally{_e=n,Yt.transition=e}}return!1}function $m(t,e,n){e=os(n,e),e=n_(t,e,1),t=vr(t,e,1),e=At(),t!==null&&(qo(t,1,e),Ot(t,e))}function De(t,e,n){if(t.tag===3)$m(t,t,n);else for(;e!==null;){if(e.tag===3){$m(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(_r===null||!_r.has(r))){t=os(n,t),t=r_(e,t,1),e=vr(e,t,1),t=At(),e!==null&&(qo(e,1,t),Ot(e,t));break}}e=e.return}}function zI(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=At(),t.pingedLanes|=t.suspendedLanes&n,Ze===t&&(st&n)===n&&(We===4||We===3&&(st&130023424)===st&&500>Me()-zd?Zr(t,0):jd|=n),Ot(t,e)}function I_(t,e){e===0&&(t.mode&1?(e=Oa,Oa<<=1,!(Oa&130023424)&&(Oa=4194304)):e=1);var n=At();t=bn(t,e),t!==null&&(qo(t,e,n),Ot(t,n))}function BI(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),I_(t,n)}function $I(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(U(314))}r!==null&&r.delete(e),I_(t,n)}var S_;S_=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||Dt.current)xt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return xt=!1,NI(t,e,n);xt=!!(t.flags&131072)}else xt=!1,Re&&e.flags&1048576&&Pv(e,Nl,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;sl(t,e),t=e.pendingProps;var i=ns(e,wt.current);Qi(e,n),i=Od(null,e,r,t,i,n);var s=Ld();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,Vt(r)?(s=!0,Pl(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,Cd(e),i.updater=mu,e.stateNode=i,i._reactInternals=e,gh(e,r,t,n),e=_h(null,e,r,!0,s,n)):(e.tag=0,Re&&s&&Td(e),It(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(sl(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=qI(r),t=nn(r,t),i){case 0:e=vh(null,e,r,t,n);break e;case 1:e=Vm(null,e,r,t,n);break e;case 11:e=xm(null,e,r,t,n);break e;case 14:e=Dm(null,e,r,nn(r.type,t),n);break e}throw Error(U(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:nn(r,i),vh(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:nn(r,i),Vm(t,e,r,i,n);case 3:e:{if(a_(e),t===null)throw Error(U(387));r=e.pendingProps,s=e.memoizedState,i=s.element,Ov(t,e),Vl(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=os(Error(U(423)),e),e=Om(t,e,r,n,i);break e}else if(r!==i){i=os(Error(U(424)),e),e=Om(t,e,r,n,i);break e}else for(Ut=yr(e.stateNode.containerInfo.firstChild),zt=e,Re=!0,sn=null,n=Dv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(rs(),r===i){e=Fn(t,e,n);break e}It(t,e,r,n)}e=e.child}return e;case 5:return Lv(e),t===null&&fh(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,lh(r,i)?o=null:s!==null&&lh(r,s)&&(e.flags|=32),o_(t,e),It(t,e,o,n),e.child;case 6:return t===null&&fh(e),null;case 13:return l_(t,e,n);case 4:return Nd(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=is(e,null,r,n):It(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:nn(r,i),xm(t,e,r,i,n);case 7:return It(t,e,e.pendingProps,n),e.child;case 8:return It(t,e,e.pendingProps.children,n),e.child;case 12:return It(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,Te(xl,r._currentValue),r._currentValue=o,s!==null)if(cn(s.value,o)){if(s.children===i.children&&!Dt.current){e=Fn(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=Vn(-1,n&-n),u.tag=2;var h=s.updateQueue;if(h!==null){h=h.shared;var f=h.pending;f===null?u.next=u:(u.next=f.next,f.next=u),h.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),ph(s.return,n,e),l.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(U(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),ph(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}It(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,Qi(e,n),i=Xt(i),r=r(i),e.flags|=1,It(t,e,r,n),e.child;case 14:return r=e.type,i=nn(r,e.pendingProps),i=nn(r.type,i),Dm(t,e,r,i,n);case 15:return i_(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:nn(r,i),sl(t,e),e.tag=1,Vt(r)?(t=!0,Pl(e)):t=!1,Qi(e,n),t_(e,r,i),gh(e,r,i,n),_h(null,e,r,!0,t,n);case 19:return u_(t,e,n);case 22:return s_(t,e,n)}throw Error(U(156,e.tag))};function A_(t,e){return Jy(t,e)}function WI(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Qt(t,e,n,r){return new WI(t,e,n,r)}function qd(t){return t=t.prototype,!(!t||!t.isReactComponent)}function qI(t){if(typeof t=="function")return qd(t)?1:0;if(t!=null){if(t=t.$$typeof,t===cd)return 11;if(t===hd)return 14}return 2}function Er(t,e){var n=t.alternate;return n===null?(n=Qt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function ll(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")qd(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Vi:return ei(n.children,i,s,e);case ud:o=8,i|=8;break;case jc:return t=Qt(12,n,e,i|2),t.elementType=jc,t.lanes=s,t;case zc:return t=Qt(13,n,e,i),t.elementType=zc,t.lanes=s,t;case Bc:return t=Qt(19,n,e,i),t.elementType=Bc,t.lanes=s,t;case Ly:return vu(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Vy:o=10;break e;case Oy:o=9;break e;case cd:o=11;break e;case hd:o=14;break e;case rr:o=16,r=null;break e}throw Error(U(130,t==null?t:typeof t,""))}return e=Qt(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function ei(t,e,n,r){return t=Qt(7,t,r,e),t.lanes=n,t}function vu(t,e,n,r){return t=Qt(22,t,r,e),t.elementType=Ly,t.lanes=n,t.stateNode={isHidden:!1},t}function Rc(t,e,n){return t=Qt(6,t,null,e),t.lanes=n,t}function kc(t,e,n){return e=Qt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function HI(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ac(0),this.expirationTimes=ac(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ac(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function Hd(t,e,n,r,i,s,o,l,u){return t=new HI(t,e,n,l,u),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Qt(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Cd(s),t}function KI(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Di,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function R_(t){if(!t)return Rr;t=t._reactInternals;e:{if(mi(t)!==t||t.tag!==1)throw Error(U(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(Vt(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(U(171))}if(t.tag===1){var n=t.type;if(Vt(n))return Rv(t,n,e)}return e}function k_(t,e,n,r,i,s,o,l,u){return t=Hd(n,r,!0,t,i,s,o,l,u),t.context=R_(null),n=t.current,r=At(),i=wr(n),s=Vn(r,i),s.callback=e??null,vr(n,s,i),t.current.lanes=i,qo(t,i,r),Ot(t,r),t}function _u(t,e,n,r){var i=e.current,s=At(),o=wr(i);return n=R_(n),e.context===null?e.context=n:e.pendingContext=n,e=Vn(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=vr(i,e,o),t!==null&&(an(t,i,o,s),nl(t,i,o)),o}function zl(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Wm(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Kd(t,e){Wm(t,e),(t=t.alternate)&&Wm(t,e)}function GI(){return null}var P_=typeof reportError=="function"?reportError:function(t){console.error(t)};function Gd(t){this._internalRoot=t}wu.prototype.render=Gd.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(U(409));_u(t,e,null,null)};wu.prototype.unmount=Gd.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;ai(function(){_u(null,t,null,null)}),e[Mn]=null}};function wu(t){this._internalRoot=t}wu.prototype.unstable_scheduleHydration=function(t){if(t){var e=sv();t={blockedOn:null,target:t,priority:e};for(var n=0;n<sr.length&&e!==0&&e<sr[n].priority;n++);sr.splice(n,0,t),n===0&&av(t)}};function Qd(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Eu(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function qm(){}function QI(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var h=zl(o);s.call(h)}}var o=k_(e,r,t,0,null,!1,!1,"",qm);return t._reactRootContainer=o,t[Mn]=o.current,So(t.nodeType===8?t.parentNode:t),ai(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var h=zl(u);l.call(h)}}var u=Hd(t,0,!1,null,null,!1,!1,"",qm);return t._reactRootContainer=u,t[Mn]=u.current,So(t.nodeType===8?t.parentNode:t),ai(function(){_u(e,u,n,r)}),u}function Tu(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var u=zl(o);l.call(u)}}_u(e,o,t,i)}else o=QI(n,e,t,i,r);return zl(o)}rv=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Qs(e.pendingLanes);n!==0&&(pd(e,n|1),Ot(e,Me()),!(fe&6)&&(as=Me()+500,Or()))}break;case 13:ai(function(){var r=bn(t,1);if(r!==null){var i=At();an(r,t,1,i)}}),Kd(t,1)}};md=function(t){if(t.tag===13){var e=bn(t,134217728);if(e!==null){var n=At();an(e,t,134217728,n)}Kd(t,134217728)}};iv=function(t){if(t.tag===13){var e=wr(t),n=bn(t,e);if(n!==null){var r=At();an(n,t,e,r)}Kd(t,e)}};sv=function(){return _e};ov=function(t,e){var n=_e;try{return _e=t,e()}finally{_e=n}};Jc=function(t,e,n){switch(e){case"input":if(qc(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=du(r);if(!i)throw Error(U(90));by(r),qc(r,i)}}}break;case"textarea":Uy(t,n);break;case"select":e=n.value,e!=null&&qi(t,!!n.multiple,e,!1)}};Hy=Bd;Ky=ai;var YI={usingClientEntryPoint:!1,Events:[Ko,bi,du,Wy,qy,Bd]},qs={findFiberByHostInstance:Gr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},XI={bundleType:qs.bundleType,version:qs.version,rendererPackageName:qs.rendererPackageName,rendererConfig:qs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:$n.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=Yy(t),t===null?null:t.stateNode},findFiberByHostInstance:qs.findFiberByHostInstance||GI,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var qa=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!qa.isDisabled&&qa.supportsFiber)try{lu=qa.inject(XI),mn=qa}catch{}}Wt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=YI;Wt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Qd(e))throw Error(U(200));return KI(t,e,null,n)};Wt.createRoot=function(t,e){if(!Qd(t))throw Error(U(299));var n=!1,r="",i=P_;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=Hd(t,1,!1,null,null,n,!1,r,i),t[Mn]=e.current,So(t.nodeType===8?t.parentNode:t),new Gd(e)};Wt.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(U(188)):(t=Object.keys(t).join(","),Error(U(268,t)));return t=Yy(e),t=t===null?null:t.stateNode,t};Wt.flushSync=function(t){return ai(t)};Wt.hydrate=function(t,e,n){if(!Eu(e))throw Error(U(200));return Tu(null,t,e,!0,n)};Wt.hydrateRoot=function(t,e,n){if(!Qd(t))throw Error(U(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=P_;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=k_(e,null,t,1,n??null,i,!1,s,o),t[Mn]=e.current,So(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new wu(e)};Wt.render=function(t,e,n){if(!Eu(e))throw Error(U(200));return Tu(null,t,e,!1,n)};Wt.unmountComponentAtNode=function(t){if(!Eu(t))throw Error(U(40));return t._reactRootContainer?(ai(function(){Tu(null,null,t,!1,function(){t._reactRootContainer=null,t[Mn]=null})}),!0):!1};Wt.unstable_batchedUpdates=Bd;Wt.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!Eu(n))throw Error(U(200));if(t==null||t._reactInternals===void 0)throw Error(U(38));return Tu(t,e,n,!1,r)};Wt.version="18.3.1-next-f1338f8080-20240426";function C_(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(C_)}catch(t){console.error(t)}}C_(),Cy.exports=Wt;var JI=Cy.exports,N_,Hm=JI;N_=Hm.createRoot,Hm.hydrateRoot;var Km={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x_=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},ZI=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},D_={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,h=u?t[i+2]:0,f=s>>2,p=(s&3)<<4|l>>4;let m=(l&15)<<2|h>>6,S=h&63;u||(S=64,o||(m=64)),r.push(n[f],n[p],n[m],n[S])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(x_(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):ZI(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const h=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||h==null||p==null)throw new eS;const m=s<<2|l>>4;if(r.push(m),h!==64){const S=l<<4&240|h>>2;if(r.push(S),p!==64){const P=h<<6&192|p;r.push(P)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class eS extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const tS=function(t){const e=x_(t);return D_.encodeByteArray(e,!0)},Bl=function(t){return tS(t).replace(/\./g,"")},V_=function(t){try{return D_.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nS(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rS=()=>nS().__FIREBASE_DEFAULTS__,iS=()=>{if(typeof process>"u"||typeof Km>"u")return;const t=Km.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},sS=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&V_(t[1]);return e&&JSON.parse(e)},Iu=()=>{try{return rS()||iS()||sS()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},O_=t=>{var e,n;return(n=(e=Iu())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},L_=t=>{const e=O_(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},M_=()=>{var t;return(t=Iu())===null||t===void 0?void 0:t.config},b_=t=>{var e;return(e=Iu())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oS{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aS(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},t);return[Bl(JSON.stringify(n)),Bl(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Et(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function lS(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Et())}function uS(){var t;const e=(t=Iu())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function cS(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function hS(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function dS(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function fS(){const t=Et();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function pS(){return!uS()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function mS(){try{return typeof indexedDB=="object"}catch{return!1}}function gS(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yS="FirebaseError";class Wn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=yS,Object.setPrototypeOf(this,Wn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Qo.prototype.create)}}class Qo{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?vS(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new Wn(i,l,r)}}function vS(t,e){return t.replace(_S,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const _S=/\{\$([^}]+)}/g;function wS(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function $l(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(Gm(s)&&Gm(o)){if(!$l(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function Gm(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yo(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ES(t,e){const n=new TS(t,e);return n.subscribe.bind(n)}class TS{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");IS(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=Pc),i.error===void 0&&(i.error=Pc),i.complete===void 0&&(i.complete=Pc);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function IS(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Pc(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(t){return t&&t._delegate?t._delegate:t}class kr{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SS{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new oS;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(RS(e))try{this.getOrInitializeService({instanceIdentifier:Kr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Kr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Kr){return this.instances.has(e)}getOptions(e=Kr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:AS(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Kr){return this.component?this.component.multipleInstances?e:Kr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function AS(t){return t===Kr?void 0:t}function RS(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kS{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new SS(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var he;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(he||(he={}));const PS={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},CS=he.INFO,NS={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},xS=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=NS[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Yd{constructor(e){this.name=e,this._logLevel=CS,this._logHandler=xS,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?PS[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}const DS=(t,e)=>e.some(n=>t instanceof n);let Qm,Ym;function VS(){return Qm||(Qm=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function OS(){return Ym||(Ym=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const F_=new WeakMap,xh=new WeakMap,U_=new WeakMap,Cc=new WeakMap,Xd=new WeakMap;function LS(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(Tr(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&F_.set(n,t)}).catch(()=>{}),Xd.set(e,t),e}function MS(t){if(xh.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});xh.set(t,e)}let Dh={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return xh.get(t);if(e==="objectStoreNames")return t.objectStoreNames||U_.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Tr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function bS(t){Dh=t(Dh)}function FS(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Nc(this),e,...n);return U_.set(r,e.sort?e.sort():[e]),Tr(r)}:OS().includes(t)?function(...e){return t.apply(Nc(this),e),Tr(F_.get(this))}:function(...e){return Tr(t.apply(Nc(this),e))}}function US(t){return typeof t=="function"?FS(t):(t instanceof IDBTransaction&&MS(t),DS(t,VS())?new Proxy(t,Dh):t)}function Tr(t){if(t instanceof IDBRequest)return LS(t);if(Cc.has(t))return Cc.get(t);const e=US(t);return e!==t&&(Cc.set(t,e),Xd.set(e,t)),e}const Nc=t=>Xd.get(t);function jS(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=Tr(o);return r&&o.addEventListener("upgradeneeded",u=>{r(Tr(o.result),u.oldVersion,u.newVersion,Tr(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const zS=["get","getKey","getAll","getAllKeys","count"],BS=["put","add","delete","clear"],xc=new Map;function Xm(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(xc.get(e))return xc.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=BS.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||zS.includes(n)))return;const s=async function(o,...l){const u=this.transaction(o,i?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),i&&u.done]))[0]};return xc.set(e,s),s}bS(t=>({...t,get:(e,n,r)=>Xm(e,n)||t.get(e,n,r),has:(e,n)=>!!Xm(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $S{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(WS(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function WS(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Vh="@firebase/app",Jm="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Un=new Yd("@firebase/app"),qS="@firebase/app-compat",HS="@firebase/analytics-compat",KS="@firebase/analytics",GS="@firebase/app-check-compat",QS="@firebase/app-check",YS="@firebase/auth",XS="@firebase/auth-compat",JS="@firebase/database",ZS="@firebase/data-connect",eA="@firebase/database-compat",tA="@firebase/functions",nA="@firebase/functions-compat",rA="@firebase/installations",iA="@firebase/installations-compat",sA="@firebase/messaging",oA="@firebase/messaging-compat",aA="@firebase/performance",lA="@firebase/performance-compat",uA="@firebase/remote-config",cA="@firebase/remote-config-compat",hA="@firebase/storage",dA="@firebase/storage-compat",fA="@firebase/firestore",pA="@firebase/vertexai-preview",mA="@firebase/firestore-compat",gA="firebase",yA="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oh="[DEFAULT]",vA={[Vh]:"fire-core",[qS]:"fire-core-compat",[KS]:"fire-analytics",[HS]:"fire-analytics-compat",[QS]:"fire-app-check",[GS]:"fire-app-check-compat",[YS]:"fire-auth",[XS]:"fire-auth-compat",[JS]:"fire-rtdb",[ZS]:"fire-data-connect",[eA]:"fire-rtdb-compat",[tA]:"fire-fn",[nA]:"fire-fn-compat",[rA]:"fire-iid",[iA]:"fire-iid-compat",[sA]:"fire-fcm",[oA]:"fire-fcm-compat",[aA]:"fire-perf",[lA]:"fire-perf-compat",[uA]:"fire-rc",[cA]:"fire-rc-compat",[hA]:"fire-gcs",[dA]:"fire-gcs-compat",[fA]:"fire-fst",[mA]:"fire-fst-compat",[pA]:"fire-vertex","fire-js":"fire-js",[gA]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vo=new Map,_A=new Map,Lh=new Map;function Zm(t,e){try{t.container.addComponent(e)}catch(n){Un.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function li(t){const e=t.name;if(Lh.has(e))return Un.debug(`There were multiple attempts to register component ${e}.`),!1;Lh.set(e,t);for(const n of Vo.values())Zm(n,t);for(const n of _A.values())Zm(n,t);return!0}function Su(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Cn(t){return t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wA={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ir=new Qo("app","Firebase",wA);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EA{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new kr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ir.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vs=yA;function j_(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Oh,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw Ir.create("bad-app-name",{appName:String(i)});if(n||(n=M_()),!n)throw Ir.create("no-options");const s=Vo.get(i);if(s){if($l(n,s.options)&&$l(r,s.config))return s;throw Ir.create("duplicate-app",{appName:i})}const o=new kS(i);for(const u of Lh.values())o.addComponent(u);const l=new EA(n,r,o);return Vo.set(i,l),l}function Au(t=Oh){const e=Vo.get(t);if(!e&&t===Oh&&M_())return j_();if(!e)throw Ir.create("no-app",{appName:t});return e}function TA(){return Array.from(Vo.values())}function yn(t,e,n){var r;let i=(r=vA[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Un.warn(l.join(" "));return}li(new kr(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IA="firebase-heartbeat-database",SA=1,Oo="firebase-heartbeat-store";let Dc=null;function z_(){return Dc||(Dc=jS(IA,SA,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Oo)}catch(n){console.warn(n)}}}}).catch(t=>{throw Ir.create("idb-open",{originalErrorMessage:t.message})})),Dc}async function AA(t){try{const n=(await z_()).transaction(Oo),r=await n.objectStore(Oo).get(B_(t));return await n.done,r}catch(e){if(e instanceof Wn)Un.warn(e.message);else{const n=Ir.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Un.warn(n.message)}}}async function eg(t,e){try{const r=(await z_()).transaction(Oo,"readwrite");await r.objectStore(Oo).put(e,B_(t)),await r.done}catch(n){if(n instanceof Wn)Un.warn(n.message);else{const r=Ir.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Un.warn(r.message)}}}function B_(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA=1024,kA=30*24*60*60*1e3;class PA{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new NA(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=tg();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const l=new Date(o.date).valueOf();return Date.now()-l<=kA}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Un.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=tg(),{heartbeatsToSend:r,unsentEntries:i}=CA(this._heartbeatsCache.heartbeats),s=Bl(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return Un.warn(n),""}}}function tg(){return new Date().toISOString().substring(0,10)}function CA(t,e=RA){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),ng(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),ng(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class NA{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return mS()?gS().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await AA(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return eg(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return eg(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function ng(t){return Bl(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xA(t){li(new kr("platform-logger",e=>new $S(e),"PRIVATE")),li(new kr("heartbeat",e=>new PA(e),"PRIVATE")),yn(Vh,Jm,t),yn(Vh,Jm,"esm2017"),yn("fire-js","")}xA("");var DA="firebase",VA="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */yn(DA,VA,"app");function Jd(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function $_(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const OA=$_,W_=new Qo("auth","Firebase",$_());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wl=new Yd("@firebase/auth");function LA(t,...e){Wl.logLevel<=he.WARN&&Wl.warn(`Auth (${vs}): ${t}`,...e)}function ul(t,...e){Wl.logLevel<=he.ERROR&&Wl.error(`Auth (${vs}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wn(t,...e){throw ef(t,...e)}function ln(t,...e){return ef(t,...e)}function Zd(t,e,n){const r=Object.assign(Object.assign({},OA()),{[e]:n});return new Qo("auth","Firebase",r).create(e,{appName:t.name})}function ti(t){return Zd(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function MA(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&wn(t,"argument-error"),Zd(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function ef(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return W_.create(t,...e)}function ne(t,e,...n){if(!t)throw ef(e,...n)}function Nn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw ul(e),new Error(e)}function jn(t,e){t||Nn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mh(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function bA(){return rg()==="http:"||rg()==="https:"}function rg(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FA(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(bA()||hS()||"connection"in navigator)?navigator.onLine:!0}function UA(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(e,n){this.shortDelay=e,this.longDelay=n,jn(n>e,"Short delay should be less than long delay!"),this.isMobile=lS()||dS()}get(){return FA()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tf(t,e){jn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q_{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Nn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Nn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Nn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jA={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA=new Xo(3e4,6e4);function nf(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function _s(t,e,n,r,i={}){return H_(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=Yo(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:u},s);return cS()||(h.referrerPolicy="no-referrer"),q_.fetch()(K_(t,t.config.apiHost,n,l),h)})}async function H_(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},jA),e);try{const i=new $A(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Ha(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,h]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ha(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Ha(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Ha(t,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Zd(t,f,h);wn(t,f)}}catch(i){if(i instanceof Wn)throw i;wn(t,"network-request-failed",{message:String(i)})}}async function BA(t,e,n,r,i={}){const s=await _s(t,e,n,r,i);return"mfaPendingCredential"in s&&wn(t,"multi-factor-auth-required",{_serverResponse:s}),s}function K_(t,e,n,r){const i=`${e}${n}?${r}`;return t.config.emulator?tf(t.config,i):`${t.config.apiScheme}://${i}`}class $A{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(ln(this.auth,"network-request-failed")),zA.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Ha(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=ln(t,e,r);return i.customData._tokenResponse=n,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function WA(t,e){return _s(t,"POST","/v1/accounts:delete",e)}async function G_(t,e){return _s(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uo(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function qA(t,e=!1){const n=Ve(t),r=await n.getIdToken(e),i=rf(r);ne(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:uo(Vc(i.auth_time)),issuedAtTime:uo(Vc(i.iat)),expirationTime:uo(Vc(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Vc(t){return Number(t)*1e3}function rf(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return ul("JWT malformed, contained fewer than 3 sections"),null;try{const i=V_(n);return i?JSON.parse(i):(ul("Failed to decode base64 JWT payload"),null)}catch(i){return ul("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function ig(t){const e=rf(t);return ne(e,"internal-error"),ne(typeof e.exp<"u","internal-error"),ne(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Lo(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Wn&&HA(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function HA({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KA{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=uo(this.lastLoginAt),this.creationTime=uo(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ql(t){var e;const n=t.auth,r=await t.getIdToken(),i=await Lo(t,G_(n,{idToken:r}));ne(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?Q_(s.providerUserInfo):[],l=QA(t.providerData,o),u=t.isAnonymous,h=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),f=u?h:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new bh(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(t,p)}async function GA(t){const e=Ve(t);await ql(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function QA(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Q_(t){return t.map(e=>{var{providerId:n}=e,r=Jd(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function YA(t,e){const n=await H_(t,{},async()=>{const r=Yo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=K_(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",q_.fetch()(o,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function XA(t,e){return _s(t,"POST","/v2/accounts:revokeToken",nf(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ne(e.idToken,"internal-error"),ne(typeof e.idToken<"u","internal-error"),ne(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):ig(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ne(e.length!==0,"internal-error");const n=ig(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ne(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await YA(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Xi;return r&&(ne(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(ne(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(ne(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Xi,this.toJSON())}_performRefresh(){return Nn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nr(t,e){ne(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class xn{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=Jd(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new KA(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new bh(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Lo(this,this.stsTokenManager.getToken(this.auth,e));return ne(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return qA(this,e)}reload(){return GA(this)}_assign(e){this!==e&&(ne(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new xn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ne(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await ql(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Cn(this.auth.app))return Promise.reject(ti(this.auth));const e=await this.getIdToken();return await Lo(this,WA(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,u,h,f;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,m=(i=n.email)!==null&&i!==void 0?i:void 0,S=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,P=(o=n.photoURL)!==null&&o!==void 0?o:void 0,N=(l=n.tenantId)!==null&&l!==void 0?l:void 0,L=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,v=(h=n.createdAt)!==null&&h!==void 0?h:void 0,w=(f=n.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:A,emailVerified:x,isAnonymous:D,providerData:b,stsTokenManager:T}=n;ne(A&&T,e,"internal-error");const y=Xi.fromJSON(this.name,T);ne(typeof A=="string",e,"internal-error"),nr(p,e.name),nr(m,e.name),ne(typeof x=="boolean",e,"internal-error"),ne(typeof D=="boolean",e,"internal-error"),nr(S,e.name),nr(P,e.name),nr(N,e.name),nr(L,e.name),nr(v,e.name),nr(w,e.name);const E=new xn({uid:A,auth:e,email:m,emailVerified:x,displayName:p,isAnonymous:D,photoURL:P,phoneNumber:S,tenantId:N,stsTokenManager:y,createdAt:v,lastLoginAt:w});return b&&Array.isArray(b)&&(E.providerData=b.map(I=>Object.assign({},I))),L&&(E._redirectEventId=L),E}static async _fromIdTokenResponse(e,n,r=!1){const i=new Xi;i.updateFromServerResponse(n);const s=new xn({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await ql(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];ne(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Q_(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Xi;l.updateFromIdToken(r);const u=new xn({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new bh(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sg=new Map;function Dn(t){jn(t instanceof Function,"Expected a class definition");let e=sg.get(t);return e?(jn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,sg.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y_{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Y_.type="NONE";const og=Y_;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cl(t,e,n){return`firebase:${t}:${e}:${n}`}class Ji{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=cl(this.userKey,i.apiKey,s),this.fullPersistenceKey=cl("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?xn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Ji(Dn(og),e,r);const i=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let s=i[0]||Dn(og);const o=cl(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const f=await h._get(o);if(f){const p=xn._fromJSON(e,f);h!==s&&(l=p),s=h;break}}catch{}const u=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Ji(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==s)try{await h._remove(o)}catch{}})),new Ji(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ag(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(e0(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(X_(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(n0(e))return"Blackberry";if(r0(e))return"Webos";if(J_(e))return"Safari";if((e.includes("chrome/")||Z_(e))&&!e.includes("edge/"))return"Chrome";if(t0(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function X_(t=Et()){return/firefox\//i.test(t)}function J_(t=Et()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Z_(t=Et()){return/crios\//i.test(t)}function e0(t=Et()){return/iemobile/i.test(t)}function t0(t=Et()){return/android/i.test(t)}function n0(t=Et()){return/blackberry/i.test(t)}function r0(t=Et()){return/webos/i.test(t)}function sf(t=Et()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function JA(t=Et()){var e;return sf(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function ZA(){return fS()&&document.documentMode===10}function i0(t=Et()){return sf(t)||t0(t)||r0(t)||n0(t)||/windows phone/i.test(t)||e0(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function s0(t,e=[]){let n;switch(t){case"Browser":n=ag(Et());break;case"Worker":n=`${ag(Et())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${vs}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e1{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function t1(t,e={}){return _s(t,"GET","/v2/passwordPolicy",nf(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n1=6;class r1{constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:n1,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i1{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new lg(this),this.idTokenSubscription=new lg(this),this.beforeStateQueue=new e1(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=W_,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Dn(n)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Ji.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await G_(this,{idToken:e}),r=await xn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Cn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return ne(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await ql(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=UA()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Cn(this.app))return Promise.reject(ti(this));const n=e?Ve(e):null;return n&&ne(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ne(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Cn(this.app)?Promise.reject(ti(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Cn(this.app)?Promise.reject(ti(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Dn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await t1(this),n=new r1(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Qo("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await XA(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Dn(e)||this._popupRedirectResolver;ne(n,this,"argument-error"),this.redirectPersistenceManager=await Ji.create(this,[Dn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ne(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ne(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=s0(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&LA(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Ru(t){return Ve(t)}class lg{constructor(e){this.auth=e,this.observer=null,this.addObserver=ES(n=>this.observer=n)}get next(){return ne(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let of={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function s1(t){of=t}function o1(t){return of.loadJS(t)}function a1(){return of.gapiScript}function l1(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function o0(t,e){const n=Su(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if($l(s,e??{}))return i;wn(i,"already-initialized")}return n.initialize({options:e})}function u1(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Dn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function c1(t,e,n){const r=Ru(t);ne(r._canInitEmulator,r,"emulator-config-failed"),ne(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=a0(e),{host:o,port:l}=h1(e),u=l===null?"":`:${l}`;r.config.emulator={url:`${s}//${o}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),d1()}function a0(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function h1(t){const e=a0(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:ug(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:ug(o)}}}function ug(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function d1(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l0{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Nn("not implemented")}_getIdTokenResponse(e){return Nn("not implemented")}_linkToIdToken(e,n){return Nn("not implemented")}_getReauthenticationResolver(e){return Nn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zi(t,e){return BA(t,"POST","/v1/accounts:signInWithIdp",nf(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f1="http://localhost";class ui extends l0{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ui(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):wn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=n,s=Jd(n,["providerId","signInMethod"]);if(!r||!i)return null;const o=new ui(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Zi(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Zi(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Zi(e,n)}buildRequest(){const e={requestUri:f1,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Yo(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class af{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jo extends af{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar extends Jo{constructor(){super("facebook.com")}static credential(e){return ui._fromParams({providerId:ar.PROVIDER_ID,signInMethod:ar.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ar.credentialFromTaggedObject(e)}static credentialFromError(e){return ar.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ar.credential(e.oauthAccessToken)}catch{return null}}}ar.FACEBOOK_SIGN_IN_METHOD="facebook.com";ar.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rn extends Jo{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ui._fromParams({providerId:Rn.PROVIDER_ID,signInMethod:Rn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Rn.credentialFromTaggedObject(e)}static credentialFromError(e){return Rn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return Rn.credential(n,r)}catch{return null}}}Rn.GOOGLE_SIGN_IN_METHOD="google.com";Rn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr extends Jo{constructor(){super("github.com")}static credential(e){return ui._fromParams({providerId:lr.PROVIDER_ID,signInMethod:lr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return lr.credentialFromTaggedObject(e)}static credentialFromError(e){return lr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return lr.credential(e.oauthAccessToken)}catch{return null}}}lr.GITHUB_SIGN_IN_METHOD="github.com";lr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur extends Jo{constructor(){super("twitter.com")}static credential(e,n){return ui._fromParams({providerId:ur.PROVIDER_ID,signInMethod:ur.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return ur.credentialFromTaggedObject(e)}static credentialFromError(e){return ur.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return ur.credential(n,r)}catch{return null}}}ur.TWITTER_SIGN_IN_METHOD="twitter.com";ur.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await xn._fromIdTokenResponse(e,r,i),o=cg(r);return new ls({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=cg(r);return new ls({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function cg(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl extends Wn{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Hl.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new Hl(e,n,r,i)}}function u0(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Hl._fromErrorAndOperation(t,s,e,r):s})}async function p1(t,e,n=!1){const r=await Lo(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ls._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function m1(t,e,n=!1){const{auth:r}=t;if(Cn(r.app))return Promise.reject(ti(r));const i="reauthenticate";try{const s=await Lo(t,u0(r,i,e,t),n);ne(s.idToken,r,"internal-error");const o=rf(s.idToken);ne(o,r,"internal-error");const{sub:l}=o;return ne(t.uid===l,r,"user-mismatch"),ls._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&wn(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function g1(t,e,n=!1){if(Cn(t.app))return Promise.reject(ti(t));const r="signIn",i=await u0(t,r,e),s=await ls._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}function y1(t,e,n,r){return Ve(t).onIdTokenChanged(e,n,r)}function v1(t,e,n){return Ve(t).beforeAuthStateChanged(e,n)}function _1(t,e,n,r){return Ve(t).onAuthStateChanged(e,n,r)}function w1(t){return Ve(t).signOut()}const Kl="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class c0{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Kl,"1"),this.storage.removeItem(Kl),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const E1=1e3,T1=10;class h0 extends c0{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=i0(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);ZA()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,T1):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},E1)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}h0.type="LOCAL";const d0=h0;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f0 extends c0{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}f0.type="SESSION";const p0=f0;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function I1(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new ku(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async h=>h(n.origin,s)),u=await I1(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ku.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lf(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S1{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const h=lf("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===h)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vn(){return window}function A1(t){vn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m0(){return typeof vn().WorkerGlobalScope<"u"&&typeof vn().importScripts=="function"}async function R1(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function k1(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function P1(){return m0()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g0="firebaseLocalStorageDb",C1=1,Gl="firebaseLocalStorage",y0="fbase_key";class Zo{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Pu(t,e){return t.transaction([Gl],e?"readwrite":"readonly").objectStore(Gl)}function N1(){const t=indexedDB.deleteDatabase(g0);return new Zo(t).toPromise()}function Fh(){const t=indexedDB.open(g0,C1);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Gl,{keyPath:y0})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Gl)?e(r):(r.close(),await N1(),e(await Fh()))})})}async function hg(t,e,n){const r=Pu(t,!0).put({[y0]:e,value:n});return new Zo(r).toPromise()}async function x1(t,e){const n=Pu(t,!1).get(e),r=await new Zo(n).toPromise();return r===void 0?null:r.value}function dg(t,e){const n=Pu(t,!0).delete(e);return new Zo(n).toPromise()}const D1=800,V1=3;class v0{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Fh(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>V1)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return m0()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ku._getInstance(P1()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await R1(),!this.activeServiceWorker)return;this.sender=new S1(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||k1()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Fh();return await hg(e,Kl,"1"),await dg(e,Kl),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>hg(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>x1(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>dg(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Pu(i,!1).getAll();return new Zo(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),D1)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}v0.type="LOCAL";const _0=v0;new Xo(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function w0(t,e){return e?Dn(e):(ne(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uf extends l0{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Zi(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Zi(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Zi(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function O1(t){return g1(t.auth,new uf(t),t.bypassAuthState)}function L1(t){const{auth:e,user:n}=t;return ne(n,e,"internal-error"),m1(n,new uf(t),t.bypassAuthState)}async function M1(t){const{auth:e,user:n}=t;return ne(n,e,"internal-error"),p1(n,new uf(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E0{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return O1;case"linkViaPopup":case"linkViaRedirect":return M1;case"reauthViaPopup":case"reauthViaRedirect":return L1;default:wn(this.auth,"internal-error")}}resolve(e){jn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){jn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b1=new Xo(2e3,1e4);async function F1(t,e,n){if(Cn(t.app))return Promise.reject(ln(t,"operation-not-supported-in-this-environment"));const r=Ru(t);MA(t,e,af);const i=w0(r,n);return new Xr(r,"signInViaPopup",e,i).executeNotNull()}class Xr extends E0{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Xr.currentPopupAction&&Xr.currentPopupAction.cancel(),Xr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ne(e,this.auth,"internal-error"),e}async onExecution(){jn(this.filter.length===1,"Popup operations only handle one event");const e=lf();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(ln(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(ln(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Xr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ln(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,b1.get())};e()}}Xr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U1="pendingRedirect",hl=new Map;class j1 extends E0{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=hl.get(this.auth._key());if(!e){try{const r=await z1(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}hl.set(this.auth._key(),e)}return this.bypassAuthState||hl.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function z1(t,e){const n=W1(e),r=$1(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function B1(t,e){hl.set(t._key(),e)}function $1(t){return Dn(t._redirectPersistence)}function W1(t){return cl(U1,t.config.apiKey,t.name)}async function q1(t,e,n=!1){if(Cn(t.app))return Promise.reject(ti(t));const r=Ru(t),i=w0(r,e),o=await new j1(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H1=10*60*1e3;class K1{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!G1(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!T0(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(ln(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=H1&&this.cachedEventUids.clear(),this.cachedEventUids.has(fg(e))}saveEventToCache(e){this.cachedEventUids.add(fg(e)),this.lastProcessedEventTime=Date.now()}}function fg(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function T0({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function G1(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return T0(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Q1(t,e={}){return _s(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y1=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,X1=/^https?/;async function J1(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Q1(t);for(const n of e)try{if(Z1(n))return}catch{}wn(t,"unauthorized-domain")}function Z1(t){const e=Mh(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!X1.test(n))return!1;if(Y1.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eR=new Xo(3e4,6e4);function pg(){const t=vn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function tR(t){return new Promise((e,n)=>{var r,i,s;function o(){pg(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{pg(),n(ln(t,"network-request-failed"))},timeout:eR.get()})}if(!((i=(r=vn().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=vn().gapi)===null||s===void 0)&&s.load)o();else{const l=l1("iframefcb");return vn()[l]=()=>{gapi.load?o():n(ln(t,"network-request-failed"))},o1(`${a1()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw dl=null,e})}let dl=null;function nR(t){return dl=dl||tR(t),dl}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rR=new Xo(5e3,15e3),iR="__/auth/iframe",sR="emulator/auth/iframe",oR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},aR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function lR(t){const e=t.config;ne(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?tf(e,sR):`https://${t.config.authDomain}/${iR}`,r={apiKey:e.apiKey,appName:t.name,v:vs},i=aR.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${Yo(r).slice(1)}`}async function uR(t){const e=await nR(t),n=vn().gapi;return ne(n,t,"internal-error"),e.open({where:document.body,url:lR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:oR,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=ln(t,"network-request-failed"),l=vn().setTimeout(()=>{s(o)},rR.get());function u(){vn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},hR=500,dR=600,fR="_blank",pR="http://localhost";class mg{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function mR(t,e,n,r=hR,i=dR){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},cR),{width:r.toString(),height:i.toString(),top:s,left:o}),h=Et().toLowerCase();n&&(l=Z_(h)?fR:n),X_(h)&&(e=e||pR,u.scrollbars="yes");const f=Object.entries(u).reduce((m,[S,P])=>`${m}${S}=${P},`,"");if(JA(h)&&l!=="_self")return gR(e||"",l),new mg(null);const p=window.open(e||"",l,f);ne(p,t,"popup-blocked");try{p.focus()}catch{}return new mg(p)}function gR(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yR="__/auth/handler",vR="emulator/auth/handler",_R=encodeURIComponent("fac");async function gg(t,e,n,r,i,s){ne(t.config.authDomain,t,"auth-domain-config-required"),ne(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:vs,eventId:i};if(e instanceof af){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",wS(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof Jo){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const u=await t._getAppCheckToken(),h=u?`#${_R}=${encodeURIComponent(u)}`:"";return`${wR(t)}?${Yo(l).slice(1)}${h}`}function wR({config:t}){return t.emulator?tf(t,vR):`https://${t.authDomain}/${yR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oc="webStorageSupport";class ER{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=p0,this._completeRedirectFn=q1,this._overrideRedirectResult=B1}async _openPopup(e,n,r,i){var s;jn((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await gg(e,n,r,Mh(),i);return mR(e,o,lf())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await gg(e,n,r,Mh(),i);return A1(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(jn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await uR(e),r=new K1(e);return n.register("authEvent",i=>(ne(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Oc,{type:Oc},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[Oc];o!==void 0&&n(!!o),wn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=J1(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return i0()||J_()||sf()}}const I0=ER;var yg="@firebase/auth",vg="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ne(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IR(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function SR(t){li(new kr("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;ne(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:s0(t)},h=new i1(r,i,s,u);return u1(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),li(new kr("auth-internal",e=>{const n=Ru(e.getProvider("auth").getImmediate());return(r=>new TR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),yn(yg,vg,IR(t)),yn(yg,vg,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AR=5*60,RR=b_("authIdTokenMaxAge")||AR;let _g=null;const kR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>RR)return;const i=n==null?void 0:n.token;_g!==i&&(_g=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function PR(t=Au()){const e=Su(t,"auth");if(e.isInitialized())return e.getImmediate();const n=o0(t,{popupRedirectResolver:I0,persistence:[_0,d0,p0]}),r=b_("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=kR(s.toString());v1(n,o,()=>o(n.currentUser)),y1(n,l=>o(l))}}const i=O_("auth");return i&&c1(n,`http://${i}`),n}function CR(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}s1({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=ln("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",CR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});SR("Browser");var wg=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ni,S0;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,y){function E(){}E.prototype=y.prototype,T.D=y.prototype,T.prototype=new E,T.prototype.constructor=T,T.C=function(I,R,k){for(var _=Array(arguments.length-2),ie=2;ie<arguments.length;ie++)_[ie-2]=arguments[ie];return y.prototype[R].apply(I,_)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(T,y,E){E||(E=0);var I=Array(16);if(typeof y=="string")for(var R=0;16>R;++R)I[R]=y.charCodeAt(E++)|y.charCodeAt(E++)<<8|y.charCodeAt(E++)<<16|y.charCodeAt(E++)<<24;else for(R=0;16>R;++R)I[R]=y[E++]|y[E++]<<8|y[E++]<<16|y[E++]<<24;y=T.g[0],E=T.g[1],R=T.g[2];var k=T.g[3],_=y+(k^E&(R^k))+I[0]+3614090360&4294967295;y=E+(_<<7&4294967295|_>>>25),_=k+(R^y&(E^R))+I[1]+3905402710&4294967295,k=y+(_<<12&4294967295|_>>>20),_=R+(E^k&(y^E))+I[2]+606105819&4294967295,R=k+(_<<17&4294967295|_>>>15),_=E+(y^R&(k^y))+I[3]+3250441966&4294967295,E=R+(_<<22&4294967295|_>>>10),_=y+(k^E&(R^k))+I[4]+4118548399&4294967295,y=E+(_<<7&4294967295|_>>>25),_=k+(R^y&(E^R))+I[5]+1200080426&4294967295,k=y+(_<<12&4294967295|_>>>20),_=R+(E^k&(y^E))+I[6]+2821735955&4294967295,R=k+(_<<17&4294967295|_>>>15),_=E+(y^R&(k^y))+I[7]+4249261313&4294967295,E=R+(_<<22&4294967295|_>>>10),_=y+(k^E&(R^k))+I[8]+1770035416&4294967295,y=E+(_<<7&4294967295|_>>>25),_=k+(R^y&(E^R))+I[9]+2336552879&4294967295,k=y+(_<<12&4294967295|_>>>20),_=R+(E^k&(y^E))+I[10]+4294925233&4294967295,R=k+(_<<17&4294967295|_>>>15),_=E+(y^R&(k^y))+I[11]+2304563134&4294967295,E=R+(_<<22&4294967295|_>>>10),_=y+(k^E&(R^k))+I[12]+1804603682&4294967295,y=E+(_<<7&4294967295|_>>>25),_=k+(R^y&(E^R))+I[13]+4254626195&4294967295,k=y+(_<<12&4294967295|_>>>20),_=R+(E^k&(y^E))+I[14]+2792965006&4294967295,R=k+(_<<17&4294967295|_>>>15),_=E+(y^R&(k^y))+I[15]+1236535329&4294967295,E=R+(_<<22&4294967295|_>>>10),_=y+(R^k&(E^R))+I[1]+4129170786&4294967295,y=E+(_<<5&4294967295|_>>>27),_=k+(E^R&(y^E))+I[6]+3225465664&4294967295,k=y+(_<<9&4294967295|_>>>23),_=R+(y^E&(k^y))+I[11]+643717713&4294967295,R=k+(_<<14&4294967295|_>>>18),_=E+(k^y&(R^k))+I[0]+3921069994&4294967295,E=R+(_<<20&4294967295|_>>>12),_=y+(R^k&(E^R))+I[5]+3593408605&4294967295,y=E+(_<<5&4294967295|_>>>27),_=k+(E^R&(y^E))+I[10]+38016083&4294967295,k=y+(_<<9&4294967295|_>>>23),_=R+(y^E&(k^y))+I[15]+3634488961&4294967295,R=k+(_<<14&4294967295|_>>>18),_=E+(k^y&(R^k))+I[4]+3889429448&4294967295,E=R+(_<<20&4294967295|_>>>12),_=y+(R^k&(E^R))+I[9]+568446438&4294967295,y=E+(_<<5&4294967295|_>>>27),_=k+(E^R&(y^E))+I[14]+3275163606&4294967295,k=y+(_<<9&4294967295|_>>>23),_=R+(y^E&(k^y))+I[3]+4107603335&4294967295,R=k+(_<<14&4294967295|_>>>18),_=E+(k^y&(R^k))+I[8]+1163531501&4294967295,E=R+(_<<20&4294967295|_>>>12),_=y+(R^k&(E^R))+I[13]+2850285829&4294967295,y=E+(_<<5&4294967295|_>>>27),_=k+(E^R&(y^E))+I[2]+4243563512&4294967295,k=y+(_<<9&4294967295|_>>>23),_=R+(y^E&(k^y))+I[7]+1735328473&4294967295,R=k+(_<<14&4294967295|_>>>18),_=E+(k^y&(R^k))+I[12]+2368359562&4294967295,E=R+(_<<20&4294967295|_>>>12),_=y+(E^R^k)+I[5]+4294588738&4294967295,y=E+(_<<4&4294967295|_>>>28),_=k+(y^E^R)+I[8]+2272392833&4294967295,k=y+(_<<11&4294967295|_>>>21),_=R+(k^y^E)+I[11]+1839030562&4294967295,R=k+(_<<16&4294967295|_>>>16),_=E+(R^k^y)+I[14]+4259657740&4294967295,E=R+(_<<23&4294967295|_>>>9),_=y+(E^R^k)+I[1]+2763975236&4294967295,y=E+(_<<4&4294967295|_>>>28),_=k+(y^E^R)+I[4]+1272893353&4294967295,k=y+(_<<11&4294967295|_>>>21),_=R+(k^y^E)+I[7]+4139469664&4294967295,R=k+(_<<16&4294967295|_>>>16),_=E+(R^k^y)+I[10]+3200236656&4294967295,E=R+(_<<23&4294967295|_>>>9),_=y+(E^R^k)+I[13]+681279174&4294967295,y=E+(_<<4&4294967295|_>>>28),_=k+(y^E^R)+I[0]+3936430074&4294967295,k=y+(_<<11&4294967295|_>>>21),_=R+(k^y^E)+I[3]+3572445317&4294967295,R=k+(_<<16&4294967295|_>>>16),_=E+(R^k^y)+I[6]+76029189&4294967295,E=R+(_<<23&4294967295|_>>>9),_=y+(E^R^k)+I[9]+3654602809&4294967295,y=E+(_<<4&4294967295|_>>>28),_=k+(y^E^R)+I[12]+3873151461&4294967295,k=y+(_<<11&4294967295|_>>>21),_=R+(k^y^E)+I[15]+530742520&4294967295,R=k+(_<<16&4294967295|_>>>16),_=E+(R^k^y)+I[2]+3299628645&4294967295,E=R+(_<<23&4294967295|_>>>9),_=y+(R^(E|~k))+I[0]+4096336452&4294967295,y=E+(_<<6&4294967295|_>>>26),_=k+(E^(y|~R))+I[7]+1126891415&4294967295,k=y+(_<<10&4294967295|_>>>22),_=R+(y^(k|~E))+I[14]+2878612391&4294967295,R=k+(_<<15&4294967295|_>>>17),_=E+(k^(R|~y))+I[5]+4237533241&4294967295,E=R+(_<<21&4294967295|_>>>11),_=y+(R^(E|~k))+I[12]+1700485571&4294967295,y=E+(_<<6&4294967295|_>>>26),_=k+(E^(y|~R))+I[3]+2399980690&4294967295,k=y+(_<<10&4294967295|_>>>22),_=R+(y^(k|~E))+I[10]+4293915773&4294967295,R=k+(_<<15&4294967295|_>>>17),_=E+(k^(R|~y))+I[1]+2240044497&4294967295,E=R+(_<<21&4294967295|_>>>11),_=y+(R^(E|~k))+I[8]+1873313359&4294967295,y=E+(_<<6&4294967295|_>>>26),_=k+(E^(y|~R))+I[15]+4264355552&4294967295,k=y+(_<<10&4294967295|_>>>22),_=R+(y^(k|~E))+I[6]+2734768916&4294967295,R=k+(_<<15&4294967295|_>>>17),_=E+(k^(R|~y))+I[13]+1309151649&4294967295,E=R+(_<<21&4294967295|_>>>11),_=y+(R^(E|~k))+I[4]+4149444226&4294967295,y=E+(_<<6&4294967295|_>>>26),_=k+(E^(y|~R))+I[11]+3174756917&4294967295,k=y+(_<<10&4294967295|_>>>22),_=R+(y^(k|~E))+I[2]+718787259&4294967295,R=k+(_<<15&4294967295|_>>>17),_=E+(k^(R|~y))+I[9]+3951481745&4294967295,T.g[0]=T.g[0]+y&4294967295,T.g[1]=T.g[1]+(R+(_<<21&4294967295|_>>>11))&4294967295,T.g[2]=T.g[2]+R&4294967295,T.g[3]=T.g[3]+k&4294967295}r.prototype.u=function(T,y){y===void 0&&(y=T.length);for(var E=y-this.blockSize,I=this.B,R=this.h,k=0;k<y;){if(R==0)for(;k<=E;)i(this,T,k),k+=this.blockSize;if(typeof T=="string"){for(;k<y;)if(I[R++]=T.charCodeAt(k++),R==this.blockSize){i(this,I),R=0;break}}else for(;k<y;)if(I[R++]=T[k++],R==this.blockSize){i(this,I),R=0;break}}this.h=R,this.o+=y},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var y=1;y<T.length-8;++y)T[y]=0;var E=8*this.o;for(y=T.length-8;y<T.length;++y)T[y]=E&255,E/=256;for(this.u(T),T=Array(16),y=E=0;4>y;++y)for(var I=0;32>I;I+=8)T[E++]=this.g[y]>>>I&255;return T};function s(T,y){var E=l;return Object.prototype.hasOwnProperty.call(E,T)?E[T]:E[T]=y(T)}function o(T,y){this.h=y;for(var E=[],I=!0,R=T.length-1;0<=R;R--){var k=T[R]|0;I&&k==y||(E[R]=k,I=!1)}this.g=E}var l={};function u(T){return-128<=T&&128>T?s(T,function(y){return new o([y|0],0>y?-1:0)}):new o([T|0],0>T?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return p;if(0>T)return L(h(-T));for(var y=[],E=1,I=0;T>=E;I++)y[I]=T/E|0,E*=4294967296;return new o(y,0)}function f(T,y){if(T.length==0)throw Error("number format error: empty string");if(y=y||10,2>y||36<y)throw Error("radix out of range: "+y);if(T.charAt(0)=="-")return L(f(T.substring(1),y));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var E=h(Math.pow(y,8)),I=p,R=0;R<T.length;R+=8){var k=Math.min(8,T.length-R),_=parseInt(T.substring(R,R+k),y);8>k?(k=h(Math.pow(y,k)),I=I.j(k).add(h(_))):(I=I.j(E),I=I.add(h(_)))}return I}var p=u(0),m=u(1),S=u(16777216);t=o.prototype,t.m=function(){if(N(this))return-L(this).m();for(var T=0,y=1,E=0;E<this.g.length;E++){var I=this.i(E);T+=(0<=I?I:4294967296+I)*y,y*=4294967296}return T},t.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(P(this))return"0";if(N(this))return"-"+L(this).toString(T);for(var y=h(Math.pow(T,6)),E=this,I="";;){var R=x(E,y).g;E=v(E,R.j(y));var k=((0<E.g.length?E.g[0]:E.h)>>>0).toString(T);if(E=R,P(E))return k+I;for(;6>k.length;)k="0"+k;I=k+I}},t.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function P(T){if(T.h!=0)return!1;for(var y=0;y<T.g.length;y++)if(T.g[y]!=0)return!1;return!0}function N(T){return T.h==-1}t.l=function(T){return T=v(this,T),N(T)?-1:P(T)?0:1};function L(T){for(var y=T.g.length,E=[],I=0;I<y;I++)E[I]=~T.g[I];return new o(E,~T.h).add(m)}t.abs=function(){return N(this)?L(this):this},t.add=function(T){for(var y=Math.max(this.g.length,T.g.length),E=[],I=0,R=0;R<=y;R++){var k=I+(this.i(R)&65535)+(T.i(R)&65535),_=(k>>>16)+(this.i(R)>>>16)+(T.i(R)>>>16);I=_>>>16,k&=65535,_&=65535,E[R]=_<<16|k}return new o(E,E[E.length-1]&-2147483648?-1:0)};function v(T,y){return T.add(L(y))}t.j=function(T){if(P(this)||P(T))return p;if(N(this))return N(T)?L(this).j(L(T)):L(L(this).j(T));if(N(T))return L(this.j(L(T)));if(0>this.l(S)&&0>T.l(S))return h(this.m()*T.m());for(var y=this.g.length+T.g.length,E=[],I=0;I<2*y;I++)E[I]=0;for(I=0;I<this.g.length;I++)for(var R=0;R<T.g.length;R++){var k=this.i(I)>>>16,_=this.i(I)&65535,ie=T.i(R)>>>16,ze=T.i(R)&65535;E[2*I+2*R]+=_*ze,w(E,2*I+2*R),E[2*I+2*R+1]+=k*ze,w(E,2*I+2*R+1),E[2*I+2*R+1]+=_*ie,w(E,2*I+2*R+1),E[2*I+2*R+2]+=k*ie,w(E,2*I+2*R+2)}for(I=0;I<y;I++)E[I]=E[2*I+1]<<16|E[2*I];for(I=y;I<2*y;I++)E[I]=0;return new o(E,0)};function w(T,y){for(;(T[y]&65535)!=T[y];)T[y+1]+=T[y]>>>16,T[y]&=65535,y++}function A(T,y){this.g=T,this.h=y}function x(T,y){if(P(y))throw Error("division by zero");if(P(T))return new A(p,p);if(N(T))return y=x(L(T),y),new A(L(y.g),L(y.h));if(N(y))return y=x(T,L(y)),new A(L(y.g),y.h);if(30<T.g.length){if(N(T)||N(y))throw Error("slowDivide_ only works with positive integers.");for(var E=m,I=y;0>=I.l(T);)E=D(E),I=D(I);var R=b(E,1),k=b(I,1);for(I=b(I,2),E=b(E,2);!P(I);){var _=k.add(I);0>=_.l(T)&&(R=R.add(E),k=_),I=b(I,1),E=b(E,1)}return y=v(T,R.j(y)),new A(R,y)}for(R=p;0<=T.l(y);){for(E=Math.max(1,Math.floor(T.m()/y.m())),I=Math.ceil(Math.log(E)/Math.LN2),I=48>=I?1:Math.pow(2,I-48),k=h(E),_=k.j(y);N(_)||0<_.l(T);)E-=I,k=h(E),_=k.j(y);P(k)&&(k=m),R=R.add(k),T=v(T,_)}return new A(R,T)}t.A=function(T){return x(this,T).h},t.and=function(T){for(var y=Math.max(this.g.length,T.g.length),E=[],I=0;I<y;I++)E[I]=this.i(I)&T.i(I);return new o(E,this.h&T.h)},t.or=function(T){for(var y=Math.max(this.g.length,T.g.length),E=[],I=0;I<y;I++)E[I]=this.i(I)|T.i(I);return new o(E,this.h|T.h)},t.xor=function(T){for(var y=Math.max(this.g.length,T.g.length),E=[],I=0;I<y;I++)E[I]=this.i(I)^T.i(I);return new o(E,this.h^T.h)};function D(T){for(var y=T.g.length+1,E=[],I=0;I<y;I++)E[I]=T.i(I)<<1|T.i(I-1)>>>31;return new o(E,T.h)}function b(T,y){var E=y>>5;y%=32;for(var I=T.g.length-E,R=[],k=0;k<I;k++)R[k]=0<y?T.i(k+E)>>>y|T.i(k+E+1)<<32-y:T.i(k+E);return new o(R,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,S0=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,ni=o}).apply(typeof wg<"u"?wg:typeof self<"u"?self:typeof window<"u"?window:{});var Ka=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var A0,Xs,R0,fl,Uh,k0,P0,C0;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,c,d){return a==Array.prototype||a==Object.prototype||(a[c]=d.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ka=="object"&&Ka];for(var c=0;c<a.length;++c){var d=a[c];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=n(this);function i(a,c){if(c)e:{var d=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var C=a[g];if(!(C in d))break e;d=d[C]}a=a[a.length-1],g=d[a],c=c(g),c!=g&&c!=null&&e(d,a,{configurable:!0,writable:!0,value:c})}}function s(a,c){a instanceof String&&(a+="");var d=0,g=!1,C={next:function(){if(!g&&d<a.length){var V=d++;return{value:c(V,a[V]),done:!1}}return g=!0,{done:!0,value:void 0}}};return C[Symbol.iterator]=function(){return C},C}i("Array.prototype.values",function(a){return a||function(){return s(this,function(c,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var c=typeof a;return c=c!="object"?c:a?Array.isArray(a)?"array":c:"null",c=="array"||c=="object"&&typeof a.length=="number"}function h(a){var c=typeof a;return c=="object"&&a!=null||c=="function"}function f(a,c,d){return a.call.apply(a.bind,arguments)}function p(a,c,d){if(!a)throw Error();if(2<arguments.length){var g=Array.prototype.slice.call(arguments,2);return function(){var C=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(C,g),a.apply(c,C)}}return function(){return a.apply(c,arguments)}}function m(a,c,d){return m=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:p,m.apply(null,arguments)}function S(a,c){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function P(a,c){function d(){}d.prototype=c.prototype,a.aa=c.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(g,C,V){for(var $=Array(arguments.length-2),we=2;we<arguments.length;we++)$[we-2]=arguments[we];return c.prototype[C].apply(g,$)}}function N(a){const c=a.length;if(0<c){const d=Array(c);for(let g=0;g<c;g++)d[g]=a[g];return d}return[]}function L(a,c){for(let d=1;d<arguments.length;d++){const g=arguments[d];if(u(g)){const C=a.length||0,V=g.length||0;a.length=C+V;for(let $=0;$<V;$++)a[C+$]=g[$]}else a.push(g)}}class v{constructor(c,d){this.i=c,this.j=d,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function w(a){return/^[\s\xa0]*$/.test(a)}function A(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function x(a){return x[" "](a),a}x[" "]=function(){};var D=A().indexOf("Gecko")!=-1&&!(A().toLowerCase().indexOf("webkit")!=-1&&A().indexOf("Edge")==-1)&&!(A().indexOf("Trident")!=-1||A().indexOf("MSIE")!=-1)&&A().indexOf("Edge")==-1;function b(a,c,d){for(const g in a)c.call(d,a[g],g,a)}function T(a,c){for(const d in a)c.call(void 0,a[d],d,a)}function y(a){const c={};for(const d in a)c[d]=a[d];return c}const E="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function I(a,c){let d,g;for(let C=1;C<arguments.length;C++){g=arguments[C];for(d in g)a[d]=g[d];for(let V=0;V<E.length;V++)d=E[V],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function R(a){var c=1;a=a.split(":");const d=[];for(;0<c&&a.length;)d.push(a.shift()),c--;return a.length&&d.push(a.join(":")),d}function k(a){l.setTimeout(()=>{throw a},0)}function _(){var a=Y;let c=null;return a.g&&(c=a.g,a.g=a.g.next,a.g||(a.h=null),c.next=null),c}class ie{constructor(){this.h=this.g=null}add(c,d){const g=ze.get();g.set(c,d),this.h?this.h.next=g:this.g=g,this.h=g}}var ze=new v(()=>new ut,a=>a.reset());class ut{constructor(){this.next=this.g=this.h=null}set(c,d){this.h=c,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let G,B=!1,Y=new ie,X=()=>{const a=l.Promise.resolve(void 0);G=()=>{a.then(ce)}};var ce=()=>{for(var a;a=_();){try{a.h.call(a.g)}catch(d){k(d)}var c=ze;c.j(a),100>c.h&&(c.h++,a.next=c.g,c.g=a)}B=!1};function O(){this.s=this.s,this.C=this.C}O.prototype.s=!1,O.prototype.ma=function(){this.s||(this.s=!0,this.N())},O.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function W(a,c){this.type=a,this.g=this.target=c,this.defaultPrevented=!1}W.prototype.h=function(){this.defaultPrevented=!0};var ae=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,c=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};l.addEventListener("test",d,c),l.removeEventListener("test",d,c)}catch{}return a}();function te(a,c){if(W.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=c,c=a.relatedTarget){if(D){e:{try{x(c.nodeName);var C=!0;break e}catch{}C=!1}C||(c=null)}}else d=="mouseover"?c=a.fromElement:d=="mouseout"&&(c=a.toElement);this.relatedTarget=c,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:oe[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&te.aa.h.call(this)}}P(te,W);var oe={2:"touch",3:"pen",4:"mouse"};te.prototype.h=function(){te.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var ye="closure_listenable_"+(1e6*Math.random()|0),ct=0;function be(a,c,d,g,C){this.listener=a,this.proxy=null,this.src=c,this.type=d,this.capture=!!g,this.ha=C,this.key=++ct,this.da=this.fa=!1}function Oe(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function ht(a){this.src=a,this.g={},this.h=0}ht.prototype.add=function(a,c,d,g,C){var V=a.toString();a=this.g[V],a||(a=this.g[V]=[],this.h++);var $=br(a,c,g,C);return-1<$?(c=a[$],d||(c.fa=!1)):(c=new be(c,this.src,V,!!g,C),c.fa=d,a.push(c)),c};function vi(a,c){var d=c.type;if(d in a.g){var g=a.g[d],C=Array.prototype.indexOf.call(g,c,void 0),V;(V=0<=C)&&Array.prototype.splice.call(g,C,1),V&&(Oe(c),a.g[d].length==0&&(delete a.g[d],a.h--))}}function br(a,c,d,g){for(var C=0;C<a.length;++C){var V=a[C];if(!V.da&&V.listener==c&&V.capture==!!d&&V.ha==g)return C}return-1}var Fr="closure_lm_"+(1e6*Math.random()|0),_i={};function Ss(a,c,d,g,C){if(Array.isArray(c)){for(var V=0;V<c.length;V++)Ss(a,c[V],d,g,C);return null}return d=da(d),a&&a[ye]?a.K(c,d,h(g)?!!g.capture:!1,C):Tt(a,c,d,!1,g,C)}function Tt(a,c,d,g,C,V){if(!c)throw Error("Invalid event type");var $=h(C)?!!C.capture:!!C,we=Kn(a);if(we||(a[Fr]=we=new ht(a)),d=we.add(c,d,g,$,V),d.proxy)return d;if(g=ha(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)ae||(C=$),C===void 0&&(C=!1),a.addEventListener(c.toString(),g,C);else if(a.attachEvent)a.attachEvent(As(c.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function ha(){function a(d){return c.call(a.src,a.listener,d)}const c=wi;return a}function Ur(a,c,d,g,C){if(Array.isArray(c))for(var V=0;V<c.length;V++)Ur(a,c[V],d,g,C);else g=h(g)?!!g.capture:!!g,d=da(d),a&&a[ye]?(a=a.i,c=String(c).toString(),c in a.g&&(V=a.g[c],d=br(V,d,g,C),-1<d&&(Oe(V[d]),Array.prototype.splice.call(V,d,1),V.length==0&&(delete a.g[c],a.h--)))):a&&(a=Kn(a))&&(c=a.g[c.toString()],a=-1,c&&(a=br(c,d,g,C)),(d=-1<a?c[a]:null)&&Hn(d))}function Hn(a){if(typeof a!="number"&&a&&!a.da){var c=a.src;if(c&&c[ye])vi(c.i,a);else{var d=a.type,g=a.proxy;c.removeEventListener?c.removeEventListener(d,g,a.capture):c.detachEvent?c.detachEvent(As(d),g):c.addListener&&c.removeListener&&c.removeListener(g),(d=Kn(c))?(vi(d,a),d.h==0&&(d.src=null,c[Fr]=null)):Oe(a)}}}function As(a){return a in _i?_i[a]:_i[a]="on"+a}function wi(a,c){if(a.da)a=!0;else{c=new te(c,this);var d=a.listener,g=a.ha||a.src;a.fa&&Hn(a),a=d.call(g,c)}return a}function Kn(a){return a=a[Fr],a instanceof ht?a:null}var Rs="__closure_events_fn_"+(1e9*Math.random()>>>0);function da(a){return typeof a=="function"?a:(a[Rs]||(a[Rs]=function(c){return a.handleEvent(c)}),a[Rs])}function Be(){O.call(this),this.i=new ht(this),this.M=this,this.F=null}P(Be,O),Be.prototype[ye]=!0,Be.prototype.removeEventListener=function(a,c,d,g){Ur(this,a,c,d,g)};function He(a,c){var d,g=a.F;if(g)for(d=[];g;g=g.F)d.push(g);if(a=a.M,g=c.type||c,typeof c=="string")c=new W(c,a);else if(c instanceof W)c.target=c.target||a;else{var C=c;c=new W(g,a),I(c,C)}if(C=!0,d)for(var V=d.length-1;0<=V;V--){var $=c.g=d[V];C=jr($,g,!0,c)&&C}if($=c.g=a,C=jr($,g,!0,c)&&C,C=jr($,g,!1,c)&&C,d)for(V=0;V<d.length;V++)$=c.g=d[V],C=jr($,g,!1,c)&&C}Be.prototype.N=function(){if(Be.aa.N.call(this),this.i){var a=this.i,c;for(c in a.g){for(var d=a.g[c],g=0;g<d.length;g++)Oe(d[g]);delete a.g[c],a.h--}}this.F=null},Be.prototype.K=function(a,c,d,g){return this.i.add(String(a),c,!1,d,g)},Be.prototype.L=function(a,c,d,g){return this.i.add(String(a),c,!0,d,g)};function jr(a,c,d,g){if(c=a.i.g[String(c)],!c)return!0;c=c.concat();for(var C=!0,V=0;V<c.length;++V){var $=c[V];if($&&!$.da&&$.capture==d){var we=$.listener,tt=$.ha||$.src;$.fa&&vi(a.i,$),C=we.call(tt,g)!==!1&&C}}return C&&!g.defaultPrevented}function ks(a,c,d){if(typeof a=="function")d&&(a=m(a,d));else if(a&&typeof a.handleEvent=="function")a=m(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:l.setTimeout(a,c||0)}function $u(a){a.g=ks(()=>{a.g=null,a.i&&(a.i=!1,$u(a))},a.l);const c=a.h;a.h=null,a.m.apply(null,c)}class fa extends O{constructor(c,d){super(),this.m=c,this.l=d,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:$u(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Gn(a){O.call(this),this.h=a,this.g={}}P(Gn,O);var zr=[];function Ps(a){b(a.g,function(c,d){this.g.hasOwnProperty(d)&&Hn(c)},a),a.g={}}Gn.prototype.N=function(){Gn.aa.N.call(this),Ps(this)},Gn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ei=l.JSON.stringify,pa=l.JSON.parse,j=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function se(){}se.prototype.h=null;function ve(a){return a.h||(a.h=a.i())}function Ke(){}var et={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function dt(){W.call(this,"d")}P(dt,W);function Ct(){W.call(this,"c")}P(Ct,W);var Lt={},Qn=null;function Mt(){return Qn=Qn||new Be}Lt.La="serverreachability";function Yn(a){W.call(this,Lt.La,a)}P(Yn,W);function Zt(a){const c=Mt();He(c,new Yn(c))}Lt.STAT_EVENT="statevent";function Ti(a,c){W.call(this,Lt.STAT_EVENT,a),this.stat=c}P(Ti,W);function Ge(a){const c=Mt();He(c,new Ti(c,a))}Lt.Ma="timingevent";function Ii(a,c){W.call(this,Lt.Ma,a),this.size=c}P(Ii,W);function Xn(a,c){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},c)}function Cs(){this.g=!0}Cs.prototype.xa=function(){this.g=!1};function eE(a,c,d,g,C,V){a.info(function(){if(a.g)if(V)for(var $="",we=V.split("&"),tt=0;tt<we.length;tt++){var me=we[tt].split("=");if(1<me.length){var ft=me[0];me=me[1];var pt=ft.split("_");$=2<=pt.length&&pt[1]=="type"?$+(ft+"="+me+"&"):$+(ft+"=redacted&")}}else $=null;else $=V;return"XMLHTTP REQ ("+g+") [attempt "+C+"]: "+c+`
`+d+`
`+$})}function tE(a,c,d,g,C,V,$){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+C+"]: "+c+`
`+d+`
`+V+" "+$})}function Si(a,c,d,g){a.info(function(){return"XMLHTTP TEXT ("+c+"): "+rE(a,d)+(g?" "+g:"")})}function nE(a,c){a.info(function(){return"TIMEOUT: "+c})}Cs.prototype.info=function(){};function rE(a,c){if(!a.g)return c;if(!c)return null;try{var d=JSON.parse(c);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var g=d[a];if(!(2>g.length)){var C=g[1];if(Array.isArray(C)&&!(1>C.length)){var V=C[0];if(V!="noop"&&V!="stop"&&V!="close")for(var $=1;$<C.length;$++)C[$]=""}}}}return Ei(d)}catch{return c}}var ma={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Jf={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Wu;function ga(){}P(ga,se),ga.prototype.g=function(){return new XMLHttpRequest},ga.prototype.i=function(){return{}},Wu=new ga;function Jn(a,c,d,g){this.j=a,this.i=c,this.l=d,this.R=g||1,this.U=new Gn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Zf}function Zf(){this.i=null,this.g="",this.h=!1}var ep={},qu={};function Hu(a,c,d){a.L=1,a.v=wa(Tn(c)),a.m=d,a.P=!0,tp(a,null)}function tp(a,c){a.F=Date.now(),ya(a),a.A=Tn(a.v);var d=a.A,g=a.R;Array.isArray(g)||(g=[String(g)]),mp(d.i,"t",g),a.C=0,d=a.j.J,a.h=new Zf,a.g=Vp(a.j,d?c:null,!a.m),0<a.O&&(a.M=new fa(m(a.Y,a,a.g),a.O)),c=a.U,d=a.g,g=a.ca;var C="readystatechange";Array.isArray(C)||(C&&(zr[0]=C.toString()),C=zr);for(var V=0;V<C.length;V++){var $=Ss(d,C[V],g||c.handleEvent,!1,c.h||c);if(!$)break;c.g[$.key]=$}c=a.H?y(a.H):{},a.m?(a.u||(a.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,c)):(a.u="GET",a.g.ea(a.A,a.u,null,c)),Zt(),eE(a.i,a.u,a.A,a.l,a.R,a.m)}Jn.prototype.ca=function(a){a=a.target;const c=this.M;c&&In(a)==3?c.j():this.Y(a)},Jn.prototype.Y=function(a){try{if(a==this.g)e:{const pt=In(this.g);var c=this.g.Ba();const ki=this.g.Z();if(!(3>pt)&&(pt!=3||this.g&&(this.h.h||this.g.oa()||Tp(this.g)))){this.J||pt!=4||c==7||(c==8||0>=ki?Zt(3):Zt(2)),Ku(this);var d=this.g.Z();this.X=d;t:if(np(this)){var g=Tp(this.g);a="";var C=g.length,V=In(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Br(this),Ns(this);var $="";break t}this.h.i=new l.TextDecoder}for(c=0;c<C;c++)this.h.h=!0,a+=this.h.i.decode(g[c],{stream:!(V&&c==C-1)});g.length=0,this.h.g+=a,this.C=0,$=this.h.g}else $=this.g.oa();if(this.o=d==200,tE(this.i,this.u,this.A,this.l,this.R,pt,d),this.o){if(this.T&&!this.K){t:{if(this.g){var we,tt=this.g;if((we=tt.g?tt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!w(we)){var me=we;break t}}me=null}if(d=me)Si(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Gu(this,d);else{this.o=!1,this.s=3,Ge(12),Br(this),Ns(this);break e}}if(this.P){d=!0;let en;for(;!this.J&&this.C<$.length;)if(en=iE(this,$),en==qu){pt==4&&(this.s=4,Ge(14),d=!1),Si(this.i,this.l,null,"[Incomplete Response]");break}else if(en==ep){this.s=4,Ge(15),Si(this.i,this.l,$,"[Invalid Chunk]"),d=!1;break}else Si(this.i,this.l,en,null),Gu(this,en);if(np(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),pt!=4||$.length!=0||this.h.h||(this.s=1,Ge(16),d=!1),this.o=this.o&&d,!d)Si(this.i,this.l,$,"[Invalid Chunked Response]"),Br(this),Ns(this);else if(0<$.length&&!this.W){this.W=!0;var ft=this.j;ft.g==this&&ft.ba&&!ft.M&&(ft.j.info("Great, no buffering proxy detected. Bytes received: "+$.length),ec(ft),ft.M=!0,Ge(11))}}else Si(this.i,this.l,$,null),Gu(this,$);pt==4&&Br(this),this.o&&!this.J&&(pt==4?Cp(this.j,this):(this.o=!1,ya(this)))}else EE(this.g),d==400&&0<$.indexOf("Unknown SID")?(this.s=3,Ge(12)):(this.s=0,Ge(13)),Br(this),Ns(this)}}}catch{}finally{}};function np(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function iE(a,c){var d=a.C,g=c.indexOf(`
`,d);return g==-1?qu:(d=Number(c.substring(d,g)),isNaN(d)?ep:(g+=1,g+d>c.length?qu:(c=c.slice(g,g+d),a.C=g+d,c)))}Jn.prototype.cancel=function(){this.J=!0,Br(this)};function ya(a){a.S=Date.now()+a.I,rp(a,a.I)}function rp(a,c){if(a.B!=null)throw Error("WatchDog timer not null");a.B=Xn(m(a.ba,a),c)}function Ku(a){a.B&&(l.clearTimeout(a.B),a.B=null)}Jn.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(nE(this.i,this.A),this.L!=2&&(Zt(),Ge(17)),Br(this),this.s=2,Ns(this)):rp(this,this.S-a)};function Ns(a){a.j.G==0||a.J||Cp(a.j,a)}function Br(a){Ku(a);var c=a.M;c&&typeof c.ma=="function"&&c.ma(),a.M=null,Ps(a.U),a.g&&(c=a.g,a.g=null,c.abort(),c.ma())}function Gu(a,c){try{var d=a.j;if(d.G!=0&&(d.g==a||Qu(d.h,a))){if(!a.K&&Qu(d.h,a)&&d.G==3){try{var g=d.Da.g.parse(c)}catch{g=null}if(Array.isArray(g)&&g.length==3){var C=g;if(C[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)Ra(d),Sa(d);else break e;Zu(d),Ge(18)}}else d.za=C[1],0<d.za-d.T&&37500>C[2]&&d.F&&d.v==0&&!d.C&&(d.C=Xn(m(d.Za,d),6e3));if(1>=op(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else Wr(d,11)}else if((a.K||d.g==a)&&Ra(d),!w(c))for(C=d.Da.g.parse(c),c=0;c<C.length;c++){let me=C[c];if(d.T=me[0],me=me[1],d.G==2)if(me[0]=="c"){d.K=me[1],d.ia=me[2];const ft=me[3];ft!=null&&(d.la=ft,d.j.info("VER="+d.la));const pt=me[4];pt!=null&&(d.Aa=pt,d.j.info("SVER="+d.Aa));const ki=me[5];ki!=null&&typeof ki=="number"&&0<ki&&(g=1.5*ki,d.L=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const en=a.g;if(en){const Pa=en.g?en.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Pa){var V=g.h;V.g||Pa.indexOf("spdy")==-1&&Pa.indexOf("quic")==-1&&Pa.indexOf("h2")==-1||(V.j=V.l,V.g=new Set,V.h&&(Yu(V,V.h),V.h=null))}if(g.D){const tc=en.g?en.g.getResponseHeader("X-HTTP-Session-Id"):null;tc&&(g.ya=tc,Ie(g.I,g.D,tc))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),g=d;var $=a;if(g.qa=Dp(g,g.J?g.ia:null,g.W),$.K){ap(g.h,$);var we=$,tt=g.L;tt&&(we.I=tt),we.B&&(Ku(we),ya(we)),g.g=$}else kp(g);0<d.i.length&&Aa(d)}else me[0]!="stop"&&me[0]!="close"||Wr(d,7);else d.G==3&&(me[0]=="stop"||me[0]=="close"?me[0]=="stop"?Wr(d,7):Ju(d):me[0]!="noop"&&d.l&&d.l.ta(me),d.v=0)}}Zt(4)}catch{}}var sE=class{constructor(a,c){this.g=a,this.map=c}};function ip(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function sp(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function op(a){return a.h?1:a.g?a.g.size:0}function Qu(a,c){return a.h?a.h==c:a.g?a.g.has(c):!1}function Yu(a,c){a.g?a.g.add(c):a.h=c}function ap(a,c){a.h&&a.h==c?a.h=null:a.g&&a.g.has(c)&&a.g.delete(c)}ip.prototype.cancel=function(){if(this.i=lp(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function lp(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let c=a.i;for(const d of a.g.values())c=c.concat(d.D);return c}return N(a.i)}function oE(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var c=[],d=a.length,g=0;g<d;g++)c.push(a[g]);return c}c=[],d=0;for(g in a)c[d++]=a[g];return c}function aE(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var c=[];a=a.length;for(var d=0;d<a;d++)c.push(d);return c}c=[],d=0;for(const g in a)c[d++]=g;return c}}}function up(a,c){if(a.forEach&&typeof a.forEach=="function")a.forEach(c,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,c,void 0);else for(var d=aE(a),g=oE(a),C=g.length,V=0;V<C;V++)c.call(void 0,g[V],d&&d[V],a)}var cp=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function lE(a,c){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var g=a[d].indexOf("="),C=null;if(0<=g){var V=a[d].substring(0,g);C=a[d].substring(g+1)}else V=a[d];c(V,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function $r(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof $r){this.h=a.h,va(this,a.j),this.o=a.o,this.g=a.g,_a(this,a.s),this.l=a.l;var c=a.i,d=new Vs;d.i=c.i,c.g&&(d.g=new Map(c.g),d.h=c.h),hp(this,d),this.m=a.m}else a&&(c=String(a).match(cp))?(this.h=!1,va(this,c[1]||"",!0),this.o=xs(c[2]||""),this.g=xs(c[3]||"",!0),_a(this,c[4]),this.l=xs(c[5]||"",!0),hp(this,c[6]||"",!0),this.m=xs(c[7]||"")):(this.h=!1,this.i=new Vs(null,this.h))}$r.prototype.toString=function(){var a=[],c=this.j;c&&a.push(Ds(c,dp,!0),":");var d=this.g;return(d||c=="file")&&(a.push("//"),(c=this.o)&&a.push(Ds(c,dp,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(Ds(d,d.charAt(0)=="/"?hE:cE,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",Ds(d,fE)),a.join("")};function Tn(a){return new $r(a)}function va(a,c,d){a.j=d?xs(c,!0):c,a.j&&(a.j=a.j.replace(/:$/,""))}function _a(a,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);a.s=c}else a.s=null}function hp(a,c,d){c instanceof Vs?(a.i=c,pE(a.i,a.h)):(d||(c=Ds(c,dE)),a.i=new Vs(c,a.h))}function Ie(a,c,d){a.i.set(c,d)}function wa(a){return Ie(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function xs(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Ds(a,c,d){return typeof a=="string"?(a=encodeURI(a).replace(c,uE),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function uE(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var dp=/[#\/\?@]/g,cE=/[#\?:]/g,hE=/[#\?]/g,dE=/[#\?@]/g,fE=/#/g;function Vs(a,c){this.h=this.g=null,this.i=a||null,this.j=!!c}function Zn(a){a.g||(a.g=new Map,a.h=0,a.i&&lE(a.i,function(c,d){a.add(decodeURIComponent(c.replace(/\+/g," ")),d)}))}t=Vs.prototype,t.add=function(a,c){Zn(this),this.i=null,a=Ai(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(c),this.h+=1,this};function fp(a,c){Zn(a),c=Ai(a,c),a.g.has(c)&&(a.i=null,a.h-=a.g.get(c).length,a.g.delete(c))}function pp(a,c){return Zn(a),c=Ai(a,c),a.g.has(c)}t.forEach=function(a,c){Zn(this),this.g.forEach(function(d,g){d.forEach(function(C){a.call(c,C,g,this)},this)},this)},t.na=function(){Zn(this);const a=Array.from(this.g.values()),c=Array.from(this.g.keys()),d=[];for(let g=0;g<c.length;g++){const C=a[g];for(let V=0;V<C.length;V++)d.push(c[g])}return d},t.V=function(a){Zn(this);let c=[];if(typeof a=="string")pp(this,a)&&(c=c.concat(this.g.get(Ai(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)c=c.concat(a[d])}return c},t.set=function(a,c){return Zn(this),this.i=null,a=Ai(this,a),pp(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[c]),this.h+=1,this},t.get=function(a,c){return a?(a=this.V(a),0<a.length?String(a[0]):c):c};function mp(a,c,d){fp(a,c),0<d.length&&(a.i=null,a.g.set(Ai(a,c),N(d)),a.h+=d.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],c=Array.from(this.g.keys());for(var d=0;d<c.length;d++){var g=c[d];const V=encodeURIComponent(String(g)),$=this.V(g);for(g=0;g<$.length;g++){var C=V;$[g]!==""&&(C+="="+encodeURIComponent(String($[g]))),a.push(C)}}return this.i=a.join("&")};function Ai(a,c){return c=String(c),a.j&&(c=c.toLowerCase()),c}function pE(a,c){c&&!a.j&&(Zn(a),a.i=null,a.g.forEach(function(d,g){var C=g.toLowerCase();g!=C&&(fp(this,g),mp(this,C,d))},a)),a.j=c}function mE(a,c){const d=new Cs;if(l.Image){const g=new Image;g.onload=S(er,d,"TestLoadImage: loaded",!0,c,g),g.onerror=S(er,d,"TestLoadImage: error",!1,c,g),g.onabort=S(er,d,"TestLoadImage: abort",!1,c,g),g.ontimeout=S(er,d,"TestLoadImage: timeout",!1,c,g),l.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else c(!1)}function gE(a,c){const d=new Cs,g=new AbortController,C=setTimeout(()=>{g.abort(),er(d,"TestPingServer: timeout",!1,c)},1e4);fetch(a,{signal:g.signal}).then(V=>{clearTimeout(C),V.ok?er(d,"TestPingServer: ok",!0,c):er(d,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(C),er(d,"TestPingServer: error",!1,c)})}function er(a,c,d,g,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),g(d)}catch{}}function yE(){this.g=new j}function vE(a,c,d){const g=d||"";try{up(a,function(C,V){let $=C;h(C)&&($=Ei(C)),c.push(g+V+"="+encodeURIComponent($))})}catch(C){throw c.push(g+"type="+encodeURIComponent("_badmap")),C}}function Ea(a){this.l=a.Ub||null,this.j=a.eb||!1}P(Ea,se),Ea.prototype.g=function(){return new Ta(this.l,this.j)},Ea.prototype.i=function(a){return function(){return a}}({});function Ta(a,c){Be.call(this),this.D=a,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}P(Ta,Be),t=Ta.prototype,t.open=function(a,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=c,this.readyState=1,Ls(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(c.body=a),(this.D||l).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Os(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Ls(this)),this.g&&(this.readyState=3,Ls(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;gp(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function gp(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var c=a.value?a.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!a.done}))&&(this.response=this.responseText+=c)}a.done?Os(this):Ls(this),this.readyState==3&&gp(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,Os(this))},t.Qa=function(a){this.g&&(this.response=a,Os(this))},t.ga=function(){this.g&&Os(this)};function Os(a){a.readyState=4,a.l=null,a.j=null,a.v=null,Ls(a)}t.setRequestHeader=function(a,c){this.u.append(a,c)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],c=this.h.entries();for(var d=c.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=c.next();return a.join(`\r
`)};function Ls(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Ta.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function yp(a){let c="";return b(a,function(d,g){c+=g,c+=":",c+=d,c+=`\r
`}),c}function Xu(a,c,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=yp(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):Ie(a,c,d))}function xe(a){Be.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}P(xe,Be);var _E=/^https?$/i,wE=["POST","PUT"];t=xe.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,c,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);c=c?c.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Wu.g(),this.v=this.o?ve(this.o):ve(Wu),this.g.onreadystatechange=m(this.Ea,this);try{this.B=!0,this.g.open(c,String(a),!0),this.B=!1}catch(V){vp(this,V);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var C in g)d.set(C,g[C]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const V of g.keys())d.set(V,g.get(V));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(V=>V.toLowerCase()=="content-type"),C=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(wE,c,void 0))||g||C||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[V,$]of d)this.g.setRequestHeader(V,$);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Ep(this),this.u=!0,this.g.send(a),this.u=!1}catch(V){vp(this,V)}};function vp(a,c){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=c,a.m=5,_p(a),Ia(a)}function _p(a){a.A||(a.A=!0,He(a,"complete"),He(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,He(this,"complete"),He(this,"abort"),Ia(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ia(this,!0)),xe.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?wp(this):this.bb())},t.bb=function(){wp(this)};function wp(a){if(a.h&&typeof o<"u"&&(!a.v[1]||In(a)!=4||a.Z()!=2)){if(a.u&&In(a)==4)ks(a.Ea,0,a);else if(He(a,"readystatechange"),In(a)==4){a.h=!1;try{const $=a.Z();e:switch($){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var d;if(!(d=c)){var g;if(g=$===0){var C=String(a.D).match(cp)[1]||null;!C&&l.self&&l.self.location&&(C=l.self.location.protocol.slice(0,-1)),g=!_E.test(C?C.toLowerCase():"")}d=g}if(d)He(a,"complete"),He(a,"success");else{a.m=6;try{var V=2<In(a)?a.g.statusText:""}catch{V=""}a.l=V+" ["+a.Z()+"]",_p(a)}}finally{Ia(a)}}}}function Ia(a,c){if(a.g){Ep(a);const d=a.g,g=a.v[0]?()=>{}:null;a.g=null,a.v=null,c||He(a,"ready");try{d.onreadystatechange=g}catch{}}}function Ep(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function In(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<In(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var c=this.g.responseText;return a&&c.indexOf(a)==0&&(c=c.substring(a.length)),pa(c)}};function Tp(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function EE(a){const c={};a=(a.g&&2<=In(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(w(a[g]))continue;var d=R(a[g]);const C=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const V=c[C]||[];c[C]=V,V.push(d)}T(c,function(g){return g.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ms(a,c,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||c}function Ip(a){this.Aa=0,this.i=[],this.j=new Cs,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ms("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ms("baseRetryDelayMs",5e3,a),this.cb=Ms("retryDelaySeedMs",1e4,a),this.Wa=Ms("forwardChannelMaxRetries",2,a),this.wa=Ms("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new ip(a&&a.concurrentRequestLimit),this.Da=new yE,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Ip.prototype,t.la=8,t.G=1,t.connect=function(a,c,d,g){Ge(0),this.W=a,this.H=c||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.I=Dp(this,null,this.W),Aa(this)};function Ju(a){if(Sp(a),a.G==3){var c=a.U++,d=Tn(a.I);if(Ie(d,"SID",a.K),Ie(d,"RID",c),Ie(d,"TYPE","terminate"),bs(a,d),c=new Jn(a,a.j,c),c.L=2,c.v=wa(Tn(d)),d=!1,l.navigator&&l.navigator.sendBeacon)try{d=l.navigator.sendBeacon(c.v.toString(),"")}catch{}!d&&l.Image&&(new Image().src=c.v,d=!0),d||(c.g=Vp(c.j,null),c.g.ea(c.v)),c.F=Date.now(),ya(c)}xp(a)}function Sa(a){a.g&&(ec(a),a.g.cancel(),a.g=null)}function Sp(a){Sa(a),a.u&&(l.clearTimeout(a.u),a.u=null),Ra(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function Aa(a){if(!sp(a.h)&&!a.s){a.s=!0;var c=a.Ga;G||X(),B||(G(),B=!0),Y.add(c,a),a.B=0}}function TE(a,c){return op(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=c.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=Xn(m(a.Ga,a,c),Np(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const C=new Jn(this,this.j,a);let V=this.o;if(this.S&&(V?(V=y(V),I(V,this.S)):V=this.S),this.m!==null||this.O||(C.H=V,V=null),this.P)e:{for(var c=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(c+=g,4096<c){c=d;break e}if(c===4096||d===this.i.length-1){c=d+1;break e}}c=1e3}else c=1e3;c=Rp(this,C,c),d=Tn(this.I),Ie(d,"RID",a),Ie(d,"CVER",22),this.D&&Ie(d,"X-HTTP-Session-Id",this.D),bs(this,d),V&&(this.O?c="headers="+encodeURIComponent(String(yp(V)))+"&"+c:this.m&&Xu(d,this.m,V)),Yu(this.h,C),this.Ua&&Ie(d,"TYPE","init"),this.P?(Ie(d,"$req",c),Ie(d,"SID","null"),C.T=!0,Hu(C,d,null)):Hu(C,d,c),this.G=2}}else this.G==3&&(a?Ap(this,a):this.i.length==0||sp(this.h)||Ap(this))};function Ap(a,c){var d;c?d=c.l:d=a.U++;const g=Tn(a.I);Ie(g,"SID",a.K),Ie(g,"RID",d),Ie(g,"AID",a.T),bs(a,g),a.m&&a.o&&Xu(g,a.m,a.o),d=new Jn(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),c&&(a.i=c.D.concat(a.i)),c=Rp(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),Yu(a.h,d),Hu(d,g,c)}function bs(a,c){a.H&&b(a.H,function(d,g){Ie(c,g,d)}),a.l&&up({},function(d,g){Ie(c,g,d)})}function Rp(a,c,d){d=Math.min(a.i.length,d);var g=a.l?m(a.l.Na,a.l,a):null;e:{var C=a.i;let V=-1;for(;;){const $=["count="+d];V==-1?0<d?(V=C[0].g,$.push("ofs="+V)):V=0:$.push("ofs="+V);let we=!0;for(let tt=0;tt<d;tt++){let me=C[tt].g;const ft=C[tt].map;if(me-=V,0>me)V=Math.max(0,C[tt].g-100),we=!1;else try{vE(ft,$,"req"+me+"_")}catch{g&&g(ft)}}if(we){g=$.join("&");break e}}}return a=a.i.splice(0,d),c.D=a,g}function kp(a){if(!a.g&&!a.u){a.Y=1;var c=a.Fa;G||X(),B||(G(),B=!0),Y.add(c,a),a.v=0}}function Zu(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=Xn(m(a.Fa,a),Np(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,Pp(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=Xn(m(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ge(10),Sa(this),Pp(this))};function ec(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function Pp(a){a.g=new Jn(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var c=Tn(a.qa);Ie(c,"RID","rpc"),Ie(c,"SID",a.K),Ie(c,"AID",a.T),Ie(c,"CI",a.F?"0":"1"),!a.F&&a.ja&&Ie(c,"TO",a.ja),Ie(c,"TYPE","xmlhttp"),bs(a,c),a.m&&a.o&&Xu(c,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=wa(Tn(c)),d.m=null,d.P=!0,tp(d,a)}t.Za=function(){this.C!=null&&(this.C=null,Sa(this),Zu(this),Ge(19))};function Ra(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function Cp(a,c){var d=null;if(a.g==c){Ra(a),ec(a),a.g=null;var g=2}else if(Qu(a.h,c))d=c.D,ap(a.h,c),g=1;else return;if(a.G!=0){if(c.o)if(g==1){d=c.m?c.m.length:0,c=Date.now()-c.F;var C=a.B;g=Mt(),He(g,new Ii(g,d)),Aa(a)}else kp(a);else if(C=c.s,C==3||C==0&&0<c.X||!(g==1&&TE(a,c)||g==2&&Zu(a)))switch(d&&0<d.length&&(c=a.h,c.i=c.i.concat(d)),C){case 1:Wr(a,5);break;case 4:Wr(a,10);break;case 3:Wr(a,6);break;default:Wr(a,2)}}}function Np(a,c){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*c}function Wr(a,c){if(a.j.info("Error code "+c),c==2){var d=m(a.fb,a),g=a.Xa;const C=!g;g=new $r(g||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||va(g,"https"),wa(g),C?mE(g.toString(),d):gE(g.toString(),d)}else Ge(2);a.G=0,a.l&&a.l.sa(c),xp(a),Sp(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),Ge(2)):(this.j.info("Failed to ping google.com"),Ge(1))};function xp(a){if(a.G=0,a.ka=[],a.l){const c=lp(a.h);(c.length!=0||a.i.length!=0)&&(L(a.ka,c),L(a.ka,a.i),a.h.i.length=0,N(a.i),a.i.length=0),a.l.ra()}}function Dp(a,c,d){var g=d instanceof $r?Tn(d):new $r(d);if(g.g!="")c&&(g.g=c+"."+g.g),_a(g,g.s);else{var C=l.location;g=C.protocol,c=c?c+"."+C.hostname:C.hostname,C=+C.port;var V=new $r(null);g&&va(V,g),c&&(V.g=c),C&&_a(V,C),d&&(V.l=d),g=V}return d=a.D,c=a.ya,d&&c&&Ie(g,d,c),Ie(g,"VER",a.la),bs(a,g),g}function Vp(a,c,d){if(c&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=a.Ca&&!a.pa?new xe(new Ea({eb:d})):new xe(a.pa),c.Ha(a.J),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Op(){}t=Op.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function ka(){}ka.prototype.g=function(a,c){return new bt(a,c)};function bt(a,c){Be.call(this),this.g=new Ip(c),this.l=a,this.h=c&&c.messageUrlParams||null,a=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(a?a["X-WebChannel-Content-Type"]=c.messageContentType:a={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(a?a["X-WebChannel-Client-Profile"]=c.va:a={"X-WebChannel-Client-Profile":c.va}),this.g.S=a,(a=c&&c.Sb)&&!w(a)&&(this.g.m=a),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!w(c)&&(this.g.D=c,a=this.h,a!==null&&c in a&&(a=this.h,c in a&&delete a[c])),this.j=new Ri(this)}P(bt,Be),bt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},bt.prototype.close=function(){Ju(this.g)},bt.prototype.o=function(a){var c=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=Ei(a),a=d);c.i.push(new sE(c.Ya++,a)),c.G==3&&Aa(c)},bt.prototype.N=function(){this.g.l=null,delete this.j,Ju(this.g),delete this.g,bt.aa.N.call(this)};function Lp(a){dt.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var c=a.__sm__;if(c){e:{for(const d in c){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,c=c!==null&&a in c?c[a]:void 0),this.data=c}else this.data=a}P(Lp,dt);function Mp(){Ct.call(this),this.status=1}P(Mp,Ct);function Ri(a){this.g=a}P(Ri,Op),Ri.prototype.ua=function(){He(this.g,"a")},Ri.prototype.ta=function(a){He(this.g,new Lp(a))},Ri.prototype.sa=function(a){He(this.g,new Mp)},Ri.prototype.ra=function(){He(this.g,"b")},ka.prototype.createWebChannel=ka.prototype.g,bt.prototype.send=bt.prototype.o,bt.prototype.open=bt.prototype.m,bt.prototype.close=bt.prototype.close,C0=function(){return new ka},P0=function(){return Mt()},k0=Lt,Uh={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},ma.NO_ERROR=0,ma.TIMEOUT=8,ma.HTTP_ERROR=6,fl=ma,Jf.COMPLETE="complete",R0=Jf,Ke.EventType=et,et.OPEN="a",et.CLOSE="b",et.ERROR="c",et.MESSAGE="d",Be.prototype.listen=Be.prototype.K,Xs=Ke,xe.prototype.listenOnce=xe.prototype.L,xe.prototype.getLastError=xe.prototype.Ka,xe.prototype.getLastErrorCode=xe.prototype.Ba,xe.prototype.getStatus=xe.prototype.Z,xe.prototype.getResponseJson=xe.prototype.Oa,xe.prototype.getResponseText=xe.prototype.oa,xe.prototype.send=xe.prototype.ea,xe.prototype.setWithCredentials=xe.prototype.Ha,A0=xe}).apply(typeof Ka<"u"?Ka:typeof self<"u"?self:typeof window<"u"?window:{});const Eg="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}vt.UNAUTHENTICATED=new vt(null),vt.GOOGLE_CREDENTIALS=new vt("google-credentials-uid"),vt.FIRST_PARTY=new vt("first-party-uid"),vt.MOCK_USER=new vt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ws="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci=new Yd("@firebase/firestore");function Hs(){return ci.logLevel}function Q(t,...e){if(ci.logLevel<=he.DEBUG){const n=e.map(cf);ci.debug(`Firestore (${ws}): ${t}`,...n)}}function zn(t,...e){if(ci.logLevel<=he.ERROR){const n=e.map(cf);ci.error(`Firestore (${ws}): ${t}`,...n)}}function us(t,...e){if(ci.logLevel<=he.WARN){const n=e.map(cf);ci.warn(`Firestore (${ws}): ${t}`,...n)}}function cf(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(t="Unexpected state"){const e=`FIRESTORE (${ws}) INTERNAL ASSERTION FAILED: `+t;throw zn(e),new Error(e)}function pe(t,e){t||Z()}function re(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class q extends Wn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class On{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N0{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class NR{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(vt.UNAUTHENTICATED))}shutdown(){}}class xR{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class DR{constructor(e){this.t=e,this.currentUser=vt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){pe(this.o===void 0);let r=this.i;const i=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let s=new On;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new On,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},l=u=>{Q("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):(Q("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new On)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(Q("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(pe(typeof r.accessToken=="string"),new N0(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return pe(e===null||typeof e=="string"),new vt(e)}}class VR{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=vt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class OR{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new VR(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(vt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class LR{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class MR{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){pe(this.o===void 0);const r=s=>{s.error!=null&&Q("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.R;return this.R=s.token,Q("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{Q("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):Q("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(pe(typeof n.token=="string"),this.R=n.token,new LR(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bR(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x0{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=bR(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%e.length))}return r}}function ge(t,e){return t<e?-1:t>e?1:0}function cs(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new q(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new q(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new q(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new q(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return qe.fromMillis(Date.now())}static fromDate(e){return qe.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new qe(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?ge(this.nanoseconds,e.nanoseconds):ge(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(e){this.timestamp=e}static fromTimestamp(e){return new ee(e)}static min(){return new ee(new qe(0,0))}static max(){return new ee(new qe(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo{constructor(e,n,r){n===void 0?n=0:n>e.length&&Z(),r===void 0?r=e.length-n:r>e.length-n&&Z(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Mo.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Mo?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=e.get(i),o=n.get(i);if(s<o)return-1;if(s>o)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class Ee extends Mo{construct(e,n,r){return new Ee(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new q(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new Ee(n)}static emptyPath(){return new Ee([])}}const FR=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class it extends Mo{construct(e,n,r){return new it(e,n,r)}static isValidIdentifier(e){return FR.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),it.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new it(["__name__"])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new q(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new q(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new q(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new q(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new it(n)}static emptyPath(){return new it([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(e){this.path=e}static fromPath(e){return new J(Ee.fromString(e))}static fromName(e){return new J(Ee.fromString(e).popFirst(5))}static empty(){return new J(Ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Ee.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new J(new Ee(e.slice()))}}function UR(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=ee.fromTimestamp(r===1e9?new qe(n+1,0):new qe(n,r));return new Pr(i,J.empty(),e)}function jR(t){return new Pr(t.readTime,t.key,-1)}class Pr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Pr(ee.min(),J.empty(),-1)}static max(){return new Pr(ee.max(),J.empty(),-1)}}function zR(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=J.comparator(t.documentKey,e.documentKey),n!==0?n:ge(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BR="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class $R{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ea(t){if(t.code!==M.FAILED_PRECONDITION||t.message!==BR)throw t;Q("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&Z(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new F((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof F?n:F.resolve(n)}catch(n){return F.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):F.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):F.reject(n)}static resolve(e){return new F((n,r)=>{n(e)})}static reject(e){return new F((n,r)=>{r(e)})}static waitFor(e){return new F((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},u=>r(u))}),o=!0,s===i&&n()})}static or(e){let n=F.resolve(!1);for(const r of e)n=n.next(i=>i?F.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new F((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let u=0;u<s;u++){const h=u;n(e[h]).next(f=>{o[h]=f,++l,l===s&&r(o)},f=>i(f))}})}static doWhile(e,n){return new F((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function WR(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function ta(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hf{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}hf.oe=-1;function na(t){return t==null}function Ql(t){return t===0&&1/t==-1/0}function qR(t){return typeof t=="number"&&Number.isInteger(t)&&!Ql(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tg(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function gi(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function D0(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e,n){this.comparator=e,this.root=n||rt.EMPTY}insert(e,n){return new Ne(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,rt.BLACK,null,null))}remove(e){return new Ne(this.comparator,this.root.remove(e,this.comparator).copy(null,null,rt.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ga(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ga(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ga(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ga(this.root,e,this.comparator,!0)}}class Ga{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class rt{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??rt.RED,this.left=i??rt.EMPTY,this.right=s??rt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new rt(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return rt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return rt.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,rt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,rt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw Z();const e=this.left.check();if(e!==this.right.check())throw Z();return e+(this.isRed()?0:1)}}rt.EMPTY=null,rt.RED=!0,rt.BLACK=!1;rt.EMPTY=new class{constructor(){this.size=0}get key(){throw Z()}get value(){throw Z()}get color(){throw Z()}get left(){throw Z()}get right(){throw Z()}copy(e,n,r,i,s){return this}insert(e,n,r){return new rt(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(e){this.comparator=e,this.data=new Ne(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Ig(this.data.getIterator())}getIteratorFrom(e){return new Ig(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof ot)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new ot(this.comparator);return n.data=e,n}}class Ig{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e){this.fields=e,e.sort(it.comparator)}static empty(){return new jt([])}unionWith(e){let n=new ot(it.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new jt(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return cs(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V0 extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new V0("Invalid base64 string: "+s):s}}(e);return new lt(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new lt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ge(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}lt.EMPTY_BYTE_STRING=new lt("");const HR=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Cr(t){if(pe(!!t),typeof t=="string"){let e=0;const n=HR.exec(t);if(pe(!!n),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Le(t.seconds),nanos:Le(t.nanos)}}function Le(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function hi(t){return typeof t=="string"?lt.fromBase64String(t):lt.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function ff(t){const e=t.mapValue.fields.__previous_value__;return df(e)?ff(e):e}function bo(t){const e=Cr(t.mapValue.fields.__local_write_time__.timestampValue);return new qe(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KR{constructor(e,n,r,i,s,o,l,u,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=h}}class Fo{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new Fo("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Fo&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qa={mapValue:{}};function di(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?df(t)?4:QR(t)?9007199254740991:GR(t)?10:11:Z()}function En(t,e){if(t===e)return!0;const n=di(t);if(n!==di(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return bo(t).isEqual(bo(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=Cr(i.timestampValue),l=Cr(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return hi(i.bytesValue).isEqual(hi(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return Le(i.geoPointValue.latitude)===Le(s.geoPointValue.latitude)&&Le(i.geoPointValue.longitude)===Le(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Le(i.integerValue)===Le(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=Le(i.doubleValue),l=Le(s.doubleValue);return o===l?Ql(o)===Ql(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return cs(t.arrayValue.values||[],e.arrayValue.values||[],En);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(Tg(o)!==Tg(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!En(o[u],l[u])))return!1;return!0}(t,e);default:return Z()}}function Uo(t,e){return(t.values||[]).find(n=>En(n,e))!==void 0}function hs(t,e){if(t===e)return 0;const n=di(t),r=di(e);if(n!==r)return ge(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return ge(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=Le(s.integerValue||s.doubleValue),u=Le(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return Sg(t.timestampValue,e.timestampValue);case 4:return Sg(bo(t),bo(e));case 5:return ge(t.stringValue,e.stringValue);case 6:return function(s,o){const l=hi(s),u=hi(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),u=o.split("/");for(let h=0;h<l.length&&h<u.length;h++){const f=ge(l[h],u[h]);if(f!==0)return f}return ge(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=ge(Le(s.latitude),Le(o.latitude));return l!==0?l:ge(Le(s.longitude),Le(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Ag(t.arrayValue,e.arrayValue);case 10:return function(s,o){var l,u,h,f;const p=s.fields||{},m=o.fields||{},S=(l=p.value)===null||l===void 0?void 0:l.arrayValue,P=(u=m.value)===null||u===void 0?void 0:u.arrayValue,N=ge(((h=S==null?void 0:S.values)===null||h===void 0?void 0:h.length)||0,((f=P==null?void 0:P.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:Ag(S,P)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===Qa.mapValue&&o===Qa.mapValue)return 0;if(s===Qa.mapValue)return 1;if(o===Qa.mapValue)return-1;const l=s.fields||{},u=Object.keys(l),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){const m=ge(u[p],f[p]);if(m!==0)return m;const S=hs(l[u[p]],h[f[p]]);if(S!==0)return S}return ge(u.length,f.length)}(t.mapValue,e.mapValue);default:throw Z()}}function Sg(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return ge(t,e);const n=Cr(t),r=Cr(e),i=ge(n.seconds,r.seconds);return i!==0?i:ge(n.nanos,r.nanos)}function Ag(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=hs(n[i],r[i]);if(s)return s}return ge(n.length,r.length)}function ds(t){return jh(t)}function jh(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Cr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return hi(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return J.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=jh(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${jh(n.fields[o])}`;return i+"}"}(t.mapValue):Z()}function Rg(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function zh(t){return!!t&&"integerValue"in t}function pf(t){return!!t&&"arrayValue"in t}function kg(t){return!!t&&"nullValue"in t}function Pg(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function pl(t){return!!t&&"mapValue"in t}function GR(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function co(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return gi(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=co(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=co(t.arrayValue.values[n]);return e}return Object.assign({},t)}function QR(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(e){this.value=e}static empty(){return new St({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!pl(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=co(n)}setAll(e){let n=it.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=co(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());pl(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return En(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];pl(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){gi(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new St(co(this.value))}}function O0(t){const e=[];return gi(t.fields,(n,r)=>{const i=new it([n]);if(pl(r)){const s=O0(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new jt(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new Xe(e,0,ee.min(),ee.min(),ee.min(),St.empty(),0)}static newFoundDocument(e,n,r,i){return new Xe(e,1,n,ee.min(),r,i,0)}static newNoDocument(e,n){return new Xe(e,2,n,ee.min(),ee.min(),St.empty(),0)}static newUnknownDocument(e,n){return new Xe(e,3,n,ee.min(),ee.min(),St.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(ee.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=St.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=St.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ee.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Xe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Xe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(e,n){this.position=e,this.inclusive=n}}function Cg(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=J.comparator(J.fromName(o.referenceValue),n.key):r=hs(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function Ng(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!En(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jo{constructor(e,n="asc"){this.field=e,this.dir=n}}function YR(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L0{}class je extends L0{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new JR(e,n,r):n==="array-contains"?new tk(e,r):n==="in"?new nk(e,r):n==="not-in"?new rk(e,r):n==="array-contains-any"?new ik(e,r):new je(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new ZR(e,r):new ek(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(hs(n,this.value)):n!==null&&di(this.value)===di(n)&&this.matchesComparison(hs(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Z()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class hn extends L0{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new hn(e,n)}matches(e){return M0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function M0(t){return t.op==="and"}function b0(t){return XR(t)&&M0(t)}function XR(t){for(const e of t.filters)if(e instanceof hn)return!1;return!0}function Bh(t){if(t instanceof je)return t.field.canonicalString()+t.op.toString()+ds(t.value);if(b0(t))return t.filters.map(e=>Bh(e)).join(",");{const e=t.filters.map(n=>Bh(n)).join(",");return`${t.op}(${e})`}}function F0(t,e){return t instanceof je?function(r,i){return i instanceof je&&r.op===i.op&&r.field.isEqual(i.field)&&En(r.value,i.value)}(t,e):t instanceof hn?function(r,i){return i instanceof hn&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&F0(o,i.filters[l]),!0):!1}(t,e):void Z()}function U0(t){return t instanceof je?function(n){return`${n.field.canonicalString()} ${n.op} ${ds(n.value)}`}(t):t instanceof hn?function(n){return n.op.toString()+" {"+n.getFilters().map(U0).join(" ,")+"}"}(t):"Filter"}class JR extends je{constructor(e,n,r){super(e,n,r),this.key=J.fromName(r.referenceValue)}matches(e){const n=J.comparator(e.key,this.key);return this.matchesComparison(n)}}class ZR extends je{constructor(e,n){super(e,"in",n),this.keys=j0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class ek extends je{constructor(e,n){super(e,"not-in",n),this.keys=j0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function j0(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>J.fromName(r.referenceValue))}class tk extends je{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return pf(n)&&Uo(n.arrayValue,this.value)}}class nk extends je{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Uo(this.value.arrayValue,n)}}class rk extends je{constructor(e,n){super(e,"not-in",n)}matches(e){if(Uo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!Uo(this.value.arrayValue,n)}}class ik extends je{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!pf(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Uo(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sk{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.ue=null}}function xg(t,e=null,n=[],r=[],i=null,s=null,o=null){return new sk(t,e,n,r,i,s,o)}function mf(t){const e=re(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>Bh(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),na(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>ds(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>ds(r)).join(",")),e.ue=n}return e.ue}function gf(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!YR(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!F0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Ng(t.startAt,e.startAt)&&Ng(t.endAt,e.endAt)}function $h(t){return J.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Es{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function ok(t,e,n,r,i,s,o,l){return new Es(t,e,n,r,i,s,o,l)}function yf(t){return new Es(t)}function Dg(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function z0(t){return t.collectionGroup!==null}function ho(t){const e=re(t);if(e.ce===null){e.ce=[];const n=new Set;for(const s of e.explicitOrderBy)e.ce.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new ot(it.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.ce.push(new jo(s,r))}),n.has(it.keyField().canonicalString())||e.ce.push(new jo(it.keyField(),r))}return e.ce}function _n(t){const e=re(t);return e.le||(e.le=ak(e,ho(t))),e.le}function ak(t,e){if(t.limitType==="F")return xg(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new jo(i.field,s)});const n=t.endAt?new Yl(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Yl(t.startAt.position,t.startAt.inclusive):null;return xg(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function Wh(t,e){const n=t.filters.concat([e]);return new Es(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Xl(t,e,n){return new Es(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Cu(t,e){return gf(_n(t),_n(e))&&t.limitType===e.limitType}function B0(t){return`${mf(_n(t))}|lt:${t.limitType}`}function Ci(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>U0(i)).join(", ")}]`),na(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>ds(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>ds(i)).join(",")),`Target(${r})`}(_n(t))}; limitType=${t.limitType})`}function Nu(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):J.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of ho(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,u){const h=Cg(o,l,u);return o.inclusive?h<=0:h<0}(r.startAt,ho(r),i)||r.endAt&&!function(o,l,u){const h=Cg(o,l,u);return o.inclusive?h>=0:h>0}(r.endAt,ho(r),i))}(t,e)}function lk(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function $0(t){return(e,n)=>{let r=!1;for(const i of ho(t)){const s=uk(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function uk(t,e,n){const r=t.field.isKeyField()?J.comparator(e.key,n.key):function(s,o,l){const u=o.data.field(s),h=l.data.field(s);return u!==null&&h!==null?hs(u,h):Z()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Z()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ts{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){gi(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return D0(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ck=new Ne(J.comparator);function Bn(){return ck}const W0=new Ne(J.comparator);function Js(...t){let e=W0;for(const n of t)e=e.insert(n.key,n);return e}function q0(t){let e=W0;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Jr(){return fo()}function H0(){return fo()}function fo(){return new Ts(t=>t.toString(),(t,e)=>t.isEqual(e))}const hk=new Ne(J.comparator),dk=new ot(J.comparator);function ue(...t){let e=dk;for(const n of t)e=e.add(n);return e}const fk=new ot(ge);function pk(){return fk}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vf(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ql(e)?"-0":e}}function K0(t){return{integerValue:""+t}}function mk(t,e){return qR(e)?K0(e):vf(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xu{constructor(){this._=void 0}}function gk(t,e,n){return t instanceof zo?function(i,s){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&df(s)&&(s=ff(s)),s&&(o.fields.__previous_value__=s),{mapValue:o}}(n,e):t instanceof Bo?Q0(t,e):t instanceof $o?Y0(t,e):function(i,s){const o=G0(i,s),l=Vg(o)+Vg(i.Pe);return zh(o)&&zh(i.Pe)?K0(l):vf(i.serializer,l)}(t,e)}function yk(t,e,n){return t instanceof Bo?Q0(t,e):t instanceof $o?Y0(t,e):n}function G0(t,e){return t instanceof Jl?function(r){return zh(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class zo extends xu{}class Bo extends xu{constructor(e){super(),this.elements=e}}function Q0(t,e){const n=X0(e);for(const r of t.elements)n.some(i=>En(i,r))||n.push(r);return{arrayValue:{values:n}}}class $o extends xu{constructor(e){super(),this.elements=e}}function Y0(t,e){let n=X0(e);for(const r of t.elements)n=n.filter(i=>!En(i,r));return{arrayValue:{values:n}}}class Jl extends xu{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Vg(t){return Le(t.integerValue||t.doubleValue)}function X0(t){return pf(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vk{constructor(e,n){this.field=e,this.transform=n}}function _k(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof Bo&&i instanceof Bo||r instanceof $o&&i instanceof $o?cs(r.elements,i.elements,En):r instanceof Jl&&i instanceof Jl?En(r.Pe,i.Pe):r instanceof zo&&i instanceof zo}(t.transform,e.transform)}class wk{constructor(e,n){this.version=e,this.transformResults=n}}class Je{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Je}static exists(e){return new Je(void 0,e)}static updateTime(e){return new Je(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ml(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Du{}function J0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new ia(t.key,Je.none()):new ra(t.key,t.data,Je.none());{const n=t.data,r=St.empty();let i=new ot(it.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Lr(t.key,r,new jt(i.toArray()),Je.none())}}function Ek(t,e,n){t instanceof ra?function(i,s,o){const l=i.value.clone(),u=Lg(i.fieldTransforms,s,o.transformResults);l.setAll(u),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Lr?function(i,s,o){if(!ml(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=Lg(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(Z0(i)),u.setAll(l),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function po(t,e,n,r){return t instanceof ra?function(s,o,l,u){if(!ml(s.precondition,o))return l;const h=s.value.clone(),f=Mg(s.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof Lr?function(s,o,l,u){if(!ml(s.precondition,o))return l;const h=Mg(s.fieldTransforms,u,o),f=o.data;return f.setAll(Z0(s)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(s,o,l){return ml(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function Tk(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=G0(r.transform,i||null);s!=null&&(n===null&&(n=St.empty()),n.set(r.field,s))}return n||null}function Og(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&cs(r,i,(s,o)=>_k(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ra extends Du{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Lr extends Du{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Z0(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Lg(t,e,n){const r=new Map;pe(t.length===n.length);for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,yk(o,l,n[i]))}return r}function Mg(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,gk(s,o,e))}return r}class ia extends Du{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class ew extends Du{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ik{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&Ek(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=po(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=po(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=H0();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const u=J0(o,l);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(ee.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ue())}isEqual(e){return this.batchId===e.batchId&&cs(this.mutations,e.mutations,(n,r)=>Og(n,r))&&cs(this.baseMutations,e.baseMutations,(n,r)=>Og(n,r))}}class _f{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){pe(e.mutations.length===r.length);let i=function(){return hk}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new _f(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sk{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ak{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Fe,de;function tw(t){switch(t){default:return Z();case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0}}function nw(t){if(t===void 0)return zn("GRPC error has no .code"),M.UNKNOWN;switch(t){case Fe.OK:return M.OK;case Fe.CANCELLED:return M.CANCELLED;case Fe.UNKNOWN:return M.UNKNOWN;case Fe.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case Fe.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case Fe.INTERNAL:return M.INTERNAL;case Fe.UNAVAILABLE:return M.UNAVAILABLE;case Fe.UNAUTHENTICATED:return M.UNAUTHENTICATED;case Fe.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case Fe.NOT_FOUND:return M.NOT_FOUND;case Fe.ALREADY_EXISTS:return M.ALREADY_EXISTS;case Fe.PERMISSION_DENIED:return M.PERMISSION_DENIED;case Fe.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case Fe.ABORTED:return M.ABORTED;case Fe.OUT_OF_RANGE:return M.OUT_OF_RANGE;case Fe.UNIMPLEMENTED:return M.UNIMPLEMENTED;case Fe.DATA_LOSS:return M.DATA_LOSS;default:return Z()}}(de=Fe||(Fe={}))[de.OK=0]="OK",de[de.CANCELLED=1]="CANCELLED",de[de.UNKNOWN=2]="UNKNOWN",de[de.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",de[de.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",de[de.NOT_FOUND=5]="NOT_FOUND",de[de.ALREADY_EXISTS=6]="ALREADY_EXISTS",de[de.PERMISSION_DENIED=7]="PERMISSION_DENIED",de[de.UNAUTHENTICATED=16]="UNAUTHENTICATED",de[de.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",de[de.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",de[de.ABORTED=10]="ABORTED",de[de.OUT_OF_RANGE=11]="OUT_OF_RANGE",de[de.UNIMPLEMENTED=12]="UNIMPLEMENTED",de[de.INTERNAL=13]="INTERNAL",de[de.UNAVAILABLE=14]="UNAVAILABLE",de[de.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rk(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kk=new ni([4294967295,4294967295],0);function bg(t){const e=Rk().encode(t),n=new S0;return n.update(e),new Uint8Array(n.digest())}function Fg(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new ni([n,r],0),new ni([i,s],0)]}class wf{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Zs(`Invalid padding: ${n}`);if(r<0)throw new Zs(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Zs(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Zs(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=ni.fromNumber(this.Ie)}Ee(e,n,r){let i=e.add(n.multiply(ni.fromNumber(r)));return i.compare(kk)===1&&(i=new ni([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=bg(e),[r,i]=Fg(n);for(let s=0;s<this.hashCount;s++){const o=this.Ee(r,i,s);if(!this.de(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new wf(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.Ie===0)return;const n=bg(e),[r,i]=Fg(n);for(let s=0;s<this.hashCount;s++){const o=this.Ee(r,i,s);this.Ae(o)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Zs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vu{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,sa.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Vu(ee.min(),i,new Ne(ge),Bn(),ue())}}class sa{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new sa(r,n,ue(),ue(),ue())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gl{constructor(e,n,r,i){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=i}}class rw{constructor(e,n){this.targetId=e,this.me=n}}class iw{constructor(e,n,r=lt.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class Ug{constructor(){this.fe=0,this.ge=zg(),this.pe=lt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=ue(),n=ue(),r=ue();return this.ge.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:Z()}}),new sa(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=zg()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,pe(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class Pk{constructor(e){this.Le=e,this.Be=new Map,this.ke=Bn(),this.qe=jg(),this.Qe=new Ne(ge)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:Z()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,i)=>{this.ze(i)&&n(i)})}He(e){const n=e.targetId,r=e.me.count,i=this.Je(n);if(i){const s=i.target;if($h(s))if(r===0){const o=new J(s.path);this.Ue(n,o,Xe.newNoDocument(o,ee.min()))}else pe(r===1);else{const o=this.Ye(n);if(o!==r){const l=this.Ze(e),u=l?this.Xe(l,e,o):1;if(u!==0){this.je(n);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=hi(r).toUint8Array()}catch(u){if(u instanceof V0)return us("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new wf(o,i,s)}catch(u){return us(u instanceof Zs?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.Le.tt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,s,null),i++)}),i}rt(e){const n=new Map;this.Be.forEach((s,o)=>{const l=this.Je(o);if(l){if(s.current&&$h(l.target)){const u=new J(l.target.path);this.ke.get(u)!==null||this.it(o,u)||this.Ue(o,u,Xe.newNoDocument(u,e))}s.be&&(n.set(o,s.ve()),s.Ce())}});let r=ue();this.qe.forEach((s,o)=>{let l=!0;o.forEachWhile(u=>{const h=this.Je(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.ke.forEach((s,o)=>o.setReadTime(e));const i=new Vu(e,n,this.Qe,this.ke,r);return this.ke=Bn(),this.qe=jg(),this.Qe=new Ne(ge),i}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,n)?i.Fe(n,1):i.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Ug,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new ot(ge),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||Q("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Ug),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function jg(){return new Ne(J.comparator)}function zg(){return new Ne(J.comparator)}const Ck={asc:"ASCENDING",desc:"DESCENDING"},Nk={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},xk={and:"AND",or:"OR"};class Dk{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function qh(t,e){return t.useProto3Json||na(e)?e:{value:e}}function Zl(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function sw(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Vk(t,e){return Zl(t,e.toTimestamp())}function Bt(t){return pe(!!t),ee.fromTimestamp(function(n){const r=Cr(n);return new qe(r.seconds,r.nanos)}(t))}function Ef(t,e){return Hh(t,e).canonicalString()}function Hh(t,e){const n=function(i){return new Ee(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function ow(t){const e=Ee.fromString(t);return pe(dw(e)),e}function eu(t,e){return Ef(t.databaseId,e.path)}function mo(t,e){const n=ow(e);if(n.get(1)!==t.databaseId.projectId)throw new q(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new q(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new J(lw(n))}function aw(t,e){return Ef(t.databaseId,e)}function Ok(t){const e=ow(t);return e.length===4?Ee.emptyPath():lw(e)}function Kh(t){return new Ee(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function lw(t){return pe(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function Bg(t,e,n){return{name:eu(t,e),fields:n.value.mapValue.fields}}function Lk(t,e){return"found"in e?function(r,i){pe(!!i.found),i.found.name,i.found.updateTime;const s=mo(r,i.found.name),o=Bt(i.found.updateTime),l=i.found.createTime?Bt(i.found.createTime):ee.min(),u=new St({mapValue:{fields:i.found.fields}});return Xe.newFoundDocument(s,o,l,u)}(t,e):"missing"in e?function(r,i){pe(!!i.missing),pe(!!i.readTime);const s=mo(r,i.missing),o=Bt(i.readTime);return Xe.newNoDocument(s,o)}(t,e):Z()}function Mk(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:Z()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,f){return h.useProto3Json?(pe(f===void 0||typeof f=="string"),lt.fromBase64String(f||"")):(pe(f===void 0||f instanceof Buffer||f instanceof Uint8Array),lt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(h){const f=h.code===void 0?M.UNKNOWN:nw(h.code);return new q(f,h.message||"")}(o);n=new iw(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=mo(t,r.document.name),s=Bt(r.document.updateTime),o=r.document.createTime?Bt(r.document.createTime):ee.min(),l=new St({mapValue:{fields:r.document.fields}}),u=Xe.newFoundDocument(i,s,o,l),h=r.targetIds||[],f=r.removedTargetIds||[];n=new gl(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=mo(t,r.document),s=r.readTime?Bt(r.readTime):ee.min(),o=Xe.newNoDocument(i,s),l=r.removedTargetIds||[];n=new gl([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=mo(t,r.document),s=r.removedTargetIds||[];n=new gl([],s,i,null)}else{if(!("filter"in e))return Z();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new Ak(i,s),l=r.targetId;n=new rw(l,o)}}return n}function uw(t,e){let n;if(e instanceof ra)n={update:Bg(t,e.key,e.value)};else if(e instanceof ia)n={delete:eu(t,e.key)};else if(e instanceof Lr)n={update:Bg(t,e.key,e.data),updateMask:qk(e.fieldMask)};else{if(!(e instanceof ew))return Z();n={verify:eu(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof zo)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Bo)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof $o)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Jl)return{fieldPath:o.field.canonicalString(),increment:l.Pe};throw Z()}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:Vk(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:Z()}(t,e.precondition)),n}function bk(t,e){return t&&t.length>0?(pe(e!==void 0),t.map(n=>function(i,s){let o=i.updateTime?Bt(i.updateTime):Bt(s);return o.isEqual(ee.min())&&(o=Bt(s)),new wk(o,i.transformResults||[])}(n,e))):[]}function Fk(t,e){return{documents:[aw(t,e.path)]}}function Uk(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=aw(t,i);const s=function(h){if(h.length!==0)return hw(hn.create(h,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(h){if(h.length!==0)return h.map(f=>function(m){return{field:Ni(m.field),direction:Bk(m.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=qh(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:i}}function jk(t){let e=Ok(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){pe(r===1);const f=n.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){const m=cw(p);return m instanceof hn&&b0(m)?m.getFilters():[m]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(m=>function(P){return new jo(xi(P.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(P.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,na(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){const m=!!p.before,S=p.values||[];return new Yl(S,m)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const m=!p.before,S=p.values||[];return new Yl(S,m)}(n.endAt)),ok(e,i,o,s,l,"F",u,h)}function zk(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Z()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function cw(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=xi(n.unaryFilter.field);return je.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=xi(n.unaryFilter.field);return je.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=xi(n.unaryFilter.field);return je.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=xi(n.unaryFilter.field);return je.create(o,"!=",{nullValue:"NULL_VALUE"});default:return Z()}}(t):t.fieldFilter!==void 0?function(n){return je.create(xi(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return Z()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return hn.create(n.compositeFilter.filters.map(r=>cw(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return Z()}}(n.compositeFilter.op))}(t):Z()}function Bk(t){return Ck[t]}function $k(t){return Nk[t]}function Wk(t){return xk[t]}function Ni(t){return{fieldPath:t.canonicalString()}}function xi(t){return it.fromServerFormat(t.fieldPath)}function hw(t){return t instanceof je?function(n){if(n.op==="=="){if(Pg(n.value))return{unaryFilter:{field:Ni(n.field),op:"IS_NAN"}};if(kg(n.value))return{unaryFilter:{field:Ni(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Pg(n.value))return{unaryFilter:{field:Ni(n.field),op:"IS_NOT_NAN"}};if(kg(n.value))return{unaryFilter:{field:Ni(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ni(n.field),op:$k(n.op),value:n.value}}}(t):t instanceof hn?function(n){const r=n.getFilters().map(i=>hw(i));return r.length===1?r[0]:{compositeFilter:{op:Wk(n.op),filters:r}}}(t):Z()}function qk(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function dw(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(e,n,r,i,s=ee.min(),o=ee.min(),l=lt.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new fr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hk{constructor(e){this.ct=e}}function Kk(t){const e=jk({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Xl(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gk{constructor(){this.un=new Qk}addToCollectionParentIndex(e,n){return this.un.add(n),F.resolve()}getCollectionParents(e,n){return F.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return F.resolve()}deleteFieldIndex(e,n){return F.resolve()}deleteAllFieldIndexes(e){return F.resolve()}createTargetIndexes(e,n){return F.resolve()}getDocumentsMatchingTarget(e,n){return F.resolve(null)}getIndexType(e,n){return F.resolve(0)}getFieldIndexes(e,n){return F.resolve([])}getNextCollectionGroupToUpdate(e){return F.resolve(null)}getMinOffset(e,n){return F.resolve(Pr.min())}getMinOffsetFromCollectionGroup(e,n){return F.resolve(Pr.min())}updateCollectionGroup(e,n,r){return F.resolve()}updateIndexEntries(e,n){return F.resolve()}}class Qk{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new ot(Ee.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new ot(Ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new fs(0)}static kn(){return new fs(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yk{constructor(){this.changes=new Ts(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Xe.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?F.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xk{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jk{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&po(r.mutation,i,jt.empty(),qe.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,ue()).next(()=>r))}getLocalViewOfDocuments(e,n,r=ue()){const i=Jr();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=Js();return s.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Jr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,ue()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=Bn();const o=fo(),l=function(){return fo()}();return n.forEach((u,h)=>{const f=r.get(h.key);i.has(h.key)&&(f===void 0||f.mutation instanceof Lr)?s=s.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),po(f.mutation,h,f.mutation.getFieldMask(),qe.now())):o.set(h.key,jt.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((h,f)=>o.set(h,f)),n.forEach((h,f)=>{var p;return l.set(h,new Xk(f,(p=o.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=fo();let i=new Ne((o,l)=>o-l),s=ue();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const h=n.get(u);if(h===null)return;let f=r.get(u)||jt.empty();f=l.applyToLocalView(h,f),r.set(u,f);const p=(i.get(l.batchId)||ue()).add(u);i=i.insert(l.batchId,p)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),h=u.key,f=u.value,p=H0();f.forEach(m=>{if(!s.has(m)){const S=J0(n.get(m),r.get(m));S!==null&&p.set(m,S),s=s.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return F.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return function(o){return J.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):z0(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):F.resolve(Jr());let l=-1,u=s;return o.next(h=>F.forEach(h,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?F.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{u=u.insert(f,m)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,u,h,ue())).next(f=>({batchId:l,changes:q0(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new J(n)).next(r=>{let i=Js();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=Js();return this.indexManager.getCollectionParents(e,s).next(l=>F.forEach(l,u=>{const h=function(p,m){return new Es(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,r,i).next(f=>{f.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,Xe.newInvalidDocument(f)))});let l=Js();return o.forEach((u,h)=>{const f=s.get(u);f!==void 0&&po(f.mutation,h,jt.empty(),qe.now()),Nu(n,h)&&(l=l.insert(u,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zk{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return F.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(i){return{id:i.id,version:i.version,createTime:Bt(i.createTime)}}(n)),F.resolve()}getNamedQuery(e,n){return F.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(i){return{name:i.name,query:Kk(i.bundledQuery),readTime:Bt(i.readTime)}}(n)),F.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eP{constructor(){this.overlays=new Ne(J.comparator),this.Ir=new Map}getOverlay(e,n){return F.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Jr();return F.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.ht(e,n,s)}),F.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.Ir.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Ir.delete(r)),F.resolve()}getOverlaysForCollection(e,n,r){const i=Jr(),s=n.length+1,o=new J(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,h=u.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return F.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new Ne((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let f=s.get(h.largestBatchId);f===null&&(f=Jr(),s=s.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const l=Jr(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>l.set(h,f)),!(l.size()>=i)););return F.resolve(l)}ht(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.Ir.get(i.largestBatchId).delete(r.key);this.Ir.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Sk(n,r));let s=this.Ir.get(n);s===void 0&&(s=ue(),this.Ir.set(n,s)),this.Ir.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tP{constructor(){this.sessionToken=lt.EMPTY_BYTE_STRING}getSessionToken(e){return F.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,F.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tf{constructor(){this.Tr=new ot(Qe.Er),this.dr=new ot(Qe.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new Qe(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new Qe(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new J(new Ee([])),r=new Qe(n,e),i=new Qe(n,e+1),s=[];return this.dr.forEachInRange([r,i],o=>{this.Vr(o),s.push(o.key)}),s}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new J(new Ee([])),r=new Qe(n,e),i=new Qe(n,e+1);let s=ue();return this.dr.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new Qe(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class Qe{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return J.comparator(e.key,n.key)||ge(e.wr,n.wr)}static Ar(e,n){return ge(e.wr,n.wr)||J.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nP{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new ot(Qe.Er)}checkEmpty(e){return F.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Ik(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.br=this.br.add(new Qe(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return F.resolve(o)}lookupMutationBatch(e,n){return F.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.vr(r),s=i<0?0:i;return F.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return F.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return F.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new Qe(n,0),i=new Qe(n,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([r,i],o=>{const l=this.Dr(o.wr);s.push(l)}),F.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new ot(ge);return n.forEach(i=>{const s=new Qe(i,0),o=new Qe(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([s,o],l=>{r=r.add(l.wr)})}),F.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;J.isDocumentKey(s)||(s=s.child(""));const o=new Qe(new J(s),0);let l=new ot(ge);return this.br.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===i&&(l=l.add(u.wr)),!0)},o),F.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const i=this.Dr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){pe(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return F.forEach(n.mutations,i=>{const s=new Qe(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new Qe(n,0),i=this.br.firstAfterOrEqual(r);return F.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,F.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rP{constructor(e){this.Mr=e,this.docs=function(){return new Ne(J.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return F.resolve(r?r.document.mutableCopy():Xe.newInvalidDocument(n))}getEntries(e,n){let r=Bn();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Xe.newInvalidDocument(i))}),F.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=Bn();const o=n.path,l=new J(o.child("")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||zR(jR(f),r)<=0||(i.has(f.key)||Nu(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return F.resolve(s)}getAllFromCollectionGroup(e,n,r,i){Z()}Or(e,n){return F.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new iP(this)}getSize(e){return F.resolve(this.size)}}class iP extends Yk{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.cr.addEntry(e,i)):this.cr.removeEntry(r)}),F.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sP{constructor(e){this.persistence=e,this.Nr=new Ts(n=>mf(n),gf),this.lastRemoteSnapshotVersion=ee.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Tf,this.targetCount=0,this.kr=fs.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,i)=>n(i)),F.resolve()}getLastRemoteSnapshotVersion(e){return F.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return F.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),F.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),F.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new fs(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,F.resolve()}updateTargetData(e,n){return this.Kn(n),F.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,F.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.Nr.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),F.waitFor(s).next(()=>i)}getTargetCount(e){return F.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return F.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),F.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),F.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),F.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return F.resolve(r)}containsKey(e,n){return F.resolve(this.Br.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oP{constructor(e,n){this.qr={},this.overlays={},this.Qr=new hf(0),this.Kr=!1,this.Kr=!0,this.$r=new tP,this.referenceDelegate=e(this),this.Ur=new sP(this),this.indexManager=new Gk,this.remoteDocumentCache=function(i){return new rP(i)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new Hk(n),this.Gr=new Zk(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new eP,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new nP(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){Q("MemoryPersistence","Starting transaction:",e);const i=new aP(this.Qr.next());return this.referenceDelegate.zr(),r(i).next(s=>this.referenceDelegate.jr(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Hr(e,n){return F.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class aP extends $R{constructor(e){super(),this.currentSequenceNumber=e}}class If{constructor(e){this.persistence=e,this.Jr=new Tf,this.Yr=null}static Zr(e){return new If(e)}get Xr(){if(this.Yr)return this.Yr;throw Z()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),F.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),F.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),F.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(i=>this.Xr.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.Xr.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return F.forEach(this.Xr,r=>{const i=J.fromPath(r);return this.ei(e,i).next(s=>{s||n.removeEntry(i,ee.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return F.or([()=>F.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sf{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=i}static Wi(e,n){let r=ue(),i=ue();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Sf(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lP{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uP{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return pS()?8:WR(Et())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.Yi(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.Zi(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new lP;return this.Xi(e,n,o).next(l=>{if(s.result=l,this.zi)return this.es(e,n,o,l.size)})}).next(()=>s.result)}es(e,n,r,i){return r.documentReadCount<this.ji?(Hs()<=he.DEBUG&&Q("QueryEngine","SDK will not create cache indexes for query:",Ci(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),F.resolve()):(Hs()<=he.DEBUG&&Q("QueryEngine","Query:",Ci(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Hi*i?(Hs()<=he.DEBUG&&Q("QueryEngine","The SDK decides to create cache indexes for query:",Ci(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,_n(n))):F.resolve())}Yi(e,n){if(Dg(n))return F.resolve(null);let r=_n(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=Xl(n,null,"F"),r=_n(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=ue(...s);return this.Ji.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.ts(n,l);return this.ns(n,h,o,u.readTime)?this.Yi(e,Xl(n,null,"F")):this.rs(e,h,n,u)}))})))}Zi(e,n,r,i){return Dg(n)||i.isEqual(ee.min())?F.resolve(null):this.Ji.getDocuments(e,r).next(s=>{const o=this.ts(n,s);return this.ns(n,o,r,i)?F.resolve(null):(Hs()<=he.DEBUG&&Q("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Ci(n)),this.rs(e,o,n,UR(i,-1)).next(l=>l))})}ts(e,n){let r=new ot($0(e));return n.forEach((i,s)=>{Nu(e,s)&&(r=r.add(s))}),r}ns(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,n,r){return Hs()<=he.DEBUG&&Q("QueryEngine","Using full collection scan to execute query:",Ci(n)),this.Ji.getDocumentsMatchingQuery(e,n,Pr.min(),r)}rs(e,n,r,i){return this.Ji.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cP{constructor(e,n,r,i){this.persistence=e,this.ss=n,this.serializer=i,this.os=new Ne(ge),this._s=new Ts(s=>mf(s),gf),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Jk(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function hP(t,e,n,r){return new cP(t,e,n,r)}async function fw(t,e){const n=re(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let u=ue();for(const h of i){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of s){l.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(r,u).next(h=>({hs:h,removedBatchIds:o,addedBatchIds:l}))})})}function dP(t,e){const n=re(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,u,h,f){const p=h.batch,m=p.keys();let S=F.resolve();return m.forEach(P=>{S=S.next(()=>f.getEntry(u,P)).next(N=>{const L=h.docVersions.get(P);pe(L!==null),N.version.compareTo(L)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),f.addEntry(N)))})}),S.next(()=>l.mutationQueue.removeMutationBatch(u,p))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=ue();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(u=u.add(l.batch.mutations[h].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function pw(t){const e=re(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function fP(t,e){const n=re(t),r=e.snapshotVersion;let i=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.cs.newChangeBuffer({trackRemovals:!0});i=n.os;const l=[];e.targetChanges.forEach((f,p)=>{const m=i.get(p);if(!m)return;l.push(n.Ur.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(s,f.addedDocuments,p)));let S=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?S=S.withResumeToken(lt.EMPTY_BYTE_STRING,ee.min()).withLastLimboFreeSnapshotVersion(ee.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),i=i.insert(p,S),function(N,L,v){return N.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:v.addedDocuments.size+v.modifiedDocuments.size+v.removedDocuments.size>0}(m,S,f)&&l.push(n.Ur.updateTargetData(s,S))});let u=Bn(),h=ue();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(pP(s,o,e.documentUpdates).next(f=>{u=f.Ps,h=f.Is})),!r.isEqual(ee.min())){const f=n.Ur.getLastRemoteSnapshotVersion(s).next(p=>n.Ur.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return F.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,h)).next(()=>u)}).then(s=>(n.os=i,s))}function pP(t,e,n){let r=ue(),i=ue();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=Bn();return n.forEach((l,u)=>{const h=s.get(l);u.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(l)),u.isNoDocument()&&u.version.isEqual(ee.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):Q("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",u.version)}),{Ps:o,Is:i}})}function mP(t,e){const n=re(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function gP(t,e){const n=re(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.Ur.getTargetData(r,e).next(s=>s?(i=s,F.resolve(i)):n.Ur.allocateTargetId(r).next(o=>(i=new fr(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.os.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Gh(t,e,n){const r=re(t),i=r.os.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!ta(o))throw o;Q("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.os=r.os.remove(e),r._s.delete(i.target)}function $g(t,e,n){const r=re(t);let i=ee.min(),s=ue();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const p=re(u),m=p._s.get(f);return m!==void 0?F.resolve(p.os.get(m)):p.Ur.getTargetData(h,f)}(r,o,_n(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(o,l.targetId).next(u=>{s=u})}).next(()=>r.ss.getDocumentsMatchingQuery(o,e,n?i:ee.min(),n?s:ue())).next(l=>(yP(r,lk(e),l),{documents:l,Ts:s})))}function yP(t,e,n){let r=t.us.get(e)||ee.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.us.set(e,r)}class Wg{constructor(){this.activeTargetIds=pk()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class vP{constructor(){this.so=new Wg,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Wg,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _P{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qg{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){Q("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){Q("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ya=null;function Lc(){return Ya===null?Ya=function(){return 268435456+Math.round(2147483648*Math.random())}():Ya++,"0x"+Ya.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wP={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EP{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yt="WebChannelConnection";class TP extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${i}/databases/${s}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get Fo(){return!1}Mo(n,r,i,s,o){const l=Lc(),u=this.xo(n,r.toUriEncodedString());Q("RestConnection",`Sending RPC '${n}' ${l}:`,u,i);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,s,o),this.No(n,u,h,i).then(f=>(Q("RestConnection",`Received RPC '${n}' ${l}: `,f),f),f=>{throw us("RestConnection",`RPC '${n}' ${l} failed with error: `,f,"url: ",u,"request:",i),f})}Lo(n,r,i,s,o,l){return this.Mo(n,r,i,s,o)}Oo(n,r,i){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ws}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((s,o)=>n[o]=s),i&&i.headers.forEach((s,o)=>n[o]=s)}xo(n,r){const i=wP[n];return`${this.Do}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,i){const s=Lc();return new Promise((o,l)=>{const u=new A0;u.setWithCredentials(!0),u.listenOnce(R0.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case fl.NO_ERROR:const f=u.getResponseJson();Q(yt,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(f)),o(f);break;case fl.TIMEOUT:Q(yt,`RPC '${e}' ${s} timed out`),l(new q(M.DEADLINE_EXCEEDED,"Request time out"));break;case fl.HTTP_ERROR:const p=u.getStatus();if(Q(yt,`RPC '${e}' ${s} failed with status:`,p,"response text:",u.getResponseText()),p>0){let m=u.getResponseJson();Array.isArray(m)&&(m=m[0]);const S=m==null?void 0:m.error;if(S&&S.status&&S.message){const P=function(L){const v=L.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(v)>=0?v:M.UNKNOWN}(S.status);l(new q(P,S.message))}else l(new q(M.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new q(M.UNAVAILABLE,"Connection failed."));break;default:Z()}}finally{Q(yt,`RPC '${e}' ${s} completed.`)}});const h=JSON.stringify(i);Q(yt,`RPC '${e}' ${s} sending request:`,i),u.send(n,"POST",h,r,15)})}Bo(e,n,r){const i=Lc(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=C0(),l=P0(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const f=s.join("");Q(yt,`Creating RPC '${e}' stream ${i}: ${f}`,u);const p=o.createWebChannel(f,u);let m=!1,S=!1;const P=new EP({Io:L=>{S?Q(yt,`Not sending because RPC '${e}' stream ${i} is closed:`,L):(m||(Q(yt,`Opening RPC '${e}' stream ${i} transport.`),p.open(),m=!0),Q(yt,`RPC '${e}' stream ${i} sending:`,L),p.send(L))},To:()=>p.close()}),N=(L,v,w)=>{L.listen(v,A=>{try{w(A)}catch(x){setTimeout(()=>{throw x},0)}})};return N(p,Xs.EventType.OPEN,()=>{S||(Q(yt,`RPC '${e}' stream ${i} transport opened.`),P.yo())}),N(p,Xs.EventType.CLOSE,()=>{S||(S=!0,Q(yt,`RPC '${e}' stream ${i} transport closed`),P.So())}),N(p,Xs.EventType.ERROR,L=>{S||(S=!0,us(yt,`RPC '${e}' stream ${i} transport errored:`,L),P.So(new q(M.UNAVAILABLE,"The operation could not be completed")))}),N(p,Xs.EventType.MESSAGE,L=>{var v;if(!S){const w=L.data[0];pe(!!w);const A=w,x=A.error||((v=A[0])===null||v===void 0?void 0:v.error);if(x){Q(yt,`RPC '${e}' stream ${i} received error:`,x);const D=x.status;let b=function(E){const I=Fe[E];if(I!==void 0)return nw(I)}(D),T=x.message;b===void 0&&(b=M.INTERNAL,T="Unknown error status: "+D+" with message "+x.message),S=!0,P.So(new q(b,T)),p.close()}else Q(yt,`RPC '${e}' stream ${i} received:`,w),P.bo(w)}}),N(l,k0.STAT_EVENT,L=>{L.stat===Uh.PROXY?Q(yt,`RPC '${e}' stream ${i} detected buffering proxy`):L.stat===Uh.NOPROXY&&Q(yt,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{P.wo()},0),P}}function Mc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ou(t){return new Dk(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af{constructor(e,n,r=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),i=Math.max(0,n-r);i>0&&Q("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mw{constructor(e,n,r,i,s,o,l,u){this.ui=e,this.Ho=r,this.Jo=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Af(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===M.RESOURCE_EXHAUSTED?(zn(n.toString()),zn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Yo===n&&this.P_(r,i)},r=>{e(()=>{const i=new q(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(i)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{r(()=>this.I_(i))}),this.stream.onMessage(i=>{r(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return Q("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(Q("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class IP extends mw{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=Mk(this.serializer,e),r=function(s){if(!("targetChange"in s))return ee.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?ee.min():o.readTime?Bt(o.readTime):ee.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=Kh(this.serializer),n.addTarget=function(s,o){let l;const u=o.target;if(l=$h(u)?{documents:Fk(s,u)}:{query:Uk(s,u)._t},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=sw(s,o.resumeToken);const h=qh(s,o.expectedCount);h!==null&&(l.expectedCount=h)}else if(o.snapshotVersion.compareTo(ee.min())>0){l.readTime=Zl(s,o.snapshotVersion.toTimestamp());const h=qh(s,o.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=zk(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=Kh(this.serializer),n.removeTarget=e,this.a_(n)}}class SP extends mw{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return pe(!!e.streamToken),this.lastStreamToken=e.streamToken,pe(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){pe(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=bk(e.writeResults,e.commitTime),r=Bt(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=Kh(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>uw(this.serializer,r))};this.a_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AP extends class{}{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new q(M.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Mo(e,Hh(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new q(M.UNKNOWN,s.toString())})}Lo(e,n,r,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Lo(e,Hh(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new q(M.UNKNOWN,o.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class RP{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(zn(n),this.D_=!1):Q("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kP{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o(o=>{r.enqueueAndForget(async()=>{yi(this)&&(Q("RemoteStore","Restarting streams for network reachability change."),await async function(u){const h=re(u);h.L_.add(4),await oa(h),h.q_.set("Unknown"),h.L_.delete(4),await Lu(h)}(this))})}),this.q_=new RP(r,i)}}async function Lu(t){if(yi(t))for(const e of t.B_)await e(!0)}async function oa(t){for(const e of t.B_)await e(!1)}function gw(t,e){const n=re(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),Cf(n)?Pf(n):Is(n).r_()&&kf(n,e))}function Rf(t,e){const n=re(t),r=Is(n);n.N_.delete(e),r.r_()&&yw(n,e),n.N_.size===0&&(r.r_()?r.o_():yi(n)&&n.q_.set("Unknown"))}function kf(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ee.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Is(t).A_(e)}function yw(t,e){t.Q_.xe(e),Is(t).R_(e)}function Pf(t){t.Q_=new Pk({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),Is(t).start(),t.q_.v_()}function Cf(t){return yi(t)&&!Is(t).n_()&&t.N_.size>0}function yi(t){return re(t).L_.size===0}function vw(t){t.Q_=void 0}async function PP(t){t.q_.set("Online")}async function CP(t){t.N_.forEach((e,n)=>{kf(t,e)})}async function NP(t,e){vw(t),Cf(t)?(t.q_.M_(e),Pf(t)):t.q_.set("Unknown")}async function xP(t,e,n){if(t.q_.set("Online"),e instanceof iw&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.N_.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.N_.delete(l),i.Q_.removeTarget(l))}(t,e)}catch(r){Q("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await tu(t,r)}else if(e instanceof gl?t.Q_.Ke(e):e instanceof rw?t.Q_.He(e):t.Q_.We(e),!n.isEqual(ee.min()))try{const r=await pw(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.Q_.rt(o);return l.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.N_.get(h);f&&s.N_.set(h,f.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,h)=>{const f=s.N_.get(u);if(!f)return;s.N_.set(u,f.withResumeToken(lt.EMPTY_BYTE_STRING,f.snapshotVersion)),yw(s,u);const p=new fr(f.target,u,h,f.sequenceNumber);kf(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){Q("RemoteStore","Failed to raise snapshot:",r),await tu(t,r)}}async function tu(t,e,n){if(!ta(e))throw e;t.L_.add(1),await oa(t),t.q_.set("Offline"),n||(n=()=>pw(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{Q("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await Lu(t)})}function _w(t,e){return e().catch(n=>tu(t,n,e))}async function Mu(t){const e=re(t),n=Nr(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;DP(e);)try{const i=await mP(e.localStore,r);if(i===null){e.O_.length===0&&n.o_();break}r=i.batchId,VP(e,i)}catch(i){await tu(e,i)}ww(e)&&Ew(e)}function DP(t){return yi(t)&&t.O_.length<10}function VP(t,e){t.O_.push(e);const n=Nr(t);n.r_()&&n.V_&&n.m_(e.mutations)}function ww(t){return yi(t)&&!Nr(t).n_()&&t.O_.length>0}function Ew(t){Nr(t).start()}async function OP(t){Nr(t).p_()}async function LP(t){const e=Nr(t);for(const n of t.O_)e.m_(n.mutations)}async function MP(t,e,n){const r=t.O_.shift(),i=_f.from(r,e,n);await _w(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await Mu(t)}async function bP(t,e){e&&Nr(t).V_&&await async function(r,i){if(function(o){return tw(o)&&o!==M.ABORTED}(i.code)){const s=r.O_.shift();Nr(r).s_(),await _w(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Mu(r)}}(t,e),ww(t)&&Ew(t)}async function Hg(t,e){const n=re(t);n.asyncQueue.verifyOperationInProgress(),Q("RemoteStore","RemoteStore received new credentials");const r=yi(n);n.L_.add(3),await oa(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await Lu(n)}async function FP(t,e){const n=re(t);e?(n.L_.delete(2),await Lu(n)):e||(n.L_.add(2),await oa(n),n.q_.set("Unknown"))}function Is(t){return t.K_||(t.K_=function(n,r,i){const s=re(n);return s.w_(),new IP(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Eo:PP.bind(null,t),Ro:CP.bind(null,t),mo:NP.bind(null,t),d_:xP.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),Cf(t)?Pf(t):t.q_.set("Unknown")):(await t.K_.stop(),vw(t))})),t.K_}function Nr(t){return t.U_||(t.U_=function(n,r,i){const s=re(n);return s.w_(),new SP(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:OP.bind(null,t),mo:bP.bind(null,t),f_:LP.bind(null,t),g_:MP.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await Mu(t)):(await t.U_.stop(),t.O_.length>0&&(Q("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nf{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new On,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new Nf(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new q(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function xf(t,e){if(zn("AsyncQueue",`${e}: ${t}`),ta(t))return new q(M.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(e){this.comparator=e?(n,r)=>e(n,r)||J.comparator(n.key,r.key):(n,r)=>J.comparator(n.key,r.key),this.keyedMap=Js(),this.sortedSet=new Ne(this.comparator)}static emptySet(e){return new es(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof es)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new es;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(){this.W_=new Ne(J.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):Z():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class ps{constructor(e,n,r,i,s,o,l,u,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new ps(e,n,es.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Cu(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UP{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class jP{constructor(){this.queries=Gg(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const i=re(n),s=i.queries;i.queries=Gg(),s.forEach((o,l)=>{for(const u of l.j_)u.onError(r)})})(this,new q(M.ABORTED,"Firestore shutting down"))}}function Gg(){return new Ts(t=>B0(t),Cu)}async function Tw(t,e){const n=re(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.H_()&&e.J_()&&(r=2):(s=new UP,r=e.J_()?0:1);try{switch(r){case 0:s.z_=await n.onListen(i,!0);break;case 1:s.z_=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=xf(o,`Initialization of query '${Ci(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.j_.push(e),e.Z_(n.onlineState),s.z_&&e.X_(s.z_)&&Df(n)}async function Iw(t,e){const n=re(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.j_.indexOf(e);o>=0&&(s.j_.splice(o,1),s.j_.length===0?i=e.J_()?0:1:!s.H_()&&e.J_()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function zP(t,e){const n=re(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.j_)l.X_(i)&&(r=!0);o.z_=i}}r&&Df(n)}function BP(t,e,n){const r=re(t),i=r.queries.get(e);if(i)for(const s of i.j_)s.onError(n);r.queries.delete(e)}function Df(t){t.Y_.forEach(e=>{e.next()})}var Qh,Qg;(Qg=Qh||(Qh={})).ea="default",Qg.Cache="cache";class Sw{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new ps(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=ps.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Qh.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aw{constructor(e){this.key=e}}class Rw{constructor(e){this.key=e}}class $P{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=ue(),this.mutatedKeys=ue(),this.Aa=$0(e),this.Ra=new es(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new Kg,i=n?n.Ra:this.Ra;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const m=i.get(f),S=Nu(this.query,p)?p:null,P=!!m&&this.mutatedKeys.has(m.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let L=!1;m&&S?m.data.isEqual(S.data)?P!==N&&(r.track({type:3,doc:S}),L=!0):this.ga(m,S)||(r.track({type:2,doc:S}),L=!0,(u&&this.Aa(S,u)>0||h&&this.Aa(S,h)<0)&&(l=!0)):!m&&S?(r.track({type:0,doc:S}),L=!0):m&&!S&&(r.track({type:1,doc:m}),L=!0,(u||h)&&(l=!0)),L&&(S?(o=o.add(S),s=N?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{Ra:o,fa:r,ns:l,mutatedKeys:s}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const o=e.fa.G_();o.sort((f,p)=>function(S,P){const N=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Z()}};return N(S)-N(P)}(f.type,p.type)||this.Aa(f.doc,p.doc)),this.pa(r),i=i!=null&&i;const l=n&&!i?this.ya():[],u=this.da.size===0&&this.current&&!i?1:0,h=u!==this.Ea;return this.Ea=u,o.length!==0||h?{snapshot:new ps(this.query,e.Ra,s,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Kg,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=ue(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new Rw(r))}),this.da.forEach(r=>{e.has(r)||n.push(new Aw(r))}),n}ba(e){this.Ta=e.Ts,this.da=ue();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return ps.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class WP{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class qP{constructor(e){this.key=e,this.va=!1}}class HP{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Ca={},this.Fa=new Ts(l=>B0(l),Cu),this.Ma=new Map,this.xa=new Set,this.Oa=new Ne(J.comparator),this.Na=new Map,this.La=new Tf,this.Ba={},this.ka=new Map,this.qa=fs.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function KP(t,e,n=!0){const r=Dw(t);let i;const s=r.Fa.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.Da()):i=await kw(r,e,n,!0),i}async function GP(t,e){const n=Dw(t);await kw(n,e,!0,!1)}async function kw(t,e,n,r){const i=await gP(t.localStore,_n(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await QP(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&gw(t.remoteStore,i),l}async function QP(t,e,n,r,i){t.Ka=(p,m,S)=>async function(N,L,v,w){let A=L.view.ma(v);A.ns&&(A=await $g(N.localStore,L.query,!1).then(({documents:T})=>L.view.ma(T,A)));const x=w&&w.targetChanges.get(L.targetId),D=w&&w.targetMismatches.get(L.targetId)!=null,b=L.view.applyChanges(A,N.isPrimaryClient,x,D);return Xg(N,L.targetId,b.wa),b.snapshot}(t,p,m,S);const s=await $g(t.localStore,e,!0),o=new $P(e,s.Ts),l=o.ma(s.documents),u=sa.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),h=o.applyChanges(l,t.isPrimaryClient,u);Xg(t,n,h.wa);const f=new WP(e,n,o);return t.Fa.set(e,f),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function YP(t,e,n){const r=re(t),i=r.Fa.get(e),s=r.Ma.get(i.targetId);if(s.length>1)return r.Ma.set(i.targetId,s.filter(o=>!Cu(o,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Gh(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&Rf(r.remoteStore,i.targetId),Yh(r,i.targetId)}).catch(ea)):(Yh(r,i.targetId),await Gh(r.localStore,i.targetId,!0))}async function XP(t,e){const n=re(t),r=n.Fa.get(e),i=n.Ma.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Rf(n.remoteStore,r.targetId))}async function JP(t,e,n){const r=sC(t);try{const i=await function(o,l){const u=re(o),h=qe.now(),f=l.reduce((S,P)=>S.add(P.key),ue());let p,m;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let P=Bn(),N=ue();return u.cs.getEntries(S,f).next(L=>{P=L,P.forEach((v,w)=>{w.isValidDocument()||(N=N.add(v))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,P)).next(L=>{p=L;const v=[];for(const w of l){const A=Tk(w,p.get(w.key).overlayedDocument);A!=null&&v.push(new Lr(w.key,A,O0(A.value.mapValue),Je.exists(!0)))}return u.mutationQueue.addMutationBatch(S,h,v,l)}).next(L=>{m=L;const v=L.applyToLocalDocumentSet(p,N);return u.documentOverlayCache.saveOverlays(S,L.batchId,v)})}).then(()=>({batchId:m.batchId,changes:q0(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,u){let h=o.Ba[o.currentUser.toKey()];h||(h=new Ne(ge)),h=h.insert(l,u),o.Ba[o.currentUser.toKey()]=h}(r,i.batchId,n),await aa(r,i.changes),await Mu(r.remoteStore)}catch(i){const s=xf(i,"Failed to persist write");n.reject(s)}}async function Pw(t,e){const n=re(t);try{const r=await fP(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Na.get(s);o&&(pe(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?o.va=!0:i.modifiedDocuments.size>0?pe(o.va):i.removedDocuments.size>0&&(pe(o.va),o.va=!1))}),await aa(n,r,e)}catch(r){await ea(r)}}function Yg(t,e,n){const r=re(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Fa.forEach((s,o)=>{const l=o.view.Z_(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const u=re(o);u.onlineState=l;let h=!1;u.queries.forEach((f,p)=>{for(const m of p.j_)m.Z_(l)&&(h=!0)}),h&&Df(u)}(r.eventManager,e),i.length&&r.Ca.d_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function ZP(t,e,n){const r=re(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Na.get(e),s=i&&i.key;if(s){let o=new Ne(J.comparator);o=o.insert(s,Xe.newNoDocument(s,ee.min()));const l=ue().add(s),u=new Vu(ee.min(),new Map,new Ne(ge),o,l);await Pw(r,u),r.Oa=r.Oa.remove(s),r.Na.delete(e),Vf(r)}else await Gh(r.localStore,e,!1).then(()=>Yh(r,e,n)).catch(ea)}async function eC(t,e){const n=re(t),r=e.batch.batchId;try{const i=await dP(n.localStore,e);Nw(n,r,null),Cw(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await aa(n,i)}catch(i){await ea(i)}}async function tC(t,e,n){const r=re(t);try{const i=await function(o,l){const u=re(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,l).next(p=>(pe(p!==null),f=p.keys(),u.mutationQueue.removeMutationBatch(h,p))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);Nw(r,e,n),Cw(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await aa(r,i)}catch(i){await ea(i)}}function Cw(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function Nw(t,e,n){const r=re(t);let i=r.Ba[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.Ba[r.currentUser.toKey()]=i}}function Yh(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||xw(t,r)})}function xw(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(Rf(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),Vf(t))}function Xg(t,e,n){for(const r of n)r instanceof Aw?(t.La.addReference(r.key,e),nC(t,r)):r instanceof Rw?(Q("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||xw(t,r.key)):Z()}function nC(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(Q("SyncEngine","New document in limbo: "+n),t.xa.add(r),Vf(t))}function Vf(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new J(Ee.fromString(e)),r=t.qa.next();t.Na.set(r,new qP(n)),t.Oa=t.Oa.insert(n,r),gw(t.remoteStore,new fr(_n(yf(n.path)),r,"TargetPurposeLimboResolution",hf.oe))}}async function aa(t,e,n){const r=re(t),i=[],s=[],o=[];r.Fa.isEmpty()||(r.Fa.forEach((l,u)=>{o.push(r.Ka(u,e,n).then(h=>{var f;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(f=n==null?void 0:n.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(h){i.push(h);const p=Sf.Wi(u.targetId,h);s.push(p)}}))}),await Promise.all(o),r.Ca.d_(i),await async function(u,h){const f=re(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>F.forEach(h,m=>F.forEach(m.$i,S=>f.persistence.referenceDelegate.addReference(p,m.targetId,S)).next(()=>F.forEach(m.Ui,S=>f.persistence.referenceDelegate.removeReference(p,m.targetId,S)))))}catch(p){if(!ta(p))throw p;Q("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const m=p.targetId;if(!p.fromCache){const S=f.os.get(m),P=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(P);f.os=f.os.insert(m,N)}}}(r.localStore,s))}async function rC(t,e){const n=re(t);if(!n.currentUser.isEqual(e)){Q("SyncEngine","User change. New user:",e.toKey());const r=await fw(n.localStore,e);n.currentUser=e,function(s,o){s.ka.forEach(l=>{l.forEach(u=>{u.reject(new q(M.CANCELLED,o))})}),s.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await aa(n,r.hs)}}function iC(t,e){const n=re(t),r=n.Na.get(e);if(r&&r.va)return ue().add(r.key);{let i=ue();const s=n.Ma.get(e);if(!s)return i;for(const o of s){const l=n.Fa.get(o);i=i.unionWith(l.view.Va)}return i}}function Dw(t){const e=re(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Pw.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=iC.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=ZP.bind(null,e),e.Ca.d_=zP.bind(null,e.eventManager),e.Ca.$a=BP.bind(null,e.eventManager),e}function sC(t){const e=re(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=eC.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=tC.bind(null,e),e}class nu{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ou(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return hP(this.persistence,new uP,e.initialUser,this.serializer)}Ga(e){return new oP(If.Zr,this.serializer)}Wa(e){return new vP}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}nu.provider={build:()=>new nu};class Xh{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Yg(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=rC.bind(null,this.syncEngine),await FP(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new jP}()}createDatastore(e){const n=Ou(e.databaseInfo.databaseId),r=function(s){return new TP(s)}(e.databaseInfo);return function(s,o,l,u){return new AP(s,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new kP(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Yg(this.syncEngine,n,0),function(){return qg.D()?new qg:new _P}())}createSyncEngine(e,n){return function(i,s,o,l,u,h,f){const p=new HP(i,s,o,l,u,h);return f&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=re(i);Q("RemoteStore","RemoteStore shutting down."),s.L_.add(5),await oa(s),s.k_.shutdown(),s.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Xh.provider={build:()=>new Xh};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vw{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):zn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oC{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new q(M.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const n=await async function(i,s){const o=re(i),l={documents:s.map(p=>eu(o.serializer,p))},u=await o.Lo("BatchGetDocuments",o.serializer.databaseId,Ee.emptyPath(),l,s.length),h=new Map;u.forEach(p=>{const m=Lk(o.serializer,p);h.set(m.key.toString(),m)});const f=[];return s.forEach(p=>{const m=h.get(p.toString());pe(!!m),f.push(m)}),f}(this.datastore,e);return n.forEach(r=>this.recordVersion(r)),n}set(e,n){this.write(n.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,n){try{this.write(n.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new ia(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(n=>{e.delete(n.key.toString())}),e.forEach((n,r)=>{const i=J.fromPath(r);this.mutations.push(new ew(i,this.precondition(i)))}),await async function(r,i){const s=re(r),o={writes:i.map(l=>uw(s.serializer,l))};await s.Mo("Commit",s.serializer.databaseId,Ee.emptyPath(),o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let n;if(e.isFoundDocument())n=e.version;else{if(!e.isNoDocument())throw Z();n=ee.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!n.isEqual(r))throw new q(M.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),n)}precondition(e){const n=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&n?n.isEqual(ee.min())?Je.exists(!1):Je.updateTime(n):Je.none()}preconditionForUpdate(e){const n=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&n){if(n.isEqual(ee.min()))throw new q(M.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Je.updateTime(n)}return Je.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aC{constructor(e,n,r,i,s){this.asyncQueue=e,this.datastore=n,this.options=r,this.updateFunction=i,this.deferred=s,this._u=r.maxAttempts,this.t_=new Af(this.asyncQueue,"transaction_retry")}au(){this._u-=1,this.uu()}uu(){this.t_.Go(async()=>{const e=new oC(this.datastore),n=this.cu(e);n&&n.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.lu(i)}))}).catch(r=>{this.lu(r)})})}cu(e){try{const n=this.updateFunction(e);return!na(n)&&n.catch&&n.then?n:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(n){return this.deferred.reject(n),null}}lu(e){this._u>0&&this.hu(e)?(this._u-=1,this.asyncQueue.enqueueAndForget(()=>(this.uu(),Promise.resolve()))):this.deferred.reject(e)}hu(e){if(e.name==="FirebaseError"){const n=e.code;return n==="aborted"||n==="failed-precondition"||n==="already-exists"||!tw(n)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lC{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=i,this.user=vt.UNAUTHENTICATED,this.clientId=x0.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{Q("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(Q("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new On;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=xf(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function bc(t,e){t.asyncQueue.verifyOperationInProgress(),Q("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await fw(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Jg(t,e){t.asyncQueue.verifyOperationInProgress();const n=await uC(t);Q("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Hg(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>Hg(e.remoteStore,i)),t._onlineComponents=e}async function uC(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){Q("FirestoreClient","Using user provided OfflineComponentProvider");try{await bc(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===M.FAILED_PRECONDITION||i.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;us("Error using user provided cache. Falling back to memory cache: "+n),await bc(t,new nu)}}else Q("FirestoreClient","Using default OfflineComponentProvider"),await bc(t,new nu);return t._offlineComponents}async function Of(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(Q("FirestoreClient","Using user provided OnlineComponentProvider"),await Jg(t,t._uninitializedComponentsProvider._online)):(Q("FirestoreClient","Using default OnlineComponentProvider"),await Jg(t,new Xh))),t._onlineComponents}function cC(t){return Of(t).then(e=>e.syncEngine)}function hC(t){return Of(t).then(e=>e.datastore)}async function Jh(t){const e=await Of(t),n=e.eventManager;return n.onListen=KP.bind(null,e.syncEngine),n.onUnlisten=YP.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=GP.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=XP.bind(null,e.syncEngine),n}function dC(t,e,n={}){const r=new On;return t.asyncQueue.enqueueAndForget(async()=>function(s,o,l,u,h){const f=new Vw({next:m=>{f.Za(),o.enqueueAndForget(()=>Iw(s,p)),m.fromCache&&u.source==="server"?h.reject(new q(M.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(m)},error:m=>h.reject(m)}),p=new Sw(l,f,{includeMetadataChanges:!0,_a:!0});return Tw(s,p)}(await Jh(t),t.asyncQueue,e,n,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ow(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zg=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lw(t,e,n){if(!n)throw new q(M.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function fC(t,e,n,r){if(e===!0&&r===!0)throw new q(M.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function ey(t){if(!J.isDocumentKey(t))throw new q(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function ty(t){if(J.isDocumentKey(t))throw new q(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function bu(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":Z()}function un(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new q(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=bu(t);throw new q(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ny{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new q(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new q(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}fC("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ow((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new q(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Fu{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ny({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new q(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new q(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ny(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new NR;switch(r.type){case"firstParty":return new OR(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new q(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Zg.get(n);r&&(Q("ComponentProvider","Removing Datastore"),Zg.delete(n),r.terminate())}(this),Promise.resolve()}}function pC(t,e,n,r={}){var i;const s=(t=un(t,Fu))._getSettings(),o=`${e}:${n}`;if(s.host!=="firestore.googleapis.com"&&s.host!==o&&us("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},s),{host:o,ssl:!1})),r.mockUserToken){let l,u;if(typeof r.mockUserToken=="string")l=r.mockUserToken,u=vt.MOCK_USER;else{l=aS(r.mockUserToken,(i=t._app)===null||i===void 0?void 0:i.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new q(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new vt(h)}t._authCredentials=new xR(new N0(l,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new qn(this.firestore,e,this._query)}}class Rt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Sr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Rt(this.firestore,e,this._key)}}class Sr extends qn{constructor(e,n,r){super(e,n,yf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Rt(this.firestore,null,new J(e))}withConverter(e){return new Sr(this.firestore,e,this._path)}}function mC(t,e,...n){if(t=Ve(t),Lw("collection","path",e),t instanceof Fu){const r=Ee.fromString(e,...n);return ty(r),new Sr(t,null,r)}{if(!(t instanceof Rt||t instanceof Sr))throw new q(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ee.fromString(e,...n));return ty(r),new Sr(t.firestore,null,r)}}function gC(t,e,...n){if(t=Ve(t),arguments.length===1&&(e=x0.newId()),Lw("doc","path",e),t instanceof Fu){const r=Ee.fromString(e,...n);return ey(r),new Rt(t,null,new J(r))}{if(!(t instanceof Rt||t instanceof Sr))throw new q(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ee.fromString(e,...n));return ey(r),new Rt(t.firestore,t instanceof Sr?t.converter:null,new J(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ry{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Af(this,"async_queue_retry"),this.Vu=()=>{const r=Mc();r&&Q("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=Mc();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=Mc();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new On;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!ta(e))throw e;Q("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const i=function(o){let l=o.message||"";return o.stack&&(l=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),l}(r);throw zn("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const i=Nf.createAndSchedule(this,e,n,r,s=>this.yu(s));return this.Tu.push(i),i}fu(){this.Eu&&Z()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}function iy(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}class xr extends Fu{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new ry,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ry(e),this._firestoreClient=void 0,await e}}}function yC(t,e){const n=typeof t=="object"?t:Au(),r=typeof t=="string"?t:"(default)",i=Su(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=L_("firestore");s&&pC(i,...s)}return i}function la(t){if(t._terminated)throw new q(M.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||vC(t),t._firestoreClient}function vC(t){var e,n,r;const i=t._freezeSettings(),s=function(l,u,h,f){return new KR(l,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Ow(f.experimentalLongPollingOptions),f.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,i);t._componentsProvider||!((n=i.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),t._firestoreClient=new lC(t._authCredentials,t._appCheckCredentials,t._queue,s,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e){this._byteString=e}static fromBase64String(e){try{return new fi(lt.fromBase64String(e))}catch(n){throw new q(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new fi(lt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new q(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new it(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uu{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lf{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new q(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new q(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return ge(this._lat,e._lat)||ge(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _C=/^__.*__$/;class wC{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Lr(e,this.data,this.fieldMask,n,this.fieldTransforms):new ra(e,this.data,n,this.fieldTransforms)}}class Mw{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Lr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function bw(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Z()}}class bf{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new bf(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Fu({path:r,xu:!1});return i.Ou(e),i}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Fu({path:r,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ru(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(bw(this.Cu)&&_C.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class EC{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||Ou(e)}Qu(e,n,r,i=!1){return new bf({Cu:e,methodName:n,qu:r,path:it.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function ju(t){const e=t._freezeSettings(),n=Ou(t._databaseId);return new EC(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Ff(t,e,n,r,i,s={}){const o=t.Qu(s.merge||s.mergeFields?2:0,e,n,i);jf("Data must be an object, but it was:",o,r);const l=jw(r,o);let u,h;if(s.merge)u=new jt(o.fieldMask),h=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const m=Zh(e,p,n);if(!o.contains(m))throw new q(M.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);Bw(f,m)||f.push(m)}u=new jt(f),h=o.fieldTransforms.filter(p=>u.covers(p.field))}else u=null,h=o.fieldTransforms;return new wC(new St(l),u,h)}class zu extends Uu{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof zu}}class Uf extends Uu{_toFieldTransform(e){return new vk(e.path,new zo)}isEqual(e){return e instanceof Uf}}function Fw(t,e,n,r){const i=t.Qu(1,e,n);jf("Data must be an object, but it was:",i,r);const s=[],o=St.empty();gi(r,(u,h)=>{const f=zf(e,u,n);h=Ve(h);const p=i.Nu(f);if(h instanceof zu)s.push(f);else{const m=ca(h,p);m!=null&&(s.push(f),o.set(f,m))}});const l=new jt(s);return new Mw(o,l,i.fieldTransforms)}function Uw(t,e,n,r,i,s){const o=t.Qu(1,e,n),l=[Zh(e,r,n)],u=[i];if(s.length%2!=0)throw new q(M.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)l.push(Zh(e,s[m])),u.push(s[m+1]);const h=[],f=St.empty();for(let m=l.length-1;m>=0;--m)if(!Bw(h,l[m])){const S=l[m];let P=u[m];P=Ve(P);const N=o.Nu(S);if(P instanceof zu)h.push(S);else{const L=ca(P,N);L!=null&&(h.push(S),f.set(S,L))}}const p=new jt(h);return new Mw(f,p,o.fieldTransforms)}function TC(t,e,n,r=!1){return ca(n,t.Qu(r?4:3,e))}function ca(t,e){if(zw(t=Ve(t)))return jf("Unsupported field value:",e,t),jw(t,e);if(t instanceof Uu)return function(r,i){if(!bw(i.Cu))throw i.Bu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let u=ca(l,i.Lu(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=Ve(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return mk(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=qe.fromDate(r);return{timestampValue:Zl(i.serializer,s)}}if(r instanceof qe){const s=new qe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Zl(i.serializer,s)}}if(r instanceof Lf)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof fi)return{bytesValue:sw(i.serializer,r._byteString)};if(r instanceof Rt){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Ef(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Mf)return function(o,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw l.Bu("VectorValues must only contain numeric values.");return vf(l.serializer,u)})}}}}}}(r,i);throw i.Bu(`Unsupported field value: ${bu(r)}`)}(t,e)}function jw(t,e){const n={};return D0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):gi(t,(r,i)=>{const s=ca(i,e.Mu(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function zw(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof qe||t instanceof Lf||t instanceof fi||t instanceof Rt||t instanceof Uu||t instanceof Mf)}function jf(t,e,n){if(!zw(n)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(n)){const r=bu(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function Zh(t,e,n){if((e=Ve(e))instanceof ua)return e._internalPath;if(typeof e=="string")return zf(t,e);throw ru("Field path arguments must be of type string or ",t,!1,void 0,n)}const IC=new RegExp("[~\\*/\\[\\]]");function zf(t,e,n){if(e.search(IC)>=0)throw ru(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new ua(...e.split("."))._internalPath}catch{throw ru(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function ru(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new q(M.INVALID_ARGUMENT,l+t+u)}function Bw(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iu{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Rt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new SC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Bf("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class SC extends iu{data(){return super.data()}}function Bf(t,e){return typeof e=="string"?zf(t,e):e instanceof ua?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $w(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new q(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class $f{}class Wf extends $f{}function NN(t,e,...n){let r=[];e instanceof $f&&r.push(e),r=r.concat(n),function(s){const o=s.filter(u=>u instanceof Hf).length,l=s.filter(u=>u instanceof qf).length;if(o>1||o>0&&l>0)throw new q(M.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class qf extends Wf{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new qf(e,n,r)}_apply(e){const n=this._parse(e);return Ww(e._query,n),new qn(e.firestore,e.converter,Wh(e._query,n))}_parse(e){const n=ju(e.firestore);return function(s,o,l,u,h,f,p){let m;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new q(M.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){oy(p,f);const S=[];for(const P of p)S.push(sy(u,s,P));m={arrayValue:{values:S}}}else m=sy(u,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||oy(p,f),m=TC(l,o,p,f==="in"||f==="not-in");return je.create(h,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}class Hf extends $f{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new Hf(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:hn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const u of l)Ww(o,u),o=Wh(o,u)}(e._query,n),new qn(e.firestore,e.converter,Wh(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Kf extends Wf{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new Kf(e,n)}_apply(e){const n=function(i,s,o){if(i.startAt!==null)throw new q(M.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new q(M.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new jo(s,o)}(e._query,this._field,this._direction);return new qn(e.firestore,e.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new Es(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(e._query,n))}}function xN(t,e="asc"){const n=e,r=Bf("orderBy",t);return Kf._create(r,n)}class Gf extends Wf{constructor(e,n,r){super(),this.type=e,this._limit=n,this._limitType=r}static _create(e,n,r){return new Gf(e,n,r)}_apply(e){return new qn(e.firestore,e.converter,Xl(e._query,this._limit,this._limitType))}}function DN(t){return Gf._create("limit",t,"F")}function sy(t,e,n){if(typeof(n=Ve(n))=="string"){if(n==="")throw new q(M.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!z0(e)&&n.indexOf("/")!==-1)throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Ee.fromString(n));if(!J.isDocumentKey(r))throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Rg(t,new J(r))}if(n instanceof Rt)return Rg(t,n._key);throw new q(M.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${bu(n)}.`)}function oy(t,e){if(!Array.isArray(t)||t.length===0)throw new q(M.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Ww(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new q(M.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new q(M.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class qw{convertValue(e,n="none"){switch(di(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(hi(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw Z()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return gi(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var n,r,i;const s=(i=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(o=>Le(o.doubleValue));return new Mf(s)}convertGeoPoint(e){return new Lf(Le(e.latitude),Le(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=ff(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(bo(e));default:return null}}convertTimestamp(e){const n=Cr(e);return new qe(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Ee.fromString(e);pe(dw(r));const i=new Fo(r.get(1),r.get(3)),s=new J(r.popFirst(5));return i.isEqual(n)||zn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qf(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}class AC extends qw{constructor(e){super(),this.firestore=e}convertBytes(e){return new fi(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Rt(this.firestore,null,n)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Yf extends iu{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new yl(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(Bf("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class yl extends Yf{data(e={}){return super.data(e)}}class Hw{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new Wi(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new yl(this._firestore,this._userDataWriter,r.key,r,new Wi(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new q(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const u=new yl(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Wi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const u=new yl(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Wi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let h=-1,f=-1;return l.type!==0&&(h=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:RC(l.type),doc:u,oldIndex:h,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function RC(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Z()}}class Bu extends qw{constructor(e){super(),this.firestore=e}convertBytes(e){return new fi(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Rt(this.firestore,null,n)}}function VN(t){t=un(t,qn);const e=un(t.firestore,xr),n=la(e),r=new Bu(e);return $w(t._query),dC(n,t._query).then(i=>new Hw(e,r,t,i))}function ON(t,e,n){t=un(t,Rt);const r=un(t.firestore,xr),i=Qf(t.converter,e,n);return Xf(r,[Ff(ju(r),"setDoc",t._key,i,t.converter!==null,n).toMutation(t._key,Je.none())])}function LN(t){return Xf(un(t.firestore,xr),[new ia(t._key,Je.none())])}function ay(t,...e){var n,r,i;t=Ve(t);let s={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||iy(e[o])||(s=e[o],o++);const l={includeMetadataChanges:s.includeMetadataChanges,source:s.source};if(iy(e[o])){const p=e[o];e[o]=(n=p.next)===null||n===void 0?void 0:n.bind(p),e[o+1]=(r=p.error)===null||r===void 0?void 0:r.bind(p),e[o+2]=(i=p.complete)===null||i===void 0?void 0:i.bind(p)}let u,h,f;if(t instanceof Rt)h=un(t.firestore,xr),f=yf(t._key.path),u={next:p=>{e[o]&&e[o](kC(h,t,p))},error:e[o+1],complete:e[o+2]};else{const p=un(t,qn);h=un(p.firestore,xr),f=p._query;const m=new Bu(h);u={next:S=>{e[o]&&e[o](new Hw(h,m,p,S))},error:e[o+1],complete:e[o+2]},$w(t._query)}return function(m,S,P,N){const L=new Vw(N),v=new Sw(S,L,P);return m.asyncQueue.enqueueAndForget(async()=>Tw(await Jh(m),v)),()=>{L.Za(),m.asyncQueue.enqueueAndForget(async()=>Iw(await Jh(m),v))}}(la(h),f,l,u)}function Xf(t,e){return function(r,i){const s=new On;return r.asyncQueue.enqueueAndForget(async()=>JP(await cC(r),i,s)),s.promise}(la(t),e)}function kC(t,e,n){const r=n.docs.get(e._key),i=new Bu(t);return new Yf(t,i,e._key,r,new Wi(n.hasPendingWrites,n.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PC={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CC{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=ju(e)}set(e,n,r){this._verifyNotCommitted();const i=cr(e,this._firestore),s=Qf(i.converter,n,r),o=Ff(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,Je.none())),this}update(e,n,r,...i){this._verifyNotCommitted();const s=cr(e,this._firestore);let o;return o=typeof(n=Ve(n))=="string"||n instanceof ua?Uw(this._dataReader,"WriteBatch.update",s._key,n,r,i):Fw(this._dataReader,"WriteBatch.update",s._key,n),this._mutations.push(o.toMutation(s._key,Je.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=cr(e,this._firestore);return this._mutations=this._mutations.concat(new ia(n._key,Je.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new q(M.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function cr(t,e){if((t=Ve(t)).firestore!==e)throw new q(M.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NC extends class{constructor(n,r){this._firestore=n,this._transaction=r,this._dataReader=ju(n)}get(n){const r=cr(n,this._firestore),i=new AC(this._firestore);return this._transaction.lookup([r._key]).then(s=>{if(!s||s.length!==1)return Z();const o=s[0];if(o.isFoundDocument())return new iu(this._firestore,i,o.key,o,r.converter);if(o.isNoDocument())return new iu(this._firestore,i,r._key,null,r.converter);throw Z()})}set(n,r,i){const s=cr(n,this._firestore),o=Qf(s.converter,r,i),l=Ff(this._dataReader,"Transaction.set",s._key,o,s.converter!==null,i);return this._transaction.set(s._key,l),this}update(n,r,i,...s){const o=cr(n,this._firestore);let l;return l=typeof(r=Ve(r))=="string"||r instanceof ua?Uw(this._dataReader,"Transaction.update",o._key,r,i,s):Fw(this._dataReader,"Transaction.update",o._key,r),this._transaction.update(o._key,l),this}delete(n){const r=cr(n,this._firestore);return this._transaction.delete(r._key),this}}{constructor(e,n){super(e,n),this._firestore=e}get(e){const n=cr(e,this._firestore),r=new Bu(this._firestore);return super.get(e).then(i=>new Yf(this._firestore,r,n._key,i._document,new Wi(!1,!1),n.converter))}}function bN(t,e,n){t=un(t,xr);const r=Object.assign(Object.assign({},PC),n);return function(s){if(s.maxAttempts<1)throw new q(M.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(s,o,l){const u=new On;return s.asyncQueue.enqueueAndForget(async()=>{const h=await hC(s);new aC(s.asyncQueue,h,l,o,u).au()}),u.promise}(la(t),i=>e(new NC(t,i)),r)}function FN(){return new Uf("serverTimestamp")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function UN(t){return la(t=un(t,xr)),new CC(t,e=>Xf(t,e))}(function(e,n=!0){(function(i){ws=i})(vs),li(new kr("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new xr(new DR(r.getProvider("auth-internal")),new MR(r.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new q(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fo(h.options.projectId,f)}(o,i),o);return s=Object.assign({useFetchStreams:n},s),l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),yn(Eg,"4.7.3",e),yn(Eg,"4.7.3","esm2017")})();/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kw="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xC{constructor(e,n,r){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||e.get().then(i=>this.auth=i,()=>{}),this.messaging||n.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.appCheck){const n=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(e){const n=await this.getAuthToken(),r=await this.getMessagingToken(),i=await this.getAppCheckToken(e);return{authToken:n,messagingToken:r,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ed="us-central1";class DC{constructor(e,n,r,i,s=ed,o){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new xC(n,r,i),this.cancelAllRequests=new Promise(l=>{this.deleteService=()=>Promise.resolve(l())});try{const l=new URL(s);this.customDomain=l.origin+(l.pathname==="/"?"":l.pathname),this.region=ed}catch{this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${n}.cloudfunctions.net/${e}`}}function VC(t,e,n){t.emulatorOrigin=`http://${e}:${n}`}const ly="@firebase/functions",uy="0.11.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OC="auth-internal",LC="app-check-internal",MC="messaging-internal";function bC(t,e){const n=(r,{instanceIdentifier:i})=>{const s=r.getProvider("app").getImmediate(),o=r.getProvider(OC),l=r.getProvider(MC),u=r.getProvider(LC);return new DC(s,o,l,u,i,t)};li(new kr(Kw,n,"PUBLIC").setMultipleInstances(!0)),yn(ly,uy,e),yn(ly,uy,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FC(t=Au(),e=ed){const r=Su(Ve(t),Kw).getImmediate({identifier:e}),i=L_("functions");return i&&UC(r,...i),r}function UC(t,e,n){VC(Ve(t),e,n)}bC(fetch.bind(self));const jC={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"},su=TA().length?Au():j_(jC);let td;try{td=o0(su,{persistence:[d0,_0],popupRedirectResolver:I0})}catch(t){if(t.code!=="auth/already-initialized")throw t;td=PR(su)}const ou=td,cy=yC(su);FC(su,"asia-south1");const zC=new Rn;async function BC(t){return await ou.authStateReady(),_1(ou,t)}const $C=()=>F1(ou,zC),WC=()=>w1(ou),Gw=K.createContext(null);function qC({children:t}){const[e,n]=K.useState(null),[r,i]=K.useState(!1),[s,o]=K.useState("");K.useEffect(()=>{let u=!1,h=()=>{};return BC(f=>{u||(n(f),i(!0))}).then(f=>{u?f():h=f}).catch(f=>{u||(console.error(f),o("Could not restore your Invincible login."),i(!0))}),()=>{u=!0,h()}},[]);const l=K.useMemo(()=>({user:e,ready:r,error:s,login:async()=>{o("");try{await $C()}catch(u){console.error(u),o("Google sign-in did not complete.")}},logout:WC}),[e,r,s]);return z.jsx(Gw.Provider,{value:l,children:t})}const HC=()=>K.useContext(Gw),Qw="/invincible/assets/branding/invincible-cyan-orb-v1-512.png";class KC extends K.Component{constructor(){super(...arguments);bp(this,"state",{error:null,componentStack:""})}static getDerivedStateFromError(n){return{error:n}}componentDidCatch(n,r){console.error("Invincible UI crashed",n,r),this.setState({componentStack:(r==null?void 0:r.componentStack)||""})}render(){var n;return this.state.error?z.jsxs("div",{className:"app-runtime-error",role:"alert",children:[z.jsx("img",{className:"runtime-brand-mark",src:Qw,alt:"",width:"64",height:"64"}),z.jsx("h1",{children:"Invincible stopped loading"}),z.jsx("p",{children:"Your data is safe. Reload to try again; if this continues, the visible error below will help us fix it."}),z.jsxs("code",{children:[((n=this.state.error)==null?void 0:n.message)||"Unknown interface error",this.state.componentStack&&`
${this.state.componentStack}`]}),z.jsx("button",{type:"button",onClick:()=>location.reload(),children:"Reload Invincible"})]}):this.props.children}}const GC="modulepreload",QC=function(t){return"/invincible/v2/"+t},hy={},Mr=function(e,n,r){let i=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(n.map(u=>{if(u=QC(u),u in hy)return;hy[u]=!0;const h=u.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${f}`))return;const p=document.createElement("link");if(p.rel=h?"stylesheet":GC,h||(p.as="script"),p.crossOrigin="",p.href=u,l&&p.setAttribute("nonce",l),document.head.appendChild(p),h)return new Promise((m,S)=>{p.addEventListener("load",m),p.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return i.then(o=>{for(const l of o||[])l.status==="rejected"&&s(l.reason);return e().catch(s)})};function Yw(t,e=!1){if(e)return Xw(0,!0);const n=Math.max(0,t),r=Math.exp(-n*1.45),i=4.2*-Math.expm1(-n*1.45);return{phase:8+n+i,turn:i,storm:r,speed:1+6.09*r,links:(1-r)**2}}function Xw(t,e=!1){if(e)return{speed:1,phase:8,turn:0,storm:0,links:1};const n=Math.max(0,t),r=Math.min(1,n/2),i=(1-r)**3;return{speed:1+8*i,phase:8+n+4*(1-(1-r)**4),turn:4*(1-(1-r)**4),storm:i,links:r*r*(3-2*r)}}function YC({theme:t="gold"}){const e=K.useRef(null),n=K.useRef(performance.now());return K.useEffect(()=>{const r=e.current,i=r.parentElement,s=r.closest(".v2-shell")||i,o=r.getContext("2d");if(!o)return;const l=matchMedia("(prefers-reduced-motion: reduce)"),u={gold:"238, 200, 123",cyan:"115, 221, 244",emerald:"112, 230, 175"}[t]||"238, 200, 123";let h=0,f=0,p=0,m=0,S=[],P=!0;const N={x:0,y:0,active:!1},L=_=>_-Math.floor(_),v=(_,ie)=>L(Math.sin(_*127.1+ie*311.7)*43758.5453),w=_=>({x:v(_,1),y:v(_,2),vx:Math.sin(_*2.17)*(4+_%4),vy:Math.cos(_*1.73)*(3+_%3),size:_%9===0?1.8:1+_%3*.2,dx:0,dy:0}),A=_=>{if(!h||!f)return;o.clearRect(0,0,h,f);const ie=Yw((performance.now()-n.current)/1e3,l.matches);r.dataset.startupStorm=String(ie.storm);const ze=N.active&&!l.matches,ut=1-Math.exp(-_*9),G=190,B=_*4*ie.storm,Y=Math.cos(B),X=Math.sin(B);for(const te of S){const oe=te.x-.5,ye=te.y-.5;te.x=(.5+oe*Y-ye*X+te.vx*_*ie.speed/h+2)%1,te.y=(.5+oe*X+ye*Y+te.vy*_*ie.speed/f+2)%1;const ct=te.x*h-N.x,be=te.y*f-N.y,Oe=Math.hypot(ct,be),ht=ze?Math.max(0,1-Oe/G)*34:0;te.dx+=(ct/Math.max(1,Oe)*ht-te.dx)*ut,te.dy+=(be/Math.max(1,Oe)*ht-te.dy)*ut}const ce=h<700?125:165,O=S.map(te=>({x:te.x*h+te.dx,y:te.y*f+te.dy,size:te.size}));let W=0,ae=0;for(let te=0;te<O.length;te++){const oe=O[te];for(let be=te+1;be<O.length;be++){const Oe=O[be],ht=Math.hypot(oe.x-Oe.x,oe.y-Oe.y);ht>=ce||(o.strokeStyle=`rgba(${u},${(.29*(1-ht/ce)*ie.links).toFixed(3)})`,o.lineWidth=.55,o.beginPath(),o.moveTo(oe.x,oe.y),o.lineTo(Oe.x,Oe.y),o.stroke(),W++)}const ye=Math.hypot(oe.x-N.x,oe.y-N.y),ct=ze&&ye<G;ct&&ae<12&&(o.strokeStyle=`rgba(${u},${(.5*(1-ye/G)).toFixed(3)})`,o.lineWidth=.65,o.beginPath(),o.moveTo(oe.x,oe.y),o.lineTo(N.x,N.y),o.stroke(),ae++),o.fillStyle=`rgba(${u},${ct?.9:oe.size>1.5?.7:.48})`,o.beginPath(),o.arc(oe.x,oe.y,oe.size+(ct?.7:0),0,Math.PI*2),o.fill()}r.dataset.linkCount=String(W),r.dataset.mouseLinks=String(ae),r.dataset.pointerActive=String(ze)},x=()=>{const _=i.getBoundingClientRect();if(h=_.width,f=_.height,r.dataset.fieldWidth=String(h),r.dataset.fieldHeight=String(f),!h||!f)return;const ie=Math.min(devicePixelRatio||1,1.5);r.width=Math.round(h*ie),r.height=Math.round(f*ie),o.setTransform(ie,0,0,ie,0,0);const ze=Math.min(h<700?90:260,Math.max(h<700?64:140,Math.round(h*f/7500)));S=Array.from({length:ze},(ut,G)=>S[G]||w(G)),r.dataset.particleCount=String(ze),A(0)},D=()=>{cancelAnimationFrame(p),p=0},b=()=>{!p&&!document.hidden&&P&&!l.matches&&(p=requestAnimationFrame(T))},T=_=>{if(p=0,l.matches){y();return}if(_-m>=33){const ie=Math.min((_-m)/1e3||0,.05);m=_,A(ie)}b()},y=()=>{D(),m=performance.now(),l.matches?(N.active=!1,A(0)):b()},E=_=>{if(_.pointerType!=="mouse"||l.matches)return;const ie=i.getBoundingClientRect();N.x=_.clientX-ie.left,N.y=_.clientY-ie.top,N.active=N.x>=0&&N.x<=h&&N.y>=0&&N.y<=f},I=()=>{N.active=!1},R=new ResizeObserver(x),k=new IntersectionObserver(_=>{P=_[0].isIntersecting,y()});return R.observe(i),k.observe(i),s.addEventListener("pointermove",E,{passive:!0}),s.addEventListener("pointerleave",I),window.addEventListener("blur",I),document.addEventListener("visibilitychange",y),l.addEventListener("change",y),x(),b(),()=>{D(),R.disconnect(),k.disconnect(),s.removeEventListener("pointermove",E),s.removeEventListener("pointerleave",I),window.removeEventListener("blur",I),document.removeEventListener("visibilitychange",y),l.removeEventListener("change",y)}},[t]),z.jsx("canvas",{ref:e,className:"v2-guide-particles","aria-hidden":"true"})}const Jw="2026.11.11.2";async function dy(){const t=await fetch("/invincible/app-version.json",{cache:"no-store",signal:AbortSignal.timeout(15e3)});if(!t.ok)throw new Error("Could not check for updates. Try again when online.");const e=await t.json();if(typeof e.version!="string"||!e.version)throw new Error("Update information is unavailable. Try again later.");return{...e,available:e.version!==Jw}}async function XC(){var t;if("serviceWorker"in navigator){const e=await navigator.serviceWorker.getRegistration("/invincible/");if(e){let n;try{await Promise.race([e.update(),new Promise((r,i)=>{n=setTimeout(()=>i(new Error("Update timed out. Please try again.")),15e3)})])}finally{clearTimeout(n)}(t=e.waiting)==null||t.postMessage({type:"SKIP_WAITING"})}}}function JC(t,{user:e,logout:n,login:r}={}){if(!document.querySelector("link[data-account-style]")){const D=document.createElement("link");D.rel="stylesheet",D.href="/invincible/shared/account-menu.css",D.dataset.accountStyle="",document.head.append(D)}const i=document.createElement("div");i.className="inv-account",i.innerHTML=`<button type="button" class="inv-profile" aria-label="Profile and settings" aria-expanded="false" aria-controls="inv-account-options"><span aria-hidden="true">i</span></button>
    <div class="inv-account-options" id="inv-account-options" hidden><strong class="inv-account-name"></strong><small class="inv-account-email"></small><button type="button" class="inv-open-settings">Settings</button><button type="button" class="inv-signout">Sign out</button><p class="inv-account-status" role="status"></p></div>`;const s=document.createElement("dialog");s.className="inv-settings",s.setAttribute("aria-labelledby","inv-settings-title"),s.innerHTML=`<header><h2 id="inv-settings-title">Settings</h2><button type="button" class="inv-settings-close" aria-label="Close settings">×</button></header>
    <section><h3>App updates</h3><p>Installed version <strong class="inv-version"></strong></p><p class="inv-update-status" role="status" aria-live="polite">Check for the latest Invincible release.</p><p class="inv-release-notes"></p><div class="inv-update-actions"><button type="button" class="inv-check-update">Check for updates</button><button type="button" class="inv-apply-update" hidden>Update and reload</button></div><small>Save any open work before updating. Saved work and account data stay intact.</small></section>
    <section><h3>Home-screen icon</h3><img class="inv-icon-preview" src="/invincible/assets/branding/invincible-cyan-orb-v1-192.png" width="56" height="56" alt="Current cyan orb app icon"><p>New installations use this icon. For an existing installation, Chrome may ask you to approve the change in its app menu → Review app update. This button updates Invincible; it cannot approve a launcher icon change for you.</p></section>`,t.append(i),document.body.append(s);const o=D=>i.querySelector(D),l=D=>s.querySelector(D),u=o(".inv-profile"),h=o(".inv-account-options"),f=o(".inv-account-status"),p=()=>{h.hidden=!0,u.setAttribute("aria-expanded","false")};u.onclick=()=>{h.hidden=!h.hidden,u.setAttribute("aria-expanded",String(!h.hidden)),h.hidden||o(".inv-open-settings").focus()};const m=D=>{i.contains(D.target)||p()},S=D=>{D.key==="Escape"&&!h.hidden&&(p(),u.focus())};document.addEventListener("pointerdown",m),document.addEventListener("keydown",S),o(".inv-open-settings").onclick=()=>{p(),s.showModal()},l(".inv-settings-close").onclick=()=>s.close(),s.addEventListener("close",()=>u.focus()),s.addEventListener("click",D=>{if(D.target===s){const b=s.getBoundingClientRect();(D.clientX<b.left||D.clientX>b.right||D.clientY<b.top||D.clientY>b.bottom)&&s.close()}}),l(".inv-version").textContent=Jw;let P=!1,N=e,L=!1;const v=D=>{if(N=D,p(),f.textContent="",o(".inv-account-name").textContent=(D==null?void 0:D.displayName)||(D?"Invincible account":"Invincible"),o(".inv-account-email").textContent=(D==null?void 0:D.email)||"",o(".inv-signout").textContent=D?"Sign out":"Sign in",u.replaceChildren(),D!=null&&D.photoURL&&/^https:\/\//.test(D.photoURL)){const b=document.createElement("img");b.src=D.photoURL,b.alt="",b.referrerPolicy="no-referrer",b.onerror=()=>{u.textContent=(D.displayName||D.email||"i").slice(0,1).toUpperCase()},u.append(b)}else u.textContent=((D==null?void 0:D.displayName)||(D==null?void 0:D.email)||"i").slice(0,1).toUpperCase()};v(e),o(".inv-signout").onclick=async()=>{const D=o(".inv-signout");D.disabled=!0;try{N?await(n==null?void 0:n()):r?await r():location.assign("/invincible/"),p()}catch{f.textContent="Sign-out did not complete. Try again."}finally{D.disabled=!1}};const w=l(".inv-check-update"),A=l(".inv-apply-update"),x=l(".inv-update-status");return w.onclick=async()=>{if(!L){L=!0,w.disabled=!0,A.hidden=!0,l(".inv-release-notes").textContent="",x.textContent="Checking for updates…";try{const D=await dy();if(P)return;x.textContent=D.available?`Update ${D.version} is available.`:"You’re up to date.",l(".inv-release-notes").textContent=D.notes||"",A.hidden=!D.available}catch{P||(x.textContent="Could not check for updates. Check your connection and try again.")}finally{L=!1,w.disabled=!1}}},A.onclick=async()=>{if(!(L||!confirm("Save any open work first. Reload Invincible to apply the update now?"))){L=!0,A.disabled=w.disabled=!0,x.textContent="Preparing update…";try{await dy(),await XC(),P||location.reload()}catch{P||(x.textContent="Update could not finish. Check your connection and try again.")}finally{L=!1,A.disabled=w.disabled=!1}}},{updateUser:v,destroy(){P=!0,document.removeEventListener("pointerdown",m),document.removeEventListener("keydown",S),s.remove(),i.remove()}}}function ZC({user:t,logout:e,login:n}){const r=K.useRef(null);return K.useEffect(()=>{const i=JC(r.current,{user:t,logout:e,login:n});return()=>i.destroy()},[t,e,n]),z.jsx("div",{className:"inv-account-host",ref:r})}function eN(t,e,n=!1,r=!1){if(r)return{spherePoints:e?66e3:t?114e3:174e3};let i;if(t&&e?i={streams:64,trailCount:100,wideStreams:8,cellStreams:8,flecks:1e3}:t||e?i={streams:68,trailCount:128,wideStreams:10,cellStreams:10,flecks:1200}:i={streams:96,trailCount:128,wideStreams:12,cellStreams:12,flecks:1600},n){const s=e?1.8:t?2:2.3;i.streams=Math.round(i.streams*s),i.wideStreams=Math.round(i.wideStreams*(e?1.15:1.5)),i.cellStreams=Math.round(i.cellStreams*(e?1.15:1.5)),i.flecks=Math.round(i.flecks*(e?3:t?4:5))}return i}function tN(t){const e=new Float32Array(t*5);for(let n=0;n<t;n++){const r=Math.imul(n^n>>>7,73244475)>>>0,i=((n+.5)*.754877666+(r&255)/24e3)%1,s=2*Math.PI*(((n+.5)*.61803398875+(r>>>16&255)/24e3)%1),o=Math.asin(i*2-1),l=.5+.5*Math.sin(s*7+o*15+1.4*Math.sin(o*8)),u=.98+.11*((n+.5)*.414213562%1)+.035*l,h=u*Math.cos(o),f=1.15+.33*((n+.5)*.569840291%1),p=(.42+.45*l**3)*(.76+.24*Math.sin(n*7.13)**2);e.set([h*Math.cos(s),u*Math.sin(o),h*Math.sin(s),f,p],n*5)}return e}function nN(t){if(t.spherePoints)return tN(t.spherePoints);const{streams:e,trailCount:n,wideStreams:r,cellStreams:i,flecks:s}=t,o=224,l=240,u=e*n+r*o+i*l+s,h=new Float32Array(u*5);let f=0;const p=(m,S,P,N,L)=>{let v=0;for(let w=0;w<N;w++){const A=w/(N-1),x=3.4*(1-.55*A),D=L*Math.pow(1-A,1.35);h.set([m-v,S,P,x,D],f),f+=5,v+=.001*(1-.55*A)}};for(let m=0;m<e;m++)p(m*.61803398875%1,(m+.5)/e,.065+.02*(.5+.5*Math.sin(m*1.71)),n,.86);for(let m=0;m<r;m++)p(m*.754877666%1,(m+.5)/r+2,.062+.018*(.5+.5*Math.sin(m*2.13)),o,.78);for(let m=0;m<i;m++)p(m*.569840291%1,(m+.5)/i+4,.064+.016*(.5+.5*Math.sin(m*1.93)),l,.78);for(let m=0;m<s;m++){const P=.45+.3*Math.sin(m*7.13)**2;h.set([m*.61803398875%1,(m+.5)*.754877666%1,.064+.018*(m*.41421356%1),m%11===0?3.4:2.8,P],f),f+=5}return h}function fy(t,e,n){const r=t.createShader(e);if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS))throw t.deleteShader(r),Error("Orb shader could not compile");return r}function rN(t,e,n){const r=t.createProgram();let i,s;try{if(i=fy(t,t.VERTEX_SHADER,e),s=fy(t,t.FRAGMENT_SHADER,n),t.attachShader(r,i),t.attachShader(r,s),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw Error("Orb program could not link");return r}catch(o){throw t.deleteProgram(r),o}finally{i&&t.deleteShader(i),s&&t.deleteShader(s)}}const iN=`attribute vec3 position;attribute vec2 appearance;uniform mat4 projection;uniform float pixelRatio;uniform float pointScale;uniform float time;uniform float style;uniform float expressive;uniform float spin;uniform vec2 rotation;uniform vec3 influence;varying float opacity;void main(){
float travel=fract(position.x+time*position.z);float rawLane=position.y;float cell=step(3.5,rawLane);float ring=step(1.5,rawLane)*(1.0-cell);float lane=fract(rawLane);float tau=6.2831853;
float hash=fract(sin(lane*913.73)*43758.5453);float angle=travel*tau+hash*tau;
float latitude=asin(clamp(lane*2.0-1.0,-.98,.98));
float irregularLatitude=latitude+sin(angle*(1.0+floor(hash*3.0))+hash*tau)*(.09+.17*hash);
float ringLatitude=latitude*.72+.055*sin(angle*2.0+hash*tau);
latitude=mix(irregularLatitude,ringLatitude,ring);
float cellLatitude=.56*sin(angle*(1.0+floor(hash*2.0))+hash*tau)+.14*sin(angle*3.0+hash*21.0);
latitude=mix(latitude,cellLatitude,cell);
float longitude=angle+mix(.28,.075,ring)*sin(angle*(2.0+floor(hash*2.0))+lane*17.0)+time*.025;
longitude=mix(longitude,angle+.34*sin(angle*2.0+hash*tau)+time*.025,cell);
float radius=1.03+.055*sin(angle*3.0+lane*31.0)+.035*sin(angle*7.0-time*.7+hash*19.0);
radius=mix(radius,1.09+.026*sin(angle*3.0+hash*13.0),ring);
radius=mix(radius,1.075+.035*sin(angle*4.0+hash*27.0-time*.3),cell);
radius+=step(.5,style)*(1.0-step(1.5,style))*.045*sin(angle*11.0+time*1.8+hash*43.0);
// Cyan flows as broad aurora bands; emerald grows twisting, organic filaments.
float cyan=1.0-step(.5,style),emerald=step(.5,style)*(1.0-step(1.5,style));
latitude+=expressive*(cyan*.20*sin(longitude*2.0+time*.4)+emerald*.16*sin(longitude*4.0-time*.65+hash*tau));
radius+=expressive*(cyan*.065*sin(longitude*3.0+time*.5)+emerald*.10*sin(longitude*5.0-time*.8+lane*17.0));
longitude+=expressive*(cyan*.12*sin(latitude*4.0+time*.3)+emerald*.20*sin(latitude*3.0-time*.5));
vec3 p=vec3(radius*cos(latitude)*cos(longitude),radius*sin(latitude),radius*cos(latitude)*sin(longitude));
float tilt=(hash-.5)*mix(1.45,2.1,max(ring,cell)),ct=cos(tilt),st=sin(tilt);p=vec3(p.x,p.y*ct-p.z*st,p.y*st+p.z*ct);
float edge=smoothstep(0.0,.075,travel)*(1.0-smoothstep(.925,1.0,travel));
float center=mix(.48,1.0,smoothstep(.0,.42,length(p.xy)));
float packetWave=.5+.5*sin(angle*5.0-time*.82+hash*tau);
float packet=pow(packetWave,7.0);
float secondary=pow(.5+.5*sin(angle*3.0-time*.54+hash*19.0),10.0);
p*=1.0+.035*packet+.018*secondary;
vec3 resting=p;
float disturbance=.040*sin(time*.67+resting.y*3.2+resting.z*1.4)+.026*sin(time*.43+resting.x*4.0-resting.z*2.1);
p*=1.0+disturbance;
p+=vec3(.050*sin(time*.58+resting.y*2.35)+.014*sin(time*.31+resting.z*4.1),.043*sin(time*.49+resting.z*2.55)+.012*sin(time*.36+resting.x*3.8),.050*sin(time*.55+resting.x*2.4)+.014*sin(time*.29+resting.y*4.0));
// Independent rigid rotation of the entire particle globe, after surface motion.
// Gently vary both the sideways tilt and depth of the rotation axis.
float globeTilt=.5235988+.14*sin(time*.16)+.035*sin(time*.09+1.2);
vec3 globeAxis=normalize(vec3(-sin(globeTilt),cos(globeTilt),.55+.10*sin(time*.12+.7)));
float globeAngle=-time*.28*spin,globeCos=cos(globeAngle),globeSin=sin(globeAngle);
p=p*globeCos+cross(globeAxis,p)*globeSin+globeAxis*dot(globeAxis,p)*(1.0-globeCos);
float cx=cos(rotation.y),sx=sin(rotation.y),cy=cos(rotation.x),sy=sin(rotation.x);
p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
vec2 delta=p.xy-influence.xy;float pull=exp(-dot(delta,delta)*2.7)*influence.z;
p.xy+=delta*pull*mix(.13,.30,expressive);p.z+=pull*mix(.16,.28,expressive);
// A slow planet-like pulse: six seconds inward, six seconds back; never expand.
float planetPulse=.5-.5*cos(time*.5235988);
p*=1.0-.015*planetPulse;
vec4 projected=projection*vec4(p,1.0);gl_Position=projected;float size=mix(1.0,1.22,step(.5,style)*(1.0-step(1.5,style)));size*=1.0+.26*packet+.12*secondary;gl_PointSize=max(1.0,appearance.x*size*pixelRatio*pointScale*4.6/projected.w);opacity=appearance.y*edge*center*(0.35+0.65*smoothstep(-1.0,1.0,p.z));opacity*=.48+1.05*packet+.48*secondary;opacity*=mix(1.0,.68,step(1.5,style)*(1.0-step(.76,appearance.y)));}`,sN=`attribute vec3 position;attribute vec2 appearance;
uniform mat4 projection;uniform float pixelRatio;uniform float pointScale;
uniform float time;uniform vec2 rotation;uniform vec3 influence;varying float opacity;
void main(){
 float yaw=rotation.x+time*.08;
 float cx=cos(rotation.y),sx=sin(rotation.y),cy=cos(yaw),sy=sin(yaw);
 vec3 p=vec3(position.x,position.y*cx-position.z*sx,position.y*sx+position.z*cx);
 p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
 vec2 delta=p.xy-influence.xy;
 p.xy+=delta*(.11*influence.z/(1.0+8.0*dot(delta,delta)));
 vec4 projected=projection*vec4(p,1.0);
 gl_Position=projected;
 gl_PointSize=max(1.65,appearance.x*pixelRatio*pointScale*4.6/projected.w);
 opacity=appearance.y*(.24+.76*smoothstep(-.75,1.0,p.z));
}`,oN="precision mediump float;uniform vec3 colorA;uniform vec3 colorB;varying float opacity;void main(){float radius=length(gl_PointCoord-vec2(0.5))*2.0;if(radius>1.0)discard;float core=1.0-smoothstep(0.0,1.0,radius);gl_FragColor=vec4(mix(colorA,colorB,core),core*opacity);}";function aN(t){const e=1/Math.tan(Math.PI/8),n=.1,r=30,i=4.6;return new Float32Array([e/t,0,0,0,0,e,0,0,0,0,(r+n)/(n-r),-1,0,0,(r+n)/(n-r)*-i+2*r*n/(n-r),i])}const py={cyan:{style:0,a:[.08,.55,.78],b:[.55,1,1]},emerald:{style:1,a:[.03,.32,.12],b:[.46,1,.62]},gold:{style:2,a:[.42,.16,.025],b:[1,.85,.38]}};function lN({theme:t="cyan",spin:e=!0,allowDrag:n=!0,richParticles:r=!1,followPagePointer:i=!1,dashboardMotion:s=!1,interactionSurface:o}){const l=K.useRef(null),u=K.useRef(null);return K.useEffect(()=>{const h=l.current,f=u.current,p=f.parentElement,m=(o==null?void 0:o.current)||p,S=matchMedia("(prefers-reduced-motion: reduce)"),P=matchMedia("(max-width:1024px)"),N=navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4||navigator.deviceMemory>0&&navigator.deviceMemory<=4,L=py[t]||py.cyan;let v,w,A,x,D,b=null,T=null,y,E,I=!1,R=!0,k=!1,_=performance.now(),ie=0,ze=0,ut=null,G=null,B=null,Y=!1,X=0,ce=0,O=0,W=0,ae=0,te=0,oe=0,ye=0,ct=0,be=0;const Oe=()=>{T!==null&&clearTimeout(T),b!==null&&cancelAnimationFrame(b),T=b=null},ht=()=>!I&&(s||!k)&&!document.hidden&&R,vi=()=>Math.hypot(O,W)>.015,br=()=>G||be>0||oe>.015||vi(),Fr=()=>{D=s&&f.getBoundingClientRect().width>=100,w=rN(v,D?sN:iN,oN),A=v.createBuffer(),ut=null,x=Object.fromEntries(["projection","pixelRatio","pointScale","time","spin","rotation","influence","style","expressive","colorA","colorB"].map(j=>[j,v.getUniformLocation(w,j)])),v.useProgram(w),v.bindBuffer(v.ARRAY_BUFFER,A);for(const[j,se,ve]of[["position",3,0],["appearance",2,12]]){const Ke=v.getAttribLocation(w,j);v.enableVertexAttribArray(Ke),v.vertexAttribPointer(Ke,se,v.FLOAT,!1,20,ve)}v.clearColor(0,0,0,0),v.disable(v.DEPTH_TEST),v.depthMask(!1),v.enable(v.BLEND),v.blendFunc(v.SRC_ALPHA,v.ONE),v.uniform1f(x.style,L.style),v.uniform1f(x.expressive,r?1:0),v.uniform1f(x.spin,e?1:0),v.uniform3fv(x.colorA,L.a),v.uniform3fv(x.colorB,L.b)},_i=j=>{if(!ht()||S.matches&&!(Y&&vi()))return;const se=br()?P.matches?30:40:24;T=setTimeout(()=>{T=null,ht()&&(b=requestAnimationFrame(Ss))},Math.max(0,1e3/se-(performance.now()-j)))},Ss=j=>{if(b=null,!ht())return;const se=performance.now(),ve=Math.min(Math.max(0,(j-ie)/1e3)||1/45,.05);ie=j;const Ke=(j-_)/1e3,et=(s?Yw:Xw)(Ke,S.matches),dt=et.phase,Ct=S.matches?1:1-Math.exp(-ve*9);if(ae+=(ye-ae)*Ct,te+=(ct-te)*Ct,oe+=(be-oe)*Ct,!G&&(!S.matches||Y)){const Ge=s?1.35:5,Ii=Math.exp(-ve*Ge),Xn=(1-Ii)/Ge;X=(X+O*Xn)%(2*Math.PI),ce=(ce+W*Xn)%(2*Math.PI),O*=Ii,W*=Ii}const Lt=Math.cos(dt*.43)*.78+Math.sin(dt*.19+1.2)*.18,Qn=Math.sin(dt*.37)*.65+Math.cos(dt*.23+.4)*.16,Mt=Math.min(1,oe),Yn=Lt*(1-Mt)+ae*Mt,Zt=Qn*(1-Mt)+te*Mt,Ti=1+(r?.9:.4)*Mt;if(!v||k){f.style.setProperty("--fallback-turn",`${X+ce*.55+et.turn}rad`),_i(se);return}v.clear(v.COLOR_BUFFER_BIT),v.uniform1f(x.time,dt),v.uniform2f(x.rotation,X+et.turn+Yn*Ti*(r?.24:.16),ce-Zt*Ti*(r?.24:.16)),v.uniform3f(x.influence,Yn,Zt,Ti),v.drawArrays(v.POINTS,0,ze),f.dataset.ready="true",_i(se)},Tt=()=>{Oe(),ht()&&Ss(performance.now())},ha=j=>{ht()&&(Tt(),j.detail.url=h.toDataURL("image/png"))},Ur=()=>{const j=f.getBoundingClientRect();if(!j.width||!j.height||I||k)return;const se=s&&j.width>=100;D!==se&&(v.deleteBuffer(A),v.deleteProgram(w),Fr()),Oe();const ve=Math.min(devicePixelRatio||1,P.matches?1:1.25);h.width=Math.round(j.width*ve),h.height=Math.round(j.height*ve),v.viewport(0,0,h.width,h.height),v.uniformMatrix4fv(x.projection,!1,aN(j.width/j.height)),v.uniform1f(x.pixelRatio,ve),v.uniform1f(x.pointScale,Math.max(.85,Math.min(1.5,j.width/480)));const Ke=j.width<100,et=eN(P.matches||Ke,N||Ke,r&&!Ke,s&&!Ke),dt=JSON.stringify(et);if(ut!==dt){const Ct=nN(et);ze=Ct.length/5,v.bufferData(v.ARRAY_BUFFER,Ct,v.STATIC_DRAW),ut=dt}Tt()},Hn=(j,se)=>Math.max(-se,Math.min(se,j)),As=(j,se)=>Math.hypot((j.clientX-se.left)/se.width-.5,(j.clientY-se.top)/se.height-.5)<.49,wi=(j,se=p.getBoundingClientRect())=>{ye=Hn(((j.clientX-se.left)/se.width-.5)*2.5,1.7),ct=Hn((.5-(j.clientY-se.top)/se.height)*2.5,1.7),be=1},Kn=(j,se,ve,Ke)=>{const et={x:j.clientX,y:j.clientY,time:j.timeStamp};if(ve){const dt=(et.time-ve.time)/1e3,Ct=(et.x-ve.x)/se.width*Ke,Lt=(et.y-ve.y)/se.height*Ke;if(G&&(X+=Ct,ce+=Lt),(!S.matches||s&&G)&&dt>=0&&(Ct||Lt)){const Qn=Math.max(.008,dt),Mt=ve.time===(G==null?void 0:G.start)||dt>.1?1:1-Math.exp(-Qn*45),Yn=s&&G?1.75:1,Zt=s&&G?24:13;O+=(Hn(Ct/Qn*Yn,Zt)-O)*Mt,W+=(Hn(Lt/Qn*Yn,Zt)-W)*Mt}}return et},Rs=j=>{if(!n||!j.isPrimary||j.button!==0||G||j.target.closest("button,a"))return;const se=j.target.closest(".v2-orb-grab");if(s&&!se)return;const ve=(se||p).getBoundingClientRect();G={id:j.pointerId,start:j.timeStamp,sample:Kn(j,ve),rect:ve},Y=!1,B=null,O=W=0,j.preventDefault(),m.setPointerCapture(j.pointerId),p.dataset.dragging="true",wi(j,ve),Tt()},da=j=>{if(G&&j.pointerId!==G.id)return;const se=br(),ve=(G==null?void 0:G.rect)||p.getBoundingClientRect();G?(wi(j,ve),G.sample=Kn(j,ve,G.sample,3.5)):j.pointerType==="mouse"&&(!s||!p.classList.contains("is-compact")&&As(j,ve)?(wi(j,ve),s&&!S.matches&&(B=Kn(j,ve,B,.62))):(be>0||B)&&He()),(S.matches||!se&&br())&&Tt()},Be=j=>{if(!G||j.pointerId!==G.id)return;const se=G.rect;j.type==="pointerup"&&(G.sample.x!==j.clientX||G.sample.y!==j.clientY)&&(G.sample=Kn(j,se,G.sample,3.5));const ve=Math.max(0,(j.timeStamp-G.sample.time)/1e3);Y=s&&j.type==="pointerup";const Ke=j.type==="pointercancel"||S.matches&&!Y?0:Math.exp(-Math.max(0,ve-.1)*18);O*=Ke,W*=Ke,G=null,delete p.dataset.dragging,m.hasPointerCapture(j.pointerId)&&m.releasePointerCapture(j.pointerId),(j.pointerType!=="mouse"||s&&!As(j,se))&&(be=0),Tt()},He=()=>{B=null,!G&&!i&&(be=0,S.matches&&Tt())},jr=j=>{S.matches||j.pointerType!=="mouse"||G||wi(j)},ks=()=>{B=null,be=0,S.matches&&Tt()},fa={pointerdown:Rs,pointermove:da,pointerup:Be,pointercancel:Be,pointerleave:He,lostpointercapture:j=>{(G==null?void 0:G.id)===j.pointerId&&(G=null,O=W=0,be=0,delete p.dataset.dragging,Tt())}},Gn=()=>Tt(),zr=()=>v?Ur():Tt(),Ps=j=>{j.preventDefault(),k=!0,delete f.dataset.ready,Tt()},Ei=()=>{if(!I)try{k=!1,Fr(),Ur()}catch(j){k=!0,Oe(),delete f.dataset.ready,console.warn("3D orb recovery unavailable; keeping the particle fallback.",j)}},pa=()=>{I=!0,Oe();for(const[j,se]of Object.entries(fa))m.removeEventListener(j,se);G&&m.hasPointerCapture(G.id)&&m.releasePointerCapture(G.id),delete p.dataset.dragging,y==null||y.disconnect(),E==null||E.disconnect(),document.removeEventListener("visibilitychange",Gn),document.removeEventListener("pointermove",jr),window.removeEventListener("blur",ks),S.removeEventListener("change",zr),P.removeEventListener("change",zr),h.removeEventListener("invincible-capture",ha),h.removeEventListener("webglcontextlost",Ps),h.removeEventListener("webglcontextrestored",Ei),v&&(A&&v.deleteBuffer(A),w&&v.deleteProgram(w))};try{if(v=h.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!1,powerPreference:"low-power"}),v)try{Fr(),y=new ResizeObserver(Ur),y.observe(f)}catch(j){k=!0,console.warn("3D orb unavailable; keeping the particle fallback.",j)}if(!v&&!s)return;!i&&!s&&typeof IntersectionObserver<"u"&&(E=new IntersectionObserver(j=>{R=j[0].isIntersecting,Tt()}),E.observe(f)),document.addEventListener("visibilitychange",Gn),i&&document.addEventListener("pointermove",jr,{passive:!0}),(i||s)&&window.addEventListener("blur",ks),S.addEventListener("change",zr),P.addEventListener("change",zr),h.addEventListener("invincible-capture",ha),h.addEventListener("webglcontextlost",Ps),h.addEventListener("webglcontextrestored",Ei);for(const[j,se]of Object.entries(fa))m.addEventListener(j,se);return v&&!k?Ur():Tt(),pa}catch(j){console.warn("3D orb unavailable; keeping the particle fallback.",j),pa()}},[t,e,n,r,i,s,o]),z.jsxs("div",{ref:u,className:"focus-orb-3d orb-theme-"+t,"aria-hidden":"true",children:[z.jsx("div",{className:"orb-3d-fallback"}),z.jsx("canvas",{ref:l})]})}const uN=t=>`${t}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,Zw=t=>Array.isArray(t==null?void 0:t.steps)&&t.steps.length?t.steps:Array.isArray(t==null?void 0:t.subtasks)?t.subtasks:[],jN=(t,e)=>({...t,id:t.id||`legacy_${e}`,title:t.title||t.text||`Step ${e+1}`,notes:t.notes||"",status:t.status||(t.done?"Done":"Not Started"),done:!!(t.done||t.status==="Done")});function zN(t){const e=Zw(t),n=e.filter(r=>r.done||r.status==="Done").length;return{done:n,total:e.length,pct:e.length?Math.round(n/e.length*100):0}}const Ht=[{id:"dashboard",label:"Main Dashboard",number:"01"},{id:"workspace",label:"My Workspace",number:"02"}],Fc=t=>{var e;return((e=Ht.find(n=>"#"+n.id===t))==null?void 0:e.id)||"dashboard"},my=(t=new Date)=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;function cN(t,e){const n=(Array.isArray(e==null?void 0:e.items)?e.items:[]).filter(Boolean).map(r=>{const i=t.find(u=>u.id===r.taskId),s=r.stepId?Zw(i).find(u=>u.id===r.stepId):null,o=!i||!!(r.stepId&&!s),l=o?!1:i.status==="Done"||!!(r.stepId&&(s.done||s.status==="Done"));return{...r,task:i,step:s,missing:o,done:l}});return{items:n,active:n.find(r=>r.id===(e==null?void 0:e.activeItemId)&&!r.done&&!r.missing)||n.find(r=>!r.done&&!r.missing)||null}}const BN=t=>`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`,gy=(t,e=Date.now())=>t.endsAt?Math.max(0,Math.ceil((t.endsAt-e)/1e3)):t.seconds;function hN(t,e,n,r){let i=!0,s={tasks:[],plan:null,tasksReady:!1,planReady:!1,taskError:"",planError:"",tasksCached:!1,planCached:!1};const o=u=>{i&&(s={...s,...u},r(s))};if(r(s),!e)return()=>{i=!1};const l=[];try{l.push(t.tasks(e,u=>{var h;return o({tasks:u.docs.map(f=>({...f.data(),id:f.id})),tasksReady:!0,taskError:"",tasksCached:!!((h=u.metadata)!=null&&h.fromCache)})},()=>o({tasks:[],tasksReady:!0,taskError:"Tasks could not sync. Check your connection and retry."}))),l.push(t.plan(e,n,u=>{var h;return o({plan:u.exists()?u.data():null,planReady:!0,planError:"",planCached:!!((h=u.metadata)!=null&&h.fromCache)})},()=>o({plan:null,planReady:!0,planError:"Your daily plan could not sync. No active mission is shown."})))}catch{o({tasks:[],plan:null,tasksReady:!0,planReady:!0,taskError:"Workspace could not connect. Retry to reconnect."}),i=!1,l.forEach(u=>u())}return()=>{i=!1,l.forEach(u=>u())}}const dN={tasks:(t,e,n)=>ay(mC(cy,"users",t,"tasks"),{includeMetadataChanges:!0},e,n),plan:(t,e,n,r)=>ay(gC(cy,"users",t,"dailyPlans",e),{includeMetadataChanges:!0},n,r)};function fN(t){const[e,n]=K.useState(my),[r,i]=K.useState({tasks:[],plan:null}),[s,o]=K.useState(0);return K.useEffect(()=>{const l=()=>n(my()),u=setInterval(l,15e3);return window.addEventListener("focus",l),()=>{clearInterval(u),window.removeEventListener("focus",l)}},[]),K.useEffect(()=>hN(dN,t,e,i),[t,e,s]),{...r,retry:()=>o(l=>l+1)}}const yy=()=>({seconds:1500,endsAt:null});function pN(t){const e="invincible.v2.focus."+t,[n,r]=K.useState(()=>{try{const o=JSON.parse(sessionStorage.getItem(e));if(o&&Number.isFinite(o.seconds)&&o.seconds>=0&&o.seconds<=1500&&(o.endsAt===null||Number.isFinite(o.endsAt)))return o}catch{}return yy()}),[i,s]=K.useState(Date.now);return K.useEffect(()=>{try{sessionStorage.setItem(e,JSON.stringify(n))}catch{}},[e,n]),K.useEffect(()=>{if(!n.endsAt)return;const o=()=>{const u=Date.now();s(u),u>=n.endsAt&&r({seconds:0,endsAt:null})};o();const l=setInterval(o,250);return()=>clearInterval(l)},[n.endsAt]),{seconds:gy(n,i),running:!!n.endsAt,start:()=>{const o=Date.now();s(o),r(l=>({...l,endsAt:o+(l.seconds||1500)*1e3}))},pause:()=>r(o=>({seconds:gy(o),endsAt:null})),reset:()=>r(yy())}}const mN=K.lazy(()=>Mr(()=>import("./DashboardRegion-CHGPniwd.js"),[])),gN=K.lazy(()=>Mr(()=>import("./WorkspaceRegion-C4POu-hq.js"),__vite__mapDeps([0,1,2]))),yN=K.lazy(()=>Mr(()=>import("./TaskEditor-BxcC-ooL.js"),__vite__mapDeps([3,4,5,1]))),vN=K.lazy(()=>Mr(()=>import("./PlanImporter-DhVoyeL-.js"),__vite__mapDeps([6,4,5,1]))),_N=K.lazy(()=>Mr(()=>import("./TaskFocusView-DXsS75w-.js"),__vite__mapDeps([7,5,2,1]))),wN=K.lazy(()=>Mr(()=>import("./DashboardTools-bvH2gkRF.js"),[])),EN=K.lazy(()=>Mr(()=>import("./CanvasIdeas-BJ7e5S5_.js"),__vite__mapDeps([8,1]))),TN=K.lazy(()=>Mr(()=>import("./TodayPlanPanel-DAarIp4A.js"),__vite__mapDeps([9,2])));function IN({region:t,viewport:e,children:n,onScroll:r}){const i=K.useRef(null),s=K.useRef(0),o=K.useRef(600),[l,u]=K.useState(!1);return K.useEffect(()=>{const h=new IntersectionObserver(f=>{!f[0].isIntersecting&&i.current&&(o.current=i.current.scrollHeight),u(f[0].isIntersecting)},{root:e.current,rootMargin:"0px 20% 0px 20%"});return h.observe(i.current),()=>h.disconnect()},[e]),K.useLayoutEffect(()=>{l&&i.current&&(i.current.scrollTop=s.current)},[l]),z.jsxs("section",{ref:i,className:"v2-region",id:"v2-region-"+t.id,"aria-labelledby":t.id+"-title",onScroll:h=>{s.current=h.currentTarget.scrollTop,r()},children:[z.jsxs("header",{className:"v2-region-heading",children:[z.jsxs("span",{children:[t.number," /"]}),z.jsx("h1",{id:t.id+"-title",tabIndex:-1,children:t.label}),z.jsx("span",{className:"v2-region-tag",children:"CONNECTED SPACE"})]}),l?z.jsx(K.Suspense,{fallback:z.jsx("p",{role:"status",children:"Opening this space…"}),children:n}):z.jsx("div",{className:"v2-region-placeholder",style:{minHeight:o.current},"aria-hidden":"true"})]})}function SN({user:t,logout:e}){const n=fN(t.uid),r=cN(n.tasks,n.plan),i=pN(t.uid),s=K.useRef(null),o=K.useRef(null),l=K.useRef(0),u=K.useRef(null),[h,f]=K.useState(Fc(location.hash)),[p,m]=K.useState(null),[S,P]=K.useState(null),[N,L]=K.useState(null),[v,w]=K.useState(null),[A,x]=K.useState(!1),[D,b]=K.useState(null),T=O=>P(O),[y,E]=K.useState(""),[I,R]=K.useState({left:innerWidth-66,top:12,width:48,height:48,compact:!0}),[k,_]=K.useState(()=>{try{return localStorage.getItem("invincible-orb-theme")||"gold"}catch{return"gold"}});K.useEffect(()=>{const O=()=>L(null);return window.addEventListener("pageshow",O),()=>window.removeEventListener("pageshow",O)},[]),K.useEffect(()=>{if(!N)return;const O=setTimeout(()=>{window.location.assign(N.href)},matchMedia("(prefers-reduced-motion: reduce)").matches?0:520);return()=>clearTimeout(O)},[N]);const ie=K.useCallback(()=>{var ct;const O=(ct=o.current)==null?void 0:ct.getBoundingClientRect(),W=s.current,ae=W==null?void 0:W.getBoundingClientRect(),te=O&&ae?Math.max(0,Math.min(O.bottom,ae.bottom)-Math.max(O.top,ae.top)):0,ye=O&&W&&O.right>ae.left&&O.left<ae.right&&te>=Math.min(O.height*.35,180)&&W.scrollLeft<W.clientWidth*.35?{left:O.left,top:O.top,width:O.width,height:O.height,compact:!1}:{left:innerWidth-66,top:12,width:48,height:48,compact:!0};R(be=>Object.keys(ye).every(Oe=>ye[Oe]===be[Oe])?be:ye)},[]),ze=K.useCallback(O=>{o.current=O,O&&requestAnimationFrame(ie)},[ie]),ut=()=>{const O=s.current;if(!O)return;const W=O.scrollLeft/O.clientWidth,ae=Ht[Math.min(Ht.length-1,Math.round(W))];history.replaceState({...history.state,v2Position:W},"","#"+ae.id)},G=(O,{restore:W=!1,fraction:ae}={})=>{var ye;const te=s.current,oe=Ht.findIndex(ct=>ct.id===O);!te||oe<0||(W||(ut(),history.pushState({v2Position:oe},"","#"+O)),te.scrollTo({left:(ae??oe)*te.clientWidth,behavior:W||matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}),(ye=document.querySelector('.v2-topbar nav a[href="#'+O+'"]'))==null||ye.focus({preventScroll:!0}))};K.useEffect(()=>{const O=s.current,W=()=>{var ye;clearTimeout(u.current),G(Fc(location.hash),{restore:!0,fraction:typeof((ye=history.state)==null?void 0:ye.v2Position)=="number"?history.state.v2Position:void 0})};W();let ae=O.clientWidth;const te=new ResizeObserver(()=>{O.clientWidth!==ae&&(O.scrollTo({left:l.current*O.clientWidth,behavior:"instant"}),ae=O.clientWidth),ie()});te.observe(O),window.addEventListener("popstate",W);const oe=()=>{var ye;(ye=history.state)!=null&&ye.v2Position||G(Fc(location.hash),{restore:!0})};return window.addEventListener("hashchange",oe),()=>{te.disconnect(),clearTimeout(u.current),window.removeEventListener("popstate",W),window.removeEventListener("hashchange",oe)}},[]),K.useEffect(()=>{const O=new ResizeObserver(ie),W=o.current;W&&O.observe(W);const ae=requestAnimationFrame(ie);return()=>{O.disconnect(),cancelAnimationFrame(ae)}},[h,n.tasksReady,n.planReady]);const B=()=>{const O=s.current;O&&(l.current=O.scrollLeft/O.clientWidth,f(Ht[Math.min(Ht.length-1,Math.round(l.current))].id),ie(),clearTimeout(u.current),u.current=setTimeout(ut,180))},Y=n.tasksReady&&n.planReady,X=n.taskError||n.planError,ce=()=>_(O=>{const W=["cyan","gold","emerald"],ae=W[(W.indexOf(O)+1)%W.length];try{localStorage.setItem("invincible-orb-theme",ae)}catch{}return ae});return z.jsxs("div",{className:"v2-shell"+(y||X||!Y||n.tasksCached||n.planCached?" has-status":""),children:[h==="dashboard"&&z.jsx("div",{className:"v2-ambient-field","aria-hidden":"true",children:z.jsx(YC,{theme:k})}),z.jsxs("header",{className:"v2-topbar",children:[z.jsxs("a",{className:"v2-brand",href:"#dashboard",onClick:O=>{O.preventDefault(),G("dashboard")},children:[z.jsx("img",{className:"v2-brand-mark",src:Qw,alt:"",width:"36",height:"36"}),z.jsxs("span",{children:["INVINCIBLE",z.jsx("small",{children:"PERSONAL WORKSPACE"})]})]}),z.jsxs("nav",{"aria-label":"Explore spaces",children:[z.jsx("span",{className:"v2-nav-caption","aria-hidden":"true",children:"VIEWS"}),Ht.map(O=>z.jsxs("a",{href:"#"+O.id,"aria-current":h===O.id?"location":void 0,onClick:W=>{W.metaKey||W.ctrlKey||W.shiftKey||W.altKey||(W.preventDefault(),G(O.id))},children:[z.jsx("span",{children:O.number}),O.label]},O.id))]}),z.jsxs("div",{className:"v2-account",children:[z.jsx(K.Suspense,{fallback:null,children:z.jsx(wN,{})}),z.jsx("button",{type:"button",className:"v2-saved-ideas","aria-label":"Saved ideas",title:"Saved ideas",onClick:()=>w({}),children:z.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7","aria-hidden":"true",children:z.jsx("path",{d:"M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"})})}),z.jsx(ZC,{user:t,logout:e})]})]}),(y||X||!Y||n.tasksCached||n.planCached)&&z.jsxs("div",{className:"v2-connection",role:"status",children:[z.jsx("span",{className:X?"v2-dot error":"v2-dot"}),y||X||(Y?"Offline · Showing saved records":"Loading workspace…"),X&&z.jsx("button",{onClick:n.retry,children:"Retry sync"})]}),z.jsx("main",{ref:s,className:"v2-canvas","aria-label":"Continuous spatial workspace",tabIndex:0,onScroll:B,onKeyDown:O=>{if(O.target!==O.currentTarget)return;let W=Ht.findIndex(ae=>ae.id===h);if(O.key==="ArrowRight")W++;else if(O.key==="ArrowLeft")W--;else if(O.key==="Home")W=0;else if(O.key==="End")W=Ht.length-1;else return;O.preventDefault(),G(Ht[Math.max(0,Math.min(Ht.length-1,W))].id)},children:Ht.map(O=>z.jsx(IN,{region:O,viewport:s,onScroll:ie,children:Y?O.id==="dashboard"?z.jsx(mN,{data:n,plan:r,timer:i,onInspect:T,orbAnchor:ze,theme:k,onChangeTheme:ce,onOpenWorkspace:()=>G("workspace"),onTravel:L,onPlan:()=>x(!0)}):z.jsx(gN,{data:n,plan:r,timer:i,onInspect:T,uid:t.uid,onCreate:()=>m({id:uN("t"),create:!0}),onPaste:()=>b({targetId:""})}):z.jsx("div",{className:"v2-panel v2-loading",role:"status",children:"Restoring tasks and your daily plan…"})},O.id))}),z.jsxs("div",{className:"v2-orb "+(I.compact?"is-compact":N&&h==="dashboard"?"is-approaching":""),style:{left:I.left,top:I.top,width:I.width,height:I.height},onWheel:O=>{const W=O.deltaX+(O.shiftKey?O.deltaY:0);W&&s.current&&(O.preventDefault(),s.current.scrollLeft+=W)},children:[z.jsx(lN,{theme:k,spin:!1,richParticles:!0,dashboardMotion:!0,interactionSurface:s}),I.compact&&z.jsx("button",{className:"v2-orb-theme","aria-label":"Orb theme: "+k+". Change theme",onClick:ce,children:"◐"})]}),z.jsxs("footer",{className:"v2-footer",children:[z.jsx("span",{children:"DASHBOARD MAP · PERSONAL WORKSPACE"}),z.jsx("span",{className:"v2-footer-desktop",children:h==="dashboard"?"Choose a page · Open today’s plan":"Drag cards to organise your work"}),z.jsx("span",{className:"v2-footer-mobile",children:h==="dashboard"?"Tap the centre for today’s plan":"Move cards or open a project"}),z.jsxs("span",{children:[h==="dashboard"?"01":"02"," / 02"]})]}),N&&z.jsxs("div",{className:"v2-travel",role:"status","aria-live":"polite",children:[z.jsx("span",{children:"ENTERING"}),z.jsx("strong",{children:N.label}),z.jsx("i",{"aria-hidden":"true"})]}),z.jsxs(K.Suspense,{fallback:z.jsx("p",{className:"v2-editor-loading",role:"status",children:"Opening editor…"}),children:[v&&z.jsx(EN,{uid:t.uid,capture:v.capture,onClose:()=>w(null),onRestore:O=>{if(O.source==="journal"){window.location.assign("/invincible/journal/?date="+encodeURIComponent(O.journalDate)+"&view="+encodeURIComponent(JSON.stringify(O.view)));return}w(null),G("dashboard")}}),A&&z.jsx(TN,{uid:t.uid,plan:r,tasks:n.tasks,onClose:()=>x(!1),onInspect:T}),p&&z.jsx(yN,{uid:t.uid,taskId:p.id,isNew:p.create,task:n.tasks.find(O=>O.id===p.id),onClose:()=>m(null),onPaste:O=>{m(null),b({targetId:O})}},p.id),D&&z.jsx(vN,{uid:t.uid,tasks:n.tasks,targetId:D.targetId,onClose:()=>b(null)}),S&&z.jsx(_N,{uid:t.uid,task:n.tasks.find(O=>O.id===S),onClose:()=>P(null),onPaste:O=>{P(null),b({targetId:O})}},S)]})]})}function AN(){const{user:t,ready:e,error:n,login:r,logout:i}=HC();return K.useEffect(()=>(document.body.classList.add("spatial-page"),()=>document.body.classList.remove("spatial-page")),[]),e?t?z.jsx(SN,{user:t,logout:i},t.uid):z.jsx("main",{className:"v2-auth",children:z.jsxs("div",{children:[z.jsx("p",{className:"v2-eyebrow",children:"INVINCIBLE"}),z.jsxs("h1",{children:["A little more space.",z.jsx("br",{}),"For everything you do."]}),z.jsxs("p",{children:["Your existing account. Your existing work.",z.jsx("br",{}),"One continuous environment."]}),n&&z.jsx("p",{role:"alert",children:n}),z.jsx("button",{className:"v2-primary",onClick:r,children:"Continue with Google"}),z.jsx("small",{children:"Main Dashboard + My Workspace"})]})}):z.jsx("div",{className:"v2-auth",children:z.jsx("p",{role:"status",children:"Restoring your Invincible session…"})})}document.body.classList.add("spatial-page");N_(document.getElementById("root")).render(z.jsx(zE.StrictMode,{children:z.jsx(KC,{children:z.jsx(qC,{children:z.jsx(AN,{})})})}));export{zN as a,cy as b,mC as c,gC as d,LN as e,BN as f,VN as g,jN as h,bN as i,z as j,ON as k,DN as l,xN as m,uN as n,ay as o,my as p,NN as q,K as r,FN as s,Zw as t,HC as u,cN as v,UN as w};
