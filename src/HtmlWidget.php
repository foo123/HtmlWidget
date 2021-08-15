<?php
/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for Javascript, PHP, Python
*
*  @version: 2.0.0
*  https://github.com/foo123/HtmlWidget
*
**/
if (!class_exists('HtmlWidget', false))
{
class HtmlWidget
{
    const VERSION = "2.0.0";
    public static $BASE = './';
    public static $enqueuer = null;
    public static $widgets = array();

    public static function enqueueAssets($enqueuer = null)
    {
        if ($enqueuer && is_callable($enqueuer)) self::$enqueuer = $enqueuer;
        else self::$enqueuer = null;
    }

    public static function enqueue($type, $id, $asset = null, $deps = array(), $props = array())
    {
        if (self::$enqueuer)
            call_user_func(self::$enqueuer, $type, $id, array($asset, $deps, $props));
    }

    public static function assets($assets = null, $base = null)
    {
        static $a = array();
        if (func_num_args())
        {
            if (true === $assets)
            {
                $base = (string)$base;
                // resolve base path and transform to Importer format
                return array_map(function($key) use ($a, $base) {
                    $asset = $a[$key];
                    if (!empty($asset['asset']))
                    {
                        if (is_array($asset['asset']))
                        {
                            foreach ($asset['asset'] as $k => $v)
                                $asset['asset'][$k] = str_replace('${ASSETS}', $base, $v);
                        }
                        else
                        {
                            $asset['asset'] = str_replace('${ASSETS}', $base, $asset['asset']);
                        }
                    }
                    return array($asset['type'], $key, empty($asset['asset']) ? null : $asset['asset'], empty($asset['dependencies']) ? null : $asset['dependencies'], empty($asset['attributes']) ? null : $asset['attributes']);
                }, array_keys($a));
            }
            else if (!empty($assets))
            {
                $a = !empty($base) ? array_merge($a, $assets) : $assets;
            }
        }
        else
        {
            return $a;
        }
    }

    public static function uuid($prefix = "widget", $suffix = "static1")
    {
        static $GID = 0;
        return implode("_", array($prefix, time(), ++$GID, rand(0,1000), $suffix));
    }

    private static function data_attr($k, $v)
    {
        if (is_array($v))
        {
            $attr = '';
            foreach ($v as $k1 => $v1)
                $attr .= (empty($attr) ? '' : ' ') . self::data_attr($k.'-'.$k1, $v1);
            return $attr;
        }
        else
        {
            return "{$k}='{$v}'";
        }
    }

    public static function data($attr, $ctx = 'data')
    {
        $d_attr = '';
        if (!!$ctx && !empty($attr[$ctx]) && is_array($attr[$ctx]))
        {
            foreach ($attr[$ctx] as $k => $v)
                $d_attr .= (empty($d_attr) ? '' : ' ') . self::data_attr($ctx.'-'.$k, $v);
        }
        return $d_attr;
    }

    public static function attributes($attr, $atts = array())
    {
        if (empty($atts) || empty($attr)) return '';
        $attrs = array();
        foreach ($atts as $k)
        {
            if (isset($attr[$k]))
            {
                if ('data' == $k)
                {
                    $attrs[] = self::data($attr);
                }
                else
                {
                    $v = $attr[$k];
                    $attrs[] = "{$k}=\"{$v}\"";
                }
            }
        }
        return empty($attrs) ? '' : implode(' ', $attrs);
    }

    public static function options($opts, $key = null, $value = null)
    {
        $options = array();
        foreach((array)$opts as $k=>$v)
        {
            $vv = (array)$v;
            $o_key = null;
            if (-1 === $key)
            {
                $o_key = $k;
            }
            elseif (null !== $key)
            {
                if (isset($vv[$key]))
                    $o_key = $vv[$key];
            }

            $o_val = null;
            if (null !== $value)
            {
                if (isset($vv[$value]))
                    $o_val = $vv[$value];
            }
            else
            {
                $o_val = $v;
            }

            if (null === $o_key) $o_key = $o_val;

            $options[] = array($o_key, $o_val);
        }
        return $options;
    }

    public static function shuffle($arr, $assoc = false)
    {
        // shuffle an asociative array as well
        if (true === $assoc)
        {
            $keys = array_keys($arr);
            $shuffled = array();
            shuffle($keys);
            foreach ($keys as $key) $shuffled[$key] = $arr[$key];
        }
        else
        {
            $shuffled = $arr;
            shuffle($shuffled);
        }
        return $shuffled;
    }

    public static function menu($items, $tab = '')
    {
        $tab_tab = '  ' . $tab;
        $out = $tab . '<ul>' . "\n";
        foreach ($items as $item)
        {
            $item_class = array();
            if (!empty($item['submenu'])) $item_class[] = 'w-submenu-item';
            if (!empty($item['active'])) $item_class[] = 'active';
            $item_url = isset($item['url']) ? (string)$item['url'] : '#';
            $out .= $tab_tab.'<li'.(!empty($item_class) ? ' class="'.implode(' ',$item_class).'"' : '').'>'."\n";
            $out .= $tab_tab.'<a href="'.$item_url.'">'.(string)$item['text'].'</a>'."\n";
            if (!empty($item['submenu']))
                $out .= self::menu((array)$item['submenu'], $tab_tab);
            $out .= $tab_tab . '</li>' . "\n";
        }
        $out .= $tab . '</ul>' . "\n";
        return $out;
    }

    public static function addWidget($widget, $renderer)
    {
        if ($widget && $renderer && is_callable($renderer))
            self::$widgets['w_'.$widget] = $renderer;
        elseif ($widget && (false === $renderer) && isset(self::$widgets['w_'.$widget]))
            unset(self::$widgets['w_'.$widget]);
    }

    public static function widget($widget, $attr = array(), $data = array())
    {
        $out = '';
        if ($widget)
        {
            if (null == $attr) $attr = array();
            if (null == $data) $data = array();

            if (isset(self::$widgets['w_'.$widget]))
                return call_user_func(self::$widgets['w_'.$widget], $attr, $data, $widget);

            if ('audio' === $widget) $attr['type'] = 'audio';
            elseif ('video' === $widget) $attr['type'] = 'video';
            elseif ('checkbox-array' === $widget || 'check-array' === $widget) $attr['type'] = 'checkbox';
            elseif ('radiobox-array' === $widget || 'radio-array' === $widget) $attr['type'] = 'radio';
            elseif ('checkbox-list' === $widget || 'checklist' === $widget) $attr['type'] = 'checkbox';
            elseif ('radiobox-list' === $widget || 'radio-list' === $widget || 'radiolist' === $widget) $attr['type'] = 'radio';
            elseif ('checkbox' === $widget || 'checkbox-image' === $widget || 'checkbox-label' === $widget) $attr['type'] = 'checkbox';
            elseif ('radio' === $widget|| 'radio-image' === $widget || 'radio-label' === $widget) $attr['type'] = 'radio';
            elseif ('datetime' === $widget || 'datetimepicker' === $widget) $attr['time'] = true;
            elseif ('select2' === $widget) $attr['select2'] = true;
            elseif ('dropdown' === $widget) $attr['dropdown'] = true;
            elseif ('datatable' === $widget) $attr['datatable'] = true;
            elseif ('codemirror' === $widget || 'codemirror-editor' === $widget || 'syntax-editor' === $widget || 'source-editor' === $widget || 'syntax' === $widget || 'source' === $widget || 'highlight-editor' === $widget || 'highlighter' === $widget) $attr['syntax-editor'] = true;
            elseif ('tinymce' === $widget || 'wysiwyg-editor' === $widget || 'wysiwyg' === $widget || 'rich-editor' === $widget || 'rich' === $widget || 'editor' === $widget) $attr['wysiwyg-editor'] = true;

            switch($widget)
            {
                case 'empty':       $out = self::w_empty($attr, $data, $widget); break;
                case 'sep':
                case 'separator':   $out = self::w_sep($attr, $data, $widget); break;
                case 'icon':        $out = self::w_icon($attr, $data, $widget); break;
                case 'delayable':   $out = self::w_delayable($attr, $data, $widget); break;
                case 'disabable':   $out = self::w_disabable($attr, $data, $widget); break;
                case 'morphable':   $out = self::w_morphable($attr, $data, $widget); break;
                case 'pages':       $out = self::w_pages($attr, $data, $widget); break;
                case 'tabs':        $out = self::w_tabs($attr, $data, $widget); break;
                case 'accordeon':   $out = self::w_accordeon($attr, $data, $widget); break;
                case 'panel':       $out = self::w_panel($attr, $data, $widget); break;
                case '/panel':      $out = self::w_panel_end($attr, $data, $widget); break;
                case 'tooltip':     $out = self::w_tooltip($attr, $data, $widget); break;
                case 'link':        $out = self::w_link($attr, $data, $widget); break;
                case 'button':      $out = self::w_button($attr, $data, $widget); break;
                case 'label':       $out = self::w_label($attr, $data, $widget); break;
                case 'textbox':
                case 'textfield':
                case 'text':        $out = self::w_text($attr, $data, $widget); break;
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
                case 'textarea':    $out = self::w_textarea($attr, $data, $widget); break;
                case 'datetimepicker':
                case 'datepicker':
                case 'datetime':
                case 'date':        $out = self::w_date($attr, $data, $widget); break;
                case 'time':        $out = self::w_time($attr, $data, $widget); break;
                case 'colorpicker':
                case 'colorselector':
                case 'color':       $out = self::w_color($attr, $data, $widget); break;
                case 'rating':      $out = self::w_rating($attr, $data, $widget); break;
                case 'radiobox-array':
                case 'radio-array':
                case 'checkbox-array':
                case 'check-array': $out = self::w_control_array($attr, $data, $widget); break;
                case 'radiobox-list':
                case 'radio-list':
                case 'radiolist':
                case 'checkbox-list':
                case 'checklist':   $out = self::w_control_list($attr, $data, $widget); break;
                case 'checkbox-image':
                case 'radio-image':
                case 'checkbox-label':
                case 'radio-label':
                case 'checkbox':
                case 'radio':
                case 'control':     $out = self::w_control($attr, $data, $widget); break;
                case 'switch':      $out = self::w_switch($attr, $data, $widget); break;
                case 'dropdown':
                case 'selectbox':
                case 'select2':
                case 'select':      $out = self::w_select($attr, $data, $widget); break;
                case 'file':        $out = self::w_file($attr, $data, $widget); break;
                case 'menu':        $out = self::w_menu($attr, $data, $widget); break;
                case '/menu':       $out = self::w_menu_end($attr, $data, $widget); break;
                case 'pagination':  $out = self::w_pagination($attr, $data, $widget); break;
                case 'datatable':
                case 'table':       $out = self::w_table($attr, $data, $widget); break;
                case 'animation':   $out = self::w_animation($attr, $data, $widget); break;
                case 'sprite':      $out = self::w_sprite($attr, $data, $widget); break;
                case 'video':
                case 'audio':
                case 'media':       $out = self::w_media($attr, $data, $widget); break;
                default: $out = '';
            }
        }
        return $out;
    }

    public static function w_empty($attr, $data, $widgetName = null)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return '';
    }

    public static function w_sep($attr, $data, $widgetName = null)
    {
        $wclass = 'w-separator';
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        self::enqueue('styles', 'htmlwidgets.css');
        return "<div class=\"$wclass\" $wstyle></div>";
    }

    public static function w_icon($attr, $data, $widgetName = null)
    {
        $wclass = 'fa';
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (!empty($attr['icon'])) $wclass .= ' fa-'.$attr['icon'];
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wextra = self::attributes($attr,array('data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        return "<i class=\"$wclass\" $wstyle $wtitle $wextra></i>";
    }

    public static function w_label($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wfor = isset($attr["for"]) ? 'for="'.$attr["for"].'"' : '';
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr["title"]) ? $attr['title'] : $wtext;
        $wclass = 'w-widget w-label'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (!empty($attr['icon']))
        {
            $wclass .= ' w-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if (!empty($attr['iconr']))
        {
            $wclass .= ' w-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        // iOS needs an onlick attribute to handle label update if used as controller
        return "<label id=\"$wid\" $wfor class=\"$wclass\" title=\"$wtitle\" $wstyle onclick=\"\" $wextra>$wtext</label>";
    }

    public static function w_link($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'w-link'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (!empty($attr['icon']))
        {
            $wclass .= ' w-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if (!empty($attr['iconr']))
        {
            $wclass .= ' w-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        if (isset($attr['for']))
        {
            $wfor = $attr['for'];
            return "<label id=\"$wid\" class=\"$wclass\" $wstyle onclick=\"\" title=\"$wtitle\" for=\"$wfor\" $wextra>$wtext</label>";
        }
        else
        {
            $whref = isset($attr['href']) ? $attr['href'] : '#';
            $wextra .= ' '.self::attributes($attr,array('target','rel'));
            return "<a id=\"$wid\" class=\"$wclass\" $wstyle title=\"$wtitle\" href=\"$whref\" $wextra>$wtext</a>";
        }
    }

    public static function w_button($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wextra2 = '';
        self::enqueue('styles', 'htmlwidgets.css');
        $wclass = 'w-widget w-button';

        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if (!empty($attr['icon']))
        {
            if (empty($wtext))  $wclass .= ' w-icon-only';
            else $wclass .= ' w-icon';
            $wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>" . $wtext;
        }
        if (!empty($attr['iconr']))
        {
            if ( empty($wtext) )  $wclass .= ' w-icon-only';
            else $wclass .= ' w-icon-right';
            $wtext = $wtext . "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        if (isset($attr['for']))
        {
            $wfor = $attr['for'];
            return "<label id=\"$wid\" for=\"$wfor\" class=\"$wclass\" $wstyle onclick=\"\" title=\"$wtitle\" $wextra $wextra2>$wtext</label>";
        }
        elseif (isset($attr['href']))
        {
            $whref = $attr['href'];
            $wextra .= ' '.self::attributes($attr,array('role','target','rel'));
            return "<a id=\"$wid\" href=\"$whref\" class=\"$wclass\" $wstyle title=\"$wtitle\" $wextra $wextra2>$wtext</a>";
        }
        else
        {
            $wtype = isset($attr['type']) ? $attr['type'] : 'button';
            return "<button id=\"$wid\" type=\"$wtype\" class=\"$wclass\" $wstyle title=\"$wtitle\" $wextra $wextra2>$wtext</button>";
        }
    }

    public static function w_control($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wchecked = !empty($attr['checked']) ? 'checked' : '';
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        $wstate = '';
        if (isset($attr['state-on'])) $wstate .= " data-wstate-on=\"{$attr['state-on']}\"";
        if (isset($attr['state-off'])) $wstate .= " data-wstate-off=\"{$attr['state-off']}\"";
        if (!empty($attr['image']))
        {
            $wctrl = 'radio' === $wtype ? 'w-radio-image' : 'w-checkbox-image';
            $wtext = '<span style="background-image:url('.$attr['image'].');"></span>';
        }
        elseif (!empty($attr['label']))
        {
            $wctrl = 'radio' === $wtype ? 'w-radio-label' : 'w-checkbox-label';
            $wtext = $attr['label'];
        }
        else
        {
            $wctrl = 'radio' === $wtype ? 'w-radio' : 'w-checkbox';
            $wtext = '&nbsp;';
        }
        $wclass = 'w-widget w-control'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        return "<input type=\"$wtype\" id=\"$wid\" $wname class=\"$wctrl\" value=\"$wvalue\" $wextra $wchecked /><label for=\"$wid\" $wtitle class=\"$wclass\" $wstyle $wstate onclick=\"\">$wtext</label>";
    }

    public static function w_control_list($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? $attr["name"] : null;
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? (' '.$attr["extra"]) : '';
        $woptions = (array)$data['options'];
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wclass = !empty($attr["class"]) ? $attr["class"] : '';
        $w_large = !empty($wclass) && (false !== strpos(' '.$wclass.' ',' w-large '));
        $w_xlarge = !empty($wclass) && (false !== strpos(' '.$wclass.' ',' w-xlarge '));
        $w_item_atts = self::attributes($attr,array('readonly','disabled','data'));
        if (!empty($attr["horizontal"])) $wclass .= ' w-control-list-horizontal w-clearfloat';
        if ('radio' == $wtype)
        {
            if ($w_xlarge)  $w_item_class = 'w-xlarge';
            elseif ($w_large) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<ol id="'.$wid.'" class="w-control-list w-radio-list '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            foreach ($woptions as $i=>$opt)
            {
                $widget .= '<li class="w-control-list-option">'.self::widget('radio',array(
                    'id'        => $wid.'_option_'.($i+1),
                    'name'      => $wname,
                    'class'     => $w_item_class,
                    'title'     => $opt[1],
                    'checked'   => $opt[0] == $wvalue,
                    'extra'     => $w_item_atts
                ),array(
                    'value'     => $opt[0]
                )).' '.self::widget('label',array(
                    'for'           => $wid.'_option_'.($i+1),
                    'class'         => 'w-control-list-option-label',
                    'title'         => $opt[1]
                ),array(
                    'text'          => $opt[1]
                )).'</li>';
            }
            $widget .= '</ol>';
        }
        else
        {
            $wvalue = (array)$wvalue;
            if ($w_xlarge) $w_item_class = 'w-xlarge';
            elseif ($w_large) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<ul id="'.$wid.'" class="w-control-list w-checkbox-list '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            foreach ($woptions as $i=>$opt)
            {
                $widget .= '<li class="w-control-list-option">'.self::widget('checkbox',array(
                    'id'        => $wid.'_option_'.($i+1),
                    'name'      => $wname,
                    'class'     => $w_item_class,
                    'title'     => $opt[1],
                    'checked'   => in_array($opt[0],$wvalue),
                    'extra'     => $w_item_atts
                ),array(
                    'value'     => $opt[0]
                )).' '.self::widget('label',array(
                    'for'           => $wid.'_option_'.($i+1),
                    'class'         => 'w-control-list-option-label',
                    'title'         => $opt[1]
                ),array(
                    'text'          => $opt[1]
                )).'</li>';
            }
            $widget .= '</ul>';
        }
        self::enqueue('styles', 'htmlwidgets.css');
        return $widget;
    }

    public static function w_control_array($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? $attr["name"] : null;
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? (' '.$attr["extra"]) : '';
        $wfields = (array)$data['fields'];
        $woptions = (array)$data['options'];
        $wvalues = isset($data['value']) ? (array)$data['value'] : array();
        $wclass = !empty($attr["class"]) ? $attr["class"] : '';
        $w_large = !empty($wclass) && (false !== strpos(' '.$wclass.' ',' w-large '));
        $w_xlarge = !empty($wclass) && (false !== strpos(' '.$wclass.' ',' w-xlarge '));
        $w_item_atts = self::attributes($attr,array('readonly','disabled','data'));
        $fields = array_keys($wfields);
        if (!empty($attr["randomised"])) shuffle($fields);
        if ('radio' == $wtype)
        {
            if ($w_xlarge) $w_item_class = 'w-xlarge';
            elseif ($w_large) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<table id="'.$wid.'" class="w-control-array w-radio-array '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            $widget .= '<thead><tr><td>&nbsp;</td>';
            foreach ($woptions as $i=>$opt)
            {
                $widget .= '<td>'.$opt[1].'</td>';
            }
            $widget .= '<td>&nbsp;</td></tr></thead><tbody>';
            foreach ($fields as $field)
            {
                $widget .= '<tr><td>'.$wfields[$field].'</td>';
                $w_item_name = $wname.'['.$field.']';
                foreach ($woptions as $i=>$opt)
                {
                    $widget .= '<td>'.self::widget('radio',array(
                        'id'        => $wid.'_'.$field.'_'.($i+1),
                        'name'      => $w_item_name,
                        'class'     => $w_item_class,
                        'title'     => $opt[1],
                        'checked'   => isset($wvalues[$field]) && ($opt[0] == $wvalues[$field]),
                        'extra'     => $w_item_atts
                    ),array(
                        'value'     => $opt[0]
                    )).'</td>';
                }
                $widget .= '<td>&nbsp;</td></tr>';
            }
            $widget .= '</tbody></table>';
        }
        else
        {
            if ($w_xlarge) $w_item_class = 'w-xlarge';
            elseif ($w_large) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<table id="'.$wid.'" class="w-control-array w-checkbox-array '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            $widget .= '<thead><tr><td>&nbsp;</td>';
            foreach ($woptions as $i=>$opt)
            {
                $widget .= '<td>'.$opt[1].'</td>';
            }
            $widget .= '<td>&nbsp;</td></tr></thead><tbody>';
            foreach ($fields as $field)
            {
                $wvalue = isset($wvalues[$field]) ? (array)$wvalues[$field] : array();
                $widget .= '<tr><td>'.$wfields[$field].'</td>';
                $w_item_name = $wname.'['.$field.']';
                foreach ($woptions as $i=>$opt)
                {
                    $widget .= '<td>'.self::widget('checkbox',array(
                        'id'        => $wid.'_'.$field.'_'.($i+1),
                        'name'      => $w_item_name,
                        'class'     => $w_item_class,
                        'title'     => $opt[1],
                        'checked'   => in_array($opt[0],$wvalue),
                        'extra'     => $w_item_atts
                    ),array(
                        'value'     => $opt[0]
                    )).'</td>';
                }
                $widget .= '<td>&nbsp;</td></tr>';
            }
            $widget .= '</tbody></table>';
        }
        self::enqueue('styles', 'htmlwidgets.css');
        return $widget;
    }

    public static function w_switch($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wvalue2 = isset($data['valueoff']) ? $data['valueoff'] : false;
        $wdual = false !== $wvalue2;
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wchecked = !empty($attr['checked']);
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wclass = "w-widget w-switch"; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wreverse = !empty($attr["reverse"]);
        $wiconon = '&nbsp;'; $wiconoff = '&nbsp;';
        if (!empty($attr["iconon"]) && empty($attr["iconoff"]))
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconon"]} not-negative\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconon"]} negative\"></i>";
        }
        elseif (!empty($attr["iconoff"]) && empty($attr["iconon"]))
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconoff"]} positive\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconoff"]} not-positive\"></i>";
        }
        elseif (!empty($attr["iconon"]) && !empty($attr["iconoff"]))
        {
            $wiconon = "<i class=\"fa fa-{$attr["iconon"]}\"></i>";
            $wiconoff = "<i class=\"fa fa-{$attr["iconoff"]}\"></i>";
        }
        if ($wdual)
        {
            // dual switch with separate on/off states
            $wclass .= ' dual';
            $wtype = 'radio';
            if ($wchecked)
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\"w-switch-state w-state-on\" value=\"$wvalue\" $wextra checked /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"w-switch-state w-state-off\" value=\"$wvalue2\" $wextra />";
            }
            else
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\"w-switch-state w-state-on\" value=\"$wvalue\" $wextra /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"w-switch-state w-state-off\" value=\"$wvalue2\" $wextra checked />";
            }
            if ($wreverse)
            {
                $wclass .= ' reverse';
                $wswitches = "<label for=\"{$wid}-off\" class=\"w-switch-off\" onclick=\"\">$wiconoff</label><label for=\"{$wid}-on\" class=\"w-switch-on\" onclick=\"\">$wiconon</label>";
            }
            else
            {
                $wswitches = "<label for=\"{$wid}-on\" class=\"w-switch-on\" onclick=\"\">$wiconon</label><label for=\"{$wid}-off\" class=\"w-switch-off\" onclick=\"\">$wiconoff</label>";
            }
        }
        else
        {
            // switch with one state for on/off
            if ($wchecked) $wchecked = 'checked';
            $wstates = "<input type=\"$wtype\" id=\"$wid\" $wname class=\"w-switch-state\" value=\"$wvalue\" $wextra $wchecked />";
            if ($wreverse)
            {
                $wclass .= ' reverse';
                $wswitches = "<label for=\"$wid\" class=\"w-switch-off\" onclick=\"\">$wiconoff</label><label for=\"$wid\" class=\"w-switch-on\" onclick=\"\">$wiconon</label>";
            }
            else
            {
                $wswitches = "<label for=\"$wid\" class=\"w-switch-on\" onclick=\"\">$wiconon</label><label for=\"$wid\" class=\"w-switch-off\" onclick=\"\">$wiconoff</label>";
            }
        }
        self::enqueue('styles', 'htmlwidgets.css');
        return "<span class=\"$wclass\" $wtitle $wstyle>{$wstates}{$wswitches}<span class=\"w-switch-handle\"></span></span>";
    }

    public static function w_rating($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : 'name="__rating_'.$wid.'"';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wtext = !empty($data['text']) ? $data['text'] : '';
        $wclass = 'w-rating'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wicon = !empty($attr["icon"]) ? $attr["icon"] : 'star';
        $w_item_atts = self::attributes($attr,array('readonly','disabled','data'));
        $wextra = !empty($attr["extra"]) ? (' '.$attr["extra"]) : '';
        $wratings = !empty($data["ratings"]) ? (array)$data["ratings"] : self::options(array('1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5'),-1);
        $widget = "<fieldset id=\"$wid\" $wtitle class=\"$wclass\" $wstyle $wextra>";
        if (!empty($wtext)) $widget .= "<legend $wtitle>$wtext</legend>";
        if (empty($wicon)) $wicon = 'star';
        for ($r=count($wratings)-1; $r>=0; $r--)
        {
            $rate = $wratings[$r][0]; $label = $wratings[$r][1];
            if (is_array($wicon))
            {
                if (isset($wicon[$r])) $w_icon = $wicon[$r];
                else $w_icon = $wicon[count($wicon)-1];
            }
            else
            {
                $w_icon = $wicon;
            }
            $wchecked = !empty($wvalue) && $wvalue == $rate ? 'checked' : '';
            $widget .= "<input type=\"radio\" id=\"{$wid}_rating_{$rate}\" class=\"w-rating-input\" $wname value=\"$rate\" $wchecked {$w_item_atts}/><label for=\"{$wid}_rating_{$rate}\" class=\"fa fa-{$w_icon} w-rating-label\" title=\"$label\">&nbsp;</label>";
        }
        $widget .= "</fieldset>";
        self::enqueue('styles', 'htmlwidgets.css');
        return $widget;
    }

    public static function w_select($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wdropdown = !empty($attr['dropdown']);
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wextra = self::attributes($attr,array('multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wselected = isset($data['selected']) ? (array)$data['selected'] : array();
        $woptions = '';
        $has_selected = false;
        foreach ((array)$data['options'] as $opt)
        {
            // NOTE: use HtmlWidget::options() to format options accordingly to be used here
            $key = $opt[0]; $val = $opt[1];
            $selected = in_array($key, $wselected) ? ' selected' : '';
            if (!empty($selected)) $has_selected = true;
            $woptions .= "<option value=\"$key\"$selected>$val</option>";
        }
        if (!empty($attr['placeholder']))
        {
            $woptions = "<option value=\"\" class=\"w-option-placeholder\" disabled".($has_selected?'':' selected').">{$attr['placeholder']}</option>" . $woptions;
            //if ( !preg_match('/\brequired\b/', $wextra) ) $wextra .= ' required';
            //if ( empty($wname) ) $wextra .= ' form="__NONE__"';
            $wextra .= ' data-placeholder="'.$attr['placeholder'].'"';
        }
        $wclass = $wdropdown ? "w-widget w-dropdown" : "w-widget w-select";
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];

        self::enqueue('styles', 'htmlwidgets.css');
        if (!empty($attr['select2']) && !$wdropdown)
        {
            $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
            $wclass .= ' w-select2';
            self::enqueue('scripts', 'select2');
            self::enqueue('scripts', 'select2-'.$wid, array("(function(){
                if ('undefined' === typeof(jQuery) || 'function' !== typeof(jQuery.fn.select2)) return;
                var options = ".(!empty($options) ? json_encode($options) : '{}').";
                if (options.delayedInit)
                {
                    setTimeout(function(){jQuery(document.getElementById('".$wid."')).select2(options);}, +options.delayedInit);
                }
                else
                {
                    jQuery(document.getElementById('".$wid."')).select2(options);
                }
            })();"), array('select2'));
        }
        return $wdropdown
        ? "<span class=\"$wclass\" $wstyle><select id=\"$wid\" $wname class=\"w-dropdown-select\" $wtitle $wextra>$woptions</select></span>"
        : "<select id=\"$wid\" $wname class=\"$wclass\" $wstyle $wtitle $wextra>$woptions</select>";
    }

    public static function w_text($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        // text, number, email, url, tel etc..
        $wtype = !empty($attr["type"]) ? $attr["type"] : 'text';
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if (!empty($attr['icon']))
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if (!empty($attr['iconr']))
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wclass = 'w-widget w-text'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        self::enqueue('styles', 'htmlwidgets.css');
        return !empty($wicon)
        ? "<span class=\"$wrapper_class\" $wstyle><input type=\"$wtype\" id=\"$wid\" $wname $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" $wextra />$wicon</span>"
        : "<input type=\"$wtype\" id=\"$wid\" $wname $wtitle class=\"$wclass\" $wstyle placeholder=\"$wplaceholder\" value=\"$wvalue\" $wextra />";
    }

    public static function w_textarea($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        if (!empty($attr['syntax-editor']))
        {
            $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
            if (empty($options['mode'])) $options['mode'] = 'text/html';
            if (empty($options['theme'])) $options['theme'] = 'default';
            if (!isset($options['readOnly'])) $options['readOnly'] = isset($attr['readonly']) ? !!$attr['readonly'] : false;
            if (!isset($options['lineWrapping'])) $options['lineWrapping'] = false;
            if (!isset($options['lineNumbers'])) $options['lineNumbers'] = true;
            if (!isset($options['indentUnit'])) $options['indentUnit'] = 4;
            if (!isset($options['indentWithTabs'])) $options['indentWithTabs'] = false;
            if (!isset($options['lint'])) $options['lint'] = false;
            if (!isset($options['foldGutter'])) $options['foldGutter'] = true;
            if (!isset($options['gutters'])) $options['gutters'] = array('CodeMirror-lint-markers','CodeMirror-linenumbers','CodeMirror-foldgutter');
            $wclass = 'w-widget w-syntax-editor w-codemirror-editor'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
            self::enqueue('scripts', 'codemirror');
            self::enqueue('scripts', 'codemirror-fold');
            self::enqueue('scripts', 'codemirror-htmlmixed');
            if (!empty($options['grammar'])) self::enqueue('scripts', 'codemirror-grammar');
            self::enqueue('scripts', 'codemirror-'.$wid, array("(function(){
                if ('function' !== typeof(CodeMirror)) return;
                var options = ".(!empty($options) ? json_encode($options) : '{}').";
                if (options.grammar && ('undefined' !== typeof(CodeMirrorGrammar)))
                {
                    var mode = CodeMirrorGrammar.getMode(options.grammar);
                    CodeMirror.defineMode(options.mode, mode);
                    mode.supportCodeFolding = true;
                    CodeMirror.registerHelper('fold', mode.foldType, mode.folder);
                    mode.supportGrammarAnnotations = true;
                    CodeMirror.registerHelper('lint', options.mode, mode.validator);
                    delete options.grammar;
                }
                var element = document.getElementById('".$wid."');
                if (element.codemirror)
                {
                    element.codemirror.toTextArea();
                    element.codemirror = null;
                }
                if (options.delayedInit)
                {
                    setTimeout(function(){element.codemirror = CodeMirror.fromTextArea(element, options);}, +options.delayedInit);
                }
                else
                {
                    element.codemirror = CodeMirror.fromTextArea(element, options);
                }
            })();"), array('codemirror'));
        }
        elseif (!empty($attr['wysiwyg-editor']))
        {
            $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
            if (!isset($options['plugins'])) $options['plugins'] = 'print preview fullpage searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help' /*placeholderalt codemirror jbimages*/;
            if (!isset($options['toolbar'])) $options['toolbar'] = 'undo redo formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat';
            if (empty($options['theme'])) $options['theme'] = 'modern';
            if (empty($options['skin'])) $options['skin'] = 'lightgray';
            if (empty($options['directionality'])) $options['directionality'] = 'ltr';
            if (empty($options['height'])) $options['height'] = 500;
            if (!isset($options['placeholder'])) $options['placeholder'] = isset($attr['placeholder']) ? $attr['placeholder'] : '';
            if (!isset($options['automatic_uploads'])) $options['automatic_uploads'] = true;
            if (!isset($options['image_advtab'])) $options['image_advtab'] = true;
            if (!isset($options['paste_data_images'])) $options['paste_data_images'] = true;
            if (!isset($options['browser_spellcheck'])) $options['browser_spellcheck'] = true;
            /*if (!isset($options['templates'])) $options['templates'] = array();
            if (!isset($options['body_class'])) $options['body_class'] = null;
            if (!isset($options['content_css'])) $options['content_css'] = null;
            if (!isset($options['content_style'])) $options['content_style'] = null;*/
            $options['selector'] = '#'.$wid;
            $wclass = 'w-widget w-wysiwyg-editor'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
            self::enqueue('scripts', 'tinymce');
            self::enqueue('scripts', 'tinymce-'.$wid, array("(function(){
                if ('undefined' === typeof(tinymce)) return;
                function dispatch(event, element, data)
                {
                    if (!element) return;
                    var evt;
                    if (document.createEvent)
                    {
                        evt = document.createEvent('HTMLEvents');
                        evt.initEvent(event, true, true);
                        evt.eventName = event;
                        if (null != data) evt.data = data;
                        element.dispatchEvent(evt);
                    }
                    else
                    {
                        evt = document.createEventObject();
                        evt.eventType = event;
                        evt.eventName = event;
                        if (null != data) evt.data = data;
                        element.fireEvent('on' + evt.eventType, evt);
                    }
                    return element;
                };
                var options = ".(!empty($options) ? json_encode($options) : '{}').";
                var element = document.getElementById('".$wid."');
                if (options.autosave)
                {
                    options.setup = function(editor) {
                        editor.on('change', function(){
                            editor.save();
                            dispatch('change', element);
                        });
                    };
                    delete options.autosave;
                }
                if (options.locale && options.i18n)
                {
                    tinymce.util.I18n.add(options.locale, options.i18n);
                    delete options.locale;
                    delete options.i18n;
                }
                var prev_editor = tinymce.get(element.id);
                if (prev_editor) prev_editor.remove();
                if (options.delayedInit)
                {
                    setTimeout(function(){tinymce.init(options);}, +options.delayedInit);
                }
                else
                {
                    tinymce.init(options);
                }
            })();"), array('tinymce'));
        }
        else
        {
            $wclass = 'w-widget w-textarea'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
            self::enqueue('styles', 'htmlwidgets.css');
        }
        return "<textarea id=\"$wid\" $wname $wtitle class=\"$wclass\" $wstyle placeholder=\"$wplaceholder\" $wextra>$wvalue</textarea>";
    }

    public static function w_date($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : (isset($options['value']) ? $options['value'] : "");
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wclass = 'w-widget w-text w-date'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if (!empty($attr['icon']))
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if (!empty($attr['iconr']))
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        if (empty($attr['icon']) && empty($attr['iconr']))
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
        if (empty($options['format'])) $options['format'] = 'Y-m-d';
        self::enqueue('scripts', 'pikadaytime');
        self::enqueue('scripts', 'pikadaytime-'.$wid, array("(function(){
            if ('function' !== typeof(Pikadaytime)) return;
            var options = ".(!empty($options) ? json_encode($options) : '{}').";
            var locale = options.i18n, format = options.format;
            if ('function' === typeof(DateX))
            {
                var datetime_parse = DateX.getParser(format, locale);
                options.encoder = function(datetime) {return DateX.format(datetime, format, locale);};
                options.decoder = function(datetime) {return !!datetime && datetime_parse(datetime);};
            }
            else
            {
                options.encoder = function(datetime, pikaday) {return pikaday._o.showTime ? datetime.toString() : datetime.toDateString();};
                options.decoder = function(datetime) {return new Date(Date.parse(datetime));};
            }
            options.field = document.getElementById('".$wid."');
            if (options.delayedInit)
            {
                setTimeout(function(){new Pikadaytime(options);}, +options.delayedInit);
            }
            else
            {
                new Pikadaytime(options);
            }
        })();"), array('pikadaytime'));
        return "<span class=\"$wrapper_class\" $wstyle><input type=\"text\" id=\"$wid\" $wname $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" $wextra />$wicon</span>";
    }

    public static function w_time($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? $attr["name"] : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wformat = !empty($attr['format']) ? explode(":", $attr['format']) : array("h","m","s");
        if (isset($data['value']))
        {
            $wvalue = is_array($data['value']) ? $data['value'] : explode(':',$data['value']);
            while (count($wvalue) < 3) $wvalue[] = "00";
        }
        else
        {
            $wvalue = array("00", "00", "00");
        }
        $wclass = 'w-widget w-time'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $time_options = array(
            'h'=>array(),
            'm'=>array(),
            's'=>array()
        );
        for ($i=0; $i<60; $i++)
        {
            $tt = $i<10 ? '0'.$i : ''.$i;
            foreach ($wformat as $p=>$f)
            {
                if ('h' === $f && $i>=24) continue;
                $selected = $tt === $wvalue[$p] ? 'selected="selected"' : '';
                $time_options[$f][] = '<option value="'.$tt.'" '.$selected.'>'.$tt.'</option>';
            }
        }
        $wtimes = array();
        foreach ($wformat as $t)
        {
            $wnam = !empty($wname) ? 'name="'.$wname.'['.$t.']"' : '';
            $wtimes[] = '<select class="w-time-component" id="'.$wid.'_'.$t.'" '.$wnam.' '.$wtitle.' '.$wextra.'>'.implode('',$time_options[$t]).'</select>';
        }
        $wtimes = implode('<span class="w-time-sep">:</span>', $wtimes);
        self::enqueue('styles', 'htmlwidgets.css');
        return "<span class=\"$wclass\" $wstyle>$wtimes</span>";
    }

    public static function w_color($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
        if (empty($options['changeEvent'])) $options['changeEvent'] = 'change';
        if (empty($options['format'])) $options['format'] = 'rgba';
        if (!isset($options['color']) && isset($data['color'])) $options['color'] = $data['color'];
        if (!isset($options['opacity']) && isset($data['opacity'])) $options['opacity'] = $data['opacity'];
        if (!empty($options['input']))
        {
            $winput = '<input id="'.$options['input'].'" type="hidden" '.$wname.' value="" style="display:none" />';
        }
        else
        {
            $winput = '';
        }
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wclass = 'colorpicker-selector w-colorselector'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('scripts', 'colorpicker');
        self::enqueue('scripts', 'colorpicker-'.$wid, array("(function(){
            if ('function' !== typeof(ColorPicker)) return;
            var options = ".(!empty($options) ? json_encode($options) : '{}').";
            if (options.input) options.input = document.getElementById(options.input);
            if (options.delayedInit)
            {
                setTimeout(function(){new ColorPicker(document.getElementById('".$wid."'), options);}, +options.delayedInit);
            }
            else
            {
                new ColorPicker(document.getElementById('".$wid."'), options);
            }
        })();"), array('colorpicker'));
        return $winput."<div id=\"$wid\" $wtitle class=\"$wclass\" $wstyle $wextra></div>";
    }

    public static function w_file($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wclass = 'w-widget w-file w-text'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if (!empty($attr['icon']))
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if (!empty($attr['iconr']))
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('accept','multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        return "<label for=\"$wid\" class=\"$wrapper_class\" $wstyle><input type=\"file\" id=\"$wid\" $wname class=\"w-file-input\" value=\"$wvalue\" $wextra style=\"display:none !important\"/><input type=\"text\" id=\"text_input_$wid\" $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" form=\"__NONE__\" />$wicon</label>";
    }

    public static function w_table($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-widget w-table';
        /*
        if ( !empty($attr['stripped']) ) $wclass .= ' stripped';
        if ( !empty($attr['bordered']) ) $wclass .= ' bordered';
        if ( !empty($attr['responsive']) ) $wclass .= ' responsive';
        */
        if (!empty($attr['class'])) $wclass .= ' '.$attr['class'];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wcolumns = '';
        $data_cols = $data['columns'];
        $column_keys = array_keys($data_cols);
        $column_values = array_values($data_cols);
        foreach ($column_values as $c => $column)
        {
            $wcolumns .= "<th data-columnkey=\"{$column_keys[$c]}\"><span>".$column."</span></th>";
        }
        $wcolumns = "<tr>$wcolumns</tr>";
        $wheader = !isset($attr['header']) || !empty($attr['header']) ? '<thead>'.$wcolumns.'</thead>' : '';
        $wfooter = !empty($attr['footer']) ? '<tfoot>'.$wcolumns.'</tfoot>' : '';
        $wrows = '';
        foreach ($data['rows'] as $i => $row)
        {
            $rowid = isset($row['id']) ? $row['id'] : $i;
            $rowv = array_values(isset($row['cells']) ? $row['cells'] : $row);
            $wrows .= "\n" . "<tr data-row=\"$rowid\">";
            foreach ($column_values as $c => $column)
            {
                $wrows .= "<td data-columnkey=\"{$column_keys[$c]}\" data-column=\"{$column}\">{$rowv[$c]}</td>";
            }
            $wrows .= "</tr>";
        }
        $wdata = self::data($attr);
        self::enqueue('styles', 'htmlwidgets.css');
        if (!empty($attr['datatable']))
        {
            $options = isset($attr["options"]) && is_array($attr["options"]) ? $attr["options"] : array();
            $wclass .= ' w-datatable';
            self::enqueue('scripts', 'datatables');
            self::enqueue('scripts', 'datatables-'.$wid, array("(function(){
                if ('undefined' === typeof(jQuery) || 'function' !== typeof(jQuery.fn.dataTable)) return;
                var options = ".(!empty($options) ? json_encode($options) : '{}').";
                if (options.delayedInit)
                {
                    setTimeout(function(){jQuery(document.getElementById('".$wid."')).dataTable(options);}, +options.delayedInit);
                }
                else
                {
                    jQuery(document.getElementById('".$wid."')).dataTable(options);
                }
            })();"), array('datatables'));
        }
        return "<table id=\"$wid\" class=\"$wclass\" $wstyle $wextra $wdata>$wheader<tbody>$wrows</tbody>$wfooter</table>";
    }

    public static function w_media($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtype = empty($attr['type']) ? "video" : $attr['type'];
        if ('audio' !== $wtype) $wtype = 'video';
        $wclass = 'w-media w-'.$wtype;
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('title','width','height','src','controls','autoplay','loop','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wtext = empty($data['text']) ? '' : $data['text'];
        $wsources = empty($data['sources']) ? array() : (array)$data['sources'];
        $wsource = '';
        foreach ($wsources as $source)
        {
            // NOTE: use HtmlWidget::options() to format options accordingly to be used here
            $src = $source[0]; $src_type = $source[1];
            $wsource .= "<source src=\"{$src}\" type=\"{$src_type}\"></source>";
        }
        self::enqueue('scripts','html5media');
        return "<{$wtype} id=\"{$wid}\" class=\"{$wclass}\" {$wstyle} {$wextra}>{$wsource}{$wtext}</{$wtype}>";
    }

    public static function w_menu($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-widget'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::data($attr);
        if (!empty($data))
        {
            $out = "<nav id=\"$wid\" class=\"$wclass\" $wstyle $wextra $wdata>\n";
            if (!empty($attr['mobile']))
            {
                $out .= '<label for="mobile-menu_'.$wid.'" class="w-menu-controller-bt"><i class="fa fa-bars fa-2x"></i>&nbsp;</label><input id="mobile-menu_'.$wid.'" type="checkbox" class="w-menu-controller" value="1" />'."\n";
            }
            $out .= self::menu((array)$data);
            $out .= '</nav>';
            self::enqueue('styles', 'htmlwidgets.css');
            return $out;
        }
        else
        {
            return "<nav id=\"$wid\" class=\"$wclass\" $wstyle $wextra $wdata>";
        }
    }

    public static function w_menu_end($attr, $data, $widgetName = null)
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return "</nav>";
    }

    public static function w_pagination($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-pagination pagination'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $totalItems = (int)$data['totalItems'];
        $itemsPerPage = (int)$data['itemsPerPage'];
        $currentPage = isset($data['currentPage']) ? (int)$data['currentPage'] : 1;
        $maxPagesToShow = isset($attr['maxPages']) ? (int)$attr['maxPages'] : 10;
        $placeholder = isset($attr['placeholder']) ? (string)$attr['placeholder'] : '(:page)';
        $urlPattern = isset($attr['urlPattern']) ? (string)$attr['urlPattern'] : '?page='.$placeholder;
        $previousText = isset($attr['previousText']) ? (string)$attr['previousText'] : '&laquo; Previous';
        $nextText = isset($attr['nextText']) ? (string)$attr['nextText'] : 'Next &raquo;';
        $ellipsis = isset($attr['ellipsis']) ? (string)$attr['ellipsis'] : '...';
        $selectBox = !empty($attr['selectBox']);

        $numPages = 0 >= $itemsPerPage || 0 >= $totalItems ? 0 : (int)ceil($totalItems/$itemsPerPage);
        if ($numPages > 1)
        {
            $pages = array();
            if ($numPages <= $maxPagesToShow)
            {
                for ($i=1; $i<=$numPages; $i++)
                {
                    $pages[] = array(
                        'text' => $i,
                        'url' => str_replace($placeholder, (string)$i, $urlPattern),
                        'isCurrent' => $i==$currentPage
                    );
                }
            }
            else
            {
                // Determine the sliding range, centered around the current page.
                $numAdjacents = (int)floor(($maxPagesToShow - 3) / 2);

                if ($currentPage + $numAdjacents > $numPages)
                {
                    $slidingStart = $numPages - $maxPagesToShow + 2;
                }
                else
                {
                    $slidingStart = $currentPage - $numAdjacents;
                }
                if ($slidingStart < 2) $slidingStart = 2;

                $slidingEnd = $slidingStart + $maxPagesToShow - 3;
                if ($slidingEnd >= $numPages) $slidingEnd = $numPages - 1;

                // Build the list of pages.
                $pages[] = array(
                    'text' => 1,
                    'url' => str_replace($placeholder, (string)1, $urlPattern),
                    'isCurrent' => 1==$currentPage
                );
                if ($slidingStart > 2)
                {
                    $pages[] = array(
                        'text' => $ellipsis,
                        'url' => null,
                        'isCurrent' => false
                    );
                }
                for ($i=$slidingStart; $i<=$slidingEnd; $i++)
                {
                    $pages[] = array(
                        'text' => $i,
                        'url' => str_replace($placeholder, (string)$i, $urlPattern),
                        'isCurrent' => $i==$currentPage
                    );
                }
                if ($slidingEnd < $numPages - 1)
                {
                    $pages[] = array(
                        'text' => $ellipsis,
                        'url' => null,
                        'isCurrent' => false
                    );
                }
                $pages[] = array(
                    'text' => $numPages,
                    'url' => str_replace($placeholder, (string)$numPages, $urlPattern),
                    'isCurrent' => $numPages==$currentPage
                );
            }

            if ($selectBox)
            {
                $out = "<div id=\"$wid\" class=\"$wclass\" $wstyle $wextra>";
                if ($currentPage > 1)
                {
                    $out .= '<span class="page-previous"><a href="' . htmlspecialchars(str_replace($placeholder, (string)($currentPage-1), $urlPattern), ENT_COMPAT) . '">'. $previousText .'</a></span>';
                }

                $out .= '<select class="page-select">';
                foreach ($pages as $page)
                {
                    if ($page['url'])
                    {
                        $out .= '<option value="' . htmlspecialchars($page['url'], ENT_COMPAT) . '"'  . ($page['isCurrent'] ? ' selected' : '') . '>' . (string)$page['text'] . '</option>';
                    }
                    else
                    {
                        $out .= '<option disabled>' . (string)$page['text'] . '</option>';
                    }
                }
                $out .= '</select>';

                if ($currentPage < $numPages)
                {
                    $out .= '<span class="page-next"><a href="' . htmlspecialchars(str_replace($placeholder, (string)($currentPage+1), $urlPattern), ENT_COMPAT) . '">'. $nextText .'</a></span>';
                }
                $out .= '</div>';
            }
            else
            {
                $out = "<ul id=\"$wid\" class=\"$wclass\" $wstyle $wextra>";
                if ($currentPage > 1)
                {
                    $out .= '<li class="page-item page-previous"><a class="page-link" href="' . htmlspecialchars(str_replace($placeholder, (string)($currentPage-1), $urlPattern), ENT_COMPAT) . '">'. $previousText .'</a></li>';
                }

                foreach ($pages as $page)
                {
                    if ($page['url'])
                    {
                        $out .= '<li class="page-item' . (1==$page['text'] ? ' page-first' : '') . ($numPages==$page['text'] ? ' page-last' : '') . ($page['isCurrent'] ? ' page-active active' : '') . '"><a class="page-link" href="' . htmlspecialchars($page['url'], ENT_COMPAT) . '">' . (string)$page['text'] . '</a></li>';
                    }
                    else
                    {
                        $out .= '<li class="page-item disabled"><span>' . (string)$page['text'] . '</span></li>';
                    }
                }

                if ($currentPage < $numPages)
                {
                    $out .= '<li class="page-item page-next"><a class="page-link" href="' . htmlspecialchars(str_replace($placeholder, (string)($currentPage+1), $urlPattern), ENT_COMPAT) . '">'. $nextText .'</a></li>';
                }
                $out .= '</ul>';
            }
            self::enqueue('styles', 'htmlwidgets.css');
            return $out;
        }
        else
        {
            return '';
        }
    }

    public static function w_delayable($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-delayable-overlay';
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wspinner = 'w-spinner';
        $wspinner .= !empty($attr['spinner']) ? " {$attr['spinner']}" : " w-spinner-dots";
        self::enqueue('styles', 'htmlwidgets.css');
        return "<div id=\"$wid\" class=\"$wclass\" $wstyle $wextra><div class=\"$wspinner\"></div></div>";
    }

    public static function w_disabable($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-disabable-overlay';
        if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        self::enqueue('styles', 'htmlwidgets.css');
        return "<div id=\"$wid\" class=\"$wclass\" $wstyle $wextra></div>";
    }

    public static function w_morphable($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-morphable';
        $wmodes = (array)$attr['modes'];
        $wmode_class = !empty($attr['mode']) ? $attr['mode'] : 'mode-${MODE}';
        $wshow_class = !empty($attr['show']) ? $attr['show'] : 'show-if-${MODE}';
        $whide_class = !empty($attr['hide']) ? $attr['hide'] : 'hide-if-${MODE}';
        $wselector = "#{$wid}.w-morphable:not(.w-animated-morphable)";
        $wselector_animated = "#{$wid}.w-morphable.w-animated-morphable";
        $wshow_selector = array();
        $whide_selector = array();
        $wshow_selector__important = array();
        $whide_selector__important = array();
        $wshow_selector_animated = array();
        $whide_selector_animated = array();
        $wshow_selector_animated__important = array();
        $whide_selector_animated__important = array();
        foreach ($wmodes as $mode)
        {
            $mode_class = str_replace('${MODE}', $mode, $wmode_class);
            $whide_sel = ' .w-morphable-item.' . str_replace('${MODE}', $mode, $whide_class);
            $whide_not_sel = ' .w-morphable-item.' . str_replace('${MODE}', 'not-'.$mode, $whide_class);
            $wshow_sel = ' .w-morphable-item.' . str_replace('${MODE}', $mode, $wshow_class);
            $wshow_not_sel = ' .w-morphable-item.' . str_replace('${MODE}', 'not-'.$mode, $wshow_class);

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
            $wshow_selector[] = $wselector.'.w-morphable-level-1 > .w-morphable-item';
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-level-1 > .w-morphable-item';

            $whide_selector__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.'.w-morphable-level-1 >'.$whide_sel;
            $whide_selector__important[] = $wselector.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$whide_sel;

            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.'.w-morphable-level-1 >'.$wshow_sel;
            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.'.w-morphable-level-1 >'.$wshow_not_sel;
            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.'.w-morphable-level-1 >'.$whide_not_sel;
            $whide_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$wshow_sel;
            $whide_selector[] = $wselector.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$wshow_not_sel;
            $whide_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$whide_not_sel;


            $wshow_selector__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.'.w-morphable-level-1 >'.$wshow_sel;
            $wshow_selector__important[] = $wselector.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$wshow_sel;

            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.'.w-morphable-level-1 >'.$whide_sel;
            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.'.w-morphable-level-1 >'.$whide_not_sel;
            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.'.w-morphable-level-1 >'.$wshow_not_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$whide_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$whide_not_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$wshow_not_sel;


            $whide_selector_animated__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.'.w-morphable-level-1 >'.$whide_sel;
            $whide_selector_animated__important[] = $wselector_animated.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$whide_sel;

            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.'.w-morphable-level-1 >'.$wshow_sel;
            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.'.w-morphable-level-1 >'.$wshow_not_sel;
            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.'.w-morphable-level-1 >'.$whide_not_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$wshow_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$wshow_not_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$whide_not_sel;


            $wshow_selector_animated__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.'.w-morphable-level-1 >'.$wshow_sel;
            $wshow_selector_animated__important[] = $wselector_animated.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$wshow_sel;

            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.'.w-morphable-level-1 >'.$whide_sel;
            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.'.w-morphable-level-1 >'.$whide_not_sel;
            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.'.w-morphable-level-1 >'.$wshow_not_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$whide_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class.'.$mode_class.'.w-morphable-level-1 >'.$whide_not_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.').w-morphable-level-1 >'.$wshow_not_sel;


            // any level
            $wshow_selector[] = $wselector.':not(.w-morphable-level-1) .w-morphable-item';
            $wshow_selector_animated[] = $wselector_animated.':not(.w-morphable-level-1) .w-morphable-item';

            $whide_selector__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.':not(.w-morphable-level-1)'.$whide_sel;
            $whide_selector__important[] = $wselector.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$whide_sel;

            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.':not(.w-morphable-level-1)'.$wshow_sel;
            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $whide_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.':not(.w-morphable-level-1)'.$whide_not_sel;
            $whide_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$wshow_sel;
            $whide_selector[] = $wselector.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $whide_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$whide_not_sel;


            $wshow_selector__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.':not(.w-morphable-level-1)'.$wshow_sel;
            $wshow_selector__important[] = $wselector.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$wshow_sel;

            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.':not(.w-morphable-level-1)'.$whide_sel;
            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector.':not(.w-morphable-level-1)'.$whide_not_sel;
            $wshow_selector[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$whide_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$whide_not_sel;
            $wshow_selector[] = $wselector.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$wshow_not_sel;


            $whide_selector_animated__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$whide_sel;
            $whide_selector_animated__important[] = $wselector_animated.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$whide_sel;

            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$wshow_sel;
            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $whide_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$whide_not_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$wshow_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $whide_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$whide_not_sel;


            $wshow_selector_animated__important[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$wshow_sel;
            $wshow_selector_animated__important[] = $wselector_animated.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$wshow_sel;

            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$whide_sel;
            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:checked ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$whide_not_sel;
            $wshow_selector_animated[] = 'input[data-morph-'.$wid.'="'.$mode_class.'"]:not(:checked) ~ '.$wselector_animated.':not(.w-morphable-level-1)'.$wshow_not_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$whide_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class.'.$mode_class.':not(.w-morphable-level-1)'.$whide_not_sel;
            $wshow_selector_animated[] = $wselector_animated.'.w-morphable-class:not(.'.$mode_class.'):not(.w-morphable-level-1)'.$wshow_not_sel;
        }
        $wstyle = '';

        $wstyle .= implode(',',$whide_selector) . '{display: none !important}';
        $wstyle .= implode(',',$wshow_selector) . '{display: block}';
        $wstyle .= implode(',',$whide_selector__important) . '{display: none !important}';
        $wstyle .= implode(',',$wshow_selector__important) . '{display: block !important}';

        $wstyle .= implode(',',$whide_selector_animated) . "{
pointer-events: none !important; overflow: hidden !important;
min-width: 0 !important; max-width: 0 !important;
min-height: 0 !important; max-height: 0 !important; opacity: 0 !important;
-webkit-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-moz-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-ms-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-o-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
}";
        $wstyle .= implode(',',$wshow_selector_animated) . "{
overflow: hidden !important;
min-width: 0 !important; max-width: 5000px; min-height: 0 !important; max-height: 5000px; opacity: 1;
-webkit-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-moz-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-ms-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-o-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
}";
        $wstyle .= implode(',',$whide_selector_animated__important) . "{
pointer-events: none !important; overflow: hidden !important;
min-width: 0 !important; max-width: 0 !important;
min-height: 0 !important; max-height: 0 !important; opacity: 0 !important;
-webkit-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-moz-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-ms-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
-o-transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
transition: opacity 0.4s ease, max-width 0.6s ease 0.2s, max-height 0.6s ease 0.2s;
}";
        $wstyle .= implode(',',$wshow_selector_animated__important) . "{
overflow: hidden !important;
min-width: 0 !important; max-width: 5000px !important; min-height: 0 !important; max-height: 5000px !important; opacity: 1 !important;
-webkit-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-moz-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-ms-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
-o-transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
transition: opacity 0.4s ease 0.2s, max-width 0.6s ease, max-height 0.6s ease;
}";
        self::enqueue('styles', "w-morphable-$wid", array($wstyle), array('htmlwidgets.css'));
        return '';
    }

    public static function w_panel($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-panel'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wtitle = !empty($attr['title']) ? $attr['title'] : '&nbsp;';
        $wchecked = !empty($attr['opened']) ? 'checked' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::data($attr);

        self::enqueue('styles', 'htmlwidgets.css');
        return "<input type=\"checkbox\" id=\"controller_{$wid}\" class=\"w-panel-controller\" value=\"1\" $wchecked/><div id=\"{$wid}\" class=\"$wclass\" $wstyle $wextra $wdata><div class=\"w-panel-header\">$wtitle<label class=\"w-panel-controller-button fa fa-2x\" for=\"controller_{$wid}\" onclick=\"\"></label></div><div class=\"w-panel-content\">";
    }

    public static function w_panel_end($attr, $data, $widgetName = null)
    {
        return "</div></div>";
    }

    public static function w_accordeon($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wheight = !empty($attr['height']) ? $attr['height'] : '1500px';
        $wtype = !empty($attr['independent']) ? 'checkbox' : 'radio';
        $witems = (array)$attr['items'];

        $wctrl = "ctrl_{$wid}";
        $wcontrollers = "<input name=\"{$wctrl}\" type=\"{$wtype}\" id=\"item_" . implode( "\" class=\"w-transition-controller w-{$wctrl}-controller\"/><input name=\"{$wctrl}\" type=\"{$wtype}\" id=\"item_", $witems ) . "\" class=\"w-transition-controller w-{$wctrl}-controller\"/>";

        $wstyle = '';

        // de-activate
        $wselector = array();
        foreach ($witems as $witem)
            $wselector[] = ".w-{$wctrl}-controller.w-transition-controller:not(#item_{$witem}):checked ~ {$wcontext}#{$witem}";
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
            $wselector[] = "#item_{$witem}.w-{$wctrl}-controller.w-transition-controller:checked ~ {$wcontext}#{$witem}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    max-height: {$wheight};
    -webkit-transition: max-height .2s ease .1s;
    -moz-transition: max-height .2s ease .1s;
    -ms-transition: max-height .2s ease .1s;
    -o-transition: max-height .2s ease .1s;
    transition: max-height .2s ease .1s;
}
OUT;
        self::enqueue('styles', "w-accordeon-$wid", array($wstyle), array('htmlwidgets.css'));
        return $wcontrollers;
    }

    public static function w_tabs($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wtabs = (array)$attr['tabs'];
        //$wselected = !empty($data['selected']) ? $data['selected'] : 0;

        if (!empty($attr['3d']))
        {
            $wtransform1 = 'w-fx-slideout-3d';
            $wtransform2 = 'w-fx-slidein-3d';
        }
        else
        {
            $wtransform1 = 'w-fx-slideout';
            $wtransform2 = 'w-fx-slidein';
        }

        $wctrl = "ctrl_{$wid}";
        $wcontrollers = "<input name=\"{$wctrl}\" checked type=\"radio\" id=\"tab_" . implode( "\" class=\"w-transition-controller w-{$wctrl}-controller\"/><input name=\"{$wctrl}\" type=\"radio\" id=\"tab_", $wtabs ) . "\" class=\"w-transition-controller w-{$wctrl}-controller\"/>";

        $wstyle = '';

        // de-activate
        $wselector = array();
        foreach ($wtabs as $wtab)
            $wselector[] = ".w-{$wctrl}-controller.w-transition-controller:not(#tab_{$wtab}):checked ~ {$wcontext}#{$wtab}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: absolute;

    -webkit-animation-name: {$wtransform1};
    -moz-animation-name: {$wtransform1};
    -ms-animation-name: {$wtransform1};
    -o-animation-name: {$wtransform1};
    animation-name: {$wtransform1};

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
            $wselector[] = "#tab_{$wtab}.w-{$wctrl}-controller.w-transition-controller:checked ~ {$wcontext}#{$wtab}";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: relative;
    z-index: 10;

    -webkit-animation-name: {$wtransform2};
    -moz-animation-name: {$wtransform2};
    -ms-animation-name: {$wtransform2};
    -o-animation-name: {$wtransform2};
    animation-name: {$wtransform2};

    -webkit-animation-timing-function: ease-in;
    -moz-animation-timing-function: ease-in;
    -ms-animation-timing-function: ease-in;
    -o-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
}
OUT;
        self::enqueue('styles', "w-tabs-$wid", array($wstyle), array('htmlwidgets.css'));
        return $wcontrollers;
    }

    public static function w_pages($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wpages = (array)$attr['pages'];

        if (!empty($attr['3d']))
        {
            $wtransform1 = 'translate3d(0px,0px,0px)';
            $wtransform2 = 'translate3d(-100%,0px,0px)';
            $wtransform3 = 'translate3d(100%,0px,0px)';
        }
        else
        {
            $wtransform1 = 'translateX(0px)';
            $wtransform2 = 'translateX(-100%)';
            $wtransform3 = 'translateX(100%)';
        }

        $wcontrollers = "<span id=\"page_" . implode( "\" class=\"w-page-controller\"></span><span id=\"page_", $wpages ) . "\" class=\"w-page-controller\"></span>";

        $wstyle = '';

        // main page
        $main_page = array_shift( $wpages );
        $wstyle .= <<<OUT
#{$main_page}.w-page
{
    position: relative;
    -webkit-transform: {$wtransform1};
    -moz-transform: {$wtransform1};
    -ms-transform: {$wtransform1};
    -o-transform: {$wtransform1};
    transform: {$wtransform1};
}
.w-page-controller:not(#page_{$main_page}):target ~ {$wcontext}#{$main_page}.w-page
{
    position: absolute;

    -webkit-transform: {$wtransform2};
    -moz-transform: {$wtransform2};
    -ms-transform: {$wtransform2};
    -o-transform: {$wtransform2};
    transform: {$wtransform2};

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
            $wselector[] = "#page_{$wpage}.w-page-controller:not(:target) ~ {$wcontext}#{$wpage}.w-page";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    -webkit-transform: {$wtransform3};
    -moz-transform: {$wtransform3};
    -ms-transform: {$wtransform3};
    -o-transform: {$wtransform3};
    transform: {$wtransform3};
}
OUT;
        $wselector = array();
        foreach ($wpages as $wpage)
            $wselector[] = "#page_{$wpage}.w-page-controller:target ~ {$wcontext}#{$wpage}.w-page";
        $wselector = implode(',', $wselector);
        $wstyle .= <<<OUT
{$wselector}
{
    position: relative;

    -webkit-transform: {$wtransform1};
    -moz-transform: {$wtransform1};
    -ms-transform: {$wtransform1};
    -o-transform: {$wtransform1};
    transform: {$wtransform1};

    -webkit-transition: -webkit-transform .3s ease;
    -moz-transition: -moz-transform .3s ease;
    -ms-transition: -ms-transform .3s ease;
    -o-transition: -o-transform .3s ease;
    transition: transform .3s ease;
}
OUT;
        self::enqueue('styles', "w-pages-$wid", array($wstyle), array('htmlwidgets.css'));
        return $wcontrollers;
    }

    public static function w_tooltip($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'w-tooltip'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        if (!empty($attr['icon']))
        {
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        elseif (!empty($attr['iconr']))
        {
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        if (!empty($attr['tooltip']))
        {
            if ('top' === $attr['tooltip'])
                $warrow = '<div class="w-tooltip-arrow w-arrow-bottom"></div>';
            elseif ('bottom' === $attr['tooltip'])
                $warrow = '<div class="w-tooltip-arrow w-arrow-top"></div>';
            elseif ('right' === $attr['tooltip'])
                $warrow = '<div class="w-tooltip-arrow w-arrow-left"></div>';
            else
                $warrow = '<div class="w-tooltip-arrow w-arrow-right"></div>';
        }
        else
        {
            $warrow = '<div class="w-tooltip-arrow w-arrow-right"></div>';
        }
        $wdata = self::data($attr);
        self::enqueue('styles', 'htmlwidgets.css');
        return "<div id=\"$wid\" class=\"$wclass\" $wstyle $wextra title=\"$wtitle\" $wdata>{$wtext}{$warrow}</div>";
    }

    public static function w_animation($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid('widget_animation');
        $wselector = isset($attr["selector"]) ? $attr["selector"] : '.animate-'.$wid;
        $wanimation = !empty($attr['animation']) ? $attr['animation'] : '';
        $wtransition = !empty($attr['transition']) ? $attr['transition'] : '';
        $wduration = isset($attr['duration']) ? $attr['duration'] : '0.5s';
        $wdelay = isset($attr['delay']) ? $attr['delay'] : '0s';
        $wtiming_function = !empty($attr['timing-function']) ? $attr['timing-function'] : '';
        $weasing = !empty($attr['easing']) ? $attr['easing'] : 'linear';
        if (empty($wtiming_function)) $wtiming_function = $weasing;
        $witeration_count = !empty($attr['iteration-count']) ? $attr['iteration-count'] : '1';
        $wfill_mode = !empty($attr['fill-mode']) ? $attr['fill-mode'] : 'both';
        $wanimation_def = '';
        if (!empty($wanimation))
        {
            $wanimation_def .= <<<OUT
{$wselector}
{
-webkit-animation-duration: {$wduration};
-moz-animation-duration: {$wduration};
-ms-animation-duration: {$wduration};
-o-animation-duration: {$wduration};
animation-duration: {$wduration};

-webkit-animation-delay: {$wdelay};
-moz-animation-delay: {$wdelay};
-ms-animation-delay: {$wdelay};
-o-animation-delay: {$wdelay};
animation-delay: {$wdelay};

-webkit-animation-iteration-count: {$witeration_count};
-moz-animation-iteration-count: {$witeration_count};
-ms-animation-iteration-count: {$witeration_count};
-o-animation-iteration-count: {$witeration_count};
animation-iteration-count: {$witeration_count};

-webkit-animation-timing-function: {$wtiming_function};
-moz-animation-timing-function: {$wtiming_function};
-ms-animation-timing-function: {$wtiming_function};
-o-animation-timing-function: {$wtiming_function};
animation-timing-function: {$wtiming_function};

-webkit-animation-fill-mode: {$wfill_mode};
-moz-animation-fill-mode: {$wfill_mode};
-ms-animation-fill-mode: {$wfill_mode};
-o-animation-fill-mode: {$wfill_mode};
animation-fill-mode: {$wfill_mode};

-webkit-animation-name: {$wid};
-moz-animation-name: {$wid};
-ms-animation-name: {$wid};
-o-animation-name: {$wid};
animation-name: {$wid};
}
@-webkit-keyframes {$wid}
{
$wanimation
}
@keyframes {$wid}
{
$wanimation
}
OUT;
        }
        if (!empty($wtransition))
        {
            $wanimation_def .= <<<OUT
{$wselector}
{
-webkit-transition: {$wtransition} {$wduration} {$wtiming_function} {$wdelay};
-moz-transition: {$wtransition} {$wduration} {$wtiming_function} {$wdelay};
-ms-transition: {$wtransition} {$wduration} {$wtiming_function} {$wdelay};
-o-transition: {$wtransition} {$wduration} {$wtiming_function} {$wdelay};
transition: {$wtransition} {$wduration} {$wtiming_function} {$wdelay};
}
OUT;
        }
        self::enqueue('styles', 'w-animation-'.$wid, array($wanimation_def), array('htmlwidgets.css'));
        return '';
    }

    public static function w_sprite($attr, $data, $widgetName = null)
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid('widget_sprite');
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wanimation = isset($attr["animation"]) ? $attr["animation"] : 'sprite-'.$wid;
        $wclass = 'w-sprite '.$wanimation.'-class'; if (!empty($attr["class"])) $wclass .= ' '.$attr["class"];
        $wsprite = isset($attr["sprite"]) ? $attr["sprite"] : $wid;
        $witer = isset($attr["iteration"]) ? $attr["iteration"] : 'infinite';
        $wfps = isset($attr['fps']) ? (int)$attr['fps'] : 12;
        $ww = isset($attr['width']) ? (int)$attr['width'] : 100;
        $wh = isset($attr['height']) ? (int)$attr['height'] : 100;
        $wr = isset($attr['rows']) ? (int)$attr['rows'] : 1;
        $wc = isset($attr['columns']) ? (int)$attr['columns'] : 1;
        $nframes = $wr*$wc; $d = $nframes/$wfps;
        $factX = $wc; $factY = $wr;
        $aspect_ratio = 100*$wh/$ww;
        $background_size = ''.(100*$wc).'% '.(100*$wr).'%';

        /*if ( (false !== strpos(' '.$wclass.' ',' w-sprite-responsive ')) || (false !== strpos(' '.$wclass.' ',' sprite-responsive ')) )
        {
            $factX = $wc;
            $factY = $wr;
        }*/

        if ((1 < $wr) && (1 < $wc))
        {
            // background-position-x, background-position-y NOT supported very good
            $two_dim_grid = true;
            $attX = "background-position-x"; $attY = "background-position-y";
            $iniX = "0%"; $iniY = "0%";
            $finX = "-".($factX*100)."%"; $finY = "-".($factY*100)."%";
            $animation_name = "{$wanimation}-grid-x, {$wanimation}-grid-y";
            $animation_duration = ''.($d/$wr).'s, '.$d.'s';
            $animation_delay = '0s, 0s';
            $animation_timing = "steps({$wc}), steps({$wr})";
            $animation_iteration = "{$witer}, {$witer}";
        }
        else if (1 < $wr)
        {
            $two_dim_grid = false;
            $attX = "background-position";
            $iniX = "0% 0%";
            $finX = "0% -".($factY*100)."%";
            $animation_name = "{$wanimation}-grid-x";
            $animation_duration = ''.$d.'s';
            $animation_delay = '0s';
            $animation_timing = "steps({$wr})";
            $animation_iteration = "{$witer}";
        }
        else
        {
            $two_dim_grid = false;
            $attX = "background-position";
            $iniX = "0% 0%";
            $finX = "-".($factX*100)."% 0%";
            $animation_name = "{$wanimation}-grid-x";
            $animation_duration = ''.$d.'s';
            $animation_delay = '0s';
            $animation_timing = "steps({$wc})";
            $animation_iteration = "{$witer}";
        }
        $wsprite_def = <<<OUT
#{$wid}.w-sprite.{$wanimation}-class
{
width: {$ww}px; height: {$wh}px;
background-image: url("{$wsprite}");
background-repeat: none;
background-position: 0% 0%;
background-size: auto auto;
-webkit-animation-name: {$animation_name};
-webkit-animation-duration: {$animation_duration};
-webkit-animation-delay: {$animation_delay};
-webkit-animation-timing-function: {$animation_timing};
-webkit-animation-iteration-count: {$animation_iteration};
-moz-animation-name: {$animation_name};
-moz-animation-duration: {$animation_duration};
-moz-animation-delay: {$animation_delay};
-moz-animation-timing-function: {$animation_timing};
-moz-animation-iteration-count: {$animation_iteration};
-ms-animation-name: {$animation_name};
-ms-animation-duration: {$animation_duration};
-ms-animation-delay: {$animation_delay};
-ms-animation-timing-function: {$animation_timing};
-ms-animation-iteration-count: {$animation_iteration};
-o-animation-name: {$animation_name};
-o-animation-duration: {$animation_duration};
-o-animation-delay: {$animation_delay};
-o-animation-timing-function: {$animation_timing};
-o-animation-iteration-count: {$animation_iteration};
animation-name: {$animation_name};
animation-duration: {$animation_duration};
animation-delay: {$animation_delay};
animation-timing-function: {$animation_timing};
animation-iteration-count: {$animation_iteration};
}
#{$wid}.w-sprite.responsive.{$wanimation}-class,
#{$wid}.w-sprite.sprite-responsive.{$wanimation}-class,
#{$wid}.w-sprite.w-sprite-responsive.{$wanimation}-class
{
width: 100% !important; height: auto !important;
padding-bottom: {$aspect_ratio}% !important;
background-size: {$background_size} !important;
}
@-webkit-keyframes {$wanimation}-grid-x {
    0% { {$attX}: {$iniX}; }
    100% { {$attX}: {$finX}; }
}
@-moz-keyframes {$wanimation}-grid-x {
    0% { {$attX}: {$iniX}; }
    100% { {$attX}: {$finX}; }
}
@-ms-keyframes {$wanimation}-grid-x {
    0% { {$attX}: {$iniX}; }
    100% { {$attX}: {$finX}; }
}
@-o-keyframes {$wanimation}-grid-x {
    0% { {$attX}: {$iniX}; }
    100% { {$attX}: {$finX}; }
}
@keyframes {$wanimation}-grid-x {
    0% { {$attX}: {$iniX}; }
    100% { {$attX}: {$finX}; }
}
OUT;
    if ($two_dim_grid)
    {
        $wsprite_def .= <<<OUT
@-webkit-keyframes {$wanimation}-grid-y {
    0% { {$attY}: {$iniY}; }
    100% { {$attY}: {$finY}; }
}
@-moz-keyframes {$wanimation}-grid-y {
    0% { {$attY}: {$iniY}; }
    100% { {$attY}: {$finY}; }
}
@-ms-keyframes {$wanimation}-grid-y {
    0% { {$attY}: {$iniY}; }
    100% { {$attY}: {$finY}; }
}
@-o-keyframes {$wanimation}-grid-y {
    0% { {$attY}: {$iniY}; }
    100% { {$attY}: {$finY}; }
}
@keyframes {$wanimation}-grid-y {
    0% { {$attY}: {$iniY}; }
    100% { {$attY}: {$finY}; }
}
OUT;
    }
        self::enqueue('styles', 'w-sprite-'.$wid, array($wsprite_def), array('htmlwidgets.css'));
        return "<div id=\"{$wid}\" class=\"{$wclass}\" title=\"{$wtitle}\" {$wstyle} {$wextra}>{$wtext}</div>";
    }
}
HtmlWidget::$BASE = dirname(__FILE__);
}