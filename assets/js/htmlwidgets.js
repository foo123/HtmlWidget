/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery
*  @version: 0.1
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*
**/
!function($, HtmlWidget, undef){
"use strict";

var slice = Array.prototype.slice;

// adapted from jquery-ui
function widget2jquery( name, widget )
{
    $.fn[ name ] = function( options ) {
        var method = "string" === typeof options ? 'widget_'+options : false,
            args = slice.call( arguments, 1 ), return_value = this;

        if ( method ) 
        {
            this.each(function( ){
                var method_value,
                    instance = $.data( this, name );

                if ( "widget_instance" === method ) 
                {
                    return_value = instance;
                    return false;
                }
                
                if ( !instance ) return false;
                
                if ( "widget_dispose" === method || "widget_destroy" === method ) 
                {
                    if ( 'function' === typeof instance.dispose ) instance.dispose( );
                    else if ( 'function' === typeof instance.destroy ) instance.destroy( );
                    instance = null;
                    $.removeData( this, name );
                    return false;
                }
                
                if ( 'function' !== typeof instance[ method ] ) return false;

                method_value = instance[ method ].apply( instance, args );
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
                    if ( 'function' === typeof instance.widget_option ) 
                        instance.widget_option( options || {} );
                } 
                else 
                {
                    $.data( this, name, instance = new widget( options || {}, this ) );
                    if ( 'function' === typeof instance.widget_init ) 
                        instance.widget_init( );
                }
            });
        }
        return return_value;
    };
}

$.htmlwidget = { };
$.htmlwidget.morphable = function morphable( options, el ){
    var self = this;
    if ( !(self instanceof morphable) ) return new morphable(options, el);
    var cur_mode = null;
    self.widget_morph = function( mode ) {
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

$.htmlwidget.delayable = function delayable( options, el ){
    var self = this;
    if ( !(self instanceof delayable) ) return new delayable(options, el);
    self.widget_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('widget-delayed') ) 
            $el.removeClass('widget-delayed');
        if ( !$el.hasClass('widget-undelayed') ) 
            $el.addClass('widget-undelayed');
        if ( !$el.children('.widget-delayable-overlay').length )
        {
            $el.append('\
<div class="widget-delayable-overlay">\
<div class="widget-spinner widget-spinner-dots"></div>\
</div>\
            ');
        }
    };
    self.widget_enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('widget-delayed') )
            $el.addClass('widget-delayed').removeClass('widget-undelayed');
    };
    self.widget_disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('widget-delayed') )
            $el.addClass('widget-undelayed').removeClass('widget-delayed');
    };
};

$.htmlwidget.disabable = function disabable( options, el ){
    var self = this;
    if ( !(self instanceof disabable) ) return new disabable(options, el);
    self.widget_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('widget-delayed') ) 
            $el.removeClass('widget-delayed');
        if ( !$el.hasClass('widget-undelayed') ) 
            $el.addClass('widget-undelayed');
        if ( !$el.children('.widget-disabable-overlay').length )
        {
            $el.append('\
<div class="widget-disabable-overlay">\
</div>\
            ');
        }
    };
    self.widget_enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('widget-disabled') )
            $el.addClass('widget-disabled').removeClass('widget-undisabled');
    };
    self.widget_disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('widget-disabled') )
            $el.addClass('widget-undisabled').removeClass('widget-disabled');
    };
};

