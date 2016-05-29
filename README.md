# HtmlWidget

standalone and pluggable optimised, localised, modular and dynamicaly initialised html widgets / components for Node/XPCOM/JS, PHP, Python (in progress)


![HtmlWidget](/htmlwidget.jpg)


**related projects:**

*  [components.css](https://github.com/foo123/components.css)
*  [responsive.css](https://github.com/foo123/responsive.css)
*  [jquery-ui-widgets](https://github.com/foo123/jquery-ui-widgets)
*  [modelview-widgets](https://github.com/foo123/modelview-widgets)
*  [SelectorListener](https://github.com/foo123/SelectorListener)
*  [ModelView](https://github.com/foo123/modelview.js)
*  [Contemplate](https://github.com/foo123/Contemplate)
*  [Importer](https://github.com/foo123/Importer)


*note 1:* see `/test/test.html`, `/test/test.php` pages both for testing most widgets and as example code for how to use

*note 2:* most widgets are implemented as pure `html` / `css` components so that they can work even without `javascript` (unless absolutely necessary)

* `HtmlWidget` is also a `XPCOM JavaScript Component` (Firefox) (e.g to be used in firefox browser addons/plugins)


**included widgets:**


1. control, checkbox, radio, switch, checkbox-image, radio-image, checkbox-label, radio-label, checkbox-list, radio-list, radio-array, checkbox-array, selectbox, multi-selectbox, textbox, textarea, file, range/slider, rating
2. buttons, labels, links, icons, tooltips, tags, speech bubbles, spinners
3. table, accordeon, tab, page, collapsable panels, side panels, modals, dialogs, hierarchical responsive horizontal menus, hierarchical responsive vertical menus
4. delayable, disabable, morphable, selectable, removable, sortable, re-arrangeable, draggable, uploadable (drag-n-drop with preview)
5. mvc/mvvm widget, area-select, popup menu, autocompleter, date/time picker, color picker, location/address picker, timer, wysiwyg editor, syntax  editor, advanced selectbox, dataTable, google map, graph/chart, music/tablature score, syntax highlight area
6. flash, swf, video, audio widgets


**external widgets/plugins/libraries (integrated mashup components, with CDN support):**

<!-- , [`Visual Math Editor`](http://visualmatheditor.equatheque.net/index.html), [`Concrete`](https://github.com/mthiede/concrete) -->

1. [`DataTables`](https://github.com/DataTables/DataTables), [`TagEditor`](https://github.com/Pixabay/jQuery-tagEditor), [`Trumbowyg`](https://github.com/Alex-D/Trumbowyg), [`CodeMirror`](https://github.com/codemirror/CodeMirror), [`ACE`](https://github.com/ajaxorg/ace), [`Prism`](https://github.com/LeaVerou/prism), [`SyntaxHighlighter`](https://github.com/syntaxhighlighter/syntaxhighlighter), [`Highlight.js`](https://github.com/isagalaev/highlight.js), [`MathJax`](https://github.com/mathjax/MathJax), [`MathQuill`](https://github.com/mathquill/mathquill), [`TinyMce`](https://github.com/tinymce/tinymce), [`PageDown`](https://github.com/foo123/pagedown-codemirror), [`Typo`](https://github.com/cfinke/Typo.js), [`ImTranslator`](http://about.imtranslator.net/), [`D3`](https://github.com/mbostock/d3), [`C3`](https://github.com/masayuki0812/c3), [`VexFlow`](https://github.com/0xfe/vexflow), [`VexTab`](https://github.com/0xfe/vextab)
2. [`Select2`](https://github.com/select2/select2), [`Sortable`](https://github.com/RubaXa/Sortable), [`tinyDraggable`](https://github.com/Pixabay/jQuery-tinyDraggable), [`AutoComplete`](https://github.com/foo123/AutoComplete), [`DateX`](https://github.com/foo123/DateX), [`Pikadaytime`](https://github.com/foo123/Pikadaytime), [`ColorPicker`](https://github.com/foo123/ColorPicker), [`Timer`](https://github.com/foo123/Timer)
3. [`Jcrop`](https://github.com/tapmodo/Jcrop), [`AreaSelect`](https://github.com/foo123/area-select.js), [`rangeSlider`](https://github.com/andreruffert/rangeslider.js), [`jquery.modal`](http://github.com/kylefox/jquery-modal), [`jquery.tooltipster`](https://github.com/iamceege/tooltipster), [`jquery.locationpicker`](https://github.com/Logicify/jquery-locationpicker-plugin), [`jquery.gmap3`](https://github.com/foo123/jquery-plugins), [`Selectable`,`Removable`,`Morphable`,`Delayable`,`Disabable`,`Uploadable`](https://github.com/foo123/jquery-ui-widgets)
4. [`jsCookie`](https://github.com/js-cookie/js-cookie), [`History.js`](https://github.com/browserstate/History.js/), [`ModelView`](https://github.com/foo123/modelview.js), [`ModelViewForm`](https://github.com/foo123/modelview-form.js), [`Tao.js`](https://github.com/foo123/Tao.js), [`(Form) Serialiser`](https://github.com/foo123/serialiser.js), [`localStorage`](https://github.com/mortzdk/localStorage), [`RT`](https://github.com/foo123/RT), [`smoothState`](https://github.com/miguel-perez/smoothState.js), [`Packery`](https://github.com/metafizzy/packery), [`Isotope`](https://github.com/metafizzy/isotope), [`Masonry`](https://github.com/desandro/masonry), [`Popr2`](https://github.com/foo123/Popr2), [`humane`](http://wavded.github.com/humane-js/)
5. [`html5media`](https://github.com/etianen/html5media), [`video.js`](https://github.com/videojs/video.js)
6. [`Font-Awesome`](https://github.com/FortAwesome/Font-Awesome), [`Hover.css`](https://github.com/IanLunn/Hover), [`jQuery`](https://jquery.com/), [`Modernizr`](https://github.com/modernizr/modernizr)


**browser support (tested)**

* ie (10+)
* firefox (30+)
* chrome (30+)
* opera
* safari


**screenshot samples**


![widgets-1](/screenshots/widgets-1.png)
![widgets-1-2](/screenshots/widgets-1-2.png)
![widgets-2](/screenshots/widgets-2.png)
![widgets-3](/screenshots/widgets-3.png)
![widgets-4](/screenshots/widgets-4.png)
![widgets-4-1](/screenshots/widgets-4-1.png)
![widgets-4-2](/screenshots/widgets-4-2.png)
![widgets-5](/screenshots/widgets-5.png)
![widgets-6](/screenshots/widgets-6.png)
![widgets-7](/screenshots/widgets-7.png)
![widgets-7-1](/screenshots/widgets-7-1.png)

![details-1](/screenshots/details-1.png)
![details-2](/screenshots/details-2.png)
![details-3](/screenshots/details-3.png)
![details-4](/screenshots/details-4.png)
![details-5](/screenshots/details-5.png)
![details-6](/screenshots/details-6.png)
