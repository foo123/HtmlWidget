/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery, DateX, HtmlWidget
*  @version: 0.7.0
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/DateX
*
**/
!function(window, $, undef){
"use strict";

var htmlwidget = { VERSION: "0.7.0" }, slice = Array.prototype.slice;

// adapted from jquery-ui
function widget2jquery( name, widget, spr )
{
    var _super = spr && spr.prototype ? spr.prototype : null;
    $.fn[ name ] = function( options ) {
        var method = "string" === typeof options ? 'w_'+options : false,
            args = slice.call( arguments, 1 ), return_value = this, method_;

        if ( method ) 
        {
            this.each(function( ){
                var method_value,
                    instance = $.data( this, name );

                if ( "w_instance" === method ) 
                {
                    return_value = instance;
                    return false;
                }
                
                if ( !instance ) return false;
                
                if ( "w_dispose" === method || "w_destroy" === method ) 
                {
                    if ( 'function' === typeof instance.w_dispose ) instance.w_dispose( );
                    else if ( 'function' === typeof instance.w_destroy ) instance.w_destroy( );
                    else if ( 'function' === typeof instance.dispose ) instance.dispose( );
                    else if ( 'function' === typeof instance.destroy ) instance.destroy( );
                    else if ( _super )
                    {
                        if ( 'function' === typeof _super.w_dispose ) _super.w_dispose.call( instance );
                        else if ( 'function' === typeof _super.w_destroy ) _super.w_destroy.call( instance )
                        else if ( 'function' === typeof _super.dispose ) _super.dispose.call( instance )
                        else if ( 'function' === typeof _super.destroy ) _super.destroy.call( instance )
                    }
                    instance = null;
                    $.removeData( this, name );
                    return false;
                }
                
                method_ = instance[ method ] || (_super && _super[ method ]);
                if ( 'function' !== typeof method_ ) return false;

                method_value = method_.apply( instance, args );
                if ( method_value !== instance && undef !== method_value ) 
                {
                    return_value = method_value && method_value.jquery 
                                ? return_value.pushStack( method_value.get( ) ) 
                                : method_value;
                    return false;
                }
            });
        } 
        else 
        {
            this.each(function( ){
                var instance = $.data( this, name );
                if ( instance ) 
                {
                    method_ = instance.w_option ||  (_super && _super.w_option);
                    if ( 'function' === typeof method_ ) 
                        method_.call( instance, options || {} );
                } 
                else 
                {
                    $.data( this, name, instance = new widget( options || {}, this ) );
                    method_ = instance.w_init ||  (_super && _super.w_init);
                    if ( 'function' === typeof method_ ) method_.call( instance );
                }
            });
        }
        return return_value;
    };
}

htmlwidget.morphable = function morphable( options, el ){
    var self = this;
    if ( !(self instanceof morphable) ) return new morphable(options, el);
    var cur_mode = null;
    self.w_morph = function( mode ) {
        if ( mode !== cur_mode )
        {
            var $el = $(el);
            
            if ( cur_mode )
                $el.removeClass( options.modeClass.split('${MODE}').join(cur_mode) );
            
            cur_mode = mode;
            
            if ( cur_mode )
                $el.addClass( options.modeClass.split('${MODE}').join(cur_mode) );
        }
    };
};

htmlwidget.delayable = function delayable( options, el ){
    var self = this;
    if ( !(self instanceof delayable) ) return new delayable(options, el);
    self.w_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') ) 
            $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) 
            $el.addClass('w-undelayed');
        if ( !$el.children('.w-delayable-overlay').length )
        {
            $el.append('\
<div class="w-delayable-overlay">\
<div class="w-spinner w-spinner-dots"></div>\
</div>\
');
        }
    };
    self.w_enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-delayed') )
            $el.addClass('w-delayed').removeClass('w-undelayed');
    };
    self.w_disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') )
            $el.addClass('w-undelayed').removeClass('w-delayed');
    };
};

htmlwidget.disabable = function disabable( options, el ){
    var self = this;
    if ( !(self instanceof disabable) ) return new disabable(options, el);
    self.w_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') ) 
            $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) 
            $el.addClass('w-undelayed');
        if ( !$el.children('.w-disabable-overlay').length )
        {
            $el.append('\
<div class="w-disabable-overlay">\
</div>\
');
        }
    };
    self.w_enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-disabled') )
            $el.addClass('w-disabled').removeClass('w-undisabled');
    };
    self.w_disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-disabled') )
            $el.addClass('w-undisabled').removeClass('w-disabled');
    };
};

