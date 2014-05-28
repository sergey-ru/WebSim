/* 
 * Control Simulation Functions
 */

$(document).ready(function() {
    // Global
    var ifPause = false;
    var ticks = 0;
    var messageTick = 0;

    $("iframe").each(function()
    {
        $(this).one("load", function()
        {
            $(this)[0].contentWindow;
        });
    });

    // display first scenarios name
    $('#viewgui').click(function(event) {
        disableAllButtons();
        $.get('SimServlet', {request: "restart"}, function(responseText) {
            // enable run
            $("#runInitRules").removeAttr("disabled");
            $("#runFullTime").removeAttr("disabled");
            $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
                $('#scenarioNumberInfo').text(responseText);
                $("#output").text(0); // ticks


                $("#runFullTime").click();
                $("#sliderNodes").slider("option", "value", 170);

                $("#runFullTime").bind("runAuto", function() {
                    $("#runFullTime").click();
                });

//                setInterval(function() {        // restart
//                    $("#restart").click();
//                }, 200000);


//                // run loop
//                $("#runFullTime").click();      // now
//                $("#sliderNodes").slider("option", "value", 170);
//
//
//
//                setInterval(function() {        // pause
//                    $("#pause").click();
//                }, 170000);
//                setInterval(function() {        // restart
//                    $("#restart").click();
//                }, 173000);
//                setInterval(function() {        // restart               
//                    $("#sliderNodes").slider("option", "value", 170);
//                }, 176000);
//                setInterval(function() {        // play
//                    $("#runFullTime").click();
//                }, 179000);
//                setInterval(function() {        // resume
//                    $("#pause").click();
//                }, 182000);

            });
        });
    });

    // run the init rules of the current scenario
    $('#runInitRules').click(function(event) {
        disableAllButtons();
        $.get('SimServlet', {request: "runInitRules"}, function(responseText) {
            $("#runOneStepInScenario").removeAttr("disabled");
            $("#runFullScenario").removeAttr("disabled");
        });
    });

    $('#restart').click(function(event) {
        disableAllButtons();

        //var $f = $("#iframeID");
        $("#iframeID")[0].contentWindow.resetTimeForMessages();
        $("#iframeID")[0].contentWindow.initGraph();

        $.get('SimServlet', {request: "restart"}, function(responseText) {
            // enable run
            $("#runInitRules").removeAttr("disabled");
            $("#runFullTime").removeAttr("disabled");
            $("#runFullTime").trigger('runAuto');
            $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
                $('#scenarioNumberInfo').text(responseText);
                $("#output").text(0); // ticks
            });
        });
    });

    $('#pause').click(function(event) {
        ifPause = !ifPause;
        $("#restart").removeAttr("disabled");

        $("#iframeID")[0].contentWindow.resetTimeForMessages();

        if (!ifPause) {
            $('#pause').html("<span class=\"glyphicon glyphicon-pause\"></span> Pause");
            $("#restart").attr("disabled", "disabled");
            var currTick = $("#output").text();
            currTick = parseInt(currTick);
            poller.setTicks(ticks - currTick);
            poller.init();
        }
    });

    // run one and next step in the current scenario
    $('#runOneStepInScenario').click(function(event) {
        disableAllButtons();
        $("#runFullScenario").removeAttr("disabled");

//        // increase tick display first for sync with the chart that he is faster
//        var count = $("#output").text();
//        count = parseInt(count);
//        count++;
//        $("#output").text(count);

        $.get('SimServlet', {request: "runOneStepInScenario"}, function(currTick) {
            if (currTick.indexOf("false") !== -1) {
                $("#nextScenario").removeAttr("disabled");
//                // decrease tick display because it didnt succeed
//                var count = $("#output").text();
//                count = parseInt(count);
//                count--;

            }
            else
            {
                $("#output").text(currTick);
                $("#runOneStepInScenario").removeAttr("disabled");

                // get messages
                runMessagesAnimation();
            }
        });
    });

    // run full scenario till its end
    $('#runFullScenario').click(function(event) {
        disableAllButtons();

        $.get('SimServlet', {request: "runFullScenario"}, function(responseText) {
            $("#nextScenario").removeAttr("disabled");
            $("#output").text(0);
        });
    });

    // prepare next scenaro
    $('#nextScenario').click(function(event) {
        disableAllButtons();

        $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
            if (responseText !== "")
                $('#scenarioNumberInfo').text(responseText);
            else {
                $('#scenarioNumberInfo').text("No More Scenarios");
                $("#restart").click();
                $("#sliderNodes").slider("option", "value", 170);
            }
        });

        $.get('SimServlet', {request: "ifExistNextScenario"}, function(responseText) {
            if (responseText === "false") {
                $("#scenarioNumberInfo").text("No More Scenarios");
                $("#runInitRules").attr("disabled", "disabled");
                $("#restart").click();
                $("#sliderNodes").slider("option", "value", 170);
            }
            else {
                $("#runInitRules").removeAttr("disabled");
            }
        });
    });

    $('#runFullTime').click(function(event) {

        disableAllButtons();
        $("#restart").attr("disabled", "disabled");
        $("#pause").removeAttr("disabled");

        // get number of ticks
        $.ajaxQueue({
            url: 'SimServlet',
            data: {request: "getTicksNumber"},
            type: 'GET',
            success: function(data) {
                ticks = parseInt(data);
            }
        });

        // queue up an ajax request
        $.ajaxQueue({
            url: 'SimServlet',
            data: {request: "ifExistNextScenario"},
            type: 'GET',
            success: function(data) {
                // check if there is a scenario
                if (data === "true") {

                    // update scenario name
                    $.ajaxQueue({
                        url: 'SimServlet',
                        data: {request: "getNextScenarioName"},
                        type: 'GET',
                        success: function(data) {
                            $('#scenarioNumberInfo').text(data);
                        }
                    });

                    // run init rules for current scenario
                    $.ajaxQueue({
                        url: 'SimServlet',
                        data: {request: "runInitRules"},
                        type: 'GET',
                        success: function(data) {
                            $("#output").text(0);
                            // kick this thing off
                            poller.setTicks(ticks);
                            poller.init();
                        }
                    });
                }
                else {
                    $("#runFullTime").attr("disabled", "disabled");
                    $("#pause").attr("disabled", "disabled");
                    $('#scenarioNumberInfo').text("No More Scenarios");
                    $("#restart").removeAttr("disabled");
                    $("#restart").click();
                    $("#sliderNodes").slider("option", "value", 170);
                }
            }
        });
    });

    function disableAllButtons() {
        $("#runInitRules").attr("disabled", "disabled");
        $("#runOneStepInScenario").attr("disabled", "disabled");
        $("#runFullScenario").attr("disabled", "disabled");
        $("#nextScenario").attr("disabled", "disabled");
        $("#pause").attr("disabled", "disabled");
        $("#runFullTime").attr("disabled", "disabled");
    }

    function runMessagesAnimation() {
        $.ajaxQueue({
            url: 'SimServlet',
            data: {request: "getMessages", tick: messageTick},
            type: 'GET',
            success: function(data) {

                var arrData = data.split("!");
                messageTick = arrData[0];

                if (arrData[1] != "") {
                    var $f = $("#iframeID");
                    $f[0].contentWindow.sendMessageList(arrData[1], messageTick);  // works  
                }
            }
        });
    }

    var poller = {
        ticks: 0,
        // number of failed requests
        failed: 0,
        // starting interval
        interval: parseInt($("#slider").slider("value")),
        // kicks off the setTimeout
        setTicks: function(ticks) {
            this.ticks = ticks;
        },
        init: function() {
            setTimeout(
                    $.proxy(this.getData, this), // ensures 'this' is the poller obj inside getData, not the window object
                    this.interval
                    );
        },
        // get AJAX data + respond to it
        getData: function() {
            var self = this;

            $.ajax({
                url: 'SimServlet',
                data: {request: 'runOneStepInScenario'},
                type: 'GET',
                success: function() {

                    if (self.ticks >= 0 && !ifPause) {
                        var count = ticks - self.ticks;
                        $("#output").text(count);

                        // animation
                        runMessagesAnimation();

                        self.interval = parseInt($("#slider").slider("value"));
                        self.ticks--;
                        self.init();
                    }
                    else if (ifPause) {
                        $("#pause").html("<span class=\"glyphicon glyphicon-repeat\"></span> Resume");
                    }
                    else {
                        $("#runFullTime").removeAttr("disabled");
                        $("#runFullTime").trigger('runAuto');
                    }
                },
                // 'this' inside the handler won't be this poller object
                // unless we proxy it.  you could also set the 'context'
                // property of $.ajax.
                error: $.proxy(self.errorHandler, self)
            });
        },
        // handle errors
        errorHandler: function() {
            if (++this.failed < 10) {
                // recurse
                this.init();
            }
        }
    };
});

