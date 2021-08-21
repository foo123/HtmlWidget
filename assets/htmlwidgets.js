/**
*  HtmlWidget
*
*  @version: 2.1.0
*  https://github.com/foo123/HtmlWidget
*
**/
!function(root, name, factory) {
"use strict";
if (('object' === typeof module) && module.exports)
    // CommonJS module
    module.exports = factory();
else if (('function' === typeof define) && define.amd)
    // AMD. Register as an anonymous module.
    define(function(req) {return factory();});
else
    root[name] = factory();
}('undefined' !== typeof self ? self : this, 'htmlwidgets', function() {
"use strict";

var htmlwidgets = {},
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');}
    ,
    hasEventListeners = !!window.addEventListener, document = window.document
;

htmlwidgets.addEvent = function(el, e, callback, capture) {
    if (el)
    {
        if (hasEventListeners) el.addEventListener(e, callback, !!capture);
        else el.attachEvent('on' + e, callback);
    }
    return el;
};

htmlwidgets.removeEvent = function(el, e, callback, capture) {
    if (el)
    {
        if (hasEventListeners) el.removeEventListener(e, callback, !!capture);
        else el.detachEvent('on' + e, callback);
    }
    return el;
};

htmlwidgets.fireEvent = function(el, eventName, data) {
    var evt;
    if (el)
    {
        if (document.createEvent)
        {
            evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName, true, false);
            if (null != data) evt.data = data;
            el.dispatchEvent(evt);
        }
        else if (document.createEventObject)
        {
            evt = document.createEventObject();
            if (null != data) evt.data = data;
            el.fireEvent('on' + eventName, evt);
        }
    }
    return el;
};

htmlwidgets.hasClass = function(el, className) {
    return el ? (el.classList
        ? el.classList.contains(className)
        : -1 !== (' ' + el.className + ' ').indexOf(' ' + className + ' ')) : false
    ;
};

htmlwidgets.addClass = function(el, className) {
    if (el && !hasClass(el, className))
    {
        if (el.classList) el.classList.add(className);
        else el.className = '' === el.className ? className : el.className + ' ' + className;
    }
    return el;
};

htmlwidgets.removeClass = function(el, className) {
    if (el)
    {
        if (el.classList) el.classList.remove(className);
        else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
    }
    return el;
};

return htmlwidgets;
});
