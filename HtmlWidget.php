<?php
/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone for PHP, Node/JS, Python
*
*  @version: 0.1
*  https://github.com/foo123/HtmlWidget
*
**/
if ( !class_exists('HtmlWidget') )
{
class HtmlWidget
{
    const VERSION = "0.1";
    public static $enqueuer = null;
    public static $widgets = array( );
    
    public static function enqueueAssets($enqueuer=null)
    {
        if ( $enqueuer && is_callable($enqueuer) ) self::$enqueuer = $enqueuer;
        else self::$enqueuer = null;
    }
    
    public static function enqueue($type, $id, $asset=null, $deps=array())
    {
        if ( self::$enqueuer ) 
            call_user_func(self::$enqueuer, $type, $id, $asset, $deps);
    }
    
    public static function assets( $base='')
    {
        $base = $base . '/assets/';
        return array(
         array('scripts', 'htmlwidgets.js', $base.'js/htmlwidgets.js', array("jquery"))
        ,array('styles', 'htmlwidgets.css', $base.'css/htmlwidgets.css', array("responsive.css", "font-awesome.css"/*,"htmlwidgets.js"*/))
        ,array('styles', 'trumbowyg.css', $base.'css/trumbowyg.min.css')
        ,array('scripts', 'trumbowyg', $base.'js/trumbowyg.min.js', array('trumbowyg.css','jquery'))
        ,array('styles', 'jquery.dataTables.css', $base.'css/jquery.dataTables.css')
        ,array('scripts', 'jquery.dataTables', $base.'js/jquery.dataTables.js', array('jquery.dataTables.css', 'jquery'))
        ,array('styles', 'jquery.pikaday.css', $base.'css/jquery.pikaday.css')
        ,array('scripts', 'jquery.pikaday', $base.'js/jquery.pikaday.js', array('jquery.pikaday.css', 'jquery'))
        ,array('scripts', 'jquery.remote-list', $base.'js/jquery.remote-list.js', array('jquery'))
        );
    }
    
    public static function uuid($namespace="widget")
    {
        static $cnt = 0;
        return implode("_", array($namespace, time(), ++$cnt));
    }
    
    public static function attr_data($attr)
    {
        $data_attr = '';
        if ( !empty($attr['data']) )
        {
            foreach($attr['data'] as $k=>$v)
            {
                if ( !empty($data_attr) ) $data_attr .= ' ';
                $data_attr .= "data-$k='$v'";
            }
        }
        return $data_attr;
    }
    
    public static function addWidget($widget, $renderer)
    {
        if ( $widget && $renderer && is_callable($renderer) )
            self::$widgets['wi_'.$widget] = $renderer;
        elseif ( $widget && false === $renderer && isset(self::$widgets['wi_'.$widget]) )
            unset(self::$widgets['wi_'.$widget]);
    }
    
    public static function widget($widget, $attr=array(), $data=array())
    {
        $out = '';
        if ( $widget )
        {
            if ( isset(self::$widgets['wi_'.$widget]) ) 
            {
                $out = call_user_func(self::$widgets['wi_'.$widget], $attr, $data);
            }
            else
            {
            
            if ( "checkbox" === $widget ) $attr["type"] = "checkbox";
            elseif ( "radio" === $widget ) $attr["type"] = "radio";
            elseif ( "dropdown" === $widget ) $attr["dropdown"] = true;
            elseif ( "editor" === $widget ) $attr["editor"] = true;
            
            switch( $widget )
            {
                case 'empty':       $out = self::widget_empty($attr, $data); break;
                case 'separator':   $out = self::widget_separator($attr, $data); break;
                case 'delayable':   $out = self::widget_delayable($attr, $data); break;
                case 'icon':        $out = self::widget_icon($attr, $data); break;
                case 'dialog':      $out = self::widget_dialog($attr, $data); break;
                case 'link':        $out = self::widget_link($attr, $data); break;
                case 'button':      $out = self::widget_button($attr, $data); break;
                case 'label':       $out = self::widget_label($attr, $data); break;
                case 'suggestbox':
                case 'suggest':     $out = self::widget_suggest($attr, $data); break;
                case 'textbox':
                case 'text':        $out = self::widget_text($attr, $data); break;
                case 'editor':
                case 'textarea':    $out = self::widget_textarea($attr, $data); break;
                case 'date':        $out = self::widget_date($attr, $data); break;
                case 'time':        $out = self::widget_time($attr, $data); break;
                case 'checkbox':
                case 'radio':
                case 'control':     $out = self::widget_control($attr, $data); break;
                case 'switch':      $out = self::widget_switch($attr, $data); break;
                case 'dropdown':
                case 'selectbox':
                case 'select':      $out = self::widget_select($attr, $data); break;
                case 'menu':        $out = self::widget_menu($attr, $data); break;
                case 'table':       $out = self::widget_table($attr, $data); break;
                default: $out = ''; break;
            }
            }
        }
        return $out;
    }
    
    public static function widget_empty($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    public static function widget_separator($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return '<div class="widget-separator"></div>';
    }
    
    public static function widget_icon($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wclass = 'fa'; 
        if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (isset($attr['icon'])) $wclass .= ' fa-'.$attr['icon'];
        return "<i class=\"$wclass\" $wstyle></i>";
    }
    
    public static function widget_delayable($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'widget-delayable-overlay'; 
        if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wspinner = 'widget-spinner';
        $wspinner .= isset($attr['spinner']) ? " {$attr['spinner']}" : " widget-spinner-dots";
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra>
<div class="$wspinner"></div>
</div>
OUT;
    }
    
    public static function widget_dialog($attr, $data) 
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtitle = isset($data['title']) ? $data['title'] : '';
        $wbuttons = isset($attr['buttons']) ? $attr['buttons'] : ''; 
        $wcontent = isset($data['content']) ? $data['content'] : '';
        $wclass = 'widget-dialog'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wicon = '';
        if ( isset($attr['icon']) )
        {
            $wicon = "<i class=\"fa fa-{$attr['icon']}\"></i>";
        }
        if ( isset($attr["form"]) && $attr['form'] )
        {
            $wcontent = "<form id=\"{$wid}_form\">$wcontent</form>";
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra $wdata>
<div class="widget-dialog-title">$wicon$wtitle</div>
<div class="widget-dialog-content">$wcontent</div>
<div class="widget-dialog-buttons">$wbuttons</div>
</div>
OUT;
    }
    
    public static function widget_link($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $whref = $attr['href']; $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'widget-link'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wicon = '';
        if ( isset($attr['icon']) )
        {
            $wicon = "<i class=\"fa fa-{$attr['icon']}\"></i>";
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<a id="$wid" class="$wclass" $wstyle $wextra title="$wtitle" href="$whref" $wdata>$wicon$wtext</a>
OUT;
    }
    
    public static function widget_label($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wfor = $attr["for"];
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr["title"]) ? $attr['title'] : $wtext;
        $wclass = 'widget widget-label'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        if ( isset($attr['icon']) )
        {
            $wclass .= ' widget-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']}\"></i>" . $wtext;
        }
        elseif ( isset($attr['iconr']) )
        {
            $wclass .= ' widget-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']}\"></i>";
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<label id="$wid" for="$wfor" class="$wclass" title="$wtitle" $wstyle $wextra $wdata>$wtext</label>
OUT;
    }
    
    public static function widget_button($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'widget widget-button'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        if ( isset($attr['icon']) )
        {
            if ( empty($wtext) )  $wclass .= ' widget-icon-only';
            else $wclass .= ' widget-icon';
            $wtext = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>" . $wtext;
        }
        elseif ( isset($attr['iconr']) )
        {
            if ( empty($wtext) )  $wclass .= ' widget-icon-only';
            else $wclass .= ' widget-icon-right';
            $wtext = $wtext . "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
        }
        $wdata = self::attr_data($attr);
        if ( isset($attr['href']) )
        {
            $whref = $attr['href'];
            return <<<OUT
<a id="$wid" href="$whref" class="$wclass" $wstyle $wextra title="$wtitle" $wdata>$wtext</a>
OUT;
        }
        else
        {
            $wtype = isset($attr['type']) ? 'type="'.$attr['type'].'"' : '';
            return <<<OUT
<button id="$wid" $wtype class="$wclass" $wstyle $wextra title="$wtitle" $wdata>$wtext</button>
OUT;
        }
    }
    
    public static function widget_control($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wname = $attr["name"];
        $wtype = isset($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wchecked = isset($attr['checked']) && $attr['checked'] ? 'checked' : '';
        $wclass = 'widget widget-control'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        if ( "checkbox" === $wtype ) $wclass .= ' widget-checkbox';
        elseif ( "radio" === $wtype ) $wclass .= ' widget-radio';
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        return <<<OUT
<input type="$wtype" id="$wid" name="$wname" class="$wclass" $wstyle $wextra value="$wvalue" $wdata $wchecked /><label for="$wid" title="$wtitle">&nbsp;</label>
OUT;
    }
    
    public static function widget_switch($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wname = $attr["name"];
        $wtype = isset($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wchecked = isset($attr['checked']) && $attr['checked'] ? 'checked' : '';
        $wclass = "widget widget-switch"; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wreverse = isset($attr["reverse"])&&$attr["reverse"];
        $wiconon = '&nbsp;'; $wiconoff = '&nbsp;';
        if ( isset($attr["iconon"]) )
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconon"]}\"></i>";
        }
        elseif ( isset($attr["iconoff"]) )
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconoff"]} positive\"></i>";
        }
        if ( isset($attr["iconoff"]) )
        {
            $wiconoff = "<i class=\"fa fa-{$attr["iconoff"]}\"></i>";
        }
        elseif ( isset($attr["iconon"]) )
        {
            $wiconoff = "<i class=\"fa fa-{$attr["iconon"]} negative\"></i>";
        }
        if ( $wreverse ) 
        {
            $wclass .= ' reverse';
            $wstates = "<label for=\"$wid\" class=\"widget-switch-off\">$wiconoff</label><label for=\"$wid\" class=\"widget-switch-on\">$wiconon</label>";
        }
        else
        {
            $wstates = "<label for=\"$wid\" class=\"widget-switch-on\">$wiconon</label><label for=\"$wid\" class=\"widget-switch-off\">$wiconoff</label>";
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<span class="$wclass" title="$wtitle" $wstyle>
<input type="$wtype" id="$wid" name="$wname" class="widget-switch-button" value="$wvalue" $wextra $wdata $wchecked />
$wstates
<span class="widget-switch-handle widget-state-default"></span>
</span>
OUT;
    }
    
    public static function widget_text($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        // text, number, email, url, tel etc..
        $wtype = isset($attr["type"]) ? $attr["type"] : 'text';
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        if ( !empty($wicon) )
            return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="$wtype" id="$wid" name="$wname" title="$wtitle" class="$wclass" $wextra placeholder="$wplaceholder" value="$wvalue" $wdata />
$wicon
</span>
OUT;
        else
            return <<<OUT
<input type="$wtype" id="$wid" name="$wname" title="$wtitle" class="$wclass" $wstyle $wextra placeholder="$wplaceholder" value="$wvalue" $wdata />
OUT;
    }
    
    public static function widget_suggest($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text widget-suggest'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wajax = $attr["ajax"];
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i id=\"$wid-spinner\" class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i id=\"$wid-spinner\" class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        else
        {
            $wicon = "<span class=\"fa-wrapper\"><i id=\"$wid-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        $script = <<<SCRIPT
jQuery(function(\$){
var \$el = \$('#$wid'), suggest = \$el.parent();
\$el.remoteList({
    minLength: 2,
    maxLength: -1,
    source: function(value, response) {
        suggest.addClass('ajax');
        \$.ajax({
            url: "$wajax",
            method: "POST",
            data: {suggest: value},
            dataType: "json",
            success: function( data ){
                suggest.removeClass('ajax');
                response(data);
            }
        });
    },
    select: function( ) {
        console.log(\$el.remoteList('selectedOption'), \$el.remoteList('selectedData'))
    }
});
});
SCRIPT;
        self::enqueue('scripts', "widget-suggest-$wid", array($script), array('jquery.remote-list'));
        return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="text" data-list-highlight="true" data-list-value-completion="true" id="$wid" name="$wname" title="$wtitle" class="$wclass" $wextra placeholder="$wplaceholder" value="$wvalue" $wdata />
$wicon
</span>
OUT;
    }
    
    public static function widget_textarea($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        if ( isset($attr['editor']) && $attr['editor'] ) 
        {
            $wclass = 'widget widget-editor'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
            $wstyle = isset($attr["style"]) ? $attr["style"] : '';
            $weditor = isset($attr['editor_cfg']) ? json_encode($attr['editor_cfg']) : '';
            $script = <<<SCRIPT
jQuery(function(\$){
\$('#$wid').trumbowyg($weditor);
\$('#$wid').closest('.trumbowyg-box').addClass('widget widget-editor-box').attr("style","$wstyle");
});
SCRIPT;
            self::enqueue('scripts', "widget-editor-$wid", array($script), array('trumbowyg'));
            $wstyle = '';
        }
        else
        {
            $wclass = 'widget widget-textarea'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
            $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        }
        return <<<OUT
<textarea id="$wid" name="$wname" title="$wtitle" class="$wclass" $wstyle $wextra placeholder="$wplaceholder" $wdata>$wvalue</textarea>
OUT;
    }
    
    public static function widget_date($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text widget-date'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wformat = isset($attr["format"]) ? $attr["format"] : 'Y-m-d';
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $wicon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        else
        {
            $wicon = "<span class=\"fa-wrapper\"><i class=\"fa fa-calendar\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        $script = <<<SCRIPT
jQuery(function(\$){
\$('#$wid').pikaday({format:"$wformat",encoder:Pikaday.date_encoder,decoder:Pikaday.date_decoder});
});
SCRIPT;
        self::enqueue('scripts', "widget-pikaday-$wid", array($script), array('jquery.pikaday'));
        return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="text" id="$wid" name="$wname" title="$wtitle" class="$wclass" placeholder="$wplaceholder" value="$wvalue" $wextra $wdata />
$wicon
</span>
OUT;
    }
    
    public static function widget_time($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wformat = isset($attr['format']) ? explode(":", $attr['format']) : array("h","m","s");
        if (isset($data['value'])) 
        {
            $wvalue = is_array($data['value']) ? $data['value'] : explode(':',$data['value']);
            while ( count($wvalue) < 3 ) $wvalue[] = "00";
        }
        else
        {
            $wvalue = array("00", "00", "00");
        }
        $wclass = 'widget widget-time'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        $time_options = array(
            'h'=>array(),
            'm'=>array(),
            's'=>array()
        );
        for($i=0; $i<60; $i++)
        {
            $tt = $i<10 ? '0'.$i : ''.$i;
            foreach($wformat as $p=>$f)
            {
                if ( 'h' === $f && $i>=24 ) continue;
                $selected = $tt === $wvalue[$p] ? 'selected="selected"' : '';
                $time_options[$f][] = '<option value="'.$tt.'" '.$selected.'>'.$tt.'</option>';
            }
        }
        $wtimes = array();
        foreach($wformat as $t)
        {
            $wtimes[] = '<select class="widget-time-component" id="'.$wid.'_'.$t.'" name="'.$wname.'['.$t.']">'.implode('',$time_options[$t]).'</select>';
        }
        $wtimes = implode('<span class="widget-time-sep">:</span>', $wtimes);
        return <<<OUT
<span class="$wclass" $wstyle $wextra $wdata>
$wtimes
</span>
OUT;
    }
    
    public static function widget_select($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wname = $attr["name"];
        $wdropdown = isset($attr['dropdown']) && $attr['dropdown'];
        if ( $wdropdown )
            $wclass = "widget widget-dropdown widget-state-default";
        else
            $wclass = "widget widget-select"; 
        if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wselected = isset($data['selected']) ? (array)$data['selected'] : array();
        $woptions = '';
        foreach($data['options'] as $opt)
        {
            if (is_array($opt))
            {
                $key = array_shift(array_keys($opt));
                $val = $opt[$key];
            }
            else
            {
                $key = $opt;
                $val = $opt;
            }
            $selected = in_array($key, $wselected) ? 'selected="selected"' : '';
            $woptions .= "<option value=\"$key\" $selected>$val</option>";
        }
        $wdata = self::attr_data($attr);
        if ( $wdropdown )
            return <<<OUT
<span class="$wclass" $wstyle>
<select id="$wid" name="$wname" class="widget-dropdown-select widget-state-default" $wextra $wdata>
$woptions
</select>
</span>
OUT;
        else
            return <<<OUT
<select id="$wid" name="$wname" class="$wclass" $wstyle $wextra $wdata>
$woptions
</select>
OUT;
    }
    
    public static function widget_menu($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wmenu = $data['menu'];
        $wclass = 'widget widget-dropdown-menu'; if ( isset($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra $wdata>$wmenu</div>
OUT;
    }
    
    public static function widget_table($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'widget widget-table'; 
        if ( !isset($attr['stripped']) || $attr['stripped'] ) $wclass .= ' stripped';
        if ( !isset($attr['responsive']) || $attr['responsive'] ) $wclass .= ' responsive';
        if ( isset($attr['class']) ) $wclass .= ' '.$attr['class'];
        $wstyle = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = isset($attr["extra"]) ? $attr["extra"] : '';
        $wcolumns = '';
        $data_cols = $data['columns'];
        $column_keys = array_keys($data_cols);
        $column_values = array_values($data_cols);
        foreach($column_values as $c=>$column)
        {
            $wcolumns .= "<th data-key=\"{$column_keys[$c]}\">".$column."</th>";
        }
        $wcolumns = "<tr>$wcolumns</tr>";
        $wrows = '';
        foreach($data['rows'] as $row)
        {
            $rowv = array_values($row);
            $wrows .= "\n" . "<tr>";
            foreach($column_values as $c=>$column)
            {
                $wrows .= "<td data-column=\"".$column."\">{$rowv[$c]}</td>";
            }
            $wrows .= "</tr>";
        }
        $wdata = self::attr_data($attr);
        $wdataTable = isset($attr['dataTable']);
        if ( $wdataTable )
        {
            $woptions = is_array($attr['dataTable']) ? json_encode($attr['dataTable']) : '';
            $wcontrols = array(
            "\$('#{$wid}_filter').find('input').addClass('widget-text');"
            ,"\$('#{$wid}_length').find('select').addClass('widget-select');"
            );
            if ( isset($attr['controls']) ) 
            {
                $ctrls = (array)$attr['controls'];
                foreach($ctrls as $ctrl)
                {
                    $wcontrols[] = '$(".widget-table-controls", "#'.$wid.'_wrapper").append($("'.str_replace('"','\\"',$ctrl).'"));';
                }
            }
            $wcontrols = implode("\n", $wcontrols);
            $script = <<<SCRIPT
jQuery(function(\$){
\$('#$wid').dataTable($woptions).on('change', 'input.select_row', function( ){ 
    if ( this.checked ) \$(this).closest('tr').addClass('selected');
    else \$(this).closest('tr').removeClass('selected');
});
\$('#$wid').closest(".dataTables_wrapper").addClass("widget-table-wrapper");
$wcontrols
});
SCRIPT;
            self::enqueue('scripts', "widget-datatable-$wid", array($script), array('jquery.dataTables'));
        }
        return <<<OUT
<table id="$wid" class="$wclass" $wstyle $wextra $wdata>
<thead>$wcolumns</thead>
<tbody>$wrows</tbody>
</table>
OUT;
    }
}
}