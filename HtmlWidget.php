<?php
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
if ( !class_exists('HtmlWidget') )
{
class HtmlWidget
{
    const VERSION = "0.1";
    public static $enqueuer = null;
    public static $widgets = array( );
    
    public static function enqueueAssets( $enqueuer=null )
    {
        if ( $enqueuer && is_callable($enqueuer) ) self::$enqueuer = $enqueuer;
        else self::$enqueuer = null;
    }
    
    public static function enqueue( $type, $id, $asset=null, $deps=array() )
    {
        if ( self::$enqueuer ) 
            call_user_func(self::$enqueuer, $type, $id, $asset, $deps);
    }
    
    public static function assets( $base='', $full=true )
    {
        if ( empty($base) ) $base = '';
        $base = $base . ('/' === substr($base, -1)  ? 'assets/' : '/assets/');
        $assets = array(
         array('styles', 'htmlwidgets.css', $base.'css/htmlwidgets.min.css', array('responsive.css','font-awesome.css'))
        ,array('scripts', 'htmlwidgets.js', $base.'js/htmlwidgets.min.js', array('jquery'))
        );
        if ( true === $full )
        {
            // DataTables
            $assets[] = array('styles', 'jquery.dataTables.css', $base.'css/jquery.dataTables.min.css');
            $assets[] = array('scripts', 'jquery.dataTables', $base.'js/jquery.dataTables.min.js', array('jquery'));
            
            // CodeMirror
            $assets[] = array('styles', 'codemirror.css', $base.'css/codemirror.min.css');
            $assets[] = array('scripts', 'codemirror.js', $base.'js/codemirror.min.js');
            
            $assets[] = array('scripts', 'codemirror-multiplex', $base.'js/addon/mode/multiplex.js', array('codemirror.js'));
            $assets[] = array('scripts', 'codemirror-comment', $base.'js/addon/comment/comment.js', array('codemirror.js'));
            
            $assets[] = array('scripts', 'codemirror-xml', $base.'js/mode/xml.js', array('codemirror.js'));
            $assets[] = array('scripts', 'codemirror-javascript', $base.'js/mode/javascript.js', array('codemirror.js'));
            $assets[] = array('scripts', 'codemirror-css', $base.'js/mode/css.js', array('codemirror.js'));
            
            $assets[] = array('styles', 'codemirror-fold.css', $base.'js/addon/fold/foldgutter.css', array('codemirror.css'));
            $assets[] = array('scripts', 'codemirror-fold-gutter', $base.'js/addon/fold/foldgutter.js', array('codemirror.js'));
            $assets[] = array('scripts', 'codemirror-fold-code', $base.'js/addon/fold/foldcode.js', array('codemirror-fold-gutter'));
            $assets[] = array('scripts', 'codemirror-fold-comment', $base.'js/addon/fold/comment-fold.js', array('codemirror-fold-gutter','codemirror-fold-code'));
            $assets[] = array('scripts', 'codemirror-fold-brace', $base.'js/addon/fold/brace-fold.js', array('codemirror-fold-gutter','codemirror-fold-code'));
            $assets[] = array('scripts', 'codemirror-fold-indent', $base.'js/addon/fold/indent-fold.js', array('codemirror-fold-gutter','codemirror-fold-code'));
            $assets[] = array('scripts', 'codemirror-fold-xml', $base.'js/addon/fold/xml-fold.js', array('codemirror-fold-gutter','codemirror-fold-code'));
            
            $assets[] = array('styles', 'codemirror-styles', $base.'js/addon/fold/foldgutter.css', array('codemirror.css'));
            $assets[] = array('scripts', 'codemirror', $base.'js/mode/htmlmixed.js', array('codemirror.js','codemirror-multiplex','codemirror-comment','codemirror-xml','codemirror-javascript','codemirror-css','codemirror-fold-comment','codemirror-fold-brace','codemirror-fold-xml','codemirror-fold-indent'));
            
            // Trumbowyg
            $assets[] = array('styles', 'trumbowyg-styles', $base.'css/trumbowyg.min.css');
            $assets[] = array('scripts', 'trumbowyg', $base.'js/trumbowyg.min.js', array('jquery'));
        }
        return $assets;
    }
    
    public static function uuid( $namespace="widget" )
    {
        static $cnt = 0;
        return implode("_", array($namespace, time(), ++$cnt));
    }
    
    public static function attr_data( $attr )
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
    
    public static function addWidget( $widget, $renderer )
    {
        if ( $widget && $renderer && is_callable($renderer) )
            self::$widgets['wi_'.$widget] = $renderer;
        elseif ( $widget && false === $renderer && isset(self::$widgets['wi_'.$widget]) )
            unset(self::$widgets['wi_'.$widget]);
    }
    
    public static function widget( $widget, $attr=array(), $data=array() )
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
            elseif ( "syntax-editor" === $widget || "source-editor" === $widget || "syntax" === $widget || "source" === $widget || "highlight-editor" === $widget || "highlighter" === $widget ) $attr["syntax-editor"] = true;
            elseif ( "wysiwyg-editor" === $widget || "wysiwyg" === $widget || "rich-editor" === $widget || "rich" === $widget || "editor" === $widget ) $attr["wysiwyg-editor"] = true;
            
            switch( $widget )
            {
                case 'empty':       $out = self::widget_empty($attr, $data); break;
                case 'separator':   $out = self::widget_separator($attr, $data); break;
                case 'icon':        $out = self::widget_icon($attr, $data); break;
                case 'delayable':   $out = self::widget_delayable($attr, $data); break;
                case 'disabable':   $out = self::widget_disabable($attr, $data); break;
                case 'morphable':   $out = self::widget_morphable($attr, $data); break;
                case 'pages':       $out = self::widget_pages($attr, $data); break;
                case 'tabs':        $out = self::widget_tabs($attr, $data); break;
                case 'accordeon':   $out = self::widget_accordeon($attr, $data); break;
                case 'panel':       $out = self::widget_panel($attr, $data); break;
                case 'dialog':      $out = self::widget_dialog($attr, $data); break;
                case 'tooltip':     $out = self::widget_tooltip($attr, $data); break;
                case 'link':        $out = self::widget_link($attr, $data); break;
                case 'button':      $out = self::widget_button($attr, $data); break;
                case 'label':       $out = self::widget_label($attr, $data); break;
                case 'suggestbox':
                case 'suggest':     $out = self::widget_suggest($attr, $data); break;
                case 'textbox':
                case 'textfield':
                case 'text':        $out = self::widget_text($attr, $data); break;
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
    
    public static function widget_empty( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    public static function widget_separator( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wclass = 'widget-separator'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        return "<div class=\"$wclass\" $wstyle></div>";
    }
    
    public static function widget_icon( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wclass = 'fa'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if ( !empty($attr['icon']) ) $wclass .= ' fa-'.$attr['icon'];
        return "<i class=\"$wclass\" $wstyle></i>";
    }
    
    public static function widget_delayable( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        self::enqueue('scripts', 'htmlwidgets.js');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'widget-delayable-overlay'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wspinner = 'widget-spinner';
        $wspinner .= !empty($attr['spinner']) ? " {$attr['spinner']}" : " widget-spinner-dots";
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra>
<div class="$wspinner"></div>
</div>
OUT;
    }
    
    public static function widget_disabable( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        self::enqueue('scripts', 'htmlwidgets.js');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'widget-disabable-overlay'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra>
</div>
OUT;
    }
    
    public static function widget_morphable( $attr, $data )
    {
        //self::enqueue('styles', 'htmlwidgets.css');
        self::enqueue('scripts', 'htmlwidgets.js');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'widget-morphable'; 
        $wmodes = (array)$attr['modes'];
        $wmode_class = !empty($attr['mode']) ? $attr['mode'] : 'mode-${MODE}';
        $wshow_class = !empty($attr['show']) ? $attr['show'] : 'show-if-${MODE}';
        $whide_class = !empty($attr['hide']) ? $attr['hide'] : 'hide-if-${MODE}';
        $wselector = "#{$wid}.widget-morphable";
        $wshow_selector = array();
        $whide_selector = array();
        foreach($wmodes as $mode)
        {
            $mode_class = str_replace('${MODE}', $mode, $wmode_class);
            $whide_selector[] = $wselector . '.' . $mode_class . ' .' . str_replace('${MODE}', $mode, $whide_class);
            $wshow_selector[] = $wselector . '.' . $mode_class . ' .' . str_replace('${MODE}', $mode, $wshow_class);
            
            foreach($wmodes as $mode2)
            {
                if ( $mode === $mode2 ) continue;
                $whide_selector[] = $wselector . '.' . $mode_class . ' .' . str_replace('${MODE}', $mode2, $wshow_class) . ':not(.' . str_replace('${MODE}', $mode, $wshow_class) . ')';
                $wshow_selector[] = $wselector . '.' . $mode_class . ' .' . str_replace('${MODE}', $mode2, $whide_class) . ':not(.' . str_replace('${MODE}', $mode, $whide_class) . ')';
            }
        }
        $wstyle = '';
        $wstyle .= implode(',',$whide_selector) . '{display: none !important}';
        $wstyle .= implode(',',$wshow_selector) . '{display: block}';
        self::enqueue('styles', "widget-morphable-$wid", array($wstyle), array());
        return '';
    }
    
    public static function widget_panel( $attr, $data )
    {
        return '';
    }
    
    public static function widget_accordeon( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $witems = (array)$attr['items'];
        
        $wctrl = "ctrl_{$wid}";
        $wcontrollers = "<input name=\"{$wctrl}\" type=\"radio\" id=\"item_" . implode( "\" class=\"widget-transition-controller widget-{$wctrl}-controller\"/><input name=\"{$wctrl}\" type=\"radio\" id=\"item_", $witems ) . "\" class=\"widget-transition-controller widget-{$wctrl}-controller\"/>";
        
        $wstyle = '';
        
        // de-activate
        $wselector = array();
        foreach ($witems as $witem)
            $wselector[] = ".widget-{$wctrl}-controller.widget-transition-controller:not(#item_{$witem}):checked ~ {$wcontext}#{$witem}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    max-height: 0;
    -webkit-transition: max-height .3s ease;
    -moz-transition: max-height .3s ease;
    -ms-transition: max-height .3s ease;
    -o-transition: max-height .3s ease;
    transition: max-height .3s ease;
}
OUT;
        // activate
        $wselector = array();
        foreach ($witems as $witem)
            $wselector[] = "#item_{$witem}.widget-{$wctrl}-controller.widget-transition-controller:checked ~ {$wcontext}#{$witem}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    max-height: 1500px;
    -webkit-transition: max-height .3s ease;
    -moz-transition: max-height .3s ease;
    -ms-transition: max-height .3s ease;
    -o-transition: max-height .3s ease;
    transition: max-height .3s ease;
}
OUT;
        self::enqueue('styles', "widget-accordeon-$wid", array($wstyle), array());
        return $wcontrollers;
    }
    
    public static function widget_tabs( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wtabs = (array)$attr['tabs'];
        //$wselected = !empty($data['selected']) ? $data['selected'] : 0;
        
        $wctrl = "ctrl_{$wid}";
        $wcontrollers = "<input name=\"{$wctrl}\" checked type=\"radio\" id=\"tab_" . implode( "\" class=\"widget-transition-controller widget-{$wctrl}-controller\"/><input name=\"{$wctrl}\" type=\"radio\" id=\"tab_", $wtabs ) . "\" class=\"widget-transition-controller widget-{$wctrl}-controller\"/>";
        
        $wstyle = '';
        
        // de-activate
        $wselector = array();
        foreach ($wtabs as $wtab)
            $wselector[] = ".widget-{$wctrl}-controller.widget-transition-controller:not(#tab_{$wtab}):checked ~ {$wcontext}#{$wtab}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: absolute;
    
    -webkit-animation-name: widget-fx-slideout;
    -moz-animation-name: widget-fx-slideout;
    -ms-animation-name: widget-fx-slideout;
    -o-animation-name: widget-fx-slideout;
    animation-name: widget-fx-slideout;
    
    -webkit-animation-timing-function: ease-out;
    -moz-animation-timing-function: ease-out;
    -ms-animation-timing-function: ease-out;
    -o-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
}
OUT;
        // activate
        $wselector = array();
        foreach ($wtabs as $wtab)
            $wselector[] = "#tab_{$wtab}.widget-{$wctrl}-controller.widget-transition-controller:checked ~ {$wcontext}#{$wtab}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: relative;
    z-index: 10;
    
    -webkit-animation-name: widget-fx-slidein;
    -moz-animation-name: widget-fx-slidein;
    -ms-animation-name: widget-fx-slidein;
    -o-animation-name: widget-fx-slidein;
    animation-name: widget-fx-slidein;
    
    -webkit-animation-timing-function: ease-in;
    -moz-animation-timing-function: ease-in;
    -ms-animation-timing-function: ease-in;
    -o-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
}
OUT;
        self::enqueue('styles', "widget-tabs-$wid", array($wstyle), array());
        return $wcontrollers;
    }
    
    public static function widget_pages( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wpages = (array)$attr['pages'];
        
        $wcontrollers = "<span id=\"page_" . implode( "\" class=\"widget-transition-controller widget-page-transition-controller\"></span><span id=\"page_", $wpages ) . "\" class=\"widget-transition-controller widget-page-transition-controller\"></span>";
        
        $wstyle = '';
        
        // main page
        $main_page = array_shift( $wpages );
        $wstyle .= <<<OUT
#{$main_page}
{
    position: relative;
    -webkit-transform: translateX(0px);
    -moz-transform: translateX(0px);
    -ms-transform: translateX(0px);
    -o-transform: translateX(0px);
    transform: translateX(0px);
}
.widget-page-transition-controller:not(#page_{$main_page}):target ~ {$wcontext}#{$main_page}
{
    position: absolute;
    
    -webkit-transform: translateX(-100%);
    -moz-transform: translateX(-100%);
    -ms-transform: translateX(-100%);
    -o-transform: translateX(-100%);
    transform: translateX(-100%);
    
    -webkit-transition: -webkit-transform .3s ease;
    -moz-transition: -moz-transform .3s ease;
    -ms-transition: -ms-transform .3s ease;
    -o-transition: -o-transform .3s ease;
    transition: transform .3s ease;
}
OUT;
        // rest pages
        $wselector = array();
        foreach ($wpages as $wpage)
            $wselector[] = "#page_{$wpage}.widget-page-transition-controller:target ~ {$wcontext}#{$wpage}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: relative;
    
    -webkit-transform: translateX(0px);
    -moz-transform: translateX(0px);
    -ms-transform: translateX(0px);
    -o-transform: translateX(0px);
    transform: translateX(0px);
    
    -webkit-transition: -webkit-transform .3s ease;
    -moz-transition: -moz-transform .3s ease;
    -ms-transition: -ms-transform .3s ease;
    -o-transition: -o-transform .3s ease;
    transition: transform .3s ease;
}
OUT;
        self::enqueue('styles', "widget-pages-$wid", array($wstyle), array());
        return $wcontrollers;
    }
    
    public static function widget_dialog( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtitle = isset($data['title']) ? $data['title'] : '';
        $wbuttons = !empty($attr['buttons']) ? $attr['buttons'] : ''; 
        $wcontent = !empty($data['content']) ? $data['content'] : '';
        $wclass = 'widget-dialog'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wicon = '';
        if ( !empty($attr['icon']) )
        {
            $wicon = "<i class=\"fa fa-{$attr['icon']}\"></i>";
        }
        if ( !empty($attr["form"]) && $attr['form'] )
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
    
    public static function widget_tooltip( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'widget-tooltip'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        if ( !empty($attr['icon']) )
        {
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        elseif ( !empty($attr['iconr']) )
        {
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        if ( !empty($attr['tooltip']) )
        {
            if ( 'top' === $attr['tooltip'] )
                $warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-bottom"></div>';
            elseif ( 'bottom' === $attr['tooltip'] )
                $warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-top"></div>';
            elseif ( 'right' === $attr['tooltip'] )
                $warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-left"></div>';
            else
                $warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-right"></div>';
        }
        else
        {
            $warrow = '<div class="widget-tooltip-arrow widget-tooltip-arrow-right"></div>';
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra title="$wtitle" $wdata>
$wtext
$warrow
</div>
OUT;
    }
    
    public static function widget_label( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wfor = isset($attr["for"]) ? 'for="'.$attr["for"].'"' : '';
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr["title"]) ? $attr['title'] : $wtext;
        $wclass = 'widget widget-label'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        if ( !empty($attr['icon']) )
        {
            $wclass .= ' widget-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            $wclass .= ' widget-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wdata = self::attr_data($attr);
        return <<<OUT
<label id="$wid" $wfor class="$wclass" title="$wtitle" $wstyle $wextra $wdata>$wtext</label>
OUT;
    }
    
    public static function widget_link( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'widget-link'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        if ( !empty($attr['icon']) )
        {
            $wclass .= ' widget-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            $wclass .= ' widget-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wdata = self::attr_data($attr);
        if ( isset($attr['for']))
        {
            $wfor = $attr['for'];
            return <<<OUT
<label id="$wid" class="$wclass" $wstyle $wextra title="$wtitle" for="$wfor" $wdata>$wtext</label>
OUT;
        }
        else
        {
            $whref = isset($attr['href']) ? $attr['href'] : '#'; 
            return <<<OUT
<a id="$wid" class="$wclass" $wstyle $wextra title="$wtitle" href="$whref" $wdata>$wtext</a>
OUT;
        }
    }
    
    public static function widget_button( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'widget widget-button'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        if ( !empty($attr['icon']) )
        {
            if ( empty($wtext) )  $wclass .= ' widget-icon-only';
            else $wclass .= ' widget-icon';
            $wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            if ( empty($wtext) )  $wclass .= ' widget-icon-only';
            else $wclass .= ' widget-icon-right';
            $wtext = $wtext . "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
        }
        $wdata = self::attr_data($attr);
        if ( isset($attr['for']) )
        {
            $wfor = $attr['for'];
            return <<<OUT
<label id="$wid" for="$wfor" class="$wclass" $wstyle $wextra title="$wtitle" $wdata>$wtext</label>
OUT;
        }
        elseif ( isset($attr['href']) )
        {
            $whref = $attr['href'];
            return <<<OUT
<a id="$wid" href="$whref" class="$wclass" $wstyle $wextra title="$wtitle" $wdata>$wtext</a>
OUT;
        }
        else
        {
            $wtype = isset($attr['type']) ? $attr['type'] : 'button';
            return <<<OUT
<button id="$wid" type="$wtype" class="$wclass" $wstyle $wextra title="$wtitle" $wdata>$wtext</button>
OUT;
        }
    }
    
    public static function widget_control( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wchecked = !empty($attr['checked']) ? 'checked' : '';
        $wclass = 'widget widget-control'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        if ( "checkbox" === $wtype ) $wclass .= ' widget-checkbox';
        elseif ( "radio" === $wtype ) $wclass .= ' widget-radio';
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wstate = '';
        if ( isset($attr['state-on']) ) $wstate .= " data-state-on=\"{$attr['state-on']}\"";
        if ( isset($attr['state-off']) ) $wstate .= " data-state-off=\"{$attr['state-off']}\"";
        $wdata = self::attr_data($attr);
        return <<<OUT
<input type="$wtype" id="$wid" $wname class="$wclass" $wstyle $wextra value="$wvalue" $wdata $wchecked /><label for="$wid" title="$wtitle" $wstate>&nbsp;</label>
OUT;
    }
    
    public static function widget_switch( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wvalue2 = isset($data['valueoff']) ? $data['valueoff'] : false;
        $wdual = false !== $wvalue2;
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wchecked = !empty($attr['checked']);
        $wclass = "widget widget-switch"; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wreverse = !empty($attr["reverse"]);
        $wiconon = '&nbsp;'; $wiconoff = '&nbsp;';
        if ( !empty($attr["iconon"]) && empty($attr["iconoff"]) )
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconon"]} not-negative\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconon"]} negative\"></i>";
        }
        elseif ( !empty($attr["iconoff"]) && empty($attr["iconon"]) )
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconoff"]} positive\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconoff"]} not-positive\"></i>";
        }
        elseif ( !empty($attr["iconon"]) && !empty($attr["iconoff"]) )
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconon"]}\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconoff"]}\"></i>";
        }
        $wdata = self::attr_data($attr);
        if ( $wdual )
        {
            // dual switch with separate on/off states
            $wclass .= ' dual';
            $wtype = 'radio';
            if ( $wchecked )
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\" widget-switch-state widget-switch-state-on\" value=\"$wvalue\" $wextra $wdata checked /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"widget-switch-state widget-switch-state-off\" value=\"$wvalue2\" $wextra $wdata />";
            }
            else
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\"widget-switch-state widget-switch-state-on\" value=\"$wvalue\" $wextra $wdata /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"widget-switch-state widget-switch-state-off\" value=\"$wvalue2\" $wextra $wdata checked />";
            }
            if ( $wreverse ) 
            {
                $wclass .= ' reverse';
                $wswitches = "<label for=\"{$wid}-off\" class=\"widget-switch-off\">$wiconoff</label><label for=\"{$wid}-on\" class=\"widget-switch-on\">$wiconon</label>";
            }
            else
            {
                $wswitches = "<label for=\"{$wid}-on\" class=\"widget-switch-on\">$wiconon</label><label for=\"{$wid}-off\" class=\"widget-switch-off\">$wiconoff</label>";
            }
        }
        else
        {
            // switch with one state for on/off
            if ( $wchecked ) $wchecked = 'checked';
            $wstates = "<input type=\"$wtype\" id=\"$wid\" $wname class=\"widget-switch-state\" value=\"$wvalue\" $wextra $wdata $wchecked />";
            if ( $wreverse ) 
            {
                $wclass .= ' reverse';
                $wswitches = "<label for=\"$wid\" class=\"widget-switch-off\">$wiconoff</label><label for=\"$wid\" class=\"widget-switch-on\">$wiconon</label>";
            }
            else
            {
                $wswitches = "<label for=\"$wid\" class=\"widget-switch-on\">$wiconon</label><label for=\"$wid\" class=\"widget-switch-off\">$wiconoff</label>";
            }
        }
        return <<<OUT
