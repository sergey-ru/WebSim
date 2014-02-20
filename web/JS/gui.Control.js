/* 
 * GUI Methods
 */

$(document).ready(function() {
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

        //$('#iframeStat').attr("src", "Statistics/statistics.html");
    });

    $('#viewgui').click(function(event) {
        $('#simTab').removeClass("active");
        $('#editTab').removeClass("active");
        $('#viewTab').attr("Class", "in active");

        $('#home').removeClass("active");
        $('#profile').removeClass("active");
        $('#view').attr("Class", "in active");

        $('#ViewSimulatorDiv').show();
    });
});  