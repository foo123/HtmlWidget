/**
* https://github.com/foo123/SelectorListener
* @VERSION: 1.2.0
* adapted from https://github.com/csuwildcat/SelectorListener
**/
!function(){"use strict";function e(e,t,o,n){var r=e.length,s=arguments.length;if(4>s&&(n=r-1),0>n&&(n+=r),3>s&&(o=0),o>n)return e;var i,_,l,c,a=n-o+1;for(l=15&a,c=1&l,c&&t(e[o],o,e),i=c;l>i;i+=2)_=o+i,t(e[_],_,e),t(e[++_],_,e);for(i=l;a>i;i+=16)_=o+i,t(e[_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e),t(e[++_],_,e);return e}function t(t){var s=t.target,i=t.animationName,_=r[i]||{};t.selector=_.selector,e((this.selectorListeners||{})[i]||[],function(e){e.call(s,t)}),s._decorateDom(_.attributeModified?n:o)}function o(e){return e.hasAttribute("sl__exist__")?!1:(e.hasAttribute("sl__removed__")&&e.removeAttribute("sl__removed__"),e.setAttribute("sl__exist__",1),e.setAttribute("sl__class__"," "+e.className+" "),!0)}function n(e){return e.hasAttribute("sl__exist__")?(e.hasAttribute("sl__removed__")&&e.removeAttribute("sl__removed__"),e.setAttribute("sl__class__"," "+e.className+" "),!1):(e.hasAttribute("sl__removed__")&&e.removeAttribute("sl__removed__"),e.setAttribute("sl__exist__",1),e.setAttribute("sl__class__"," "+e.className+" "),!0)}if("object"!=typeof window.SelectorListener){var r={},s={},i=0,_="{from {outline-color:#fff;} to {outline-color:#000;}}",l="0.001s",c=/SelectorListener/g,a=/(:not\s*\(\s*)?::?exists(\s*\))?\b/gi,u=/::?added\b/gi,m=/::?class\-added\(([^\(\)]+)\)/gi,d=/::?class\-removed\(([^\(\)]+)\)/gi,f=document.createElement("style"),h=document.createElement("style"),p=document.getElementsByTagName("head")[0],v=["animationstart","oAnimationStart","MSAnimationStart","webkitAnimationStart"],y=function(){var e="animation-duration: "+l+";",t="animation-name: SelectorListener !important;",o=window.getComputedStyle(document.documentElement,""),n=(Array.prototype.slice.call(o).join("").match(/moz|webkit|ms/)||""===o.OLink&&["o"])[0];return{css:"-"+n+"-",properties:"{"+e+t+"-"+n+"-"+e+"-"+n+"-"+t+"}",keyframes:!(!window.CSSKeyframesRule&&!window["WebKit|Moz|MS|O".match(new RegExp("("+n+")","i"))[1]+"CSSKeyframesRule"])}}();f.type=h.type="text/css",f.setAttribute("sl__exist__",1),h.setAttribute("sl__exist__",1),p.appendChild(f),p.appendChild(h),HTMLDocument.prototype.sl__decorateDom=function(e){var t,o,n,r=this;if(r=r.getElementsByTagName("body")[0],1!==r.nodeType)return r;if(e(r))for(t=r.childNodes,n=0,o=t.length;o>n;n++)(t[n]instanceof HTMLElement||t[n]instanceof HTMLDocument)&&1===t[n].nodeType&&t[n].sl__decorateDom(e);return r},HTMLElement.prototype.sl__decorateDom=function(e){var t,o,n,r=this;if(1!==r.nodeType)return r;if(e(r))for(t=r.childNodes,n=0,o=t.length;o>n;n++)(t[n]instanceof HTMLElement||t[n]instanceof HTMLDocument)&&1===t[n].nodeType&&t[n].sl__decorateDom(e);return r},HTMLDocument.prototype.addSelectorListener=HTMLElement.prototype.addSelectorListener=function(e,n){if(e&&"function"==typeof n){var l=!1,p=!1,L=e.replace(m,function(e,t){return l=!0,t="."===t.charAt(0)?t.slice(1):t,"[sl__exist__]:not([sl__removed__])."+t+":not([sl__class__~="+t+"])"}).replace(d,function(e,t){return l=!0,t="."===t.charAt(0)?t.slice(1):t,"[sl__exist__]:not([sl__removed__])[sl__class__~="+t+"]:not(."+t+")"}).replace(a,function(e,t){return t?":not([sl__exist__]):not([sl__removed__])":"[sl__exist__]:not([sl__removed__])"}).replace(u,":not([sl__exist__]):not([sl__removed__])"),S=s[L],b=this.selectorListeners=this.selectorListeners||{};if(S)r[S].count++;else{S=s[L]="SelectorListener-"+ ++i;var A=document.createTextNode("@"+(y.keyframes?y.css:"")+"keyframes "+S+" "+_);h.appendChild(A),f.sheet.insertRule(L+y.properties.replace(c,S),0),r[S]={count:1,selector:e,removedMutation:p,attributeModified:l,keyframe:A,rule:f.sheet.cssRules[0]}}b.count?b.count++:(this._decorateDom(o),b.count=1,v.forEach(function(e){this.addEventListener(e,t,!1)},this)),(b[S]=b[S]||[]).push(n)}},HTMLDocument.prototype.removeSelectorListener=HTMLElement.prototype.removeSelectorListener=function(e,o){if(e){var n=e.replace(m,function(e,t){return t="."===t.charAt(0)?t.slice(1):t,"[sl__exist__]:not([sl__removed__])."+t+":not([sl__class__~="+t+"])"}).replace(d,function(e,t){return t="."===t.charAt(0)?t.slice(1):t,"[sl__exist__]:not([sl__removed__])[sl__class__~="+t+"]:not(."+t+")"}).replace(a,function(e,t){return t?":not([sl__exist__]):not([sl__removed__])":"[sl__exist__]:not([sl__removed__])"}).replace(u,":not([sl__exist__]):not([sl__removed__])");if(s.hasOwnProperty(n)){var i=this.selectorListeners||{},_=s[n],l=i[_]||[],c=r[_];if("function"==typeof o){var p=l.indexOf(o);p>-1&&(c.count--,c.count||(f.sheet.deleteRule(f.sheet.cssRules.item(c.rule)),h.removeChild(c.keyframe),delete r[_],delete s[n],delete i[_]),i.count--,l.splice(p,1),i.count||v.forEach(function(e){this.removeEventListener(e,t,!1)},this))}else arguments.length<2&&(f.sheet.deleteRule(f.sheet.cssRules.item(c.rule)),h.removeChild(c.keyframe),delete r[_],delete s[n],i.hasOwnProperty(_)&&delete i[_],i.count--,i.count||v.forEach(function(e){this.removeEventListener(e,t,!1)},this))}}},window.SelectorListener={VERSION:"1.2.0",jquery:function(e){"function"!=typeof e.fn.onSelector&&(e.fn.onSelector=function(e,t){return e&&"function"==typeof t&&this.each(function(){this.addSelectorListener(e,t)}),this},e.fn.offSelector=function(e,t){return this.each("function"==typeof t?function(){this.removeSelectorListener(e,t)}:function(){this.removeSelectorListener(e)}),this})}},"undefined"!=typeof jQuery&&window.SelectorListener.jquery(jQuery)}}();