// http://nikos-web-development.netai.net
// http://maps.googleapis.com/maps/api/js?sensor=false
htmlwidget.gmap3 = function gmap3( options, el ) {
    var self = this;
    if ( !(self instanceof gmap3) ) return new gmap3(options, el);
    
    function addMarker( map, lat, lng, title, info ) 
    { 
        var marker = new google.maps.Marker({
            map: map,
            title: title,
            position: new google.maps.LatLng( lat, lng )
        });
        if ( !!info )
        {
            var infowindow = new google.maps.InfoWindow({content: info});
            google.maps.event.addListener(marker, 'click', function( ){
                infowindow.open( map, marker );
            });
        }
    }
    
    self._map = null;
    
    self.w_init = function( ) {
        //google.maps.MapTypeId.ROADMAP
        options = $.extend({
            type: "ROADMAP",
            markers: null,
            center: null,
            kml: null
        }, options||{});
        
        self._map = new google.maps.Map(el, {
            zoom: options.center.zoom,
            center: new google.maps.LatLng( options.center.lat, options.center.lng ),
            mapTypeId: google.maps.MapTypeId[ options.type ]
        });
        var i, markers = options.markers, marker, l = markers ? markers.length : 0;
        for (i=0; i<l; i++)
        {
            // add markers, infos to map
            marker = markers[i];
            addMarker( self._map, marker.lat, marker.lng, marker.title||'', marker.info );
        }
        if ( null != options.kml )
        {
            var georssLayer = new google.maps.KmlLayer( options.kml );
            georssLayer.setMap( self._map );
        }
    };
    self.w_dispose = function( ) {
        self._map = null;
    };
};	

