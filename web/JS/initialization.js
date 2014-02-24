/* 
 * Initialization
 */

$(document).ready(function() {

    // hide edit properties
    $('#EditNodeDivShow').hide();
    $('#EditNodeDivHide').show();
    $('#ViewSimulatorDiv').hide();
    $('#expandTree').trigger("click");
    $("#viewgui").attr("disabled", "disabled");
    $('#viewTab').attr("disabled", "disabled");

    // create new tree 
    newTree();

    // init session id
    $.get('SimServlet', {request: "initSession"}, function(responseText) {
        //$("#sessionId").text(responseText); // fot testing
    });

    // get iframe child
    $("iframe").each(function()
    {
        $(this).one("load", function()
        {
            $(this)[0].contentWindow;
        });
    });

    // slider
    $(function() {
        $("#slider").slider({max: 10000});
    });

    $("#slider").slider({
        slide: function(event, ui) {
            $("#sliderVal").text("Tick = " + ui.value + " Milli");
        }
    });

    // Layout
    $('body').layout({
        applyDemoStyles: true
        , minSize: 100	// ALL panes
        , east__size: 200
        , stateManagement__enabled: true
        , east__childOptions: {
            applyDemoStyles: true
            , minSize: 50	// ALL panes
            , south__size: 100
        }, north_childOptions: {
            applyDemoStyles: true
            , minSize: 50	// ALL panes
            , south__size: 100
        }
    });

    $(function() {
        $('.doAction').tooltip();
    });
});

/*
 * End Initialization
 */