<span class="$wclass" title="$wtitle" $wstyle>
{$wstates}{$wswitches}
<span class="widget-switch-handle"></span>
</span>
OUT;
    }
    
    public static function widget_text( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        // text, number, email, url, tel etc..
        $wtype = !empty($attr["type"]) ? $attr["type"] : 'text';
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        if ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        if ( !empty($wicon) )
            return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="$wtype" id="$wid" $wname title="$wtitle" class="$wclass" $wextra placeholder="$wplaceholder" value="$wvalue" $wdata />
$wicon
</span>
OUT;
        else
            return <<<OUT
<input type="$wtype" id="$wid" $wname title="$wtitle" class="$wclass" $wstyle $wextra placeholder="$wplaceholder" value="$wvalue" $wdata />
OUT;
    }
    
    public static function widget_suggest( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text widget-suggest'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wajax = $attr["ajax"];
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
            $wicon .= "<span class=\"fa-wrapper right-fa widget-suggest-spinner\"><i id=\"$wid-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        elseif ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa widget-suggest-spinner\"><i id=\"$wid-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' widget-icon';
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        $script = <<<SCRIPT
jQuery(function(\$){
var \$el = \$('#$wid'), suggest = \$el.parent();
\$el.suggest({
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
        //console.log(\$el.suggest('selectedOption'), \$el.suggest('selectedData'))
    }
});
});
SCRIPT;
        self::enqueue('scripts', "widget-suggest-$wid", array($script), array('htmlwidgets.js'));
        return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="text" id="$wid" $wname title="$wtitle" class="$wclass" $wextra placeholder="$wplaceholder" value="$wvalue" autocomplete="off" $wdata />
