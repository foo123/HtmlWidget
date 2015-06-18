!function($, undef){
"use strict";
$(function(){
    // controllers
    $('body').on('change', 'input[data-controller]', function(evt){
        var controlled = $($(this).attr('data-controller'));
        if ( this.checked ) 
            controlled.addClass('widget-controller-checked');
        else
            controlled.removeClass('widget-controller-checked');
    });
    $('input[data-controller]').trigger('change');
});
}(jQuery);