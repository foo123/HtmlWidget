<?php
@ini_set('display_errors', E_ALL);

if ( !empty($_POST) || !empty($_FILES) )
{
    echo json_encode(array(
        '$_POST'        => empty($_POST) ? array() : $_POST,
        '$_FILES'       => empty($_FILES) ? array() : $_FILES
    ));
    exit;
}
require('../../Importer/src/php/Importer.php');
require('../HtmlWidget.php');

global $importer;

$importer = new Importer();
HtmlWidget::enqueueAssets(array($importer,'enqueue'));
$importer->register('assets', HtmlWidget::assets('../', true, true, true));

function widget( $widget, $attr=array(), $data=array() )
{
    echo HtmlWidget::widget( $widget, $attr, $data );
}
function options( $options, $key=null, $val=null )
{
    return HtmlWidget::options( $options, $key, $val );
}
function enqueue($type, $asset)
{
    global $importer;
    $importer->enqueue( $type, $asset );
}
function styles( )
{
    global $importer;
    echo $importer->assets('styles');
}
function scripts( )
{
    global $importer;
    echo $importer->assets('scripts');
}

?>
<!doctype html>
<!--[if lt IE 7]>
<html lang="en" class="ie lt-ie9 lt-ie8 lt-ie7">
<![endif]-->
<!--[if IE 7]>
<html lang="en" class="ie lt-ie9 lt-ie8">
<![endif]-->
<!--[if IE 8]>
<html lang="en" class="ie lt-ie9">
<![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en" class="no-ie">
<!--<![endif]-->
<head>
    <style type="text/css">
    #forkongithub  a {
        background: #aa0000;
        color: #fff;
        text-decoration: none;
        font-family: arial, sans-serif;
        text-align: center;
        font-weight: bold;
        padding: 5px 40px;
        font-size: 0.9rem;
        line-height: 1.4rem;
        position: relative;
        transition: all 0.5s;
    }
    #forkongithub a:hover {
        background: #aa0000;
        color: #fff;
    }
    #forkongithub a::before, #forkongithub a::after {
        content: "";
        width: 100%;
        display: block;
        position: absolute;
        z-index: 100;
        top: 1px;
        left: 0;
        height: 1px;
        background: #fff;
    }
    #forkongithub a::after
    {
        bottom: 1px;
        top: auto;
    }

    @media screen and (min-width:800px) {
        #forkongithub {
            position: absolute;
            display: block;
            z-index: 100;
            top: 0;
            right: 0;
            width: 200px;
            overflow: hidden;
            height: 200px;
        }
        #forkongithub a {
            width: 200px;
            position: absolute;
            top: 60px;
            right: -60px;
            transform: rotate(45deg);
            box-shadow: 4px 4px 10px rgba(0,0,0,0.8);
        }
    }
    .box {
        width: 600px; height: 200px;
        position: relative;
        border: 1px solid #BBB;
        background: #EEE;
        margin-left: 100px;
    }
    .w-menu-controller-bt {
        cursor: pointer;
        display: none;
    }
    .w-vertical-menu {
        width: 300px;
    }
    .w-bubble {
        max-width: 300px;
        border-color: #f3961c;
        background: #f3961c;
        color: #fff;
        font-weight: bold;
    }
    legend {
        font-size: 2em;
        font-weight: bold;
        padding: 20px;
    }
    @media all and (max-width : 768px) {

    .w-vertical-menu.w-mobile > .w-menu-controller-bt,
    .w-dropdown-menu.w-mobile > .w-menu-controller-bt {
        display: block;
        position: absolute;
        top: 0; left: 0;
    }
    }
    </style>
    <title>HtmlWidgets Test page (v.<?php echo HtmlWidget::VERSION; ?>)</title>
