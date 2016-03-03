/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery, SelectorListener
*  @version: 0.8.7
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/responsive.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/modelview-widgets
*  https://github.com/foo123/SelectorListener
*
**/
!function( root, name, factory ) {
"use strict";
var m;
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.EXPORTED_SYMBOLS = [ name ]) && (root[ name ] = factory.call( root ));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    module.exports = factory.call( root );
else if ( ('function'===typeof(define))&&define.amd&&('function'===typeof(require))&&('function'===typeof(require.specified))&&require.specified(name) ) /* AMD */
    define(name,['require','exports','module'],function( ){return factory.call( root );});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[ name ] = (m=factory.call( root )))&&('function'===typeof(define))&&define.amd&&define(function( ){return m;} );
}(  /* current root */          this, 
    /* module name */           "HtmlWidget",
    /* module factory */        function( undef ) {
"use strict";

var HAS = 'hasOwnProperty', ATTR = 'setAttribute',
    KEYS = Object.keys, json_encode = JSON.stringify, toString = Object.prototype.toString,
    isXPCOM = ("undefined" !== typeof Components) && ("object" === typeof Components.classes) && ("object" === typeof Components.classesByID) && Components.utils && ("function" === typeof Components.utils['import']),
    isNode = ("undefined" !== typeof global) && ('[object global]' === toString.call(global)),
    isWebWorker = !isXPCOM && !isNode && ('undefined' !== typeof WorkerGlobalScope) && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator),
    isBrowser = !isXPCOM && !isNode && !isWebWorker,
    GID = 0, self, widgets = {}, enqueuer = null;

// http://php.net/manual/en/function.empty.php
function isset( o, p )
{
    // not set or null; or empty string/array
    return o[HAS](p) && (null != o[p]);
}
function empty( o, p )
{
    // not set or null; or empty string/array
    return !o[HAS](p) || (null == o[p]) || ("function"=== typeof (o[p].substr||o[p].concat) && !o[p].length);
}
function merge( a, b )
{
    var k, c = {};
    for (k in a) if ( a[HAS](k) ) c[k] = a[k];
    if ( b )
    {
        for (k in b) if ( b[HAS](k) ) c[k] = b[k];
    }
    return c;
}

function data_attr( k, v )
{
    if ( 'object' === typeof v )
    {
        var attr = '', k1;
        for (k1 in v)
        {
            if ( !v[HAS](k1) ) continue;
            attr += (!attr.length ? '' : ' ') + data_attr( k+'-'+k1, v[k1] );
        }
        return attr;
    }
    else
    {
        return ""+k+"='"+v+"'";
    }
}
    

var HtmlWidget = self = {
    
    VERSION: "0.8.7"
    
    ,BASE: './'
    
    ,enqueueAssets: function( _enqueuer ) {
        enqueuer = _enqueuer && 'function' === typeof _enqueuer ? _enqueuer : null;
    }
    
    ,enqueue: function( type, id, asset, deps ) {
        if ( enqueuer )
        {            
            /*if ( isBrowser )
                // add a small delay for browser to load asset after widget has been output
                setTimeout(function( ){ enqueuer(type, id, asset||null, deps||[]); }, 10);
            else*/
                enqueuer(type, id, asset||null, deps||[]);
        }
    }
    
    ,assets: function( base, full, jquery, dev, cdn ) {
        base = base || '';
        base = base + ('/' === base.slice(-1) ? '' : '/');
        var asset_base = base + 'assets/';
        dev = true === dev;
        var assets = [
         ['styles', 'htmlwidgets.css', dev ? base+'htmlwidgets.dev.css' : base+'htmlwidgets.css']
        ,['styles', 'normalize.css', asset_base+'normalize.css']
        ,['styles', 'responsive.css', asset_base+'responsive.css']
        ,['styles', 'fontawesome.css', asset_base+'fontawesome.css']
        ,['scripts', 'selectorlistener', asset_base+'selectorlistener.js']
        ,['scripts', 'htmlwidgets', dev ? base+'htmlwidgets.dev.js' : base+'htmlwidgets.js', ['htmlwidgets.css','jquery','selectorlistener']]
        ];
        if ( true === jquery )
        {
            assets.push(['scripts', 'jquery', asset_base+'jquery.js']);
            assets.push(['scripts', 'jquery-ui', asset_base+'jquery-ui.js', ['jquery']]);
            //assets.push(['scripts', 'jquery-iframe-transport', asset_base+'jquery.iframe-transport.js', ['jquery']]);
        }
        if ( arguments.length < 2 || true === full )
        {
            assets = assets.concat([
            //  external APIS
             ['scripts', '-external-google-maps-api', 'http://maps.google.com/maps/api/js?libraries=places']
            
            // Tao
            ,['scripts', 'tao', asset_base+'tao.js']
            
            // Humane
            ,['styles', 'humane.css', asset_base+'humane.css']
            ,['scripts', 'humane', asset_base+'humane.js', ['humane.css']]
            
            // History
            ,['scripts', 'history', asset_base+'history.js']
            
            // Cookie
            ,['scripts', 'cookie', asset_base+'cookie.js']
            
            // Modernizr
            ,['scripts', 'modernizr', asset_base+'modernizr.js']
            
            // html5media
            ,['scripts', 'html5media', asset_base+'html5media/html5media.js']
            
            // video.js
            ,['styles', 'video-js.css', asset_base+'video.js/video-js.css']
            ,['scripts', 'video.js', asset_base+'video.js/video.js', ['video-js.css']]
            
            // Serialiser
            ,['scripts', 'serialiser', asset_base+'serialiser.js']
            
            // Timer
            ,['scripts', 'timer', asset_base+'timer.js']
            
            // DateX
            ,['scripts', 'datex', asset_base+'datex.js']
            
            // SunDial
            //,['styles', 'sundial.css', asset_base+'sundial.css']
            //,['scripts', 'sundial', asset_base+'sundial.js', ['sundial.css','datex']]
             
            // Pikadaytime
            ,['styles', 'pikadaytime.css', asset_base+'pikadaytime.css']
            ,['scripts', 'pikadaytime', asset_base+'pikadaytime.js', ['pikadaytime.css','datex']]
             
            // ColorPicker
            ,['styles', 'colorpicker.css', asset_base+'colorpicker.css']
            ,['scripts', 'colorpicker', asset_base+'colorpicker.js', ['colorpicker.css']]
             
            // AreaSelect
            ,['styles', 'areaselect.css', asset_base+'areaselect.css']
            ,['scripts', 'areaselect', asset_base+'areaselect.js', ['areaselect.css']]
             
            // LocationPicker
            ,['scripts', 'locationpicker', asset_base+'locationpicker.js', ['-external-google-maps-api','jquery']]
             
            // RangeSlider
            ,['styles', 'rangeslider.css', asset_base+'rangeslider.css']
            ,['scripts', 'rangeslider', asset_base+'rangeslider.js', ['rangeslider.css','jquery']]
             
            // Sortable
            ,['scripts', 'sortable', asset_base+'sortable.js']
             
            // TinyDraggable
            ,['scripts', 'tinydraggable', asset_base+'tinydraggable.js']
             
            // Select2
            ,['styles', 'select2.css', asset_base+'select2.css']
            ,['scripts', 'select2', asset_base+'select2.js', ['select2.css','jquery']]
             
            // Awesomplete
            ,['styles', 'awesomplete.css', asset_base+'awesomplete.css']
            ,['scripts', 'awesomplete', asset_base+'awesomplete.js', ['awesomplete.css']]
             
            // AutoComplete
            ,['styles', 'autocomplete.css', asset_base+'autocomplete.css']
            ,['scripts', 'autocomplete', asset_base+'autocomplete.js', ['autocomplete.css']]
             
            // TagEditor
            ,['scripts', 'caret', asset_base+'caret.js']
            ,['styles', 'tageditor.css', asset_base+'tageditor.css']
            ,['scripts', 'tageditor', asset_base+'tageditor.js', ['tageditor.css','jquery','caret']]
             
            // Tooltipster
            ,['styles', 'tooltipster.css', asset_base+'tooltipster.css']
            ,['scripts', 'tooltipster', asset_base+'tooltipster.js', ['tooltipster.css','jquery']]
             
            // Popr2
            ,['styles', 'popr2.css', asset_base+'popr2.css']
            ,['scripts', 'popr2', asset_base+'popr2.js', ['popr2.css','jquery']]
            
            // Modal
            ,['styles', 'modal.css', asset_base+'modal.css']
            ,['scripts', 'modal', asset_base+'modal.js', ['modal.css','jquery']]
             
            // ModelView
            ,['scripts', 'modelview', asset_base+'modelview.js']
             
            // ModelViewForm
            ,['scripts', 'modelviewform', asset_base+'modelview.form.js', ['jquery','datex','modelview']]
             
            // smoothState
            ,['scripts', 'smoothstate', asset_base+'smoothState.js', ['jquery']]
             
            // Packery
            ,['scripts', 'packery', asset_base+'packery.js']
             
            // Isotope
            ,['scripts', 'isotope', asset_base+'isotope.js']
             
            // Masonry
            ,['scripts', 'masonry', asset_base+'masonry.js']
             
            // ImTranslator
            //,[]
            
            // MathJax
            ,['scripts', 'mathjax', asset_base+'mathjax/MathJax.js?config=TeX-AMS_HTML-full']
            
            // DataTables
            ,['styles', 'datatables.css', asset_base+'datatables/css/datatables.css']
            ,['scripts', 'datatables', asset_base+'datatables/js/datatables.js', ['datatables.css','jquery']]
            ,['styles-composite', 'datatables-extra.css', [
                asset_base+'datatables/css/responsive.datatables.css',
                asset_base+'datatables/css/buttons.datatables.css',
                asset_base+'datatables/css/select.datatables.css',
                asset_base+'datatables/css/colreorder.datatables.css',
                asset_base+'datatables/css/rowreorder.datatables.css'
            ], ['datatables.css']]
            ,['scripts-composite', 'datatables-extra', [
                asset_base+'datatables/js/datatables.responsive.js',
                asset_base+'datatables/js/datatables.buttons.js',
                asset_base+'datatables/js/datatables.select.js',
                asset_base+'datatables/js/datatables.colreorder.js',
                asset_base+'datatables/js/datatables.rowreorder.js'
            ], ['datatables-extra.css','datatables']]
            ,['styles-composite', 'datatables-all.css', [
                asset_base+'datatables/css/responsive.datatables.css',
                asset_base+'datatables/css/buttons.datatables.css',
                asset_base+'datatables/css/select.datatables.css',
                asset_base+'datatables/css/colreorder.datatables.css',
                asset_base+'datatables/css/rowreorder.datatables.css',
                asset_base+'datatables/css/autofill.datatables.css',
                asset_base+'datatables/css/fixedcolumns.datatables.css',
                asset_base+'datatables/css/fixedheader.datatables.css',
                asset_base+'datatables/css/scroller.datatables.css',
                asset_base+'datatables/css/keytable.datatables.css'
            ], ['datatables.css']]
            ,['scripts-composite', 'datatables-all', [
                asset_base+'datatables/js/datatables.responsive.js',
                asset_base+'datatables/js/datatables.buttons.js',
                asset_base+'datatables/js/datatables.select.js',
                asset_base+'datatables/js/datatables.colreorder.js',
                asset_base+'datatables/js/datatables.rowreorder.js',
                asset_base+'datatables/js/datatables.autofill.js',
                asset_base+'datatables/js/datatables.fixedcolumns.js',
                asset_base+'datatables/js/datatables.fixedheader.js',
                asset_base+'datatables/js/datatables.scroller.js',
                asset_base+'datatables/js/datatables.keytable.js'
            ], ['datatables-all.css','datatables']]
            
            // Tinymce
            ,['scripts', 'tinymce-cdn', '//cdn.tinymce.com/4/tinymce.min.js']
            ,['scripts', 'tinymce', asset_base+'tinymce/tinymce.min.js']
             
            // Trumbowyg
            ,['styles', 'trumbowyg.css', asset_base+'trumbowyg.css']
            ,['scripts', 'trumbowyg', asset_base+'trumbowyg.js', ['trumbowyg.css','jquery']]
             
            // CodeMirror
            ,['styles', 'codemirror.css', asset_base+'codemirror/lib/codemirror.css']
            ,['styles', 'codemirror-fold.css', asset_base+'codemirror/addon/fold/foldgutter.css', ['codemirror.css']]
            ,['scripts-composite', 'codemirror-fold', [
                asset_base+'codemirror/addon/fold/foldgutter.js',
                asset_base+'codemirror/addon/fold/foldcode.js',
                asset_base+'codemirror/addon/fold/comment-fold.js',
                asset_base+'codemirror/addon/fold/brace-fold.js',
                asset_base+'codemirror/addon/fold/indent-fold.js',
                asset_base+'codemirror/addon/fold/xml-fold.js'
            ], ['codemirror-fold.css','codemirror']]
            ,['scripts-composite', 'codemirror-htmlmixed', [
                asset_base+'codemirror/mode/xml/xml.js',
                asset_base+'codemirror/mode/javascript/javascript.js',
                asset_base+'codemirror/mode/css/css.js',
                asset_base+'codemirror/mode/htmlmixed/htmlmixed.js'
            ], ['codemirror']]
            ,['scripts-composite', 'codemirror', [
                asset_base+'codemirror/lib/codemirror.js',
                asset_base+'codemirror/addon/mode/multiplex.js',
                asset_base+'codemirror/addon/comment/comment.js'
            ], ['codemirror.css']]
            ]);
        }
        return assets;
    }
    
    ,i18n: function( locale, base, all ) {
        if ( !locale ) return [];
        base = base || '';
        base = base + ('/' === base.slice(-1) ? '' : '/');
        var asset_base = base + 'assets/';
        var i18n = [
         ['pikadaytime', asset_base+'i18n/pikadaytime/'+locale+'.json']
        ,['datex', asset_base+'i18n/datex/'+locale+'.json']
        ,['datatables', asset_base+'datatables/langs/'+locale+'.json']
        ];
        if ( true === all )
        {
            i18n = i18n.concat([
             ['tinymce', asset_base+'tinymce/langs/'+locale+'.js']
            ,['video-js', asset_base+'video.js/lang/'+locale+'.js']
            ]);
        }
        return i18n;
    }
    
    ,uuid: function( prefix, suffix ) {
        prefix = prefix || "widget";
        suffix = suffix || (isNode ? "static2" : "dynamic");
        return [prefix, new Date().getTime(), ++GID, ~~(1000*Math.random()), suffix].join("_");
    }
    
    ,data: function( attr, ctx ) {
        var d_attr = '';
        if ( arguments.length < 2 ) ctx = 'data';
        if ( !!ctx && attr[HAS](ctx) && ('object' === typeof attr[ctx]) )
        {
            var k, attr_ctx = attr[ctx];
            for(k in attr_ctx)
            {
                if ( !attr_ctx[HAS](k) ) continue;
                d_attr += (!d_attr.length ? '' : ' ') + data_attr( ctx+'-'+k, attr_ctx[k] );
            }
        }
        return d_attr;
    }
    
    ,attributes: function( attr, atts ) {
        if ( !atts || !attr ) return '';
        var attrs = [], i, l = atts.length, k, v;
        for (i=0; i<l; i++)
        {
            k = atts[i];
            if ( attr[HAS](k) && (null != attr[k]) )
            {
                if ( 'data' == k )
                {
                    attrs.push(self.data(attr));
                }
                else
                {
                    v = attr[k];
                    attrs.push(''+k+'="'+v+'"');
                }
            }
        }
        return attrs.length ? attrs.join(' ') : '';
    }
    
    ,options: function( opts, key, value ) {
        var options = [], o_key, o_val, k, v, l;
        opts = opts || {};
        if ( 'function' === opts.concat  )
        {
            for (k=0,l=opts.length; k<l; k++)
            {
                v = opts[k];
                
                o_key = null;
                if ( -1 === key )
                {
                    o_key = k;
                }
                else if ( null != key )
                {
                    if ( isset(v, key) )
                        o_key = v[key];
                }
                
                o_val = null;
                if ( null != value )
                {
                    if ( isset(v,value) )
                        o_val = v[value];
                }
                else
                {
                    o_val = v;
                }
                if ( null === o_key ) o_key = o_val;
                options.push([o_key, o_val]);
            }
        }
        else
        {
            for (k in opts)
            {
                if ( !opts[HAS](k) ) continue;
                v = opts[k];
                
                o_key = null;
                if ( -1 === key )
                {
                    o_key = k;
                }
                else if ( null != key )
                {
                    if ( isset(v, key) )
                        o_key = v[key];
                }
                
                o_val = null;
                if ( null != value )
                {
                    if ( isset(v,value) )
                        o_val = v[value];
                }
                else
                {
                    o_val = v;
                }
                if ( null === o_key ) o_key = o_val;
                options.push([o_key, o_val]);
            }
        }
        return options;
    }
    
    ,addWidget: function( widget, renderer ) {
        if ( widget && "function"===typeof renderer )
            widgets['w_'+widget] = renderer;
        else if ( widget && false === renderer && widgets[HAS]('w_'+widget) )
            delete widgets['w_'+widget];
    }
    
    ,widget: function( widget, attr, data ) {
        var out = '';
        if ( widget )
        {
            attr = attr || {}; data = data || {};
            if ( widgets[HAS]('w_'+widget) )
                return widgets['w_'+widget](attr, data);
            
            if ( "audio" === widget ) attr["type"] = "audio";
            else if ( "video" === widget ) attr["type"] = "video";
            else if ( "checkbox-list" === widget || "checklist" === widget ) attr["type"] = "checkbox";
            else if ( "radiobox-list" === widget || "radio-list" === widget || "radiolist" === widget ) attr["type"] = "radio";
            else if ( "checkbox-image" === widget ) attr["type"] = "checkbox";
            else if ( "radio-image" === widget ) attr["type"] = "radio";
            else if ( "checkbox" === widget ) attr["type"] = "checkbox";
            else if ( "radio" === widget ) attr["type"] = "radio";
            else if ( "datetime" === widget || 'datetimepicker' === widget ) attr["time"] = true;
            else if ( "select2" === widget ) attr["select2"] = true;
            else if ( "dropdown" === widget ) attr["dropdown"] = true;
            else if ( "datatable" === widget ) attr["datatable"] = true;
            else if ( "syntax-editor" === widget || "source-editor" === widget || "syntax" === widget || "source" === widget || "highlight-editor" === widget || "highlighter" === widget ) attr["syntax-editor"] = true;
            else if ( "wysiwyg-editor" === widget || "wysiwyg" === widget || "rich-editor" === widget || "rich" === widget || "editor" === widget ) attr["wysiwyg-editor"] = true;
            
            switch( widget )
            {
            case 'empty':       out = self.w_empty(attr, data); break;
            case 'sep':
            case 'separator':   out = self.w_sep(attr, data); break;
            case 'icon':        out = self.w_icon(attr, data); break;
            case 'delayable':   out = self.w_delayable(attr, data); break;
            case 'disabable':   out = self.w_disabable(attr, data); break;
            case 'morphable':   out = self.w_morphable(attr, data); break;
            case 'pages':       out = self.w_pages(attr, data); break;
            case 'tabs':        out = self.w_tabs(attr, data); break;
            case 'accordeon':   out = self.w_accordeon(attr, data); break;
            case 'panel':       out = self.w_panel(attr, data); break;
            case 'endpanel':
            case 'end_panel':
            case 'panel_end':   out = self.w_panel_end(attr, data); break;
            case 'dialog':      out = self.w_dialog(attr, data); break;
            case 'modal':       out = self.w_modal(attr, data); break;
            case 'endmodal':
            case 'end_modal':
            case 'modal_end':   out = self.w_modal_end(attr, data); break;
            case 'tooltip':     out = self.w_tooltip(attr, data); break;
            case 'link':        out = self.w_link(attr, data); break;
            case 'button':      out = self.w_button(attr, data); break;
            case 'label':       out = self.w_label(attr, data); break;
            case 'uploader':
            case 'upload':
            case 'dnd-uploader':
            case 'dnd-upload':
            case 'drag-n-drop-uploader':
            case 'drag-n-drop-upload':
                                out = self.w_dnd_upload(attr, data); break;
            /*case 'uploader':
            case 'upload':      out = self.w_upload(attr, data); break;*/
            case 'file':        out = self.w_file(attr, data); break;
            case 'suggestbox':
            case 'suggest':     out = self.w_suggest(attr, data); break;
            case 'textbox':
            case 'textfield':
            case 'text':        out = self.w_text(attr, data); break;
            case 'imtranslator':
            case 'translator':  out = self.w_translator(attr, data); break;
            case 'editor':
            case 'rich-editor':
            case 'rich':
            case 'wysiwyg-editor':
            case 'wysiwyg':
            case 'source-editor':
            case 'source':
            case 'syntax-editor':
            case 'syntax':
            case 'highlight-editor':
            case 'highlighter':
            case 'textarea':    out = self.w_textarea(attr, data); break;
            case 'datetimepicker':
            case 'datepicker':
            case 'datetime':
            case 'date':        out = self.w_date(attr, data); break;
            case 'time':        out = self.w_time(attr, data); break;
            case 'timer':       out = self.w_timer(attr, data); break;
            case 'colorpicker':
            case 'colorselector':
            case 'color':       out = self.w_color(attr, data); break;
            case 'rating':      out = self.w_rating(attr, data); break;
            case 'map':
            case 'gmap':        out = self.w_gmap(attr, data); break;
            case 'radiobox-list':
            case 'radio-list':
            case 'radiolist':
            case 'checkbox-list':
            case 'checklist':   out = self.w_control_list(attr, data); break;
            case 'checkbox-image':
            case 'radio-image':
            case 'checkbox':
            case 'radio':
            case 'control':     out = self.w_control(attr, data); break;
            case 'switch':      out = self.w_switch(attr, data); break;
            case 'dropdown':
            case 'selectbox':
            case 'select2':
            case 'select':      out = self.w_select(attr, data); break;
            case 'menu':        out = self.w_menu(attr, data); break;
            case 'endmenu':
            case 'end_menu':
            case 'menu_end':    out = self.w_menu_end(attr, data); break;
            case 'datatable':
            case 'table':       out = self.w_table(attr, data); break;
            case 'animation':   out = self.w_animation(attr, data); break;
            case 'flash':
            case 'swf':         out = self.w_swf(attr, data); break;
            case 'video':
            case 'audio':
            case 'media':       out = self.w_media(attr, data); break;
            default: out = ''; break;
            }
        }
        return out;
    }
    
    ,w_empty: function( attr, data ) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    ,w_sep: function( attr, data ) {
        var wclass, wstyle;
        wclass = 'w-separator'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div class="'+wclass+'" '+wstyle+'></div>';
    }
    
    ,w_icon: function( attr, data ) {
        var wclass, wstyle, wextra, wtitle;
        wclass = 'fa'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        if ( !empty(attr,'icon') ) wclass += ' fa-'+attr['icon'];
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wextra = self.attributes(attr,['data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<i class="'+wclass+'" '+wstyle+' '+wtitle+' '+wextra+'></i>';
    }
    
    ,w_label: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wfor, wtext, wtitle;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wfor = isset(attr,"for") ? 'for="'+attr['for']+'"' : '';
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-widget w-label'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        if ( !empty(attr,'icon') )
        {
            wclass += ' w-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            wclass += ' w-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        // iOS needs an onlick attribute to handle lable update if used as controller
        return '<label id="'+wid+'" '+wfor+' class="'+wclass+'" title="'+wtitle+'" '+wstyle+' onclick="" '+wextra+'>'+wtext+'</label>';
    }
    
    ,w_link: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtitle, whref, wfor, wtext;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-link'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        if ( !empty(attr,'icon') )
        {
            wclass += ' w-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            wclass += ' w-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        if ( isset(attr,'for') )
        {
            wfor = attr['for'];
            return '<label id="'+wid+'" class="'+wclass+'" '+wstyle+' onclick="" title="'+wtitle+'" for="'+wfor+'" '+wextra+'>'+wtext+'</label>';
        }
        else
        {
            whref = isset(attr,'href') ? attr['href'] : '#';
            wextra += ' '+self.attributes(attr,['target','rel']);
            return '<a id="'+wid+'" class="'+wclass+'" '+wstyle+' title="'+wtitle+'" href="'+whref+'" '+wextra+'>'+wtext+'</a>';
        }
    }
    
    ,w_button: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtype, wtitle, wtext, whref, wfor;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-widget w-button'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        if ( !empty(attr,'icon') )
        {
            if ( !wtext.length ) wclass += ' w-icon-only';
            else wclass += ' w-icon';
            wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            if ( !wtext.length ) wclass += ' w-icon-only';
            else wclass += ' w-icon-right';
            wtext = wtext + "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        if ( isset(attr,'for') )
        {
            wfor = attr['for'];
            return '<label id="'+wid+'" for="'+wfor+'" class="'+wclass+'" '+wstyle+' onclick="" title="'+wtitle+'" '+wextra+'>'+wtext+'</label>';
        }
        else if ( isset(attr,'href') )
        {
            whref = attr['href'];
            wextra += ' '+self.attributes(attr,['target','rel']);
            return '<a id="'+wid+'" href="'+whref+'" class="'+wclass+'" '+wstyle+' title="'+wtitle+'" '+wextra+'>'+wtext+'</a>';
        }
        else
        {
            wtype = isset(attr,'type') ? attr['type'] : 'button';
            return '<button id="'+wid+'" type="'+wtype+'" class="'+wclass+'" '+wstyle+' title="'+wtitle+'" '+wextra+'>'+wtext+'</button>';
        }
    }
    
    ,w_control: function( attr, data ) {
        var wid, wclass, wstyle, wctrl, wextra, wtitle, wchecked, wvalue, wname, wtype, wstate, wimg;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1"; 
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wchecked = !empty(attr,'checked') && attr['checked'] ? 'checked' : '';
        if ( !empty(attr,'image') )
        {
            wctrl = "checkbox" === wtype ? 'w-checkbox-image' : 'w-radio-image';
            wimg = '<span style="background-image:url('+attr['image']+');"></span>';
        }
        else
        {
            wctrl = "checkbox" === wtype ? 'w-checkbox' : 'w-radio';
            wimg = '&nbsp;';
        }
        wclass = 'w-widget w-control'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wstate = '';
        if ( isset(attr,'state-on') ) wstate += ' data-state-on="'+attr['state-on']+'"';
        if ( isset(attr,'state-off') ) wstate += ' data-state-off="'+attr['state-off']+'"';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<input type="'+wtype+'" id="'+wid+'" '+wname+' class="'+wctrl+'" value="'+wvalue+'" '+wextra+' '+wchecked+' /><label for="'+wid+'" '+wtitle+' class="'+wclass+'" '+wstyle+' '+wstate+' onclick="">'+wimg+'</label>';
    }
    
    ,w_control_list: function( attr, data ) {
        var wid, wname, wclass, wstyle, wextra, wvalue, woptions,
            w_item_atts, w_item_class, w_large, w_xlarge, i, l, opt, widget;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? attr["name"] : null;
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1"; 
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        woptions = [].concat(data['options']);
        wvalue = isset(data,'value') ? data['value'] : "";
        wclass = !empty(attr,"class") ? attr["class"] : '';
        w_large = !!wclass && (-1 !== (' '+wclass+' ').indexOf(' w-large '));
        w_xlarge = !!wclass && (-1 !== (' '+wclass+' ').indexOf(' w-xlarge '));
        w_item_atts = self.attributes(attr,['readonly','disabled','data']);
        if ( 'radio' == wtype )
        {
            if ( w_xlarge ) w_item_class = 'w-xlarge';
            else if ( w_large ) w_item_class = 'w-large';
            else w_item_class = '';
            widget = '<ol id="'+wid+'" class="w-control-list w-radio-list '+wclass+'" '+wstyle+' '+wextra+'>';
            for (i=0,l=woptions.length; i<l; i++)
            {
                opt = woptions[i];
                widget += '<li class="w-control-list-option">'+self.widget('radio',{
                    'id'        : wid+'_option_'+(i+1),
                    'name'      : wname,
                    'class'     : w_item_class,
                    'title'     : opt[1],
                    'checked'   : opt[0] == wvalue,
                    'extra'     : w_item_atts
                },{
                    'value'     : opt[0]
                })+' '+self.widget('label',{
                    'for'           : wid+'_option_'+(i+1),
                    'class'         : 'w-control-list-option-label',
                    'title'         : opt[1]
                },{
                    'text'          : opt[1]
                })+'</li>';
            }
            widget += '</ol>';
        }
        else
        {
            wvalue = [].concat(wvalue);
            if ( w_xlarge ) w_item_class = 'w-xlarge';
            else if ( w_large ) w_item_class = 'w-large';
            else w_item_class = '';
            widget = '<ul id="'+wid+'" class="w-control-list w-checkbox-list '+wclass+'" '+wstyle+' '+wextra+'>';
            for (i=0,l=woptions.length; i<l; i++)
            {
                opt = woptions[i];
                widget += '<li class="w-control-list-option">'+self.widget('checkbox',{
                    'id'        : wid+'_option_'+(i+1),
                    'name'      : wname,
                    'class'     : w_item_class,
                    'title'     : opt[1],
                    'checked'   : -1 < wvalue.indexOf(opt[0]),
                    'extra'     : w_item_atts
                },{
                    'value'     : opt[0]
                })+' '+self.widget('label',{
                    'for'           : wid+'_option_'+(i+1),
                    'class'         : 'w-control-list-option-label',
                    'title'         : opt[1]
                },{
                    'text'          : opt[1]
                })+'</li>';
            }
            widget += '</ul>';
        }
        self.enqueue('styles', 'htmlwidgets.css');
        return widget;
    }
    
    ,w_switch: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtitle, wchecked, wiconon, wiconoff, wvalue, wvalue2, wdual, wname, wtype, wreverse, wstates, wswitches;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1"; 
        wvalue2 = isset(data,"valueoff") ? data["valueoff"] : false;
        wdual = false !== wvalue2;
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wchecked = !empty(attr,'checked') && attr['checked'];
        wclass = 'w-widget w-switch'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wreverse = !empty(attr,"reverse")&&attr["reverse"];
        wiconon='&nbsp;'; wiconoff='&nbsp;';
        if ( !empty(attr,"iconon") && empty(attr,"iconoff") )
        {
            wiconon = '<i class="fa fa-'+attr.iconon+' not-negative"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconon+' negative"></i>';
        }
        else if ( !empty(attr,"iconoff") && empty(attr,"iconon") )
        {
            wiconon = '<i class="fa fa-'+attr.iconoff+' positive"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconoff+' not-positive"></i>';
        }
        else if ( !empty(attr,"iconon") && !empty(attr,"iconoff") )
        {
            wiconon = '<i class="fa fa-'+attr.iconon+'"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconoff+'"></i>';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        if ( wdual )
        {
            // dual switch with separate on/off states
            wclass += ' dual';
            wtype = 'radio';
            if ( wchecked )
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="w-switch-state w-state-on" value="'+wvalue+'" '+wextra+' checked /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="w-switch-state w-state-off" value="'+wvalue2+'" '+wextra+' />';
            }
            else
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="w-switch-state w-state-on" value="'+wvalue+'" '+wextra+' /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="w-switch-state w-state-off" value="'+wvalue2+'" '+wextra+' checked />';
            }
            if ( wreverse ) 
            {
                wclass += ' reverse';
                wswitches = '<label for="'+wid+'-off" class="w-switch-off" onclick="">'+wiconoff+'</label><label for="'+wid+'-on" class="w-switch-on" onclick="">'+wiconon+'</label>';
            }
            else
            {
                wswitches = '<label for="'+wid+'-on" class="w-switch-on" onclick="">'+wiconon+'</label><label for="'+wid+'-off" class="w-switch-off" onclick="">'+wiconoff+'</label>';
            }
        }
        else
        {
            // switch with one state for on/off
            if ( wchecked ) wchecked = 'checked';
            wstates = '<input type="'+wtype+'" id="'+wid+'" '+wname+' class="w-switch-state" value="'+wvalue+'" '+wextra+' '+wchecked+' />';
            if ( wreverse ) 
            {
                wclass += ' reverse';
                wswitches = '<label for="'+wid+'" class="w-switch-off" onclick="">'+wiconoff+'</label><label for="'+wid+'" class="w-switch-on" onclick="">'+wiconon+'</label>';
            }
            else
            {
                wswitches = '<label for="'+wid+'" class="w-switch-on" onclick="">'+wiconon+'</label><label for="'+wid+'" class="w-switch-off" onclick="">'+wiconoff+'</label>';
            }
        }
        self.enqueue('styles', 'htmlwidgets.css');
        return '<span class="'+wclass+'" '+wtitle+' '+wstyle+'>'+wstates+wswitches+'<span class="w-switch-handle"></span></span>';
    }
    
    ,w_rating: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wvalue, wratings, wname, wtitle, wtext, wicon,
            r, rate, label, widget, wchecked, w_item_atts, w_icon;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : 'name="__rating_'+wid+'"';
        wvalue = isset(data,'value') ? data['value'] : "";
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wtext = !empty(data,'text') ? data['text'] : '';
        wclass = 'w-rating'; if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wicon = !empty(attr,"icon") ? attr["icon"] : 'star';
        w_item_atts = self.attributes(attr,['readonly','disabled','data']);
        wextra = !empty(attr,"extra") ? (' '+attr["extra"]) : '';
        wratings = !empty(data,"ratings") && (data["ratings"] instanceof Array) ? data["ratings"] : self.options({'1':'1','2':'2','3':'3','4':'4','5':'5'},-1);
        widget = "<fieldset id=\""+wid+"\" "+wtitle+" class=\""+wclass+"\" "+wstyle+" "+wextra+">";
        if ( !!wtext ) widget += "<legend "+wtitle+">"+wtext+"</legend>";
        if ( !wicon ) wicon = 'star';
        for (r=wratings.length-1; r>=0; r--)
        {
            rate = wratings[r][0]; label = wratings[r][1];
            if ( wicon instanceof Array )
            {
                if ( wicon.length > r ) w_icon = wicon[r];
                else w_icon = wicon[wicon.length-1];
            }
            else
            {
                w_icon = wicon;
            }
            wchecked = !!wvalue && wvalue == rate ? 'checked' : '';
            widget += "<input type=\"radio\" id=\""+wid+"_rating_"+rate+"\" class=\"w-rating-input\" "+wname+" value=\""+rate+"\" "+wchecked+" "+w_item_atts+"/><label for=\""+wid+"_rating_"+rate+"\" class=\"fa fa-"+w_icon+" w-rating-label\" title=\""+label+"\">&nbsp;</label>";
        }
        widget += "</fieldset>";
        self.enqueue('styles', 'htmlwidgets.css');
        return widget;
    }
    
    ,w_select: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wname, wdropdown, woptions, wselected, 
            opts, o, opt, l, key, val, selected, has_selected, winit, wopts, wtitle;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wdropdown = !!attr['dropdown'];
        wclass = wdropdown ? 'w-widget w-dropdown' : 'w-widget w-select';
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wextra = self.attributes(attr,['multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wselected = isset(data,'selected') ? data['selected'] : [];
        if ( !(wselected instanceof Array) ) wselected = [wselected];
        woptions = ''; 
        opts = data['options']; l = opts.length;
        has_selected = false;
        for(o=0; o<l; o++)
        {
            // NOTE: use HtmlWidget.options() to format options accordingly to be used here
            opt = opts[o]; key = opt[0]; val = opt[1];
            selected = -1 < wselected.indexOf(key) ? ' selected="selected"' : '';
            if ( selected.length ) has_selected = true;
            woptions += "<option value=\""+key+"\""+selected+">"+val+"</option>";
        }
        if ( !empty(attr,'placeholder') )
        {
            woptions = "<option value=\"\" class=\"w-option-placeholder\" disabled"+(has_selected?'':' selected')+">"+attr['placeholder']+"</option>" + woptions;
            //if ( !/\brequired\b/.test(wextra) ) wextra += ' required';
            //if ( !wname.length ) wextra += ' form="__NONE__"';
            wextra += ' data-placeholder="'+attr['placeholder']+'"';
        }
        
        wopts = "";
        self.enqueue('styles', 'htmlwidgets.css');
        if ( !!attr['select2'] && !wdropdown )
        {
            if ( !winit ) winit = 'w-init="1"';
            wclass += ' w-select2';
            if ( 'object'===typeof attr['options'] )
            {
                wopts = 'w-opts="htmlw_'+wid+'_options"';
                self.enqueue('scripts', 'w-select2-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
            }
            self.enqueue('scripts', 'select2');
            self.enqueue('scripts', 'htmlwidgets');
        }
        return wdropdown
        ? '<span class="'+wclass+'" '+wstyle+'><select id="'+wid+'" '+winit+' '+wopts+' '+wname+' class="w-dropdown-select" '+wtitle+' '+wextra+'>'+woptions+'</select></span>'
        : '<select id="'+wid+'" '+winit+' '+wopts+' '+wname+' class="'+wclass+'" '+wstyle+' '+wtitle+' '+wextra+'>'+woptions+'</select>';
    }
    
    ,w_text: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtype, wicon, wautocomplete, wplaceholder, wvalue, wname, wtitle, wrapper_class, winit, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wclass = 'w-widget w-text'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wtype = !empty(attr,"type") ? attr["type"] : 'text';
        wicon = '';
        wrapper_class = 'w-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        if ( !empty(attr,'autocomplete') )
        {
            wclass += ' awesomplete';
            wextra += ' list="list_'+wid+'"';
            wautocomplete = '<datalist id="list_'+wid+'"><option>'+attr['autocomplete'].join('</option><option>')+'</option></datalist>';
            self.enqueue('scripts', 'awesomplete');
        }
        else
        {
            wautocomplete = '';
        }
        self.enqueue('styles', 'htmlwidgets.css');
        if ( !!winit ) self.enqueue('scripts', 'htmlwidgets');
        return wicon.length
        ? '<span class="'+wrapper_class+'" '+wstyle+'><input type="'+wtype+'" id="'+wid+'" '+winit+' '+wname+' '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' />'+wicon+'</span>'+wautocomplete
        : '<input type="'+wtype+'" id="'+wid+'" '+winit+' '+wname+' '+wtitle+' class="'+wclass+'" '+wstyle+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' />'+wautocomplete;
    }
    
    ,w_suggest: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wajax, wicon, wplaceholder,
            wvalue, wname, wtitle, wrapper_class, winit, wopts, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wclass = 'w-widget w-text w-suggest'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wajax = attr["ajax"];
        wicon = '';
        wrapper_class = 'w-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
            wicon += "<span class=\"fa-wrapper right-fa w-suggest-spinner\"><i id=\""+wid+"-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        else if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper left-fa w-suggest-spinner\"><i id=\""+wid+"-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            wrapper_class += ' w-icon';
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( 'object'===typeof attr['options'] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-autocomplete-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'autocomplete');
        self.enqueue('scripts', 'htmlwidgets');
        return '<span class="'+wrapper_class+'" '+wstyle+'><input type="text" id="'+wid+'" '+winit+' '+wopts+' '+wname+' '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" autocomplete="off" data-ajax="'+wajax+'" '+wextra+' />'+wicon+'</span>';
    }
    
    ,w_textarea: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wplaceholder, wvalue, wname, wtitle, weditor, defaults, winit, wopts, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( !!attr['syntax-editor'] ) 
        {
            if ( !winit ) winit = 'w-init="1"';
            wclass = 'w-widget w-syntax-editor';
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            if ( 'object'===typeof attr['options'] )
            {
                wopts = 'w-opts="htmlw_'+wid+'_options"';
                self.enqueue('scripts', 'w-codemirror-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
            }
            self.enqueue('scripts', 'codemirror');
            self.enqueue('scripts', 'codemirror-fold');
            self.enqueue('scripts', 'codemirror-htmlmixed');
            self.enqueue('scripts', 'htmlwidgets');
        }
        else if ( !!attr['wysiwyg-editor'] ) 
        {
            if ( !winit ) winit = 'w-init="1"';
            wclass = 'w-widget w-wysiwyg-editor'; 
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            if ( 'object'===typeof attr['options'] )
            {
                wopts = 'w-opts="htmlw_'+wid+'_options"';
                self.enqueue('scripts', 'w-tinymce-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
            }
            self.enqueue('scripts', 'tinymce');
            self.enqueue('scripts', 'htmlwidgets');
        }
        else
        {
            wclass = 'w-widget w-textarea'; 
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            self.enqueue('styles', 'htmlwidgets.css');
        }
        return '<textarea id="'+wid+'" '+winit+' '+wopts+' '+wname+' '+wtitle+' class="'+wclass+'" '+wstyle+' placeholder="'+wplaceholder+'" '+wextra+'>'+wvalue+'</textarea>';
    }
    
    ,w_translator: function( attr, data ) {
        var wtype, wclass, wstyle, wextra, wdims, wsource, wtarget, wlocale;
        wtype = !empty(attr,'type') ? attr['type'] : "iframe";
        wdims = !empty(attr,'dimensions') ? attr['dimensions'] : "510x510";
        wsource = !empty(attr,'source') ? attr['source'] : "en";
        wtarget = !empty(attr,'target') ? attr['target'] : "el";
        wlocale = !empty(attr,'locale') ? attr['locale'] : "en";
        wclass = 'w-translator'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('scripts', 'w-translator-opts', ['window.imtranslatorOptions = {dir:"'+wsource+'/'+wtarget+'", loc:"'+wlocale+'"}; var dir=window.imtranslatorOptions.dir,loc=window.imtranslatorOptions.loc;']);
        self.enqueue('scripts', 'w-translator', 'http://imtranslator.net/translation/webmaster/wm-im-'+('popup'===wtype?'popup':wdims)+'.js', ['w-translator-opts']);
        return '<div id="TranslatorBuilder" class="'+wclass+'" '+wstyle+' '+wextra+'><a href="http://imtranslator.net/translation/" id="ImTranslator" target="_top" title="Translator - imtranslator.net">Translator</a></div><div id="ImBack"></div>';
    }
    
    ,w_date: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wplaceholder, wicon, wvalue, wname, wtime, wtitle, wformat, wrapper_class, winit, wopts, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wtime = !empty(attr,"time") ? 'data-datepicker-time="1"' : '';
        if ( !!wtime )
            wtime += isset(attr,"seconds") && (false === !!attr["seconds"]) ? ' data-datepicker-seconds="0"' : ' data-datepicker-seconds="1"';
        wclass = 'w-widget w-text w-date'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wformat = !empty(attr,"format") ? attr["format"] : (!!wtime ? 'Y-m-d H:i:s' : 'Y-m-d');
        wicon = '';
        wrapper_class = 'w-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        if ( empty(attr,'icon') && empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( 'object'===typeof attr['options'] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-datetime-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'pikadaytime');
        self.enqueue('scripts', 'htmlwidgets');
        return '<span class="'+wrapper_class+'" '+wstyle+'><input type="text" id="'+wid+'" '+winit+' '+wopts+' '+wname+' '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" data-datepicker-format="'+wformat+'" '+wtime+' '+wextra+' />'+wicon+'</span>';
    }
    
    ,w_time: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wvalue, wtitle, wname, wnam, wformat, wtimes,
            time_options, i, tt, t, p, f, selected, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wname = !empty(attr,"name") ? attr["name"] : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wformat = !empty(attr,'format') ? attr['format'].split(':') : ["h","m","s"];
        if (isset(data,'value')) 
        {
            wvalue = data['value'] instanceof Array ? data['value'] : data['value'].split(':');
            while ( wvalue.length < 3 ) wvalue.push("00");
        }
        else
        {
            wvalue = ["00", "00", "00"];
        }
        wclass = 'w-widget w-time'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        time_options = {
            'h':[],
            'm':[],
            's':[]
        };
        for(i=0; i<60; i++)
        {
            tt = i<10 ? '0'+i : ''+i;
            for(p=0; p<wformat.length; p++)
            {
                f = wformat[p];
                if ( 'h' === f && i>=24 ) continue;
                selected = tt === wvalue[p] ? 'selected="selected"' : '';
                time_options[f].push('<option value="'+tt+'" '+selected+'>'+tt+'</option>');
            }
        }
        wtimes = [];
        for(p=0; p<wformat.length; p++)
        {
            t = wformat[p];
            wnam = wname.length ? 'name="'+wname+'['+t+']"' : '';
            wtimes.push('<select class="w-time-component" id="'+wid+'_'+t+'" '+wnam+' '+wtitle+' '+wextra+'>'+time_options[t].join('')+'</select>');
        }
        wtimes = wtimes.join('<span class="w-time-sep">:</span>');
        self.enqueue('styles', 'htmlwidgets.css');
        if ( !!winit ) self.enqueue('scripts', 'htmlwidgets');
        return '<span class="'+wclass+'" '+winit+' '+wstyle+'>'+wtimes+'</span>';
    }
    
    ,w_timer: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtitle, wduration, wname, wformat, wtype, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,"name") ? attr["name"] : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'down';
        wformat = !empty(attr,'format') ? attr['format'] : '%hh%:%mm%:%ss%';
        wduration = isset(data,'duration') ? data['duration'] : '10';
        wclass = 'w-widget w-timer'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( 'object'===typeof attr['options'] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-timer-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'timer');
        self.enqueue('scripts', 'htmlwidgets');
        return '<span id="'+wid+'" '+winit+' '+wopts+' class="'+wclass+'" '+wtitle+' '+wstyle+' '+wextra+' data-timer-type="'+wtype+'" data-timer-format="'+wformat+'" data-timer-duration="'+wduration+'">'+wformat+'</span>';
    }
    
    ,w_color: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wvalue, wopacity, winput, winputref, wname, wtitle, wformat, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        if ( !empty(attr,'input') )
        {
            winput = '<input id="'+attr['input']+'" type="hidden" '+wname+' value="" style="display:none" />';
            winputref = 'data-colorpicker-input="'+attr['input']+'"';
        }
        else
        {
            winput = '';
            winputref = '';
        }
        wvalue = isset(data,"color") ? data["color"] : ""; 
        wopacity = isset(data,"opacity") ? data["opacity"] : "1.0"; 
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wclass = 'colorpicker-selector w-colorselector'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wformat = !empty(attr,"format") ? attr["format"] : 'rgba';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( 'object'===typeof attr['options'] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-color-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'colorpicker');
        self.enqueue('scripts', 'htmlwidgets');
        return winput+'<div id="'+wid+'" '+winit+' '+wopts+' '+wtitle+' class="'+wclass+'" '+wstyle+'  data-colorpicker-color="'+wvalue+'" data-colorpicker-opacity="'+wopacity+'" data-colorpicker-format="'+wformat+'" '+winputref+' '+wextra+'></div>';
    }
    
    ,w_gmap: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wcenter, wzoom, wmarkers, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wclass = 'w-widget w-map'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wcenter = !empty(attr,"center") ? attr["center"] : null;
        wzoom = !empty(attr,"zoom") ? attr["zoom"] : '6';
        wmarkers = !empty(data,"markers") ? data["markers"] : null;
        wextra = self.attributes(attr,['data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wopts = "";
        if ( 'object'===typeof attr['options'] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-gmap-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'htmlwidgets');
        return '<div id="'+wid+'" '+winit+' '+wopts+' class="'+wclass+'" '+wstyle+' '+wextra+''+(!!wcenter ? ' data-map-center="'+wcenter.join(',')+'"':'')+' data-map-zoom="'+wzoom+'"'+(!!wmarkers ? ' data-map-markers="'+wmarkers+'"':'')+'></div>';
    }
    
    ,w_file: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wclass = 'w-widget w-file w-text'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wicon = '';
        wrapper_class = 'w-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['accept','multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<label for="'+wid+'" class="'+wrapper_class+'" '+wstyle+'><input type="file" id="'+wid+'" '+wname+' class="w-file-input" value="'+wvalue+'" '+wextra+' style="display:none !important"/><input type="text" id="text_input_'+wid+'" '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" form="__NONE__" />'+wicon+'</label>';
    }
    
    ,w_dnd_upload: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wname, wtitle,
            msg_upload, msg_delete, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid( ); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,'name') ? 'name="'+attr['name']+'"' : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wclass = 'w-widget w-dnd-upload';
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        if ( !empty(attr,'show-preview') ) wclass += ' __with_preview__';
        if ( !empty(attr,'upload-thumbnail') ) wclass += ' __with_thumbnail__';
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = 'data-alt-value="files_dropped"';
        if ( !empty(attr,"mimetype") ) wextra += ' data-dnd-upload-mimetype="'+attr["mimetype"]+'"';
        wextra += ' ' + (self.attributes(attr,['accept','multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : ''));
        msg_upload = !empty(attr,"msg-upload") ? attr["msg-upload"] : 'Upload';
        msg_delete = !empty(attr,"msg-delete") ? attr["msg-delete"] : 'Delete';
        wopts = "";
        if ( isset(attr,"options") && 'object' === typeof attr["options"] )
        {
            wopts = 'w-opts="htmlw_'+wid+'_options"';
            self.enqueue('scripts', 'w-dnd-upload-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
        }
        self.enqueue('scripts', 'htmlwidgets');
        return '<div '+winit+' '+wopts+' id="'+wid+'_wrapper" class="'+wclass+'" '+wstyle+'><input id="'+wid+'" '+wname+' type="file" class="_w-dnd-uploader" value="" style="display:none !important;" '+wextra+'><label for="'+wid+'" class="w-widget w-button w-dnd-upload-upload" title="'+msg_upload+'"><i class="fa fa-upload fa-2x"></i></label><button type="button" class="w-widget w-button w-dnd-upload-delete" title="'+msg_delete+'"><i class="fa fa-times fa-2x"></i></button></div>';
    }
    
    /*,w_upload: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wupload_base, wvalue, wname,
            msg_upload, msg_delete, msg_full, image, thumb, upload_data, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid( ); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wname = !empty(attr,'name') ? 'name="'+attr['name']+'"' : '';
        wclass = 'w-widget w-upload'; if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['accept','multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wupload_base = !empty(attr,"upload-base") ? attr["upload-base"] : '';
        msg_upload = !empty(attr,"msg-upload") ? attr["msg-upload"] : 'Upload';
        msg_delete = !empty(attr,"msg-delete") ? attr["msg-delete"] : 'Delete';
        msg_full = !empty(attr,"msg-full-size") ? attr["msg-full-size"] : 'Click to view full-size image';
        wvalue = !empty(data,"value") ? data["value"] : null;
        if ( !!wvalue )
        {
            image = wupload_base + wvalue['file'];
            thumb = !empty(wvalue,'thumb') ? wupload_base + wvalue['thumb'] : '';
            upload_data = json_encode({
                'original' : image,
                'type' : !empty(wvalue,'type') ? wvalue['type'] : 'image',
                'file' : wvalue['file'],
                'thumb' : !empty(wvalue,'thumb') ? wvalue['thumb'] : '',
                'width' : !empty(wvalue,'width') ? wvalue['width'] : 600,
                'height' : !empty(wvalue,'height') ? wvalue['height'] : 400
            });
        }
        else
        {
            image = '';
            thumb = '';
            upload_data = '';
        }
        if ( !empty(attr,'readonly') )
        {
            return '<div data-upload-base="'+wupload_base+'" data-upload-image="'+image+'" class="'+wclass+'"><img class="w-upload-thumbnail" title="'+msg_full+'" src="'+thumb+'" onclick="window.open(this.parentNode.getAttribute(\'data-upload-image\'),\'preview\',\'scrollbars=yes,resizable=yes,width=600,height=400\').focus();"/></div>';
        }
        else
        {
            wopts = "";
            if ( 'object'===typeof attr['options'] )
            {
                wopts = 'w-opts="htmlw_'+wid+'_options"';
                self.enqueue('scripts', 'w-upload-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
            }
            self.enqueue('scripts', 'htmlwidgets');
            return '<div id="'+wid+'" '+winit+' '+wopts+' class="'+wclass+'" '+wstyle+' data-upload-base="'+wupload_base+'" '+wextra+'><img id="'+wid+'_thumbnail" class="w-upload-thumbnail" title="'+msg_full+'" src="'+thumb+'" /><textarea json-encoded="1" id="'+wid+'_data" '+wname+' class="_w-data" style="display:none !important;">'+upload_data+'</textarea><label class="w-widget w-button" title="'+msg_upload+'"><i class="fa fa-upload"></i><input id="'+wid+'_uploader" type="file" class="_w-uploader" style="display:none !important;" /></label><button type="button" class="w-widget w-button w-upload-delete" title="'+msg_delete+'"><i class="fa fa-times"></i></button></div>';
        }
    }*/
    
    ,w_table: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wcolumns, wrows, wheader, wfooter,
            column_values, column_keys, row, rowid, rowk, rowv, r, c, rl, cl, winit, wopts;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wclass = 'w-widget w-table'; 
        /*
        if ( !empty(attr,'stripped') ) wclass += ' stripped';
        if ( !empty(attr,'bordered') ) wclass += ' bordered';
        if ( !empty(attr,'responsive') ) wclass += ' responsive';
        */
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        var plus_footer = !empty(attr['footer']);
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wcolumns = '';
        column_values = data['columns'];
        column_keys = KEYS(data_cols);
        cl = column_keys.length
        for(c=0; c<cl; c++)
        {
            wcolumns += "<th data-columnkey=\""+column_keys[c]+"\">"+column_values[column_keys[c]]+"</th>";
        }
        wcolumns = "<tr>"+wcolumns+"</tr>";
        wheader = !isset(attr['header']) || !empty(attr['header']) ? '<thead>'+wcolumns+'</thead>' : '';
        wfooter = !empty(attr['footer']) ? '<tfoot>'+wcolumns+'</tfoot>' : '';
        wrows = ''; rl = data['rows'].length;
        for(r=0; r<rl; r++)
        {
            row = data['rows'][r];
            rowid = null != row.id ? row.id : r;
            rowv = null != row.cells ? row.cells : row;
            rowk = KEYS(rowv);
            wrows += "\n" + "<tr data-row=\""+rowid+"\">";
            for(c=0; c<cl; c++)
            {
                wrows += "<td data-column=\""+column_values[column_keys[c]]+"\">"+rowv[rowk[c]]+"</td>";
            }
            wrows += "</tr>";
        }
        wdata = self.data(attr);
        wopts = "";
        self.enqueue('styles', 'htmlwidgets.css');
        if ( !!attr['datatable'] )
        {
            if ( !winit ) winit = 'w-init="1"';
            wclass += ' w-datatable';
            if ( 'object'===typeof attr['options'] )
            {
                wopts = 'w-opts="htmlw_'+wid+'_options"';
                self.enqueue('scripts', 'w-datatable-'+wid, ['window["htmlw_'+wid+'_options"] = '+json_encode(attr["options"])+';']);
            }
            self.enqueue('scripts', 'datatables');
            self.enqueue('scripts', 'htmlwidgets');
        }
        return '<table id="'+wid+'" '+winit+' '+wopts+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>'+wheader+'<tbody>'+wrows+'</tbody>'+wfooter+'</table>';
    }
    
    ,w_menu: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wclass = 'w-widget w-dropdown-menu'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.data(attr);
        return '<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>';
    }
    
    ,w_menu_end: function( attr, data ) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '</div>';
    }
    
    ,w_swf: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wswf, wquality, wmode, wscale, wflashvars, wallowfullscreen;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wclass = 'w-swf'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['width','height'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wswf = empty(data,'swf') ? '' : data['swf'];
        wquality = empty(attr,'quality') ? 'best' : attr['quality'];
        wmode = empty(attr,'wmode') ? 'transparent' : attr['wmode'];
        wscale = empty(attr,'scale') ? 'default' : attr['scale'];
        wflashvars = empty(attr,'flashvars') ? '' : attr['flashvars'];
        wallowfullscreen = empty(attr,'allowfullscreen') ? 'false' : attr['allowfullscreen'];
        return '<object id="'+wid+'" type="application/x-shockwave-flash" '+wextra+' data="'+wswf+'" class="'+wclass+'" '+wstyle+'><param name="movie" value="'+wswf+'" /><param name="quality" value="'+wquality+'" /><param name="wmode" value="'+wmode+'" /><param name="scale" value="'+wscale+'" /><param name="FlashVars" value="'+wflashvars+'" /><param name="allowFullScreen" value="'+wallowfullscreen+'" /></object>';
    }
    
    ,w_media: function( attr, data ) {
        var wid, wtype, wclass, wstyle, wextra, wtext, wsources, wsource, source, src, src_type;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtype = empty(attr,'type') ? "video" : attr['type'];
        if ( 'audio' !== wtype ) wtype = 'video';
        wclass = 'w-media w-'+wtype; 
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['title','width','height','src','controls','autoplay','loop','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wtext = empty(data,'text') ? '' : data['text'];
        wsources = empty(data,'sources') ? [] : data['sources'];
        wsource = '';
        for (var o=0,l=wsources.length; o<l; o++)
        {
            // NOTE: use HtmlWidget::options() to format options accordingly to be used here
            source = wsources[o]; src = source[0]; src_type = source[1];
            wsource += '<source src="'+src+'" type="'+src_type+'"></source>';
        }
        self.enqueue('scripts','html5media');
        return '<'+wtype+' id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>'+wsource+wtext+'</'+wtype+'>';
    }
    
    ,w_delayable: function( attr, data ) {
        var wid, wclass, wstyle, wextra, winit, wspinner;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wclass = 'w-delayable-overlay'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wspinner = 'w-spinner';
        wspinner += !empty(attr,'spinner') ? " "+attr['spinner'] : " w-spinner-dots";
        self.enqueue('scripts', 'htmlwidgets');
        return '<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+'><div class="'+wspinner+'"></div></div>';
    }
    
    ,w_disabable: function( attr, data ) {
        var wid, wclass, wstyle, wextra, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : 'w-init="1"';
        wclass = 'w-disabable-overlay'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        self.enqueue('scripts', 'htmlwidgets');
        return '<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+'></div>';
    }
    
    ,w_morphable: function( attr, data ) {
        var wid, wclass, wstyle, wmodes, wmode_class, wshow_class, whide_class, wselector, wshow_selector, whide_selector;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-morphable'; 
        wmodes = [].concat(attr['modes']);
        wmode_class = !empty(attr,'mode') ? attr['mode'] : 'mode-${MODE}';
        wshow_class = !empty(attr,'show') ? attr['show'] : 'show-if-${MODE}';
        whide_class = !empty(attr,'hide') ? attr['hide'] : 'hide-if-${MODE}';
        wselector = "#"+wid+".w-morphable";
        wshow_selector = [];
        whide_selector = [];
        var i, j, l = wmodes.length;
        for(i=0; i<l; i++)
        {
            whide_selector.push(
                wselector + '.' + wmode_class.split('${MODE}').join(wmodes[i]) + ' .' + whide_class.split('${MODE}').join(wmodes[i])
            );
            wshow_selector.push(
                wselector + '.' + wmode_class.split('${MODE}').join(wmodes[i]) + ' .' + wshow_class.split('${MODE}').join(wmodes[i])
            );
            for (j=0; j<l; j++)
            {
                if ( j === i ) continue;
                whide_selector.push(
                    wselector + '.' + wmode_class.split('${MODE}').join(wmodes[i]) + ' .' + wshow_class.split('${MODE}').join(wmodes[j]) + ':not(.' + wshow_class.split('${MODE}').join(wmodes[i]) + ')'
                );
                wshow_selector.push(
                    wselector + '.' + wmode_class.split('${MODE}').join(wmodes[i]) + ' .' + whide_class.split('${MODE}').join(wmodes[j]) + ':not(.' + whide_class.split('${MODE}').join(wmodes[i]) + ')'
                );
            }
        }
        wstyle = '';
        wstyle += whide_selector.join(',') + '{display: none !important}';
        wstyle += wshow_selector.join(',') + '{display: block}';
        /*wstyle = {
            hide_mode: {
                selector: whide_selector.join(','),
                rules: [
                    'display: none !important'
                ]
            },
            show_mode: {
                selector: wshow_selector.join(','),
                rules: [
                    'display: block'
                ]
            }
        };*/
        self.enqueue('styles', "w-morphable-"+wid, [wstyle], ['htmlwidgets']);
        return '';
    }
    
    ,w_panel: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wtitle, wchecked, wdata, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wclass = 'w-panel';
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wtitle = !empty(attr,'title') ? attr['title'] : '&nbsp;';
        wchecked = !empty(attr,'closed') ? 'checked' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.data(attr);
        
        if ( !!winit ) self.enqueue('scripts', 'htmlwidgets');
        return '<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'><input type="checkbox" id="controller_'+wid+'" class="w-panel-controller" value="1" '+wchecked+'/><div class="w-panel-header">'+wtitle+'<label class="w-panel-controller-button" for="controller_'+wid+'" onclick=""><i class="fa fa-2x"></i></label></div><div class="w-panel-content">';
    }
    
    ,w_panel_end: function( attr, data ) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '</div></div>';
    }
    
    ,w_accordeon: function( attr, data ) {
        var wid, wstyle, wcontext, wtype, witems, i, l, wcontrollers, wctrl, wselector, wselected, wheight;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wheight = !empty(attr,'height') ? attr['height'] : '1500px';
        wtype = !empty(attr,'independent') ? 'checkbox' : 'radio';
        witems = [].concat(attr['items']);
        
        wctrl = "ctrl_"+wid;
        wcontrollers = "<input name=\""+wctrl+"\" type=\""+wtype+"\" id=\"item_" + witems.join( "\" class=\"w-transition-controller w-"+wctrl+"-controller\"/><input name=\""+wctrl+"\" type=\""+wtype+"\" id=\"item_" ) + "\" class=\"w-transition-controller w-"+wctrl+"-controller\"/>";
        
        wstyle = '';
        
        // de-activate
        wselector = [];
        for (i=0,l=witems.length; i<l; i++)
            wselector.push(".w-"+wctrl+"-controller.w-transition-controller:not(#item_"+witems[i]+"):checked ~ "+wcontext+"#"+witems[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    max-height: 0;\
    -webkit-transition: max-height .3s ease;\
    -moz-transition: max-height .3s ease;\
    -ms-transition: max-height .3s ease;\
    -o-transition: max-height .3s ease;\
    transition: max-height .3s ease;\
}\
';
        // activate
        wselector = [];
        for (i=0,l=witems.length; i<l; i++)
            wselector.push("#item_"+witems[i]+".w-"+wctrl+"-controller.w-transition-controller:checked ~ "+wcontext+"#"+witems[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    max-height: '+wheight+';\
    -webkit-transition: max-height .2s ease .1s;\
    -moz-transition: max-height .2s ease .1s;\
    -ms-transition: max-height .2s ease .1s;\
    -o-transition: max-height .2s ease .1s;\
    transition: max-height .2s ease .1s;\
}\
';
        self.enqueue('styles', "w-accordeon-"+wid, [wstyle], ['htmlwidgets.css']);
        return wcontrollers;
    }
    
    ,w_tabs: function( attr, data ) {
        var wid, wstyle, wcontext, wtabs, i, l, wcontrollers, wctrl, wselector, wselected, wtransform1, wtransform2;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wtabs = [].concat(attr['tabs']);
        
        if ( !empty(attr['3d']) )
        {
            wtransform1 = 'w-fx-slideout-3d';
            wtransform2 = 'w-fx-slidein-3d';
        }
        else
        {
            wtransform1 = 'w-fx-slideout';
            wtransform2 = 'w-fx-slidein';
        }
        
        wctrl = "ctrl_"+wid;
        wcontrollers = "<input name=\""+wctrl+"\" checked type=\"radio\" id=\"tab_" + wtabs.join( "\" class=\"w-transition-controller w-"+wctrl+"-controller\"/><input name=\""+wctrl+"\" type=\"radio\" id=\"tab_" ) + "\" class=\"w-transition-controller w-"+wctrl+"-controller\"/>";
        
        wstyle = '';
        
        // de-activate
        wselector = [];
        for (i=0,l=wtabs.length; i<l; i++)
            wselector.push(".w-"+wctrl+"-controller.w-transition-controller:not(#tab_"+wtabs[i]+"):checked ~ "+wcontext+"#"+wtabs[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: absolute;\
    \
    -webkit-animation-name: '+wtransform1+';\
    -moz-animation-name: '+wtransform1+';\
    -ms-animation-name: '+wtransform1+';\
    -o-animation-name: '+wtransform1+';\
    animation-name: '+wtransform1+';\
    \
    -webkit-animation-timing-function: ease-out;\
    -moz-animation-timing-function: ease-out;\
    -ms-animation-timing-function: ease-out;\
    -o-animation-timing-function: ease-out;\
    animation-timing-function: ease-out;\
}\
';
        // activate
        wselector = [];
        for (i=0,l=wtabs.length; i<l; i++)
            wselector.push("#tab_"+wtabs[i]+".w-"+wctrl+"-controller.w-transition-controller:checked ~ "+wcontext+"#"+wtabs[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: relative;\
    z-index: 10;\
    \
    -webkit-animation-name: '+wtransform2+';\
    -moz-animation-name: '+wtransform2+';\
    -ms-animation-name: '+wtransform2+';\
    -o-animation-name: '+wtransform2+';\
    animation-name: '+wtransform2+';\
    \
    -webkit-animation-timing-function: ease-in;\
    -moz-animation-timing-function: ease-in;\
    -ms-animation-timing-function: ease-in;\
    -o-animation-timing-function: ease-in;\
    animation-timing-function: ease-in;\
}\
';
        self.enqueue('styles', "w-tabs-"+wid, [wstyle], ['htmlwidgets.css']);
        return wcontrollers;
    }
    
    ,w_pages: function( attr, data ) {
        var wid, wstyle, wcontext, wpages, main_page, i, l, wcontrollers, wselector, wtransform1, wtransform2, wtransform3;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wpages = [].concat(attr['pages']);
        
        if ( !empty(attr['3d']) )
        {
            wtransform1 = 'translate3d(0px,0px,0px)';
            wtransform2 = 'translate3d(-100%,0px,0px)';
            wtransform3 = 'translate3d(100%,0px,0px)';
        }
        else
        {
            wtransform1 = 'translateX(0px)';
            wtransform2 = 'translateX(-100%)';
            wtransform3 = 'translateX(100%)';
        }
        
        wcontrollers = "<span id=\"page_" + wpages.join( "\" class=\"w-page-controller\"></span><span id=\"page_" ) + "\" class=\"w-page-controller\"></span>";
        
        wstyle = '';
        
        // main page
        main_page = wpages.shift();
        wstyle += '\
#'+main_page+'.w-page\
{\
    position: relative;\
    -webkit-transform: '+wtransform1+';\
    -moz-transform: '+wtransform1+';\
    -ms-transform: '+wtransform1+';\
    -o-transform: '+wtransform1+';\
    transform: '+wtransform1+';\
}\
.w-page-controller:not(#page_'+main_page+'):target ~ '+wcontext+'#'+main_page+'.w-page\
{\
    position: absolute;\
    \
    -webkit-transform: '+wtransform2+';\
    -moz-transform: '+wtransform2+';\
    -ms-transform: '+wtransform2+';\
    -o-transform: '+wtransform2+';\
    transform: '+wtransform2+';\
    \
    -webkit-transition: -webkit-transform .3s ease;\
    -moz-transition: -moz-transform .3s ease;\
    -ms-transition: -ms-transform .3s ease;\
    -o-transition: -o-transform .3s ease;\
    transition: transform .3s ease;\
}\
';
        // rest pages
        wselector = [];
        for (i=0,l=wpages.length; i<l; i++)
            wselector.push('#page_'+wpages[i]+'.w-page-controller:not(:target) ~ '+wcontext+'#'+wpages[i]+'.w-page');
        wstyle += '\
'+wselector.join(',')+'\
{\
    -webkit-transform: '+wtransform3+';\
    -moz-transform: '+wtransform3+';\
    -ms-transform: '+wtransform3+';\
    -o-transform: '+wtransform3+';\
    transform: '+wtransform3+';\
}\
';
        wselector = [];
        for (i=0,l=wpages.length; i<l; i++)
            wselector.push('#page_'+wpages[i]+'.w-page-controller:target ~ '+wcontext+'#'+wpages[i]+'.w-page');
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: relative;\
    \
    -webkit-transform: '+wtransform1+';\
    -moz-transform: '+wtransform1+';\
    -ms-transform: '+wtransform1+';\
    -o-transform: '+wtransform1+';\
    transform: '+wtransform1+';\
    \
    -webkit-transition: -webkit-transform .3s ease;\
    -moz-transition: -moz-transform .3s ease;\
    -ms-transition: -ms-transform .3s ease;\
    -o-transition: -o-transform .3s ease;\
    transition: transform .3s ease;\
}\
';
        self.enqueue('styles', "w-pages-"+wid, [wstyle], ['htmlwidgets.css']);
        return wcontrollers;
    }
    
    ,w_dialog: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wicon, wtitle, wbuttons, wcontent, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wtitle = isset(data,'title') ? data['title'] : ''; 
        wbuttons = isset(attr,'buttons') ? attr['buttons'] : ''; 
        wcontent = isset(data,'content') ? data['content'] : '';
        wclass = 'w-dialog'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wicon = '';
        if ( !empty(attr,'icon') )
        {
            wicon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        if ( isset(attr,"form") && attr.form )
        {
            wcontent = '<form id="'+wid+'_form">'+wcontent+'</form>';
        }
        wdata = self.data(attr);
        self.enqueue('styles', 'htmlwidgets.css');
        if ( !!winit ) self.enqueue('scripts', 'htmlwidgets');
        return '<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'><div class="w-dialog-title">'+wicon+wtitle+'</div><div class="w-dialog-content">'+wcontent+'</div><div class="w-dialog-buttons">'+wbuttons+'</div></div>';
    }
    
    ,w_modal: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wicon, wtitle, woverlay, winit;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        winit = !empty(attr,"init") ? 'w-init="'+attr["init"]+'"' : '';
        wclass = 'w-modal w-dialog'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wtitle = isset(data,'title') ? data['title'] : ''; 
        wicon = !empty(attr,'icon') ? "<i class=\"fa fa-" + attr['icon'] + "\"></i>" : '';
        woverlay = !empty(attr,'autoclose') ? '<label for="modal_'+wid+'" class="w-modal-overlay" onclick=""></label>' : '<div class="w-modal-overlay"></div>';
        wdata = self.data(attr);
        if ( !!winit ) self.enqueue('scripts', 'htmlwidgets');
        return '<input id="modal_'+wid+'" type="checkbox" class="w-modal-controller" />'+woverlay+'<div id="'+wid+'" '+winit+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'><div class="w-dialog-title">'+wicon+wtitle+'<label for="modal_'+wid+'" class="w-label w-dialog-close" title="Close" onclick=""><i class="fa fa-times-circle"></i></label></div><div class="w-dialog-content">';
    }
    
    ,w_modal_end: function( attr, data ) {
        var wbuttons;
        wbuttons = isset(attr,'buttons') ? attr['buttons'] : ''; 
        self.enqueue('styles', 'htmlwidgets.css');
        return '</div><div class="w-dialog-buttons">'+wbuttons+'</div></div>';
    }
    
    ,w_tooltip: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wtext, warrow;
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-tooltip'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        if ( !empty(attr,'icon') )
        {
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        else if ( !empty(attr,'iconr') )
        {
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        if ( !empty(attr,'tooltip') )
        {
            if ( 'top' === attr.toolip )
                warrow = '<div class="w-tooltip-arrow w-arrow-bottom"></div>';
            else if ( 'bottom' === attr.toolip )
                warrow = '<div class="w-tooltip-arrow w-arrow-top"></div>';
            else if ( 'right' === attr.toolip )
                warrow = '<div class="w-tooltip-arrow w-arrow-left"></div>';
            else
                warrow = '<div class="w-tooltip-arrow w-arrow-right"></div>';
        }
        else
        {
            warrow = '<div class="w-tooltip-arrow w-arrow-right"></div>';
        }
        wdata = self.data(attr);
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+warrow+'</div>';
    }
    
    ,w_animation: function( attr, data )  {
        var wid, wselector, wanimation, wtransition, wduration, wdelay, wtiming_function, weasing, witeration_count, wfill_mode, wanimation_def;
        wid = isset(attr,"id") ? attr["id"] : self.uuid('widget_animation');
        wselector = isset(attr,"selector") ? attr["selector"] : '.animate-'+wid;
        wanimation = !empty(attr,'animation') ? attr['animation'] : '';
        wtransition = !empty(attr,'transition') ? attr['transition'] : '';
        wduration = isset(attr,'duration') ? attr['duration'] : '0.5s';
        wdelay = isset(attr,'delay') ? attr['delay'] : '0s';
        wtiming_function = !empty(attr,'timing-function') ? attr['timing-function'] : '';
        weasing = !empty(attr,'easing') ? attr['easing'] : 'linear';
        if ( empty(wtiming_function) ) wtiming_function = weasing;
        witeration_count = !empty(attr,'iteration-count') ? attr['iteration-count'] : '1';
        wfill_mode = !empty(attr,'fill-mode') ? attr['fill-mode'] : 'both';
        wanimation_def = '';
        if ( !empty(wanimation) )
        {
            wanimation_def += '\
'+wselector+'\
{\
-webkit-animation-duration: '+wduration+';\
-moz-animation-duration: '+wduration+';\
-ms-animation-duration: '+wduration+';\
-o-animation-duration: '+wduration+';\
animation-duration: '+wduration+';\
\
-webkit-animation-delay: '+wdelay+';\
-moz-animation-delay: '+wdelay+';\
-ms-animation-delay: '+wdelay+';\
-o-animation-delay: '+wdelay+';\
animation-delay: '+wdelay+';\
\
-webkit-animation-iteration-count: '+witeration_count+';\
-moz-animation-iteration-count: '+witeration_count+';\
-ms-animation-iteration-count: '+witeration_count+';\
-o-animation-iteration-count: '+witeration_count+';\
animation-iteration-count: '+witeration_count+';\
\
-webkit-animation-timing-function: '+wtiming_function+';\
-moz-animation-timing-function: '+wtiming_function+';\
-ms-animation-timing-function: '+wtiming_function+';\
-o-animation-timing-function: '+wtiming_function+';\
animation-timing-function: '+wtiming_function+';\
\
-webkit-animation-fill-mode: '+wfill_mode+';\
-moz-animation-fill-mode: '+wfill_mode+';\
-ms-animation-fill-mode: '+wfill_mode+';\
-o-animation-fill-mode: '+wfill_mode+';\
animation-fill-mode: '+wfill_mode+';\
\
-webkit-animation-name: '+wid+';\
-moz-animation-name: '+wid+';\
-ms-animation-name: '+wid+';\
-o-animation-name: '+wid+';\
animation-name: '+wid+';\
}\
@-webkit-keyframes '+wid+'\
{\
'+wanimation+'\
}\
@keyframes '+wid+'\
{\
'+wanimation+'\
}\
';
        }
        if ( !empty(wtransition) )
        {
            wanimation_def += '\
'+wselector+'\
{\
-webkit-transition: '+wtransition+' '+wduration+' '+wtiming_function+' '+wdelay+';\
-moz-transition: '+wtransition+' '+wduration+' '+wtiming_function+' '+wdelay+';\
-ms-transition: '+wtransition+' '+wduration+' '+wtiming_function+' '+wdelay+';\
-o-transition: '+wtransition+' '+wduration+' '+wtiming_function+' '+wdelay+';\
transition: '+wtransition+' '+wduration+' '+wtiming_function+' '+wdelay+';\
}\
';
        }
        self.enqueue('styles', wid, [wanimation_def], ['htmlwidgets.css']);
        return '';
    }
};

if (isXPCOM )
{
    HtmlWidget.BASE = './';
}
else if ( isNode )
{
    HtmlWidget.BASE = __dirname;
}
else if ( isWebWorker )
{
    HtmlWidget.BASE = this.location.href.split('/').slice(0,-1).join('/');
}
else
{
    var this_script = document.getElementsByTagName('script');
    HtmlWidget.BASE = (this_script[this_script.length-1].src||'./').split('/').slice(0,-1).join('/'); // absolute uri
}

// export it
return HtmlWidget;
});