$.htmlwidget.datetime = (function(){
// adapted from https://github.com/foo123/DateX
"use strict";

var HAS = 'hasOwnProperty', floor = Math.floor, round = Math.round, abs = Math.abs,
    ESCAPED_RE = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
    
    date_locale_default = {
    meridian: { am:'am', pm:'pm', AM:'AM', PM:'PM' },
    ordinal: { ord:{1:'st',2:'nd',3:'rd'}, nth:'th' },
    timezone: [ 'UTC','EST','MDT' ],
    timezone_short: [ 'UTC','EST','MDT' ],
    day: [ 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday' ],
    day_short: [ 'Sun','Mon','Tue','Wed','Thu','Fri','Sat' ],
    month: [ 'January','February','March','April','May','June','July','August','September','October','November','December' ],
    month_short: [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' ]
    },
    
    // (php) date formats
    // http://php.net/manual/en/function.date.php
    date_patterns = {
    // Day --
    // Day of month w/leading 0; 01..31
     d: function( locale, dto ) {
         if ( !dto[HAS]('d') )
         {
            dto.d = '(31|30|29|28|27|26|25|24|23|22|21|20|19|18|17|16|15|14|13|12|11|10|09|08|07|06|05|04|03|02|01)';
         }
        return dto.d;
     }
    // Shorthand day name; Mon...Sun
    ,D: function( locale, dto ) {
         if ( !dto[HAS]('D') )
         {
            dto.D = '(' + get_alternate_pattern( locale.day_short.slice() ) + ')';
         }
         return dto.D;
    }
    // Full day name; Monday...Sunday
    ,l: function( locale, dto ) {
         if ( !dto[HAS]('l') )
         {
            dto.l = '(' + get_alternate_pattern( locale.day.slice() ) + ')';
         }
         return dto.l;
    }
    // Day of month; 1..31
    ,j: function( locale, dto ) {
         if ( !dto[HAS]('j') )
         {
            dto.j = '(31|30|29|28|27|26|25|24|23|22|21|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1)';
         }
         return dto.j;
    }
    // ISO-8601 day of week; 1[Mon]..7[Sun]
    ,N: function( locale, dto ) {
         if ( !dto[HAS]('N') )
         {
            dto.N = '([1-7])';
         }
         return dto.N;
    }
    // Ordinal suffix for day of month; st, nd, rd, th
    ,S: function( locale, dto ) {
         if ( !dto[HAS]('S') )
         {
            // Ordinal suffix for day of month; st, nd, rd, th
            var lord = locale.ordinal.ord, lords = [], i;
            for (i in lord) if ( lord[HAS](i) ) lords.push( lord[i] );
            lords.push( locale.ordinal.nth );
            dto.S = '(' + get_alternate_pattern( lords ) + ')';
         }
         return dto.S;
    }
    // Day of week; 0[Sun]..6[Sat]
    ,w: function( locale, dto ) {
         if ( !dto[HAS]('w') )
         {
            dto.w = '([0-6])';
         }
         return dto.w;
    }
    // Day of year; 0..365
    ,z: function( locale, dto ) {
         if ( !dto[HAS]('z') )
         {
            dto.z = '([1-3]?[0-9]{1,2})';
         }
         return dto.z;
    }

    // Week --
    // ISO-8601 week number
    ,W: function( locale, dto ) {
         if ( !dto[HAS]('W') )
         {
            dto.W = '([0-5]?[0-9])';
         }
         return dto.W;
    }

    // Month --
    // Full month name; January...December
    ,F: function( locale, dto ) {
         if ( !dto[HAS]('F') )
         {
            dto.F = '(' + get_alternate_pattern( locale.month.slice() ) + ')';
         }
         return dto.F;
    }
    // Shorthand month name; Jan...Dec
    ,M: function( locale, dto ) {
         if ( !dto[HAS]('M') )
         {
            dto.M = '(' + get_alternate_pattern( locale.month_short.slice() ) + ')';
         }
         return dto.M;
    }
    // Month w/leading 0; 01...12
    ,m: function( locale, dto ) {
         if ( !dto[HAS]('m') )
         {
            dto.m = '(12|11|10|09|08|07|06|05|04|03|02|01)';
         }
         return dto.m;
    }
    // Month; 1...12
    ,n: function( locale, dto ) {
         if ( !dto[HAS]('n') )
         {
            dto.n = '(12|11|10|9|8|7|6|5|4|3|2|1)';
         }
         return dto.n;
    }
    // Days in month; 28...31
    ,t: function( locale, dto ) {
         if ( !dto[HAS]('t') )
         {
            dto.t = '(31|30|29|28)';
         }
         return dto.t;
    }
    
    // Year --
    // Is leap year?; 0 or 1
    ,L: function( locale, dto ) {
         if ( !dto[HAS]('L') )
         {
            dto.L = '([01])';
         }
         return dto.L;
    }
    // ISO-8601 year
    ,o: function( locale, dto ) {
         if ( !dto[HAS]('o') )
         {
            dto.o = '(\\d{2,4})';
         }
         return dto.o;
    }
    // Full year; e.g. 1980...2010
    ,Y: function( locale, dto ) {
         if ( !dto[HAS]('Y') )
         {
            dto.Y = '([12][0-9]{3})';
         }
         return dto.Y;
    }
    // Last two digits of year; 00...99
    ,y: function( locale, dto ) {
         if ( !dto[HAS]('y') )
         {
            dto.y = '([0-9]{2})';
         }
         return dto.y;
    }

    // Time --
    // am or pm
    ,a: function( locale, dto ) {
         if ( !dto[HAS]('a') )
         {
            dto.a = '(' + get_alternate_pattern( [
                locale.meridian.am /*|| date_locale_default.meridian.am*/,
                locale.meridian.pm /*|| date_locale_default.meridian.pm*/
            ] ) + ')';
         }
         return dto.a;
    }
    // AM or PM
    ,A: function( locale, dto ) {
         if ( !dto[HAS]('A') )
         {
            dto.A = '(' + get_alternate_pattern( [
                locale.meridian.AM /*|| date_locale_default.meridian.AM*/,
                locale.meridian.PM /*|| date_locale_default.meridian.PM*/
            ] ) + ')';
         }
         return dto.A;
    }
    // Swatch Internet time; 000..999
    ,B: function( locale, dto ) {
         if ( !dto[HAS]('B') )
         {
            dto.B = '([0-9]{3})';
         }
         return dto.B;
    }
    // 12-Hours; 1..12
    ,g: function( locale, dto ) {
         if ( !dto[HAS]('g') )
         {
            dto.g = '(12|11|10|9|8|7|6|5|4|3|2|1)';
         }
         return dto.g;
    }
    // 24-Hours; 0..23
    ,G: function( locale, dto ) {
         if ( !dto[HAS]('G') )
         {
            dto.G = '(23|22|21|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1|0)';
         }
         return dto.G;
    }
    // 12-Hours w/leading 0; 01..12
    ,h: function( locale, dto ) {
         if ( !dto[HAS]('h') )
         {
            dto.h = '(12|11|10|09|08|07|06|05|04|03|02|01)';
         }
         return dto.h;
    }
    // 24-Hours w/leading 0; 00..23
    ,H: function( locale, dto ) {
         if ( !dto[HAS]('H') )
         {
            dto.H = '(23|22|21|20|19|18|17|16|15|14|13|12|11|10|09|08|07|06|05|04|03|02|01|00)';
         }
         return dto.H;
    }
    // Minutes w/leading 0; 00..59
    ,i: function( locale, dto ) {
         if ( !dto[HAS]('i') )
         {
            dto.i = '([0-5][0-9])';
         }
         return dto.i
    }
    // Seconds w/leading 0; 00..59
    ,s: function( locale, dto ) {
         if ( !dto[HAS]('s') )
         {
            dto.s = '([0-5][0-9])';
         }
         return dto.s;
    }
    // Microseconds; 000000-999000
    ,u: function( locale, dto ) {
         if ( !dto[HAS]('u') )
         {
            dto.u = '([0-9]{6})';
         }
         return dto.u;
    }

    // Timezone --
    // DST observed?; 0 or 1
    ,I: function( locale, dto ) {
         if ( !dto[HAS]('I') )
         {
            dto.I = '([01])';
         }
         return dto.I;
    }
    // Difference to GMT in hour format; e.g. +0200
    ,O: function( locale, dto ) {
         if ( !dto[HAS]('O') )
         {
            dto.O = '([+-][0-9]{4})';
         }
         return dto.O;
    }
    // Difference to GMT w/colon; e.g. +02:00
    ,P: function( locale, dto ) {
         if ( !dto[HAS]('P') )
         {
            dto.P = '([+-][0-9]{2}:[0-9]{2})';
         }
         return dto.P;
    }
    // Timezone offset in seconds (-43200...50400)
    ,Z: function( locale, dto ) {
         if ( !dto[HAS]('Z') )
         {
            dto.Z = '(-?[0-9]{5})';
         }
         return dto.Z;
    }
    // Timezone identifier; e.g. Atlantic/Azores, ...
    ,e: function( locale, dto ) {
         if ( !dto[HAS]('e') )
         {
            dto.e = '(' + get_alternate_pattern( locale.timezone /*|| date_locale_default.timezone*/ ) + ')';
         }
         return dto.e;
    }
    // Timezone abbreviation; e.g. EST, MDT, ...
    ,T: function( locale, dto ) {
         if ( !dto[HAS]('T') )
         {
            dto.T = '(' + get_alternate_pattern( locale.timezone_short /*|| date_locale_default.timezone_short*/ ) + ')';
         }
         return dto.T;
    }

    // Full Date/Time --
    // Seconds since UNIX epoch
    ,U: function( locale, dto ) {
         if ( !dto[HAS]('U') )
         {
            dto.U = '([0-9]{1,8})';
         }
         return dto.U;
    }
    // ISO-8601 date. Y-m-d\\TH:i:sP
    ,c: function( locale, dto ) {
         if ( !dto[HAS]('c') )
         {
            dto.c = date_patterns.Y(locale, dto)+'-'+date_patterns.m(locale, dto)+'-'+date_patterns.d(locale, dto)+'\\\\'+date_patterns.T(locale, dto)+date_patterns.H(locale, dto)+':'+date_patterns.i(locale, dto)+':'+date_patterns.s(locale, dto)+date_patterns.P(locale, dto);
         }
         return dto.c;
    }
    // RFC 2822 D, d M Y H:i:s O
    ,r: function( locale, dto ) {
         if ( !dto[HAS]('r') )
         {
            dto.r = date_patterns.D(locale, dto)+',\\s'+date_patterns.d(locale, dto)+'\\s'+date_patterns.M(locale, dto)+'\\s'+date_patterns.Y(locale, dto)+'\\s'+date_patterns.H(locale, dto)+':'+date_patterns.i(locale, dto)+':'+date_patterns.s(locale, dto)+'\\s'+date_patterns.O(locale, dto);
         }
         return dto.r;
    }
    },
    
    // (php) date formats
    // http://php.net/manual/en/function.date.php
    date_parsers = {
    // Day --
    // Day of month w/leading 0; 01..31
     d: function( d, locale, dto ) {
         d = parseInt('0' === d.charAt(0) ? d.slice(1) : d, 10);
         if ( d < 1 || d > 31 ) return false;
         if ( dto[HAS]('day') && d !== dto.day ) return false;
         dto.day = d;
     }
    // Shorthand day name; Mon...Sun
    ,D: function( D, locale, dto ) {
         D = locale.day_short.indexOf( D );
         if ( D < 0 ) return false;
         if ( dto[HAS]('day_week') && D !== dto.day_week ) return false;
         dto.day_week = D;
     }
    // Day of month; 1..31
    ,j: function( j, locale, dto ) {
         j = parseInt(j, 10);
         if ( j < 1 || j > 31 ) return false;
         if ( dto[HAS]('day') && j !== dto.day ) return false;
         dto.day = j;
     }
    // Full day name; Monday...Sunday
    ,l: function( l, locale, dto ) {
         l = locale.day.indexOf( l );
         if ( l < 0 ) return false;
         if ( dto[HAS]('day_week') && l !== dto.day_week ) return false;
         dto.day_week = l;
     }
    // ISO-8601 day of week; 1[Mon]..7[Sun]
    ,N: function( N, locale, dto ) {
         N = parseInt(N, 10);
         if ( N < 1 || N > 7 ) return false;
         if ( 7 === N ) N = 0;
         if ( dto[HAS]('day_week') && N !== dto.day_week ) return false;
         dto.day_week = N;
     }
    // Ordinal suffix for day of month; st, nd, rd, th
    ,S: null
    // Day of week; 0[Sun]..6[Sat]
    ,w: function( w, locale, dto ) {
         w = parseInt(w, 10);
         if ( w < 0 || w > 6 ) return false;
         if ( dto[HAS]('day_week') && w !== dto.day_week ) return false;
         dto.day_week = w;
     }
    // Day of year; 0..365(6)
    ,z: function( z, locale, dto ) {
         z = parseInt(z, 10);
         if ( z < 0 || z > 366 ) return false;
         if ( dto[HAS]('day_year') && z !== dto.day_year ) return false;
         dto.day_year = z;
     }

    // Week --
    // ISO-8601 week number
    ,W: function( W, locale, dto ) {
         W = parseInt(W, 10);
         if ( W < 1 || W > 53 ) return false;
         if ( dto[HAS]('week_year') && W !== dto.week_year ) return false;
         dto.week_year = W;
     }

    // Month --
    // Full month name; January...December
    ,F: function( F, locale, dto ) {
         F = locale.month.indexOf( F );
         if ( F < 0 ) return false;
         if ( dto[HAS]('month') && F+1 !== dto.month ) return false;
         dto.month = F+1;
     }
    // Month w/leading 0; 01...12
    ,m: function( m, locale, dto ) {
         m = parseInt('0' === m.charAt(0) ? m.slice(1) : m, 10);
         if ( m < 1 || m > 12 ) return false;
         if ( dto[HAS]('month') && m !== dto.month ) return false;
         dto.month = m;
     }
    // Shorthand month name; Jan...Dec
    ,M: function( M, locale, dto ) {
         M = locale.month_short.indexOf( M );
         if ( M < 0 ) return false;
         if ( dto[HAS]('month') && M+1 !== dto.month ) return false;
         dto.month = M+1;
     }
    // Month; 1...12
    ,n: function( n, locale, dto ) {
         n = parseInt(n, 10);
         if ( n < 1 || n > 12 ) return false;
         if ( dto[HAS]('month') && n !== dto.month ) return false;
         dto.month = n;
     }
    // Days in month; 28...31
    ,t: function( t, locale, dto ) {
         t = parseInt(t, 10);
         if ( t < 28 || t > 31 ) return false;
         if ( dto[HAS]('days_month') && t !== dto.days_month ) return false;
         dto.days_month = t;
     }
    
    // Year --
    // Is leap year?; 0 or 1
    ,L: function( L, locale, dto ) {
         if ( '0' === L ) dto.leap = 0;
         else if ( '1' === L ) dto.leap = 1;
         else return false;
     }
    // ISO-8601 year
    ,o: null
    // Full year; e.g. 1980...2010
    ,Y: function( Y, locale, dto ) {
         Y = parseInt(Y, 10);
         if ( Y < 1000 || Y > 3000 ) return false;
         if ( dto[HAS]('year') && Y !== dto.year ) return false;
         dto.year = Y;
     }
    // Last two digits of year; 00...99
    ,y: function( y, locale, dto ) {
         if ( 2 === y.length )
         {
            // http://php.net/manual/en/function.strtotime.php
            if ( '00' <= y && '69' >= y ) y = '20' + y;
            else if ( '70' <= y && '99' >= y ) y = '19' + y;
         }
         y = parseInt(y , 10);
         if ( y < 1000 || y > 3000 ) return false;
         if ( dto[HAS]('year') && y !== dto.year ) return false;
         dto.year = y;
     }

    // Time --
    // am or pm
    ,a: function( a, locale, dto ) {
        if ( locale.meridian.am === a ) a = 'am';
        else if ( locale.meridian.pm === a ) a = 'pm';
        else return false;
        if ( dto[HAS]('meridian') && a !== dto.meridian ) return false;
        dto.meridian = a;
     }
    // AM or PM
    ,A: function( A, locale, dto ) {
        if ( locale.meridian.AM === A ) A = 'am';
        else if ( locale.meridian.PM === A ) A = 'pm';
        else return false;
        if ( dto[HAS]('meridian') && A !== dto.meridian ) return false;
        dto.meridian = A;
     }
    // Swatch Internet time; 000..999
    ,B: null
    // 12-Hours; 1..12
    ,g: function( g, locale, dto ) {
        g = parseInt(g, 10);
        if ( g < 1 || g > 12 ) return false;
        if ( dto[HAS]('hour_12') && g !== dto.hour_12 ) return false;
        dto.hour_12 = g;
     }
    // 24-Hours; 0..23
    ,G: function( G, locale, dto ) {
        G = parseInt(G, 10);
        if ( G < 0 || G > 23 ) return false;
        if ( dto[HAS]('hour') && G !== dto.hour ) return false;
        dto.hour = G;
     }
    // 12-Hours w/leading 0; 01..12
    ,h: function( h, locale, dto ) {
        h = parseInt('0' === h.charAt(0) ? h.slice(1) : h, 10);
        if ( h < 1 || h > 12 ) return false;
        if ( dto[HAS]('hour_12') && h !== dto.hour_12 ) return false;
        dto.hour_12 = h;
     }
    // 24-Hours w/leading 0; 00..23
    ,H: function( H, locale, dto ) {
        H = parseInt('0' === H.charAt(0) ? H.slice(1) : H, 10);
        if ( H < 0 || H > 23 ) return false;
        if ( dto[HAS]('hour') && H !== dto.hour ) return false;
        dto.hour = H;
     }
    // Minutes w/leading 0; 00..59
    ,i: function( i, locale, dto ) {
        i = parseInt('0' === i.charAt(0) ? i.slice(1) : i, 10);
        if ( i < 0 || i > 59 ) return false;
        if ( dto[HAS]('minute') && i !== dto.minute ) return false;
        dto.minute = i;
     }
    // Seconds w/leading 0; 00..59
    ,s: function( s, locale, dto ) {
        s = parseInt('0' === s.charAt(0) ? s.slice(1) : s, 10);
        if ( s < 0 || s > 59 ) return false;
        if ( dto[HAS]('second') && s !== dto.second ) return false;
        dto.second = s;
     }
    // Microseconds; 000000-999000
    ,u: function( u, locale, dto ) {
        var p = 0;
        while (u.length > 1 && '0'===u.charAt(p)) p++;
        u = parseInt(u.slice(p), 10);
        u = ~~(u/1000);
        if ( u < 0 || u > 999 ) return false;
        if ( dto[HAS]('ms') && u !== dto.ms ) return false;
        dto.ms = u;
     }

    // Timezone --
    // Timezone identifier; e.g. Atlantic/Azores, ...
    ,e: null
    // DST observed?; 0 or 1
    ,I: null
    // Difference to GMT in hour format; e.g. +0200
    ,O: null
    // Difference to GMT w/colon; e.g. +02:00
    ,P: null
    // Timezone abbreviation; e.g. EST, MDT, ...
    ,T: null
    // Timezone offset in seconds (-43200...50400)
    ,Z: null

    // Full Date/Time --
    // Seconds since UNIX epoch
    ,U: function( U, locale, dto ) {
        U = parseInt(U, 10);
        if ( U < 0 ) return false;
        U *= 1000;
        if ( dto[HAS]('time') && U !== dto.time ) return false;
        dto.time = U;
     }
    // ISO-8601 date. Y-m-d\\TH:i:sP
    ,c: null // added below
    // RFC 2822 D, d M Y H:i:s O
    ,r: null // added below
    },
    
    date_formatters = { 
    // 24-Hours; 0..23
    G: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('G') ) 
        {
            dto.G = jsdate.getHours( );
        }
        return dto.G;
    }
    // Day of month; 1..31
    ,j: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('j') ) 
        {
            dto.j = jsdate.getDate( );
            dto.jmod10 = dto.j%10;
        }
        return dto.j;
    }
    // Month; 1...12
    ,n: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('n') ) 
        {
            dto.n = jsdate.getMonth( )+1;
        }
        return dto.n;
    }
    // Full year; e.g. 1980...2010
    ,Y: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('Y') ) 
        {
            dto.Y = jsdate.getFullYear( );
        }
        return dto.Y;
    }
    // Day of week; 0[Sun]..6[Sat]
    ,w: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('w') ) 
        {
            dto.w = jsdate.getDay( );
        }
        return dto.w;
    }
    // ISO-8601 day of week; 1[Mon]..7[Sun]
    ,N: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('N') ) 
        {
            dto.N = date_formatters.w(jsdate, locale, dto)||7;
        }
        return dto.N;
    }
    // Day of month w/leading 0; 01..31
    ,d: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('d') ) 
        {
            dto.d = pad(date_formatters.j(jsdate, locale, dto), 2, '0');
        }
        return dto.d;
    }
    // Shorthand day name; Mon...Sun
    ,D: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('D') ) 
        {
            dto.D = locale.day_short[ date_formatters.w(jsdate, locale, dto) ];
        }
        return dto.D;
    }
    // Full day name; Monday...Sunday
    ,l: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('l') ) 
        {
            dto.l = locale.day[ date_formatters.w(jsdate, locale, dto) ];
        }
        return dto.l;
    }
    // Ordinal suffix for day of month; st, nd, rd, th
    ,S: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('S') ) 
        {
            var j = date_formatters.j(jsdate, locale, dto), jmod10 = dto.jmod10;
            dto.S = locale.ordinal.ord[ j ] ? locale.ordinal.ord[ j ] : (locale.ordinal.ord[ jmod10 ] ? locale.ordinal.ord[ jmod10 ] : locale.ordinal.nth);
        }
        return dto.S;
    }
    // Day of year; 0..365
    ,z: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('z') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto)
            ,m = date_formatters.n(jsdate, locale, dto)
            ,j = date_formatters.j(jsdate, locale, dto);
            dto.z = round((new Date(Y, m-1, j) - new Date(Y, 0, 1)) / 864e5);
        }
        return dto.z;
    }
    // ISO-8601 week number
    ,W: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('W') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto)
            ,m = date_formatters.n(jsdate, locale, dto)
            ,N = date_formatters.N(jsdate, locale, dto)
            ,j = date_formatters.j(jsdate, locale, dto);
            dto.W = pad(1 + round((new Date(Y, m-1, j - N + 3) - new Date(Y, 0, 4)) / 864e5 / 7), 2, '0');
        }
        return dto.W;
    }
    // Full month name; January...December
    ,F: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('F') ) 
        {
            var m = date_formatters.n(jsdate, locale, dto);
            dto.F = locale.month[ m-1 ];
        }
        return dto.F;
    }
    // Month w/leading 0; 01...12
    ,m: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('m') ) 
        {
            var n = date_formatters.n(jsdate, locale, dto);
            dto.m = pad(n, 2, '0');
        }
        return dto.m;
    }
    // Shorthand month name; Jan...Dec
    ,M: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('M') ) 
        {
            var m = date_formatters.n(jsdate, locale, dto);
            dto.M = locale.month_short[ m-1 ];
        }
        return dto.M;
    }
    // Days in month; 28...31
    ,t: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('t') ) 
        {
            var m = date_formatters.n(jsdate, locale, dto), Y = date_formatters.Y(jsdate, locale, dto);
            dto.t = (new Date(Y, m, 0)).getDate( );
        }
        return dto.t;
    }
    // Is leap year?; 0 or 1
    ,L: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('L') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto);
            dto.L = (Y % 4 === 0) & (Y % 100 !== 0) | (Y % 400 === 0);
        }
        return dto.L;
    }
    // ISO-8601 year
    ,o: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('o') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto), m = date_formatters.n(jsdate, locale, dto),
                W = date_formatters.W(jsdate, locale, dto);
            dto.o = Y + (12 === m && W < 9 ? 1 : (1 === m && W > 9 ? -1 : 0));
        }
        return dto.o;
    }
    // Last two digits of year; 00...99
    ,y: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('y') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto);
            dto.y = Y.toString( ).slice(-2);
        }
        return dto.y;
    }
    // am or pm
    ,a: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('a') ) 
        {
            var G = date_formatters.G(jsdate, locale, dto);
            dto.a = G > 11 ? locale.meridian.pm : locale.meridian.am;
        }
        return dto.a;
    }
    // AM or PM
    ,A: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('A') ) 
        {
            var G = date_formatters.G(jsdate, locale, dto);
            dto.A = G > 11 ? locale.meridian.PM : locale.meridian.AM;
        }
        return dto.A;
    }
    // Swatch Internet time; 000..999
    ,B: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('B') ) 
        {
            dto.B = pad(floor((jsdate.getUTCHours( ) * 36e2 + jsdate.getUTCMinutes( ) * 60 + jsdate.getUTCSeconds( ) + 36e2) / 86.4) % 1e3, 3, '0');
        }
        return dto.B;
    }
    // 12-Hours; 1..12
    ,g: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('g') ) 
        {
            var G = date_formatters.G(jsdate, locale, dto);
            dto.g = (G % 12) || 12;
        }
        return dto.g;
    }
    // 12-Hours w/leading 0; 01..12
    ,h: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('h') ) 
        {
            var g = date_formatters.g(jsdate, locale, dto);
            dto.h = pad(g, 2, '0');
        }
        return dto.h;
    }
    // 24-Hours w/leading 0; 00..23
    ,H: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('H') ) 
        {
            var G = date_formatters.G(jsdate, locale, dto);
            dto.H = pad(G, 2, '0');
        }
        return dto.H;
    }
    // Minutes w/leading 0; 00..59
    ,i: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('i') ) 
        {
            dto.i = pad(jsdate.getMinutes( ), 2, '0');
        }
        return dto.i;
    }
    // Seconds w/leading 0; 00..59
    ,s: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('s') ) 
        {
            dto.s = pad(jsdate.getSeconds( ), 2, '0');
        }
        return dto.s;
    }
    // Microseconds; 000000-999000
    ,u: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('u') ) 
        {
            dto.u = pad(jsdate.getMilliseconds( ) * 1000, 6, '0');
        }
        return dto.u;
    }
    // Timezone identifier; e.g. Atlantic/Azores, ...
    // The following works, but requires inclusion of the very large
    // timezone_abbreviations_list() function.
    /*              return that.date_default_timezone_get();
    */
    ,e: function( jsdate, locale, dto ) {
        return '';
    }
    // DST observed?; 0 or 1
    ,I: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('I') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto);
            dto.I = ((new Date(Y, 0) - Date.UTC(Y, 0)) !== (new Date(Y, 6) - Date.UTC(Y, 6))) ? 1 : 0;
        }
        return dto.I;
    }
    // Difference to GMT in hour format; e.g. +0200
    ,O: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('O') ) 
        {
            var tzo = jsdate.getTimezoneOffset( ), atzo = abs(tzo);
            dto.O = (tzo > 0 ? "-" : "+") + pad(floor(atzo / 60) * 100 + atzo % 60, 4, '0');
        }
        return dto.O;
    }
    // Difference to GMT w/colon; e.g. +02:00
    ,P: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('P') ) 
        {
            var O = date_formatters.O(jsdate, locale, dto);
            dto.P = O.substr(0, 3) + ":" + O.substr(3, 2);
        }
        return dto.P;
    }
    // Timezone abbreviation; e.g. EST, MDT, ...
    ,T: function( jsdate, locale, dto ) {
        return 'UTC';
    }
    // Timezone offset in seconds (-43200...50400)
    ,Z: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('Z') ) 
        {
            dto.Z = -jsdate.getTimezoneOffset( ) * 60;
        }
        return dto.Z;
    }
    // Seconds since UNIX epoch
    ,U: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('U') ) 
        {
            dto.U = jsdate / 1000 | 0;
        }
        return dto.U;
    }
    // ISO-8601 date. 'Y-m-d\\TH:i:sP'
    ,c: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('c') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto)
            ,m = date_formatters.m(jsdate, locale, dto)
            ,d = date_formatters.d(jsdate, locale, dto)
            ,T = date_formatters.T(jsdate, locale, dto)
            ,H = date_formatters.H(jsdate, locale, dto)
            ,u = date_formatters.i(jsdate, locale, dto)
            ,s = date_formatters.s(jsdate, locale, dto)
            ,P = date_formatters.P(jsdate, locale, dto);
            dto.c = [ Y,'-',m,'-',d,'\\',T,H,':',i,':',s,P ].join('');
        }
        return dto.c;
    }
    // RFC 2822 'D, d M Y H:i:s O'
    ,r: function( jsdate, locale, dto ) {
        if ( !dto[HAS]('r') ) 
        {
            var Y = date_formatters.Y(jsdate, locale, dto)
            ,M = date_formatters.M(jsdate, locale, dto)
            ,D = date_formatters.D(jsdate, locale, dto)
            ,d = date_formatters.d(jsdate, locale, dto)
            ,H = date_formatters.H(jsdate, locale, dto)
            ,u = date_formatters.i(jsdate, locale, dto)
            ,s = date_formatters.s(jsdate, locale, dto)
            ,O = date_formatters.O(jsdate, locale, dto);
            dto.r = [ D,', ',d,' ',M,' ',Y,' ',H,':',i,':',s,' ',O ].join('');
        }
        return dto.r;
    }
    },
    
    esc_re = function( s ) { 
        return s.replace(ESCAPED_RE, "\\$&"); 
    },

    by_length_desc = function( a, b ) {
        return b.length - a.length;
    },

    get_alternate_pattern = function( alts ) {
        return alts.sort( by_length_desc ).map( esc_re ).join( '|' );
    },

    pad = function( s, len, ch ) {
        var sp = s.toString( ), n = len-sp.length;
        return n > 0 ? new Array(n+1).join(ch||' ')+sp : sp;
    },

    get_date_pattern = function( format, locale ) {
        locale = locale || date_locale_default;
        var re = '', f, i, l, group = 0, dto={};
        for (i=0,l=format.length; i<l; i++)
        {
            f = format.charAt( i );
            re += date_patterns[HAS](f) ? date_patterns[f]( locale, dto ) : esc_re( f );
        }
        return new RegExp('^'+re+'$','');
    },

    get_date_parser = function( format, locale ) {
        locale = locale || date_locale_default;
        var date_pattern = get_date_pattern( format, locale ), 
            f, i, l, j, group = 0, capture = {};
        for (i=0,l=format.length; i<l; i++)
        {
            f = format.charAt( i );
            if ( date_parsers[HAS](f) )
            {
                if ( date_parsers[f] )
                {
                    if ( date_parsers[f].push )
                    {
                        for (j=0; j<date_parsers[f].length; j++)
                        {
                            if ( null === date_parsers[f][j] )
                            {
                                // just skip a group
                                ++group;
                            }
                            else
                            {
                                capture[++group] = date_parsers[f][j];
                            }
                        }
                    }
                    else
                    {
                        capture[++group] = date_parsers[f];
                    }
                }
                else
                {
                    // just skip a group
                    ++group;
                }
            }
        }
        return function( date_string ) {
            var i, r, m = date_string.match( date_pattern ), dto;
            if ( !m ) return false;
            dto = {};
            for (i=1; i<m.length; i++)
            {
                if ( capture[HAS](i) )
                {
                    r = capture[i]( m[i], locale, dto );
                    if ( false === r ) return false;
                }
            }
            return check_and_create_date( dto );
        };
    },

    get_formatted_date = function( d, format, locale ) {
        var formatted_datetime, f, i, l, jsdate, dto;
        
        if ( d.substr ) return d; // already string format, return it
        
        // undefined
        if ( null == d ) jsdate = new Date( );
        // JS Date
        else if ( d instanceof Date ) jsdate = new Date( d );
        // UNIX timestamp (auto-convert to int)
        else if ( "number" === typeof d ) jsdate =  new Date(d * 1000);
        
        locale = locale || date_locale_default;
        formatted_datetime = '';
        dto = {};
        for (i=0,l=format.length; i<l; i++)
        {
            f = format.charAt( i );
            formatted_datetime += date_formatters[HAS](f) ? date_formatters[f]( jsdate, locale, dto ) : f;
        }
        return formatted_datetime;
    },

    check_and_create_date = function( dto, defaults ) {
        var year, month, day, 
            hour, minute, second, ms,
            leap=0, days_in_month=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            date=null, time=null, now=new Date( );
        
        defaults = defaults || {};
        
        if ( dto[HAS]('time') ) 
        {
            time = new Date( dto.time );
            // only time given create full date from unix time
            if ( !dto[HAS]('year') && !dto[HAS]('month') && !dto[HAS]('day') ) 
                date = new Date( time );
        }
        
        if ( null === date )
        {
        if ( dto[HAS]('ms') ) ms = dto.ms;
        else if ( defaults[HAS]('ms') ) ms = defaults.ms;
        else ms = 0;
        if ( dto[HAS]('second') ) second = dto.second;
        else if ( defaults[HAS]('second') ) second = defaults.second;
        else second = 0;
        if ( dto[HAS]('minute') ) minute = dto.minute;
        else if ( defaults[HAS]('minute') ) minute = defaults.minute;
        else minute = 0;
        if ( dto[HAS]('hour') ) hour = dto.hour;
        else
        {
            if ( dto[HAS]('hour_12') )
                hour = 'pm' === dto.meridian ? 11+dto.hour_12 : dto.hour_12-1;
            else if ( defaults[HAS]('hour') ) hour = defaults.hour;
            else hour = 'pm' === dto.meridian ? 12 : 0;
        }
        
        if ( dto[HAS]('day') ) day = dto.day;
        else if ( defaults[HAS]('day') ) day = defaults.day;
        else day = now.getDate( );
        if ( dto[HAS]('month') ) month = dto.month;
        else if ( defaults[HAS]('month') ) month = defaults.month;
        else month = now.getMonth( )+1;
        if ( dto[HAS]('year') ) year = dto.year;
        else if ( defaults[HAS]('year') ) year = defaults.year;
        else year = now.getFullYear( );
        
        // http://php.net/manual/en/function.checkdate.php
        if ( 0 > ms || 999 < ms ) return false;
        if ( 0 > second || 59 < second ) return false;
        if ( 0 > minute || 59 < minute ) return false;
        if ( 0 > hour || 23 < hour ) return false;
        
        if ( 1 > year || year > 32767 ) return false;
        leap = (year%4 === 0) & (year%100 !== 0) | (year%400 === 0);
        if ( dto[HAS]('leap') && leap !== dto.leap ) return false;
        days_in_month[1]+=leap;
        if ( 1 > month || month > 12 ) return false;
        if ( 1 > day || day > days_in_month[month-1] ) return false;
        
        date = new Date(year, month-1, day, hour, minute, second, ms);
        
        if ( dto[HAS]('day_week') && dto.day_week !== date.getDay() ) return false;
        if ( dto[HAS]('day_year') && dto.day_year !== round((new Date(year, month-1, day) - new Date(year, 0, 1)) / 864e5) ) return false;
        if ( dto[HAS]('days_month') && dto.days_month !== days_in_month[month-1] ) return false;
        if ( dto[HAS]('meridian') && ((hour > 11 && 'am' === dto.meridian) || (hour <= 11 && 'pm' === dto.meridian)) ) return false;
        
        if ( null !== time )
        {
            if ( date.getFullYear() !== time.getFullYear() ) return false;
            if ( date.getMonth() !== time.getMonth() ) return false;
            if ( date.getDate() !== time.getDate() ) return false;
            if ( date.getHours() !== time.getHours() ) return false;
            if ( date.getHours() !== time.getHours() ) return false;
            if ( date.getMinutes() !== time.getMinutes() ) return false;
            if ( date.getSeconds() !== time.getSeconds() ) return false;
        }
        }
        
        return date;
    }
