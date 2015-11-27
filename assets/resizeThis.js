/*!
 * jQuery lightweight resizable plug-in
 * Author: @0mbre
 * Licensed under the MIT license
 */

;(function( factory ) {
    /*
     * Exposes the plugin according to environment (window, AMD, CommonJS)
     */
    if ( typeof exports === 'object' ) {
        module.exports = factory( this.jQuery || require('jquery') );
    } else if ( typeof define === 'function' && define.amd ) {
        define([ 'jquery' ], function ( $ ) {
            return factory( $ );
        });
    } else {
        this.ResizeThis = factory( this.jQuery );
    }

})(function( $ ) {

    var defaults = {
        propertyName: "value",
        handles: "se",
        noNative: false,
        minSize: 10,
        maxSize: Number.POSITIVE_INFINITY,
    };

    // Helper function to test for CSS property support
    var _supports = function( property ) {
        var prefixes = [ 'Webkit', 'Moz', 'O' ];
        var supported = false;

        // Capitalize Property
        var Property = property.replace( /^./, function (match) {
            return match.toUpperCase();
        });

        // Try Vendors prefixes
        for ( var i in prefixes ) {
            // Bitwise opperation -- If any is true then property is active
            supported = supported | prefixes[ i ] + Property in document.body.style;
        }

        // Try standard syntax
        supported = supported | property in document.body.style;

        return supported;
    }

    // Helper function to disable element dragging
    var disableDragging = function ( node ) {
        // this works for FireFox and WebKit in future according to http://help.dottoro.com/lhqsqbtn.php
        node.draggable = false;

        // this works for older web layout engines
        node.onmousedown = function( event ) {
            event.preventDefault();
            return false;
        };
    };

    /*
     *  Constructor
     *  Args: DOM element, Options hash
     */
    function ResizeThis( element, options ) {
        this.el = element;
        this.$el = $( element );

        this.options = $.extend({}, defaults, options ) ;

        this._defaults = defaults;

        this.init();
    }

    /*
     *  Initializing Logic
     */
    ResizeThis.prototype.init = function() {

        // Check if native CSS resize is supported
        // and if allowed from options
        this._isNative = ! this.options.noNative && _supports( 'resize' );

        if ( this._isNative ) {
            this.$el.css({
                "resize": "both",
                "min-width": this.options.minSize + "px",
                "min-height": this.options.minSize + "px",
                "max-width": this.options.maxSize + "px",
                "max-height": this.options.maxSize + "px",
                "overflow": "hidden"
            });

        } else {
            // Insert Handles
            this._insertHandles();
        }
    };

    /*
     * Parses handle option and inject handles
     * @TODO support for more handles (right now only South East works)
     */
    ResizeThis.prototype._insertHandles = function() {
        this.handles = this.options.handles;

        // Makes sure that the element has a position attribute
        if ( this.el.style.position === '' ) {
            this.el.style.position = 'relative'
        }

        if ( this.handles === "all") {
            this.handles = "n,e,s,w,se,sw,ne,nw";
        }

        var n = this.handles.split(",");

        for( var i = 0; i < n.length; i++ ) {
            var handle = $.trim( n[i] );
            var $handle = $( "<div class='rt-handle'></div>" );
            $handle.css({ zIndex: 2999 });
            disableDragging( $handle[0] );
            $handle.on( 'mousedown.rtStart', $.proxy(this._mouseStart, this) );
            this.$el.append( $handle );
        }
    }

    /*
     * Mouse Start Handler
     */
    ResizeThis.prototype._mouseStart = function ( evt ) {
        // Trigger start event
        this.$el.trigger( "rt:start" );

        if ( ! this._isNative ) {
            var width = this.$el.innerWidth();
            var height = this.$el.innerHeight();
            $( document ).on( 'mousemove.rtMove', $.proxy(this._mouseDrag, this) );
            $( document ).on( 'mouseup.rtStop', $.proxy(this._mouseStop, this) );
            this._startPos = {
                x: evt.pageX,
                y: evt.pageY,
            }

            this._startSize = {
                x: width,
                y: height
            }
        }
    }

    /*
     * Mouse Stop Handler
     */
    ResizeThis.prototype._mouseStop = function ( evt ) {
        // Trigger stop event
        this.$el.trigger( "rt:stop" );
        $( document ).off( 'mousemove.rtMove' );
        $( document ).off( 'mouseup.rtStop' );
    }

    /*
     * Mouse Move Handler
     */
    ResizeThis.prototype._mouseDrag = function( evt ) {
        // Trigger resizing event
        this.$el.trigger( "rt:resizing" );
        if ( ! this._isNative ) {
             var XY = {
                x: evt.pageX - this._startPos.x,
                y: evt.pageY - this._startPos.y
            }
             this._resize( XY );
        }
    }

    /*
     * Resizing Logic
     */
    ResizeThis.prototype._resize = function( XY ) {
        var sX = this._startSize.x;
        var sY = this._startSize.y;

        // New size to be applied to the element
        var nWidth = sX + XY.x;
        var nHeight = sY + XY.y;

        // Make sure that size can not be lower than the minSize & maxSize value
        var min = this.options.minSize;
        var max = this.options.maxSize;

        // Nested Ternary
        nWidth = nWidth < min ? min :
            nWidth > max ? max :
                nWidth;
        nHeight = nHeight < min ? min :
            nHeight > max ? max :
                nHeight;

        this.$el.css({
            width: nWidth,
            height: nHeight
        })
    }

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn.resizeThis = function ( options ) {
        return this.each(function () {
            new ResizeThis( this, options );
        });
    }

    /*
     * Static defaults setter
     */
    $.fn.resizeThis._setDefaults = function ( defaultsObj ) {
         defaults = $.extend( defaults, defaultsObj ) ;
    }

})

