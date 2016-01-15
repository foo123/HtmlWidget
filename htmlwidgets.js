/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, SelectorListener, jQuery
*  @version: 0.8.3
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

var $ = jQuery, htmlwidget = {VERSION: "0.8.3", widget: {}, locale: {}},
HAS = 'hasOwnProperty',
ATTR = 'getAttribute', SET_ATTR = 'setAttribute', HAS_ATTR = 'hasAttribute', DEL_ATTR = 'removeAttribute',
PROTO = 'prototype', ID = 0,
slice = Array[PROTO].slice,
int = function( x ) { return parseInt(x||0,10)||0; },
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
widget2jquery('selectable', htmlwidget.selectable=function selectable( el, options ){
    var self = this;
    if ( !(self instanceof selectable) ) return new selectable(el, options);
    self.init = function( ) {
        var $el = $(el),
            handle = el[ATTR]('data-selectable-handle')||options.handle||'.w-selectable-handle',
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
            handle = el[ATTR]('data-removable-handle')||options.handle||'.w-removable-handle',
            item = el[ATTR]('data-removable-item')||options.selector||options.item,
            animation = parseInt(el[ATTR]('data-removable-animation')||options.animation||400,10)
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
                mode_class = el[ATTR]('data-morphable-mode')||options.modeClass
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
        //if ( $el.hasClass('w-delayed') )  $el.removeClass('w-delayed');
        if ( !$el.hasClass('w-delayed') ) $el.addClass('w-undelayed');
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
        //if ( $el.hasClass('w-disabled') ) $el.removeClass('w-disabled');
        if ( !$el.hasClass('w-disabled') ) $el.addClass('w-undisabled');
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
            self.instance = Sortable.create( el, {
                sort: true,
                disabled: false,
                delay: parseInt(el[ATTR]('data-sortable-delay')||options.delay||0, 10),
                animation: parseInt(el[ATTR]('data-sortable-animation')||options.animation||400, 10),
                draggable: el[ATTR]('data-sortable-item')||options.draggable||options.item||".w-sortable-item",
                handle: el[ATTR]('data-sortable-handle')|| options.handle||".w-sortable-handle"
            });
        }
    };
    self.dispose = function( ) {
        self.instance = null;
    };
});
widget2jquery('template', htmlwidget.template=function template( el, options ){
    var self = this;
    if ( !(self instanceof template) ) return new template(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof Tao )
        {
            self.instance = Tao( 
                el,
                el[HAS_ATTR]('data-tpl-key') ? new RegExp(el[ATTR]('data-tpl-key')) : (options.key || template.key),
                !!(el[ATTR]('data-tpl-revivable') || options.revivable),
                el[ATTR]('data-tpl-keyseparator') || options.keySeparator
            );
        }
    };
    self.render = function( data, trigger ) {
        if ( self.instance )
        {
            self.instance( data );
            if ( true === trigger ) $(el).trigger('render');
        }
    };
    self.dispose = function( ) {
        if ( self.instance ) self.instance.dispose( );
        self.instance = null;
    };
});
htmlwidget.template.key = /\$\(([^\(\)]+)\)/;
htmlwidget.Tpl = htmlwidget.Template = function Template( str, key, revivable, key_separator ) {
    if ( 'function' === typeof Tao )
        return Tao( str, key || Template.key, revivable, key_separator );
};
htmlwidget.Template.key = /\$\(([^\(\)]+)\)/g;
widget2jquery('suggest', htmlwidget.suggest=function suggest( el, options ){
    var self = this;
    if ( !(self instanceof suggest) ) return new suggest(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof AutoComplete )
        {
            var ajaxurl = el[ATTR]('data-suggest-ajax') || options.ajax || el[ATTR]('data-ajax') || null,
                dataType = el[ATTR]('data-suggest-data') || options.dataType || 'json',
                method = el[ATTR]('data-suggest-method') || options.method || 'GET',
                q = el[ATTR]('data-suggest-q') || el[ATTR]('data-suggest-param') || options.q || options.param || 'suggest',
                xhr = null
            ;
            self.instance = new AutoComplete(el, {
                minChars: el[ATTR]('data-suggest-min') || options.minChars || 3,
                key: el[ATTR]('data-suggest-key') || options.key || null,
                value: el[ATTR]('data-suggest-value') || options.value || null,
                delay: el[ATTR]('data-suggest-delay') || options.delay || 150,
                cache: el[ATTR]('data-suggest-cache') || 5*60*1000,
                menuClass: el[ATTR]('data-suggest-class') || options.menuClass || 'w-suggestions',
                source: function( term, suggest ) {
                    var $el = $(el), wrapper = $el.closest('.w-wrapper'),
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
                    $(el).trigger('suggest-select', {
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
    var self = this;
    if ( !(self instanceof uploadable) ) return new uploadable(el, options);
    
    self.dispose = function( ) {
        var control = $(el);
        control.off('.uploadable');
        control = null;
    };
    self.init = function( ) {
        var control = $(el),
        
            fileSizeMax = (el[HAS_ATTR]('data-upload-size')
                ? int(el[ATTR]('data-upload-size'))
                : int(options.fileSizeMax || 1048576)) || 1048576 /*1 MiB*/,
                
            fileType = 'image' /*!!el[ATTR]('data-upload-type') ? el[ATTR]('data-upload-type') : (options.fileType || 'image')*/,
            
            fileDimensions = el[HAS_ATTR]('data-upload-dimensions')
                ? el[ATTR]('data-upload-dimensions').split('x').map(int)
                : (!!options.dimensions ? options.dimensions.map(int) : null),
                
            thumbnail_size = (el[HAS_ATTR]('data-upload-thumbnail')
                ? int(el[ATTR]('data-upload-thumbnail'))
                : int(options.thumbnail || 120)) || 120,
                
            msgFileSize = el[HAS_ATTR]('data-upload-size-msg')
                ? el[ATTR]('data-upload-size-msg')
                : (options.maxFileSizeMsg || 'File size exceeds maximum size limit!'),
                
            msgFileType = el[HAS_ATTR]('data-upload-type-msg')
                ? el[ATTR]('data-upload-type-msg')
                : (options.fileTypeMsg || 'File type not allowed!'),
                
            msgFileDimensions = el[HAS_ATTR]('data-upload-dimensions-msg')
                ? el[ATTR]('data-upload-dimensions-msg')
                : (options.dimensionsMsg || 'File dimensions exceed allowed dimensions!')
        ;
        control
        .on('click.uploadable', '.w-upload-thumbnail', function( evt ){
            var $upload_data = control.find('._w-data'),
                upload_data = control[0].upload_data || (!!$upload_data.val() ? json_decode($upload_data.val()) : null);
                
            if ( !!upload_data && upload_data.type.match('image') )
            {
                if ( !control[0].upload_data ) control[0].upload_data = upload_data;
                window.open(
                    !!upload_data.original ? upload_data.original : upload_data.file,
                    'preview_'+control[0].id,
                    'scrollbars=yes,resizable=yes,width='+upload_data.width+',height='+upload_data.height
                ).focus( );
            }
            return false;
        })
        .on('click.uploadable', '.w-upload-delete', function( evt ){
            control[0].upload_data = null;
            control.find('input._w-uploader[type=file]')[0].value = '';
            control.find('img').attr('src','');
            control.find('._w-data').val('').trigger('change');
            return false;
        })
        .on('change.uploadable', 'input._w-uploader[type=file]', function( evt ){
            var input = evt.target, file = input.files[0] || null, file_reader;
            if ( !file ) return false;
            if ( !file.type.match( fileType ) )
            {
                input.value = '';
                setTimeout(function( ){
                    alert(msgFileType);
                }, 10);
                return false;
            }
            if ( file.size > fileSizeMax )
            {
                input.value = '';
                setTimeout(function( ){
                    alert(msgFileSize);
                }, 10);
                return false;
            }
            file_reader = new FileReader( );
            file_reader.addEventListener("load", function( evt ){
                var base64_data = evt.target.result;
                if ( 'image' == fileType )
                {
                    var img = new Image( );
                    img.addEventListener("load", function( ) {
                        // add a small delay
                        setTimeout(function( ){
                            var w = img.width, h = img.height,
                                tw, th, canvas, ctx, img_thumb;
                            if ( !!fileDimensions )
                            {
                                if ( w > fileDimensions[0] || h > fileDimensions[1] )
                                {
                                    input.value = '';
                                    control.trigger('upload-end');
                                    setTimeout(function( ){
                                        alert(msgFileDimensions);
                                    }, 10);
                                    return false;
                                }
                            }
                            tw = thumbnail_size; th = Math.round(thumbnail_size*h/w);
                            canvas = document.createElement('canvas'); ctx = canvas.getContext('2d');
                            canvas.width = tw; canvas.height = th;
                            ctx.drawImage(img, 0, 0, w, h, 0, 0, tw, th);
                            img_thumb = canvas.toDataURL("image/png");
                            control[0].upload_data = {name:file.name, type:file.type, file:base64_data, thumb:img_thumb, width:w, height:h};
                            control.find('img').attr('src', img_thumb);
                            control.find('._w-data').val( json_encode( control[0].upload_data ) ).trigger('change');
                            control.trigger('upload-end');
                        }, 10);
                    });
                    img.src = base64_data;
                }
                else
                {
                    // add a small delay
                    setTimeout(function( ){
                        control[0].upload_data = {name:file.name, type:file.type, file:base64_data, thumb:'', width:0, height:0};
                        control.find('img').attr('src', '');
                        control.find('._w-data').val( json_encode( control[0].upload_data ) ).trigger('change');
                        control.trigger('upload-end');
                    }, 10);
                }
                // clear input control
                input.value = '';
            });
            control.trigger('upload-start');
            file_reader.readAsDataURL( file );
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
            var format = el[ATTR]('data-datepicker-format')||options.format||'Y-m-d H:i:s',
                time_attr = (el[ATTR]('data-datepicker-time')||'').toLowerCase(),
                seconds_attr = (el[ATTR]('data-datepicker-seconds')||'').toLowerCase(),
                opts = {
                    field   : el,
                    showTime: !!time_attr ? '1' === time_attr || 'true' === time_attr || 'on' === time_attr || 'yes' === time_attr : !!options.showTime,
                    showSeconds: !!seconds_attr ? !('0' === seconds_attr || 'false' === seconds_attr || 'off' === seconds_attr || 'no' === seconds_attr) : (false !== options.showSeconds),
                    encoder : datetimepicker.encoder( format ),
                    decoder : datetimepicker.decoder( format )
                }
            ;
            if ( options.i18n ) opts.i18n = options.i18n;
            self.instance = new Pikadaytime( opts );
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
        locale = locale || htmlwidget.locale['DateX'] || DateX.defaultLocale;
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
        locale = locale || htmlwidget.locale['DateX'] || DateX.defaultLocale;
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
            self.instance = new ColorPicker(el, {
                changeEvent: el[ATTR]('data-colorpicker-change')||options.changeEvent||'change',
                input: el[HAS_ATTR]('data-colorpicker-input') ? $(el[ATTR]('data-colorpicker-input'))[0] : (!!options.input ? $(options.input)[0] : null),
                format: el[ATTR]('data-colorpicker-format')||options.format||'rgba',
                color: el[ATTR]('data-colorpicker-color')||options.color,
                opacity: el[ATTR]('data-colorpicker-opacity')||options.opacity
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
widget2jquery('areaselect', htmlwidget.areaselect=function areaselect( el, options ){
    var self = this;
    if ( !(self instanceof areaselect) ) return new areaselect(el, options);
    
    self.instance = null;
    
    self.init = function( ) {
        if ( 'function' === typeof AreaSelect )
        {
            var with_borders = el[HAS_ATTR]('data-areaselect-borders') ? el[ATTR]('data-areaselect-borders').toLowerCase() : null;
            self.instance = new AreaSelect(el, {
                className: el[HAS_ATTR]('data-areaselect-class') ? el[ATTR]('data-areaselect-class') : (options.className||null),
                minWidth: el[HAS_ATTR]('data-areaselect-min-width') ? el[ATTR]('data-areaselect-min-width') : (options.minWidth||null),
                maxWidth: el[HAS_ATTR]('data-areaselect-max-width') ? el[ATTR]('data-areaselect-max-width') : (options.maxWidth||null),
                minHeight: el[HAS_ATTR]('data-areaselect-min-height') ? el[ATTR]('data-areaselect-min-height') : (options.minHeight||null),
                maxHeight: el[HAS_ATTR]('data-areaselect-max-height') ? el[ATTR]('data-areaselect-max-height') : (options.maxHeight||null),
                ratioX: el[HAS_ATTR]('data-areaselect-ratio-x') ? el[ATTR]('data-areaselect-ratio-x') : (options.ratioX||null),
                ratioY: el[HAS_ATTR]('data-areaselect-ratio-y') ? el[ATTR]('data-areaselect-ratio-y') : (options.ratioY||null),
                withBorders: with_borders
                    ? ('1' === with_borders || 'yes' === with_borders || 'true' === with_borders || 'on' === with_borders)
                    : (options.withBorders),
                onSelect: function( ele, selection ) {
                    if ( options.onSelect ) options.onSelect.call(this, ele, selection);
                    $(el).trigger('areaselect', {selection: selection});
                }
            });
        }
    };
    self.select = function( selection ) {
        if ( self.instance )
        {
            self.instance.select( selection );
        }
    };
    self.show = function( ) {
        if ( self.instance )
            self.instance.show( );
    };
    self.hide = function( ) {
        if ( self.instance )
            self.instance.hide( );
    };
    self.dispose = function( ) {
        if ( self.instance ) self.instance.dispose( );
        self.instance = null;
    };
});
// http://nikos-web-development.netai.net
// http://maps.googleapis.com/maps/api/js?sensor=false
function map_geocode( location, cb, reverse_geocode )
{
    // https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
    if ( 'undefined' !== typeof google.maps.Geocoder )
    {
        geocoder = new google.maps.Geocoder( );
        var query = reverse_geocode ? {'location':location} : {'address':location};
        geocoder.geocode(query, function(data, status) {
            cb(google.maps.GeocoderStatus.OK == status
            ? {
                location: data[0].geometry.location,
                address: data[0].formatted_address,
                address_components: data[0].address_components,
                /*{short_name:string, long_name:string, postcode_localities[]:string, types[]:string, ...}*/
                partial_match: data[0].partial_match
            }
            : null,
            status, data);
        });
    }
    else
    {
        cb( null );
    }
}
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
    if ( !!opts.address )
    {
        map_geocode(opts.address, function( data ){
            if ( data ) marker.setPosition( data.location );
        });
    }
    
    return marker;
}
widget2jquery('gmap3', htmlwidget.gmap3=function gmap3( el, options ) {
    var self = this, gmap, zoom, c_lat, c_lng, center_marker, responsive;
    if ( !(self instanceof gmap3) ) return new gmap3(el, options);
    
    gmap = null;
    
    //google.maps.MapTypeId.ROADMAP
    options = $.extend({
        type: "ROADMAP",
        markers: null,
        center: null,
        address: null,
        kml: null,
        responsive: false
    }, options||{});
    
    function on_resize( )
    {
        if ( gmap )
        {
            google.maps.event.addListenerOnce( gmap, 'idle', function( ){
                google.maps.event.trigger( gmap, 'resize' );
                var pos = new google.maps.LatLng( c_lat, c_lng );
                gmap.setCenter( pos );
                if ( center_marker ) center_marker.setPosition( pos );
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
            address = !!el[ATTR]('data-map-address') ? el[ATTR]('data-map-address') : null,
            center = el[HAS_ATTR]('data-map-center') ? el[ATTR]('data-map-center').split(',') : options.center || [0,0],
            has_center_marker = !!el[HAS_ATTR]('data-map-center-marker') || !!options.centerMarker,
            zoom = int(el[ATTR]('data-map-zoom')||options.zoom||6),
            type = el[ATTR]('data-map-type')||options.type||"ROADMAP";
        ;
        c_lat = parseFloat(center[0]||0, 10);
        c_lng = parseFloat(center[1]||0, 10);
        gmap = new google.maps.Map(el, {
            zoom: zoom,
            center: new google.maps.LatLng( c_lat, c_lng ),
            mapTypeId: google.maps.MapTypeId[ type ]
        });
        if ( has_center_marker )
        {
            var marker = {
                lat: c_lat,
                lng: c_lng,
                title: el[ATTR]('title'),
                info: null
            };
            center_marker = add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
        }
        if ( !!address )
        {
            map_geocode(address, function( data ){
                if ( data )
                {
                    c_lat = data.location.lat( ); c_lng = data.location.lng( );
                    gmap.setCenter( data.location );
                    if ( center_marker ) center_marker.setPosition( data.location );
                }
            });
        }
        
        // declarative markers
        $el.children('.marker,.map-marker').each(function( ){
            var m = this,
                position = !!m[ATTR]('data-marker-position') ? m[ATTR]('data-marker-position').split(',') : [0,0],
                marker = {
                address: !!m[ATTR]('data-marker-address') ? m[ATTR]('data-marker-address') : null,
                lat: parseFloat(position[0]||0, 10)||0,
                lng: parseFloat(position[1]||0, 10)||0,
                title: m[ATTR]('title'),
                info: m.innerHTML,
                clickable: !!m[ATTR]('data-marker-clickable'),
                draggable: !!m[ATTR]('data-marker-draggable'),
                visible: !!m[ATTR]('data-marker-visible')
            };
            add_map_marker( gmap, marker.lat, marker.lng, marker.title||'', marker.info, marker );
        });
        $el.empty( );
        // markers reference
        if ( !!el[ATTR]('data-map-markers') )
        {
            $(el[ATTR]('data-map-markers')).each(function( ){
                var m = this,
                    position = !!m[ATTR]('data-marker-position') ? m[ATTR]('data-marker-position').split(',') : [0,0],
                    marker = {
                    address: !!m[ATTR]('data-marker-address') ? m[ATTR]('data-marker-address') : null,
                    lat: parseFloat(position[0]||0, 10)||0,
                    lng: parseFloat(position[1]||0, 10)||0,
                    title: m[ATTR]('title'),
                    info: m.innerHTML,
                    clickable: !!m[ATTR]('data-marker-clickable'),
                    draggable: !!m[ATTR]('data-marker-draggable'),
                    visible: !!m[ATTR]('data-marker-visible')
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
        responsive = !!(el[ATTR]('data-map-responsive')||options.responsive);
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
                var pos = new google.maps.LatLng( c_lat, c_lng );
                gmap.setCenter( pos );
                if ( center_marker ) center_marker.setPosition( pos );
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
        var el = this, $el, locale, i18n;
        
        if ( el[HAS_ATTR]('w-opts') && ('object' === typeof window[el[ATTR]('w-opts')]) )
        {
            opts = window[el[ATTR]('w-opts')];
        }
        
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
            $el['upload'===type?'uploadable':('rearrangeable'===type?'sortable':type)]( opts );
            break;
        
        case 'templateable':
        case 'template':
            $el.template( opts );
            break;
        
        case 'draggable':
            if ( 'function' === typeof $.fn.tinyDraggable )
                $el.tinyDraggable( opts );
            break;
        
        case 'resisable':
        case 'resizable':
            /* TO BE ADDED */
            break;
        
        case 'timer':
            if ( 'function' === typeof $.fn.Timer )
                $el.Timer( opts );
            break;
        
        case 'date':
        case 'datetime':
        case 'datepicker':
        case 'datetimepicker':
            if ( !opts["i18n"] && (htmlwidget.locale['Pikadaytime']||htmlwidget.locale['Pikaday']) )
            {
                opts["i18n"] = htmlwidget.locale['Pikadaytime'] || htmlwidget.locale['Pikaday'];
            }
            $el.datetimepicker( opts );
            break;
        
        case 'color':
        case 'colorselector':
        case 'colorpicker':
            $el.colorpicker( opts );
            break;
        
        case 'areaselect':
            $el.areaselect( opts );
            break;
        
        case 'map':
        case 'gmap':
        case 'gmap3':
            $el.gmap3( opts );
            break;
        
        case 'autocomplete':
        case 'autosuggest':
        case 'suggest':
            $el.suggest( opts );
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
                ,orientation: el[ATTR]('data-range-orientation')||opts.orientation||"horizontal"
                });
            break;
        
        case 'menu':
            $el.find('li').each(function(){
                var $li = $(this);
                if ( $li.children('ul').length )
                    $li.addClass('w-submenu-item');
            });
            break;
        
        case 'dropdown':
            if ( $el.is('select') && !$el.parent().hasClass('w-dropdown') )
            {
                if ( $el.hasClass('w-widget') ) $el.removeClass('w-widget');
                if ( $el.hasClass('w-select') ) $el.removeClass('w-select');
                var el_class = "w-widget w-dropdown " + (el.className||''),
                    el_style = $el.attr('style')||'';
                $el.attr('class','w-dropdown-select').attr('style','').wrap('<span class="'+el_class+'" style="'+el_style+'"></span>');
            }
            break;
        
        case 'select':
        case 'select2':
            if ( 'function' === typeof $.fn.select2 )
            {
                $el.select2( opts );
                if ( el[HAS_ATTR]('w-tooltip') ) $el.prev('.select2-container').attr('w-tooltip',el[ATTR]('w-tooltip'));
                else if ( el[HAS_ATTR]('data-tooltip') ) $el.prev('.select2-container').attr('data-tooltip',el[ATTR]('data-tooltip'));
                else if ( el[HAS_ATTR]('title') ) $el.prev('.select2-container').attr('title',el[ATTR]('title'));
            }
            break;
        
        case 'table':
        case 'datatable':
            if ( 'function' === typeof $.fn.dataTable )
            {
                if ( !opts["language"] && htmlwidget.locale['DataTables'] )
                {
					opts["language"] =  htmlwidget.locale['DataTables'];
                }
                $el.dataTable( opts );
                var dt_wrapper = $el.closest(".dataTables_wrapper");
                dt_wrapper.addClass("w-table-wrapper");
                dt_wrapper.find(".dataTables_filter input").addClass("w-widget w-text");
                dt_wrapper.find(".dataTables_length select").htmlwidget("dropdown");
                if ( el[HAS_ATTR]('data-table-controls') )
                {
                    dt_wrapper.find(".w-table-controls").eq(0).append($(el[ATTR]('data-table-controls')));
                }
                else if ( opts.controls )
                {
                    dt_wrapper.find(".w-table-controls").eq(0).append($(opts.controls));
                }
            }
            break;
        
        case 'modal':
            if ( 'function' === typeof $.fn.modal )
                $el.modal( opts );
            break;
        
        case 'packery':
            if ( 'undefined' !== typeof Packery )
                new Packery( el, opts );
            break;
        
        case 'isotope':
            if ( 'undefined' !== typeof Isotope )
                new Isotope( el, opts );
            break;
        
        case 'masonry':
            if ( 'undefined' !== typeof Masonry )
                new Masonry( el, opts );
            break;
        
        case 'modelview':
            if ( 'undefined' !== typeof ModelView )
                $el.modelview( opts );
            break;
        
        case 'tag-editor':
            if ( 'function' === typeof $.fn.tagEditor )
                $el.tagEditor( opts );
            break;
        
        case 'wysiwyg-editor':
            /*if ( 'function' === typeof $.fn.trumbowyg )
            {
                $el.trumbowyg( opts );
                $el.closest(".trumbowyg-box").addClass("w-widget w-wysiwyg-editor-box")/*.attr("style", opts.style||'')* /;
            }*/
            if ( 'undefined' !== typeof tinymce )
            {
                locale = 'en';
                if ( htmlwidget.locale['tinymce'] )
                {
					if ( ('object' === typeof htmlwidget.locale['tinymce']) && !opts["i18n"] )
                    {
                        opts["i18n"] = htmlwidget.locale['tinymce'];
                    }
                    else if ( 'string' === typeof htmlwidget.locale['tinymce'] )
                    {
                        locale = htmlwidget.locale['tinymce'];
                    }
                }
                if ( opts["i18n"] )
                {
                    locale = 'custom_locale';
                    tinymce.util.I18n.add('custom_locale', opts["i18n"]);
                }
                var tinymce_plugins = el[HAS_ATTR]('data-tinymce-plugins') ? el[ATTR]('data-tinymce-plugins').split(',') : (opts.plugins || [
                    'advlist autolink lists link image charmap preview hr anchor pagebreak',
                    'searchreplace wordcount visualblocks visualchars code fullscreen',
                    'insertdatetime media nonbreaking save table contextmenu directionality',
                    'paste textcolor colorpicker textpattern imagetools placeholderalt codemirror' /*jbimages*/
                    ]);
                var tinymce_toolbar = el[HAS_ATTR]('data-tinymce-toolbar') ? el[ATTR]('data-tinymce-toolbar').split(',') : (opts.toolbar || [
                    'undo redo | forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image code preview' /*jbimages*/
                    ]);
                var tinymce_menubar = el[HAS_ATTR]('data-tinymce-menubar') ? el[ATTR]('data-tinymce-menubar') : (opts.menubar || 'file edit insert view format table tools');
                if ( el[HAS_ATTR]('data-tinymce-plugins-extra') )
                {
                    tinymce_plugins = tinymce_plugins.concat(el[ATTR]('data-tinymce-plugins-extra').split(','));
                }
                else if ( opts.plugins_extra )
                {
                    tinymce_plugins = tinymce_plugins.concat(opts.plugins_extra);
                }
                if ( el[HAS_ATTR]('data-tinymce-toolbar-extra') )
                {
                    tinymce_toolbar = tinymce_toolbar.concat(el[ATTR]('data-tinymce-toolbar-extra').split(','));
                }
                else if ( opts.toolbar_extra )
                {
                    tinymce_toolbar = tinymce_toolbar.concat(opts.toolbar_extra);
                }
                
                tinymce.init({
                    selector: '#'+el.id,
                    theme: el[HAS_ATTR]('data-tinymce-theme') ? el[ATTR]('data-tinymce-theme') : (opts.theme || 'modern'),
                    skin: el[HAS_ATTR]('data-tinymce-skin') ? el[ATTR]('data-tinymce-skin') : (opts.skin || 'lightgray'),
                    language: el[HAS_ATTR]('data-tinymce-lang') ? el[ATTR]('data-tinymce-lang') : (opts.language || locale),
                    directionality: el[HAS_ATTR]('data-tinymce-dir') ? el[ATTR]('data-tinymce-dir') : (opts.directionality || 'ltr'),
                    height: parseInt(el[HAS_ATTR]('data-tinymce-height') ? el[ATTR]('data-tinymce-height') : (opts.height||500) ,10),
                    plugins: tinymce_plugins,
                    toolbar: tinymce_toolbar,
                    menubar: tinymce_menubar,
                    /*menu: {
                        file: {title: 'File', items: 'newdocument'},
                        edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
                        insert: {title: 'Insert', items: 'link media | template hr'},
                        view: {title: 'View', items: 'visualaid'},
                        format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
                        table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
                        tools: {title: 'Tools', items: 'spellchecker code'}
                    },*/
                    codemirror: opts.codemirror || null,
                    placeholder: el[HAS_ATTR]('placeholder') ? el[ATTR]('placeholder') : (opts.placeholder||''),
                    automatic_uploads: null != opts.automatic_uploads ? opts.automatic_uploads : true,
                    image_advtab: null != opts.image_advtab ? opts.image_advtab : true,
                    paste_data_images: null != opts.paste_data_images ? opts.paste_data_images : true,
                    browser_spellcheck: null != opts.browser_spellcheck ? opts.browser_spellcheck : true,
                    templates: null != opts.templates ? opts.templates : [],
                    body_class: el[HAS_ATTR]('data-tinymce-body-class') ? el[ATTR]('data-tinymce-body-class') : (opts.body_class || null),
                    content_css: el[HAS_ATTR]('data-tinymce-content-css') ? el[ATTR]('data-tinymce-content-css') : (opts.content_css || null),
                    content_style: el[HAS_ATTR]('data-tinymce-content-style') ? el[ATTR]('data-tinymce-content-style') : (opts.content_style || null)
                });
            }
            break;
        
        case 'syntax-editor':
            if ( 'function' === typeof CodeMirror )
                CodeMirror.fromTextArea(el, {
                 mode             : el[HAS_ATTR]('data-cm-mode') ? el[ATTR]('data-cm-mode') : (opts.mode || 'text/html')
                ,theme            : el[HAS_ATTR]('data-cm-theme') ? el[ATTR]('data-cm-theme') : (opts.theme || 'default')
                ,lineWrapping     : null != opts.lineWrapping ? opts.lineWrapping : false
                ,lineNumbers      : null != opts.lineNumbers ? opts.lineNumbers : true
                ,indentUnit       : parseInt(el[HAS_ATTR]('data-cm-indent') ? el[ATTR]('data-cm-indent') : (opts.indentUnit || 4),10)
                ,indentWithTabs   : null != opts.indentWithTabs ? opts.indentWithTabs : false
                ,lint             : null != opts.lint ? opts.lint : false
                ,foldGutter       : null != opts.foldGutter ? opts.foldGutter : true
                ,gutters          : null != opts.gutters ? opts.gutters : ["CodeMirror-lint-markers","CodeMirror-linenumbers","CodeMirror-foldgutter"]
                });
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
        $node.find('.w-datatable').htmlwidget('datatable');
        $node.find('.w-syntax-editor').htmlwidget('syntax-editor');
        $node.find('.w-wysiwyg-editor').htmlwidget('wysiwyg-editor');
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
        else if ( $node.hasClass('w-datatable') ) $node.htmlwidget('datatable');
        else if ( $node.hasClass('w-syntax-editor') ) $node.htmlwidget('syntax-editor');
        else if ( $node.hasClass('w-wysiwyg-editor') ) $node.htmlwidget('wysiwyg-editor');
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
    if ( $node.hasClass('w-dropdown-menu') || $node.hasClass('w-vertical-menu') ) $node.htmlwidget('menu');
    if ( $node.hasClass('w-selectable') ) $node.htmlwidget('selectable');
    if ( $node.hasClass('w-removable') ) $node.htmlwidget('removable');
    if ( $node.hasClass('w-morphable') ) $node.htmlwidget('morphable');
    if ( $node.hasClass('w-delayable') ) $node.htmlwidget('delayable');
    if ( $node.hasClass('w-disabable') ) $node.htmlwidget('disabable');
    if ( $node.hasClass('w-draggable') ) $node.htmlwidget('draggable');
    if ( $node.hasClass('w-resizable') || $node.hasClass('w-resisable') ) $node.htmlwidget('resizable');
    if ( $node.hasClass('w-sortable') || $node.hasClass('w-rearrangeable') ) $node.htmlwidget('sortable');
    if ( $node.hasClass('w-templateable') ) $node.htmlwidget('template');
    if ( $node.hasClass('w-areaselectable') ) $node.htmlwidget('areaselect');
};
htmlwidget.tooltip = function( el ) {
    var $el = $(el), content = '', hasTooltip = $el.hasClass('tooltipstered');
    if ( !hasTooltip )
    {
        content = el[HAS_ATTR]('w-tooltip')
        ? el[ATTR]('w-tooltip')
        : (el[HAS_ATTR]('data-tooltip')
        ? el[ATTR]('data-tooltip')
        : (el[HAS_ATTR]('title')
        ? el[ATTR]('title')
        : ''));
        
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
            }).tooltipster('show');
        }
        else if ( el[HAS_ATTR]('title') )
        {
            el[DEL_ATTR]('title');
        }
    }
    else
    {
        $el.tooltipster('content', el[HAS_ATTR]('w-tooltip')
        ? el[ATTR]('w-tooltip')
        : (el[HAS_ATTR]('data-tooltip')
        ? el[ATTR]('data-tooltip')
        : (el[HAS_ATTR]('title')
        ? el[ATTR]('title')
        : ''))).tooltipster('show');
    }
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
    widget_able = function( ){ htmlwidget.widgetize( this ); },
    widget_tooltip = function( ){ htmlwidget.tooltip( this ); }
;

// already existing elements
$body.find('[w-init]').each( widget_init );
$body.find('.w-dropdown-menu,.w-vertical-menu,.w-templateable,.w-rearrangeable,.w-resizeable,.w-resiseable,.w-selectable,.w-removable,.w-morphable,.w-delayable,.w-disabable,.w-sortable,.w-draggable,.w-areaselectable').each( widget_able );

// dynamicaly added elements
if ( 'function' === typeof $.fn.onSelector )
{
    $body
        .onSelector('[w-init]::added', widget_init)
        .onSelector('.w-dropdown-menu::added,.w-vertical-menu::added,.w-templateable::added,.w-rearrangeable::added,.w-resizeable::added,.w-resiseable::added,.w-selectable::added,.w-removable::added,.w-morphable::added,.w-delayable::added,.w-disabable::added,.w-sortable::added,.w-draggable::added,.w-areaselectable::added', widget_able)
    ;
}

// dynamic tooltips
if ( 'function' === typeof $.fn.tooltipster )
{
    $body.on('mouseover', '[w-tooltip],[data-tooltip],[title]', widget_tooltip);
}

});

return $.htmlwidget = htmlwidget;
});