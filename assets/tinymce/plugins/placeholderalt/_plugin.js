tinymce.PluginManager.add('placeholder', function( editor ) {
    var placeholder_text = '', is_placeholder = false;
    editor.on('init', function( ){
        // get the current content
        // If its empty and we have a placeholder set the value
        if ( !!editor.settings.placeholder && 0 === editor.getContent( ).length )
        {
            placeholder_text = '<i style="opacity:0.6">' + editor.settings.placeholder + '</i>';
            is_placeholder = true;
            editor.setContent( placeholder_text );
        }
        else
        {
            placeholder_text = '';
            is_placeholder = false;
        }
    })
    .on('focus', function( ){
        // replace the default content on focus if the same as original placeholder
        if ( is_placeholder )
        {
            editor.setContent('');
            is_placeholder = false;
        }
    })
    .on('blur', function( ){
        if ( !!editor.settings.placeholder && 0 === editor.getContent().length )
        {
            placeholder_text = '<i style="opacity:0.6">' + editor.settings.placeholder + '</i>';
            is_placeholder = true;
            editor.setContent( placeholder_text );
        }
    });
});