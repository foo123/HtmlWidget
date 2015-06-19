/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone for PHP, Node/JS, Python
*
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
    
    assets: function( ) {
        return [
         ['scripts', 'htmlwidgets.js', '/widget/js/htmlwidgets.js', ["jquery"]]
        ,['styles', 'htmlwidgets.css', '/widget/css/htmlwidgets.css', ["responsive.css", "font-awesome.css","htmlwidgets.js"]]
        ,['styles', 'trumbowyg.css', '/widget/css/trumbowyg.min.css']
        ,['scripts', 'trumbowyg', '/widget/js/trumbowyg.min.js', ['trumbowyg.css','jquery']]
        ,['styles', 'jquery.dataTables.css', '/widget/css/jquery.dataTables.css']
        ,['scripts', 'jquery.dataTables', '/widget/js/jquery.dataTables.js', ['jquery.dataTables.css', 'jquery']]
        ,['styles', 'jquery.pikaday.css', '/widget/css/jquery.pikaday.css']
        ,['scripts', 'jquery.pikaday', '/widget/js/jquery.pikaday.js', ['jquery.pikaday.css', 'jquery']]
        ,['scripts', 'jquery.remote-list', '/widget/js/jquery.remote-list.js', ['jquery']]
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
        else if ( widget && widgets[HAS]('wi_'+widget) )
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
            switch( widget )
            {
                case 'empty':       out = self.widget_empty(attr, data); break;
                case 'separator':   out = self.widget_separator(attr, data); break;
                case 'icon':        out = self.widget_icon(attr, data); break;
                case 'delayable':   out = self.widget_delayable(attr, data); break;
                case 'dialog':      out = self.widget_dialog(attr, data); break;
                case 'link':        out = self.widget_link(attr, data); break;
                case 'button':      out = self.widget_button(attr, data); break;
                case 'label':       out = self.widget_label(attr, data); break;
                case 'suggestbox':
                case 'suggest':     out = self.widget_suggest(attr, data); break;
                case 'textbox':
                case 'text':        out = self.widget_text(attr, data); break;
                case 'numeric':     out = self.widget_numeric(attr, data); break;
                case 'textarea':    out = self.widget_textarea(attr, data); break;
                case 'editor':      out = self.widget_editor(attr, data); break;
                case 'date':        out = self.widget_date(attr, data); break;
                case 'time':        out = self.widget_time(attr, data); break;
                case 'checkbox':    out = self.widget_checkbox(attr, data); break;
                case 'radio':       out = self.widget_radio(attr, data); break;
                case 'switch':      out = self.widget_switch(attr, data); break;
                case 'selectbox':
                case 'select':      out = self.widget_select(attr, data); break;
                case 'dropdown':    out = self.widget_dropdown(attr, data); break;
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
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div class="widget-separator"></div>';
    }
    
    ,widget_icon: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var class_ = 'fa'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        if (attr[HAS]('icon')) class_ += ' fa-'+attr['icon'];
        return "<i class=\""+class_+"\" "+style+"></i>";
    }
    
    ,widget_delayable: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var class_ = 'widget-delayable-overlay'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var widget_spinner = 'widget-spinner';
        widget_spinner += attr[HAS]('spinner') ? " "+attr['spinner'] : " widget-spinner-dots";
        return '\
<div id="'+id+'" class="'+class_+'" '+style+' '+extra+'>\
<div class="'+widget_spinner+'"></div>\
</div>\
';
    }
    
    ,widget_dialog: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var title = data[HAS]('title') ? data['title'] : ''; 
        var buttons = attr[HAS]('buttons') ? attr['buttons'] : ''; 
        var content = data[HAS]('content') ? data['content'] : '';
        var class_ = 'widget-dialog'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var icon = '';
        if ( attr[HAS]('icon') )
        {
            icon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        if ( attr[HAS]("form") && attr.form )
        {
            content = '<form id="'+id+'_form">'+content+'</form>';
        }
        var data_attr = self.attr_data(attr);
        return '\
<div id="'+id+'" class="'+class_+'" '+style+' '+extra+' '+data_attr+'>\
<div class="widget-dialog-title">'+icon+''+title+'</div>\
<div class="widget-dialog-content">'+content+'</div>\
<div class="widget-dialog-buttons">'+buttons+'</div>\
</div>\
';
    }
    
    ,widget_link: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var href = attr['href']; 
        var text = data[HAS]('text') ? data['text'] : '';
        var title = data[HAS]('title') ? data['title'] : text;
        var class_ = 'widget-link'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var icon = '';
        if ( attr[HAS]('icon') )
        {
            icon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        var data_attr = self.attr_data(attr);
        return '\
<a id="'+id+'" class="'+class_+'" '+style+' '+extra+' title="'+title+'" href="'+href+'" '+data_attr+'>'+icon+text+'</a>\
';
    }
    
    ,widget_button: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var text = data[HAS]('text') ? data['text'] : '';
        var title = data[HAS]('title') ? data['title'] : text;
        var class_ = 'widget widget-button'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var icon = '';
        if ( attr[HAS]('icon') )
        {
            icon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
            class_ += ' widget-icon';
        }
        var data_attr = self.attr_data(attr);
        if ( attr[HAS]('href') )
        {
            var href = attr['href'];
            return '\
<a id="'+id+'" href="'+href+'" class="'+class_+'" '+style+' '+extra+' title="'+title+'" '+data_attr+'>'+icon+text+'</a>\
';
        }
        else
        {
            var type = attr[HAS]('type') ? 'type="'+attr['type']+'"' : '';
            return '\
<button id="'+id+'" '+type+' class="'+class_+'" '+style+' '+extra+' title="'+title+'" '+data_attr+'>'+icon+text+'</button>\
';
        }
    }
    
    ,widget_label: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var for_ = attr["for"];
        var text = data[HAS]('text') ? data['text'] : '';
        var class_ = 'widget widget-label'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var icon = '';
        if ( attr[HAS]('icon') )
        {
            icon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        var data_attr = self.attr_data(attr);
        return '\
<label id="'+id+'" for="'+for_+'" class="'+class_+'" '+style+' '+extra+' '+data_attr+'>'+icon+''+text+'</label>\
';
    }
    
    ,widget_checkbox: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : "1"; 
        var checked = attr[HAS]('checked') && attr['checked'] ? 'checked' : '';
        var class_ = 'widget widget-checkbox'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<input type="checkbox" id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' value="'+value+'" '+data_attr+' '+checked+' /><label for="'+id+'">&nbsp;</label>\
';
    }
    
    ,widget_radio: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : "1"; 
        var checked = attr[HAS]('checked') && attr['checked'] ? 'checked' : '';
        var class_ = 'widget widget-radio'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<input type="radio" id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' value="'+value+'" '+data_attr+' '+checked+' /><label for="'+id+'">&nbsp;</label>\
';
    }
    
    ,widget_text: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-text'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<input type="text" id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' placeholder="'+placeholder+'" value="'+value+'" '+data_attr+' />\
