$(function() {
    $("#slider").slider({max: 2000});
});

$(document).ready(function() {
    // hide edit properties
    $('#EditNodeDivShow').hide();
    $('#EditNodeDivHide').show();
    $('#ViewSimulatorDiv').hide();
    $('#expandTree').trigger("click");


    // SIMULATOR INIT
    $.get('SimServlet', {request: "runBaseInit"}, function(responseText) {
    });
    
    // init session id
    $.get('SimServlet', {request: "initSession"}, function(responseText) {
        // nothing.
        $("#sessionId").text(responseText);
    });

    $("iframe").each(function()
    {
        $(this).one("load", function()
        {
            $(this)[0].contentWindow;
        });
    });

    // slider
    $("#slider").slider({
        slide: function(event, ui) {
            //alert(ui.value);
            $("#sliderVal").text("Tick = " + ui.value + " Seconds");
        }
    });

    // ----- CLICK EVENT HANDLE -------
    // hide manu tab
    $('#simTab').click(function(event) {
        $('#EditNodeDivShow').hide();
        $('#ViewSimulatorDiv').hide();
        $('#StatisticsDiv').hide();
    });

    $('#viewTab').click(function(event) {
        $('#EditNodeDivShow').hide();
        $('#ViewSimulatorDiv').show();
        $('#StatisticsDiv').hide();
    });

    $('#editTab').click(function(event) {
        $('#ViewSimulatorDiv').hide();
        $('#StatisticsDiv').hide();
    });

    $('#statTab').click(function(event) {
        $('#ViewSimulatorDiv').hide();
        $('#EditNodeDivShow').hide();
        $('#StatisticsDiv').show();

        $('#iframeStat').attr("src", "index.zul");
    });

    $('#viewgui').click(function(event) {
        $('#simTab').removeClass("active");
        $('#editTab').removeClass("active");
        $('#viewTab').attr("Class", "in active");

        $('#home').removeClass("active");
        $('#profile').removeClass("active");
        $('#view').attr("Class", "in active");

        $('#ViewSimulatorDiv').show();

        /////////// INIT /////////////
        // run the base init of the simulator (reading net and init simenvironment)
        //$.get('SimServlet', {request: "runBaseInit"}, function(responseText) {
        // nothing.
        $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
            //alert(responseText);
            $('#scenarioNumberInfo').text(responseText);
        });
        // });
    });


    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

});  