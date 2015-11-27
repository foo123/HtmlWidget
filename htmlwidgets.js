/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery, DateX, HtmlWidget
*  @version: 0.8.0
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/modelview-widgets
*
**/
!function(window, $, undef){
"use strict";

var htmlwidget = {VERSION: "0.8.0", widget: {}},
HAS = 'hasOwnProperty', PROTO = 'prototype', ID = 0,
slice = Array[PROTO].slice,
json_decode = JSON.parse, json_encode = JSON.stringify,
toString = Object[PROTO].toString;

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

htmlwidget.removable = function removable( el, options ){
    var self = this;
    if ( !(self instanceof removable) ) return new removable(el, options);
    self.w_init = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-removable') ) $el.addClass('w-removable');
        $el.on('click.removable', options.handle||'.w-remove-handle', function( evt ){
            var $el = $(this);
            $el.fadeOut(400, function( evt ){
               var remove = true;
               if ( 'function' === typeof options.onremove ) remove = options.onremove.call( this, evt );
               if ( false !== remove ) $el.remove( );
            });
        });
    };
    self.w_dispose = function( ) {
        $(el).off('.removable');
    };
};

htmlwidget.selectable = function selectable( el, options ){
    var self = this;
    if ( !(self instanceof selectable) ) return new selectable(el, options);
    self.w_init = function( ) {
        var $el = $(el);
        if ( !$el.hasClass('w-selectable') ) $el.addClass('w-selectable');
        $el.on('click.selectable', options.handle||'.w-select-handle', function( evt ){
            if ( evt.shiftKey )
            {
                var $el = $(this);
                if ( !!options.selector ) $el = $el.closest( options.selector );
                if ( $el.hasClass('w-selected') ) $el.removeClass('w-selected');
                else $el.addClass('w-selected');
            }
        });
    };
    self.w_clear = function( ) {
        $(el).children('.w-selected').removeClass('w-selected');
    };
    self.w_dispose = function( ) {
        $(el).off('.selectable');
    };
};

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

htmlwidget.uploadable = function uploadable( el, options ){
    var self = this, thumbnail_size = 120;
    if ( !(self instanceof uploadable) ) return new uploadable(el, options);
    
    self.w_dispose = function( ) {
        var control = $(el);
        control.off('.uploadable');
        control = null;
    };
    self.w_init = function( ) {
        var control = $(el);
        control
        .on('click.uploadable', '.w-upload-delete', function( evt ){
            control[0].imdata = null;
            control.find('._w-data').val('');
            control.find('img').attr('src','');
            return false;
        })
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
                        control.find('_w-data').val( json_encode( control[0].imdata ) );
                        control.find('img').attr('src', img_thumb);
                    }, 10);
                });
                img.src = img_src;
            });
            img_reader.readAsDataURL( file );
        })
        ;
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

widget2jquery( 'selectable', htmlwidget.selectable );
widget2jquery( 'removable', htmlwidget.removable );
widget2jquery( 'morphable', htmlwidget.morphable );
widget2jquery( 'delayable', htmlwidget.delayable );
widget2jquery( 'disabable', htmlwidget.disabable );
widget2jquery( 'uploadable', htmlwidget.uploadable );
widget2jquery( 'suggest', htmlwidget.suggest );
widget2jquery( 'gmap3', htmlwidget.gmap3 );

/*if ( 'undefined' !== typeof HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}*/

$.htmlwidget = htmlwidget;

$.fn.htmlwidget = function( type, opts, before, after ) {
    opts = opts || {};
    if ( 'function' !== typeof before ) before = false;
    if ( 'function' !== typeof after ) after = false;
    this.each(function( ) {
        var el = this, $el;
        if ( htmlwidget.widget[HAS](type) && 'function' === typeof htmlwidget.widget[type] )
        {
            htmlwidget.widget[type]( this, opts );
        }
        else
        {
            
        $el = $(el);
        switch( type )
        {
        case 'delayable':
            if ( before ) before( $, el );
            $el.delayable(opts);
            if ( after ) after( $, el );
            break;
        
        case 'disabable':
            if ( before ) before( $, el );
            $el.disabable(opts);
            if ( after ) after( $, el );
            break;
        
        case 'morphable':
            if ( before ) before( $, el );
            $el.morphable({
                modeClass: $el.attr('data-morphable-mode') || opts.modeClass
            });
            if ( after ) after( $, el );
            break;
        
        case 'upload':
        case 'uploadable':
            if ( before ) before( $, el );
            $el.uploadable( opts );
            if ( after ) after( $, el );
            break;
        
        case 'selectable':
            if ( before ) before( $, el );
            $el.selectable({
                selector: $el.attr('data-selectable-item') || opts.selector || ".selectable-item",
                handle: $el.attr('data-selectable-handle') || opts.handle || ".selectable-handle"
            });
            if ( after ) after( $, el );
            break;
        
        case 'removable':
            if ( before ) before( $, el );
            $el.removable({
                handle: $el.attr('data-removable-handle') || opts.handle || ".removable-handle"
            });
            if ( after ) after( $, el );
            break;
        
        case 'draggable':
            if ( 'undefined' !== typeof $.fn.tinyDraggable )
            {
                if ( before ) before( $, el );
                $el.tinyDraggable( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'sortable':
            if ( 'undefined' !== typeof Sortable )
            {
                if ( before ) before( $, el );
                Sortable.create( el, {
                    sort: true,
                    disabled: false,
                    delay: parseInt($el.attr('data-sortable-delay') || opts.delay || 0,10),
                    animation: parseInt($el.attr('data-sortable-animation') || opts.animation || 400,10),
                    draggable: $el.attr('data-sortable-item') || opts.draggable || opts.item,
                    handle: $el.attr('data-sortable-handle') || opts.handle || ".sortable-handle"
                });
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
        
        /*case 'datetime':
        case 'datetimepicker':
            if ( 'undefined' !== typeof Sundial )
            {
                if ( before ) before( $, el );
                var dformat = $el.attr('data-date-format') || 'Y-m-d';
                var tformat = $el.attr('data-time-format') || 'H:i:s';
                new Sundial(el, {options: {
                    encoder: datetime_encoder( format ),
                    decoder: datetime_decoder( format )
                }});
                if ( after ) after( $, el );
            }
            break;*/
        
        case 'datetime':
        case 'date':
        case 'datepicker':
            if ( 'undefined' !== typeof Pikaday )
            {
                if ( before ) before( $, el );
                var format = $el.attr('data-datetime-format') || 'Y-m-d';
                new Pikaday({
                    field  : el,
                    encoder: datetime_encoder( format ),
                    decoder: datetime_decoder( format )
                });
                if ( after ) after( $, el );
            }
            break;
        
        case 'timer':
            if ( 'undefined' !== typeof $.fn.Timer )
            {
                if ( before ) before( $, el );
                $el.Timer( opts );
                if ( after ) after( $, el );
            }
            break;
        
        case 'colorpicker':
        case 'color':
            if ( 'undefined' !== typeof $.fn.ColorPicker )
            {
                if ( before ) before( $, el );
                $el.ColorPicker( opts );
                if ( after ) after( $, el );
            }
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

$(function(){
$('.w-date').htmlwidget('date');
$('.w-timer').htmlwidget('timer');
$('.w-color,.w-colorselector').htmlwidget('color');
$('.w-selectable').htmlwidget('selectable');
$('.w-removable').htmlwidget('removable');
$('.w-delayable').htmlwidget('delayable');
$('.w-disabable').htmlwidget('disabable');
$('.w-morphable').htmlwidget('morphable');
$('.w-sortable').htmlwidget('sortable');
});

}(window, jQuery);