htmlwidget.datetime = (function( ){
"use strict";

/*!
 * adapted from Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
 */
 
var
/**
 * feature detection and helper functions
 */
hasEventListeners = !!window.addEventListener,

document = window.document,

sto = window.setTimeout,

addEvent = function(el, e, callback, capture)
{
    if (hasEventListeners) {
        el.addEventListener(e, callback, !!capture);
    } else {
        el.attachEvent('on' + e, callback);
    }
},

removeEvent = function(el, e, callback, capture)
{
    if (hasEventListeners) {
        el.removeEventListener(e, callback, !!capture);
    } else {
        el.detachEvent('on' + e, callback);
    }
},

fireEvent = function(el, eventName, data)
{
    var ev;

    if (document.createEvent) {
        ev = document.createEvent('HTMLEvents');
        ev.initEvent(eventName, true, false);
        ev = extend(ev, data);
        el.dispatchEvent(ev);
    } else if (document.createEventObject) {
        ev = document.createEventObject();
        ev = extend(ev, data);
        el.fireEvent('on' + eventName, ev);
    }
},

trim = function(str)
{
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
},

hasClass = function(el, cn)
{
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
},

addClass = function(el, cn)
{
    if (!hasClass(el, cn)) {
        el.className = (el.className === '') ? cn : el.className + ' ' + cn;
    }
},

removeClass = function(el, cn)
{
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
},

isArray = function(obj)
{
    return (/Array/).test(Object.prototype.toString.call(obj));
},

isDate = function(obj)
{
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
},

isLeapYear = function(year)
{
    // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
},

getDaysInMonth = function(year, month)
{
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
},

setToStartOfDay = function(date)
{
    if (isDate(date)) date.setHours(0,0,0,0);
},

compareDates = function(a,b)
{
    // weak date comparison (use setToStartOfDay(date) to ensure correct result)
    return a.getTime() === b.getTime();
},

defaultEncoder = function( d, pikaday ) {
    return d.toDateString( );
},

defaultDecoder = function( d, pikaday ) {
    return new Date( Date.parse( d ) );
},

extend = function(to, from, overwrite)
{
    var prop, hasProp;
    for (prop in from) {
        hasProp = to[prop] !== undefined;
        if (hasProp && typeof from[prop] === 'object' && from[prop].nodeName === undefined) {
            if (isDate(from[prop])) {
                if (overwrite) {
                    to[prop] = new Date(from[prop].getTime());
                }
            }
            else if (isArray(from[prop])) {
                if (overwrite) {
                    to[prop] = from[prop].slice(0);
                }
            } else {
                to[prop] = extend({}, from[prop], overwrite);
            }
        } else if (overwrite || !hasProp) {
            to[prop] = from[prop];
        }
    }
    return to;
},

adjustCalendar = function(calendar) {
    if (calendar.month < 0) {
        calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
        calendar.month += 12;
    }
    if (calendar.month > 11) {
        calendar.year += Math.floor(Math.abs(calendar.month)/12);
        calendar.month -= 12;
    }
    return calendar;
},

/**
 * defaults and localisation
 */
defaults = {

    // bind the picker to a form field
    field: null,

    // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
    bound: undefined,

    // position of the datepicker, relative to the field (default to bottom & left)
    // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
    position: 'bottom left',

    // the default output format for `.toString()` and `field` value
    format: 'Y-m-d',

    // the initial date to view when first opened
    defaultDate: null,

    // make the `defaultDate` the initial selected value
    setDefaultDate: false,

    // first day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // the minimum/earliest date that can be selected
    minDate: null,
    // the maximum/latest date that can be selected
    maxDate: null,

    // number of years either side, or array of upper/lower range
    yearRange: 10,

    // show week numbers at head of row
    showWeekNumber: false,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    isRTL: false,

    // Additional text to append to the year in the calendar title
    yearSuffix: '',

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // how many months are visible
    numberOfMonths: 1,

    // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
    // only used for the first display or when a selected date is not visible
    mainCalendar: 'left',

    // Specify a DOM element to render the calendar in
    container: undefined,

    // internationalization
    i18n: {
        previousMonth : 'Previous Month',
        nextMonth     : 'Next Month',
        months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
        weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null,
    
    // custom date codecs, not depend just on moment lib
    encoder: false,
    decoder: false
},


/**
 * templating functions to abstract HTML rendering
 */
renderDayName = function(opts, day, abbr)
{
    day += opts.firstDay;
    while (day >= 7) {
        day -= 7;
    }
    return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
},

renderDay = function(d, m, y, isSelected, isToday, isDisabled, isEmpty)
{
    if (isEmpty) {
        return '<td class="is-empty"></td>';
    }
    var arr = [];
    if (isDisabled) {
        arr.push('is-disabled');
    }
    if (isToday) {
        arr.push('is-today');
    }
    if (isSelected) {
        arr.push('is-selected');
    }
    return '<td data-day="' + d + '" class="' + arr.join(' ') + '">' +
             '<button class="pika-button pika-day" type="button" ' +
                'data-pika-year="' + y + '" data-pika-month="' + m + '" data-pika-day="' + d + '">' +
                    d +
             '</button>' +
           '</td>';
},

renderWeek = function (d, m, y) {
    // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
    var onejan = new Date(y, 0, 1),
        weekNum = Math.ceil((((new Date(y, m, d) - onejan) / 86400000) + onejan.getDay()+1)/7);
    return '<td class="pika-week">' + weekNum + '</td>';
},

renderRow = function(days, isRTL)
{
    return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
},

renderBody = function(rows)
{
    return '<tbody>' + rows.join('') + '</tbody>';
},

renderHead = function(opts)
{
    var i, arr = [];
    if (opts.showWeekNumber) {
        arr.push('<th></th>');
    }
    for (i = 0; i < 7; i++) {
        arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
    }
    return '<thead>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</thead>';
},

renderTitle = function(instance, c, year, month, refYear)
{
    var i, j, arr,
        opts = instance._o,
        isMinYear = year === opts.minYear,
        isMaxYear = year === opts.maxYear,
        html = '<div class="pika-title">',
        monthHtml,
        yearHtml,
        prev = true,
        next = true;

    for (arr = [], i = 0; i < 12; i++) {
        arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
            (i === month ? ' selected': '') +
            ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled' : '') + '>' +
            opts.i18n.months[i] + '</option>');
    }
    monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month">' + arr.join('') + '</select></div>';

    if (isArray(opts.yearRange)) {
        i = opts.yearRange[0];
        j = opts.yearRange[1] + 1;
    } else {
        i = year - opts.yearRange;
        j = 1 + year + opts.yearRange;
    }

    for (arr = []; i < j && i <= opts.maxYear; i++) {
        if (i >= opts.minYear) {
            arr.push('<option value="' + i + '"' + (i === year ? ' selected': '') + '>' + (i) + '</option>');
        }
    }
    yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year">' + arr.join('') + '</select></div>';

    if (opts.showMonthAfterYear) {
        html += yearHtml + monthHtml;
    } else {
        html += monthHtml + yearHtml;
    }

    if (isMinYear && (month === 0 || opts.minMonth >= month)) {
        prev = false;
    }

    if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
        next = false;
    }

    if (c === 0) {
        html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
    }
    if (c === (instance._o.numberOfMonths - 1) ) {
        html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
    }

    return html += '</div>';
},

renderTable = function(opts, data)
{
    return '<table cellpadding="0" cellspacing="0" class="pika-table">' + renderHead(opts) + renderBody(data) + '</table>';
},


/**
 * Pikaday constructor
 */
Pikaday = function(options, el)
{
    options = options || {};
    options.field = options.field || el;
    
    var self = this,
        opts = self.config(options);

    self._onMouseDown = function(e)
    {
        if (!self._v) {
            return;
        }
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (!target) {
            return;
        }

        if (!hasClass(target, 'is-disabled')) {
            if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty')) {
                self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                if (opts.bound) {
                    sto(function() {
                        self.hide();
                        if (opts.field) {
                            opts.field.blur();
                        }
                    }, 100);
                }
                return;
            }
            else if (hasClass(target, 'pika-prev')) {
                self.prevMonth();
            }
            else if (hasClass(target, 'pika-next')) {
                self.nextMonth();
            }
        }
        if (!hasClass(target, 'pika-select')) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
                return false;
            }
        } else {
            self._c = true;
        }
    };

    self._onChange = function(e)
    {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (!target) {
            return;
        }
        if (hasClass(target, 'pika-select-month')) {
            self.gotoMonth(target.value);
        }
        else if (hasClass(target, 'pika-select-year')) {
            self.gotoYear(target.value);
        }
    };

    self._onInputChange = function(e)
    {
        var date;

        if (e.firedBy === self) {
            return;
        }
        
        date = opts.decoder( opts.field.value, self );
        
        self.setDate(isDate(date) ? date : null);
        if (!self._v) {
            self.show();
        }
    };

    self._onInputFocus = function()
    {
        self.show();
    };

    self._onInputClick = function()
    {
        self.show();
    };

    self._onInputBlur = function()
    {
        if (!self._c) {
            self._b = sto(function() {
                self.hide();
            }, 50);
        }
        self._c = false;
    };

    self._onClick = function(e)
    {
        e = e || window.event;
        var target = e.target || e.srcElement,
            pEl = target;
        if (!target) {
            return;
        }
        if (!hasEventListeners && hasClass(target, 'pika-select')) {
            if (!target.onchange) {
                target.setAttribute('onchange', 'return;');
                addEvent(target, 'change', self._onChange);
            }
        }
        do {
            if (hasClass(pEl, 'pika-single')) {
                return;
            }
        }
        while ((pEl = pEl.parentNode));
        if (self._v && target !== opts.trigger) {
            self.hide();
        }
    };

    self.el = document.createElement('div');
    self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '');

    addEvent(self.el, 'mousedown', self._onMouseDown, true);
    addEvent(self.el, 'change', self._onChange);

    if (opts.field) {
        if (opts.container) {
            opts.container.appendChild(self.el);
        } else if (opts.bound) {
            document.body.appendChild(self.el);
        } else {
            opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
        }
        addEvent(opts.field, 'change', self._onInputChange);

        if (!opts.defaultDate) {
            opts.defaultDate = opts.decoder( opts.field.value, self );
            opts.setDefaultDate = true;
        }
    }

    var defDate = opts.defaultDate;

    if (isDate(defDate)) {
        if (opts.setDefaultDate) {
            self.setDate(defDate, true);
        } else {
            self.gotoDate(defDate);
        }
    } else {
        self.gotoDate(new Date());
    }

    if (opts.bound) {
        this.hide();
        self.el.className += ' is-bound';
        addEvent(opts.trigger, 'click', self._onInputClick);
        addEvent(opts.trigger, 'focus', self._onInputFocus);
        addEvent(opts.trigger, 'blur', self._onInputBlur);
    } else {
        this.show();
    }
};


