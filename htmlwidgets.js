/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, SelectorListener, jQuery
*  @version: 0.8.2
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/modelview-widgets
*  https://github.com/foo123/SelectorListener
*
**/
!function( root, name, factory ) {
"use strict";
if ( 'object' === typeof exports )
    // CommonJS module
    module.exports = factory( );
else if ( 'function' === typeof define && define.amd )
    // AMD. Register as an anonymous module.
    define(function( req ) { return factory( ); });
else
    root[name] = factory( );
}(this, 'htmlwidget', function( undef ) {
"use strict";

var $ = jQuery, htmlwidget = {VERSION: "0.8.2", widget: {}},
HAS = 'hasOwnProperty', PROTO = 'prototype', ID = 0,
slice = Array[PROTO].slice,
json_decode = JSON.parse, json_encode = JSON.stringify,
toString = Object[PROTO].toString;

// http://davidwalsh.name/add-rules-stylesheets
function add_css( style, css )
{
    if ( "object" === typeof css )
    {
        var n, declaration, i = 0, selector, rules, index;
        for (n in css)
        {
            if ( !css[HAS](n) ) continue;
            declaration = css[ n ];
            selector = declaration.selector;
            rules = [].concat(declaration.rules).join('; ');
            index = i++;
            if ( "insertRule" in style.sheet ) 
            {
                style.sheet.insertRule( selector + "{" + rules + "}", index );
                declaration.css = style.sheet.cssRules[ index ];
            }
            else if ( "addRule" in style.sheet ) 
            {
                style.sheet.addRule( selector, rules, index );
                declaration.css = style.sheet.rules[ index ];
            }
        }
    }
    return css;
}
function create_style( document, media, css )
{
    // Create the <style> tag
    var style = document.createElement("style");
    // Add a media (and/or media query) here if you'd like!
    style.setAttribute("media", media || "all");
    style.setAttribute("type", "text/css");
    // WebKit hack :(
    style.appendChild( document.createTextNode("") );
    // Add the <style> element to the page
    document.head.appendChild( style );
    if ( css ) add_css( style, css );
    return style;
}
function dispose_style( document, style )
{
    if ( style ) document.head.removeChild( style );
}


/*if ( 'undefined' !== typeof HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}*/

//$.htmlwidget = htmlwidget;

// adapted from jquery-ui
function widget2jquery( name, widget, spr )
{
    var super_ = spr && spr[PROTO] ? spr[PROTO] : null;
    $.fn[ name ] = function( options ) {
        var method = "string" === typeof options ? options : false,
            args = slice.call( arguments, 1 ), return_value = this, method_;

        if ( method ) 
        {
            this.each(function( ){
                var method_value,
                    widget_inst = $.data( this, name );

                if ( "widget" === method )
                {
                    return_value = widget_inst;
                    return false;
                }
                else if ( "instance" === method )
                {
                    return_value = widget_inst ? widget_inst.instance || widget_inst : widget_inst;
                    return false;
                }
                
                if ( !widget_inst ) return false;
                
                if ( "dispose" === method || "destroy" === method ) 
                {
                    if ( 'function' === typeof widget_inst.dispose ) widget_inst.dispose( );
                    else if ( 'function' === typeof widget_inst.destroy ) widget_inst.destroy( );
                    else if ( super_ )
                    {
                        if ( 'function' === typeof super_.dispose ) super_.dispose.call( widget_inst )
                        else if ( 'function' === typeof super_.destroy ) super_.destroy.call( widget_inst )
                    }
                    widget_inst = null;
                    $.removeData( this, name );
                    return false;
                }
                
                method_ = widget_inst[ method ] || (super_ && super_[ method ]);
                if ( 'function' !== typeof method_ ) return false;

                method_value = method_.apply( widget_inst, args );
                if ( method_value !== widget_inst && undef !== method_value ) 
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
            options = options || {};
            this.each(function( ){
                var widget_inst = $.data( this, name );
                if ( widget_inst ) 
                {
                    method_ = widget_inst.options ||  (super_ && super_.options);
                    if ( 'function' === typeof method_ ) method_.call( widget_inst, options );
                } 
                else 
                {
                    $.data( this, name, widget_inst = new widget( this, options ) );
                    method_ = widget_inst.init ||  (super_ && super_.init);
                    if ( 'function' === typeof method_ ) method_.call( widget_inst );
                }
            });
        }
        return return_value;
    };
}
htmlwidget.make = widget2jquery;

// some useful widgets
htmlwidget.stylable = function stylable( document, id, selector, css, media ) {
    var self = this;
    if ( !(self instanceof stylable) ) return new stylable(document, id, selector, css, media);
    
    var style = {id:{selector:selector,rules:null}};
    self.id = id;
    self.selector = selector;
    self.rules = [];
    for (var prop in css) css[HAS](prop) && self.rules.push( prop + ':' + css[prop] );
    style[id].rules = self.rules;
    self.sheet = create_style( document, media||'all', style );
    self.sheet.setAttribute('id', self.id);
    self.style = style[id].css;
    
    self.dispose = function( ) {
        self.id = null;
        self.selector = null;
        self.rules = null;
        self.style = null;
        if ( self.sheet ) dispose_style( document, self.sheet );
        self.sheet = null;
    };
};

widget2jquery('selectable', htmlwidget.selectable=function selectable( el, options ){
    var self = this;
    if ( !(self instanceof selectable) ) return new selectable(el, options);
    self.init = function( ) {
        var $el = $(el),
            handle = $el.attr('data-selectable-handle')||options.handle||'.w-selectable-handle',
            item = options.selector||options.item
        ;
        if ( !$el.hasClass('w-selectable') ) $el.addClass('w-selectable');
        $el.on('click.selectable change.selectable', handle, function( evt ){
            var el = this, $el = $(this), type = (el.type||'').toLowerCase();
            if ( 'checkbox' === type || 'radio' === type )
            {
                if ( !!item ) $el = $el.closest( item );
                if ( el.checked )
                {
                    $el.addClass('w-selected');
                    $el.trigger('selected');
                }
                else
                {
                    $el.removeClass('w-selected');
                    $el.trigger('deselected');
                }
            }
            else if ( 'click' === evt.type )
            {
                if ( !evt.shiftKey ) self.clear( );
                if ( !!item ) $el = $el.closest( item );
                if ( $el.hasClass('w-selected') )
                {
                    $el.removeClass('w-selected');
                    $el.trigger('deselected');
                }
                else
                {
                    $el.addClass('w-selected');
                    $el.trigger('selected');
                }
            }
        });
    };
    self.selected = function( ) {
        return $(el).find('.w-selected');
    };
    self.clear = function( ) {
        $(el).find('.w-selected').removeClass('w-selected');
    };
    self.dispose = function( ) {
        $(el).off('.selectable');
    };
});
widget2jquery('removable', htmlwidget.removable=function removable( el, options ){
    var self = this;
    if ( !(self instanceof removable) ) return new removable(el, options);
    self.init = function( ) {
        var $el = $(el),
            handle = $el.attr('data-removable-handle')||options.handle||'.w-removable-handle',
            item = $el.attr('data-removable-item')||options.selector||options.item,
            animation = parseInt($el.attr('data-removable-animation')||options.animation||400,10)
        ;
        if ( !$el.hasClass('w-removable') ) $el.addClass('w-removable');
        $el.on('click.removable', handle, function( ){
            var $el = $(this);
            if ( !!item ) $el = $el.closest( item );
            $el.fadeOut(animation, function( ){
               $el.trigger('removed');
               $el.remove( );
            });
        });
    };
    self.dispose = function( ) {
        $(el).off('.removable');
    };
});
widget2jquery('morphable', htmlwidget.morphable=function morphable( el, options ){
    var self = this;
    if ( !(self instanceof morphable) ) return new morphable(el, options);
    var cur_mode = null, style_sheet = null, css_styles = null;
    
    self.create = function( ) {
        var $el = $(el), cssStyles = {}, hideSelector, showSelector, mainSelector,
            modes = !!$el.attr('data-morphable-modes') ? $el.attr('data-morphable-modes').split(',') : [].concat(options.modes||[]),
            show_class = $el.attr('data-morphable-show') || options.showClass,
            hide_class = $el.attr('data-morphable-hide') || options.hideClass,
            mode_class = $el.attr('data-morphable-mode') || options.modeClass
        ;
        
        $el.addClass('w-morphable');
        mainSelector = '#' + $el.attr( "id" ) + '.w-morphable';
        hideSelector = []; showSelector = [];
        for(i=0; i<modes.length; i++)
        {
            if ( !!hide_class )
            {
                hideSelector.push(
                    mainSelector + '.' + mode_class.split('${MODE}').join(modes[i]) + ' .' + hide_class.split('${MODE}').join(modes[i])
                );
            }
            if ( !!show_class )
            {
                showSelector.push(
                    mainSelector + '.' + mode_class.split('${MODE}').join(modes[i]) + ' .' + show_class.split('${MODE}').join(modes[i])
                );
            }
            if ( !!show_class || !!hide_class )
            {
                for (j=0; j<modes.length; j++)
                {
                    if ( j === i ) continue;
                    if ( !!show_class )
                    {
                        hideSelector.push(
                            mainSelector + '.' + mode_class.split('${MODE}').join(modes[i]) + ' .' + show_class.split('${MODE}').join(modes[j]) + ':not(.' + show_class.split('${MODE}').join(modes[i]) + ')'
                        );
                    }
                    if ( !!hide_class )
                    {
                        showSelector.push(
                            mainSelector + '.' + mode_class.split('${MODE}').join(modes[i]) + ' .' + hide_class.split('${MODE}').join(modes[j]) + ':not(.' + hide_class.split('${MODE}').join(modes[i]) + ')'
                        );
                    }
                }
            }
        }
        if ( hideSelector.length )
        {
            cssStyles.hide_mode = {
                selector: hideSelector.join(','),
                rules: [
                    'display: none !important'
                ]
            }
        }
        if ( showSelector.length )
        {
            cssStyles.show_mode = {
                selector: showSelector.join(','),
                rules: [
                    'display: block'
                ]
            }
        }
        style_sheet = create_style( document, 'all', css_styles = cssStyles );
    },
    self.init = function( ) {
        if ( !$(el).hasClass('w-morphable') )
            self.create( );
    };
    self.morph = function( mode ) {
        if ( mode != cur_mode )
        {
            var $el = $(el),
                mode_class = $el.attr('data-morphable-mode')||options.modeClass
            ;
            if ( cur_mode ) $el.removeClass( mode_class.split('${MODE}').join(cur_mode) );
            cur_mode = mode;
            if ( cur_mode ) $el.addClass( mode_class.split('${MODE}').join(cur_mode) );
        }
    };
    self.mode = function( ) {
        return cur_mode;
    };
    self.dispose = function( ) {
        $(el).removeClass('w-morphable');
        css_styles = null;
        if ( style_sheet ) dispose_style( document, style_sheet );
        style_sheet = null;
    };
});
widget2jquery('delayable', htmlwidget.delayable=function delayable( el, options ){
    var self = this;
    if ( !(self instanceof delayable) ) return new delayable(el, options);
    self.init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') )  $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) $el.addClass('w-undelayed');
        if ( !$el.children('.w-delayable-overlay').length )
            $el.append('<div class="w-delayable-overlay"><div class="w-spinner w-spinner-dots"></div></div>');
    };
    self.enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-delayed') )
            $el.addClass('w-delayed').removeClass('w-undelayed');
    };
    self.disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') )
            $el.addClass('w-undelayed').removeClass('w-delayed');
    };
});
widget2jquery('disabable', htmlwidget.disabable=function disabable( el, options ){
    var self = this;
    if ( !(self instanceof disabable) ) return new disabable(el, options);
    self.init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') ) $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) $el.addClass('w-undelayed');
        if ( !$el.children('.w-disabable-overlay').length )
            $el.append('<div class="w-disabable-overlay"></div>');
    };
    self.enable = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-disabled') )
            $el.addClass('w-disabled').removeClass('w-undisabled');
    };
    self.disable = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-disabled') )
            $el.addClass('w-undisabled').removeClass('w-disabled');
    };
});
widget2jquery('sortable', htmlwidget.sortable=function sortable( el, options ){
    var self = this;
    if ( !(self instanceof sortable) ) return new sortable(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof Sortable )
        {
            var $el = $(el);
            self.instance = Sortable.create( el, {
                sort: true,
                disabled: false,
                delay: parseInt($el.attr('data-sortable-delay')||options.delay||0, 10),
                animation: parseInt($el.attr('data-sortable-animation')||options.animation||400, 10),
                draggable: $el.attr('data-sortable-item')||options.draggable||options.item||".w-sortable-item",
                handle: $el.attr('data-sortable-handle')|| options.handle||".w-sortable-handle"
            });
        }
    };
    self.dispose = function( ) {
        self.instance = null;
    };
});
widget2jquery('suggest', htmlwidget.suggest=function suggest( el, options ){
    var self = this;
    if ( !(self instanceof suggest) ) return new suggest(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof AutoComplete )
        {
            var $el = $(el),
                ajaxurl = $el.attr('data-suggest-ajax') || options.ajax || $el.attr('data-ajax') || null,
                dataType = $el.attr('data-suggest-data') || options.dataType || 'json',
                method = $el.attr('data-suggest-method') || options.method || 'GET',
                q = $el.attr('data-suggest-q') || $el.attr('data-suggest-param') || options.q || options.param || 'suggest',
                xhr = null
            ;
            self.instance = new AutoComplete(el, {
                minChars: $el.attr('data-suggest-min') || options.minChars || 3,
                key: $el.attr('data-suggest-key') || options.key || null,
                value: $el.attr('data-suggest-value') || options.value || null,
                delay: $el.attr('data-suggest-delay') || options.delay || 150,
                cache: $el.attr('data-suggest-cache') || 5*60*1000,
                menuClass: $el.attr('data-suggest-class') || options.menuClass || 'w-suggestions',
                source: function( term, suggest ) {
                    var wrapper = $el.closest('.w-wrapper'),
                        data = {
                            method: method,
                            dataType: dataType,
                            ajax: ajaxurl,
                            suggest: { }
                        }
                    ;
                    data.suggest[q] = term;
                    //var evt = $.Event( "suggest" );
                    
                    // allow to dynamicaly add suggest parameters
                    $el.trigger("suggest", data);
                    
                    if ( !!data.suggestions || !!data.list )
                    {
                        suggest( data.suggestions || data.list );
                    }
                    else if ( !!data.ajax )
                    {
                        wrapper.addClass('ajax');
                        // optimise multiple xhr requests
                        try { xhr && xhr.abort(); } catch(e){ }
                        xhr = $.ajax({
                            url:  data.ajax,
                            type: data.method,
                            method: data.method,
                            dataType: data.dataType,
                            data: data.suggest,
                            success: function( data ) {
                                wrapper.removeClass('ajax');
                                suggest( data );
                            },
                            error: function( ) {
                                wrapper.removeClass('ajax');
                                suggest( [] );
                            }
                        });
                    }
                    else
                    {
                        suggest( [] );
                    }
                },
                onSelect: function( evt, term, item, selected, key, value ) {
                    $el.trigger('suggest-select', {
                        q: term,
                        item: item,
                        key: key,
                        value: value
                    });
                }
            });
        }
    };
    self.suggestions = function( list ) {
        if ( self.instance ) self.instance.suggestions = list;
    };
    self.dispose = function( ) {
        if ( self.instance ) self.instance.dispose( );
        self.instance = null;
    };
});
widget2jquery('uploadable', htmlwidget.uploadable=function uploadable( el, options ){
    var self = this, thumbnail_size = 120;
    if ( !(self instanceof uploadable) ) return new uploadable(el, options);
    
    self.dispose = function( ) {
        var control = $(el);
        control.off('.uploadable');
        control = null;
    };
    self.init = function( ) {
        var control = $(el);
        control
        .on('click.uploadable', '.w-upload-thumbnail', function( evt ){
            var $imdata = control.find('._w-data'),
                imdata = control[0].imdata || (!!$imdata.val() ? json_decode($imdata.val()) : null);
                
            if ( !!imdata )
            {
                if ( !control[0].imdata ) control[0].imdata = imdata;
                window.open(
                    !!imdata.original ? imdata.original : imdata.image,
                    'preview_'+control.attr('id'),
                    'scrollbars=yes,resizable=yes,width='+imdata.width+',height='+imdata.height
                ).focus( );
            }
            return false;
        })
        .on('click.uploadable', '.w-upload-delete', function( evt ){
            control[0].imdata = null;
            control.find('img').attr('src','');
            control.find('._w-data').val('').trigger('change');
            return false;
        })
        .on('change.uploadable', 'input._w-uploader[type=file]', function( evt ){
            var $el = $(this), img_reader,
                file = evt.target.files[0] || null;
            if ( !file || !file.type.match('image') ) return false;
            img_reader = new FileReader( );
            img_reader.addEventListener("load", function( evt ){
                var img_src = evt.target.result, img = new Image( );
                img.addEventListener("load", function( ) {
                    // add a small delay
                    setTimeout(function( ){
                        var w = img.width, h = img.height,
                            tw = thumbnail_size, th = Math.round(thumbnail_size*h/w),
                            canvas = document.createElement('canvas'),
                            ctx = canvas.getContext('2d'), img_thumb;
                        canvas.width = tw; canvas.height = th;
                        ctx.drawImage(img, 0, 0, w, h, 0, 0, tw, th);
                        img_thumb = canvas.toDataURL("image/png");
                        control[0].imdata = {name:file.name, width:w, height:h, image:img_src, thumb:img_thumb};
                        control.find('img').attr('src', img_thumb);
                        control.find('._w-data').val( json_encode( control[0].imdata ) ).trigger('change');
                    }, 10);
                });
                img.src = img_src;
            });
            img_reader.readAsDataURL( file );
        })
        ;
    };
});
widget2jquery('datetimepicker', htmlwidget.datetimepicker=function datetimepicker( el, options ){
    var self = this;
    if ( !(self instanceof datetimepicker) ) return new datetimepicker(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof Pikadaytime )
        {
            var $el = $(el),
                format = $el.attr('data-datepicker-format')||options.format||'Y-m-d H:i:s',
                time_attr = ($el.attr('data-datepicker-time')||'').toLowerCase()
            ;
            self.instance = new Pikadaytime({
                field  : el,
                showTime: !!time_attr ? '1' === time_attr || 'true' === time_attr || 'on' === time_attr || 'yes' === time_attr: !!options.showTime,
                encoder: datetimepicker.encoder( format ),
                decoder: datetimepicker.decoder( format )
            });
        }
    };
    self.dispose = function( ) {
        if ( self.instance ) self.instance.dispose( );
        self.instance = null;
    };
});
// custom date codecs and locale
//htmlwidget.datetimepicker.locale = DateX.defaultLocale;
htmlwidget.datetimepicker.encoder = function datetime_encoder( format, locale )
{
    if ( 'function' === typeof DateX )
    {
        locale = locale || DateX.defaultLocale;
        return function( date/*, pikaday*/ ) {
            //var opts = pikaday._o;
            return DateX.format( date, format, locale );
        };
    }
    else
    {
        return function( date, pikaday ) {
            return pikaday._o.showTime ? date.toString() : date.toDateString();
        };
    }
};
htmlwidget.datetimepicker.decoder = function datetime_decoder( format, locale )
{
    if ( 'function' === typeof DateX )
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
widget2jquery('colorpicker', htmlwidget.colorpicker=function colorpicker( el, options ){
    var self = this;
    if ( !(self instanceof colorpicker) ) return new colorpicker(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof ColorPicker )
        {
            var $el = $(el);
            self.instance = new ColorPicker(el, {
                changeEvent: $el.attr('data-colorpicker-change')||options.changeEvent||'change',
                input: !!$el.attr('data-colorpicker-input') ? $($el.attr('data-colorpicker-input'))[0] : (!!options.input ? $(options.input)[0] : null),
                format: $el.attr('data-colorpicker-format')||options.format||'rgba',
                color: $el.attr('data-colorpicker-color')||options.color,
                opacity: $el.attr('data-colorpicker-opacity')||options.opacity
            });
        }
    };
    self.value = self.color = function( color, opacity ) {
        if ( self.instance )
        {
            if ( arguments.length )
            {
                self.instance.setColor( color, opacity );
                return;
            }
            else
            {
                return self.instance.getColor( );
            }
        }
    };
    self.dispose = function( ) {
        if ( self.instance ) self.instance.dispose( );
        self.instance = null;
    };
});
// http://nikos-web-development.netai.net
// http://maps.googleapis.com/maps/api/js?sensor=false
function add_map_marker( map, lat, lng, title, info, opts ) 
{ 
    // https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions
    var marker_options = {
        map: map,
        title: title,
        position: new google.maps.LatLng( lat, lng )
    }, marker, marker_popup;
    
    if ( 'undefined' !== opts.clickable ) marker_options.clickable = !!opts.clickable;
    if ( 'undefined' !== opts.draggable ) marker_options.draggable = !!opts.draggable;
    if ( 'undefined' !== opts.crossOnDrag ) marker_options.crossOnDrag = !!opts.crossOnDrag;
    if ( 'undefined' !== opts.visible ) marker_options.visible = !!opts.visible;
    if ( 'undefined' !== opts.icon ) marker_options.icon = opts.icon;
    if ( 'undefined' !== opts.zIndex ) marker_options.zIndex = opts.zIndex;
    if ( 'undefined' !== opts.shape ) marker_options.shape = opts.shape;
    
    marker = new google.maps.Marker( marker_options );
    
    if ( !!info )
    {
        marker_popup = new google.maps.InfoWindow({content: info});
        google.maps.event.addListener(marker, 'click', function( ){
            marker_popup.open( map, marker );
        });
    }
    
    return marker;
}
widget2jquery('gmap3', htmlwidget.gmap3=function gmap3( el, options ) {
    var self = this, gmap, zoom, c_lat, c_lng, responsive;
    if ( !(self instanceof gmap3) ) return new gmap3(el, options);
    
    gmap = null;
    
    //google.maps.MapTypeId.ROADMAP
    options = $.extend({
        type: "ROADMAP",
        markers: null,
        center: null,
        kml: null,
        responsive: false
    }, options||{});
    
    function on_resize( )
    {
        if ( gmap )
        {
            google.maps.event.addListenerOnce( gmap, 'idle', function( ){
                google.maps.event.trigger( gmap, 'resize' );
                gmap.setCenter( new google.maps.LatLng( c_lat, c_lng ) );
            });
        }
    }
    
    self.dispose = function( ) {
        if ( responsive ) $(el.parentNode||document.body).off( 'resize', on_resize );
        // http://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance
        gmap = null;
    };
    self.init = function( ) {
        var $el = $(el),
            center = !!$el.attr('data-map-center') ? $el.attr('data-map-center').split(',') : options.center || [0,0],
            zoom = parseInt($el.attr('data-map-zoom')||options.zoom||6, 10),
            type = $el.attr('data-map-type')||options.type||"ROADMAP";
        ;
            c_lat = parseFloat(center[0]||0, 10); c_lng = parseFloat(center[1]||0, 10);
            gmap = new google.maps.Map(el, {
                zoom: zoom,
                center: new google.maps.LatLng( c_lat, c_lng ),
                mapTypeId: google.maps.MapTypeId[ type ]
            })
        ;
        // declarative markers
        $el.children('.marker,.map-marker').each(function( ){
            var m = $(this),
                position = !!m.attr('data-marker-position') ? m.attr('data-marker-position').split(',') : [0,0],
                marker = {
                lat: parseFloat(position[0]||0, 10),
                lng: parseFloat(position[1]||0, 10),
                title: m.attr('title'),
                info: m.html(),
                clickable: !!m.attr('data-marker-clickable'),
                draggable: !!m.attr('data-marker-draggable'),
                visible: !!m.attr('data-marker-visible')
            };
            add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
        });
        $el.empty( );
        // markers reference
        if ( !!$el.attr('data-map-markers') )
        {
            $($el.attr('data-map-markers')).each(function( ){
                var m = $(this),
                    position = !!m.attr('data-marker-position') ? m.attr('data-marker-position').split(',') : [0,0],
                    marker = {
                    lat: parseFloat(position[0]||0, 10),
                    lng: parseFloat(position[1]||0, 10),
                    title: m.attr('title'),
                    info: m.html(),
                    clickable: !!m.attr('data-marker-clickable'),
                    draggable: !!m.attr('data-marker-draggable'),
                    visible: !!m.attr('data-marker-visible')
                };
                add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
            });
        }
        // option markers
        var i, markers = options.markers, marker, l = markers ? markers.length : 0;
        for (i=0; i<l; i++)
        {
            // add markers, infos to map
            marker = markers[i];
            add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
        }
        if ( null != options.kml )
        {
            var geoRssLayer = new google.maps.KmlLayer( options.kml );
            geoRssLayer.setMap( gmap );
        }
        responsive = !!($el.attr('data-map-responsive')||options.responsive);
        if ( responsive ) $(el.parentNode||document.body).on( 'resize', on_resize );
    };
    self.map = function( ) {
        return gmap;
    };
    self.center = function( c ) {
        if ( arguments.length )
        {
            if ( gmap )
            {
                c_lat = parseFloat(c[0],10); c_lng = parseFloat(c[1],10);
                gmap.setCenter( new google.maps.LatLng( c_lat, c_lng ) );
            }
        }
        else
        {
            return [c_lat, c_lng];
        }
    };
    self.add_marker = function( marker ) {
        if ( gmap && marker )
        {
            return add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info||null, marker );
        }
    };
    self.remove_marker = function( marker ) {
        if ( marker )
        {
            marker.setMap( null );
        }
    };
    self.add_markers = function( markers ) {
        if ( gmap && markers )
        {
            for (var i=0; i<markers.length; i++)
            {
                // add markers, infos to map
                var marker = markers[i];
                markers[i] = add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
            }
            return markers;
        }
    };
    self.remove_markers = function( markers ) {
        if ( markers )
        {
            for (var i=0; i<markers.length; i++)
                markers[i].setMap( null );
        }
    };
});	