';
    }
    
    ,widget_numeric: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-text'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<input type="number" id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' placeholder="'+placeholder+'" value="'+value+'" '+data_attr+' />\
';
    }
    
    ,widget_suggest: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-suggest'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var ajax = attr["ajax"];
        var _script = '', script = '\
jQuery(function($){\
var $el = $("#'+id+'"), suggest = $el.parent();\
$el.remoteList({\
    minLength: 2,\
    maxLength: -1,\
    source: function(value, response) {\
        suggest.addClass("ajax");\
        $.ajax({\
            url: "'+ajax+'",\
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
        console.log($el.remoteList("selectedOption"), $el.remoteList("selectedData"))\
    }\
});\
});\
';
        if (isNode) self.enqueue('scripts', "widget-suggest-"+id, [script], ['jquery.remote-list']);
        else _script = script;
        var data_attr = self.attr_data(attr);
        return '\
<span class="'+class_+'">\
<input type="text" data-list-highlight="true" data-list-value-completion="true" id="'+id+'" name="'+name+'" class="widget-text widget-suggest-input" '+style+' '+extra+' placeholder="'+placeholder+'" value="'+value+'" '+data_attr+' />\
<i id="'+id+'-spinner" class="fa fa-spinner fa-pulse"></i>\
</span>\
' + _script;
    }
    
    ,widget_textarea: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-textarea'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<textarea id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' placeholder="'+placeholder+'" '+data_attr+'>'+value+'</textarea>\