$wicon
</span>
OUT;
    }
    
    public static function widget_textarea( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        if ( !empty($attr['syntax-editor']) ) 
        {
            $defaults = array(
             'mode'             => 'text/html'
            ,'theme'            => 'default'
            ,'lineWrapping'     => false
            ,'lineNumbers'      => true
            ,'indentUnit'       => 4
            ,'indentWithTabs'   => false
            ,'lint'             => false
            ,'foldGutter'       => true
            ,'gutters'          => array("CodeMirror-lint-markers","CodeMirror-linenumbers","CodeMirror-foldgutter")
            );
            $wclass = 'widget widget-syntax-editor'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            $wstyle = !empty($attr["style"]) ? $attr["style"] : '';
            $weditor = json_encode(!empty($attr['config']) ? array_merge($defaults,(array)$attr['config']) : $defaults);
            $script = <<<SCRIPT
jQuery(function(\$){
CodeMirror.fromTextArea(document.getElementById('$wid'), $weditor);
});
SCRIPT;
            self::enqueue('styles', 'codemirror-styles');
            self::enqueue('scripts', "widget-syntax-editor-$wid", array($script), array('codemirror'));
            $wstyle = '';
        }
        elseif ( !empty($attr['wysiwyg-editor']) ) 
        {
            $defaults = array( );
            $wclass = 'widget widget-wysiwyg-editor'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            $wstyle = !empty($attr["style"]) ? $attr["style"] : '';
            $weditor = !empty($attr['config']) ? json_encode(array_merge($defaults,(array)$attr['config'])) : '';
            $script = <<<SCRIPT
jQuery(function(\$){
\$('#$wid').trumbowyg($weditor);
\$('#$wid').closest('.trumbowyg-box').addClass('widget widget-wysiwyg-editor-box').attr("style","$wstyle");
});
SCRIPT;
            self::enqueue('styles', 'trumbowyg-styles');
            self::enqueue('scripts', "widget-wysiwyg-editor-$wid", array($script), array('trumbowyg'));
            $wstyle = '';
        }
        else
        {
            $wclass = 'widget widget-textarea'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        }
        return <<<OUT
<textarea id="$wid" $wname title="$wtitle" class="$wclass" $wstyle $wextra placeholder="$wplaceholder" $wdata>$wvalue</textarea>
OUT;
    }
    
    public static function widget_date( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = isset($attr['title']) ? $attr['title'] : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $wtitle;
        $wclass = 'widget widget-text widget-date'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wformat = !empty($attr["format"]) ? $attr["format"] : 'Y-m-d';
        $wicon = '';
        $wrapper_class = 'widget-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' widget-icon';
        }
        if ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        if ( empty($attr['icon']) && empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            $wrapper_class .= ' widget-icon-right';
        }
        $wdata = self::attr_data($attr);
        $script = <<<SCRIPT