;

date_parsers.c = [
     date_parsers.Y
    ,date_parsers.m
    ,date_parsers.d
    ,null
    ,date_parsers.H
    ,date_parsers.i
    ,date_parsers.s
    ,null
];
date_parsers.r = [
     date_parsers.D
    ,date_parsers.d
    ,date_parsers.M
    ,date_parsers.Y
    ,date_parsers.H
    ,date_parsers.i
    ,date_parsers.s
    ,null
];

var datetime_encoder = function( d, pikaday ) {
    var opts = pikaday._o, format = opts.format,
        locale = opts.datetimelocale || date_locale_default;
    return get_formatted_date( d, format, locale );
};
var datetime_decoder = function( d, pikaday ) {
    var opts = pikaday._o, format = opts.format,
        locale = opts.datetimelocale || date_locale_default;
    return get_date_parser( format, locale )( d );
};


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

Pikaday.default_locale = date_locale_default;
Pikaday.date_encoder = datetime_encoder;
Pikaday.date_decoder = datetime_decoder;

return Pikaday;
})();

$.htmlwidget.suggest = (function(){
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

widget2jquery( 'morphable', $.htmlwidget.morphable );
widget2jquery( 'delayable', $.htmlwidget.delayable );
widget2jquery( 'disabable', $.htmlwidget.disabable );
widget2jquery( 'datetime', $.htmlwidget.datetime );
widget2jquery( 'suggest', $.htmlwidget.suggest );
if ( HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}

$(function(){
    /*
    // controllers
    $('body')
    .on('change', 'input[data-controller]', function(evt){
        var controlled = $($(this).attr('data-controller'));
        if ( this.checked ) 
            controlled.addClass('widget-controller-checked');
        else
            controlled.removeClass('widget-controller-checked');
    })
    .on('change', 'input[data-synchronise]', function(evt){
        var synchronised = $($(this).attr('data-synchronise')),
            type = this.type.toLowerCase();
        if ( 'checkbox' === type || "radio" === type )
            synchronised.prop("checked", this.checked);
        else
            synchronised.val(this.value);
    });
    $('input[data-controller]').trigger('change');
    $('input[data-synchronise]').trigger('change');
    */
    
    $('.widget-delayable').delayable( );
    $('.widget-disabable').disabable( );
    //$('.widget-morphable').morphable( );
});


}(jQuery, 'undefined' !== HtmlWidget ? HtmlWidget : null);