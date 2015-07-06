!function($, undef){
"use strict";
$(function(){
    // controllers
    $('body')
    .on('change', 'input[data-controller]', function(evt){
        var controlled = $($(this).attr('data-controller'));
        if ( this.checked ) 
            controlled.addClass('widget-controller-checked');
        else
            controlled.removeClass('widget-controller-checked');
    })
    .on('change', 'input[data-synchronise]', function(evt){
        var synchronised = $($(this).attr('data-synchronise')),
            type = this.type.toLowerCase();
        if ( 'checkbox' === type || "radio" === type )
            synchronised.prop("checked", this.checked);
        else
            synchronised.val(this.value);
    });
    $('input[data-controller]').trigger('change');
    $('input[data-synchronise]').trigger('change');
});
}(jQuery);