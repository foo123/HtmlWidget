/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for Javascript, PHP, Python
*
*  @version: 2.0.0
*  https://github.com/foo123/HtmlWidget
*
**/
!function( root, name, factory ){
"use strict";
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.$deps = root.$deps||{}) && (root.EXPORTED_SYMBOLS = [name]) && (root[name] = root.$deps[name] = factory.call(root));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('undefined'!==typeof System)&&('function'===typeof System.register)&&('function'===typeof System['import']) ) /* ES6 module */
    System.register(name,[],function($__export){$__export(name, factory.call(root));});
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "HtmlWidget",
    /* module factory */        function ModuleFactory__HtmlWidget( undef ){
"use strict";

var HAS = Object.prototype.hasOwnProperty, ATTR = 'setAttribute',
    KEYS = Object.keys, json_encode = JSON.stringify, toString = Object.prototype.toString,
    isXPCOM = ("undefined" !== typeof Components) && ("object" === typeof Components.classes) && ("object" === typeof Components.classesByID) && Components.utils && ("function" === typeof Components.utils['import']),
    isNode = ("undefined" !== typeof global) && ('[object global]' === toString.call(global)),
    isWebWorker = !isXPCOM && !isNode && ('undefined' !== typeof WorkerGlobalScope) && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator),
    isBrowser = !isXPCOM && !isNode && !isWebWorker,
    GID = 0, self, widgets = {}, enqueuer = null, ASSETS = {}, CNT = {},
    html_esc_re = /[&<>'"]/g;

// http://php.net/manual/en/function.empty.php
function is_string(x)
{
    return (x instanceof String) || ('[object String]' === toString.call(x));
}
function is_array(x)
{
    return (x instanceof Array) || ('[object Array]' === toString.call(x));
}
function is_object(x)
{
    return '[object Object]' === toString.call(x);
}
function isset(o, p)
{
    // not set or null;
    if (1 === arguments.length) return (null != o);
    return HAS.call(o,p) && (null != o[p]);
}
function empty(o, p)
{
    // not set or null; or empty string/array
    if (1 === arguments.length)
        return (null == o) || (0 === o) || (false === o) || ((is_array(o) || is_string(o)) && !o.length) || (is_object(o) && !KEYS(o).length);
    return !HAS.call(o,p) || (null == o[p]) || (0 === o[p]) || (false === o[p]) || ((is_array(o[p]) || is_string(o[p])) && !o[p].length) || (is_object(o[p]) && !KEYS(o[p]).length);
}
function htmlspecialchars(s)
{
    return String(s).replace(html_esc_re, function(m){
        switch(m)
        {
            case '&': return '&amp;'
            case '<': return '&lt;'
            case '>': return '&gt;'
            case '"': return '&quot;'
            default: return m;
        }
    });
}
function merge(a, b)
{
    var k, c = {};
    for (k in a) if (HAS.call(a,k)) c[k] = a[k];
    if (b) for (k in b) if (HAS.call(b,k)) c[k] = b[k];
    return c;
}
function shuffle(a)
{
    var p, b, i;
    for (i=a.length-1; i>0; i--)
    {
        p = Math.round(i*Math.random());
        if (i === p) continue;
        b = a[i]; a[i] = a[p]; a[p] = b;
    }
    return a;
}
function data_attr(k, v)
{
    if ('object' === typeof v)
    {
        var attr = '', ks = KEYS(v), k1, kl = ks.length;
        for (k1=0; k1<kl; k1++)
        {
            attr += (!attr.length ? '' : ' ') + data_attr( k+'-'+ks[k1], v[ks[k1]] );
        }
        return attr;
    }
    else
    {
        return ""+k+"='"+v+"'";
    }
}


var HtmlWidget = self = {

    VERSION: "2.0.0"

    ,BASE: './'

    ,enqueueAssets: function(_enqueuer) {
        enqueuer = _enqueuer && 'function' === typeof(_enqueuer) ? _enqueuer : null;
    }

    ,enqueue: function(type, id, asset, deps, props) {
        if (enqueuer) enqueuer(type, id, [asset, deps, props]);
    }

    ,assets: function(assets, base) {
        if (arguments.length)
        {
            if (true === assets)
            {
                base = String(base || '');
                // resolve base path and transform to Importer format
                return KEYS(ASSETS).map(function(key) {
                    var asset = ASSETS[key];
                    if (!empty(asset,'asset'))
                    {
                        if (is_array(asset['asset']))
                        {
                            for (var k=0; k<asset['asset'].length; k++)
                                asset['asset'][k] = asset['asset'][k].replace('${ASSETS}', base);
                        }
                        else
                        {
                            asset['asset'] = asset['asset'].replace('${ASSETS}', base);
                        }
                    }
                    return [asset['type'], key, empty(asset,'asset') ? null : asset['asset'], empty(asset,'dependencies') ? null : asset['dependencies'], empty(asset,'attributes') ? null : asset['attributes']];
                });
            }
            else if (is_object(assets))
            {
                ASSETS = !!base ? merge(ASSETS, assets) : merge({}, assets);
            }
        }
        else
        {
            return merge({}, ASSETS);
        }
    }

    ,uuid: function(prefix, suffix) {
        prefix = prefix || "widget";
        suffix = suffix || (isNode ? "static2" : "dynamic");
        return [prefix, new Date().getTime(), ++GID, ~~(1000*Math.random()), suffix].join("_");
    }

    ,data: function(attr, ctx) {
        var d_attr = '';
        if (arguments.length < 2) ctx = 'data';
        if (!!ctx && HAS.call(attr,ctx) && ('object' === typeof attr[ctx]))
        {
            var k, attr_ctx = attr[ctx];
            for(k in attr_ctx)
            {
                if (!HAS.call(attr_ctx,k)) continue;
                d_attr += (!d_attr.length ? '' : ' ') + data_attr( ctx+'-'+k, attr_ctx[k] );
            }
        }
        return d_attr;
    }

    ,attributes: function(attr, atts) {
        if (!atts || !attr) return '';
        var attrs = [], i, l = atts.length, k, v;
        for (i=0; i<l; i++)
        {
            k = atts[i];
            if (HAS.call(attr,k) && (null != attr[k]))
            {
                if ('data' == k)
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

    ,options: function(opts, key, value) {
        var options = [], o_key, o_val, k, v, vv, l;
        opts = opts || {};
        if (is_array(opts))
        {
            for (k=0,l=opts.length; k<l; k++)
            {
                v = opts[k];
                vv = [].concat(v);

                o_key = null;
                if (-1 === key)
                {
                    o_key = k;
                }
                else if (null != key)
                {
                    if (null!=vv[key])
                        o_key = vv[key];
                }

                o_val = null;
                if (null != value)
                {
                    if (null!=vv[value])
                        o_val = vv[value];
                }
                else
                {
                    o_val = v;
                }
                if (null === o_key) o_key = o_val;
                options.push([o_key, o_val]);
            }
        }
        else
        {
            for (k in opts)
            {
                if (!HAS.call(opts,k)) continue;
                v = opts[k];
                vv = [].concat(v);

                o_key = null;
                if (-1 === key)
                {
                    o_key = k;
                }
                else if (null != key)
                {
                    if (null!=vv[key])
                        o_key = vv[key];
                }

                o_val = null;
                if (null != value)
                {
                    if (null!=vv[value])
                        o_val = vv[value];
                }
                else
                {
                    o_val = v;
                }
                if (null === o_key) o_key = o_val;
                options.push([o_key, o_val]);
            }
        }
        return options;
    }

    ,shuffle: function(arr, assoc) {
        var shuffled;
        if (true === assoc)
        {
            var keys = shuffle(KEYS(arr));
            shuffled = {};
            for(var i=0,l=keys.length; i<l; i++) shuffled[keys[i]] = arr[keys[i]];
        }
        else
        {
            shuffled = shuffle(arr);
        }
        return shuffled;
    }

    ,menu: function menu(items, tab) {
        tab = tab || '';
        var tab_tab = '  ' + tab,
            out, item, i, l, item_class, item_url;
        out = tab + '<ul>' + "\n";
        for (i=0,l=items.length; i<l; i++)
        {
            item = items[i];
            item_class = [];
            if (!empty(item,'submenu')) item_class.push('w-submenu-item');
            if (!empty(item,'active')) item_class.push('active');
            item_url = isset(item,'url') ? String(item['url']) : '#';
            out += tab_tab+'<li'+(item_class.length ? ' class="'+item_class.join(' ')+'"' : '')+'>'+"\n";
            out += tab_tab+'<a href="'+item_url+'">'+String(item['text'])+'</a>'+"\n";
            if (!empty(item,'submenu'))
                out += menu(item['submenu'], tab_tab);
            out += tab_tab+'</li>'+"\n";
        }
        out += tab + '</ul>' + "\n";
        return out;
    }

    ,addWidget: function(widget, renderer) {
        if (widget && ("function" === typeof(renderer)))
            widgets['w_'+widget] = renderer;
        else if (widget && (false === renderer) && HAS.call(widgets,'w_'+widget))
            delete widgets['w_'+widget];
    }

    ,widget: function(widget, attr, data) {
        var out = '';
        if (widget)
        {
            attr = attr || {};
            data = data || {};

            if (HAS.call(widgets,'w_'+widget))
                return widgets['w_'+widget](attr, data, widget);

            if ('audio' === widget) attr['type'] = 'audio';
            else if ('video' === widget) attr['type'] = 'video';
            else if ('checkbox-array' === widget || 'check-array' === widget) attr['type'] = 'checkbox';
            else if ('radiobox-array' === widget || 'radio-array' === widget)  attr['type'] = 'radio';
            else if ('checkbox-list' === widget || 'checklist' === widget)  attr['type'] = 'checkbox';
            else if ('radiobox-list' === widget || 'radio-list' === widget || 'radiolist' === widget) attr['type'] = 'radio';
            else if ('checkbox' === widget || 'checkbox-image' === widget || 'checkbox-label' === widget) attr['type'] = 'checkbox';
            else if ('radio' === widget|| 'radio-image' === widget || 'radio-label' === widget) attr['type'] = 'radio';
            else if ('datetime' === widget || 'datetimepicker' === widget) attr['time'] = true;
            else if ('select2' === widget) attr['select2'] = true;
            else if ('dropdown' === widget) attr['dropdown'] = true;
            else if ('datatable' === widget) attr['datatable'] = true;
            else if ('codemirror' === widget || 'codemirror-editor' === widget || 'syntax-editor' === widget || 'source-editor' === widget || 'syntax' === widget || 'source' === widget || 'highlight-editor' === widget || 'highlighter' === widget) attr['syntax-editor'] = true;
            else if ('tinymce' === widget || 'wysiwyg-editor' === widget || 'wysiwyg' === widget || 'rich-editor' === widget || 'rich' === widget || 'editor' === widget) attr['wysiwyg-editor'] = true;

            switch(widget)
            {
                case 'empty':       out = self.w_empty(attr, data, widget); break;
                case 'sep':
                case 'separator':   out = self.w_sep(attr, data, widget); break;
                case 'icon':        out = self.w_icon(attr, data, widget); break;
                case 'delayable':   out = self.w_delayable(attr, data, widget); break;
                case 'disabable':   out = self.w_disabable(attr, data, widget); break;
                case 'morphable':   out = self.w_morphable(attr, data, widget); break;
                case 'pages':       out = self.w_pages(attr, data, widget); break;
                case 'tabs':        out = self.w_tabs(attr, data, widget); break;
                case 'accordeon':   out = self.w_accordeon(attr, data, widget); break;
                case 'panel':       out = self.w_panel(attr, data, widget); break;
                case 'endpanel':
                case 'end_panel':
                case 'panel_end':   out = self.w_panel_end(attr, data, widget); break;
                case 'tooltip':     out = self.w_tooltip(attr, data, widget); break;
                case 'link':        out = self.w_link(attr, data, widget); break;
                case 'button':      out = self.w_button(attr, data, widget); break;
                case 'label':       out = self.w_label(attr, data, widget); break;
                case 'textbox':
                case 'textfield':
                case 'text':        out = self.w_text(attr, data, widget); break;
                case 'tinymce':
                case 'editor':
                case 'rich-editor':
                case 'rich':
                case 'wysiwyg-editor':
                case 'wysiwyg':
                case 'codemirror':
                case 'codemirror-editor':
                case 'source-editor':
                case 'source':
                case 'syntax-editor':
                case 'syntax':
                case 'highlight-editor':
                case 'highlighter':
                case 'textarea':    out = self.w_textarea(attr, data, widget); break;
                case 'datetimepicker':
                case 'datepicker':
                case 'datetime':
                case 'date':        out = self.w_date(attr, data, widget); break;
                case 'time':        out = self.w_time(attr, data, widget); break;
                case 'colorpicker':
                case 'colorselector':
                case 'color':       out = self.w_color(attr, data, widget); break;
                case 'rating':      out = self.w_rating(attr, data, widget); break;
                case 'radiobox-array':
                case 'radio-array':
                case 'checkbox-array':
                case 'check-array': out = self.w_control_array(attr, data, widget); break;
                case 'radiobox-list':
                case 'radio-list':
                case 'radiolist':
                case 'checkbox-list':
                case 'checklist':   out = self.w_control_list(attr, data, widget); break;
                case 'checkbox-image':
                case 'radio-image':
                case 'checkbox-label':
                case 'radio-label':
                case 'checkbox':
                case 'radio':
                case 'control':     out = self.w_control(attr, data, widget); break;
                case 'switch':      out = self.w_switch(attr, data, widget); break;
                case 'dropdown':
                case 'selectbox':
                case 'select2':
                case 'select':      out = self.w_select(attr, data, widget); break;
                case 'file':        out = self.w_file(attr, data, widget); break;
                case 'menu':        out = self.w_menu(attr, data, widget); break;
                case 'endmenu':
                case 'end_menu':
                case 'menu_end':    out = self.w_menu_end(attr, data, widget); break;
                case 'pagination':  out = self.w_pagination(attr, data, widget); break;
                case 'datatable':
                case 'table':       out = self.w_table(attr, data, widget); break;
                case 'animation':   out = self.w_animation(attr, data, widget); break;
                case 'sprite':      out = self.w_sprite(attr, data, widget); break;
                case 'video':
                case 'audio':
                case 'media':       out = self.w_media(attr, data, widget); break;
                default: $out = ''; break;
            }
        }
        return out;
    }

    ,w_empty: function(attr, data, widgetName) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '';
    }

    ,w_sep: function(attr, data, widgetName) {
        var wclass, wstyle;
        wclass = 'w-separator';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div class="'+wclass+'" '+wstyle+'></div>';
    }

    ,w_icon: function(attr, data, widgetName) {
        var wclass, wstyle, wextra, wtitle;
        wclass = 'fa';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        if (!empty(attr,'icon')) wclass += ' fa-'+attr['icon'];
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wextra = self.attributes(attr,['data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<i class="'+wclass+'" '+wstyle+' '+wtitle+' '+wextra+'></i>';
    }

    ,w_label: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wfor, wtext, wtitle;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wfor = isset(attr,"for") ? 'for="'+attr['for']+'"' : '';
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-widget w-label';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        if (!empty(attr,'icon'))
        {
            wclass += ' w-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if (!empty(attr,'iconr'))
        {
            wclass += ' w-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        // iOS needs an onlick attribute to handle lable update if used as controller
        return '<label id="'+wid+'" '+wfor+' class="'+wclass+'" title="'+wtitle+'" '+wstyle+' onclick="" '+wextra+'>'+wtext+'</label>';
    }

    ,w_link: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wtitle, whref, wfor, wtext;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-link';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        if (!empty(attr,'icon'))
        {
            wclass += ' w-icon';
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        if (!empty(attr,'iconr'))
        {
            wclass += ' w-icon-right';
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        if (isset(attr,'for'))
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

    ,w_button: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wtype, wtitle, wtext, whref, wfor;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-widget w-button';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        if (!empty(attr,'icon'))
        {
            if (!wtext.length) wclass += ' w-icon-only';
            else wclass += ' w-icon';
            wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>" + wtext;
        }
        if (!empty(attr,'iconr'))
        {
            if (!wtext.length) wclass += ' w-icon-only';
            else wclass += ' w-icon-right';
            wtext = wtext + "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
        }
        wextra = self.attributes(attr,['disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        if (isset(attr,'for'))
        {
            wfor = attr['for'];
            return '<label id="'+wid+'" for="'+wfor+'" class="'+wclass+'" '+wstyle+' onclick="" title="'+wtitle+'" '+wextra+'>'+wtext+'</label>';
        }
        else if (isset(attr,'href'))
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

    ,w_control: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wctrl, wextra, wtitle, wchecked, wvalue, wname, wtype, wstate, wtext;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1";
        wchecked = !empty(attr,'checked') && attr['checked'] ? 'checked' : '';
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wstate = '';
        if (isset(attr,'state-on')) wstate += ' data-state-on="'+attr['state-on']+'"';
        if (isset(attr,'state-off')) wstate += ' data-state-off="'+attr['state-off']+'"';
        if (!empty(attr,'image'))
        {
            wctrl = 'radio' === wtype ? 'w-radio-image' : 'w-checkbox-image';
            wtext = '<span style="background-image:url('+attr['image']+');"></span>';
        }
        else if (!empty(attr,'label'))
        {
            wctrl = 'radio' === wtype ? 'w-radio-label' : 'w-checkbox-label';
            wtext = attr['label'];
        }
        else
        {
            wctrl = 'radio' === wtype ? 'w-radio' : 'w-checkbox';
            wtext = '&nbsp;';
        }
        wclass = 'w-widget w-control';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        self.enqueue('styles', 'htmlwidgets.css');
        return '<input type="'+wtype+'" id="'+wid+'" '+wname+' class="'+wctrl+'" value="'+wvalue+'" '+wextra+' '+wchecked+' /><label for="'+wid+'" '+wtitle+' class="'+wclass+'" '+wstyle+' '+wstate+' onclick="">'+wtext+'</label>';
    }

    ,w_control_list: function(attr, data, widgetName) {
        var wid, wname, wtype, wclass, wstyle, wextra, wvalue, woptions,
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
        if (!empty(attr,"horizontal")) wclass += ' w-control-list-horizontal w-clearfloat';
        if ('radio' == wtype)
        {
            if (w_xlarge) w_item_class = 'w-xlarge';
            else if (w_large) w_item_class = 'w-large';
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
                    'checked'   : String(opt[0]) === String(wvalue),
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
            if (w_xlarge) w_item_class = 'w-xlarge';
            else if (w_large) w_item_class = 'w-large';
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
                    'checked'   : -1 < wvalue.map(String).indexOf(String(opt[0])),
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

    ,w_control_array: function(attr, data, widgetName) {
        var wid, wname, wtype, wclass, wstyle, wextra, wvalues, wvalue, woptions, wfields, fields, field, f,fl,
            w_item_atts, w_item_class, w_item_name, w_large, w_xlarge, i, l, opt, widget;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? attr["name"] : null;
        wtype = !empty(attr,'type') ? attr['type'] : 'checkbox';
        wvalue = isset(data,"value") ? data["value"] : "1";
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wfields = data['fields'] || {};
        woptions = [].concat(data['options']);
        wvalues = isset(data,'value') ? data['value'] : {};
        wclass = !empty(attr,"class") ? attr["class"] : '';
        w_large = !!wclass && (-1 !== (' '+wclass+' ').indexOf(' w-large '));
        w_xlarge = !!wclass && (-1 !== (' '+wclass+' ').indexOf(' w-xlarge '));
        w_item_atts = self.attributes(attr,['readonly','disabled','data']);
        fields = KEYS(wfields);
        if (!empty(attr,"randomised")) shuffle(fields);
        if ('radio' == wtype)
        {
            if (w_xlarge) w_item_class = 'w-xlarge';
            else if (w_large) w_item_class = 'w-large';
            else w_item_class = '';
            widget = '<table id="'+wid+'" class="w-control-array w-radio-array '+wclass+'" '+wstyle+' '+wextra+'>';
            widget += '<thead><tr><td>&nbsp;</td>';
            for (i=0,l=woptions.length; i<l; i++)
            {
                opt = woptions[i];
                widget += '<td>'+opt[1]+'</td>';
            }
            widget += '<td>&nbsp;</td></tr></thead><tbody>';
            for (f=0,fl=fields.length; f<fl; f++)
            {
                field = fields[f];
                widget += '<tr><td>'+wfields[field]+'</td>';
                w_item_name = wname+'['+field+']';
                for (i=0,l=woptions.length; i<l; i++)
                {
                    opt = woptions[i];
                    widget += '<td>'+self.widget('radio',{
                        'id'        : wid+'_'+field+'_'+(i+1),
                        'name'      : w_item_name,
                        'class'     : w_item_class,
                        'title'     : opt[1],
                        'checked'   : isset(wvalues,field) && (String(opt[0]) === String(wvalues[field])),
                        'extra'     : w_item_atts
                    },{
                        'value'     : opt[0]
                    })+'</td>';
                }
                widget += '<td>&nbsp;</td></tr>';
            }
            widget += '</tbody></table>';
        }
        else
        {
            if (w_xlarge) w_item_class = 'w-xlarge';
            else if (w_large) w_item_class = 'w-large';
            else w_item_class = '';
            widget = '<table id="'+wid+'" class="w-control-array w-checkbox-array '+wclass+'" '+wstyle+' '+wextra+'>';
            widget += '<thead><tr><td>&nbsp;</td>';
            for (i=0,l=woptions.length; i<l; i++)
            {
                opt = woptions[i];
                widget += '<td>'+opt[1]+'</td>';
            }
            widget += '<td>&nbsp;</td></tr></thead><tbody>';
            for (f=0,fl=fields.length; f<fl; f++)
            {
                field = fields[f];
                wvalue = isset(wvalues,field) ? [].concat(wvalues[field]) : [];
                widget += '<tr><td>'+wfields[field]+'</td>';
                w_item_name = wname+'['+field+']';
                for (i=0,l=woptions.length; i<l; i++)
                {
                    opt = woptions[i];
                    widget += '<td>'+self.widget('checkbox',{
                        'id'        : wid+'_'+field+'_'+(i+1),
                        'name'      : w_item_name,
                        'class'     : w_item_class,
                        'title'     : opt[1],
                        'checked'   : -1 < wvalue.map(String).indexOf(String(opt[0])),
                        'extra'     : w_item_atts
                    },{
                        'value'     : opt[0]
                    })+'</td>';
                }
                widget += '<td>&nbsp;</td></tr>';
            }
            widget += '</tbody></table>';
        }
        self.enqueue('styles', 'htmlwidgets.css');
        return widget;
    }

    ,w_switch: function(attr, data, widgetName) {
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
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wreverse = !empty(attr,"reverse")&&attr["reverse"];
        wiconon='&nbsp;'; wiconoff='&nbsp;';
        if (!empty(attr,"iconon") && empty(attr,"iconoff"))
        {
            wiconon = '<i class="fa fa-'+attr.iconon+' not-negative"></i>';
            wiconoff = '<i class="fa fa-'+attr.iconon+' negative"></i>';
        }
        else if (!empty(attr,"iconoff") && empty(attr,"iconon"))
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
        if (wdual)
        {
            // dual switch with separate on/off states
            wclass += ' dual';
            wtype = 'radio';
            if (wchecked)
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="w-switch-state w-state-on" value="'+wvalue+'" '+wextra+' checked /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="w-switch-state w-state-off" value="'+wvalue2+'" '+wextra+' />';
            }
            else
            {
                wstates = '<input type="'+wtype+'" id="'+wid+'-on" '+wname+' class="w-switch-state w-state-on" value="'+wvalue+'" '+wextra+' /><input type="'+wtype+'" id="'+wid+'-off" '+wname+' class="w-switch-state w-state-off" value="'+wvalue2+'" '+wextra+' checked />';
            }
            if (wreverse)
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
            if (wchecked) wchecked = 'checked';
            wstates = '<input type="'+wtype+'" id="'+wid+'" '+wname+' class="w-switch-state" value="'+wvalue+'" '+wextra+' '+wchecked+' />';
            if (wreverse)
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

    ,w_rating: function(attr, data, widgetName) {
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
        if (!!wtext ) widget += "<legend "+wtitle+">"+wtext+"</legend>";
        if (!wicon) wicon = 'star';
        for (r=wratings.length-1; r>=0; r--)
        {
            rate = wratings[r][0]; label = wratings[r][1];
            if (is_array(wicon))
            {
                if (wicon.length > r) w_icon = wicon[r];
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

    ,w_select: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wname, wdropdown, woptions, wselected,
            opts, o, opt, l, key, val, selected, has_selected, options, wtitle;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wdropdown = !!attr['dropdown'];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wextra = self.attributes(attr,['multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wselected = isset(data,'selected') ? data['selected'] : [];
        if (!is_array(wselected)) wselected = [wselected];
        woptions = '';
        opts = data['options']; l = opts.length;
        has_selected = false;
        for (o=0; o<l; o++)
        {
            // NOTE: use HtmlWidget.options() to format options accordingly to be used here
            opt = opts[o]; key = opt[0]; val = opt[1];
            selected = -1 < wselected.map(String).indexOf(String(key)) ? ' selected="selected"' : '';
            if (selected.length) has_selected = true;
            woptions += "<option value=\""+key+"\""+selected+">"+val+"</option>";
        }
        if (!empty(attr,'placeholder'))
        {
            woptions = "<option value=\"\" class=\"w-option-placeholder\" disabled"+(has_selected?'':' selected')+">"+attr['placeholder']+"</option>" + woptions;
            //if ( !/\brequired\b/.test(wextra) ) wextra += ' required';
            //if ( !wname.length ) wextra += ' form="__NONE__"';
            wextra += ' data-placeholder="'+attr['placeholder']+'"';
        }
        wclass = wdropdown ? 'w-widget w-dropdown' : 'w-widget w-select';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];

        self.enqueue('styles', 'htmlwidgets.css');
        if (!!attr['select2'] && !wdropdown)
        {
            options = is_object(attr["options"]) ? attr["options"] : {};
            wclass += ' w-select2';
            self.enqueue('scripts', 'select2');
            // if in browser and re-render, use dynamic id to re-enqueue
            if (isBrowser && (null == CNT['select2-'+wid])) CNT['select2-'+wid] = 0;
            self.enqueue('scripts', 'select2-'+wid+(isBrowser ? '-'+(++CNT['select2-'+wid]) : ''), ["(function(){\
                if ('undefined' === typeof(jQuery) || 'function' !== typeof(jQuery.fn.select2)) return;\
                var options = "+(json_encode(options))+";\
                if (options.delayedInit)\
                {\
                    setTimeout(function(){jQuery(document.getElementById('"+wid+"')).select2(options);}, +options.delayedInit);\
                }\
                else\
                {\
                    jQuery(document.getElementById('"+wid+"')).select2(options);\
                }\
            })();"], ['select2']);
        }
        return wdropdown
        ? '<span class="'+wclass+'" '+wstyle+'><select id="'+wid+'" '+wname+' class="w-dropdown-select" '+wtitle+' '+wextra+'>'+woptions+'</select></span>'
        : '<select id="'+wid+'" '+wname+' class="'+wclass+'" '+wstyle+' '+wtitle+' '+wextra+'>'+woptions+'</select>';
    }

    ,w_text: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wtype, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : "";
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wtype = !empty(attr,"type") ? attr["type"] : 'text';
        wicon = '';
        wrapper_class = 'w-wrapper';
        if (!empty(attr,'icon'))
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if (!empty(attr,'iconr'))
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        wclass = 'w-widget w-text';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        self.enqueue('styles', 'htmlwidgets.css');
        return wicon.length
        ? '<span class="'+wrapper_class+'" '+wstyle+'><input type="'+wtype+'" id="'+wid+'" '+wname+' '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' />'+wicon+'</span>'
        : '<input type="'+wtype+'" id="'+wid+'" '+wname+' '+wtitle+' class="'+wclass+'" '+wstyle+' placeholder="'+wplaceholder+'" value="'+wvalue+'" '+wextra+' />';
    }

    ,w_textarea: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wplaceholder, wvalue, wname, wtitle, weditor, defaults, titl, options;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : "";
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        if (!!attr['syntax-editor'])
        {
            options = is_object(attr["options"]) ? attr["options"] : {};
            if (empty(options,'mode')) options['mode'] = 'text/html';
            if (empty(options,'theme')) options['theme'] = 'default';
            if (!isset(options,'readOnly')) options['readOnly'] = isset(attr,'readonly') ? !!attr['readonly'] : false;
            if (!isset(options,'lineWrapping')) options['lineWrapping'] = false;
            if (!isset(options,'lineNumbers')) options['lineNumbers'] = true;
            if (!isset(options,'indentUnit')) options['indentUnit'] = 4;
            if (!isset(options,'indentWithTabs')) options['indentWithTabs'] = false;
            if (!isset(options,'lint')) options['lint'] = false;
            if (!isset(options,'foldGutter')) options['foldGutter'] = true;
            if (!isset(options,'gutters')) options['gutters'] = ['CodeMirror-lint-markers','CodeMirror-linenumbers','CodeMirror-foldgutter'];
            wclass = 'w-widget w-syntax-editor w-codemirror-editor';
            if (!empty(attr,"class")) wclass += ' '+attr["class"];
            self.enqueue('scripts', 'codemirror');
            self.enqueue('scripts', 'codemirror-fold');
            self.enqueue('scripts', 'codemirror-htmlmixed');
            if (!empty(options,'grammar')) self.enqueue('scripts', 'codemirror-grammar');
            // if in browser and re-render, use dynamic id to re-enqueue
            if (isBrowser && (null == CNT['codemirror-'+wid])) CNT['codemirror-'+wid] = 0;
            self.enqueue('scripts', 'codemirror-'+wid+(isBrowser ? '-'+(++CNT['codemirror-'+wid]) : ''), ["(function(){\
                if ('function' !== typeof(CodeMirror)) return;\
                var options = "+(json_encode(options))+";\
                if (options.grammar && ('undefined' !== typeof(CodeMirrorGrammar)))\
                {\
                    var mode = CodeMirrorGrammar.getMode(options.grammar);\
                    CodeMirror.defineMode(options.mode, mode);\
                    mode.supportCodeFolding = true;\
                    CodeMirror.registerHelper('fold', mode.foldType, mode.folder);\
                    mode.supportGrammarAnnotations = true;\
                    CodeMirror.registerHelper('lint', options.mode, mode.validator);\
                    delete options.grammar;\
                }\
                var element = document.getElementById('"+wid+"');\
                if (element.codemirror)\
                {\
                    element.codemirror.toTextArea();\
                    element.codemirror = null;\
                }\
                if (options.delayedInit)\
                {\
                    setTimeout(function(){element.codemirror = CodeMirror.fromTextArea(element, options);}, +options.delayedInit);\
                }\
                else\
                {\
                    element.codemirror = CodeMirror.fromTextArea(element, options);\
                }\
            })();"], ['codemirror']);
        }
        else if (!!attr['wysiwyg-editor'])
        {
            options = is_object(attr["options"]) ? attr["options"] : {};
            if (!isset(options,'plugins')) options['plugins'] = 'print preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help' /*placeholderalt codemirror jbimages*/;
            if (!isset(options,'toolbar')) options['toolbar'] = 'undo redo formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat';
            if (empty(options,'theme')) options['theme'] = 'modern';
            if (empty(options,'skin')) options['skin'] = 'lightgray';
            if (empty(options,'directionality')) options['directionality'] = 'ltr';
            if (empty(options,'height')) options['height'] = 500;
            if (!isset(options,'placeholder')) options['placeholder'] = isset(attr,'placeholder') ? attr['placeholder'] : '';
            if (!isset(options,'automatic_uploads')) options['automatic_uploads'] = true;
            if (!isset(options,'image_advtab')) options['image_advtab'] = true;
            if (!isset(options,'paste_data_images')) options['paste_data_images'] = true;
            if (!isset(options,'browser_spellcheck')) options['browser_spellcheck'] = true;
            /*if (!isset(options,'templates')) options['templates'] = [];
            if (!isset(options,'body_class')) options['body_class'] = null;
            if (!isset(options,'content_css')) options['content_css'] = null;
            if (!isset(options,'content_style')) options['content_style'] = null;*/
            options['selector'] = '#'+wid;
            wclass = 'w-widget w-wysiwyg-editor';
            if (!empty(attr,"class")) wclass += ' '+attr["class"];
            self.enqueue('scripts', 'tinymce');
            // if in browser and re-render, use dynamic id to re-enqueue
            if (isBrowser && (null == CNT['tinymce-'+wid])) CNT['tinymce-'+wid] = 0;
            self.enqueue('scripts', 'tinymce-'+wid+(isBrowser ? '-'+(++CNT['tinymce-'+wid]) : ''), ["(function(){\
                if ('undefined' === typeof(tinymce)) return;\
                function dispatch(event, element, data)\
                {\
                    if (!element) return;\
                    var evt;\
                    if (document.createEvent)\
                    {\
                        evt = document.createEvent('HTMLEvents');\
                        evt.initEvent(event, true, true);\
                        evt.eventName = event;\
                        if (null != data) evt.data = data;\
                        element.dispatchEvent(evt);\
                    }\
                    else\
                    {\
                        evt = document.createEventObject();\
                        evt.eventType = event;\
                        evt.eventName = event;\
                        if (null != data) evt.data = data;\
                        element.fireEvent('on' + evt.eventType, evt);\
                    }\
                    return element;\
                };\
                var options = "+(json_encode(options))+";\
                var element = document.getElementById('"+wid+"');\
                if (options.autosave)\
                {\
                    options.setup = function(editor) {\
                        editor.on('change', function(){\
                            editor.save();\
                            dispatch('change', element);\
                        });\
                    };\
                    delete options.autosave;\
                }\
                if (options.locale && options.i18n)\
                {\
                    tinymce.util.I18n.add(options.locale, options.i18n);\
                    delete options.locale;\
                    delete options.i18n;\
                }\
                var prev_editor = tinymce.get(element.id);\
                if (prev_editor) prev_editor.remove();\
                if (options.delayedInit)\
                {\
                    setTimeout(function(){tinymce.init(options);}, +options.delayedInit);\
                }\
                else\
                {\
                    tinymce.init(options);\
                }\
            })();"], ['tinymce']);
        }
        else
        {
            wclass = 'w-widget w-textarea';
            if (!empty(attr,"class")) wclass += ' '+attr["class"];
            self.enqueue('styles', 'htmlwidgets.css');
        }
        return '<textarea id="'+wid+'" '+wname+' '+wtitle+' class="'+wclass+'" '+wstyle+' placeholder="'+wplaceholder+'" '+wextra+'>'+wvalue+'</textarea>';
    }

    ,w_date: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wplaceholder, wicon, wvalue, wname, wtime, wtitle, wformat, wrapper_class, titl, options;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : "";
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wclass = 'w-widget w-text w-date';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wicon = '';
        wrapper_class = 'w-wrapper';
        if (!empty(attr,'icon'))
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if (!empty(attr,'iconr'))
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        if (empty(attr,'icon') && empty(attr,'iconr'))
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        options = is_object(attr["options"]) ? attr["options"] : {};
        if (empty(options,'format')) options['format'] = 'Y-m-d';
        self.enqueue('scripts', 'pikadaytime');
        // if in browser and re-render, use dynamic id to re-enqueue
        if (isBrowser && (null == CNT['pikadaytime-'+wid])) CNT['pikadaytime-'+wid] = 0;
        self.enqueue('scripts', 'pikadaytime-'+wid+(isBrowser ? '-'+(++CNT['pikadaytime-'+wid]) : ''), ["(function(){\
            if ('function' !== typeof(Pikadaytime)) return;\
            var options = "+(json_encode(options))+";\
            var locale = options.i18n, format = options.format;\
            if ('function' === typeof(DateX))\
            {\
                var datetime_parse = DateX.getParser(format, locale);\
                options.encoder = function(datetime) {return DateX.format(datetime, format, locale);};\
                options.decoder = function(datetime) {return !!datetime && datetime_parse(datetime);};\
            }\
            else\
            {\
                options.encoder = function(datetime, pikaday) {return pikaday._o.showTime ? datetime.toString() : datetime.toDateString();};\
                options.decoder = function(datetime) {return new Date(Date.parse(datetime));};\
            }\
            options.field = document.getElementById('"+wid+"');\
            if (options.delayedInit)\
            {\
                setTimeout(function(){new Pikadaytime(options);}, +options.delayedInit);\
            }\
            else\
            {\
                new Pikadaytime(options);\
            }\
        })();"], ['pikadaytime']);
        return '<span class="'+wrapper_class+'" '+wstyle+'><input type="text" id="'+wid+'" '+wname+' '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" data-datepicker-format="'+wformat+'" '+wtime+' '+wextra+' />'+wicon+'</span>';
    }

    ,w_time: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wvalue, wtitle, wname, wnam, wformat, wtimes,
            time_options, i, tt, t, p, f, selected;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? attr["name"] : '';
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wformat = !empty(attr,'format') ? attr['format'].split(':') : ["h","m","s"];
        if (isset(data,'value'))
        {
            wvalue = is_array(data['value']) ? data['value'] : data['value'].split(':');
            while (wvalue.length < 3) wvalue.push("00");
        }
        else
        {
            wvalue = ["00", "00", "00"];
        }
        wclass = 'w-widget w-time';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        time_options = {
            'h':[],
            'm':[],
            's':[]
        };
        for (i=0; i<60; i++)
        {
            tt = i<10 ? '0'+i : ''+i;
            for (p=0; p<wformat.length; p++)
            {
                f = wformat[p];
                if ('h' === f && i>=24) continue;
                selected = tt === wvalue[p] ? 'selected="selected"' : '';
                time_options[f].push('<option value="'+tt+'" '+selected+'>'+tt+'</option>');
            }
        }
        wtimes = [];
        for (p=0; p<wformat.length; p++)
        {
            t = wformat[p];
            wnam = wname.length ? 'name="'+wname+'['+t+']"' : '';
            wtimes.push('<select class="w-time-component" id="'+wid+'_'+t+'" '+wnam+' '+wtitle+' '+wextra+'>'+time_options[t].join('')+'</select>');
        }
        wtimes = wtimes.join('<span class="w-time-sep">:</span>');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<span class="'+wclass+'" '+wstyle+'>'+wtimes+'</span>';
    }

    ,w_color: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, winput, wname, wtitle, options;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        options = is_object(attr["options"]) ? attr["options"] : {};
        if (empty(options,'changeEvent')) options['changeEvent'] = 'change';
        if (empty(options,'format')) options['format'] = 'rgba';
        if (!isset(options,'color') && isset(data,'color')) options['color'] = data['color'];
        if (!isset(options,'opacity') && isset(data,'opacity')) options['opacity'] = data['opacity'];
        if (!empty(options,'input'))
        {
            winput = '<input id="'+attr['input']+'" type="hidden" '+wname+' value="" style="display:none" />';
        }
        else
        {
            winput = '';
        }
        wtitle = !empty(attr,"title") ? 'title="'+attr["title"]+'"' : '';
        wclass = 'colorpicker-selector w-colorselector';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = self.attributes(attr,['readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('scripts', 'colorpicker');
        // if in browser and re-render, use dynamic id to re-enqueue
        if (isBrowser && (null == CNT['colorpicker-'+wid])) CNT['colorpicker-'+wid] = 0;
        self.enqueue('scripts', 'colorpicker-'+wid+(isBrowser ? '-'+(++CNT['colorpicker-'+wid]) : ''), ["(function(){\
            if ('function' !== typeof(ColorPicker)) return;\
            var options = "+(json_encode(options))+";\
            if (options.input) options.input = document.getElementById(options.input);\
            if (options.delayedInit)\
            {\
                setTimeout(function(){new ColorPicker(document.getElementById('"+wid+"'), options);}, +options.delayedInit);\
            }\
            else\
            {\
                new ColorPicker(document.getElementById('"+wid+"'), options);\
            }\
        })();"], ['colorpicker']);
        return winput+'<div id="'+wid+'" '+wtitle+' class="'+wclass+'" '+wstyle+' '+wextra+'></div>';
    }

    ,w_file: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wicon, wplaceholder, wvalue, wname, wtitle, wrapper_class, titl;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wname = !empty(attr,"name") ? 'name="'+attr["name"]+'"' : '';
        wvalue = isset(data,"value") ? data["value"] : "";
        titl = isset(attr,"title") ? attr["title"] : '';
        wtitle = !!titl ? 'title="'+titl+'"' : '';
        wplaceholder = isset(attr,'placeholder') ? attr['placeholder'] : titl;
        wclass = 'w-widget w-file w-text';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wicon = '';
        wrapper_class = 'w-wrapper';
        if (!empty(attr,'icon'))
        {
            wicon += "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-" + attr['icon'] + "\"></i></span>";
            wrapper_class += ' w-icon';
        }
        if (!empty(attr,'iconr'))
        {
            wicon += "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-" + attr['iconr'] + "\"></i></span>";
            wrapper_class += ' w-icon-right';
        }
        wextra = self.attributes(attr,['accept','multiple','readonly','disabled','data'])+(!empty(attr,"extra") ? (' '+attr["extra"]) : '');
        self.enqueue('styles', 'htmlwidgets.css');
        return '<label for="'+wid+'" class="'+wrapper_class+'" '+wstyle+'><input type="file" id="'+wid+'" '+wname+' class="w-file-input" value="'+wvalue+'" '+wextra+' style="display:none !important"/><input type="text" id="text_input_'+wid+'" '+wtitle+' class="'+wclass+'" placeholder="'+wplaceholder+'" value="'+wvalue+'" form="__NONE__" />'+wicon+'</label>';
    }

    ,w_table: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wdata, wcolumns, wrows, wheader, wfooter,
            column_values, column_keys, row, rowid, rowk, rowv, r, c, rl, cl, options;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-widget w-table';
        /*
        if ( !empty(attr,'stripped') ) wclass += ' stripped';
        if ( !empty(attr,'bordered') ) wclass += ' bordered';
        if ( !empty(attr,'responsive') ) wclass += ' responsive';
        */
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        var plus_footer = !empty(attr['footer']);
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wcolumns = '';
        column_values = data['columns'];
        column_keys = KEYS(data_cols);
        cl = column_keys.length
        for (c=0; c<cl; c++)
        {
            wcolumns += "<th data-columnkey=\""+column_keys[c]+"\"><span>"+column_values[column_keys[c]]+"</span></th>";
        }
        wcolumns = "<tr>"+wcolumns+"</tr>";
        wheader = !isset(attr['header']) || !empty(attr['header']) ? '<thead>'+wcolumns+'</thead>' : '';
        wfooter = !empty(attr['footer']) ? '<tfoot>'+wcolumns+'</tfoot>' : '';
        wrows = ''; rl = data['rows'].length;
        for (r=0; r<rl; r++)
        {
            row = data['rows'][r];
            rowid = null != row.id ? row.id : r;
            rowv = null != row.cells ? row.cells : row;
            rowk = KEYS(rowv);
            wrows += "\n" + "<tr data-row=\""+rowid+"\">";
            for (c=0; c<cl; c++)
            {
                wrows += "<td data-columnkey=\""+column_keys[c]+"\" data-column=\""+column_values[column_keys[c]]+"\">"+rowv[rowk[c]]+"</td>";
            }
            wrows += "</tr>";
        }
        wdata = self.data(attr);
        self.enqueue('styles', 'htmlwidgets.css');
        if (!!attr['datatable'])
        {
            options = is_object(attr["options"]) ? attr["options"] : {};
            wclass += ' w-datatable';
            self.enqueue('scripts', 'datatables');
            // if in browser and re-render, use dynamic id to re-enqueue
            if (isBrowser && (null == CNT['datatables-'+wid])) CNT['datatables-'+wid] = 0;
            self.enqueue('scripts', 'datatables-'+wid+(isBrowser ? '-'+(++CNT['datatables-'+wid]) : ''), ["(function(){\
                if ('undefined' === typeof(jQuery) || 'function' !== typeof(jQuery.fn.dataTable)) return;\
                var options = "+(json_encode(options))+";\
                if (options.delayedInit)\
                {\
                    setTimeout(function(){jQuery(document.getElementById('"+wid+"')).dataTable(options);}, +options.delayedInit);\
                }\
                else\
                {\
                    jQuery(document.getElementById('"+wid+"')).dataTable(options);\
                }\
            })();"], ['datatables']);
        }
        return '<table id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>'+wheader+'<tbody>'+wrows+'</tbody>'+wfooter+'</table>';
    }

    ,w_media: function(attr, data, widgetName) {
        var wid, wtype, wclass, wstyle, wextra, wtext, wsources, wsource, source, src, src_type;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wtype = empty(attr,'type') ? "video" : attr['type'];
        if ('audio' !== wtype) wtype = 'video';
        wclass = 'w-media w-'+wtype;
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
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

    ,w_menu: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wdata, out;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-widget';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.data(attr);
        if (is_array(data) && data.length)
        {
            out = '<nav id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>'+"\n";
            if (empty(attr,'mobile'))
            {
                out += '<label for="mobile-menu_'+wid+'" class="w-menu-controller-bt"><i class="fa fa-bars fa-2x"></i>&nbsp;</label><input id="mobile-menu_'+wid+'" type="checkbox" class="w-menu-controller" value="1" />'+"\n";
            }
            out += self.menu(data);
            out += '</nav>';
            self.enqueue('styles', 'htmlwidgets.css');
            return out;
        }
        else
        {
            return '<nav id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'>';
        }
    }

    ,w_menu_end: function(attr, data, widgetName) {
        self.enqueue('styles', 'htmlwidgets.css');
        return '</nav>';
    }

    ,w_pagination: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, totalItems, itemsPerPage, currentPage,
            maxPagesToShow, placeholder, urlPattern, previousText, nextText, ellipsis,
            numPages, pages, page, i, l, numAdjacents, slidingStart, slidingEnd, selectBox, out;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-pagination pagination';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        totalItems = parseInt(data['totalItems']);
        itemsPerPage = parseInt(data['itemsPerPage']);
        currentPage = isset(data,'currentPage') ? parseInt(data['currentPage']) : 1;
        maxPagesToShow = isset(attr,'maxPages') ? parseInt(attr['maxPages']) : 10;
        placeholder = isset(attr,'placeholder') ? String(attr['placeholder']) : '(:page)';
        urlPattern = isset(attr,'urlPattern') ? String(attr['urlPattern']) : '?page='+placeholder;
        previousText = isset(attr,'previousText') ? String(attr['previousText']) : '&laquo; Previous';
        nextText = isset(attr,'nextText') ? String(attr['nextText']) : 'Next &raquo;';
        ellipsis = isset(attr,'ellipsis') ? String(attr['ellipsis']) : '...';
        selectBox = !empty(attr,'selectBox');

        numPages = 0 >= itemsPerPage || 0 >= totalItems ? 0 : Math.ceil(totalItems/itemsPerPage);
        if (numPages > 1)
        {
            pages = [];
            if (numPages <= maxPagesToShow)
            {
                for (i=1; i<=numPages; i++)
                {
                    pages.push({
                        text : i,
                        url : urlPattern.replace(placeholder, String(i)),
                        isCurrent : i==currentPage
                    });
                }
            }
            else
            {
                // Determine the sliding range, centered around the current page.
                numAdjacents = Math.floor((maxPagesToShow - 3) / 2);

                if (currentPage + numAdjacents > numPages)
                {
                    slidingStart = numPages - maxPagesToShow + 2;
                }
                else
                {
                    slidingStart = currentPage - numAdjacents;
                }
                if (slidingStart < 2) slidingStart = 2;

                slidingEnd = slidingStart + maxPagesToShow - 3;
                if (slidingEnd >= numPages) slidingEnd = numPages - 1;

                // Build the list of pages.
                pages.push({
                    text : 1,
                    url : urlPattern.replace(placeholder, String(1)),
                    isCurrent : 1==currentPage
                });
                if (slidingStart > 2)
                {
                    pages.push({
                        text : ellipsis,
                        url : null,
                        isCurrent : false
                    });
                }
                for (i=slidingStart; i<=slidingEnd; i++)
                {
                    pages.push({
                        text : i,
                        url : urlPattern.replace(placeholder, String(i)),
                        isCurrent : i==currentPage
                    });
                }
                if (slidingEnd < numPages - 1)
                {
                    pages.push({
                        text : ellipsis,
                        url : null,
                        isCurrent : false
                    });
                }
                pages.push({
                    text : numPages,
                    url : urlPattern.replace(placeholder, String(numPages)),
                    isCurrent : numPages==currentPage
                });
            }

            if (selectBox)
            {
                out = '<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>';
                if (currentPage > 1)
                {
                    out += '<span class="page-previous"><a href="' + htmlspecialchars(urlPattern.replace(placeholder, String(currentPage-1))) + '">'+ previousText +'</a></span>';
                }

                out += '<select class="page-select">';
                for (i=0,l=pages.length; i<l; i++)
                {
                    page = pages[i];
                    if (page.url)
                    {
                        out += '<option value="' + htmlspecialchars(page.url) + '"' + (page.isCurrent ? ' selected' : '') + '>' + String(page.text) + '</option>';
                    }
                    else
                    {
                        out += '<option disabled>' + String(page.text) + '</option>';
                    }
                }
                out += '</select>';

                if (currentPage < numPages)
                {
                    out += '<span class="page-next"><a href="' + htmlspecialchars(urlPattern.replace(placeholder, String(currentPage+1))) + '">'+ nextText +'</a></span>';
                }
                out += '</div>';
            }
            else
            {
                out = '<ul id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'>';
                if (currentPage > 1)
                {
                    out += '<li class="page-previous"><a href="' + htmlspecialchars(urlPattern.replace(placeholder, String(currentPage-1))) + '">'+ previousText +'</a></li>';
                }

                for (i=0,l=pages.length; i<l; i++)
                {
                    page = pages[i];
                    if (page.url)
                    {
                        out += '<li class="page-item' + (1==page.text ? ' page-first' : '') + (numPages==page.text ? ' page-last' : '') + (page.isCurrent ? ' page-active active' : '') + '"><a href="' + htmlspecialchars(page.url) + '">' + String(page.text) + '</a></li>';
                    }
                    else
                    {
                        out += '<li class="page-item disabled"><span>' + String(page.text) + '</span></li>';
                    }
                }

                if (currentPage < numPages)
                {
                    out += '<li class="page-next"><a href="' + htmlspecialchars(urlPattern.replace(placeholder, String(currentPage+1))) + '">'+ nextText +'</a></li>';
                }
                out += '</ul>';
            }
            self.enqueue('styles', 'htmlwidgets.css');
            return out;
        }
        else
        {
            return '';
        }
    }

    ,w_delayable: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wspinner;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-delayable-overlay';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wspinner = 'w-spinner';
        wspinner += !empty(attr,'spinner') ? " "+attr['spinner'] : " w-spinner-dots";
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'><div class="'+wspinner+'"></div></div>';
    }

    ,w_disabable: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-disabable-overlay';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        self.enqueue('styles', 'htmlwidgets.css');
        return '<div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+'></div>';
    }

    ,w_morphable: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wmodes, wmode_class, wshow_class, whide_class, wselector, wselector_animated, wshow_selector, whide_selector, wshow_selector_animated, whide_selector_animated, wshow_selector__important, whide_selector__important, wshow_selector_animated__important, whide_selector_animated__important, whide_sel, whide_not_sel, wshow_sel, wshow_not_sel, mode_class;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-morphable';
        wmodes = [].concat(attr['modes']);
        wmode_class = !empty(attr,'mode') ? attr['mode'] : 'mode-${MODE}';
        wshow_class = !empty(attr,'show') ? attr['show'] : 'show-if-${MODE}';
        whide_class = !empty(attr,'hide') ? attr['hide'] : 'hide-if-${MODE}';
        wselector = '#'+wid+'.w-morphable:not(.w-animated-morphable)';
        wselector_animated = '#'+wid+'.w-morphable.w-animated-morphable';
        wshow_selector = [];
        whide_selector = [];
        wshow_selector__important = [];
        whide_selector__important = [];
        wshow_selector_animated = [];
        whide_selector_animated = [];
        wshow_selector_animated__important = [];
        whide_selector_animated__important = [];
        var i, j, l = wmodes.length;
        for (i=0; i<l; i++)
        {
            mode_class = wmode_class.split('${MODE}').join(wmodes[i]);
            whide_sel = ' .w-morphable-item.' + whide_class.split('${MODE}').join(wmodes[i]);
            whide_not_sel = ' .w-morphable-item.' + whide_class.split('${MODE}').join('not-'+wmodes[i]);
            wshow_sel = ' .w-morphable-item.' + wshow_class.split('${MODE}').join(wmodes[i]);
            wshow_not_sel = ' .w-morphable-item.' + wshow_class.split('${MODE}').join('not-'+wmodes[i]);

            /*
            SHOW < HIDE, SHOW default

            mode + show                 =====> SHOW !important
            mode + hide                 =====> HIDE !important

            !mode + hide_not            =====> HIDE
            !mode + show_not            =====> SHOW
            !mode + show                =====> HIDE
            !mode + hide                =====> SHOW
            mode + hide_not             =====> SHOW
            mode + show_not             =====> HIDE

            else                        =====> LEAVE AS IS

            CSS selectors are LINEAR O(n) in the number of options/modes
            inluding AND/OR operations between modes
            */

            // 1st level only
            wshow_selector.push(
                wselector+'.w-morphable-level-1 > .w-morphable-item'
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-level-1 > .w-morphable-item'
            );

            whide_selector__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+'.w-morphable-level-1 >'+whide_sel
            );
            whide_selector__important.push(
                wselector+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+whide_sel
            );

            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+'.w-morphable-level-1 >'+wshow_sel
            );
            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+'.w-morphable-level-1 >'+wshow_not_sel
            );
            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+'.w-morphable-level-1 >'+whide_not_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+wshow_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+wshow_not_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+whide_not_sel
            );


            wshow_selector__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+'.w-morphable-level-1 >'+wshow_sel
            );
            wshow_selector__important.push(
                wselector+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+wshow_sel
            );

            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+'.w-morphable-level-1 >'+whide_sel
            );
            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+'.w-morphable-level-1 >'+whide_not_sel
            );
            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+'.w-morphable-level-1 >'+wshow_not_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+whide_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+whide_not_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+wshow_not_sel
            );


            whide_selector_animated__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+'.w-morphable-level-1 >'+whide_sel
            );
            whide_selector_animated__important.push(
                wselector_animated+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+whide_sel
            );

            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+'.w-morphable-level-1 >'+wshow_sel
            );
            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+'.w-morphable-level-1 >'+wshow_not_sel
            );
            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+'.w-morphable-level-1 >'+whide_not_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+wshow_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+wshow_not_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+whide_not_sel
            );


            wshow_selector_animated__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+'.w-morphable-level-1 >'+wshow_sel
            );
            wshow_selector_animated__important.push(
                wselector_animated+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+wshow_sel
            );

            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+'.w-morphable-level-1 >'+whide_sel
            );
            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+'.w-morphable-level-1 >'+whide_not_sel
            );
            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+'.w-morphable-level-1 >'+wshow_not_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+whide_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class.'+mode_class+'.w-morphable-level-1 >'+whide_not_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+').w-morphable-level-1 >'+wshow_not_sel
            );


            // any level
            wshow_selector.push(
                wselector+':not(.w-morphable-level-1) .w-morphable-item'
            );
            wshow_selector_animated.push(
                wselector_animated+':not(.w-morphable-level-1) .w-morphable-item'
            );

            whide_selector__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+':not(.w-morphable-level-1)'+whide_sel
            );
            whide_selector__important.push(
                wselector+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+whide_sel
            );

            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+':not(.w-morphable-level-1)'+wshow_sel
            );
            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            whide_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+':not(.w-morphable-level-1)'+whide_not_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+wshow_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            whide_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+whide_not_sel
            );


            wshow_selector__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+':not(.w-morphable-level-1)'+wshow_sel
            );
            wshow_selector__important.push(
                wselector+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+wshow_sel
            );

            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+':not(.w-morphable-level-1)'+whide_sel
            );
            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector+':not(.w-morphable-level-1)'+whide_not_sel
            );
            wshow_selector.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+whide_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+whide_not_sel
            );
            wshow_selector.push(
                wselector+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+wshow_not_sel
            );


            whide_selector_animated__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+':not(.w-morphable-level-1)'.$whide_sel
            );
            whide_selector_animated__important.push(
                wselector_animated+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+whide_sel
            );

            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+':not(.w-morphable-level-1)'+wshow_sel
            );
            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            whide_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+':not(.w-morphable-level-1)'+whide_not_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+wshow_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            whide_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+whide_not_sel
            );


            wshow_selector_animated__important.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+':not(.w-morphable-level-1)'+wshow_sel
            );
            wshow_selector_animated__important.push(
                wselector_animated+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+wshow_sel
            );

            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+':not(.w-morphable-level-1)'+whide_sel
            );
            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:checked ~ '+wselector_animated+':not(.w-morphable-level-1)'+whide_not_sel
            );
            wshow_selector_animated.push(
                'input[data-morph-'+wid+'="'+mode_class+'"]:not(:checked) ~ '+wselector_animated+':not(.w-morphable-level-1)'+wshow_not_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+whide_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class.'+mode_class+':not(.w-morphable-level-1)'+whide_not_sel
            );
            wshow_selector_animated.push(
                wselector_animated+'.w-morphable-class:not(.'+mode_class+'):not(.w-morphable-level-1)'+wshow_not_sel
            );
        }
        wstyle = '';

        wstyle += whide_selector.join(',') + '{display: none !important}';
        wstyle += wshow_selector.join(',') + '{display: block}';
        wstyle += whide_selector__important.join(',') + '{display: none !important}';
        wstyle += wshow_selector__important.join(',') + '{display: block !important}';

        wstyle += whide_selector_animated.join(',') + '{\
pointer-events: none !important; overflow: hidden !important;\
min-width: 0 !important; max-width: 0 !important;\
min-height: 0 !important; max-height: 0 !important; opacity: 0 !important;\
-webkit-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-moz-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-ms-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-o-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
}';
        wstyle += wshow_selector_animated.join(',') + '{\
overflow: hidden !important;\
min-width: 0 !important; max-width: 5000px; min-height: 0 !important; max-height: 5000px; opacity: 1;\
-webkit-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-moz-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-ms-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-o-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
}';
        wstyle += whide_selector_animated__important.join(',') + '{\
pointer-events: none !important; overflow: hidden !important;\
min-width: 0 !important; max-width: 0 !important;\
min-height: 0 !important; max-height: 0 !important; opacity: 0 !important;\
-webkit-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-moz-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-ms-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
-o-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;\
}';
        wstyle += wshow_selector_animated__important.join(',') + '{\
overflow: hidden !important;\
min-width: 0 !important; max-width: 5000px; min-height: 0 !important; max-height: 5000px; opacity: 1;\
-webkit-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-moz-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-ms-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
-o-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;\
}';
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
        self.enqueue('styles', "w-morphable-"+wid, [wstyle], ['htmlwidgets.css']);
        return '';
    }

    ,w_panel: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wtitle, wchecked, wdata;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wclass = 'w-panel';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wtitle = !empty(attr,'title') ? attr['title'] : '&nbsp;';
        wchecked = !empty(attr,'opened') ? 'checked' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wdata = self.data(attr);

        self.enqueue('styles', 'htmlwidgets.css');
        return '<input type="checkbox" id="controller_'+wid+'" class="w-panel-controller" value="1" '+wchecked+'/><div id="'+wid+'" class="'+wclass+'" '+wstyle+' '+wextra+' '+wdata+'><div class="w-panel-header">'+wtitle+'<label class="w-panel-controller-button fa fa-2x" for="controller_'+wid+'" onclick=""></label></div><div class="w-panel-content">';
    }

    ,w_panel_end: function(attr, data, widgetName) {
        return '</div></div>';
    }

    ,w_accordeon: function(attr, data, widgetName) {
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

    ,w_tabs: function(attr, data, widgetName) {
        var wid, wstyle, wcontext, wtabs, i, l, wcontrollers, wctrl, wselector, wselected, wtransform1, wtransform2;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wtabs = [].concat(attr['tabs']);

        if (!empty(attr['3d']))
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

    ,w_pages: function(attr, data, widgetName) {
        var wid, wstyle, wcontext, wpages, main_page, i, l, wcontrollers, wselector, wtransform1, wtransform2, wtransform3;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wcontext = !empty(attr,'context') ? (attr['context']+" ") : "";
        wpages = [].concat(attr['pages']);

        if (!empty(attr['3d']))
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

    ,w_tooltip: function(attr, data, widgetName) {
        var wid, wclass, wstyle, wextra, wdata, wtitle, wtext, warrow;
        wid = isset(attr,"id") ? attr["id"] : self.uuid();
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wclass = 'w-tooltip';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        if (!empty(attr,'icon'))
        {
            wtext = "<i class=\"fa fa-" + attr['icon'] + " left-fa\"></i>" + wtext;
        }
        else if (!empty(attr,'iconr'))
        {
            wtext = wtext + "<i class=\"fa fa-" + attr['iconr'] + " right-fa\"></i>";
        }
        if (!empty(attr,'tooltip'))
        {
            if ('top' === attr.toolip)
                warrow = '<div class="w-tooltip-arrow w-arrow-bottom"></div>';
            else if ('bottom' === attr.toolip)
                warrow = '<div class="w-tooltip-arrow w-arrow-top"></div>';
            else if ('right' === attr.toolip)
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

    ,w_animation: function(attr, data, widgetName)  {
        var wid, wselector, wanimation, wtransition, wduration, wdelay, wtiming_function, weasing, witeration_count, wfill_mode, wanimation_def;
        wid = isset(attr,"id") ? attr["id"] : self.uuid('widget_animation');
        wselector = isset(attr,"selector") ? attr["selector"] : '.animate-'+wid;
        wanimation = !empty(attr,'animation') ? attr['animation'] : '';
        wtransition = !empty(attr,'transition') ? attr['transition'] : '';
        wduration = isset(attr,'duration') ? attr['duration'] : '0.5s';
        wdelay = isset(attr,'delay') ? attr['delay'] : '0s';
        wtiming_function = !empty(attr,'timing-function') ? attr['timing-function'] : '';
        weasing = !empty(attr,'easing') ? attr['easing'] : 'linear';
        if (!wtiming_function.length) wtiming_function = weasing;
        witeration_count = !empty(attr,'iteration-count') ? attr['iteration-count'] : '1';
        wfill_mode = !empty(attr,'fill-mode') ? attr['fill-mode'] : 'both';
        wanimation_def = '';
        if (wanimation.length)
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
        if (wtransition.length)
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
        self.enqueue('styles', 'w-animation-'+wid, [wanimation_def], ['htmlwidgets.css']);
        return '';
    }

    ,w_sprite: function(attr, data, widgetName) {
        var wid, wtext, wtitle, wclass, wstyle, wextra, wsprite, wanimation, witer, wfps,
            ww, wh, wr, wc, d, nframes, wsprite_def, two_dim_grid,
            attX, attY, iniX, iniY, finX, finY, factX = 1, factY = 1,
            aspect_ratio, background_size,
            animation_name, animation_duration, animation_delay, animation_timing, animation_iteration;
        wid = isset(attr,"id") ? attr["id"] : self.uuid('widget_sprite');
        wtext = isset(data,'text') ? data['text'] : '';
        wtitle = isset(attr,'title') ? attr['title'] : wtext;
        wstyle = !empty(attr,"style") ? 'style="'+attr["style"]+'"' : '';
        wextra = !empty(attr,"extra") ? attr["extra"] : '';
        wanimation = isset(attr,"animation") ? attr["animation"] : 'sprite-'+wid;
        wclass = 'w-sprite '+wanimation+'-class';
        if (!empty(attr,"class")) wclass += ' '+attr["class"];
        wsprite = isset(attr,"sprite") ? attr["sprite"] : wid;
        witer = isset(attr,"iteration") ? attr["iteration"] : 'infinite';
        wfps = isset(attr,'fps') ? +attr['fps'] : 12;
        ww = isset(attr,'width') ? +attr['width'] : 100;
        wh = isset(attr,'height') ? +attr['height'] : 100;
        wr = isset(attr,'rows') ? +attr['rows'] : 1;
        wc = isset(attr,'columns') ? +attr['columns'] : 1;
        nframes = wr*wc; d = nframes/wfps;
        factX = wc; factY = wr;
        aspect_ratio = 100*wh/ww;
        background_size = ''+(100*wc)+'% '+(100*wr)+'%';

        /*if ( (-1 < (' '+wclass+' ').indexOf(' w-sprite-responsive ')) || (-1 < (' '+wclass+' ').indexOf(' sprite-responsive ')) )
        {
            factX = wc;
            factY = wr;
        }*/

        if ((1 < wr) && (1 < wc))
        {
            // background-position-x, background-position-y NOT supported very good
            two_dim_grid = true;
            attX = "background-position-x"; attY = "background-position-y";
            iniX = "0%"; iniY = "0%";
            finX = "-"+(factX*100)+"%"; finY = "-"+(factY*100)+"%";
            animation_name = wanimation+"-grid-x, "+wanimation+"-grid-y";
            animation_duration = ''+(d/wr)+'s, '+d+'s';
            animation_delay = '0s, 0s';
            animation_timing = "steps("+wc+"), steps("+wr+")";
            animation_iteration = ""+witer+", "+witer;
        }
        else if (1 < wr)
        {
            two_dim_grid = false;
            attX = "background-position";
            iniX = "0% 0%";
            finX = "0% -"+(factY*100)+"%";
            animation_name = wanimation+"-grid-x";
            animation_duration = ''+d+'s';
            animation_delay = '0s';
            animation_timing = "steps("+wr+")";
            animation_iteration = witer;
        }
        else
        {
            two_dim_grid = false;
            attX = "background-position";
            iniX = "0% 0%";
            finX = "-"+(factX*100)+"% 0%";
            animation_name = wanimation+"-grid-x";
            animation_duration = ''+d+'s';
            animation_delay = '0s';
            animation_timing = "steps("+wc+")";
            animation_iteration = witer;
        }
        wsprite_def = '\
#'+wid+'.w-sprite.'+wanimation+'-class\
{\
width: '+ww+'px; height: '+wh+'px;\
background-image: url("'+wsprite+'");\
background-repeat: none;\
background-position: 0% 0%;\
background-size: auto auto;\
-webkit-animation-name: '+animation_name+';\
-webkit-animation-duration: '+animation_duration+';\
-webkit-animation-delay: '+animation_delay+';\
-webkit-animation-timing-function: '+animation_timing+';\
-webkit-animation-iteration-count: '+animation_iteration+';\
-moz-animation-name: '+animation_name+';\
-moz-animation-duration: '+animation_duration+';\
-moz-animation-delay: '+animation_delay+';\
-moz-animation-timing-function: '+animation_timing+';\
-moz-animation-iteration-count: '+animation_iteration+';\
-ms-animation-name: '+animation_name+';\
-ms-animation-duration: '+animation_duration+';\
-ms-animation-delay: '+animation_delay+';\
-ms-animation-timing-function: '+animation_timing+';\
-ms-animation-iteration-count: '+animation_iteration+';\
-o-animation-name: '+animation_name+';\
-o-animation-duration: '+animation_duration+';\
-o-animation-delay: '+animation_delay+';\
-o-animation-timing-function: '+animation_timing+';\
-o-animation-iteration-count: '+animation_iteration+';\
animation-name: '+animation_name+';\
animation-duration: '+animation_duration+';\
animation-delay: '+animation_delay+';\
animation-timing-function: '+animation_timing+';\
animation-iteration-count: '+animation_iteration+';\
}\
#'+wid+'.w-sprite.responsive.'+wanimation+'-class,\
#'+wid+'.w-sprite.sprite-responsive.'+wanimation+'-class,\
#'+wid+'.w-sprite.w-sprite-responsive.'+wanimation+'-class\
{\
width: 100% !important; height: auto !important;\
padding-bottom: '+aspect_ratio+'% !important;\
background-size: '+background_size+' !important;\
}\
@-webkit-keyframes '+wanimation+'-grid-x {\
    0% { '+attX+': '+iniX+'; }\
    100% { '+attX+': '+finX+'; }\
}\
@-moz-keyframes '+wanimation+'-grid-x {\
    0% { '+attX+': '+iniX+'; }\
    100% { '+attX+': '+finX+'; }\
}\
@-ms-keyframes '+wanimation+'-grid-x {\
    0% { '+attX+': '+iniX+'; }\
    100% { '+attX+': '+finX+'; }\
}\
@-o-keyframes '+wanimation+'-grid-x {\
    0% { '+attX+': '+iniX+'; }\
    100% { '+attX+': '+finX+'; }\
}\
@keyframes '+wanimation+'-grid-x {\
    0% { '+attX+': '+iniX+'; }\
    100% { '+attX+': '+finX+'; }\
}\
';
    if ( two_dim_grid )
    {
        wsprite_def += "\n"+'\
@-webkit-keyframes '+wanimation+'-grid-y {\
    0% { '+attY+': '+iniY+'; }\
    100% { '+attY+': '+finY+'; }\
}\
@-moz-keyframes '+wanimation+'-grid-y {\
    0% { '+attY+': '+iniY+'; }\
    100% { '+attY+': '+finY+'; }\
}\
@-ms-keyframes '+wanimation+'-grid-y {\
    0% { '+attY+': '+iniY+'; }\
    100% { '+attY+': '+finY+'; }\
}\
@-o-keyframes '+wanimation+'-grid-y {\
    0% { '+attY+': '+iniY+'; }\
    100% { '+attY+': '+finY+'; }\
}\
@keyframes '+wanimation+'-grid-y {\
    0% { '+attY+': '+iniY+'; }\
    100% { '+attY+': '+finY+'; }\
}\
';
    }
        self.enqueue('styles', 'w-sprite-'+wid, [wsprite_def], ['htmlwidgets.css']);
        return '<div id="'+wid+'" class="'+wclass+'" title="'+wtitle+'" '+wstyle+' '+wextra+'>'+wtext+'</div>';
    }
};

if (isXPCOM)
{
    HtmlWidget.BASE = './';
}
else if (isNode)
{
    HtmlWidget.BASE = __dirname;
}
else if (isWebWorker)
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