';
    }
    
    ,widget_editor: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-editor'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? '"'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var editor_cfg = '';
        if ( attr[HAS]('editor') ) editor_cfg = toJSON(attr['editor']);
        var _script = '', script = '<script>\
jQuery(function($){\
$("#'+id+'").trumbowyg('+editor_cfg+');\
$("#'+id+'").closest(".trumbowyg-box").addClass("widget widget-editor-box").attr("style",'+style+');\
});\
</script>';
        if (isNode) self.enqueue('scripts', "widget-editor-"+id, [script], ['trumbowyg']);
        else _script = script;
        var data_attr = self.attr_data(attr);
        return '\
<textarea id="'+id+'" name="'+name+'" class="'+class_+'" '+extra+' placeholder="'+placeholder+'" '+data_attr+'>'+value+'</textarea>\
' + _script;
    }
    
    ,widget_date: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : ""; 
        var placeholder = attr[HAS]('placeholder') ? attr['placeholder'] : "";
        var class_ = 'widget widget-date'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var icon = '';
        if ( attr[HAS]('icon') )
        {
            icon = "<i class=\"fa fa-" + attr['icon'] + "\"></i>";
        }
        else
        {
            icon = "<i class=\"fa fa-calendar\"></i>";
        }
        var _script = '', script = '\
jQuery(function($){\
$("#'+id+'").pikaday();\
});\
';
        if (isNode) self.enqueue('scripts', "widget-pikaday-"+id, [script], ['jquery.pikaday']);
        else _script = script;
        var data_attr = self.attr_data(attr);
        return '\
<span class="'+class_+'" '+style+'>\
<input type="text" id="'+id+'" name="'+name+'" class="widget-text widget-date-input" placeholder="'+placeholder+'" value="'+value+'" '+extra+' '+data_attr+' />\
'+icon+'\
</span>\
' + _script;
    }
    
    ,widget_time: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var format = attr[HAS]('format') ? attr['format'].split(':') : ["h","m","s"];
        var value;
        if (data[HAS]('value')) 
        {
            value = data['value'] instanceof Array ? data['value'] : data['value'].split(':');
            while ( value.length < 3 ) value.push("00");
        }
        else
        {
            value = ["00", "00", "00"];
        }
        var class_ = 'widget widget-time'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        var time_options = {
            'h':[],
            'm':[],
            's':[]
        };
        var i, tt, t, p, f, selected;
        for(i=0; i<60; i++)
        {
            tt = i<10 ? '0'+i : ''+i;
            for(p=0; p<format.length; p++)
            {
                f = format[p];
                if ( 'h' === f && i>=24 ) continue;
                selected = tt === value[p] ? 'selected="selected"' : '';
                time_options[f].push('<option value="'+tt+'" '+selected+'>'+tt+'</option>');
            }
        }
        var times = [];
        for(p=0; p<format.length; p++)
        {
            t = format[p];
            times.push('<select class="widget-time-component" id="'+id+'_'+t+'" name="'+name+'['+t+']">'+time_options[t].join('')+'</select>');
        }
        times = times.join('<span class="widget-time-sep">:</span>');
        return '\
<span class="'+class_+'" '+style+' '+extra+' '+data_attr+'>\
'+times+'\
</span>\
';
    }
    
    ,widget_switch: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var value = data[HAS]("value") ? data["value"] : "1"; 
        var checked = attr[HAS]('checked') && attr['checked'] ? 'checked' : '';
        var class_ = 'widget widget-switch'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<span class="'+class_+'" '+style+'>\
