$(function() {
    $("#slider").slider({max: 2000});
});

$(document).ready(function() {
    /*
     * Initialization
     */

    // hide edit properties
    $('#EditNodeDivShow').hide();
    $('#EditNodeDivHide').show();
    $('#ViewSimulatorDiv').hide();
    $('#expandTree').trigger("click");
    $("#viewgui").attr("disabled", "disabled");
    $('#viewTab').attr("disabled", "disabled");

    // create new tree 
     newTree();

    // simulation init
    //$.get('SimServlet', {request: "runBaseInit"}, function(responseText) {
    //});

    // init session id
    $.get('SimServlet', {request: "initSession"}, function(responseText) {
        $("#sessionId").text(responseText);
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
    $("#slider").slider({
        slide: function(event, ui) {
            $("#sliderVal").text("Tick = " + ui.value + " Seconds");
        }
    });

    /*
     * End Initialization
     */

    // ----- click event handle -------

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

        $('#iframeStat').attr("src", "Statistics/statistics.html");
    });

    $('#viewgui').click(function(event) {
        $('#simTab').removeClass("active");
        $('#editTab').removeClass("active");
        $('#viewTab').attr("Class", "in active");

        $('#home').removeClass("active");
        $('#profile').removeClass("active");
        $('#view').attr("Class", "in active");

        $('#ViewSimulatorDiv').show();

        $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
            $('#scenarioNumberInfo').text(responseText);
        });
    });
});  