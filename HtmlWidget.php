<?php
/**
*  HtmlWidget
*  html widgets used as (template) plugins and/or standalone, for PHP, Node/XPCOM/JS, Python
*
*  @dependencies: FontAwesome, jQuery, SelectorListener
*  @version: 0.8.8
*  https://github.com/foo123/HtmlWidget
*  https://github.com/foo123/components.css
*  https://github.com/foo123/responsive.css
*  https://github.com/foo123/jquery-ui-widgets
*  https://github.com/foo123/modelview-widgets
*  https://github.com/foo123/SelectorListener
*
**/
if ( !class_exists('HtmlWidget') )
{
class HtmlWidget
{
    const VERSION = "0.8.8";
    public static $BASE = './';
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
    
    public static function assets( $opts=array() )
    {
        $opts = array_merge(array(
            'base'      => '',
            'full'      => true,
            'jquery'    => false,
            'dev'       => false,
            'cdn'       => false
        ), (array)$opts);
        
        $dev = true === $opts['dev']; $cdn = true === $opts['cdn'];
        $base = $opts['base'];
        if ( empty($base) ) $base = '';
        $base = $base . ('/' === substr($base, -1)  ? '' : '/');
        $asset_base = $base . 'assets/';
        
        $assets = array(
         array('styles', 'htmlwidgets.css', $dev ? $base.'htmlwidgets.dev.css' : $base.'htmlwidgets.css')
        ,array('styles', 'normalize.css', $asset_base.'normalize.css')
        ,array('styles', 'responsive.css', $asset_base.'responsive.css')
        ,array('styles', 'fontawesome.css', $asset_base.'fontawesome.css')
        ,array('scripts', 'selectorlistener', $asset_base.'selectorlistener.js')
        ,array('scripts', 'htmlwidgets', $dev ? $base.'htmlwidgets.dev.js' : $base.'htmlwidgets.js', array('htmlwidgets.css','jquery','selectorlistener'))
        );
        if ( true === $opts['jquery'] )
        {
            $assets = array_merge($assets, $cdn
            ? array(
                 array('scripts', 'jquery', 'https://code.jquery.com/jquery-1.12.3.min.js')
                //,array('scripts', 'jquery-2.x', 'https://code.jquery.com/jquery-2.2.3.min.js')
                ,array('scripts', 'jquery-ui', 'https://code.jquery.com/ui/1.11.4/jquery-ui.min.js', array('jquery'))
            )
            : array(
                 array('scripts', 'jquery', $asset_base.'jquery.js')
                ,array('scripts', 'jquery-ui', $asset_base.'jquery-ui.js', array('jquery'))
                //,array('scripts', 'jquery-iframe-transport', $asset_base.'jquery.iframe-transport.js', array('jquery'))
            )
            );
        }
        if ( true === $opts['full'] )
        {
            $assets = array_merge($assets, array(
             array('scripts', 'cdn--google-maps', 'http://maps.google.com/maps/api/js?libraries=places')
            
            // Humane
            ,array('styles', 'humane.css', $asset_base.'humane.css')
            ,array('scripts', 'humane', $asset_base.'humane.js', array('humane.css'))
            
            // History
            ,array('scripts', 'history', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/history/3.0.0-2/history.min.js'
            : $asset_base.'history.js'
            )
            
            // Cookie
            ,array('scripts', 'cookie', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.1/js.cookie.min.js'
            : $asset_base.'cookie.js'
            )
            
            // isMobile
            ,array('scripts', 'ismobile', $asset_base.'ismobile.js')
            
            // Modernizr
            ,array('scripts', 'modernizr', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js'
            : $asset_base.'modernizr.js'
            )
            
            // Typo
            ,array('scripts', 'typo', $asset_base.'typo/typo.js')
            
            // html5media
            ,array('scripts', 'html5media', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/html5media/1.1.8/html5media.min.js'
            : $asset_base.'html5media/html5media.js'
            )
            
            // video.js
            ,array('styles', 'video-js.css', $cdn
            ? 'http://vjs.zencdn.net/vjs-version/video-js.css'
            : $asset_base.'video.js/video-js.css'
            )
            ,array('scripts', 'video.js', $cdn
            ? 'http://vjs.zencdn.net/vjs-version/video.js'
            : $asset_base.'video.js/video.js'
            , array('video-js.css'))
            
            // Timer
            ,array('scripts', 'timer', $asset_base.'timer.js')
            
            // DateX
            ,array('scripts', 'datex', $asset_base.'datex.js')
            
            // Pikadaytime
            ,array('styles', 'pikadaytime.css', $asset_base.'pikadaytime.css')
            ,array('scripts', 'pikadaytime', $asset_base.'pikadaytime.js', array('pikadaytime.css','datex'))
             
            // ColorPicker
            ,array('styles', 'colorpicker.css', $asset_base.'colorpicker.css')
            ,array('scripts', 'colorpicker', $asset_base.'colorpicker.js', array('colorpicker.css'))
             
            // LocationPicker
            ,array('scripts', 'locationpicker', $asset_base.'locationpicker.js', array('cdn--google-maps','jquery'))
             
            // AreaSelect
            ,array('styles', 'areaselect.css', $asset_base.'areaselect.css')
            ,array('scripts', 'areaselect', $asset_base.'areaselect.js', array('areaselect.css'))
             
            // RangeSlider
            ,array('styles', 'rangeslider.css', $asset_base.'rangeslider.css')
            ,array('scripts', 'rangeslider', $asset_base.'rangeslider.js', array('rangeslider.css','jquery'))
             
            // Sortable
            ,array('scripts', 'sortable', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js'
            : $asset_base.'sortable.js'
            )
             
            // TinyDraggable
            ,array('scripts', 'tinydraggable', $asset_base.'tinydraggable.js')
             
            // Select2
            ,array('styles', 'select2.css', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.2/css/select2.min.css'
            : $asset_base.'select2.css'
            )
            ,array('scripts', 'select2', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.2/js/select2.full.min.js'
            : $asset_base.'select2.js'
            , array('select2.css','jquery'))
             
            // Awesomplete
            ,array('styles', 'awesomplete.css', $asset_base.'awesomplete.css')
            ,array('scripts', 'awesomplete', $asset_base.'awesomplete.js', array('awesomplete.css'))
             
            // AutoComplete
            ,array('styles', 'autocomplete.css', $asset_base.'autocomplete.css')
            ,array('scripts', 'autocomplete', $asset_base.'autocomplete.js', array('autocomplete.css','jquery'))
             
            // TagEditor
            ,array('scripts', 'caret', $asset_base.'caret.js')
            ,array('styles', 'tageditor.css', $asset_base.'tageditor.css')
            ,array('scripts', 'tageditor', $asset_base.'tageditor.js', array('tageditor.css','jquery','caret'))
             
            // Tooltipster
            ,array('styles', 'tooltipster.css', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/tooltipster/3.3.0/css/tooltipster.min.css'
            : $asset_base.'tooltipster.css'
            )
            ,array('scripts', 'tooltipster', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/tooltipster/3.3.0/js/jquery.tooltipster.min.js'
            : $asset_base.'tooltipster.js'
            , array('tooltipster.css','jquery'))
             
            // Popr2
            ,array('styles', 'popr2.css', $asset_base.'popr2.css')
            ,array('scripts', 'popr2', $asset_base.'popr2.js', array('popr2.css','jquery'))
            
            // Modal
            ,array('styles', 'modal.css', $asset_base.'modal.css')
            ,array('scripts', 'modal', $asset_base.'modal.js', array('modal.css','jquery'))
            
            // List.js
            ,array('scripts', 'list', $asset_base.'list.js')
            
            // NodeList
            ,array('scripts', 'nodelist', $asset_base.'nodelist.js')
            
            // Tao
            ,array('scripts', 'tao', $asset_base.'tao.js')
            
            // Serialiser
            ,array('scripts', 'serialiser', $asset_base.'serialiser.js')
            
            // ModelView
            ,array('scripts', 'modelview', $asset_base.'modelview.js')
            
            // ModelViewForm
            ,array('scripts', 'modelviewform', $asset_base.'modelview.form.js', array('jquery','datex','modelview'))
             
            // smoothState
            ,array('scripts', 'smoothstate', $asset_base.'smoothState.js', array('jquery'))
             
            // Packery
            ,array('scripts', 'packery', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/packery/2.0.0/packery.pkgd.min.js'
                : $asset_base.'packery.js'
            )
             
            // Isotope
            ,array('scripts', 'isotope', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/2.2.2/isotope.pkgd.min.js'
                : $asset_base.'isotope.js'
            )
             
            // Masonry
            ,array('scripts', 'masonry', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/masonry/4.0.0/masonry.pkgd.min.js'
                : $asset_base.'masonry.js'
            )
             
            // Raphael
            ,array('scripts', 'raphael', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.0/raphael-min.js'
                : $asset_base.'raphael.js'
            )
             
            // VexTab
            ,array('styles', 'vextab.css', $asset_base.'vex/tab/vextab.css')
            ,array('scripts', 'vextab', $asset_base.'vex/tab/vextab-div.js',array('vextab.css'))
             
            // D3
            ,array('scripts', 'd3', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js'
                : $asset_base.'d3/d3.js'
            )
             
            // C3
            ,array('styles', 'c3.css', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css'
                : $asset_base.'c3/c3.css'
            )
            ,array('scripts', 'c3', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js'
                : $asset_base.'c3/c3.js'
            , array('c3.css','d3'))
             
            // ImTranslator
            //,array()
            
            // MathJax, ?config=TeX-AMS_HTML-full
            ,array('scripts', 'mathjax', $cdn
                ? 'https://cdn.mathjax.org/mathjax/latest/MathJax.js'
                : $asset_base.'mathjax/MathJax.js'
            )
            
            // DataTables
            ,array('styles', 'datatables.css', $cdn
                ? 'https://cdn.datatables.net/1.10.11/css/jquery.dataTables.min.css'
                : $asset_base.'datatables/css/datatables.css'
            )
            ,array('scripts', 'datatables', $cdn
                ? 'https://cdn.datatables.net/1.10.11/js/jquery.dataTables.min.js'
                : $asset_base.'datatables/js/datatables.js'
            , array('datatables.css','jquery'))
            ,array('styles-composite', 'datatables-reorder.css', $cdn
            ? array(
                'https://cdn.datatables.net/colreorder/1.3.1/css/colReorder.dataTables.min.css',
                'https://cdn.datatables.net/rowreorder/1.1.1/css/rowReorder.dataTables.min.css'
            )
            : array(
                $asset_base.'datatables/css/colreorder.css',
                $asset_base.'datatables/css/rowreorder.css'
            ), array('datatables.css'))
            ,array('scripts-composite', 'datatables-reorder', $cdn
            ? array(
                'https://cdn.datatables.net/colreorder/1.3.1/js/dataTables.colReorder.min.js',
                'https://cdn.datatables.net/rowreorder/1.1.1/js/dataTables.rowReorder.min.js'
            )
            : array(
                $asset_base.'datatables/js/colreorder.js',
                $asset_base.'datatables/js/rowreorder.js'
            ), array('datatables-reorder.css','datatables'))
            ,array('styles-composite', 'datatables-extra.css', $cdn
            ? array(
                'https://cdn.datatables.net/responsive/2.0.2/css/responsive.dataTables.min.css',
                'https://cdn.datatables.net/buttons/1.1.2/css/buttons.dataTables.min.css',
                'https://cdn.datatables.net/select/1.1.2/css/select.dataTables.min.css',
                'https://cdn.datatables.net/colreorder/1.3.1/css/colReorder.dataTables.min.css',
                'https://cdn.datatables.net/rowreorder/1.1.1/css/rowReorder.dataTables.min.css'
            )
            : array(
                $asset_base.'datatables/css/responsive.css',
                $asset_base.'datatables/css/buttons.css',
                $asset_base.'datatables/css/select.css',
                $asset_base.'datatables/css/colreorder.css',
                $asset_base.'datatables/css/rowreorder.css'
            ), array('datatables.css'))
            ,array('scripts-composite', 'datatables-extra', $cdn
            ? array(
                'https://cdn.datatables.net/responsive/2.0.2/js/dataTables.responsive.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/dataTables.buttons.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.colVis.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.html5.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.flash.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.print.min.js',
                'https://cdn.datatables.net/select/1.1.2/js/dataTables.select.min.js',
                'https://cdn.datatables.net/colreorder/1.3.1/js/dataTables.colReorder.min.js',
                'https://cdn.datatables.net/rowreorder/1.1.1/js/dataTables.rowReorder.min.js'
            )
            : array(
                $asset_base.'datatables/js/responsive.js',
                $asset_base.'datatables/js/buttons.js',
                $asset_base.'datatables/js/buttons.colvis.js',
                $asset_base.'datatables/js/buttons.html5.js',
                $asset_base.'datatables/js/buttons.flash.js',
                $asset_base.'datatables/js/buttons.print.js',
                $asset_base.'datatables/js/select.js',
                $asset_base.'datatables/js/colreorder.js',
                $asset_base.'datatables/js/rowreorder.js'
            ), array('datatables-extra.css','datatables'))
            ,array('styles-composite', 'datatables-all.css', $cdn
            ? array(
                'https://cdn.datatables.net/responsive/2.0.2/css/responsive.dataTables.min.css',
                'https://cdn.datatables.net/buttons/1.1.2/css/buttons.dataTables.min.css',
                'https://cdn.datatables.net/select/1.1.2/css/select.dataTables.min.css',
                'https://cdn.datatables.net/colreorder/1.3.1/css/colReorder.dataTables.min.css',
                'https://cdn.datatables.net/rowreorder/1.1.1/css/rowReorder.dataTables.min.css',
                'https://cdn.datatables.net/autofill/2.1.1/css/autoFill.dataTables.min.css',
                'https://cdn.datatables.net/fixedcolumns/3.2.1/css/fixedColumns.dataTables.min.css',
                'https://cdn.datatables.net/fixedheader/3.1.1/css/fixedHeader.dataTables.min.css',
                'https://cdn.datatables.net/scroller/1.4.1/css/scroller.dataTables.min.css',
                'https://cdn.datatables.net/keytable/2.1.1/css/keyTable.dataTables.min.css'
            )
            : array(
                $asset_base.'datatables/css/responsive.css',
                $asset_base.'datatables/css/buttons.css',
                $asset_base.'datatables/css/select.css',
                $asset_base.'datatables/css/colreorder.css',
                $asset_base.'datatables/css/rowreorder.css',
                $asset_base.'datatables/css/autofill.css',
                $asset_base.'datatables/css/fixedcolumns.css',
                $asset_base.'datatables/css/fixedheader.css',
                $asset_base.'datatables/css/scroller.css',
                $asset_base.'datatables/css/keytable.css'
            ), array('datatables.css'))
            ,array('scripts-composite', 'datatables-all', $cdn
            ? array(
                'https://cdn.datatables.net/responsive/2.0.2/js/dataTables.responsive.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/dataTables.buttons.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.colVis.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.html5.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.flash.min.js',
                'https://cdn.datatables.net/buttons/1.1.2/js/buttons.print.min.js',
                'https://cdn.datatables.net/select/1.1.2/js/dataTables.select.min.js',
                'https://cdn.datatables.net/colreorder/1.3.1/js/dataTables.colReorder.min.js',
                'https://cdn.datatables.net/rowreorder/1.1.1/js/dataTables.rowReorder.min.js',
                'https://cdn.datatables.net/autofill/2.1.1/js/dataTables.autoFill.min.js',
                'https://cdn.datatables.net/fixedcolumns/3.2.1/js/dataTables.fixedColumns.min.js',
                'https://cdn.datatables.net/fixedheader/3.1.1/js/dataTables.fixedHeader.min.js',
                'https://cdn.datatables.net/scroller/1.4.1/js/dataTables.scroller.min.js',
                'https://cdn.datatables.net/keytable/2.1.1/js/dataTables.keyTable.min.js'
            )
            : array(
                $asset_base.'datatables/js/responsive.js',
                $asset_base.'datatables/js/buttons.js',
                $asset_base.'datatables/js/buttons.colvis.js',
                $asset_base.'datatables/js/buttons.html5.js',
                $asset_base.'datatables/js/buttons.flash.js',
                $asset_base.'datatables/js/buttons.print.js',
                $asset_base.'datatables/js/select.js',
                $asset_base.'datatables/js/colreorder.js',
                $asset_base.'datatables/js/rowreorder.js',
                $asset_base.'datatables/js/autofill.js',
                $asset_base.'datatables/js/fixedcolumns.js',
                $asset_base.'datatables/js/fixedheader.js',
                $asset_base.'datatables/js/scroller.js',
                $asset_base.'datatables/js/keytable.js'
            ), array('datatables-all.css','datatables'))
            
            
            // Tinymce
            ,array('scripts', 'tinymce', $cdn
                ? '//cdn.tinymce.com/4/tinymce.min.js'
                : $asset_base.'tinymce/tinymce.min.js'
            )
            ,array('scripts', 'tinymce-plugin-placeholder', $asset_base.'tinymce/plugins/placeholderalt/plugin.min.js',array('tinymce'))
             
            // CKEditor
            ,array('scripts', 'ckeditor', $cdn
                ? '//cdn.ckeditor.com/4.5.8/standard/ckeditor.js'
                : $asset_base.'ckeditor/ckeditor.js'
            )
             
            // Trumbowyg
            ,array('styles', 'trumbowyg.css', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/Trumbowyg/2.0.5/ui/trumbowyg.min.css'
            : $asset_base.'trumbowyg/trumbowyg.css'
            )
            ,array('scripts', 'trumbowyg', $cdn
            ? 'https://cdnjs.cloudflare.com/ajax/libs/Trumbowyg/2.0.5/trumbowyg.min.js'
            : $asset_base.'trumbowyg/trumbowyg.js'
            , array('trumbowyg.css','jquery'))
            
            // CodeMirror
            ,array('styles', 'codemirror.css', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.min.css'
                : $asset_base.'codemirror/lib/codemirror.css'
            )
            ,array('styles', 'codemirror-fold.css', $cdn
                ? 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/foldgutter.css'
                : $asset_base.'codemirror/addon/fold/foldgutter.css'
            , array('codemirror.css'))
            ,array('scripts-composite', 'codemirror-fold', $cdn
            ? array(
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/foldgutter.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/foldcode.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/comment-fold.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/brace-fold.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/indent-fold.min.js',
                //'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/markdown-fold.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/fold/xml-fold.min.js'
            )
            : array(
                $asset_base.'codemirror/addon/fold/foldgutter.js',
                $asset_base.'codemirror/addon/fold/foldcode.js',
                $asset_base.'codemirror/addon/fold/comment-fold.js',
                $asset_base.'codemirror/addon/fold/brace-fold.js',
                $asset_base.'codemirror/addon/fold/indent-fold.js',
                $asset_base.'codemirror/addon/fold/xml-fold.js'
            ), array('codemirror-fold.css','codemirror'))
            ,array('scripts-composite', 'codemirror-htmlmixed', $cdn
            ? array(
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/mode/xml/xml.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/mode/javascript/javascript.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/mode/css/css.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/mode/htmlmixed/htmlmixed.min.js'
            )
            : array(
                $asset_base.'codemirror/mode/xml/xml.js',
                $asset_base.'codemirror/mode/javascript/javascript.js',
                $asset_base.'codemirror/mode/css/css.js',
                $asset_base.'codemirror/mode/htmlmixed/htmlmixed.js'
            ), array('codemirror'))
            ,array('scripts-composite', 'codemirror', $cdn
            ? array(
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/mode/multiplex.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/comment/comment.min.js'
            )
            : array(
                $asset_base.'codemirror/lib/codemirror.js',
                $asset_base.'codemirror/addon/mode/multiplex.js',
                $asset_base.'codemirror/addon/comment/comment.js'
            ), array('codemirror.css'))
            ,array('scripts', 'codemirror-grammar', $asset_base.'codemirror/addon/grammar/codemirror_grammar.js')
            
            // ACE
            //..
            ));
        }
        return $assets;
    }
    
    public static function i18n( $locale, $base='', $all=false, $cdn=false )
    {
        if ( empty($locale) ) return array();
        if ( empty($base) ) $base = '';
        $base = $base . ('/' === substr($base, -1)  ? '' : '/');
        $asset_base = $base . 'assets/';
        $cdn = true === $cdn;
        $i18n = array(
         array('pikadaytime', $asset_base.'i18n/pikadaytime/'.$locale.'.json')
        ,array('datex', $asset_base.'i18n/datex/'.$locale.'.json')
        ,array('datatables', $asset_base.'datatables/langs/'.$locale.'.json')
        );
        if ( true === $all )
        {
            $i18n = array_merge($i18n, array(
             array('tinymce', $asset_base.'tinymce/langs/'.$locale.'.js')
            ,array('video-js', $cdn
            ? 'http://vjs.zencdn.net/vjs-version/lang/'.$locale.'.js'
            : $asset_base.'video.js/lang/'.$locale.'.js'
            )
            ));
        }
        return $i18n;
    }
    
    public static function uuid( $prefix="widget", $suffix="static1" )
    {
        static $GID = 0;
        return implode("_", array($prefix, time(), ++$GID, rand(0,1000), $suffix));
    }
    
    private static function data_attr( $k, $v )
    {
        if ( is_array($v) )
        {
            $attr = '';
            foreach($v as $k1=>$v1)
                $attr .= (empty($attr) ? '' : ' ') . self::data_attr( $k.'-'.$k1, $v1 );
            return $attr;
        }
        else
        {
            return "{$k}='{$v}'";
        }
    }
    
    public static function data( $attr, $ctx='data' )
    {
        $d_attr = '';
        if ( !!$ctx && !empty($attr[$ctx]) && is_array($attr[$ctx]) )
        {
            foreach($attr[$ctx] as $k=>$v)
                $d_attr .= (empty($d_attr) ? '' : ' ') . self::data_attr( $ctx.'-'.$k, $v );
        }
        return $d_attr;
    }
    
    public static function attributes( $attr, $atts=array() )
    {
        if ( empty($atts) || empty($attr) ) return '';
        $attrs = array( );
        foreach($atts as $k)
        {
            if ( isset($attr[$k]) )
            {
                if ( 'data' == $k )
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
    
    public static function options( $opts, $key=null, $value=null )
    {
        $options = array( );
        foreach((array)$opts as $k=>$v)
        {
            $vv = (array)$v;
            $o_key = null;
            if ( -1 === $key )
            {
                $o_key = $k;
            }
            elseif ( null !== $key )
            {
                if ( isset($vv[$key]) )
                    $o_key = $vv[$key];
            }
            
            $o_val = null;
            if ( null !== $value )
            {
                if ( isset($vv[$value]) )
                    $o_val = $vv[$value];
            }
            else
            {
                $o_val = $v;
            }
            
            if ( null === $o_key ) $o_key = $o_val;
            
            $options[] = array($o_key, $o_val);
        }
        return $options;
    }
    
    public static function shuffle( $arr, $assoc=false )
    {
        // shuffle an asociative array as well
        if ( true === $assoc )
        {
            $keys = array_keys( $arr );
            $shuffled = array( );
            shuffle( $keys );
            foreach($keys as $key) $shuffled[$key] = $arr[$key];
        }
        else
        {
            $shuffled = $arr;
            shuffle( $shuffled );
        }
        return $shuffled;
    }
    
    public static function addWidget( $widget, $renderer )
    {
        if ( $widget && $renderer && is_callable($renderer) )
            self::$widgets['w_'.$widget] = $renderer;
        elseif ( $widget && (false === $renderer) && isset(self::$widgets['w_'.$widget]) )
            unset(self::$widgets['w_'.$widget]);
    }
    
    public static function widget( $widget, $attr=array(), $data=array() )
    {
        $out = '';
        if ( $widget )
        {
            if ( isset(self::$widgets['w_'.$widget]) ) 
                return call_user_func(self::$widgets['w_'.$widget], $attr, $data);
            
            if ( 'audio' === $widget ) $attr['type'] = 'audio';
            elseif ( 'video' === $widget ) $attr['type'] = 'video';
            elseif ( 'checkbox-array' === $widget || 'check-array' === $widget ) $attr['type'] = 'checkbox';
            elseif ( 'radiobox-array' === $widget || 'radio-array' === $widget ) $attr['type'] = 'radio';
            elseif ( 'checkbox-list' === $widget || 'checklist' === $widget ) $attr['type'] = 'checkbox';
            elseif ( 'radiobox-list' === $widget || 'radio-list' === $widget || 'radiolist' === $widget ) $attr['type'] = 'radio';
            elseif ( 'checkbox-image' === $widget ) $attr['type'] = 'checkbox';
            elseif ( 'radio-image' === $widget ) $attr['type'] = 'radio';
            elseif ( 'checkbox' === $widget ) $attr['type'] = 'checkbox';
            elseif ( 'radio' === $widget ) $attr['type'] = 'radio';
            elseif ( 'datetime' === $widget || 'datetimepicker' === $widget ) $attr['time'] = true;
            elseif ( 'select2' === $widget ) $attr['select2'] = true;
            elseif ( 'dropdown' === $widget ) $attr['dropdown'] = true;
            elseif ( 'datatable' === $widget ) $attr['datatable'] = true;
            elseif ( 'codemirror' === $widget || 'syntax-editor' === $widget || 'source-editor' === $widget || 'syntax' === $widget || 'source' === $widget || 'highlight-editor' === $widget || 'highlighter' === $widget ) $attr['syntax-editor'] = true;
            elseif ( 'tinymce' === $widget || 'wysiwyg-editor' === $widget || 'wysiwyg' === $widget || 'rich-editor' === $widget || 'rich' === $widget || 'editor' === $widget ) $attr['wysiwyg-editor'] = true;
            
            switch( $widget )
            {
            case 'empty':       $out = self::w_empty($attr, $data); break;
            case 'sep':
            case 'separator':   $out = self::w_sep($attr, $data); break;
            case 'icon':        $out = self::w_icon($attr, $data); break;
            case 'delayable':   $out = self::w_delayable($attr, $data); break;
            case 'disabable':   $out = self::w_disabable($attr, $data); break;
            case 'morphable':   $out = self::w_morphable($attr, $data); break;
            case 'pages':       $out = self::w_pages($attr, $data); break;
            case 'tabs':        $out = self::w_tabs($attr, $data); break;
            case 'accordeon':   $out = self::w_accordeon($attr, $data); break;
            case 'panel':       $out = self::w_panel($attr, $data); break;
            case 'endpanel':
            case 'end_panel':
            case 'panel_end':   $out = self::w_panel_end($attr, $data); break;
            case 'dialog':      $out = self::w_dialog($attr, $data); break;
            case 'modal':       $out = self::w_modal($attr, $data); break;
            case 'endmodal':
            case 'end_modal':
            case 'modal_end':   $out = self::w_modal_end($attr, $data); break;
            case 'tooltip':     $out = self::w_tooltip($attr, $data); break;
            case 'link':        $out = self::w_link($attr, $data); break;
            case 'button':      $out = self::w_button($attr, $data); break;
            case 'label':       $out = self::w_label($attr, $data); break;
            case 'uploader':
            case 'upload':
            case 'dnd-uploader':
            case 'dnd-upload':
            case 'drag-n-drop-uploader':
            case 'drag-n-drop-upload':
                                $out = self::w_dnd_upload($attr, $data); break;
            /*case 'uploader':
            case 'upload':      $out = self::w_upload($attr, $data); break;*/
            case 'file':        $out = self::w_file($attr, $data); break;
            case 'suggestbox':
            case 'suggest':     $out = self::w_suggest($attr, $data); break;
            case 'textbox':
            case 'textfield':
            case 'text':        $out = self::w_text($attr, $data); break;
            case 'imtranslator':
            case 'translator':  $out = self::w_translator($attr, $data); break;
            case 'tinymce':
            case 'editor':
            case 'rich-editor':
            case 'rich':
            case 'wysiwyg-editor':
            case 'wysiwyg':
            case 'codemirror':
            case 'source-editor':
            case 'source':
            case 'syntax-editor':
            case 'syntax':
            case 'highlight-editor':
            case 'highlighter':
            case 'textarea':    $out = self::w_textarea($attr, $data); break;
            case 'music':       
            case 'score':       
            case 'vextab':       
            case 'tab':       
            case 'tablature':   $out = self::w_vextab($attr, $data); break;
            case 'datetimepicker':
            case 'datepicker':
            case 'datetime':
            case 'date':        $out = self::w_date($attr, $data); break;
            case 'time':        $out = self::w_time($attr, $data); break;
            case 'timer':       $out = self::w_timer($attr, $data); break;
            case 'colorpicker':
            case 'colorselector':
            case 'color':       $out = self::w_color($attr, $data); break;
            case 'rating':      $out = self::w_rating($attr, $data); break;
            case 'map':
            case 'gmap':        $out = self::w_gmap($attr, $data); break;
            case 'radiobox-array':
            case 'radio-array':
            case 'checkbox-array':
            case 'check-array': $out = self::w_control_array($attr, $data); break;
            case 'radiobox-list':
            case 'radio-list':
            case 'radiolist':
            case 'checkbox-list':
            case 'checklist':   $out = self::w_control_list($attr, $data); break;
            case 'checkbox-image':
            case 'radio-image':
            case 'checkbox':
            case 'radio':
            case 'control':     $out = self::w_control($attr, $data); break;
            case 'switch':      $out = self::w_switch($attr, $data); break;
            case 'dropdown':
            case 'selectbox':
            case 'select2':
            case 'select':      $out = self::w_select($attr, $data); break;
            case 'menu':        $out = self::w_menu($attr, $data); break;
            case 'endmenu':
            case 'end_menu':
            case 'menu_end':    $out = self::w_menu_end($attr, $data); break;
            case 'datatable':
            case 'table':       $out = self::w_table($attr, $data); break;
            case 'graph':
            case 'chart':       $out = self::w_chart($attr, $data); break;
            case 'animation':   $out = self::w_animation($attr, $data); break;
            case 'flash':
            case 'swf':         $out = self::w_swf($attr, $data); break;
            case 'video':
            case 'audio':
            case 'media':       $out = self::w_media($attr, $data); break;
            default: $out = ''; break;
            }
        }
        return $out;
    }
    
    public static function w_empty( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return '';
    }
    
    public static function w_sep( $attr, $data )
    {
        $wclass = 'w-separator'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        self::enqueue('styles', 'htmlwidgets.css');
        return "<div class=\"$wclass\" $wstyle></div>";
    }
    
    public static function w_icon( $attr, $data )
    {
        $wclass = 'fa'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if ( !empty($attr['icon']) ) $wclass .= ' fa-'.$attr['icon'];
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wextra = self::attributes($attr,array('data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        return "<i class=\"$wclass\" $wstyle $wtitle $wextra></i>";
    }
    
    public static function w_label( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wfor = isset($attr["for"]) ? 'for="'.$attr["for"].'"' : '';
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr["title"]) ? $attr['title'] : $wtext;
        $wclass = 'w-widget w-label'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if ( !empty($attr['icon']) )
        {
            $wclass .= ' w-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            $wclass .= ' w-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        // iOS needs an onlick attribute to handle lable update if used as controller
        return "<label id=\"$wid\" $wfor class=\"$wclass\" title=\"$wtitle\" $wstyle onclick=\"\" $wextra>$wtext</label>";
    }
    
    public static function w_link( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'w-link'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if ( !empty($attr['icon']) )
        {
            $wclass .= ' w-icon';
            $wtext = "<i class=\"fa fa-{$attr['icon']} left-fa\"></i>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            $wclass .= ' w-icon-right';
            $wtext = $wtext . "<i class=\"fa fa-{$attr['iconr']} right-fa\"></i>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        if ( isset($attr['for']))
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
    
    public static function w_button( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'w-widget w-button'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        if ( !empty($attr['icon']) )
        {
            if ( empty($wtext) )  $wclass .= ' w-icon-only';
            else $wclass .= ' w-icon';
            $wtext = "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>" . $wtext;
        }
        if ( !empty($attr['iconr']) )
        {
            if ( empty($wtext) )  $wclass .= ' w-icon-only';
            else $wclass .= ' w-icon-right';
            $wtext = $wtext . "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
        }
        $wextra = self::attributes($attr,array('disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        if ( isset($attr['for']) )
        {
            $wfor = $attr['for'];
            return "<label id=\"$wid\" for=\"$wfor\" class=\"$wclass\" $wstyle onclick=\"\" title=\"$wtitle\" $wextra>$wtext</label>";
        }
        elseif ( isset($attr['href']) )
        {
            $whref = $attr['href'];
            $wextra .= ' '.self::attributes($attr,array('target','rel'));
            return "<a id=\"$wid\" href=\"$whref\" class=\"$wclass\" $wstyle title=\"$wtitle\" $wextra>$wtext</a>";
        }
        else
        {
            $wtype = isset($attr['type']) ? $attr['type'] : 'button';
            return "<button id=\"$wid\" type=\"$wtype\" class=\"$wclass\" $wstyle title=\"$wtitle\" $wextra>$wtext</button>";
        }
    }
    
    public static function w_control( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wchecked = !empty($attr['checked']) ? 'checked' : '';
        if ( !empty($attr['image']) )
        {
            $wctrl = "checkbox" === $wtype ? 'w-checkbox-image' : 'w-radio-image';
            $wimg = '<span style="background-image:url('.$attr['image'].');"></span>';
        }
        else
        {
            $wctrl = "checkbox" === $wtype ? 'w-checkbox' : 'w-radio';
            $wimg = '&nbsp;';
        }
        $wclass = 'w-widget w-control'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wstate = '';
        if ( isset($attr['state-on']) ) $wstate .= " data-wstate-on=\"{$attr['state-on']}\"";
        if ( isset($attr['state-off']) ) $wstate .= " data-wstate-off=\"{$attr['state-off']}\"";
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        return "<input type=\"$wtype\" id=\"$wid\" $wname class=\"$wctrl\" value=\"$wvalue\" $wextra $wchecked /><label for=\"$wid\" $wtitle class=\"$wclass\" $wstyle $wstate onclick=\"\">$wimg</label>";
    }
    
    public static function w_control_list( $attr, $data )
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
        if ( !empty($attr["horizontal"]) ) $wclass .= ' w-control-list-horizontal w-clearfloat';
        if ( 'radio' == $wtype )
        {
            if ( $w_xlarge ) $w_item_class = 'w-xlarge';
            elseif ( $w_large ) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<ol id="'.$wid.'" class="w-control-list w-radio-list '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            foreach($woptions as $i=>$opt)
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
            if ( $w_xlarge ) $w_item_class = 'w-xlarge';
            elseif ( $w_large ) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<ul id="'.$wid.'" class="w-control-list w-checkbox-list '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            foreach($woptions as $i=>$opt)
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
    
    public static function w_control_array( $attr, $data )
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
        if ( !empty($attr["randomised"]) ) shuffle($fields);
        if ( 'radio' == $wtype )
        {
            if ( $w_xlarge ) $w_item_class = 'w-xlarge';
            elseif ( $w_large ) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<table id="'.$wid.'" class="w-control-array w-radio-array '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            $widget .= '<thead><tr><td>&nbsp;</td>';
            foreach($woptions as $i=>$opt)
            {
                $widget .= '<td>'.$opt[1].'</td>';
            }
            $widget .= '<td>&nbsp;</td></tr></thead><tbody>';
            foreach($fields as $field)
            {
                $widget .= '<tr><td>'.$wfields[$field].'</td>';
                $w_item_name = $wname.'['.$field.']';
                foreach($woptions as $i=>$opt)
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
            if ( $w_xlarge ) $w_item_class = 'w-xlarge';
            elseif ( $w_large ) $w_item_class = 'w-large';
            else $w_item_class = '';
            $widget = '<table id="'.$wid.'" class="w-control-array w-checkbox-array '.$wclass.'" '.$wstyle.' '.$wextra.'>';
            $widget .= '<thead><tr><td>&nbsp;</td>';
            foreach($woptions as $i=>$opt)
            {
                $widget .= '<td>'.$opt[1].'</td>';
            }
            $widget .= '<td>&nbsp;</td></tr></thead><tbody>';
            foreach($fields as $field)
            {
                $wvalue = isset($wvalues[$field]) ? (array)$wvalues[$field] : array();
                $widget .= '<tr><td>'.$wfields[$field].'</td>';
                $w_item_name = $wname.'['.$field.']';
                foreach($woptions as $i=>$opt)
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
    
    public static function w_switch( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : "checkbox";
        $wvalue = isset($data['value']) ? $data['value'] : "1";
        $wvalue2 = isset($data['valueoff']) ? $data['valueoff'] : false;
        $wdual = false !== $wvalue2;
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wchecked = !empty($attr['checked']);
        $wclass = "w-widget w-switch"; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
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
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        if ( $wdual )
        {
            // dual switch with separate on/off states
            $wclass .= ' dual';
            $wtype = 'radio';
            if ( $wchecked )
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\"w-switch-state w-state-on\" value=\"$wvalue\" $wextra checked /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"w-switch-state w-state-off\" value=\"$wvalue2\" $wextra />";
            }
            else
            {
                $wstates = "<input type=\"$wtype\" id=\"{$wid}-on\" $wname class=\"w-switch-state w-state-on\" value=\"$wvalue\" $wextra /><input type=\"$wtype\" id=\"{$wid}-off\" $wname class=\"w-switch-state w-state-off\" value=\"$wvalue2\" $wextra checked />";
            }
            if ( $wreverse ) 
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
            if ( $wchecked ) $wchecked = 'checked';
            $wstates = "<input type=\"$wtype\" id=\"$wid\" $wname class=\"w-switch-state\" value=\"$wvalue\" $wextra $wchecked />";
            if ( $wreverse ) 
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
    
    public static function w_rating( $attr, $data )
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
        if ( !empty($wtext) ) $widget .= "<legend $wtitle>$wtext</legend>";
        if ( empty($wicon) ) $wicon = 'star';
        for ($r=count($wratings)-1; $r>=0; $r--)
        {
            $rate = $wratings[$r][0]; $label = $wratings[$r][1];
            if ( is_array($wicon) )
            {
                if ( isset($wicon[$r]) ) $w_icon = $wicon[$r];
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
    
    public static function w_select( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wdropdown = !empty($attr['dropdown']);
        $wclass = $wdropdown ? "w-widget w-dropdown" : "w-widget w-select"; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wextra = self::attributes($attr,array('multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wselected = isset($data['selected']) ? (array)$data['selected'] : array();
        $woptions = '';
        $has_selected = false;
        foreach((array)$data['options'] as $opt)
        {
            // NOTE: use HtmlWidget::options() to format options accordingly to be used here
            $key = $opt[0]; $val = $opt[1];
            $selected = in_array($key, $wselected) ? ' selected="selected"' : '';
            if ( !empty($selected) ) $has_selected = true;
            $woptions .= "<option value=\"$key\"$selected>$val</option>";
        }
        if ( !empty($attr['placeholder']) )
        {
            $woptions = "<option value=\"\" class=\"w-option-placeholder\" disabled".($has_selected?'':' selected').">{$attr['placeholder']}</option>" . $woptions;
            //if ( !preg_match('/\brequired\b/', $wextra) ) $wextra .= ' required';
            //if ( empty($wname) ) $wextra .= ' form="__NONE__"';
            $wextra .= ' data-placeholder="'.$attr['placeholder'].'"';
        }
        
        $wopts = "";
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($attr['select2']) && !$wdropdown )
        {
            if ( empty($winit) ) $winit = 'w-init="1"';
            $wclass .= ' w-select2';
            if ( isset($attr["options"]) && is_array($attr["options"]) )
            {
                $wopts = 'w-opts="htmlw_'.$wid.'_options"';
                self::enqueue('scripts', 'w-select2-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
            }
            self::enqueue('scripts', 'select2');
            self::enqueue('scripts', 'htmlwidgets');
        }
        return $wdropdown
        ? "<span class=\"$wclass\" $wstyle><select id=\"$wid\" $winit $wopts $wname class=\"w-dropdown-select\" $wtitle $wextra>$woptions</select></span>"
        : "<select id=\"$wid\" $winit $wopts $wname class=\"$wclass\" $wstyle $wtitle $wextra>$woptions</select>";
    }
    
    public static function w_text( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wclass = 'w-widget w-text'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        // text, number, email, url, tel etc..
        $wtype = !empty($attr["type"]) ? $attr["type"] : 'text';
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        if ( !empty($attr['autocomplete']) )
        {
            $wclass .= ' awesomplete';
            $wextra .= ' list="list_'.$wid.'"';
            $wautocomplete = '<datalist id="list_'.$wid.'"><option>'.implode('</option><option>',(array)$attr['autocomplete']).'</option></datalist>';
            self::enqueue('scripts', 'awesomplete');
        }
        else
        {
            $wautocomplete = '';
        }
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($winit) ) self::enqueue('scripts', 'htmlwidgets');
        return !empty($wicon)
        ? "<span class=\"$wrapper_class\" $wstyle><input type=\"$wtype\" id=\"$wid\" $winit $wname $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" $wextra />$wicon</span>".$wautocomplete
        : "<input type=\"$wtype\" id=\"$wid\" $winit $wname $wtitle class=\"$wclass\" $wstyle placeholder=\"$wplaceholder\" value=\"$wvalue\" $wextra />".$wautocomplete;
    }
    
    public static function w_suggest( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wclass = 'w-widget w-text w-suggest'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wajax = $attr["ajax"];
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
            $wicon .= "<span class=\"fa-wrapper right-fa w-suggest-spinner\"><i id=\"$wid-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        elseif ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa w-suggest-spinner\"><i id=\"$wid-spinner\" class=\"fa fa-spinner fa-pulse\"></i></span>";
            $wrapper_class .= ' w-icon';
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-autocomplete-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'autocomplete');
        self::enqueue('scripts', 'htmlwidgets');
        return "<span class=\"$wrapper_class\" $wstyle><input type=\"text\" id=\"$wid\" $winit $wopts $wname $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" autocomplete=\"off\" data-ajax=\"$wajax\" $wextra />$wicon</span>";
    }
    
    public static function w_textarea( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( !empty($attr['syntax-editor']) ) 
        {
            if ( empty($winit) ) $winit = 'w-init="1"';
            $wclass = 'w-widget w-syntax-editor'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            if ( isset($attr["options"]) && is_array($attr["options"]) )
            {
                $wopts = 'w-opts="htmlw_'.$wid.'_options"';
                self::enqueue('scripts', 'w-codemirror-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
            }
            self::enqueue('scripts', 'codemirror');
            self::enqueue('scripts', 'codemirror-fold');
            self::enqueue('scripts', 'codemirror-htmlmixed');
            self::enqueue('scripts', 'htmlwidgets');
        }
        elseif ( !empty($attr['wysiwyg-editor']) ) 
        {
            if ( empty($winit) ) $winit = 'w-init="1"';
            $wclass = 'w-widget w-wysiwyg-editor'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            if ( isset($attr["options"]) && is_array($attr["options"]) )
            {
                $wopts = 'w-opts="htmlw_'.$wid.'_options"';
                self::enqueue('scripts', 'w-tinymce-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
            }
            self::enqueue('scripts', 'tinymce');
            self::enqueue('scripts', 'tinymce-plugin-placeholder');
            self::enqueue('scripts', 'htmlwidgets');
        }
        else
        {
            $wclass = 'w-widget w-textarea'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
            self::enqueue('styles', 'htmlwidgets.css');
        }
        return "<textarea id=\"$wid\" $winit $wopts $wname $wtitle class=\"$wclass\" $wstyle placeholder=\"$wplaceholder\" $wextra>$wvalue</textarea>";
    }
    
    public static function w_vextab( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wclass = 'w-vextab vex-tabdiv'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('title','width','height','scale','editor','editor_width','editor_height','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wtablature = empty($data['notes']) ? '' : $data['notes'];
        if ( !empty($attr['render']) && ('svg' === $attr['render']) ) self::enqueue('scripts', 'raphael');
        self::enqueue('scripts', 'vextab');
        return "<div id=\"{$wid}\" class=\"{$wclass}\" {$wextra}>{$wtablature}</div>";
    }
    
    public static function w_translator( $attr, $data )
    {
        $wtype = !empty($attr['type']) ? $attr['type'] : "iframe";
        $wdims = !empty($attr['dimensions']) ? $attr['dimensions'] : "510x510";
        $wsource = !empty($attr['source']) ? $attr['source'] : "en";
        $wtarget = !empty($attr['target']) ? $attr['target'] : "el";
        $wlocale = !empty($attr['locale']) ? $attr['locale'] : "en";
        $wclass = 'w-translator'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('scripts', 'w-translator-opts', array('window.imtranslatorOptions = {dir:"'.$wsource.'/'.$wtarget.'", loc:"'.$wlocale.'"}; var dir=window.imtranslatorOptions.dir,loc=window.imtranslatorOptions.loc;'));
        self::enqueue('scripts', 'w-translator', 'http://imtranslator.net/translation/webmaster/wm-im-'.('popup'===$wtype?'popup':$wdims).'.js', array('w-translator-opts'));
        return '<div id="TranslatorBuilder" class="'.$wclass.'" '.$wstyle.' '.$wextra.'><a href="http://imtranslator.net/translation/" id="ImTranslator" target="_top" title="Translator - imtranslator.net">Translator</a></div><div id="ImBack"></div>';
    }
    
    public static function w_date( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wtime = !empty($attr["time"]) ? 'data-datepicker-time="1"' : '';
        if ( !empty($wtime) )
            $wtime .= isset($attr["seconds"]) && (false === (bool)$attr["seconds"]) ? ' data-datepicker-seconds="0"' : ' data-datepicker-seconds="1"';
        $wclass = 'w-widget w-text w-date'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wformat = !empty($attr["format"]) ? $attr["format"] : (!empty($wtime) ? 'Y-m-d H:i:s' : 'Y-m-d');
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        if ( empty($attr['icon']) && empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-calendar\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-datetime-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'pikadaytime');
        self::enqueue('scripts', 'htmlwidgets');
        return "<span class=\"$wrapper_class\" $wstyle><input type=\"text\" id=\"$wid\" $winit $wopts $wname $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" data-datepicker-format=\"$wformat\" $wtime $wextra />$wicon</span>";
    }
    
    public static function w_time( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wname = !empty($attr["name"]) ? $attr["name"] : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
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
        $wclass = 'w-widget w-time'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
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
            $wtimes[] = '<select class="w-time-component" id="'.$wid.'_'.$t.'" '.$wnam.' '.$wtitle.' '.$wextra.'>'.implode('',$time_options[$t]).'</select>';
        }
        $wtimes = implode('<span class="w-time-sep">:</span>', $wtimes);
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($winit) ) self::enqueue('scripts', 'htmlwidgets');
        return "<span class=\"$wclass\" $winit $wstyle>$wtimes</span>";
    }
    
    public static function w_timer( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr["name"]) ? $attr["name"] : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wtype = !empty($attr['type']) ? $attr['type'] : 'down';
        $wformat = !empty($attr['format']) ? $attr['format'] : '%hh%:%mm%:%ss%';
        $wduration = isset($data['duration']) ? $data['duration'] : '10';
        $wclass = 'w-widget w-timer'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : ''; 
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-timer-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'timer');
        self::enqueue('scripts', 'htmlwidgets');
        return "<span id=\"{$wid}\" {$winit} {$wopts} class=\"{$wclass}\" {$wtitle} {$wstyle} {$wextra} data-timer-type=\"{$wtype}\" data-timer-format=\"{$wformat}\" data-timer-duration=\"{$wduration}\">{$wformat}</span>";
    }
    
    public static function w_color( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        if ( !empty($attr['input']) )
        {
            $winput = '<input id="'.$attr['input'].'" type="hidden" '.$wname.' value="" style="display:none" />';
            $winputref = 'data-colorpicker-input="'.$attr['input'].'"';
        }
        else
        {
            $winput = '';
            $winputref = '';
        }
        $wvalue = isset($data['color']) ? $data['color'] : "";
        $wopacity = isset($data['opacity']) ? $data['opacity'] : "1.0";
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wclass = 'colorpicker-selector w-colorselector'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wformat = !empty($attr["format"]) ? $attr["format"] : 'rgba';
        $wextra = self::attributes($attr,array('readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-color-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'colorpicker');
        self::enqueue('scripts', 'htmlwidgets');
        return $winput."<div id=\"$wid\" $winit $wopts $wtitle class=\"$wclass\" $wstyle data-colorpicker-color=\"$wvalue\" data-colorpicker-opacity=\"$wopacity\" data-colorpicker-format=\"$wformat\" $winputref $wextra></div>";
    }
    
    public static function w_gmap( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wclass = 'w-widget w-map'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wcenter = !empty($attr["center"]) ? $attr["center"] : null;
        $wzoom = !empty($attr["zoom"]) ? $attr["zoom"] : '6';
        $wmarkers = !empty($data["markers"]) ? $data["markers"] : null;
        $wextra = self::attributes($attr,array('data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-gmap-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'htmlwidgets');
        return "<div id=\"$wid\" $winit $wopts class=\"$wclass\" $wstyle $wextra".(!empty($wcenter)?' data-map-center="'.implode(',',(array)$wcenter).'"':'')." data-map-zoom=\"$wzoom\"".(!empty($wmarkers)?' data-map-markers="'.$wmarkers.'"':'')."></div>";
    }
    
    public static function w_file( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wname = !empty($attr["name"]) ? 'name="'.$attr["name"].'"' : '';
        $wvalue = isset($data['value']) ? $data['value'] : "";
        $titl = isset($attr["title"]) ? $attr["title"] : '';
        $wtitle = !empty($titl) ? 'title="'.$titl.'"' : '';
        $wplaceholder = isset($attr['placeholder']) ? $attr['placeholder'] : $titl;
        $wclass = 'w-widget w-file w-text'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wicon = '';
        $wrapper_class = 'w-wrapper';
        if ( !empty($attr['icon']) )
        {
            $wicon .= "<span class=\"fa-wrapper left-fa\"><i class=\"fa fa-{$attr['icon']}\"></i></span>";
            $wrapper_class .= ' w-icon';
        }
        if ( !empty($attr['iconr']) )
        {
            $wicon .= "<span class=\"fa-wrapper right-fa\"><i class=\"fa fa-{$attr['iconr']}\"></i></span>";
            $wrapper_class .= ' w-icon-right';
        }
        $wextra = self::attributes($attr,array('accept','multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        self::enqueue('styles', 'htmlwidgets.css');
        return "<label for=\"$wid\" class=\"$wrapper_class\" $wstyle><input type=\"file\" id=\"$wid\" $wname class=\"w-file-input\" value=\"$wvalue\" $wextra style=\"display:none !important\"/><input type=\"text\" id=\"text_input_$wid\" $wtitle class=\"$wclass\" placeholder=\"$wplaceholder\" value=\"$wvalue\" form=\"__NONE__\" />$wicon</label>";
    }
    
    public static function w_dnd_upload( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid( ); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr['name']) ? 'name="'.$attr['name'].'"' : '';
        $wtitle = !empty($attr["title"]) ? 'title="'.$attr["title"].'"' : '';
        $wclass = 'w-widget w-dnd-upload'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        if ( !empty($attr['show-preview']) ) $wclass .= ' __with_preview__';
        if ( !empty($attr['upload-thumbnail']) ) $wclass .= ' __with_thumbnail__';
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = "data-alt-value=\"files_dropped\"";
        if ( !empty($attr["mimetype"]) ) $wextra .= " data-dnd-upload-mimetype=\"{$attr["mimetype"]}\"";
        $wextra .= ' ' . (self::attributes($attr,array('accept','multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : ''));
        $msg_upload = !empty($attr["msg-upload"]) ? $attr["msg-upload"] : 'Upload';
        $msg_delete = !empty($attr["msg-delete"]) ? $attr["msg-delete"] : 'Delete';
        $wopts = "";
        if ( isset($attr["options"]) && is_array($attr["options"]) )
        {
            $wopts = 'w-opts="htmlw_'.$wid.'_options"';
            self::enqueue('scripts', 'w-dnd-upload-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
        }
        self::enqueue('scripts', 'htmlwidgets');
        return "<div $winit $wopts $wtitle id=\"{$wid}_wrapper\" class=\"$wclass\" $wstyle><input id=\"$wid\" $wname type=\"file\" class=\"_w-dnd-uploader\" value=\"\" style=\"display:none !important;\" $wextra><label for=\"$wid\" class=\"w-widget w-button w-dnd-upload-upload\" title=\"{$msg_upload}\"><i class=\"fa fa-upload fa-2x\"></i></label><button type=\"button\" class=\"w-widget w-button w-dnd-upload-delete\" title=\"{$msg_delete}\"><i class=\"fa fa-times fa-2x\"></i></button></div>";
    }
    
    /*public static function w_upload( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid( ); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wname = !empty($attr['name']) ? 'name="'.$attr['name'].'"' : '';
        $wclass = 'w-widget w-upload'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('accept','multiple','readonly','disabled','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wupload_base = !empty($attr["upload-base"]) ? $attr["upload-base"] : '';
        $msg_upload = !empty($attr["msg-upload"]) ? $attr["msg-upload"] : 'Upload';
        $msg_delete = !empty($attr["msg-delete"]) ? $attr["msg-delete"] : 'Delete';
        $msg_full = !empty($attr["msg-full-size"]) ? $attr["msg-full-size"] : 'Click to view full-size image';
        $wvalue = !empty($data["value"]) ? (array)$data["value"] : null;
        if ( !empty($wvalue) )
        {
            $image = $wupload_base . $wvalue['file'];
            $thumb = !empty($wvalue['thumb']) ? $wupload_base . $wvalue['thumb'] : '';
            $upload_data = json_encode(array(
                'original' => $image,
                'type' => !empty($wvalue['type']) ? $wvalue['type'] : 'image',
                'file' => $wvalue['file'],
                'thumb' => !empty($wvalue['thumb']) ? $wvalue['thumb'] : '',
                'width' => !empty($wvalue['width']) ? $wvalue['width'] : 600,
                'height' => !empty($wvalue['height']) ? $wvalue['height'] : 400
            ));
        }
        else
        {
            $image = '';
            $thumb = '';
            $upload_data = '';
        }
        if ( !empty($attr['readonly']) )
        {
            return "<div data-upload-base=\"$wupload_base\" data-upload-image=\"$image\" class=\"$wclass\"><img class=\"w-upload-thumbnail\" title=\"{$msg_full}\" src=\"$thumb\" onclick=\"window.open(this.parentNode.getAttribute('data-upload-image'),'preview','scrollbars=yes,resizable=yes,width=600,height=400').focus();\"/></div>";
        }
        else
        {
            $wopts = "";
            if ( isset($attr["options"]) && is_array($attr["options"]) )
            {
                $wopts = 'w-opts="htmlw_'.$wid.'_options"';
                self::enqueue('scripts', 'w-upload-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
            }
            self::enqueue('scripts', 'htmlwidgets');
            return "<div id=\"$wid\" $winit $wopts class=\"$wclass\" $wstyle data-upload-base=\"$wupload_base\" $wextra><img id=\"{$wid}_thumbnail\" class=\"w-upload-thumbnail\" title=\"{$msg_full}\" src=\"$thumb\" /><textarea json-encoded=\"1\" id=\"{$wid}_data\" $wname class=\"_w-data\" style=\"display:none !important;\">$upload_data</textarea><label class=\"w-widget w-button\" title=\"{$msg_upload}\"><i class=\"fa fa-upload\"></i><input id=\"{$wid}_uploader\" type=\"file\" class=\"_w-uploader\" style=\"display:none !important;\" /></label><button type=\"button\" class=\"w-widget w-button w-upload-delete\" title=\"{$msg_delete}\"><i class=\"fa fa-times\"></i></button></div>";
        }
    }*/
    
    public static function w_table( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wclass = 'w-widget w-table'; 
        /*
        if ( !empty($attr['stripped']) ) $wclass .= ' stripped';
        if ( !empty($attr['bordered']) ) $wclass .= ' bordered';
        if ( !empty($attr['responsive']) ) $wclass .= ' responsive';
        */
        if ( !empty($attr['class']) ) $wclass .= ' '.$attr['class'];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wcolumns = '';
        $data_cols = $data['columns'];
        $column_keys = array_keys($data_cols);
        $column_values = array_values($data_cols);
        foreach($column_values as $c=>$column)
        {
            $wcolumns .= "<th data-columnkey=\"{$column_keys[$c]}\">".$column."</th>";
        }
        $wcolumns = "<tr>$wcolumns</tr>";
        $wheader = !isset($attr['header']) || !empty($attr['header']) ? '<thead>'.$wcolumns.'</thead>' : '';
        $wfooter = !empty($attr['footer']) ? '<tfoot>'.$wcolumns.'</tfoot>' : '';
        $wrows = '';
        foreach($data['rows'] as $i=>$row)
        {
            $rowid = isset($row['id']) ? $row['id'] : $i;
            $rowv = array_values(isset($row['cells']) ? $row['cells'] : $row);
            $wrows .= "\n" . "<tr data-row=\"$rowid\">";
            foreach($column_values as $c=>$column)
            {
                $wrows .= "<td data-column=\"".$column."\">{$rowv[$c]}</td>";
            }
            $wrows .= "</tr>";
        }
        $wdata = self::data($attr);
        $wopts = "";
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($attr['datatable']) )
        {
            if ( empty($winit) ) $winit = 'w-init="1"';
            $wclass .= ' w-datatable';
            if ( isset($attr["options"]) && is_array($attr["options"]) )
            {
                $wopts = 'w-opts="htmlw_'.$wid.'_options"';
                self::enqueue('scripts', 'w-datatable-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($attr["options"]).';'));
            }
            self::enqueue('scripts', 'datatables');
            self::enqueue('scripts', 'htmlwidgets');
        }
        return "<table id=\"$wid\" $winit $wopts class=\"$wclass\" $wstyle $wextra $wdata>$wheader<tbody>$wrows</tbody>$wfooter</table>";
    }
    
    public static function w_chart( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wclass = 'w-widget w-chart'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::data($attr);
        $wopts = 'w-opts="htmlw_'.$wid.'_options"';
        $data = (array)$data; $data['bindto'] = '#'.$wid;
        self::enqueue('scripts', 'w-chart-'.$wid, array('window["htmlw_'.$wid.'_options"] = '.json_encode($data).';'));
        self::enqueue('scripts', 'c3');
        self::enqueue('scripts', 'htmlwidgets');
        return "<div id=\"$wid\" $winit $wopts class=\"$wclass\" $wstyle $wextra $wdata></div>";
    }
    
    public static function w_menu( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wclass = 'w-widget w-dropdown-menu'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::data($attr);
        return "<div id=\"$wid\" $winit class=\"$wclass\" $wstyle $wextra $wdata>";
    }
    
    public static function w_menu_end( $attr, $data )
    {
        self::enqueue('styles', 'htmlwidgets.css');
        return "</div>";
    }
    
    public static function w_swf( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'w-swf'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('width','height')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wswf = empty($data['swf']) ? '' : $data['swf'];
        $wquality = empty($attr['quality']) ? 'best' : $attr['quality'];
        $wmode = empty($attr['wmode']) ? 'transparent' : $attr['wmode'];
        $wscale = empty($attr['scale']) ? 'default' : $attr['scale'];
        $wflashvars = empty($attr['flashvars']) ? '' : $attr['flashvars'];
        $wallowfullscreen = empty($attr['allowfullscreen']) ? 'false' : $attr['allowfullscreen'];
        return "<object id=\"{$wid}\" type=\"application/x-shockwave-flash\" {$wextra} data=\"{$wswf}\" class=\"{$wclass}\" $wstyle><param name=\"movie\" value=\"{$wswf}\" /><param name=\"quality\" value=\"{$wquality}\" /><param name=\"wmode\" value=\"{$wmode}\" /><param name=\"scale\" value=\"{$wscale}\" /><param name=\"FlashVars\" value=\"{$wflashvars}\" /><param name=\"allowFullScreen\" value=\"{$wallowfullscreen}\" /></object>";
    }
    
    public static function w_media( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid();
        $wtype = empty($attr['type']) ? "video" : $attr['type'];
        if ( 'audio' !== $wtype ) $wtype = 'video';
        $wclass = 'w-media w-'.$wtype;
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = self::attributes($attr,array('title','width','height','src','controls','autoplay','loop','data')).(!empty($attr["extra"]) ? (' '.$attr["extra"]) : '');
        $wtext = empty($data['text']) ? '' : $data['text'];
        $wsources = empty($data['sources']) ? array() : (array)$data['sources'];
        $wsource = '';
        foreach($wsources as $source)
        {
            // NOTE: use HtmlWidget::options() to format options accordingly to be used here
            $src = $source[0]; $src_type = $source[1];
            $wsource .= "<source src=\"{$src}\" type=\"{$src_type}\"></source>";
        }
        self::enqueue('scripts','html5media');
        return "<{$wtype} id=\"{$wid}\" class=\"{$wclass}\" {$wstyle} {$wextra}>{$wsource}{$wtext}</{$wtype}>";
    }
    
    public static function w_delayable( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wclass = 'w-delayable-overlay'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wspinner = 'w-spinner';
        $wspinner .= !empty($attr['spinner']) ? " {$attr['spinner']}" : " w-spinner-dots";
        self::enqueue('scripts', 'htmlwidgets');
        return "<div id=\"$wid\" $winit class=\"$wclass\" $wstyle $wextra><div class=\"$wspinner\"></div></div>";
    }
    
    public static function w_disabable( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : 'w-init="1"';
        $wclass = 'w-disabable-overlay'; 
        if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        self::enqueue('scripts', 'htmlwidgets');
        return "<div id=\"$wid\" $winit class=\"$wclass\" $wstyle $wextra></div>";
    }
    
    public static function w_morphable( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wclass = 'w-morphable'; 
        $wmodes = (array)$attr['modes'];
        $wmode_class = !empty($attr['mode']) ? $attr['mode'] : 'mode-${MODE}';
        $wshow_class = !empty($attr['show']) ? $attr['show'] : 'show-if-${MODE}';
        $whide_class = !empty($attr['hide']) ? $attr['hide'] : 'hide-if-${MODE}';
        $wselector = "#{$wid}.w-morphable";
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
        self::enqueue('styles', "w-morphable-$wid", array($wstyle), array('htmlwidgets'));
        return '';
    }
    
    public static function w_panel( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wclass = 'w-panel'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wtitle = !empty($attr['title']) ? $attr['title'] : '&nbsp;';
        $wchecked = !empty($attr['closed']) ? 'checked' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wdata = self::data($attr);
        
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($winit) ) self::enqueue('scripts', 'htmlwidgets');
        return "<input type=\"checkbox\" id=\"controller_{$wid}\" class=\"w-panel-controller\" value=\"1\" $wchecked/><div id=\"{$wid}\" $winit class=\"$wclass\" $wstyle $wextra $wdata><div class=\"w-panel-header\">$wtitle<label class=\"w-panel-controller-button fa fa-2x\" for=\"controller_{$wid}\" onclick=\"\"></label></div><div class=\"w-panel-content\">";
    }
    
    public static function w_panel_end( $attr, $data )
    {
        return "</div></div>";
    }
    
    public static function w_accordeon( $attr, $data )
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
    
    public static function w_tabs( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wtabs = (array)$attr['tabs'];
        //$wselected = !empty($data['selected']) ? $data['selected'] : 0;
        
        if ( !empty($attr['3d']) )
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
    
    public static function w_pages( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wcontext = !empty($attr['context']) ? "{$attr['context']} " : "";
        $wpages = (array)$attr['pages'];
        
        if ( !empty($attr['3d']) )
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
    
    public static function w_dialog( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wtitle = isset($data['title']) ? $data['title'] : '';
        $wbuttons = !empty($attr['buttons']) ? $attr['buttons'] : ''; 
        $wcontent = !empty($data['content']) ? $data['content'] : '';
        $wclass = 'w-dialog'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
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
        $wdata = self::data($attr);
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($winit) ) self::enqueue('scripts', 'htmlwidgets');
        return "<div id=\"$wid\" $winit class=\"$wclass\" $wstyle $wextra $wdata><div class=\"w-dialog-title\">{$wicon}{$wtitle}</div><div class=\"w-dialog-content\">$wcontent</div><div class=\"w-dialog-buttons\">$wbuttons</div></div>";
    }
    
    public static function w_modal( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $winit = !empty($attr["init"]) ? 'w-init="'.$attr["init"].'"' : '';
        $wclass = 'w-modal w-dialog'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
        $wstyle = !empty($attr["style"]) ? 'style="'.$attr["style"].'"' : '';
        $wextra = !empty($attr["extra"]) ? $attr["extra"] : '';
        $wtitle = isset($data['title']) ? $data['title'] : '';
        $wicon = !empty($attr['icon']) ? "<i class=\"fa fa-{$attr['icon']}\"></i>" : '';
        $woverlay = !empty($attr['autoclose']) ? '<label for="modal_'.$wid.'" class="w-modal-overlay" onclick=\"\"></label>' : '<div class="w-modal-overlay"></div>';
        $wdata = self::data($attr);
        self::enqueue('styles', 'htmlwidgets.css');
        if ( !empty($winit) ) self::enqueue('scripts', 'htmlwidgets');
        return "<input id=\"modal_{$wid}\" type=\"checkbox\" class=\"w-modal-controller\" />$woverlay<div id=\"{$wid}\" $winit class=\"$wclass\" $wstyle $wextra $wdata><div class=\"w-dialog-title\">{$wicon}{$wtitle}<label for=\"modal_{$wid}\" class=\"w-label w-dialog-close\" title=\"Close\" onclick=\"\"><i class=\"fa fa-times-circle\"></i></label></div><div class=\"w-dialog-content\">";
    }
    
    public static function w_modal_end( $attr, $data )
    {
        $wbuttons = !empty($attr['buttons']) ? $attr['buttons'] : ''; 
        return "</div><div class=\"w-dialog-buttons\">$wbuttons</div></div>";
    }
    
    public static function w_tooltip( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid(); 
        $wtext = isset($data['text']) ? $data['text'] : '';
        $wtitle = isset($attr['title']) ? $attr['title'] : $wtext;
        $wclass = 'w-tooltip'; if ( !empty($attr["class"]) ) $wclass .= ' '.$attr["class"];
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
                $warrow = '<div class="w-tooltip-arrow w-arrow-bottom"></div>';
            elseif ( 'bottom' === $attr['tooltip'] )
                $warrow = '<div class="w-tooltip-arrow w-arrow-top"></div>';
            elseif ( 'right' === $attr['tooltip'] )
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
    
    public static function w_animation( $attr, $data )
    {
        $wid = isset($attr["id"]) ? $attr["id"] : self::uuid('widget_animation');
        $wselector = isset($attr["selector"]) ? $attr["selector"] : '.animate-'.$wid;
        $wanimation = !empty($attr['animation']) ? $attr['animation'] : '';
        $wtransition = !empty($attr['transition']) ? $attr['transition'] : '';
        $wduration = isset($attr['duration']) ? $attr['duration'] : '0.5s';
        $wdelay = isset($attr['delay']) ? $attr['delay'] : '0s';
        $wtiming_function = !empty($attr['timing-function']) ? $attr['timing-function'] : '';
        $weasing = !empty($attr['easing']) ? $attr['easing'] : 'linear';
        if ( empty($wtiming_function) ) $wtiming_function = $weasing;
        $witeration_count = !empty($attr['iteration-count']) ? $attr['iteration-count'] : '1';
        $wfill_mode = !empty($attr['fill-mode']) ? $attr['fill-mode'] : 'both';
        $wanimation_def = '';
        if ( !empty($wanimation) )
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
        if ( !empty($wtransition) )
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
        self::enqueue('styles', $wid, array($wanimation_def), array('htmlwidgets.css'));
        return '';
    }
}
HtmlWidget::$BASE = dirname(__FILE__);
}