/**
 * public Pikaday API
 */
Pikaday.prototype = {


    /**
     * configure functionality
     */
    config: function(options)
    {
        if (!this._o) {
            this._o = extend({}, defaults, true);
        }

        var opts = extend(this._o, options, true);
        
        if ( !opts.encoder || 'function' !== typeof(opts.encoder) ) opts.encoder = defaultEncoder;
        if ( !opts.decoder || 'function' !== typeof(opts.decoder) ) opts.decoder = defaultDecoder;

        opts.isRTL = !!opts.isRTL;

        opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

        opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

        opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

        var nom = parseInt(opts.numberOfMonths, 10) || 1;
        opts.numberOfMonths = nom > 4 ? 4 : nom;

        if (!isDate(opts.minDate)) {
            opts.minDate = false;
        }
        if (!isDate(opts.maxDate)) {
            opts.maxDate = false;
        }
        if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
            opts.maxDate = opts.minDate = false;
        }
        if (opts.minDate) {
            setToStartOfDay(opts.minDate);
            opts.minYear  = opts.minDate.getFullYear();
            opts.minMonth = opts.minDate.getMonth();
        }
        if (opts.maxDate) {
            setToStartOfDay(opts.maxDate);
            opts.maxYear  = opts.maxDate.getFullYear();
            opts.maxMonth = opts.maxDate.getMonth();
        }

        if (isArray(opts.yearRange)) {
            var fallback = new Date().getFullYear() - 10;
            opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
            opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
        } else {
            opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
            if (opts.yearRange > 100) {
                opts.yearRange = 100;
            }
        }
        
        return opts;
    },

    /**
     * return a formatted string of the current selection (using Moment.js if available)
     */
    toString: function(format)
    {
        return !isDate( this._d ) ? '' : this._o.encoder( this._d, this );
    },

    /**
     * return a Date object of the current selection
     */
    getDate: function()
    {
        return isDate(this._d) ? new Date(this._d.getTime()) : null;
    },

    /**
     * set the current selection
     */
    setDate: function(date, preventOnSelect)
    {
        if (!date) {
            this._d = null;

            if (this._o.field) {
                this._o.field.value = '';
                fireEvent(this._o.field, 'change', { firedBy: this });
            }

            return this.draw();
        }
        if (typeof date === 'string') {
            date = this._o.decoder( date, this );
        }
        if (!isDate(date)) {
            return;
        }

        var min = this._o.minDate,
            max = this._o.maxDate;

        if (isDate(min) && date < min) {
            date = min;
        } else if (isDate(max) && date > max) {
            date = max;
        }

        this._d = new Date(date.getTime());
        setToStartOfDay(this._d);
        this.gotoDate(this._d);

        if (this._o.field) {
            this._o.field.value = this.toString();
            fireEvent(this._o.field, 'change', { firedBy: this });
        }
        if (!preventOnSelect && typeof this._o.onSelect === 'function') {
            this._o.onSelect.call(this, this.getDate());
        }
    },

    /**
     * change view to a specific date
     */
    gotoDate: function(date)
    {
        var newCalendar = true;

        if (!isDate(date)) {
            return;
        }

        if (this.calendars) {
            var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
                visibleDate = date.getTime();
            // get the end of the month
            lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
            lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
            newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
        }

        if (newCalendar) {
            this.calendars = [{
                month: date.getMonth(),
                year: date.getFullYear()
            }];
            if (this._o.mainCalendar === 'right') {
                this.calendars[0].month += 1 - this._o.numberOfMonths;
            }
        }

        this.adjustCalendars();
    },

    adjustCalendars: function() {
        this.calendars[0] = adjustCalendar(this.calendars[0]);
        for (var c = 1; c < this._o.numberOfMonths; c++) {
            this.calendars[c] = adjustCalendar({
                month: this.calendars[0].month + c,
                year: this.calendars[0].year
            });
        }
        this.draw();
    },

    gotoToday: function()
    {
        this.gotoDate(new Date());
    },

    /**
     * change view to a specific month (zero-index, e.g. 0: January)
     */
    gotoMonth: function(month)
    {
        if (!isNaN(month)) {
            this.calendars[0].month = parseInt(month, 10);
            this.adjustCalendars();
        }
    },

    nextMonth: function()
    {
        this.calendars[0].month++;
        this.adjustCalendars();
    },

    prevMonth: function()
    {
        this.calendars[0].month--;
        this.adjustCalendars();
    },

    /**
     * change view to a specific full year (e.g. "2012")
     */
    gotoYear: function(year)
    {
        if (!isNaN(year)) {
            this.calendars[0].year = parseInt(year, 10);
            this.adjustCalendars();
        }
    },

    /**
     * change the minDate
     */
    setMinDate: function(value)
    {
        this._o.minDate = value;
    },

    /**
     * change the maxDate
     */
    setMaxDate: function(value)
    {
        this._o.maxDate = value;
    },

    /**
     * refresh the HTML
     */
    draw: function(force)
    {
        if (!this._v && !force) {
            return;
        }
        var opts = this._o,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '';

        if (this._y <= minYear) {
            this._y = minYear;
            if (!isNaN(minMonth) && this._m < minMonth) {
                this._m = minMonth;
            }
        }
        if (this._y >= maxYear) {
            this._y = maxYear;
            if (!isNaN(maxMonth) && this._m > maxMonth) {
                this._m = maxMonth;
            }
        }

        for (var c = 0; c < opts.numberOfMonths; c++) {
            html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year) + this.render(this.calendars[c].year, this.calendars[c].month) + '</div>';
        }

        this.el.innerHTML = html;

        if (opts.bound) {
            if(opts.field.type !== 'hidden') {
                sto(function() {
                    opts.trigger.focus();
                }, 1);
            }
        }

        if (typeof this._o.onDraw === 'function') {
            var self = this;
            sto(function() {
                self._o.onDraw.call(self);
            }, 0);
        }
    },

    adjustPosition: function()
    {
        if (this._o.container) return;
        var field = this._o.trigger, pEl = field,
        width = this.el.offsetWidth, height = this.el.offsetHeight,
        viewportWidth = window.innerWidth || document.documentElement.clientWidth,
        viewportHeight = window.innerHeight || document.documentElement.clientHeight,
        scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
        left, top, clientRect;

        if (typeof field.getBoundingClientRect === 'function') {
            clientRect = field.getBoundingClientRect();
            left = clientRect.left + window.pageXOffset;
            top = clientRect.bottom + window.pageYOffset;
        } else {
            left = pEl.offsetLeft;
            top  = pEl.offsetTop + pEl.offsetHeight;
            while((pEl = pEl.offsetParent)) {
                left += pEl.offsetLeft;
                top  += pEl.offsetTop;
            }
        }

        // default position is bottom & left
        if (left + width > viewportWidth ||
            (
                this._o.position.indexOf('right') > -1 &&
                left - width + field.offsetWidth > 0
            )
        ) {
            left = left - width + field.offsetWidth;
        }
        if (top + height > viewportHeight + scrollTop ||
            (
                this._o.position.indexOf('top') > -1 &&
                top - height - field.offsetHeight > 0
            )
        ) {
            top = top - height - field.offsetHeight;
        }
        this.el.style.cssText = [
            'position: absolute',
            'left: ' + left + 'px',
            'top: ' + top + 'px'
        ].join(';');
    },

    /**
     * render HTML for a particular month
     */
    render: function(year, month)
    {
        var opts   = this._o,
            now    = new Date(),
            days   = getDaysInMonth(year, month),
            before = new Date(year, month, 1).getDay(),
            data   = [],
            row    = [];
        setToStartOfDay(now);
        if (opts.firstDay > 0) {
            before -= opts.firstDay;
            if (before < 0) {
                before += 7;
            }
        }
        var cells = days + before,
            after = cells;
        while(after > 7) {
            after -= 7;
        }
        cells += 7 - after;
        for (var i = 0, r = 0; i < cells; i++)
        {
            var day = new Date(year, month, 1 + (i - before)),
                isDisabled = (opts.minDate && day < opts.minDate) || (opts.maxDate && day > opts.maxDate),
                isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                isToday = compareDates(day, now),
                isEmpty = i < before || i >= (days + before);

            row.push(renderDay(1 + (i - before), month, year, isSelected, isToday, isDisabled, isEmpty));

            if (++r === 7) {
                if (opts.showWeekNumber) {
                    row.unshift(renderWeek(i - before, month, year));
                }
                data.push(renderRow(row, opts.isRTL));
                row = [];
                r = 0;
            }
        }
        return renderTable(opts, data);
    },

    isVisible: function()
    {
        return this._v;
    },

    show: function()
    {
        if (!this._v) {
            removeClass(this.el, 'is-hidden');
            this._v = true;
            this.draw();
            if (this._o.bound) {
                addEvent(document, 'click', this._onClick);
                this.adjustPosition();
            }
            if (typeof this._o.onOpen === 'function') {
                this._o.onOpen.call(this);
            }
        }
    },

    hide: function()
    {
        var v = this._v;
        if (v !== false) {
            if (this._o.bound) {
                removeEvent(document, 'click', this._onClick);
            }
            this.el.style.cssText = '';
            addClass(this.el, 'is-hidden');
            this._v = false;
            if (v !== undefined && typeof this._o.onClose === 'function') {
                this._o.onClose.call(this);
            }
        }
    },

    /**
     * GAME OVER
     */
    destroy: function()
    {
        this.hide();
        removeEvent(this.el, 'mousedown', this._onMouseDown, true);
        removeEvent(this.el, 'change', this._onChange);
        if (this._o.field) {
            removeEvent(this._o.field, 'change', this._onInputChange);
            if (this._o.bound) {
                removeEvent(this._o.trigger, 'click', this._onInputClick);
                removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                removeEvent(this._o.trigger, 'blur', this._onInputBlur);
            }
        }
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

};

