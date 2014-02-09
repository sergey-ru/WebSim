$(document).ready(function() {
    var ifPause = false;
    var ticks = 0;

    $("iframe").each(function()
    {
        $(this).one("load", function()
        {
            $(this)[0].contentWindow;
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
        $.get('SimServlet', {request: "restart"}, function(responseText) {
            // enable run
            $("#runInitRules").removeAttr("disabled");
            $("#runFullTime").removeAttr("disabled");
            $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
                $('#scenarioNumberInfo').text(responseText);
            });
        });
    });

    $('#pause').click(function(event) {
        ifPause = !ifPause;

        if (!ifPause) {
            $('#pause').html("<span class=\"glyphicon glyphicon-pause\"></span> Pause");
            var currTick = $("#output").text();
            currTick = parseInt(currTick);
            poller.setTicks(ticks - currTick);
            poller.init();
        }
    });

    // run one and next step in the current scenario
    $('#runOneStepInScenario').click(function(event) {
        disableAllButtons();

        $.get('SimServlet', {request: "runOneStepInScenario"}, function(responseText) {
            if (responseText.indexOf("false") !== -1) {
                $("#nextScenario").removeAttr("disabled");
            }
        });

        // get messages
        runMessagesAnimation();
    });

    // run full scenario till its end
    $('#runFullScenario').click(function(event) {
        disableAllButtons();

        $.get('SimServlet', {request: "runFullScenario"}, function(responseText) {
            $("#nextScenario").removeAttr("disabled");
        });
    });

    // prepare next scenarop
    $('#nextScenario').click(function(event) {
        disableAllButtons();

        $.get('SimServlet', {request: "getNextScenarioName"}, function(responseText) {
            if (responseText !== "")
                $('#scenarioNumberInfo').text(responseText);
            else
                $('#scenarioNumberInfo').text("No More Scenarios");
        });

        $.get('SimServlet', {request: "ifExistNextScenario"}, function(responseText) {
            if (responseText.indexOf("false") !== -1) {
                $("#scenarioNumberInfo").text("No More Scenarios");
                $("#runInitRules").attr("disabled", "disabled");
            }
            else {
                $("#runInitRules").removeAttr("disabled");
            }
        });
    });

    $('#runFullTime').click(function(event) {

        disableAllButtons();
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
                if (data.indexOf("true") !== -1) {

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
                }
            }
        });

        $("#runFullTime").removeAttr("disabled");
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
            data: {request: "getMessages"},
            type: 'GET',
            success: function(data) {
                //$("#output6").text(data);
                if (data !== "") {
                    var result = data;
                    var $f = $("#iframeID");
                    $f[0].contentWindow.sendMessageList(result);  //works
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
                success: function(response) {

                    if (self.ticks > 0 && !ifPause) {
                        var count = $("#output").text();
                        count = parseInt(count);
                        count++;
                        $("#output").text(count);

                        // animation
                        runMessagesAnimation();

                        self.interval = parseInt($("#slider").slider("value"));
                        self.ticks -= 1;
                        self.init();
                    }
                    else if (ifPause) {
                        $("#pause").html("<span class=\"glyphicon glyphicon-repeat\"></span> Resume");
                    }
                    else if (self.ticks === 0) {
                        $("#runFullTime").removeAttr("disabled");
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

                // give the server some breathing room by
                // increasing the interval
                //this.interval += 1000;

                // recurse
                this.init();
            }
        }
    };
});

