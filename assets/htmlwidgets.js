/**
*  HtmlWidget, client-side utilities
*
*  @version: 2.3.0
*  https://github.com/foo123/HtmlWidget
*
**/
!function(root, name, factory) {
"use strict";
if (('object' === typeof module) && module.exports)
{
    // CommonJS module
    module.exports = factory();
}
else
{
    root[name] = factory();
    if (('function' === typeof define) && define.amd)
    {
        // AMD. Register as an anonymous module.
        define(function(req) {return root[name];});
    }
}
}('undefined' !== typeof self ? self : this, 'htmlwidgets', function() {
"use strict";

var trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
        ? function(s) {return s.trim();}
        : function(s) {return s.replace(trim_re, '');}
    ,
    HASDOC = ('undefined' !== typeof window) && !!window.document,
    hasEventListeners = HASDOC && !!window.addEventListener,
    document = HASDOC ? window.document : null,
    eventOptionsSupported = null,
    lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'],
    handlers = {}, noop = function() {}
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
function addEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (!hasEventListeners) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
}
function removeEvent(target, event, handler, options)
{
    if (null == eventOptionsSupported) eventOptionsSupported = hasEventOptions();
    if (!hasEventListeners) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, eventOptionsSupported ? options : ('object' === typeof(options) ? !!options.capture : !!options));
    return target;
}
function fireEvent(target, event, data)
{
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
}

function addHandler(el, type, handler)
{
    if (el && el.id)
    {
        var id = 'hw_'+String(el.id);
        if (!handlers[id]) handlers[id] = {};
        handlers[id][String(type || '')] = handler;
    }
}
function removeHandler(el)
{
    if (el && el.id)
    {
        var id = 'hw_'+String(el.id);
        if (handlers[id]) delete handlers[id];
    }
}
function getHandler(el, type, _default)
{
    if (el && el.id)
    {
        var id = 'hw_'+String(el.id);
        if (handlers[id]) return handlers[id][String(type || '')] || _default;
    }
    return _default;
}

function hasClass(el, className)
{
    return el ? (el.classList
        ? el.classList.contains(className)
        : -1 !== (' ' + el.className + ' ').indexOf(' ' + className + ' ')) : false
    ;
}
function addClass(el, className)
{
    if (el && !hasClass(el, className))
    {
        if (el.classList) el.classList.add(className);
        else el.className = '' === el.className ? className : el.className + ' ' + className;
    }
    return el;
}
function removeClass(el, className)
{
    if (el)
    {
        if (el.classList) el.classList.remove(className);
        else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
    }
    return el;
}

function resetInput(inputEl, triggerEvent)
{
    var parent = inputEl.parentNode, next = inputEl.nextSibling, formEl = document.createElement('form');
    formEl.appendChild(inputEl);
    formEl.reset();
    if (next) parent.insertBefore(inputEl, next);
    else parent.appendChild(inputEl);
    formEl = null;
    if (triggerEvent) fireEvent(inputEl, triggerEvent);
    return inputEl;
}

function throttle(f, limit)
{
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
}
function debounce(f, delay)
{
    var timer = null;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){f.apply(context, args);}, delay);
    };
}

return {
    noop: noop,
    addEvent: addEvent,
    removeEvent: removeEvent,
    fireEvent: fireEvent,
    addHandler: addHandler,
    removeHandler: removeHandler,
    getHandler: getHandler,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    resetInput: resetInput,
    throttle: throttle,
    debounce: debounce
};
});