return Pikaday;
})();
// custom date codecs and locale
//htmlwidget.datetime.locale = DateX.defaultLocale;
htmlwidget.datetime.encoder = function encoder( format, locale ) {
    if ( 'undefined' !== typeof window.DateX )
    {
        locale = locale || DateX.defaultLocale;
        return function( date/*, pikaday*/ ) {
            //var opts = pikaday._o;
            return DateX.format( date, format, locale );
        };
    }
    else
    {
        return function( date ) {
            return date.toDateString( );
        };
    }
};
htmlwidget.datetime.decoder = function decoder( format, locale ) {
    if ( 'undefined' !== typeof window.DateX )
    {
        locale = locale || DateX.defaultLocale;
        var date_parse = DateX.getParser( format, locale );
        return function( date/*, pikaday*/ ) {
            //var opts = pikaday._o;
            return !!date && date_parse( date );
        };
    }
    else
    {

        return function( date ) {
            return new Date( Date.parse( date ) );
        };
    }
};


htmlwidget.suggest = (function(){
"use strict";
var id = 0;

function RemoteList(options, element){
    id++;
    this.element = $(element);
    this.options = $.extend({}, RemoteList.defaults, options);
    this.cache = {};
    this.id = 'remotelist-'+id;

    if(!this.options.param){
        this.options.param = this.element.prop('name') || 'q';
    }

    this._createDatalist();
    this._bindEvents(this);
}

RemoteList.defaults = {
    minLength: 2,
    maxLength: -1,
    source: '',
    param: '',
    select: $.noop,
    renderItem: null
};

RemoteList.createOption = function(option){
    var ret = $(document.createElement('option'));
    if(!option || typeof option == 'string'){
        option = {value: option};
    }
    ret.prop('value', option.value);
    if(option.label){
        ret.prop('label', option.label);
    }
    ret.data('optionData', option);
    return ret[0];
};

RemoteList.prototype = {

    selectedData: function(){
        var elem = this.selectedOption();
        return elem && $(elem).data('optionData');
    },
    selectedOption: function(){
        var selectedOption = null;
        var val = this.val();
        if(val){
            selectedOption = $('[value="'+ val +'"]', this.element.prop('list'))[0] || null;
        }
        return selectedOption;
    },
    search: function(val){
        var dataObj, source, response, reset;
        var that = this;
        var o = this.options;
        var cVal = val;

        if(o.maxLength > -1){
            cVal = cVal.substr(o, o.maxLength);
        }


        this.doAjax = false;

        if(this.cache[cVal]){
            this.setList(this.cache[cVal], cVal);
        } else if(!this.currentAjax){
            this.element.addClass('list-search');
            dataObj = {};
            dataObj[o.param] = val;
            this.currentAjax = true;


            reset = function(){
                if(reset.xhr && reset.xhr.abort){
                    reset.xhr.abort();
                }
                that.currentAjax = false;

                clearTimeout(reset.timer);

                if(that.doAjax){
                    that.search(that.doAjax);
                } else {
                    that.element.removeClass('list-search');
                }
            };

            source = $.isFunction(o.source) ?
                o.source :
                function(val, response, fail, dataObj, url){
                    return $.ajax({
                        dataType: 'json',
                        url: url,
                        data: dataObj,
                        context: this,
                        error: fail,
                        success: response
                    });
                }
            ;


            response = function(data){
                that.setList(data, cVal);
                reset();
            };

            reset.timer = setTimeout(reset, 999);
            reset.xhr = source(val, response, reset, dataObj, o.source);

        } else {
            this.doAjax = val;
        }
    },
    setList: function(options, val){
        if(!options){
            options = [];
        }

        if(this.currentOptions != options && this.currentVal !== val){
            this.currentOptions = options;
            this.currentVal = val;
            this.cache[val] = options;
            options = $.map(options, RemoteList.createOption);
            this.datalistSelect.html(options);
            if($.fn.updatePolyfill){
                this.datalistSelect.updatePolyfill();
            }
        }

    },
    _createDatalist: function(){
        this.datalistSelect = this.element.prop('list');

        if(!this.datalistSelect){
            this.datalistSelect = $('<datalist id="'+ this.id +'"><select /></datalist>');
            this.element.attr('list', this.id);
            this.element.after(this.datalistSelect);
        }

        this.datalistSelect = $('select', this.datalistSelect);
    },
    val: function(){
        return window.webshims && webshims.getDataListVal ? webshims.getDataListVal(this.element[0]) : this.element.prop('value');
    },
    widget: function(){
        return this;
    },
    _bindEvents: function(inst){
        var searchTimer, selectTimer, character;
        var options = inst.options;


        var detectListselect = (function(){
            var lastValue;
            return function(type){
                var curValue = inst.val();
                
                if(curValue === lastValue){
                    return;
                }
                lastValue = curValue;
                if(type != 'change' && character && character.toLowerCase() == curValue.charAt(curValue.length -1).toLowerCase()){
                    return;
                }

                if(inst.selectedOption()){
                    clearTimeout(searchTimer);
                    if(options.select){
                        options.select.call(inst.element[0], $.Event('listselect'));
                    }
                    inst.element.trigger('listselect');
                    return true;
                }
            };
        })();

        inst.element.on({
            'input focus': (function(){

                var fn = function(){
                    var useVal = inst.val();
                    if(useVal.length >= options.minLength){
                        inst.search(useVal);
                    }
                };
                return function(){
                    clearTimeout(searchTimer);
                    searchTimer = setTimeout(fn, 99);
                };
            })(),
            /*
                Actually if an option is selected by a user a change event should be dispatched.
                Unfortunatley currently no browser got this right, so we use the input event, which isn't 100% a proof solution
             */
            'input change': function(e){
                clearTimeout(selectTimer);
                if(e.type == 'change'){
                    clearTimeout(searchTimer);
                    if(inst.element.is(':focus')){
                        detectListselect('change');
                    }
                } else {
                    selectTimer = setTimeout(detectListselect, 9);
                }
            },
            keypress: (function(){
                var removeChar = function(){
                    character = '';
                };
                return function(e){
                    character = String.fromCharCode(e.charCode);
                    setTimeout(removeChar, 20);
                };
            })(),
            getoptioncontent: function(e, data){
                //renderItem
                if(options.renderItem){
                    return options.renderItem('<span class="option-value">'+ data.item.value +'</span>', data.item.label && '<span class="option-label">'+ data.item.label +'</span>', $.data(data.item.elem, 'optionData'));
                }
            }
        })
    }
};
return RemoteList;

})();

