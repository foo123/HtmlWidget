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
    
    public static function assets()
    {
        return array(
         array('scripts', 'htmlwidgets.js', '/widget/js/htmlwidgets.js', array("jquery"))
        ,array('styles', 'htmlwidgets.css', '/widget/css/htmlwidgets.css', array("responsive.css", "font-awesome.css","htmlwidgets.js"))
        ,array('styles', 'trumbowyg.css', '/widget/css/trumbowyg.min.css')
        ,array('scripts', 'trumbowyg', '/widget/js/trumbowyg.min.js', array('trumbowyg.css','jquery'))
        ,array('styles', 'jquery.dataTables.css', '/widget/css/jquery.dataTables.css')
        ,array('scripts', 'jquery.dataTables', '/widget/js/jquery.dataTables.js', array('jquery.dataTables.css', 'jquery'))
        ,array('styles', 'jquery.pikaday.css', '/widget/css/jquery.pikaday.css')
        ,array('scripts', 'jquery.pikaday', '/widget/js/jquery.pikaday.js', array('jquery.pikaday.css', 'jquery'))
        ,array('scripts', 'jquery.remote-list', '/widget/js/jquery.remote-list.js', array('jquery'))
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
        elseif ( $widget && isset(self::$widgets['wi_'.$widget]) )
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
                case 'suggest':
                case 'suggestbox':  $out = self::widget_suggest($attr, $data); break;
                case 'text':
                case 'textbox':     $out = self::widget_text($attr, $data); break;
                case 'textarea':    $out = self::widget_textarea($attr, $data); break;
                case 'editor':      $out = self::widget_editor($attr, $data); break;
                case 'date':        $out = self::widget_date($attr, $data); break;
                case 'time':        $out = self::widget_time($attr, $data); break;
                case 'checkbox':    $out = self::widget_checkbox($attr, $data); break;
                case 'radio':       $out = self::widget_radio($attr, $data); break;
                case 'switch':      $out = self::widget_switch($attr, $data); break;
                case 'select':
                case 'selectbox':
                case 'dropdown':    $out = self::widget_select($attr, $data); break;
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
        $class = 'fa'; 
        if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (isset($attr['icon'])) $class .= ' fa-'.$attr['icon'];
        return "<i class=\"$class\" $style></i>";
    }
    
    public static function widget_delayable($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $class = 'widget-delayable-overlay'; 
        if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $widget_spinner = 'widget-spinner';
        $widget_spinner .= isset($attr['spinner']) ? " {$attr['spinner']}" : " widget-spinner-dots";
        return <<<OUT
<div id="$id" class="$class" $style $extra>
<div class="$widget_spinner"></div>
</div>
OUT;
    }
    
    public static function widget_dialog($attr, $data) 
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $title = isset($data['title']) ? $data['title'] : '';
        $buttons = isset($attr['buttons']) ? $attr['buttons'] : ''; 
        $content = isset($data['content']) ? $data['content'] : '';
        $class = 'widget-dialog'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $icon = '';
        if ( isset($attr['icon']) )
        {
            $icon = "<i class=\"fa fa-{$attr['icon']}\"></i>";
        }
        if ( isset($attr["form"]) && $attr['form'] )
        {
            $content = "<form id=\"{$id}_form\">$content</form>";
        }
        $data_attr = self::attr_data($attr);
        return <<<OUT
<div id="$id" class="$class" $style $extra $data_attr>
<div class="widget-dialog-title">$icon$title</div>
<div class="widget-dialog-content">$content</div>
<div class="widget-dialog-buttons">$buttons</div>
</div>
OUT;
    }
    
    public static function widget_link($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $href = $attr['href']; $text = isset($data['text']) ? $data['text'] : '';
        $title = isset($data['title']) ? $data['title'] : $text;
        $class = 'widget-link'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $icon = '';
        if ( isset($attr['icon']) )
        {
            $icon = "<i class=\"fa fa-{$attr['icon']}\"></i>";
        }
        $data_attr = self::attr_data($attr);
        return <<<OUT
<a id="$id" class="$class" $style $extra title="$title" href="$href" $data_attr>$icon$text</a>
OUT;
    }
    
    public static function widget_label($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $for = $attr["for"];
        $text = isset($data['text']) ? $data['text'] : '';
        $class = 'widget widget-label'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        if ( isset($attr['icon']) )
        {
            $class .= ' widget-icon';
            $text = "<i class=\"fa fa-{$attr['icon']}\"></i>" . $text;
        }
        elseif ( isset($attr['iconr']) )
        {
            $class .= ' widget-icon-right';
            $text = $text . "<i class=\"fa fa-{$attr['iconr']}\"></i>";
        }
        $data_attr = self::attr_data($attr);
        return <<<OUT
<label id="$id" for="$for" class="$class" $style $extra $data_attr>$text</label>
OUT;
    }
    
    public static function widget_button($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $text = isset($data['text']) ? $data['text'] : '';
        $title = isset($data['title']) ? $data['title'] : $text;
        $class = 'widget widget-button'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        if ( isset($attr['icon']) )
        {
            $class .= ' widget-icon';
            $text = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>" . $text;
        }
        elseif ( isset($attr['iconr']) )
        {
            $class .= ' widget-icon-right';
            $text = $text . "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
        }
        $data_attr = self::attr_data($attr);
        if ( isset($attr['href']) )
        {
            $href = $attr['href'];
            return <<<OUT
<a id="$id" href="$href" class="$class" $style $extra title="$title" $data_attr>$text</a>
OUT;
        }
        else
        {
            $type = isset($attr['type']) ? 'type="'.$attr['type'].'"' : '';
            return <<<OUT
<button id="$id" $type class="$class" $style $extra title="$title" $data_attr>$text</button>
OUT;
        }
    }
    
    public static function widget_checkbox($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "1";
        $checked = isset($attr['checked']) && $attr['checked'] ? 'checked' : '';
        $class = 'widget widget-checkbox'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        return <<<OUT
<input type="checkbox" id="$id" name="$name" class="$class" $style $extra value="$value" $data_attr $checked /><label for="$id">&nbsp;</label>
OUT;
    }
    
    public static function widget_radio($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "1";
        $checked = isset($attr['checked']) && $attr['checked'] ? 'checked' : '';
        $class = 'widget widget-radio'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        return <<<OUT
<input type="radio" id="$id" name="$name" class="$class" $style $extra value="$value" $data_attr $checked /><label for="$id">&nbsp;</label>
OUT;
    }
    
    public static function widget_text($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "";
        $placeholder = isset($attr['placeholder']) ? $attr['placeholder'] : "";
        $class = 'widget widget-text'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        // text, number, email, url, tel etc..
        $type = isset($attr["type"]) ? $attr["type"] : 'text';
        $icon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $data_attr = self::attr_data($attr);
        if ( !empty($icon) )
            return <<<OUT
<span class="$wrapper_class" $style>
<input type="$type" id="$id" name="$name" class="$class" $extra placeholder="$placeholder" value="$value" $data_attr />
$icon
</span>
OUT;
        else
            return <<<OUT
<input type="$type" id="$id" name="$name" class="$class" $style $extra placeholder="$placeholder" value="$value" $data_attr />
OUT;
    }
    
    public static function widget_suggest($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "";
        $placeholder = isset($attr['placeholder']) ? $attr['placeholder'] : "";
        $class = 'widget widget-text widget-suggest'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $ajax = $attr["ajax"];
        $icon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i id=\"$id-spinner\" class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i id=\"$id-spinner\" class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        else
        {
            $icon = "<span class=\"fa-wrapper\"><i id=\"$id-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $script = <<<SCRIPT
jQuery(function(\$){
var \$el = \$('#$id'), suggest = \$el.parent();
\$el.remoteList({
    minLength: 2,
    maxLength: -1,
    source: function(value, response) {
        suggest.addClass('ajax');
        \$.ajax({
            url: "$ajax",
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
        self::enqueue('scripts', "widget-suggest-$id", array($script), array('jquery.remote-list'));
        $data_attr = self::attr_data($attr);
        return <<<OUT
<span class="$wrapper_class" $style>
<input type="text" data-list-highlight="true" data-list-value-completion="true" id="$id" name="$name" class="$class" $extra placeholder="$placeholder" value="$value" $data_attr />
$icon
</span>
OUT;
    }
    
    public static function widget_textarea($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "";
        $placeholder = isset($attr['placeholder']) ? $attr['placeholder'] : "";
        $class = 'widget widget-textarea'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        return <<<OUT
<textarea id="$id" name="$name" class="$class" $style $extra placeholder="$placeholder" $data_attr>$value</textarea>
OUT;
    }
    
    public static function widget_editor($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "";
        $placeholder = isset($attr['placeholder']) ? $attr['placeholder'] : "";
        $class = 'widget widget-editor'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? '"'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $editor_cfg = '';
        if ( isset($attr['editor']) ) $editor_cfg = json_encode($attr['editor']);
        $script = <<<SCRIPT
jQuery(function(\$){
\$('#$id').trumbowyg($editor_cfg);
\$('#$id').closest('.trumbowyg-box').addClass('widget widget-editor-box').attr("style",$style);
});
SCRIPT;
        self::enqueue('scripts', "widget-editor-$id", array($script), array('trumbowyg'));
        $data_attr = self::attr_data($attr);
        return <<<OUT
<textarea id="$id" name="$name" class="$class" $extra placeholder="$placeholder" $data_attr>$value</textarea>
OUT;
    }
    
    public static function widget_date($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "";
        $placeholder = isset($attr['placeholder']) ? $attr['placeholder'] : "";
        $class = 'widget widget-text widget-date'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $icon = '';
        $wrapper_class = 'widget-wrapper';
        if ( isset($attr['icon']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        elseif ( isset($attr['iconr']) )
        {
            $icon = "<span class=\"fa-wrapper\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        else
        {
            $icon = "<span class=\"fa-wrapper\"><i class=\"fa fa-calendar\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $script = <<<SCRIPT
jQuery(function(\$){
\$('#$id').pikaday();
});
SCRIPT;
        self::enqueue('scripts', "widget-pikaday-$id", array($script), array('jquery.pikaday'));
        $data_attr = self::attr_data($attr);
        return <<<OUT
<span class="$wrapper_class" $style>
<input type="text" id="$id" name="$name" class="$class" placeholder="$placeholder" value="$value" $extra $data_attr />
$icon
</span>
OUT;
    }
    
    public static function widget_time($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $format = isset($attr['format']) ? explode(":", $attr['format']) : array("h","m","s");
        if (isset($data['value'])) 
        {
            $value = is_array($data['value']) ? $data['value'] : explode(':',$data['value']);
            while ( count($value) < 3 ) $value[] = "00";
        }
        else
        {
            $value = array("00", "00", "00");
        }
        $class = 'widget widget-time'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        $time_options = array(
            'h'=>array(),
            'm'=>array(),
            's'=>array()
        );
        for($i=0; $i<60; $i++)
        {
            $tt = $i<10 ? '0'.$i : ''.$i;
            foreach($format as $p=>$f)
            {
                if ( 'h' === $f && $i>=24 ) continue;
                $selected = $tt === $value[$p] ? 'selected="selected"' : '';
                $time_options[$f][] = '<option value="'.$tt.'" '.$selected.'>'.$tt.'</option>';
            }
        }
        $times = array();
        foreach($format as $t)
        {
            $times[] = '<select class="widget-time-component" id="'.$id.'_'.$t.'" name="'.$name.'['.$t.']">'.implode('',$time_options[$t]).'</select>';
        }
        $times = implode('<span class="widget-time-sep">:</span>', $times);
        return <<<OUT
<span class="$class" $style $extra $data_attr>
$times
</span>
OUT;
    }
    
    public static function widget_switch($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $value = isset($data['value']) ? $data['value'] : "1";
        $checked = isset($attr['checked']) && $attr['checked'] ? 'checked' : '';
        $class = "widget widget-switch"; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        return <<<OUT
<span class="$class" $style>
<input type="checkbox" id="$id" name="$name" class="widget-switch-button" value="$value" $extra $data_attr $checked />
<label for="$id" class="widget-switch-off">&nbsp;</label><label for="$id" class="widget-switch-on">&nbsp;</label>
<span class="widget-switch-handle widget-state-default"></span>
</span>
OUT;
    }
    
    public static function widget_select($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $name = $attr["name"];
        $dropdown = isset($attr['dropdown']) && $attr['dropdown'];
        if ( $dropdown )
            $class = "widget widget-dropdown widget-state-default";
        else
            $class = "widget widget-select"; 
        if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $selected_option = isset($data['selected']) ? (array)$data['selected'] : array();
        $options = '';
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
            $selected = in_array($key, $selected_option) ? 'selected="selected"' : '';
            $options .= "<option value=\"$key\" $selected>$val</option>";
        }
        $data_attr = self::attr_data($attr);
        if ( $dropdown )
            return <<<OUT
<span class="$class" $style>
<select id="$id" name="$name" class="widget-dropdown-select widget-state-default" $extra $data_attr>
$options
</select>
</span>
OUT;
        else
            return <<<OUT
<select id="$id" name="$name" class="$class" $style $extra $data_attr>
$options
</select>
OUT;
    }
    
    public static function widget_menu($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid(); $menu = $data['menu'];
        $class = 'widget widget-dropdown-menu'; if ( isset($attr["class"]) ) $class .= ' '.$attr["class"];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $data_attr = self::attr_data($attr);
        return <<<OUT
<div id="$id" class="$class" $style $extra $data_attr>$menu</div>
OUT;
    }
    
    public static function widget_table($attr, $data)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $id = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $class = 'widget widget-table'; 
        if ( !isset($attr['stripped']) || $attr['stripped'] ) $class .= ' stripped';
        if ( !isset($attr['responsive']) || $attr['responsive'] ) $class .= ' responsive';
        if ( isset($attr['class']) ) $class .= ' '.$attr['class'];
        $style = isset($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $extra = isset($attr["extra"]) ? $attr["extra"] : '';
        $columns = '';
        $data_cols = $data['columns'];
        $column_keys = array_keys($data_cols);
        $column_values = array_values($data_cols);
        foreach($column_values as $c=>$column)
        {
            $columns .= "<th data-key=\"{$column_keys[$c]}\">".$column."</th>";
        }
        $columns = "<tr>$columns</tr>";
        $rows = '';
        foreach($data['rows'] as $row)
        {
            $rowv = array_values($row);
            $rows .= "\n" . "<tr>";
            foreach($column_values as $c=>$column)
            {
                $rows .= "<td data-column=\"".$column."\">{$rowv[$c]}</td>";
            }
            $rows .= "</tr>";
        }
        $dataTable = isset($attr['dataTable']);
        if ( $dataTable )
        {
            $dtOptions = is_array($attr['dataTable']) ? json_encode($attr['dataTable']) : '';
            $table_controls = array(
            "\$('#{$id}_filter').find('input').addClass('widget-text');"
            ,"\$('#{$id}_length').find('select').addClass('widget-select');"
            );
            if ( isset($attr['controls']) ) 
            {
                $ctrls = (array)$attr['controls'];
                foreach($ctrls as $ctrl)
                {
                    $table_controls[] = '$(".widget-table-controls", "#'.$id.'_wrapper").append($("'.str_replace('"','\\"',$ctrl).'"));';
                }
            }
            $table_controls = implode("\n", $table_controls);
            $script = <<<SCRIPT
jQuery(function(\$){
\$('#$id').dataTable($dtOptions).on('change', 'input.select_row', function( ){ 
    if ( this.checked ) \$(this).closest('tr').addClass('selected');
    else \$(this).closest('tr').removeClass('selected');
});
\$('#$id').closest(".dataTables_wrapper").addClass("widget-table-wrapper");
$table_controls
});
SCRIPT;
            self::enqueue('scripts', "widget-datatable-$id", array($script), array('jquery.dataTables'));
        }
        $data_attr = self::attr_data($attr);
        return <<<OUT
<table id="$id" class="$class" $style $extra $data_attr>
<thead>$columns</thead>
<tbody>$rows</tbody>
</table>
OUT;
    }
}
}