jQuery(function(\$){
\$('#$wid').datetime({
    format: "$wformat",
    datetimelocale: $.htmlwidget.datetime.default_locale,
    encoder: $.htmlwidget.datetime.date_encoder,
    decoder: $.htmlwidget.datetime.date_decoder
});
});
SCRIPT;
        self::enqueue('scripts', "widget-datetime-$wid", array($script), array('htmlwidgets.js'));
        return <<<OUT
<span class="$wrapper_class" $wstyle>
<input type="text" id="$wid" $wname title="$wtitle" class="$wclass" placeholder="$wplaceholder" value="$wvalue" $wextra $wdata />
$wicon
</span>
OUT;
    }
    
    public static function widget_time( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? $attr["name"] : '';
        $wformat = !empty($attr['format']) ? explode(":", $attr['format']) : array("h","m","s");
        if (isset($data['value'])) 
        {
            $wvalue = is_array($data['value']) ? $data['value'] : explode(':',$data['value']);
            while ( count($wvalue) < 3 ) $wvalue[] = "00";
        }
        else
        {
            $wvalue = array("00", "00", "00");
        }
        $wclass = 'widget widget-time'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
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
            $wnam = !empty($wname) ? 'name="'.$wname.'['.$t.']"' : '';
            $wtimes[] = '<select class="widget-time-component" id="'.$wid.'_'.$t.'" '.$wnam.'>'.implode('',$time_options[$t]).'</select>';
        }
        $wtimes = implode('<span class="widget-time-sep">:</span>', $wtimes);
        return <<<OUT
