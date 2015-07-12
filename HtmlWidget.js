/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/JS, Python
*
*  @dependencies: FontAwesome, jQuery
*  @version: 0.1
*  https://github.com/foo123/HtmlWidget
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
    HAS = 'hasOwnProperty', KEYS = Object.keys, toJSON = JSON.stringify, 
    cnt = 0, self, widgets = {}, enqueuer = null;
    
// http://davidwalsh.name/add-rules-stylesheets
function addCSSRule( style, selector, rules, index ) 
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

function addCSS( style, css ) 
{
    if ( "object" === typeof css )
    {
        var n, declaration, i = 0;
        for (n in css)
        {
            if ( css[HAS](n) )
            {
                declaration = css[ n ];
                declaration.css = addCSSRule( style, declaration.selector, [].concat(declaration.rules).join('; '), i++ );
            }
        }
    }
    return css;
}

function createStyleSheet( media, css ) 
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
    if ( css ) addCSS( style, css );
    return style;
}

function disposeStyleSheet( style ) 
{
    if ( style ) 
        document.head.removeChild( style );
}

var HtmlWidget = self = {
    
    VERSION: "0.1",
    
    enqueueAssets: function(_enqueuer) {
        if ( enqueuer && 'function' === typeof enqueuer ) enqueuer = _enqueuer;
        else enqueuer = null;
    },
    
    enqueue: function(type, id, asset, deps) {
        if ( enqueuer ) 
            enqueuer(type, id, asset||null, deps||[]);
    },
    
    assets: function(base) {
        base = (base||'') + '/assets/';
        return [
         ['styles', 'htmlwidgets.css', base+'css/htmlwidgets.css', ['responsive.css','font-awesome.css']]
        ,['scripts', 'htmlwidgets.js', base+'js/htmlwidgets.js', ['jquery']]
        ,['styles', 'trumbowyg.css', base+'css/trumbowyg.min.css']
        ,['scripts', 'trumbowyg', base+'js/trumbowyg.min.js', ['trumbowyg.css','jquery']]
        ,['styles', 'jquery.dataTables.css', base+'css/jquery.dataTables.css']
        ,['scripts', 'jquery.dataTables', base+'js/jquery.dataTables.js', ['jquery.dataTables.css','jquery']]
        ];
    },
    
    uuid: function(namespace) {
        namespace = namespace || "widget"
        return [namespace, new Date().getTime(), ++cnt].join("_");
    }
    
    ,attr_data: function(attr) {
        var data_attr = '';
        if ( attr[HAS]('data') )
        {
            var k, v, attr_data = attr['data'];
            for(k in attr_data)
            {
                if ( attr_data[HAS](k) )
                {
                    v = attr_data[k];
                    if ( data_attr.length ) data_attr += ' ';
                    data_attr += "data-"+k+"='"+v+"'";
                }
            }
        }
        return data_attr;
    }
    
    ,addWidget: function(widget, renderer) {
        if ( widget && "function"===typeof renderer )
            widgets['wi_'+widget] = renderer;
        else if ( widget && false === renderer && widgets[HAS]('wi_'+widget) )
            delete widgets['wi_'+widget];
    }
    
    ,widget: function(widget, attr, data) {
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
            else if ( "editor" === widget ) attr["editor"] = true;
            
            switch( widget )
            {
                case 'empty':       out = self.widget_empty(attr, data); break;
                case 'separator':   out = self.widget_separator(attr, data); break;
                case 'icon':        out = self.widget_icon(attr, data); break;
                case 'delayable':   out = self.widget_delayable(attr, data); break;
                case 'disabable':   out = self.widget_disabable(attr, data); break;
                case 'morphable':   out = self.widget_morphable(attr, data); break;
                case 'dialog':      out = self.widget_dialog(attr, data); break;
                case 'tooltip':     out = self.widget_tooltip(attr, data); break;
                case 'link':        out = self.widget_link(attr, data); break;
                case 'button':      out = self.widget_button(attr, data); break;
                case 'label':       out = self.widget_label(attr, data); break;
                case 'suggestbox':
                case 'suggest':     out = self.widget_suggest(attr, data); break;
                case 'textbox':
                case 'text':        out = self.widget_text(attr, data); break;
                case 'editor':
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
    
    ,widget_empty: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    ,widget_separator: function(attr, data) {
        var wclass, wstyle;
        self.enqueue('styles', 'htmlwidgets.css');
        wclass = 'widget-separator'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        return '<div class="'+wclass+'" '+wstyle+'></div>';
    }
    
    ,widget_icon: function(attr, data) {
        var wclass, wstyle;
        self.enqueue('styles', 'htmlwidgets.css');
        wclass = 'fa'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        if (attr[HAS]('icon')) wclass += ' fa-'+attr['icon'];
        return "<i class=\""+wclass+"\" "+wstyle+"></i>";
    }
    
    ,widget_delayable: function(attr, data) {
        var wid, wclass, wstyle, wextra, wspinner;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid();
        wclass = 'widget-delayable-overlay'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wspinner = 'widget-spinner';
        wspinner += attr[HAS]('spinner') ? " "+attr['spinner'] : " widget-spinner-dots";
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>\
<div class="'+wspinner+'"></div>\
</div>\
';
    }
    
    ,widget_disabable: function(attr, data) {
        var wid, wclass, wstyle, wextra, wspinner;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid();
        wclass = 'widget-disabable-overlay'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wspinner = 'widget-spinner';
        wspinner += attr[HAS]('spinner') ? " "+attr['spinner'] : " widget-spinner-dots";
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>\
<div class="'+wspinner+'"></div>\
</div>\
';
    }
    
    ,widget_morphable: function(attr, data) {
        var wid, wclass, wstyle, wmodes, wmode_class, wshow_class, whide_class, wselector, wshow_selector, whide_selector;
        //self.enqueue('styles', 'htmlwidgets.css');
        wid = attr["id"];
        wclass = 'widget-morphable'; 
        wmodes = [].concat(attr['modes']);
        wmode_class = attr[HAS]('mode') ? attr['mode'] : 'mode-${MODE}';
        wshow_class = attr[HAS]('show') ? attr['show'] : 'show-if-${MODE}';
        whide_class = attr[HAS]('hide') ? attr['hide'] : 'hide-if-${MODE}';
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
        if ( isNode )
        {
            wstyle = '';
            wstyle += whide_selector.join(',') + '{display: none !important}';
            wstyle += wshow_selector.join(',') + '{display: block}';
            self.enqueue('styles', "widget-morphable-"+wid, [wstyle], []);
        }
        else
        {
            wstyle = {
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
            };
            createStyleSheet( 'all', wstyle ).setAttribute("id", "widget-morphable-"+wid);
        }
        return '';
    }
    
    ,widget_dialog: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wicon, wtitle, wbuttons, wcontent;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wtitle = data[HAS]('title') ? data['title'] : ''; 
        wbuttons = attr[HAS]('buttons') ? attr['buttons'] : ''; 
        wcontent = data[HAS]('content') ? data['content'] : '';
        wclass = 'widget-dialog'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wicon = '';
        if ( attr[HAS]('icon') )
        {
            wicon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        if ( attr[HAS]("form") && attr.form )
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
    
    ,widget_tooltip: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wtext, warrow;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wtext = data[HAS]('text') ? data['text'] : '';
        wtitle = attr[HAS]('title') ? attr['title'] : wtext;
        wclass = 'widget-tooltip'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        if ( attr[HAS]('icon') )
        {
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        else if ( attr[HAS]('iconr') )
        {
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        if ( attr[HAS]('tooltip') )
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
    
    ,widget_link: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wicon, wtitle, whref, wtext;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        whref = attr['href']; 
        wtext = data[HAS]('text') ? data['text'] : '';
        wtitle = attr[HAS]('title') ? attr['title'] : wtext;
        wclass = 'widget-link'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wicon = '';
        if ( attr[HAS]('icon') )
        {
            wicon = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>";
        }
        wdata = self.attr_data(attr);
        return '\
<a id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" href="'+whref+'" '+wdata+'>'+wicon+wtext+'</a>\
';
    }
    
    ,widget_label: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wfor, wtext, wtitle;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wfor = attr["for"];
        wtext = data[HAS]('text') ? data['text'] : '';
        wtitle = attr[HAS]('title') ? attr['title'] : wtext;
        wclass = 'widget widget-label'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        if ( attr[HAS]('icon') )
        {
            wclass += ' widget-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if ( attr[HAS]('iconr') )
        {
            wclass += ' widget-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wdata = self.attr_data(attr);
        return '\
<label id="'+wid+'" for="'+wfor+'" class="'+wclass+'" title="'+wtitle+'" '+wstyle+' '+wextra+' '+wdata+'>'+wtext+'</label>\
';
    }
    
    ,widget_button: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wtype, wtitle, wtext, whref;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wtext = data[HAS]('text') ? data['text'] : '';
        wtitle = attr[HAS]('title') ? attr['title'] : wtext;
        wclass = 'widget widget-button'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        if ( attr[HAS]('icon') )
        {
            if ( !wtext.length ) wclass += ' widget-icon-only';
            else wclass += ' widget-icon';
            wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>" + wtext;
        }
        if ( attr[HAS]('iconr') )
        {
            if ( !wtext.length ) wclass += ' widget-icon-only';
            else wclass += ' widget-icon-right';
            wtext = wtext + "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
        }
        wdata = self.attr_data(attr);
        if ( attr[HAS]('href') )
        {
            whref = attr['href'];
            return '\
<a id="'+wid+'" href="'+whref+'" class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+'</a>\
';
        }
        else
        {
            wtype = attr[HAS]('type') ? 'type="'+attr['type']+'"' : '';
            return '\
<button id="'+wid+'" '+wtype+' class="'+wclass+'" '+wstyle+' '+wextra+' title="'+wtitle+'" '+wdata+'>'+wtext+'</button>\
';
        }
    }
    
    ,widget_control: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wchecked, wvalue, wname, wtype, wstate;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wtype = attr[HAS]('type') ? attr['type'] : 'checkbox';
        wvalue = data[HAS]("value") ? data["value"] : "1"; 
        wtitle = attr[HAS]("title") ? attr["title"] : ""; 
        wchecked = attr[HAS]('checked') && attr['checked'] ? 'checked' : '';
        wclass = 'widget widget-control'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        if ( "checkbox" === wtype ) wclass += ' widget-checkbox';
        else if ( "radio" === wtype ) wclass += ' widget-radio';
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wstate = '';
        if ( attr[HAS]('state-on') ) wstate += ' data-state-on="'+attr['state-on']+'"';
        if ( attr[HAS]('state-off') ) wstate += ' data-state-off="'+attr['state-off']+'"';
        wdata = self.attr_data(attr);
        return '\
<input type="'+wtype+'" id="'+wid+'" name="'+wname+'" class="'+wclass+'" '+wstyle+' '+wextra+' value="'+wvalue+'" '+wdata+' '+wchecked+' /><label for="'+wid+'" title="'+wtitle+'" '+wstate+'>&nbsp;</label>\
';
    }
    
    ,widget_switch: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wchecked, wiconon, wiconoff, wvalue, wname, wtype, wreverse, wstates;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wtype = attr[HAS]('type') ? attr['type'] : 'checkbox';
        wvalue = data[HAS]("value") ? data["value"] : "1"; 
        wtitle = attr[HAS]("title") ? attr["title"] : ""; 
        wchecked = attr[HAS]('checked') && attr['checked'] ? 'checked' : '';
        wclass = 'widget widget-switch'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wreverse = attr[HAS]("reverse")&&attr["reverse"];
        wiconon='&nbsp;'; wiconoff='&nbsp;';
        if ( attr[HAS]("iconon") && !attr[HAS]("iconoff") )
        {
            wiconon = '<i class="fa fa-'+attr.iconon+' not-negative"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconon+' negative"></i>';
        }
        else if ( attr[HAS]("iconoff") && !attr[HAS]("iconon") )
        {
            wiconon = '<i class="fa fa-'+attr.iconoff+' positive"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconoff+' not-positive"></i>';
        }
        else if ( attr[HAS]("iconon") && attr[HAS]("iconoff") )
        {
            wiconon = '<i class="fa fa-'+attr.iconon+'"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconoff+'"></i>';
        }
        if ( wreverse ) 
        {
            wclass += ' reverse';
            wstates = '<label for="'+wid+'" class="widget-switch-off">'+wiconoff+'</label><label for="'+wid+'" class="widget-switch-on">'+wiconon+'</label>';
        }
        else
        {
            wstates = '<label for="'+wid+'" class="widget-switch-on">'+wiconon+'</label><label for="'+wid+'" class="widget-switch-off">'+wiconoff+'</label>';
        }
        wdata = self.attr_data(attr);
        return '\
<span class="'+wclass+'" title="'+wtitle+'" '+wstyle+'>\
<input type="'+wtype+'" id="'+wid+'" name="'+wname+'" class="widget-switch-button" value="'+wvalue+'" '+wextra+' '+wdata+' '+wchecked+' />\
'+wstates+'\
<span class="widget-switch-handle widget-state-default"></span>\
</span>\
';
    }
    
    ,widget_text: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wtype, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wvalue = data[HAS]("value") ? data["value"] : ""; 
        wtitle = attr[HAS]('title') ? attr['title'] : "";
        wplaceholder = attr[HAS]('placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wtype = attr[HAS]("type") ? attr["type"] : 'text';
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( attr[HAS]('icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
        }
        if ( attr[HAS]('iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        wdata = self.attr_data(attr);
        if ( wicon.length )
            return '\
<span class="'+wrapper_class+'" '+wstyle+'>\
<input type="'+wtype+'" id="'+wid+'" name="'+wname+'" title="'+wtitle+'" class="'+wclass+'" '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wdata+' />\
'+wicon+'\
</span>\
';
        else
            return '\
<input type="'+wtype+'" id="'+wid+'" name="'+wname+'" title="'+wtitle+'" class="'+wclass+'" '+wstyle+' '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wdata+' />\
';
    }
    
    ,widget_suggest: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wajax, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wvalue = data[HAS]("value") ? data["value"] : ""; 
        wtitle = attr[HAS]('title') ? attr['title'] : "";
        wplaceholder = attr[HAS]('placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text widget-suggest'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wajax = attr["ajax"];
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( attr[HAS]('icon') )
        {
            wicon = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
        }
        wicon += "<span class=\"fa-wrapper right-fa\"><i id=\""+wid+"-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
        wrapper_class += ' widget-icon-right';
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
<input type="text" id="'+wid+'" name="'+wname+'" title="'+wtitle+'" class="'+wclass+'" '+wextra+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wdata+' />\
'+wicon+'\
</span>\
' + _script;
    }
    
    ,widget_textarea: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wplaceholder, wvalue, wname, wtitle, weditor;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wvalue = data[HAS]("value") ? data["value"] : ""; 
        wtitle = attr[HAS]('title') ? attr['title'] : "";
        wplaceholder = attr[HAS]('placeholder') ? attr['placeholder'] : wtitle;
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wdata = self.attr_data(attr);
        var _script = '', script = '';
        if ( attr[HAS]('editor') && attr.editor ) 
        {
            wclass = 'widget widget-editor'; 
            if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
            wstyle = attr[HAS]("style") ? attr["style"] : ''; 
            weditor = attr[HAS]('config') ? toJSON(attr['config']) : '';
            script = '<script>\
jQuery(function($){\
$("#'+wid+'").trumbowyg('+weditor+');\
$("#'+wid+'").closest(".trumbowyg-box").addClass("widget widget-editor-box").attr("style","'+wstyle+'");\
});\
</script>';
            if ( isNode ) self.enqueue('scripts', "widget-editor-"+wid, [script], ['trumbowyg']);
            else _script = script;
            wstyle = '';
        }
        else
        {
            wclass = 'widget widget-textarea'; 
            if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
            wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        }
        return '\
<textarea id="'+wid+'" name="'+wname+'" title="'+wtitle+'" class="'+wclass+'" '+wstyle+' '+wextra+' placeholder="'+wplaceholder+'" '+wdata+'>'+wvalue+'</textarea>\
' + _script;
    }
    
    ,widget_date: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wplaceholder, wicon, wvalue, wname, wtitle, wformat, wrapper_class;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wvalue = data[HAS]("value") ? data["value"] : ""; 
        wtitle = attr[HAS]('title') ? attr['title'] : "";
        wplaceholder = attr[HAS]('placeholder') ? attr['placeholder'] : wtitle;
        wclass = 'widget widget-text widget-date'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wformat = attr[HAS]("format") ? attr["format"] : 'Y-m-d';
        wicon = '';
        wrapper_class = 'widget-wrapper';
        if ( attr[HAS]('icon') )
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' widget-icon';
        }
        if ( attr[HAS]('iconr') )
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' widget-icon-right';
        }
        if ( !attr[HAS]('icon') && !attr[HAS]('iconr') )
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
<input type="text" id="'+wid+'" name="'+wname+'" title="'+wtitle+'" class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' '+wdata+' />\
'+wicon+'\
</span>\
' + _script;
    }
    
    ,widget_time: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wvalue, wname, wformat, wtimes,
            time_options, i, tt, t, p, f, selected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wformat = attr[HAS]('format') ? attr['format'].split(':') : ["h","m","s"];
        if (data[HAS]('value')) 
        {
            wvalue = data['value'] instanceof Array ? data['value'] : data['value'].split(':');
            while ( wvalue.length < 3 ) wvalue.push("00");
        }
        else
        {
            wvalue = ["00", "00", "00"];
        }
        wclass = 'widget widget-time'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
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
            wtimes.push('<select class="widget-time-component" id="'+wid+'_'+t+'" name="'+wname+'['+t+']">'+time_options[t].join('')+'</select>');
        }
        wtimes = wtimes.join('<span class="widget-time-sep">:</span>');
        return '\
<span class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
'+wtimes+'\
</span>\
';
    }
    
    ,widget_select: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wname, wdropdown, woptions, wselected, 
            opts, o, opt, l, key, val, selected;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wname = attr['name'];
        wdropdown = attr[HAS]('dropdown') && attr['dropdown'];
        if ( wdropdown )
            wclass = 'widget widget-dropdown widget-state-default';  
        else
            wclass = 'widget widget-select'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wselected = data[HAS]('selected') ? data['selected'] : [];
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
<select id="'+wid+'" name="'+wname+'" class="widget-dropdown-select widget-state-default" '+wextra+' '+wdata+'>\
'+woptions+'\
</select>\
</span>\
';
        else
            return '\
<select id="'+wid+'" name="'+wname+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>\
'+woptions+'\
</select>\
';
    }
    
    ,widget_menu: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wmenu;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wmenu = data['menu'];
        wclass = 'widget widget-dropdown-menu'; 
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
        wdata = self.attr_data(attr);
        return '\
<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>'+wmenu+'</div>\
';
    }
    
    ,widget_table: function(attr, data) {
        var wid, wclass, wstyle, wextra, wdata, wdataTable, wcolumns, wrows, woptions, wcontrols,
            column_values, column_keys, row, rowk, r, c, rl, cl, ctrl, ctrls;
        self.enqueue('styles', 'htmlwidgets.css');
        wid = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        wclass = 'widget widget-table'; 
        if ( !attr[HAS]('stripped') || attr['stripped'] ) wclass += ' stripped';
        if ( !attr[HAS]('responsive') || attr['responsive'] ) wclass += ' responsive';
        if ( attr[HAS]("class") ) wclass += ' '+attr["class"];
        wstyle = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        wextra = attr[HAS]("extra") ? attr["extra"] : '';
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
        wdataTable = attr[HAS]('dataTable');
        var _script = '', script = '';
        if ( wdataTable )
        {
            woptions = Object===attr['dataTable'].constructor ? toJSON(attr['dataTable']) : '';
            wcontrols = [
             "$('#"+wid+"_filter').find('input').addClass('widget-text');"
            ,"$('#"+wid+"_length').find('select').addClass('widget-select');"
            ];
            if ( attr[HAS]('controls') ) 
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
            if ( isNode ) self.enqueue('scripts', "widget-datatable-"+wid, [script], ['jquery.dataTables']);
            else _script = script;
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