/*if ( 'undefined' !== typeof window.HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}*/
$.htmlwidget = htmlwidget;

widget2jquery( 'morphable', htmlwidget.morphable );
widget2jquery( 'delayable', htmlwidget.delayable );
widget2jquery( 'disabable', htmlwidget.disabable );
widget2jquery( 'datetime', htmlwidget.datetime );
widget2jquery( 'suggest', htmlwidget.suggest );
widget2jquery( 'gmap3', htmlwidget.gmap3 );

htmlwidget._ = function( type, el, opts ) {
    opts = opts || {};
    switch( type )
    {
    case 'morphable':
        $(el).morphable( );
        break;
    
    case 'delayable':
        $(el).delayable( );
        break;
    
    case 'disabable':
        $(el).disabable( );
        break;
    
    case 'suggest':
        var $el = $(el), suggest = $el.parent( ),
            ajaxurl = $el.attr('data-ajax'),
            method = $el.attr('data-request-method') || "POST",
            dataType = $el.attr('data-response-type') || "json";
        $el.suggest({
            minLength: 2,
            maxLength: -1,
            source: function( value, response ){
                suggest.addClass("ajax");
                $.ajax({
                    url: ajaxurl,
                    type: method,
                    dataType: dataType,
                    data: {suggest: value},
                    success: function( data ){
                        suggest.removeClass("ajax");
                        response( data );
                    }
                });
            },
            select: function( ){ }
        });
        break;
    
    case 'wysiwyg-editor':
        var $el = $(el);
        $el.trumbowyg( opts.editor||{} );
        $el.closest(".trumbowyg-box").addClass("widget w-wysiwyg-editor-box").attr("style", opts.style||'');
        break;
    
    case 'syntax-editor':
        CodeMirror.fromTextArea( $(el)[0], opts.editor||{} );
        break;
    
    case 'date':
    case 'datetime':
        var $el = $(el), format = $el.attr('data-datetime-format') || 'Y-m-d';
        $el.datetime({
            encoder: htmlwidget.datetime.encoder( format ),
            decoder: htmlwidget.datetime.decoder( format )
        });
        break;
    
    case 'select2':
    case 'select':
        $(el).select2( opts );
        break;
    
    case 'gmap3':
    case 'gmap':
    case 'map':
        $(el).gmap3( opts );
        break;
    
    default: break;
    }
};
$(function(){
    $('.w-delayable').delayable( );
    $('.w-disabable').disabable( );
    //$('.w-morphable').morphable( );
});

}(window, jQuery);