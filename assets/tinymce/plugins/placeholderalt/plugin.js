tinymce.PluginManager.add('placeholderalt', function( editor ) {
    var placeholder_text = '', placeholder_css = '\
.mce-content-body-placeholder {\
position: relative;\
}\
.mce-content-body-placeholder:before {\
position: absolute;\
left: 0px; top: 0px;\
color: inherit;\
font-size: inherit;\
font-style: italic;\
opacity: 0.6;\
content: "";\
display: none;\
}\
.mce-content-body-placeholder.mce-empty-content:not(.mce-focused):before {\
content: attr(data-placeholder);\
display: block;\
z-index: 1;\
}\
';
    var onChange = function onChange( ) {
        var body = editor.getBody( );
        if ( (null != editor.settings.placeholder) && (placeholder_text !== editor.settings.placeholder) )
        {
            // can dynamicaly change placeholder
            placeholder_text = editor.settings.placeholder;
            editor.dom.setAttrib( body, 'data-placeholder', placeholder_text );
        }
        if ( 0 === editor.getContent( ).length ) editor.dom.addClass( body, 'mce-empty-content' );
        else editor.dom.removeClass( body, 'mce-empty-content' );
    };
    var onFocus = function onFocus( ) {
        editor.dom.addClass( editor.getBody( ), 'mce-focused' );
    };
    var onBlur = function onBlur( ) {
        editor.dom.removeClass( editor.getBody( ), 'mce-focused' );
    };
    editor.on('PreInit', function( ){
        var body = editor/*.dom.select('#tinymce')*/.getBody();
        //console.log(editor.dom.getAttrib(body,'id'));
        editor.dom.addStyle( placeholder_css );
        editor.dom.addClass( body, 'mce-content-body-placeholder' );
        placeholder_text = null != editor.settings.placeholder ? editor.settings.placeholder : '';
        editor.dom.setAttrib( body, 'data-placeholder', placeholder_text );
    })
    .on('init', onChange).on('NodeChange', onChange)
    .on('focus', onFocus).on('blur', onBlur)
    ;
});