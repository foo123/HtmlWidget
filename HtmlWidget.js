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
!function( root, name, factory ) {
"use strict";

// export the module, umd-style (no other dependencies)
var isCommonJS = ("object" === typeof(module)) && module.exports, 
    isAMD = ("function" === typeof(define)) && define.amd, m;

// CommonJS, node, etc..
if ( isCommonJS ) 
    module.exports = (module.$deps = module.$deps || {})[ name ] = module.$deps[ name ] || (factory.call( root, {NODE:module} ) || 1);

// AMD, requireJS, etc..
else if ( isAMD && ("function" === typeof(require)) && ("function" === typeof(require.specified)) && require.specified(name) ) 
    define( name, ['require', 'exports', 'module'], function( require, exports, module ){ return factory.call( root, {AMD:module} ); } );

// browser, web worker, etc.. + AMD, other loaders
else if ( !(name in root) ) 
    (root[ name ] = (m=factory.call( root, {} ) || 1)) && isAMD && define( name, [], function( ){ return m; } );

}(  /* current root */          this, 
    /* module name */           "HtmlWidget",
    /* module factory */        function( exports, undef ) {
"use strict";

var isNode = 'undefined' !== typeof global && '[object global]' === Object.prototype.toString.call(global),
    HAS = 'hasOwnProperty', ATTR = 'setAttribute', KEYS = Object.keys, json_encode = JSON.stringify, 
    cnt = 0, self, widgets = {}, enqueuer = null;

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

// http://davidwalsh.name/add-rules-stylesheets
function add_css_rule( style, selector, rules, index ) 
{
    if ( "insertRule" in style.sheet ) 
    {
        style.sheet.insertRule( selector + "{" + rules + "}", index );
        return style.sheet.cssRules[ index ];
    }
    else if ( "addRule" in style.sheet ) 
    {
        style.sheet.addRule( selector, rules, index );
        return style.sheet.rules[ index ];
    }
}

function add_css( style, css ) 
{
    var css_type = typeof css;
    
    // css rules object
    if ( "object" === css_type )
    {
        var n, declaration, i = 0;
        for (n in css)
        {
            if ( css[HAS](n) )
            {
                declaration = css[ n ];
                declaration.css = add_css_rule( style, declaration.selector, [].concat(declaration.rules).join('; '), i++ );
            }
        }
    }
    // css literal string
    else if ( "string" === css_type )
    {
        if ( style.styleSheet ) style.styleSheet.cssText = (style.styleSheet.cssText||'') + css;
        else style.appendChild( document.createTextNode( css ) );
    }
    return css;
}

function create_asset( type, src ) 
{
    var asset = null;
    switch( type )
    {
        // external script, only if not exists
        case "script-link-unique":
            var i, links = document.head.getElementsByTagName("script"), link = null;
            for (i=links.length-1; i>=0; i--) 
            {
                if ( links[i].src && src === links[i].src ) 
                {
                    // found existing link
                    link = links[ i ];
                    break;
                }
            }
            if ( link )
            {
                // return it, instead
                asset = link;
            }
            else
            {
                // Create the <script> tag
                asset = document.createElement('script');
                asset[ATTR]("type", "text/javascript");
                asset[ATTR]("language", "javascript");
                asset[ATTR]("src", src);
                // Add the <script> element to the page
                document.head.appendChild( asset );
            }
            break;
        
        // external script
        case "script-link":
            // Create the <script> tag
            asset = document.createElement('script');
            asset[ATTR]("type", "text/javascript");
            asset[ATTR]("language", "javascript");
            asset[ATTR]("src", src);
            // Add the <script> element to the page
            document.head.appendChild( asset );
            break;
        
        // literal script
        case "script":
            // Create the <script> tag
            asset = document.createElement("script");
            asset[ATTR]("type", "text/javascript");
            asset[ATTR]("language", "javascript");
            // WebKit hack :(
            asset.appendChild( document.createTextNode(src) );
            // Add the <script> element to the page
            document.head.appendChild( asset );
            break;
            
        // external stylesheet, only if not exists
        case "style-link-unique":
            var i, links = document.head.getElementsByTagName("link"), link = null;
            for (i=links.length-1; i>=0; i--) 
            {
                if ( src === links[i].href ) 
                {
                    // found existing link
                    link = links[ i ];
                    break;
                }
            }
            if ( link )
            {
                // return it, instead
                asset = link;
            }
            else
            {
                // Create the <link> tag
                asset = document.createElement('link');
                // Add a media (and/or media query) here if you'd like!
                asset[ATTR]("type", "text/css");
                asset[ATTR]("rel", "stylesheet");
                asset[ATTR]("media", "all");
                asset[ATTR]("href", src);
                // Add the <style> element to the page
                document.head.appendChild( asset );
            }
            break;
        
        // external stylesheet
        case "style-link":
            // Create the <link> tag
            asset = document.createElement('link');
            // Add a media (and/or media query) here if you'd like!
            asset[ATTR]("type", "text/css");
            asset[ATTR]("rel", "stylesheet");
            asset[ATTR]("media", "all");
            asset[ATTR]("href", src);
            // Add the <style> element to the page
            document.head.appendChild( asset );
            break;
        
        // literal stylesheet
        case "style":
        default:
            // Create the <style> tag
            asset = document.createElement("style");
            // Add a media (and/or media query) here if you'd like!
            asset[ATTR]("type", "text/css");
            asset[ATTR]("media", "all");
            // WebKit hack :(
            asset.appendChild( document.createTextNode("") );
            // Add the <style> element to the page
            document.head.appendChild( asset );
            if ( src ) add_css( asset, src );
            break;
    }
    return asset;
}

function dispose_asset( asset ) 
{
    if ( asset ) 
        document.head.removeChild( asset );
}

var HtmlWidget = self = {
    
    VERSION: "0.1",
    
    enqueueAssets: function(_enqueuer) {
        if ( enqueuer && 'function' === typeof enqueuer ) enqueuer = _enqueuer;
        else enqueuer = null;
    },
    
    enqueue: function( type, id, asset, deps ) {
        if ( enqueuer ) 
            enqueuer(type, id, asset||null, deps||[]);
    },
    
    assets: function( base, full ) {
        base = base || '';
        base = base + ('/' === base.slice(-1) ? 'assets/' : '/assets/');
        var assets = [
         ['styles', 'htmlwidgets.css', base+'css/htmlwidgets.min.css', ['responsive.css','font-awesome.css']]
        ,['scripts', 'htmlwidgets.js', base+'js/htmlwidgets.min.js', ['jquery']]
        ];
        if ( true === full )
        {
            assets = assets.concat([
            // DataTables
             ['styles', 'jquery.dataTables.css', base+'css/jquery.dataTables.min.css']
            ,['scripts', 'jquery.dataTables', base+'js/jquery.dataTables.min.js', ['jquery']]
             
            // CodeMirror
            ,['styles', 'codemirror.css', base+'css/codemirror.min.css']
            ,['scripts', 'codemirror.js', base+'js/codemirror.min.js']
            
            ,['scripts', 'codemirror-multiplex', base+'js/addon/mode/multiplex.js', ['codemirror.js']]
            ,['scripts', 'codemirror-comment', base+'js/addon/comment/comment.js', ['codemirror.js']]
            
            ,['scripts', 'codemirror-xml', base+'js/mode/xml.js', ['codemirror.js']]
            ,['scripts', 'codemirror-javascript', base+'js/mode/javascript.js', ['codemirror.js']]
            ,['scripts', 'codemirror-css', base+'js/mode/css.js', ['codemirror.js']]
            
            ,['styles', 'codemirror-fold.css', base+'js/addon/fold/foldgutter.css', ['codemirror.css']]
            ,['scripts', 'codemirror-fold-gutter', base+'js/addon/fold/foldgutter.js', ['codemirror.js']]
            ,['scripts', 'codemirror-fold-code', base+'js/addon/fold/foldcode.js', ['codemirror-fold-gutter']]
            ,['scripts', 'codemirror-fold-comment', base+'js/addon/fold/comment-fold.js', ['codemirror-fold-gutter','codemirror-fold-code']]
            ,['scripts', 'codemirror-fold-brace', base+'js/addon/fold/brace-fold.js', ['codemirror-fold-gutter','codemirror-fold-code']]
            ,['scripts', 'codemirror-fold-indent', base+'js/addon/fold/indent-fold.js', ['codemirror-fold-gutter','codemirror-fold-code']]
            ,['scripts', 'codemirror-fold-xml', base+'js/addon/fold/xml-fold.js', ['codemirror-fold-gutter','codemirror-fold-code']]
            
            ,['styles', 'codemirror-styles', base+'js/addon/fold/foldgutter.css', ['codemirror.css']]
            ,['scripts', 'codemirror', base+'js/mode/htmlmixed.js', ['codemirror.js','codemirror-multiplex','codemirror-comment','codemirror-xml','codemirror-javascript','codemirror-css','codemirror-fold-comment','codemirror-fold-brace','codemirror-fold-xml','codemirror-fold-indent']]
            
            // Trumbowyg
            ,['styles', 'trumbowyg.css', base+'css/trumbowyg.min.css']
            ,['scripts', 'trumbowyg', base+'js/trumbowyg.min.js', ['jquery']]
            ]);
        }
        return assets;
    },
    
    uuid: function( namespace ) {
        namespace = namespace || "widget"
        return [namespace, new Date().getTime(), ++cnt].join("_");
    }
    
    ,attr_data: function( attr ) {
        var data_attr = '';
        if ( attr[HAS]('data') )
        {
            var k, v, attr_data = attr['data'];
            for(k in attr_data)
            {
                if ( !attr_data[HAS](k) ) continue;
                v = attr_data[k];
                if ( data_attr.length ) data_attr += ' ';
                data_attr += "data-"+k+"='"+v+"'";
            }
        }
        return data_attr;
    }
    
    ,addWidget: function( widget, renderer ) {
        if ( widget && "function"===typeof renderer )
            widgets['wi_'+widget] = renderer;
        else if ( widget && false === renderer && widgets[HAS]('wi_'+widget) )
            delete widgets['wi_'+widget];
    }
    
    ,widget: function( widget, attr, data ) {
        var out = '';
        if ( widget )
        {
            attr = attr || {}; data = data || {};
            if ( widgets[HAS]('wi_'+widget) )
            {
                out = widgets['wi_'+widget](attr, data);
            }
            else
            {
            
            if ( "checkbox" === widget ) attr["type"] = "checkbox";
            else if ( "radio" === widget ) attr["type"] = "radio";
            else if ( "dropdown" === widget ) attr["dropdown"] = true;
            else if ( "syntax-editor" === widget || "source-editor" === widget || "syntax" === widget || "source" === widget || "highlight-editor" === widget || "highlighter" === widget ) attr["syntax-editor"] = true;
            else if ( "wysiwyg-editor" === widget || "wysiwyg" === widget || "rich-editor" === widget || "rich" === widget || "editor" === widget ) attr["wysiwyg-editor"] = true;
            
            switch( widget )
            {
                case 'empty':       out = self.widget_empty(attr, data); break;
                case 'separator':   out = self.widget_separator(attr, data); break;
                case 'icon':        out = self.widget_icon(attr, data); break;
                case 'delayable':   out = self.widget_delayable(attr, data); break;
                case 'disabable':   out = self.widget_disabable(attr, data); break;
                case 'morphable':   out = self.widget_morphable(attr, data); break;
                case 'pages':       out = self.widget_pages(attr, data); break;
                case 'tabs':        out = self.widget_tabs(attr, data); break;
                case 'accordeon':   out = self.widget_accordeon(attr, data); break;
                case 'panel':       out = self.widget_panel(attr, data); break;
                case 'dialog':      out = self.widget_dialog(attr, data); break;
                case 'tooltip':     out = self.widget_tooltip(attr, data); break;
                case 'link':        out = self.widget_link(attr, data); break;
                case 'button':      out = self.widget_button(attr, data); break;
                case 'label':       out = self.widget_label(attr, data); break;
                case 'suggestbox':
                case 'suggest':     out = self.widget_suggest(attr, data); break;
                case 'textbox':
                case 'textfield':
                case 'text':        out = self.widget_text(attr, data); break;
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
                case 'textarea':    out = self.widget_textarea(attr, data); break;
                case 'date':        out = self.widget_date(attr, data); break;
                case 'time':        out = self.widget_time(attr, data); break;
                case 'checkbox':
                case 'radio':
                case 'control':     out = self.widget_control(attr, data); break;
                case 'switch':      out = self.widget_switch(attr, data); break;
                case 'dropdown':
                case 'selectbox':
                case 'select':      out = self.widget_select(attr, data); break;
                case 'menu':        out = self.widget_menu(attr, data); break;
                case 'table':       out = self.widget_table(attr, data); break;
                default: out = ''; break;
            }
            }
        }
        return out;
    }
    
    ,widget_empty: function( attr, data ) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    ,widget_separator: function( attr, data ) {
        var wclass, wstyle;
        self.enqueue('styles', 'htmlwidgets.css');
        wclass = 'widget-separator'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        return '<div class="'+wclass+'" '+wstyle+'></div>';
    }
    
    ,widget_icon: function( attr, data ) {
        var wclass, wstyle;
        self.enqueue('styles', 'htmlwidgets.css');
        wclass = 'fa'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        if ( !empty(attr,'icon') ) wclass += ' fa-'+attr['icon'];
        return "<i class=\""+wclass+"\" "+wstyle+"></i>";
    }
    
    ,widget_delayable: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wspinner;
        self.enqueue('styles', 'htmlwidgets.css');
        self.enqueue('scripts', 'htmlwidgets.js');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'widget-delayable-overlay'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wspinner = 'widget-spinner';
        wspinner += !empty(attr,'spinner') ? " "+attr['spinner'] : " widget-spinner-dots";
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>\
<div class="'+wspinner+'"></div>\
</div>\
';
    }
    
    ,widget_disabable: function( attr, data ) {
        var wid, wclass, wstyle, wextra;
        self.enqueue('styles', 'htmlwidgets.css');
        self.enqueue('scripts', 'htmlwidgets.js');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'widget-disabable-overlay'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>\
</div>\
';
    }
    
    ,widget_morphable: function( attr, data ) {
        var wid, wclass, wstyle, wmodes, wmode_class, wshow_class, whide_class, wselector, wshow_selector, whide_selector;
        //self.enqueue('styles', 'htmlwidgets.css');
        self.enqueue('scripts', 'htmlwidgets.js');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'widget-morphable'; 
        wmodes = [].concat(attr['modes']);
        wmode_class = !empty(attr,'mode') ? attr['mode'] : 'mode-${MODE}';
        wshow_class = !empty(attr,'show') ? attr['show'] : 'show-if-${MODE}';
        whide_class = !empty(attr,'hide') ? attr['hide'] : 'hide-if-${MODE}';
        wselector = "#"+wid+".widget-morphable";
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
        
        if ( isNode )
        {
            self.enqueue('styles', "widget-morphable-"+wid, [wstyle], []);
        }
        else
        {
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
            create_asset( 'style', wstyle ).setAttribute("id", "widget-morphable-"+wid);
        }
        return '';
    }
    
    ,widget_panel: function( attr, data ) {
        return '';
    }
    
    ,widget_accordeon: function( attr, data ) {
        var wid, wstyle, wcontext, witems, i, l, wcontrollers, wctrl, wselector, wselected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        witems = [].concat(attr['items']);
        
        wctrl = "ctrl_"+wid;
        wcontrollers = "<input name=\""+wctrl+"\" type=\"radio\" id=\"item_" + witems.join( "\" class=\"widget-transition-controller widget-"+wctrl+"-controller\"/><input name=\""+wctrl+"\" type=\"radio\" id=\"item_" ) + "\" class=\"widget-transition-controller widget-"+wctrl+"-controller\"/>";
        
        wstyle = '';
        
        // de-activate
        wselector = [];
        for (i=0,l=witems.length; i<l; i++)
            wselector.push(".widget-"+wctrl+"-controller.widget-transition-controller:not(#item_"+witems[i]+"):checked ~ "+wcontext+"#"+witems[i]+"");
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
            wselector.push("#item_"+witems[i]+".widget-"+wctrl+"-controller.widget-transition-controller:checked ~ "+wcontext+"#"+witems[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    max-height: 1500px;\
    -webkit-transition: max-height .3s ease;\
    -moz-transition: max-height .3s ease;\
    -ms-transition: max-height .3s ease;\
    -o-transition: max-height .3s ease;\
    transition: max-height .3s ease;\
}\
';
        if ( isNode )
        {
            self.enqueue('styles', "widget-accordeon-"+wid, [wstyle], []);
        }
        else
        {
            create_asset( 'style', wstyle ).setAttribute("id", "widget-accordeon-"+wid);
        }
        return wcontrollers;
    }
    
    ,widget_tabs: function( attr, data ) {
        var wid, wstyle, wcontext, wtabs, i, l, wcontrollers, wctrl, wselector, wselected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wtabs = [].concat(attr['tabs']);
        
        wctrl = "ctrl_"+wid;
        wcontrollers = "<input name=\""+wctrl+"\" checked type=\"radio\" id=\"tab_" + wtabs.join( "\" class=\"widget-transition-controller widget-"+wctrl+"-controller\"/><input name=\""+wctrl+"\" type=\"radio\" id=\"tab_" ) + "\" class=\"widget-transition-controller widget-"+wctrl+"-controller\"/>";
        
        wstyle = '';
        
        // de-activate
        wselector = [];
        for (i=0,l=wtabs.length; i<l; i++)
            wselector.push(".widget-"+wctrl+"-controller.widget-transition-controller:not(#tab_"+wtabs[i]+"):checked ~ "+wcontext+"#"+wtabs[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: absolute;\
    \
    -webkit-animation-name: widget-fx-slideout;\
    -moz-animation-name: widget-fx-slideout;\
    -ms-animation-name: widget-fx-slideout;\
    -o-animation-name: widget-fx-slideout;\
    animation-name: widget-fx-slideout;\
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
            wselector.push("#tab_"+wtabs[i]+".widget-"+wctrl+"-controller.widget-transition-controller:checked ~ "+wcontext+"#"+wtabs[i]+"");
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: relative;\
    z-index: 10;\
    \
    -webkit-animation-name: widget-fx-slidein;\
    -moz-animation-name: widget-fx-slidein;\
    -ms-animation-name: widget-fx-slidein;\
    -o-animation-name: widget-fx-slidein;\
    animation-name: widget-fx-slidein;\
    \
    -webkit-animation-timing-function: ease-in;\
    -moz-animation-timing-function: ease-in;\
    -ms-animation-timing-function: ease-in;\
    -o-animation-timing-function: ease-in;\
    animation-timing-function: ease-in;\
}\
';
        if ( isNode )
        {
            self.enqueue('styles', "widget-tabs-"+wid, [wstyle], []);
        }
        else
        {
            create_asset( 'style', wstyle ).setAttribute("id", "widget-tabs-"+wid);
        }
        return wcontrollers;
    }
    
    ,widget_pages: function( attr, data ) {
        var wid, wstyle, wcontext, wpages, main_page, i, l, wcontrollers, wselector;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wpages = [].concat(attr['pages']);
        
        wcontrollers = "<span id=\"page_" + wpages.join( "\" class=\"widget-transition-controller widget-page-transition-controller\"></span><span id=\"page_" ) + "\" class=\"widget-transition-controller widget-page-transition-controller\"></span>";
        
        wstyle = '';
        
        // main page
        main_page = wpages.shift();
        wstyle += '\
#'+main_page+'\
{\
    position: relative;\
    -webkit-transform: translateX(0px);\
    -moz-transform: translateX(0px);\
    -ms-transform: translateX(0px);\
    -o-transform: translateX(0px);\
    transform: translateX(0px);\
}\
.widget-page-transition-controller:not(#page_'+main_page+'):target ~ '+wcontext+'#'+main_page+'\
{\
    position: absolute;\
    \
    -webkit-transform: translateX(-100%);\
    -moz-transform: translateX(-100%);\
    -ms-transform: translateX(-100%);\
    -o-transform: translateX(-100%);\
    transform: translateX(-100%);\
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
            wselector.push('#page_'+wpages[i]+'.widget-page-transition-controller:target ~ '+wcontext+'#'+wpages[i]+'');
        wstyle += '\
'+wselector.join(',')+'\
{\
    position: relative;\
    \
    -webkit-transform: translateX(0px);\
    -moz-transform: translateX(0px);\
    -ms-transform: translateX(0px);\
    -o-transform: translateX(0px);\
    transform: translateX(0px);\
    \
    -webkit-transition: -webkit-transform .3s ease;\
    -moz-transition: -moz-transform .3s ease;\
    -ms-transition: -ms-transform .3s ease;\
    -o-transition: -o-transform .3s ease;\
    transition: transform .3s ease;\
}\
';
        if ( isNode )
        {
            self.enqueue('styles', "widget-pages-"+wid, [wstyle], []);
        }
        else
        {
            create_asset( 'style', wstyle ).setAttribute("id", "widget-pages-"+wid);
        }
        return wcontrollers;
    }
    
    ,widget_dialog: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wicon, wtitle, wbuttons, wcontent;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtitle = isset(data,'title') ? data['title'] : ''; 
        wbuttons = isset(attr,'buttons') ? attr['buttons'] : ''; 
        wcontent = isset(data,'content') ? data['content'] : '';
        wclass = 'widget-dialog'; 
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
        wdata = self.attr_data(attr);
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
<div class="widget-dialog-title">'+wicon+wtitle+'</div>\
<div class="widget-dialog-content">'+wcontent+'</div>\
<div class="widget-dialog-buttons">'+wbuttons+'</div>\
</div>\
';
    }
    
    ,widget_tooltip: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wtext, warrow;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'widget-tooltip'; 
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
                warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-bottom"></div>';
            else if ( 'bottom' === attr.toolip )
                warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-top"></div>';
            else if ( 'right' === attr.toolip )
                warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-left"></div>';
            else
                warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-right"></div>';
        }
        else
        {
            warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-right"></div>';
        }
        wdata = self.attr_data(attr);
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>\
'+wtext+'\
'+warrow+'\
</div>\
';
    }
    
    ,widget_label: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wfor, wtext, wtitle;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wfor = isset(attr,"for") ? 'for="'+attr['for']+'"' : '';
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'widget widget-label'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        if ( !empty(attr,'icon') )
        {
            wclass += ' widget-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            wclass += ' widget-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wdata = self.attr_data(attr);
        return '\
<label id="'+wid+'" '+wfor+' class="'+wclass+'" title="'+wtitle+'" '+wstyle+' '+wextra+' '+wdata+'>'+wtext+'</label>\
';
    }
    
    ,widget_link: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, whref, wfor, wtext;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'widget-link'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        if ( !empty(attr,'icon') )
        {
            wclass += ' widget-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            wclass += ' widget-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wdata = self.attr_data(attr);
        if ( isset(attr,'for') )
        {
            wfor = attr['for'];
            return '\
<label id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" for="'+wfor+'" '+wdata+'>'+wtext+'</label>\
';
        }
        else
        {
            whref = isset(attr,'href') ? attr['href'] : '#';
            return '\
<a id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" href="'+whref+'" '+wdata+'>'+wtext+'</a>\
';
        }
    }
    
    ,widget_button: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtype, wtitle, wtext, whref, wfor;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'widget widget-button'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        if ( !empty(attr,'icon') )
        {
            if ( !wtext.length ) wclass += ' widget-icon-only';
            else wclass += ' widget-icon';
            wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>" + wtext;
        }
        if ( !empty(attr,'iconr') )
        {
            if ( !wtext.length ) wclass += ' widget-icon-only';
            else wclass += ' widget-icon-right';
            wtext = wtext + "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
        }
        wdata = self.attr_data(attr);
        if ( isset(attr,'for') )
        {
            wfor = attr['for'];
            return '\
<label id="'+wid+'" for="'+wfor+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+'</label>\
';
        }
        else if ( isset(attr,'href') )
        {
            whref = attr['href'];
            return '\
<a id="'+wid+'" href="'+whref+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+'</a>\
';
        }
        else
        {
            wtype = isset(attr,'type') ? attr['type'] : 'button';
            return '\
<button id="'+wid+'" type="'+wtype+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+'</button>\
';
        }
    }
    
    ,widget_control: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wchecked, wvalue, wname, wtype, wstate;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1"; 
        wtitle = isset(attr,"title") ? attr["title"] : ""; 
        wchecked = !empty(attr,'checked') && attr['checked'] ? 'checked' : '';
        wclass = 'widget widget-control'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        if ( "checkbox" === wtype ) wclass += ' widget-checkbox';
        else if ( "radio" === wtype ) wclass += ' widget-radio';
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wstate = '';
        if ( isset(attr,'state-on') ) wstate += ' data-state-on="'+attr['state-on']+'"';
        if ( isset(attr,'state-off') ) wstate += ' data-state-off="'+attr['state-off']+'"';
        wdata = self.attr_data(attr);
        return '\
<input type="'+wtype+'" id="'+wid+'" '+wname+' class="'+wclass+'" '+wstyle+' '+wextra+' value="'+wvalue+'" '+wdata+' '+wchecked+' /><label for="'+wid+'" title="'+wtitle+'" '+wstate+'>&nbsp;</label>\
';
    }
    
    ,widget_switch: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wchecked, wiconon, wiconoff, wvalue, wvalue2, wdual, wname, wtype, wreverse, wstates, wswitches;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1"; 
        wvalue2 = isset(data,"valueoff") ? data["valueoff"] : false;
        wdual = false !== wvalue2;
        wtitle = isset(attr,"title") ? attr["title"] : ""; 
        wchecked = !empty(attr,'checked') && attr['checked'];
        wclass = 'widget widget-switch'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
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
        wdata = self.attr_data(attr);
        if ( wdual )
        {
            // dual switch with separate on/off states
            wclass += ' dual';
            wtype = 'radio';
            if ( wchecked )
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="widget-switch-state widget-switch-state-on" value="'+wvalue+'" '+wextra+' '+wdata+' checked /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="widget-switch-state widget-switch-state-off" value="'+wvalue2+'" '+wextra+' '+wdata+' />';
            }
            else
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="widget-switch-state widget-switch-state-on" value="'+wvalue+'" '+wextra+' '+wdata+' /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="widget-switch-state widget-switch-state-off" value="'+wvalue2+'" '+wextra+' '+wdata+' checked />';
            }
            if ( wreverse ) 
            {
                wclass += ' reverse';
                wswitches = '<label for="'+wid+'-off" class="widget-switch-off">'+wiconoff+'</label><label for="'+wid+'-on" class="widget-switch-on">'+wiconon+'</label>';
            }
            else
            {
                wswitches = '<label for="'+wid+'-on" class="widget-switch-on">'+wiconon+'</label><label for="'+wid+'-off" class="widget-switch-off">'+wiconoff+'</label>';
            }
        }
        else
        {
            // switch with one state for on/off
            if ( wchecked ) wchecked = 'checked';
            wstates = '<input type="'+wtype+'" id="'+wid+'" '+wname+' class="widget-switch-state" value="'+wvalue+'" '+wextra+' '+wdata+' '+wchecked+' />';
            if ( wreverse ) 
            {
                wclass += ' reverse';
                wswitches = '<label for="'+wid+'" class="widget-switch-off">'+wiconoff+'</label><label for="'+wid+'" class="widget-switch-on">'+wiconon+'</label>';
            }
            else
            {
                wswitches = '<label for="'+wid+'" class="widget-switch-on">'+wiconon+'</label><label for="'+wid+'" class="widget-switch-off">'+wiconoff+'</label>';
            }
        }
        return '\
<span class="'+wclass+'" title="'+wtitle+'" '+wstyle+'>\
'+wstates+wswitches+'\
<span class="widget-switch-handle"></span>\
</span>\
';
    }
    
    ,widget_text: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wtype, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        wtitle = isset(attr,'title') ? attr['title'] : "";
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wtype = !empty(attr,"type") ? attr["type"] : 'text';
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
        }
        if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        wdata = self.attr_data(attr);
        if ( wicon.length )
            return '\
<span class="'+wrapper_class+'" '+wstyle+'>\
<input type="'+wtype+'" id="'+wid+'" '+wname+' title="'+wtitle+'" class="'+wclass+'" '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wdata+' />\
'+wicon+'\
</span>\
';
        else
            return '\
<input type="'+wtype+'" id="'+wid+'" '+wname+' title="'+wtitle+'" class="'+wclass+'" '+wstyle+' '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wdata+' />\
';
    }
    
    ,widget_suggest: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wajax, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        wtitle = isset(attr,'title') ? attr['title'] : "";
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text widget-suggest'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wajax = attr["ajax"];
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
            wicon += "<span class=\"fa-wrapper right-fa widget-suggest-spinner\"><i id=\""+wid+"-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        else if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper left-fa widget-suggest-spinner\"><i id=\""+wid+"-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            wrapper_class += ' widget-icon';
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        wdata = self.attr_data(attr);
        var _script = '', script = '\
jQuery(function($){\
var $el = $("#'+wid+'"), suggest = $el.parent();\
$el.suggest({\
    minLength: 2,\
    maxLength: -1,\
    source: function(value, response) {\
        suggest.addClass("ajax");\
        $.ajax({\
            url: "'+wajax+'",\
            type: "POST",\
            data: {suggest: value},\
            dataType: "json",\
            success: function( data ){\
                suggest.removeClass("ajax");\
                response(data);\
            }\
        });\
    },\
    select: function( ) {\
        //console.log($el.suggest("selectedOption"), $el.suggest("selectedData"))\
    }\
});\
});\
';
        if ( isNode ) self.enqueue('scripts', "widget-suggest-"+wid, [script], ['htmlwidgets.js']);
        else _script = script;
        return '\
<span class="'+wrapper_class+'" '+wstyle+'>\
<input type="text" id="'+wid+'" '+wname+' title="'+wtitle+'" class="'+wclass+'" '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" autocomplete="off" '+wdata+' />\
'+wicon+'\
</span>\
' + _script;
    }
    
    ,widget_textarea: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wplaceholder, wvalue, wname, wtitle, weditor, defaults;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        wtitle = isset(attr,'title') ? attr['title'] : "";
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : wtitle;
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.attr_data(attr);
        var _script = '', script = '';
        if ( !empty(attr,'syntax-editor') && true == attr['syntax-editor'] ) 
        {
            defaults = {
             'mode'             : 'text/html'
            ,'theme'            : 'default'
            ,'lineWrapping'     : false
            ,'lineNumbers'      : true
            ,'indentUnit'       : 4
            ,'indentWithTabs'   : false
            ,'lint'             : false
            ,'foldGutter'       : true
            ,'gutters'          : ["CodeMirror-lint-markers","CodeMirror-linenumbers","CodeMirror-foldgutter"]
            };
            wclass = 'widget widget-syntax-editor';
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            wstyle = !empty(attr,"style") ? attr["style"] : '';
            weditor = json_encode(!empty(attr,'config') ? merge(defaults,attr['config']) : defaults);
            script = '<script>\
jQuery(function(\$){\
CodeMirror.fromTextArea(document.getElementById('+wid+'), '+weditor+');\
});\
</script>';
            if ( isNode )
            {
                self.enqueue('styles', 'codemirror-styles');
                self.enqueue('scripts', "widget-syntax-editor-"+wid, [script], ['codemirror']);
            }
            else
            {
                _script = script;
            }
            wstyle = '';
        }
        else if ( !empty(attr,'wysiwyg-editor') && true == attr['wysiwyg-editor'] ) 
        {
            defaults = { };
            wclass = 'widget widget-wysiwyg-editor'; 
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            wstyle = !empty(attr,"style") ? attr["style"] : ''; 
            weditor = !empty(attr,'config') ? json_encode(merge(defaults,attr['config'])) : '';
            script = '<script>\
jQuery(function($){\
$("#'+wid+'").trumbowyg('+weditor+');\
$("#'+wid+'").closest(".trumbowyg-box").addClass("widget widget-wysiwyg-editor-box").attr("style","'+wstyle+'");\
});\
</script>';
            if ( isNode )
            {
                self.enqueue('styles', 'trumbowyg-styles');
                self.enqueue('scripts', "widget-wysiwyg-editor-"+wid, [script], ['trumbowyg']);
            }
            else
            {
                _script = script;
            }
            wstyle = '';
        }
        else
        {
            wclass = 'widget widget-textarea'; 
            if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
            wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        }
        return '\
<textarea id="'+wid+'" '+wname+' title="'+wtitle+'" class="'+wclass+'" '+wstyle+' '+wextra+' placeholder="'+wplaceholder+'" '+wdata+'>'+wvalue+'</textarea>\
' + _script;
    }
    
    ,widget_date: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wplaceholder, wicon, wvalue, wname, wtitle, wformat, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : ""; 
        wtitle = isset(attr,'title') ? attr['title'] : "";
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text widget-date'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wformat = !empty(attr,"format") ? attr["format"] : 'Y-m-d';
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( !empty(attr,'icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
        }
        if ( !empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        if ( empty(attr,'icon') && empty(attr,'iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        wdata = self.attr_data(attr);
        var _script = '', script = '\
jQuery(function($){\
$("#'+wid+'").datetime({\
    format: "'+wformat+'",\
    datetimelocale: $.htmlwidget.datetime.default_locale,\
    encoder: $.htmlwidget.datetime.date_encoder,\
    decoder: $.htmlwidget.datetime.date_decoder\
});\
});\
';
        if ( isNode ) self.enqueue('scripts', "widget-datetime-"+wid, [script], ['htmlwidgets.js']);
        else _script = script;
        return '\
<span class="'+wrapper_class+'" '+wstyle+'>\
<input type="text" id="'+wid+'" '+wname+' title="'+wtitle+'" class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' '+wdata+' />\
'+wicon+'\
</span>\
' + _script;
    }
    
    ,widget_time: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wvalue, wname, wnam, wformat, wtimes,
            time_options, i, tt, t, p, f, selected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? attr["name"] : '';
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
        wclass = 'widget widget-time'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.attr_data(attr);
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
            wtimes.push('<select class="widget-time-component" id="'+wid+'_'+t+'" '+wnam+'>'+time_options[t].join('')+'</select>');
        }
        wtimes = wtimes.join('<span class="widget-time-sep">:</span>');
        return '\
<span class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
'+wtimes+'\
</span>\
';
    }
    
    ,widget_select: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wname, wdropdown, woptions, wselected, 
            opts, o, opt, l, key, val, selected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wdropdown = !empty(attr,'dropdown') && true==attr['dropdown'];
        wclass = wdropdown ? 'widget widget-dropdown widget-state-default' : 'widget widget-select';
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wselected = isset(data,'selected') ? data['selected'] : [];
        if ( !(wselected instanceof Array) ) wselected = [wselected];
        woptions = ''; 
        opts = data['options'];
        l = opts.length;
        for(o=0; o<l; o++)
        {
            opt = opts[o];
            if ( Object === opt.constructor )
            {
                key = KEYS(opt).shift();
                val = opt[key];
            }
            else
            {
                key = opt;
                val = opt;
            }
            selected = -1 < wselected.indexOf(key) ? 'selected="selected"' : '';
            woptions += "<option value=\""+key+"\" "+selected+">"+val+"</option>";
        }
        wdata = self.attr_data(attr);
        if ( wdropdown )
            return '\
<span class="'+wclass+'" '+wstyle+'>\
<select id="'+wid+'" '+wname+' class="widget-dropdown-select widget-state-default" '+wextra+' '+wdata+'>\
'+woptions+'\
</select>\
</span>\
';
        else
            return '\
<select id="'+wid+'" '+wname+' class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
'+woptions+'\
</select>\
';
    }
    
    ,widget_menu: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wmenu;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wmenu = data['menu'];
        wclass = 'widget widget-dropdown-menu'; 
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.attr_data(attr);
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>'+wmenu+'</div>\
';
    }
    
    ,widget_table: function( attr, data ) {
        var wid, wclass, wstyle, wextra, wdata, wdataTable, wcolumns, wrows, woptions, wcontrols,
            column_values, column_keys, row, rowk, r, c, rl, cl, ctrl, ctrls;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = isset(attr,"id") ? attr["id"] : self.uuid(); 
        wclass = 'widget widget-table'; 
        if ( !isset(attr,'stripped') || attr['stripped'] ) wclass += ' stripped';
        if ( !isset(attr,'responsive') || attr['responsive'] ) wclass += ' responsive';
        if ( !empty(attr,"class") ) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wcolumns = '';
        column_values = data['columns'];
        column_keys = KEYS(data_cols);
        cl = column_keys.length
        for(c=0; c<cl; c++)
        {
            wcolumns += "<th data-key=\""+column_keys[c]+"\">"+column_values[column_keys[c]]+"</th>";
        }
        wcolumns = "<tr>"+wcolumns+"</tr>";
        wrows = ''; rl = data['rows'].length;
        for(r=0; r<rl; r++)
        {
            row = data['rows'][r]; 
            rowk = KEYS(row);
            wrows += "\n" + "<tr>";
            for(c=0; c<cl; c++)
            {
                wrows += "<td data-column=\""+column_values[column_keys[c]]+"\">"+row[rowk[c]]+"</td>";
            }
            wrows += "</tr>";
        }
        wdata = self.attr_data(attr);
        wdataTable = isset(attr,'dataTable');
        var _script = '', script = '';
        if ( wdataTable )
        {
            woptions = Object===attr['dataTable'].constructor ? json_encode(attr['dataTable']) : '';
            wcontrols = [
             "$('#"+wid+"_filter').find('input').addClass('widget-text');"
            ,"$('#"+wid+"_length').find('select').addClass('widget-select');"
            ];
            if ( !empty(attr,'controls') ) 
            {
                ctrls = attr['controls'] instanceof Array ? attr['controls'] : [attr['controls']];
                for(ctrl=0; ctrl<ctrls.length; ctrl++)
                {
                    wcontrols.push('$(".widget-table-controls", "#'+wid+'_wrapper").append($("'+ctrls[ctrl].split('"').join('\\"')+'"));');
                }
            }
            wcontrols = wcontrols.join("\n");
            script = '\
jQuery(function($){\
$("#'+wid+'").dataTable('+woptions+').on("change", "input.select_row", function( ){\
    if ( this.checked ) $(this).closest("tr").addClass("selected");\
    else $(this).closest("tr").removeClass("selected");\
});\
$("#'+wid+'").closest(".dataTables_wrapper").addClass("widget-table-wrapper");\
'+wcontrols+'\
});\
';
            if ( isNode )
            {
                self.enqueue('styles', 'jquery.dataTables.css');
                self.enqueue('scripts', "widget-datatable-"+wid, [script], ['jquery.dataTables']);
            }
            else
            {
                _script = script;
            }
        }
        return '\
<table id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
<thead>'+wcolumns+'</thead>\
<tbody>'+wrows+'</tbody>\
</table>\
' + _script;
    }
};

// export it
return HtmlWidget;
});