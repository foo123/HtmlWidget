<?php
//require('../../Importer/src/php/Importer.php');
require('../HtmlWidget.php');
//var $importer = new Importer('../','../');
//HtmlWidget::enqueueAssets(array($importer,'enqueue'));
//$importer->register('assets', HtmlWidget::assets('../',true,true));
function widget( $widget, $attr=array(), $data=array() )
{
    echo HtmlWidget::widget( $widget, $attr, $data );
}
function options( $options, $key=null, $val=null )
{
    return HtmlWidget::options( $options, $key, $val );
}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="../assets/fontawesome.css" />
        <link rel="stylesheet" href="../assets/pikadaytime.css" />
        <link rel="stylesheet" href="../assets/colorpicker.css" />
        <link rel="stylesheet" href="../htmlwidgets.css" />
        <script src="../assets/jquery.js"></script>
        <script src="../assets/selectorlistener.js"></script>
        <script src="../assets/datex.js"></script>
        <script src="../assets/pikadaytime.js"></script>
        <script src="../assets/colorpicker.js"></script>
        <script src="../htmlwidgets.js"></script>
        <style type="text/css">
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
        @media all and (max-width : 768px) {

        .w-vertical-menu.w-mobile > .w-menu-controller-bt,
        .w-dropdown-menu.w-mobile > .w-menu-controller-bt {
            display: block;
            position: absolute;
            top: 0; left: 0;
        }
        }
        </style>
        <title>HtmlWidgets Test page</title>
    </head>
    <body>
        <h1>HtmlWidgets Test page</h1>
        <hr />
        
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
        
        <hr />
        <?php widget('button',array('class'=>'w-small','icon'=>'plus'),array('text'=>'small')); ?>
        <?php widget('button',array('class'=>'','icon'=>'plus'),array('text'=>'button')); ?>
        <?php widget('button',array('class'=>'w-large','icon'=>'times-circle'),array('text'=>'large')); ?>
        <?php widget('button',array('class'=>'w-xlarge','icon'=>'info-circle'),array('text'=>'xlarge')); ?>
        <?php widget('button',array('class'=>'','icon'=>'plus')); ?>
        <?php widget('button',array('class'=>'w-large','icon'=>'times-circle')); ?>
        <?php widget('button',array('class'=>'w-xlarge','icon'=>'info-circle')); ?>
        <?php widget('button',array('class'=>'w-primary','icon'=>'plus'),array('text'=>'button')); ?>
        <?php widget('button',array('class'=>'w-green','icon'=>'plus'),array('text'=>'button')); ?>
        <?php widget('button',array('class'=>'w-large w-orange','icon'=>'times-circle'),array('text'=>'large')); ?>
        <?php widget('button',array('class'=>'w-xlarge w-red','icon'=>'info-circle'),array('text'=>'xlarge')); ?>
        <hr />
        <?php widget('dropdown',array('placeholder'=>'select..'),array('options'=>options(array(
            1 => 'option 1',
            2 => 'option 2'
        ),-1))); ?>
        <?php widget('dropdown',array('placeholder'=>'large..','class'=>'w-large'),array('options'=>options(array(
            1 => 'option 1',
            2 => 'option 2'
        ),-1))); ?>
        <?php widget('dropdown',array('placeholder'=>'xlarge..','class'=>'w-xlarge'),array('options'=>options(array(
            1 => 'option 1',
            2 => 'option 2'
        ),-1))); ?>
        <div w-init="1" class="colorpicker-selector w-colorselector" data-colorpicker-color="rgba(210,0,0,0.7)" data-colorpicker-format="rgba" style="background-color:rgba(210,0,0,0.7)"></div>
        <div w-init="1" class="colorpicker-selector w-colorselector w-large" data-colorpicker-color="rgba(210,0,0,0.7)" data-colorpicker-format="rgba" style="background-color:rgba(210,0,0,0.7)"></div>
        <?php widget('rating',array('title'=>'Please rate:','icon'=>'star'),array('value'=>'3')); ?>
        <?php widget('rating',array('title'=>'Please rate:','class'=>'w-large','icon'=>'star'),array('value'=>'3')); ?>
        <?php widget('rating',array('title'=>'Please rate:','class'=>'w-xlarge','icon'=>'star'),array('value'=>'3')); ?>
        <hr />
        <input type="text" class="w-widget w-text" placeholder="text.." value=""/>
        <input w-init="1" type="text" class="w-widget w-text w-date w-large" data-datepicker-time="1" data-datepicker-format="Y-m-d H:i:s" placeholder="large.." value=""/>
        <input type="text" class="w-widget w-text w-xlarge" placeholder="x-large.." value="" />
        <hr />
        <textarea class="w-widget w-textarea" placeholder="textarea.."></textarea>
        <textarea class="w-widget w-textarea w-large" placeholder="large.."></textarea>
        <textarea class="w-widget w-textarea w-xlarge" placeholder="x-large.."></textarea>
        <hr />
        <input type="checkbox" id="checkbox" class="w-widget w-checkbox" value="1"/> <label for="checkbox" class="w-widget w-checkbox"></label>
        <input type="radio" name="radio" id="radio1" class="w-widget w-radio" value="1"/> <label for="radio1" class="w-widget w-radio"></label>
        <input type="radio" name="radio" id="radio2" checked class="w-widget w-radio" value="2"/> <label for="radio2" class="w-widget w-radio"></label>
        <input type="checkbox" id="checkboxl" class="w-widget w-checkbox" value="1"/> <label for="checkboxl" class="w-widget w-checkbox w-large"></label>
        <input type="radio" name="radiol" id="radio1l" class="w-widget w-radio" value="1"/> <label for="radio1l" class="w-widget w-radio w-large"></label>
        <input type="radio" name="radiol" id="radio2l" checked class="w-widget w-radio" value="2"/> <label for="radio2l" class="w-widget w-radio w-large"></label>
        <input type="checkbox" id="checkboxx" class="w-widget w-checkbox" value="1"/> <label for="checkboxx" class="w-widget w-checkbox w-xlarge"></label>
        <input type="radio" name="radiox" id="radio1x" class="w-widget w-radio" value="1"/> <label for="radio1x" class="w-widget w-radio w-xlarge"></label>
        <input type="radio" name="radiox" id="radio2x" checked class="w-widget w-radio" value="2"/> <label for="radio2x" class="w-widget w-radio w-xlarge"></label>
        <hr />
        <span class="w-widget w-switch" title="Switch"><input type="checkbox" id="switch" class="w-switch-state" value="1"  /><label for="switch" class="w-switch-on" onclick=""></label><label for="switch" class="w-switch-off" onclick=""></label><span class="w-switch-handle"></span></span>
        <span class="w-widget w-switch w-large" title="Switch"><input type="checkbox" id="switchl" class="w-switch-state" value="1"  /><label for="switchl" class="w-switch-on" onclick=""><i class="fa fa-check-circle"></i></label><label for="switchl" class="w-switch-off" onclick=""><i class="fa fa-check"></i></label><span class="w-switch-handle"></span></span>
        <span class="w-widget w-switch w-xlarge" title="Switch"><input type="checkbox" id="switchx" class="w-switch-state" value="1"  /><label for="switchx" class="w-switch-on" onclick=""><i class="fa fa-check-circle"></i></label><label for="switchx" class="w-switch-off" onclick=""><i class="fa fa-check"></i></label><span class="w-switch-handle"></span></span>
        <hr />
        <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Right <span class="w-tooltip-arrow w-arrow-right"></span></div>
        <hr /><br /><br />
        <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Bottom <span class="w-tooltip-arrow w-arrow-bottom"></span></div>
        <hr /><br /><br />
        <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Left <span class="w-tooltip-arrow w-arrow-left"></span></div>
        <hr /><br /><br />
        <div class="w-tooltip"><i class="fa fa-info-circle"></i> Tooltip Top <span class="w-tooltip-arrow w-arrow-top"></span></div>
        <hr /><br /><br />
        <div class="box w-delayable w-delayed"></div>
        <div class="box">
        <div class="w-spinner w-spinner-dots2 active"></div>
        </div>
        <hr />
        <div class="box">
           <div class="w-ribbon-dtl w-red w-ribbon-fold w-large"><span>Ribbon</span></div>
           <div class="w-ribbon-dtr w-blue"><span>Ribbon</span></div>
           <!--<div class="w-ribbon w-ribbon-fold"><span>Pure CSS Ribbon</span></div>-->
        </div>
        <hr />
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
        <?php
        /*echo $importer->assets('styles');
        echo $importer->assets('scripts');*/
        ?>
    </body>
</html>