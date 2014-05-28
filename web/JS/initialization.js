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
        $("#slider").slider({min: 1, max: 10000, value: 1820});
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
        , east__size: 700
        , stateManagement__enabled: true
        , maskContents: true
        , east__childOptions: {
            applyDemoStyles: true
            , minSize: 50	// ALL panes
            , south__size: 550
            , maskContents: true
        }, north_childOptions: {
            applyDemoStyles: true
            , minSize: 50	// ALL panes
            , south__size: 400
            , maskContents: true
        }
    });

    // Allows the alt tool to work
    $(function() {
        $('.doAction').tooltip();
    });
});

/*
 * End Initialization
 */