<span class="$wclass" $wstyle $wextra $wdata>
$wtimes
</span>
OUT;
    }
    
    public static function widget_select( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wdropdown = !empty($attr['dropdown']);
        $wclass = $wdropdown ? "widget widget-dropdown widget-state-default" : "widget widget-select"; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wselected = isset($data['selected']) ? (array)$data['selected'] : array();
        $woptions = '';
        foreach((array)$data['options'] as $opt)
        {
            if (is_array($opt))
            {
                $keys = array_keys($opt);
                $key = array_shift($keys);
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
<select id="$wid" $wname class="widget-dropdown-select widget-state-default" $wextra $wdata>
$woptions
</select>
</span>
OUT;
        else
            return <<<OUT
<select id="$wid" $wname class="$wclass" $wstyle $wextra $wdata>
$woptions
</select>
OUT;
    }
    
    public static function widget_menu( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); $wmenu = $data['menu'];
        $wclass = 'widget widget-dropdown-menu'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::attr_data($attr);
        return <<<OUT
<div id="$wid" class="$wclass" $wstyle $wextra $wdata>$wmenu</div>
OUT;
    }
    
    public static function widget_table( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'widget widget-table'; 
        if ( !isset($attr['stripped']) || $attr['stripped'] ) $wclass .= ' stripped';
        if ( !isset($attr['responsive']) || $attr['responsive'] ) $wclass .= ' responsive';
        if ( !empty($attr['class']) ) $wclass .= ' '.$attr['class'];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
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
            if ( !empty($attr['controls']) ) 
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
            self::enqueue('styles', 'jquery.dataTables.css');
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