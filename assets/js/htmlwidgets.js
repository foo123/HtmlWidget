/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery
*  @version: 0.1
*  https://github.com/foo123/HtmlWidget
*
**/
!function($, HtmlWidget, undef){
"use strict";

var slice = Array.prototype.slice;

// adapted from jquery-ui
function widget2jquery( name, widget )
{
    $.fn[ name ] = function( options ) {
        var method = "string" === typeof options ? options : false,
            args = slice.call( arguments, 1 ), return_value = this;

        if ( method ) 
        {
            this.each(function( ){
                var method_value,
                    instance = $.data( this, name );

                if ( "instance" === options ) 
                {
                    return_value = instance;
                    return false;
                }
                
                if ( !instance ) return false;
                
                if ( "dispose" === options ) 
                {
                    if ( 'function' === typeof instance.dispose ) instance.dispose( );
                    instance = null;
                    $.removeData( this, name );
                    return false;
                }
                
                if ( 'function' !== typeof instance[method] ) return false;

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
                    instance.option( options || {} );
                } 
                else 
                {
                    $.data( this, name, new widget( options, this ) );
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
    self.morph = function( mode ) {
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
widget2jquery( 'morphable', $.htmlwidget.morphable );

if ( HtmlWidget )
{
    $.HtmlWidget = function( widget, attr, data ) {
        return $( HtmlWidget.widget( widget, attr, data ) );
    };
}

/*
$(function(){
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
});
*/

}(jQuery, 'undefined' !== HtmlWidget ? HtmlWidget : null);