<input type="checkbox" id="'+id+'" name="'+name+'" class="widget-switch-button" value="'+value+'" '+extra+' '+data_attr+' '+checked+' />\
<label for="'+id+'" class="widget-switch-off">&nbsp;</label><label for="'+id+'" class="widget-switch-on">&nbsp;</label>\
<span class="widget-switch-handle widget-state-default"></span>\
</span>\
';
    }
    
    ,widget_select: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var class_ = 'widget widget-select'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var selected_option = data[HAS]('selected') ? data['selected'] : [];
        if ( !(selected_option instanceof Array) ) selected_option = [selected_option];
        var options = '', data_opts = data['options'], 
            o, opt, l = data_opts.length, key, val, selected;
        for(o=0; o<l; o++)
        {
            opt = data_opts[o];
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
            selected = -1 < selected_option.indexOf(key) ? 'selected="selected"' : '';
            options += "<option value=\""+key+"\" "+selected+">"+val+"</option>";
        }
        var data_attr = self.attr_data(attr);
        return '\
<select id="'+id+'" name="'+name+'" class="'+class_+'" '+style+' '+extra+' '+data_attr+'>\
'+options+'\
</select>\
';
    }
    
    ,widget_dropdown: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var name = attr['name'];
        var class_ = 'widget widget-dropdown widget-state-default'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var selected_option = data[HAS]('selected') ? data['selected'] : [];
        if ( !(selected_option instanceof Array) ) selected_option = [selected_option];
        var options = '', data_opts = data['options'], 
            o, opt, l = data_opts.length, key, val, selected;
        for(o=0; o<l; o++)
        {
            opt = data_opts[o];
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
            selected = -1 < selected_option.indexOf(key) ? 'selected="selected"' : '';
            options += "<option value=\""+key+"\" "+selected+">"+val+"</option>";
        }
        var data_attr = self.attr_data(attr);
        return '\
<span class="'+class_+'" '+style+'>\
<select id="'+id+'" name="'+name+'" class="widget-dropdown-select widget-state-default" '+extra+' '+data_attr+'>\
'+options+'\
</select>\
</span>\
';
    }
    
    ,widget_menu: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var menu = data['menu'];
        var class_ = 'widget widget-dropdown-menu'; 
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var data_attr = self.attr_data(attr);
        return '\
<div id="'+id+'" class="'+class_+'" '+style+' '+extra+' '+data_attr+'>'+menu+'</div>\
';
    }
    
    ,widget_table: function(attr, data) {
        self.enqueue('styles', 'htmlwidgets.css');
        var id = attr[HAS]("id") ? attr["id"] : self.uuid(); 
        var class_ = 'widget widget-table'; 
        if ( !attr[HAS]('stripped') || attr['stripped'] ) class_ += ' stripped';
        if ( !attr[HAS]('responsive') || attr['responsive'] ) class_ += ' responsive';
        if ( attr[HAS]("class") ) class_ += ' '+attr["class"];
        var style = attr[HAS]("style") ? 'style="'+attr["style"]+'"' : ''; 
        var extra = attr[HAS]("extra") ? attr["extra"] : '';
        var columns = '';
        var column_values = data['columns'];
        var column_keys = KEYS(data_cols);
        var r, c, rl, cl = column_keys.length
        for(c=0; c<cl; c++)
        {
            columns += "<th data-key=\""+column_keys[c]+"\">"+column_values[column_keys[c]]+"</th>";
        }
        columns = "<tr>"+columns+"</tr>";
        var rows = ''; rl = data['rows'].length;
        for(r=0; r<rl; r++)
        {
            var row = data['rows'][r], rowk = KEYS(row);
            rows += "\n" + "<tr>";
            for(c=0; c<cl; c++)
            {
                rows += "<td data-column=\""+column_values[column_keys[c]]+"\">"+row[rowk[c]]+"</td>";
            }
            rows += "</tr>";
        }
        var dataTable = attr[HAS]('dataTable');
        var _script = '', script = '';
        if ( dataTable )
        {
            var dtOptions = Object===attr['dataTable'].constructor ? toJSON(attr['dataTable']) : '';
            var table_controls = [
             "$('#"+id+"_filter').find('input').addClass('widget-text');"
            ,"$('#"+id+"_length').find('select').addClass('widget-select');"
            ];
            if ( attr[HAS]('controls') ) 
            {
                var ctrl, ctrls = attr['controls'] instanceof Array ? attr['controls'] : [attr['controls']];
                for(ctrl=0; ctrl<ctrls.length; ctrl++)
                {
                    table_controls.push('$(".widget-table-controls", "#'+id+'_wrapper").append($("'+ctrls[ctrl].split('"').join('\\"')+'"));');
                }
            }
            table_controls = table_controls.join("\n");
            script = '\
jQuery(function($){\
$("#'+id+'").dataTable($dtOptions).on("change", "input.select_row", function( ){\
    if ( this.checked ) $(this).closest("tr").addClass("selected");\
    else $(this).closest("tr").removeClass("selected");\
});\
$("#'+id+'").closest(".dataTables_wrapper").addClass("widget-table-wrapper");\
'+table_controls+'\
});\
';
            if (isNode) self.enqueue('scripts', "widget-datatable-"+id, [script], ['jquery.dataTables']);
            else _script = script;
        }
        var data_attr = self.attr_data(attr);
        return '\
<table id="'+id+'" class="'+class_+'" '+style+' '+extra+' '+data_attr+'>\
<thead>'+columns+'</thead>\
<tbody>'+rows+'</tbody>\
</table>\
' + _script;
    }
};

// export it
return HtmlWidget;
});