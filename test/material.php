<?php
@ini_set('display_errors', E_ALL);

require('../../Importer/src/php/Importer.php');
require('../HtmlWidget.php');

global $importer;

$importer = new Importer( );
$importer->register( 'assets', HtmlWidget::assets(array(
            'base'      => '../',
            'full'      => true,
            'jquery'    => true,
            'dev'       => true,
            'cdn'       => true
        )) );
HtmlWidget::enqueueAssets( array( $importer, 'enqueue' ) );

function widget( $widget, $attr=array(), $data=array() )
{
    echo HtmlWidget::widget( $widget, $attr, $data );
}
function options( $options, $key=null, $val=null )
{
    return HtmlWidget::options( $options, $key, $val );
}
function enqueue( $type, $asset )
{
    global $importer;
    $importer->enqueue( $type, $asset );
}
function styles( )
{
    global $importer;
    echo $importer->assets( 'styles' );
}
function scripts( )
{
    global $importer;
    echo $importer->assets( 'scripts' );
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
    <meta charset="utf-8"/>
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
    #forkongithub a {
        width: 200px;
        position: absolute;
        top: 60px;
        right: -60px;
        transform: rotate(45deg);
        box-shadow: 4px 4px 10px rgba(0,0,0,0.8);
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
    @media (max-width: 60em), (max-device-width: 60em)
    {
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
    }
    h2 {
        display: block;
        margin-top: 20px;
    }
    </style>
    <title>HtmlWidgets Material Components Test page (v.<?php echo HtmlWidget::VERSION; ?>)</title>
</head>
<body style="padding:10px 20px">
    <span id="forkongithub"><a href="https://github.com/foo123/HtmlWidget">Find me on GitHub</a></span>
    <h1>HtmlWidgets Material Components Test page (v.<?php echo HtmlWidget::VERSION; ?>)</h1>
    
<h2>Buttons</h2>
<hr />

<?php widget('button', array('framework'=>'material','icon'=>'info-circle'),array('text'=>'Button')); ?>
<?php widget('button', array('framework'=>'material','icon'=>'info-circle','class'=>'mdc-button--raised'),array('text'=>'Button')); ?>
<?php widget('button', array('framework'=>'material','iconr'=>'info-circle','class'=>'mdc-button--elevated'),array('text'=>'Button')); ?>
<?php widget('button', array('framework'=>'material','iconr'=>'info-circle','class'=>'mdc-button--outlined'),array('text'=>'Button')); ?>
<?php widget('button', array('framework'=>'material','iconr'=>'info-circle','class'=>'mdc-button--unelevated mdc-button--dense'),array('text'=>'Button')); ?>

<h2>Checkboxes / Radio Buttons</h2>
<hr />

<div class="mdc-form-field">
<?php widget('checkbox',array('framework'=>'material','id'=>'c1'),array()); ?>
<label for="c1">Checkbox 1</label>
</div>

<div class="mdc-form-field">
<?php widget('radio',array('framework'=>'material','id'=>'r1','name'=>'radio1'),array()); ?>
<label for="r1">Radio 1</label>
</div>
<div class="mdc-form-field">
<?php widget('radio',array('framework'=>'material','id'=>'r2','name'=>'radio1'),array()); ?>
<label for="r2">Radio 2</label>
</div>

<h2>Switches</h2>
<hr />
<?php widget('switch',array('framework'=>'material','id'=>'s1'),array()); ?>
<label for="s1">off/on</label>


<h2>Select Boxes</h2>
<hr />
<?php widget('selectbox',array('framework'=>'material','placeholder'=>'Select..'),array('options'=>array(
array('key1','option1'),
array('key2','option2'),
array('key3','option3'),
))); ?>

<h2>Text Fields</h2>
<hr />
<?php widget('text',array('framework'=>'material','placeholder'=>'Type..'),array()); ?>

<?php
enqueue('styles','fontawesome.css');
styles( );
scripts( );
?>
</body>
</html>