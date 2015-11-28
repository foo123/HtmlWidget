/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, SelectorListener, jQuery
*  @version: 0.8.1
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/modelview-widgets
*  https://github.com/foo123/SelectorListener
*
**/
!function(window, $, undef){
"use strict";

var htmlwidget = {VERSION: "0.8.1", widget: {}},
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
function create_style( media, css )
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
function dispose_style( style )
{
    if ( style ) document.head.removeChild( style );
}


/*if ( 'undefined' !== typeof HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}*/

$.htmlwidget = htmlwidget;

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

// some useful widgets
htmlwidget.stylable = function stylable( id, selector, css, media ) {
    var self = this;
    if ( !(self instanceof stylable) ) return new stylable(id, selector, css, media);
    
    var style = {id:{selector:selector,rules:null}};
    self.id = id;
    self.selector = selector;
    self.rules = [];
    for (var prop in css) css[HAS](prop) && self.rules.push( prop + ':' + css[prop] );
    style[id].rules = self.rules;
    self.sheet = create_style( media||'all', style );
    self.sheet.setAttribute('id', self.id);
    self.style = style[id].css;
    
    self.dispose = function( ) {
        self.id = null;
        self.selector = null;
        self.rules = null;
        self.style = null;
        if ( self.sheet ) dispose_style( self.sheet );
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
        $el.on('click.selectable', handle, function( evt ){
            if ( evt.shiftKey )
            {
                var $el = $(this);
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
        style_sheet = create_style( 'all', css_styles = cssStyles );
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
        if ( style_sheet ) dispose_style( style_sheet );
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
        if ( 'undefined' !== typeof Sortable )
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
            var $imdata = control.find('_w-data'),
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
                        control.find('_w-data').val( json_encode( control[0].imdata ) ).trigger('change');
                    }, 10);
                });
                img.src = img_src;
            });
            img_reader.readAsDataURL( file );
        })
        ;
    };
});
// custom date codecs and locale
//datetime_locale = DateX.defaultLocale;
function datetime_encoder( format, locale )
{
    if ( 'undefined' !== typeof DateX )
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
}
function datetime_decoder( format, locale )
{
    if ( 'undefined' !== typeof DateX )
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
}
widget2jquery('datepicker', htmlwidget.datepicker=function datepicker( el, options ){
    var self = this;
    if ( !(self instanceof datepicker) ) return new datepicker(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'undefined' !== typeof Pikaday )
        {
            var $el = $(el);
            var format = $el.attr('data-datepicker-format')||options.format||'Y-m-d';
            self.instance = new Pikaday({
                field  : el,
                encoder: datetime_encoder( format ),
                decoder: datetime_decoder( format )
            });
        }
    };
    self.dispose = function( ) {
        self.instance = null;
    };
});
widget2jquery('colorpicker', htmlwidget.colorpicker=function colorpicker( el, options ){
    var self = this;
    if ( !(self instanceof colorpicker) ) return new colorpicker(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'undefined' !== typeof $.ColorPicker )
        {
            var $el = $(el);
            self.instance = new $.ColorPicker(el, {
                changeEvent: $el.attr('data-colorpicker-change')||options.changeEvent||'change',
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
widget2jquery('suggest', htmlwidget.suggest=(function(){
"use strict";
var id = 0;

function RemoteList(element, options){
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

RemoteList[PROTO] = {

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
})());

$.fn.htmlwidget = function( type, opts ) {
    opts = opts || {};
    this.each(function( ) {
        var el = this, $el, before, after, render;
        $el = $(el);
        render = (!!$el.attr('cb-widget') && 'function' === typeof window[$el.attr('cb-widget')]) ? window[$el.attr('cb-widget')] : false;
        before = (!!$el.attr('cb-widget-before') && 'function' === typeof window[$el.attr('cb-widget-before')]) ? window[$el.attr('cb-widget-before')] : false;
        after = (!!$el.attr('cb-widget-after') && 'function' === typeof window[$el.attr('cb-widget-after')]) ? window[$el.attr('cb-widget-after')] : false;
        
        if ( htmlwidget.widget[HAS](type) && 'function' === typeof htmlwidget.widget[type] )
        {
            htmlwidget.widget[type]( this, opts );
        }
        else if ( render )
        {
            render( $, el );
        }
        else
        {
        
        switch( type )
        {
        case 'delayable':
        case 'disabable':
        case 'morphable':
        case 'selectable':
        case 'removable':
        case 'sortable':
        case 'uploadable':
        case 'upload':
            if ( before ) before( $, el );
            $el['upload'===type ? 'uploadable' : type](opts);
            if ( after ) after( $, el );
            break;
        
        case 'draggable':
            if ( 'undefined' !== typeof $.fn.tinyDraggable )
            {
                if ( before ) before( $, el );
                $el.tinyDraggable(opts);
                if ( after ) after( $, el );
            }
            break;
        
        case 'autocomplete':
        case 'autosuggest':
        case 'suggest':
            if ( before ) before( $, el );
            var suggest = $el.parent( ),
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
                select: opts.select || function( ){ }
            });
            if ( after ) after( $, el );
            break;
        
        case 'timer':
            if ( 'undefined' !== typeof $.fn.Timer )
            {
                if ( before ) before( $, el );
                $el.Timer( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'datetime':
        case 'date':
        case 'datepicker':
            if ( before ) before( $, el );
            $el.datepicker(opts);
            if ( after ) after( $, el );
            break;
        
        case 'color':
        case 'colorpicker':
            if ( before ) before( $, el );
            $el.colorpicker(opts);
            if ( after ) after( $, el );
            break;
        
        case 'select':
        case 'select2':
            if ( 'undefined' !== typeof $.fn.select2 )
            {
                if ( before ) before( $, el );
                $el.select2( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'table':
        case 'datatable':
            if ( 'undefined' !== typeof $.fn.dataTable )
            {
                if ( before ) before( $, el );
                $el.dataTable( opts ).on('change', 'input.select_row', function( ){ 
                    if ( this.checked ) $(this).closest('tr').addClass('selected');
                    else $(this).closest('tr').removeClass('selected');
                });
                $el.closest(".dataTables_wrapper").addClass("w-table-wrapper");
                if ( after ) after( $, el );
            }
            break;
        
        case 'modal':
            if ( 'undefined' !== typeof $.fn.modal )
            {
                if ( before ) before( $, el );
                $el.modal( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'modelview':
            if ( 'undefined' !== typeof ModelView )
            {
                ModelView.jquery( $ );
                if ( before ) before( $, el );
                $el.modelview( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'wysiwyg-editor':
            if ( 'undefined' !== typeof $.fn.trumbowyg )
            {
                if ( before ) before( $, el );
                $el.trumbowyg( opts.editor||{} );
                $el.closest(".trumbowyg-box").addClass("widget w-wysiwyg-editor-box").attr("style", opts.style||'');
                if ( after ) after( $, el );
            }
            break;
        
        case 'syntax-editor':
            if ( 'undefined' !== typeof CodeMirror )
            {
                if ( before ) before( $, el );
                CodeMirror.fromTextArea( el, opts.editor||{} );
                if ( after ) after( $, el );
            }
            break;
        
        case 'tag-editor':
            if ( 'undefined' !== typeof $.fn.tagEditor )
            {
                if ( before ) before( $, el );
                $el.tagEditor( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'map':
        case 'gmap':
        case 'gmap3':
            if ( before ) before( $, el );
            $el.gmap3( opts );
            if ( after ) after( $, el );
            break;
        
        default: 
            break;
        }
        }
    });
    return this;
};

htmlwidget.init = function( $node, current, recurse ) {
    if ( false !== recurse )
    {
        $node.find('.w-upload').htmlwidget('upload');
        $node.find('.w-suggest').htmlwidget('suggest');
        $node.find('.w-timer').htmlwidget('timer');
        $node.find('.w-date').htmlwidget('datepicker');
        $node.find('.w-color,.w-colorselector').htmlwidget('colorpicker');
        $node.find('.w-select2').htmlwidget('select2');
        $node.find('.w-selectable').htmlwidget('selectable');
        $node.find('.w-removable').htmlwidget('removable');
        $node.find('.w-morphable').htmlwidget('morphable');
        $node.find('.w-delayable').htmlwidget('delayable');
        $node.find('.w-disabable').htmlwidget('disabable');
        $node.find('.w-sortable').htmlwidget('sortable');
    }
    if ( false !== current )
    {
        if ( $node.hasClass('w-upload') ) $node.htmlwidget('upload');
        else if ( $node.hasClass('w-suggest') ) $node.htmlwidget('suggest');
        else if ( $node.hasClass('w-timer') ) $node.htmlwidget('timer');
        else if ( $node.hasClass('w-date') ) $node.htmlwidget('datepicker');
        else if ( $node.hasClass('w-color') || $node.hasClass('w-colorselector') ) $node.htmlwidget('colorpicker');
        else if ( $node.hasClass('w-select2') ) $node.htmlwidget('select2');
        if ( $node.hasClass('w-selectable') ) $node.htmlwidget('selectable');
        if ( $node.hasClass('w-removable') ) $node.htmlwidget('removable');
        if ( $node.hasClass('w-morphable') ) $node.htmlwidget('morphable');
        if ( $node.hasClass('w-delayable') ) $node.htmlwidget('delayable');
        if ( $node.hasClass('w-disabable') ) $node.htmlwidget('disabable');
        if ( $node.hasClass('w-sortable') ) $node.htmlwidget('sortable');
    }
};

htmlwidget.tooltip = function( ) {
    var $el = $(this), content = '', hasTooltip = $el.hasClass('tooltipstered');
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

if ( 'undefined' !== typeof SelectorListener ) SelectorListener.jquery( $ );
$(function(){

if ( 'function' === typeof $.fn.onSelector )
{
    // dynamicaly added elements
    $(document.body).onSelector([
    '.w-suggest::added','.w-select2::added','.w-upload::added',
    '.w-timer::added','.w-date::added','.w-color::added','.w-colorselector::added',
    '.w-selectable::added','.w-removable::added','.w-morphable::added',
    '.w-delayable::added','.w-disabable::added','.w-sortable::added'
    ].join(','), function( ){
        htmlwidget.init( $(this), true, false );
    });
}

// already existing elements
htmlwidget.init( $(document.body) );

if ( 'function' === typeof $.fn.tooltipster )
{
    // add dynamic tooltips
    if ( 'function' === typeof $.fn.onSelector )
        $(document.body).onSelector('[data-tooltip]:hover,[title]:hover', htmlwidget.tooltip);
    else
        $(document.body).on('mouseover', '[data-tooltip],[title]', htmlwidget.tooltip);
}

});

}(window, jQuery);