$.fn.htmlwidget = function( type, opts ) {
    opts = opts || {};
    this.each(function( ) {
        var el = this, $el;
        
        if ( htmlwidget.widget[HAS](type) && 'function' === typeof htmlwidget.widget[type] )
        {
            htmlwidget.widget[type]( el, opts );
            return;
        }
        
        $el = $(el);
        switch( type )
        {
        case 'delayable':
        case 'disabable':
        case 'morphable':
        case 'selectable':
        case 'removable':
        case 'rearrangeable':
        case 'sortable':
        case 'uploadable':
        case 'upload':
            $el['upload'===type?'uploadable':('rearrangeable'===type?'sortable':type)](opts);
            break;
        
        case 'draggable':
            if ( 'function' === typeof $.fn.tinyDraggable )
                $el.tinyDraggable(opts);
            break;
        
        case 'resisable':
        case 'resizable':
            /* TO BE ADDED */
            break;
        
        case 'timer':
            if ( 'function' === typeof $.fn.Timer )
                $el.Timer(opts);
            break;
        
        case 'date':
        case 'datetime':
        case 'datepicker':
        case 'datetimepicker':
            $el.datetimepicker(opts);
            break;
        
        case 'color':
        case 'colorselector':
        case 'colorpicker':
            $el.colorpicker(opts);
            break;
        
        case 'map':
        case 'gmap':
        case 'gmap3':
            $el.gmap3(opts);
            break;
        
        case 'autocomplete':
        case 'autosuggest':
        case 'suggest':
            $el.suggest(opts);
            break;
        
        case 'rangeslider':
        case 'range':
            if ( 'function' === typeof $.fn.rangeslider )
                $el.rangeslider({
                /*
                // https://andreruffert.github.io/rangeslider.js/
                // Set this to `false` if you want to use
                // the polyfill also in Browsers which support the native <input type="range"> element.
                rangeClass: 'rangeslider',
                disabledClass: 'rangeslider--disabled',
                horizontalClass: 'rangeslider--horizontal',
                verticalClass: 'rangeslider--vertical',
                fillClass: 'rangeslider__fill',
                handleClass: 'rangeslider__handle',
                onInit: function() {},
                onSlide: function(position, value) {},
                onSlideEnd: function(position, value) {}
                */
                 polyfill: false
                ,orientation: $el.attr('data-range-orientation')||opts.orientation||"horizontal"
                });
            break;
        
        case 'select':
        case 'select2':
            if ( 'function' === typeof $.fn.select2 )
            {
                $el.select2(opts);
                $el.prev('.select2-container')
                    .attr('title',$el.attr('title'))
                    .attr('data-tooltip',$el.attr('data-tooltip'))
                ;
            }
            break;
        
        case 'table':
        case 'datatable':
            if ( 'function' === typeof $.fn.dataTable )
            {
                $el.dataTable(opts);
                $el.closest(".dataTables_wrapper").addClass("w-table-wrapper");
            }
            break;
        
        case 'modal':
            if ( 'function' === typeof $.fn.modal )
                $el.modal(opts);
            break;
        
        case 'modelview':
            if ( 'undefined' !== typeof ModelView )
                $el.modelview(opts);
            break;
        
        case 'tag-editor':
            if ( 'function' === typeof $.fn.tagEditor )
                $el.tagEditor(opts);
            break;
        
        case 'wysiwyg-editor':
            if ( 'function' === typeof $.fn.trumbowyg )
            {
                $el.trumbowyg(opts);
                $el.closest(".trumbowyg-box").addClass("widget w-wysiwyg-editor-box")/*.attr("style", opts.style||'')*/;
            }
            break;
        
        case 'syntax-editor':
            if ( 'function' === typeof CodeMirror )
                CodeMirror.fromTextArea(el, opts);
            break;
        
        default: 
            break;
        }
    });
    return this;
};
htmlwidget.init = function( node, current, deep ) {
    var $node = $(node);
    if ( true === deep )
    {
        $node.find('input[type=range].w-rangeslider').htmlwidget('range');
        $node.find('.w-upload').htmlwidget('upload');
        $node.find('.w-suggest').htmlwidget('suggest');
        $node.find('.w-timer').htmlwidget('timer');
        $node.find('.w-date').htmlwidget('datetimepicker');
        $node.find('.w-color,.w-colorselector').htmlwidget('colorpicker');
        $node.find('.w-map').htmlwidget('map');
        $node.find('.w-select2').htmlwidget('select2');
    }
    if ( false !== current )
    {
        if ( $node.is('input[type=range]') ) $node.htmlwidget('range');
        else if ( $node.hasClass('w-upload') ) $node.htmlwidget('upload');
        else if ( $node.hasClass('w-suggest') ) $node.htmlwidget('suggest');
        else if ( $node.hasClass('w-timer') ) $node.htmlwidget('timer');
        else if ( $node.hasClass('w-date') ) $node.htmlwidget('datetimepicker');
        else if ( $node.hasClass('w-color') || $node.hasClass('w-colorselector') ) $node.htmlwidget('colorpicker');
        else if ( $node.hasClass('w-map') ) $node.htmlwidget('map');
        else if ( $node.hasClass('w-select2') ) $node.htmlwidget('select2');
    }
};
htmlwidget.initialisable = function( el, root ) {
    root = root || window;
    var $el = $(el), w_init = ($el.attr('w-init')||'').toLowerCase();
    if ( '1' === w_init || 'true' === w_init || 'on' === w_init || 'yes' === w_init ) w_init = "__htmlwidget_init__";
    if ( !!w_init && 'function' === typeof root[w_init] )
    {
        $el.removeAttr('w-init');
        root[w_init]( el );
    }
};
htmlwidget.widgetize = function( el ) {
    var $node = $(el);
    if ( $node.hasClass('w-selectable') ) $node.htmlwidget('selectable');
    if ( $node.hasClass('w-removable') ) $node.htmlwidget('removable');
    if ( $node.hasClass('w-morphable') ) $node.htmlwidget('morphable');
    if ( $node.hasClass('w-delayable') ) $node.htmlwidget('delayable');
    if ( $node.hasClass('w-disabable') ) $node.htmlwidget('disabable');
    if ( $node.hasClass('w-draggable') ) $node.htmlwidget('draggable');
    if ( $node.hasClass('w-resizable') ) $node.htmlwidget('resizable');
    if ( $node.hasClass('w-sortable') || $node.hasClass('w-rearrangeable') ) $node.htmlwidget('sortable');
};
htmlwidget.tooltip = function( el ) {
    var $el = $(el), content = '', hasTooltip = $el.hasClass('tooltipstered');
    if ( !hasTooltip )
    {
        content = !!$el.attr('data-tooltip') ? $el.attr('data-tooltip') : $el.attr('title');
        if ( content.length )
        {
            $el.tooltipster({
                // http://iamceege.github.io/tooltipster/#options
                onlyOne: true,
                autoClose: true,
                content: content,
                position: $el.hasClass('tooltip-bottom') 
                            ? 'bottom'
                            : ($el.hasClass('tooltip-right')
                            ? 'right'
                            : ($el.hasClass('tooltip-left')
                            ? 'left'
                            : 'top'))
            });
        }
        else
        {
            $el.removeAttr('title');
        }
    }
    if ( hasTooltip || content.length ) $el.tooltipster('show');
};

