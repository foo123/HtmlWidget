/**
*  HtmlWidget, client-side utilities
*
*  @version: 2.2.0
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
    HASDOC = ('undefined' !== typeof window) && !!window.document,
    hasEventListeners = HASDOC && !!window.addEventListener,
    document = HASDOC ? window.document : null,
    eventOptionsSupported = null,
    lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o']
;

/*if (HASDOC)
{
    for(var x = 0; !window.requestAnimationFrame && x < vendors.length; ++x)
    {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
    {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime));
                id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall)
            ;
            lastTime = currTime + timeToCall;
            return id;
        };
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}*/

function hasEventOptions()
{

    var passiveSupported = false, options = {};
    if (hasEventListeners)
    {
        try {
            Object.defineProperty(options, 'passive', {
                get: function(){
                    passiveSupported = true;
                    return false;
                }
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch(e) {
            passiveSupported = false;
        }
    }
    return passiveSupported;
}
htmlwidgets.addEvent = function(target, event, handler, options) {
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (!hasEventListeners) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
};
htmlwidgets.removeEvent = function(target, event, handler, options) {
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (!hasEventListeners) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
};
htmlwidgets.fireEvent = function(target, event, data) {
    var evt, doc;
    if (target)
    {
        doc = target.ownerDocument || document;
        if (doc.createEvent)
        {
            evt = doc.createEvent('HTMLEvents');
            evt.initEvent(event, true, false);
            if (null != data) evt.data = data;
            target.dispatchEvent(evt);
        }
        else if (doc.createEventObject)
        {
            evt = doc.createEventObject();
            if (null != data) evt.data = data;
            target.fireEvent('on' + event, evt);
        }
    }
    return target;
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

htmlwidgets.throttle = function(f, limit) {
    var inThrottle = false;
    return function() {
        var context = this, args = arguments;
        if (!inThrottle)
        {
            f.apply(context, args);
            inThrottle = true;
            setTimeout(function(){inThrottle = false;}, limit);
        }
    };
};
htmlwidgets.debounce = function(f, delay) {
    var timer = null;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            f.apply(context, args);
        }, delay);
    };
};

return htmlwidgets;
});
