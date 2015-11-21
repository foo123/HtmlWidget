/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery, DateX, HtmlWidget
*  @version: 0.7.1
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/DateX
*
**/
!function(window, $, undef){
"use strict";

var htmlwidget = { VERSION: "0.7.1" }, PROTO = 'prototype', 
slice = Array[PROTO].slice, toString = Object[PROTO].toString;

// adapted from jquery-ui
function widget2jquery( name, widget, spr )
{
    var super_ = spr && spr[PROTO] ? spr[PROTO] : null;
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
                    else if ( super_ )
                    {
                        if ( 'function' === typeof super_.w_dispose ) super_.w_dispose.call( instance );
                        else if ( 'function' === typeof super_.w_destroy ) super_.w_destroy.call( instance )
                        else if ( 'function' === typeof super_.dispose ) super_.dispose.call( instance )
                        else if ( 'function' === typeof super_.destroy ) super_.destroy.call( instance )
                    }
                    instance = null;
                    $.removeData( this, name );
                    return false;
                }
                
                method_ = instance[ method ] || (super_ && super_[ method ]);
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
            options = options || {};
            this.each(function( ){
                var instance = $.data( this, name );
                if ( instance ) 
                {
                    method_ = instance.w_option ||  (super_ && super_.w_option);
                    if ( 'function' === typeof method_ ) method_.call( instance, options );
                } 
                else 
                {
                    $.data( this, name, instance = new widget( this, options ) );
                    method_ = instance.w_init ||  (super_ && super_.w_init);
                    if ( 'function' === typeof method_ ) method_.call( instance );
                }
            });
        }
        return return_value;
    };
}

htmlwidget.morphable = function morphable( el, options ){
    var self = this;
    if ( !(self instanceof morphable) ) return new morphable(el, options);
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

htmlwidget.delayable = function delayable( el, options ){
    var self = this;
    if ( !(self instanceof delayable) ) return new delayable(el, options);
    self.w_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') ) 
            $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) 
            $el.addClass('w-undelayed');
        if ( !$el.children('.w-delayable-overlay').length )
        {
            $el.append('<div class="w-delayable-overlay"><div class="w-spinner w-spinner-dots"></div></div>');
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

htmlwidget.disabable = function disabable( el, options ){
    var self = this;
    if ( !(self instanceof disabable) ) return new disabable(el, options);
    self.w_init = function( ) {
        var $el = $(el);
        if ( $el.hasClass('w-delayed') ) 
            $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-undelayed') ) 
            $el.addClass('w-undelayed');
        if ( !$el.children('.w-disabable-overlay').length )
        {
            $el.append('<div class="w-disabable-overlay"></div>');
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
htmlwidget.gmap3 = function gmap3( el, options ) {
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
    
    self.w_init = function( ) {
        var center = options.center || {lat: 0, lng: 0, zoom: 6};
        zoom = center.zoom || 6; c_lat = center.lat || 0; c_lng = center.lng || 0;
        gmap = new google.maps.Map(el, {
            zoom: zoom,
            center: new google.maps.LatLng( c_lat, c_lng ),
            mapTypeId: google.maps.MapTypeId[ options.type ]
        });
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
        responsive = !!options.responsive;
        if ( responsive ) $(el.parentNode||document.body).on( 'resize', on_resize );
    };
    
    self.w_dispose = function( ) {
        if ( responsive ) $(el.parentNode||document.body).off( 'resize', on_resize );
        // http://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance
        gmap = null;
    };
    
    self.w_map = function( ) {
        return gmap;
    };
    
    self.w_center = function( c ) {
        if ( arguments.length )
        {
            if ( gmap )
            {
                c_lat = c.lat;
                c_lng = c.lng;
                gmap.setCenter( new google.maps.LatLng( c_lat, c_lng ) );
            }
        }
        else
        {
            return {lat: c_lat, lng: c_lng};
        }
    };
    
    self.w_add_marker = function( marker ) {
        if ( gmap && marker )
        {
            return add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info||null, marker );
        }
    };
    
    self.w_remove_marker = function( marker ) {
        if ( marker )
        {
            marker.setMap( null );
        }
    };
    
    self.w_add_markers = function( markers ) {
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
    
    self.w_remove_markers = function( markers ) {
        if ( markers )
        {
            for (var i=0; i<markers.length; i++)
                markers[i].setMap( null );
        }
    };
};	


htmlwidget.suggest = (function(){
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

})();

/*if ( 'undefined' !== typeof HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}*/

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

$.htmlwidget = htmlwidget;

widget2jquery( 'morphable', htmlwidget.morphable );
widget2jquery( 'delayable', htmlwidget.delayable );
widget2jquery( 'disabable', htmlwidget.disabable );
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
    
    case 'autocomplete':
    case 'autosuggest':
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
            select: opts.select || function( ){ }
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
        new Pikaday({
            field  : $el[0],
            encoder: datetime_encoder( format ),
            decoder: datetime_decoder( format )
        });
        break;
    
    case 'sortable':
        Sortable.create( $(el)[0], opts );
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