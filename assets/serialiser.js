/**
*  Serialiser.js
*  Parse and serialise complex form fields into an object model
*
*  @dependencies: jQuery
*  @version: 0.1.0
*  https://github.com/foo123/serialiser.js
*
**/
!function(t,e,n){"use strict";"object"==typeof exports?module.exports=n():"function"==typeof define&&define.amd?define(function(){return n()}):t[e]=n()}(this,"Serialiser",function(t){"use strict";function e(t){return"function"==typeof t?t:function(e){return e.attr(t)}}function n(e,n){return"function"==typeof e?e:!1!==n?function(n){var r=("value"===e?n.val():n.attr(e))||"",o=(n.attr("type")||n[0].tagName||"").toLowerCase();return("checkbox"===o||"radio"===o)&&!n[0].checked||"select"===o&&-1===n[0].selectedIndex||("text"===o||"textarea"===o)&&!s(r).length?t:r}:function(n){var r=("value"===e?n.val():n.attr(e))||"",o=(n.attr("type")||n[0].tagName).toLowerCase();return"checkbox"!==o&&"radio"!==o||n[0].checked?r:t}}function r(t,r,i,l,f){return r=nodel||{},i=e(i||"name"),l=n(l||"value"),arguments.length<5&&(f="json-encoded"),t.each(function(){var t,e,n,h,g,d,y=o(this),v=f?!!y.attr(f):!1;if(t=i(y),t&&(e=l(y),null!=e))for(n=p(t).split("."),g=r,v&&(e=e?u(e):null);n.length;)h=n.shift(),n.length?(g[a](h)?c.test(n[0])&&g[h].length<=(d=parseInt(n[0],10))&&(g[h]=g[h].concat(new Array(d-g[h].length+1))):s(n[0]).length?c.test(n[0])?(d=parseInt(n[0],10),g[h]=new Array(d+1)):g[h]={}:g[h]=[],g=g[h]):s(h).length?g[h]=e:g.push(e)}),r}var o=jQuery,a="hasOwnProperty",u=JSON.parse,c=/^\d+$/,i=/\[([^\]]*)\]/g,l=/^\.+/g,f=/^\s+|\s+$/g,s=String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(f,"")},p=function(t){return t.replace(i,".$1").replace(l,"")};return{VERSION:"0.1.0",getKey:e,getValue:n,toModel:r}});