</head>
<body class="fluid col-1-1" style="padding:10px 20px">
    <span id="forkongithub"><a href="https://github.com/foo123/HtmlWidget">Find me on GitHub</a></span>
    <h1>HtmlWidgets Test page (v.<?php echo HtmlWidget::VERSION; ?>)</h1>
    
    <hr />
    
    <form method="post" enctype="multipart/form-data">
    <fieldset><legend>Menus</legend>
    
    <div class="w-dropdown-menu"><ul>
    <li class="w-submenu-item">
        <a href="#">Item</a>
        <ul>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li class="w-submenu-item">
            <a href="#">sub Item</a>
            <ul>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li class="w-submenu-item">
                <a href="#">sub sub Item</a>
                <ul>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                </ul>
            </li>
            </ul>
        </li>
        </ul>
    </li>
    <li class="active"><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    </ul></div>
    
    <hr />
    <div class="w-dropdown-menu w-mobile" style="z-index:300">
    <label for="mobile-menu" class="w-menu-controller-bt"><i class="fa fa-bars fa-2x"></i>&nbsp;</label>
    <input id="mobile-menu" type="checkbox" class="w-menu-controller" value="1" />
    <ul>
    <li class="w-submenu-item">
        <a href="#">Item</a>
        <ul>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li class="w-submenu-item">
            <a href="#">sub Item</a>
            <ul>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li class="w-submenu-item">
                <a href="#">sub sub Item</a>
                <ul>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                </ul>
            </li>
            </ul>
        </li>
        </ul>
    </li>
    <li class="active"><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    </ul></div>

    <hr />
    
    <div class="w-vertical-menu" style="z-index:200"><ul>
    <li class="w-submenu-item">
        <a href="#">Item</a>
        <ul>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li class="w-submenu-item">
            <a href="#">sub Item</a>
            <ul>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li class="w-submenu-item">
                <a href="#">sub sub Item</a>
                <ul>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                </ul>
            </li>
            </ul>
        </li>
        </ul>
    </li>
    <li class="active"><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    </ul></div>
    
    <hr />
    
    <div class="w-vertical-menu w-mobile" style="z-index:100">
    <label for="mobile-menu2" class="w-menu-controller-bt"><i class="fa fa-bars fa-2x"></i>&nbsp;</label>
    <input id="mobile-menu2" type="checkbox" class="w-menu-controller" value="1" />
    <ul>
    <li class="w-submenu-item">
        <a href="#">Item</a>
        <ul>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li><a href="#">sub Item</a></li>
        <li class="w-submenu-item">
            <a href="#">sub Item</a>
            <ul>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li><a href="#">sub sub Item</a></li>
            <li class="w-submenu-item">
                <a href="#">sub sub Item</a>
                <ul>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                <li><a href="#">sub sub sub Item</a></li>
                </ul>
            </li>
            </ul>
        </li>
        </ul>
    </li>
    <li class="active"><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    <li><a href="#">Item</a></li>
    </ul></div>
    
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Buttons</legend>
    <?php widget('button',array('class'=>'w-small','icon'=>'plus'),array('text'=>'small')); ?>
    <?php widget('button',array('class'=>'','icon'=>'plus'),array('text'=>'button')); ?>
    <?php widget('button',array('class'=>'w-large','icon'=>'times-circle','disabled'=>1),array('text'=>'large')); ?>
    <?php widget('button',array('class'=>'w-xlarge','icon'=>'info-circle','readonly'=>1),array('text'=>'xlarge')); ?>
    <?php widget('button',array('class'=>'','icon'=>'plus')); ?>
    <?php widget('button',array('class'=>'w-large','icon'=>'times-circle')); ?>
    <?php widget('button',array('class'=>'w-xlarge','icon'=>'info-circle')); ?>
    <?php widget('button',array('class'=>'w-primary','icon'=>'plus','disabled'=>1),array('text'=>'button')); ?>
    <?php widget('button',array('class'=>'w-green','icon'=>'plus','readonly'=>1),array('text'=>'button')); ?>
    <?php widget('button',array('class'=>'w-large w-orange','icon'=>'times-circle'),array('text'=>'large')); ?>
    <?php widget('button',array('class'=>'w-xlarge w-red','icon'=>'info-circle'),array('text'=>'xlarge')); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Dropdowns</legend>
    <?php widget('dropdown',array('placeholder'=>'select..'),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    <?php widget('dropdown',array('placeholder'=>'large..','class'=>'w-large','disabled'=>1),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    <?php widget('dropdown',array('placeholder'=>'xlarge..','class'=>'w-xlarge','readonly'=>1),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    
    <hr />
    
    <?php widget('select2',array('placeholder'=>'select..'),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    <?php widget('select2',array('placeholder'=>'large..','class'=>'w-large','disabled'=>1),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    <?php widget('select2',array('placeholder'=>'xlarge..','class'=>'w-xlarge','readonly'=>1),array('options'=>options(array(
        1 => 'option 1',
        2 => 'option 2'
    ),-1))); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Colorpicker</legend>
    <?php widget('colorpicker',array(
        'title'=>'Select color',
        'data'=>array(
            'colorpicker-format' => 'rgba'
        )
    ),array(
        'color'=>'rgba(210,0,0,0.7)'
    )); ?>
    <?php widget('colorpicker',array(
        'title'=>'Select color',
        'class' => 'w-large',
        'data'=>array(
            'colorpicker-format' => 'rgba'
        )
    ),array(
        'color'=>'rgba(210,0,0,0.7)'
    )); ?>
    <?php widget('colorpicker',array(
        'title'=>'Select color',
        'class' => 'w-xlarge',
        'data'=>array(
            'colorpicker-format' => 'rgba'
        )
    ),array(
        'color'=>'rgba(210,0,0,0.7)'
    )); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Datetimepicker</legend>
    <?php widget('datetimepicker',array(
        'title'=>'Select date-time',
        'data'=>array(
            'datetime-format' => 'Y-m-d H:i:s',
            'datetime-time' => 1,
            'datetime-seconds' => 1
        )
    ),array(
        'value'=>'2016-01-24 12:00:00'
    )); ?>
    <?php widget('datetimepicker',array(
        'title'=>'Select date-time',
        'class' => 'w-large',
        'disabled' => 1,
        'data'=>array(
            'datetime-format' => 'Y-m-d H:i:s',
            'datetime-time' => 1,
            'datetime-seconds' => 1
        )
    ),array(
        'value'=>'2016-01-24 12:00:00'
    )); ?>
    <?php widget('datetimepicker',array(
        'title'=>'Select date-time',
        'class' => 'w-xlarge',
        'readonly' => 1,
        'data'=>array(
            'datetime-format' => 'Y-m-d H:i:s',
            'datetime-time' => 1,
            'datetime-seconds' => 1
        )
    ),array(
        'value'=>'2016-01-24 12:00:00'
    )); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Ratings</legend>
    <?php widget('rating',array('title'=>'Please rate:','icon'=>'star'),array('value'=>'3')); ?>
    <?php widget('rating',array('title'=>'Please rate:','class'=>'w-large','icon'=>'star','disabled'=>1),array('value'=>'3')); ?>
    <?php widget('rating',array('title'=>'Please rate:','class'=>'w-xlarge','icon'=>'star','readonly'=>1),array('value'=>'3')); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Textboxes</legend>
    <?php widget('textbox',array('title'=>'text..','icon'=>'pencil'),array('value'=>'')); ?>
    <?php widget('textbox',array('class'=>'w-large','title'=>'large..','icon'=>'pencil','disabled'=>1),array('value'=>'')); ?>
    <?php widget('textbox',array('class'=>'w-xlarge','title'=>'xlarge..','icon'=>'pencil','readonly'=>1),array('value'=>'')); ?>
    
    <hr />
    
    <?php widget('textarea',array('title'=>'text..','icon'=>'pencil'),array('value'=>'')); ?>
    <?php widget('textarea',array('class'=>'w-large','title'=>'large..','icon'=>'pencil','disabled'=>1),array('value'=>'')); ?>
    <?php widget('textarea',array('class'=>'w-xlarge','title'=>'xlarge..','icon'=>'pencil','readonly'=>1),array('value'=>'')); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Wysiwyg Editor</legend>
    <?php widget('wysiwyg-editor',array('placeholder'=>'rich text..'),array('value'=>'<i>hello</i>')); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Syntax Editor</legend>
    <?php widget('syntax-editor',array('placeholder'=>'source text..','data'=>array('cm-mode'=>'text/html')),array('value'=>'<p>Hello</p>')); ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Google Map</legend>
    <?php /*widget('map', array(
        'title' => 'Here',
        'style' => 'width:100%',
        'options' => array(
            'center'        => array(39.5455, 22.345353),
            'centerMarker'  => true,
            'zoom'          => 12,
            'type'          => 'ROADMAP',
            'responsive'    => true
        )
    ));*/ ?>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Checkboxes</legend>
    <?php widget('checkbox',array('title'=>'Check'),array('value'=>'1')); ?>
    <?php widget('checkbox',array('title'=>'Check','class'=>'w-large','disabled'=>1),array('value'=>'1')); ?>
    <?php widget('checkbox',array('title'=>'Check','class'=>'w-xlarge','readonly'=>1),array('value'=>'1')); ?>
    
    <hr />
    
    <?php widget('radio',array('title'=>'Check','name'=>'radio'),array('value'=>'1')); ?>
    <?php widget('radio',array('title'=>'Check','name'=>'radio','class'=>'w-large','disabled'=>1),array('value'=>'1')); ?>
    <?php widget('radio',array('title'=>'Check','name'=>'radio','class'=>'w-xlarge','readonly'=>1),array('value'=>'1')); ?>
    
    <hr />
    
    <?php widget('switch',array('title'=>'Check','readonly'=>1),array('value'=>'1')); ?>
    <?php widget('switch',array('title'=>'Check','class'=>'w-large','iconon'=>'check','iconoff'=>'times-circle','disabled'=>1),array('value'=>'1')); ?>
    <?php widget('switch',array('title'=>'Check','class'=>'w-xlarge','iconon'=>'check','iconoff'=>'times-circle'),array('value'=>'1')); ?>
    
    <hr />
    
    <?php widget('checklist',array('name'=>'demo_list_1[]'),array('options'=>options(array(
        '1' => 'Option 1',
        '2' => 'Option 2',
        '3' => 'Option 3'
    ),-1), 'value'=>array(2,3))); ?>
    <?php widget('radiolist',array('class'=>'w-large','name'=>'demo_list_2'),array('options'=>options(array(
        '1' => 'Option 1',
        '2' => 'Option 2',
        '3' => 'Option 3'
    ),-1), 'value'=>1)); ?>
    <?php widget('radiolist',array('class'=>'w-xlarge','name'=>'demo_list_3','disabled'=>1),array('options'=>options(array(
        '1' => 'Option 1 very loooong option very loooong option very loooong option very loooong option very loooong option very loooong option',
        '2' => 'Option 2 very loooong option very loooong option very loooong option very loooong option very loooong option very loooong option',
        '3' => 'Option 3 very loooong option very loooong option very loooong option very loooong option very loooong option very loooong option'
    ),-1), 'value'=>3)); ?>
    
    <hr />
    
    <?php widget('checkbox-image',array('image'=>'./luxury.jpg','name'=>'demo_image_1','style'=>'width:152px;height:152px'),array()); ?>
    <?php widget('radio-image',array('image'=>'./luxury.jpg','name'=>'demo_image_2','style'=>'width:152px;height:152px'),array()); ?>
    <?php widget('radio-image',array('image'=>'./comfort.jpg','name'=>'demo_image_2','style'=>'width:152px;height:152px','checked'=>1),array()); ?>
    
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Uploads</legend>
    <?php widget('file',array('title'=>'Upload your file here','placeholder'=>'Upload your file here')); ?>
    <?php widget('dnd-upload',array('name'=>'foo','title'=>'Upload your file here','show-preview'=>1,'upload-thumbnail'=>1)); ?>
    <?php widget('dnd-upload',array('name'=>'bar[foo]','title'=>'Upload your file here','show-preview'=>1,'upload-thumbnail'=>1)); ?>
    <?php widget('dnd-upload',array('name'=>'foo2[]','title'=>'Upload your file here','show-preview'=>1,'upload-thumbnail'=>1)); ?>
    <?php widget('dnd-upload',array('name'=>'bar2[foo2][]','title'=>'Upload your file here','show-preview'=>1,'upload-thumbnail'=>1)); ?>
    </fieldset>
    
    
    <hr />
    
    <fieldset><legend>Tooltips</legend>
    <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Right <span class="w-tooltip-arrow w-arrow-right"></span></div>
    <hr /><br /><br />
    <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Bottom <span class="w-tooltip-arrow w-arrow-bottom"></span></div>
    <hr /><br /><br />
    <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Left <span class="w-tooltip-arrow w-arrow-left"></span></div>
    <hr /><br /><br />
    <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Top <span class="w-tooltip-arrow w-arrow-top"></span></div>
    </fieldset>
    
    <hr /><br /><br />
    
    <fieldset><legend>Spinners</legend>
    <div class="box w-delayable w-delayed"></div>
    <div class="box"><div class="w-spinner w-spinner-dots2 active"></div></div>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Ribbons</legend>
    <div class="box">
       <div class="w-ribbon-dtl w-red w-ribbon-fold w-large"><span>Ribbon</span></div>
       <div class="w-ribbon-dtr w-blue"><span>Ribbon</span></div>
    </div>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>(Speech) Bubbles</legend>
    <div class="w-bubble w-bubble-up">Bubble Up</div>
    <div class="w-bubble w-bubble-down">Bubble Down</div>
    <div class="w-bubble w-bubble-left">Bubble Left</div>
    <div class="w-bubble w-bubble-right">Bubble Right</div>
    <div class="w-bubble w-bubble2-up">Bubble Up</div>
    <div class="w-bubble w-bubble2-down">Bubble Down</div>
    <div class="w-bubble w-bubble2-left">Bubble Left</div>
    <div class="w-bubble w-bubble2-right">Bubble Right</div>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Tags</legend>
    <span class="w-tag w-orange">Tag 1</span>
    <span class="w-tag w-large w-green">Tag 2</span>
    <span class="w-tag w-xlarge w-red w-tag2">Tag 3</span>
    <span class="w-tag w-primary w-tag2">Tag 4</span>
    <span class="w-tag w-blue w-tag3">Tag 5</span>
    <span class="w-tag w-green w-large w-tag3">Tag 6</span>
    </fieldset>
    
    <hr />
    
    <fieldset><legend>Messages</legend>
    <div class="w-msg w-msg-ok">
        <i class="fa fa-check"></i> <strong>Success!</strong>
        This msg indicates a successful or positive action.
    </div>
    <div class="w-msg w-msg-info">
        <i class="fa fa-info"></i> <strong>Info!</strong>
        This msg indicates a neutral informative change or action. 
    </div>
    <div class="w-msg w-msg-warn">
        <i class="fa fa-exclamation-circle"></i> <strong>Warning!</strong>
        This msg indicates a warning that might need attention.
    </div>
    <div class="w-msg w-msg-err">
        <i class="fa fa-exclamation-triangle"></i> <strong>Error!</strong>
        This msg indicates a dangerous or potentially negative action. 
    </div>
    </fieldset>
    <button id="submit_form" type="submit">Submit Test</button>
    </form>
    
    <?php
    //enqueue('scripts','-external-google-maps-api');
    enqueue('styles','normalize.css');
    enqueue('styles','responsive.css');
    enqueue('styles','fontawesome.css');
    enqueue('scripts','jquery');
    enqueue('scripts','tooltipster');
    enqueue('scripts','serialiser');
    styles( );
    scripts( );
    ?>
    <script>
    jQuery(function($){
       $('#submit_form').on('click', function( evt ){
           evt.preventDefault( );
           evt.stopPropagation( );
           $.ajax({
                type: 'POST',
                method: 'POST',
                dataType: 'json',
                url: document.location,
                data: Serialiser.ModelToFormData(Serialiser.FieldsToModel($('form').find('input,textarea,select'), {})),
                processData: false,
                contentType: false
            });
           return false;
       });
    });
    </script>
</body>
</html>