// dynamic widget init hook
window["__htmlwidget_init__"] = function( e ){
    htmlwidget.init( e );
};

$(function(){

if ( 'undefined' !== typeof SelectorListener ) SelectorListener.jquery( $ );
if ( 'undefined' !== typeof ModelView ) ModelView.jquery( $ );

var $body = $(document.body),
    widget_init = function( ){ htmlwidget.initialisable( this ); },
    widget_able = function( ){ htmlwidget.widgetize( this ); };

// already existing elements
$body.find('[w-init]').each( widget_init );
$body.find('.w-rearrangeable,.w-selectable,.w-removable,.w-morphable,.w-delayable,.w-disabable,.w-sortable,.w-draggable').each( widget_able );

// dynamicaly added elements
if ( 'function' === typeof $.fn.onSelector )
{
    $body
        .onSelector('[w-init]::added', widget_init)
        .onSelector('.w-rearrangeable::added,.w-selectable::added,.w-removable::added,.w-morphable::added,.w-delayable::added,.w-disabable::added,.w-sortable::added,.w-draggable::added', widget_able)
    ;
}

// dynamic tooltips
if ( 'function' === typeof $.fn.tooltipster )
{
    if ( 'function' === typeof $.fn.onSelector )
        $body.onSelector('[data-tooltip]:hover,[title]:hover', htmlwidget.tooltip);
    else
        $body.on('mouseover', '[data-tooltip],[title]', htmlwidget.tooltip);
}

});

return htmlwidget;
});