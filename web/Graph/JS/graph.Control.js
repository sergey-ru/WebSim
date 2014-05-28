/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var chart;
var time = 0;
var sliderTickValue;

$('#viewgui', parent.document).click(function(event) {
    $(document).ready(function() {
        initGraph();
    });
});

function initGraph() {

    sliderTickValue = parent.top.$("#slider").slider("option", "value");

    $.getScript("../lib/zoomchart.js", function(data, textStatus, jqxhr) {
    });

    // get number of nodes
    var request = new XMLHttpRequest();
    var numOfNodes = 0;
    request.open('GET', '/Simulator/SimServlet?request=getNodesCount', false);
    request.send(null);
    if (request.status === 200) {
        numOfNodes = parseInt(request.responseText);
        createNodesSlider(numOfNodes);
    }

    // get path of JSON file
    request = new XMLHttpRequest();
    var jsonFilePath = "";
    request.open('GET', '/Simulator/SimServlet?request=getJSONgraphData', false);
    request.send(null);
    if (request.status === 200) {
        jsonFilePath = request.responseText;
    }


    function getSize() {
        var myWidth = 0, myHeight = 0;
        if (typeof (window.innerWidth) === 'number') {
            //Non-IE
            myWidth = window.innerWidth;
            myHeight = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
            myHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            myWidth = document.body.clientWidth;
            myHeight = document.body.clientHeight;
        }
        return myHeight;
    }


    chartOptions = {
        height: getSize(),
        container: $("#chart")[0],
        navigation: {
            mode: "focusnodes",
            initialNodes: ["1"],
            focusNodeExpansionRadius: 1,
            focusHistoryRelevanceCooldown: 0.4,
            numberOfFocusNodes: 1,
            keren_speed_of_messages: 1820
        },
        data: {url: jsonFilePath},
        style: {nodeRules: {"rule1": nodeStyle}},
        /*
         * make a table with the selected node info
         */
        events: {onClick: function(event) {
                if (event.clickNode) {
                    chart.addFocusNode(event.clickNode.id);

                    var newTable = "<table id=\"nodeInfoTable\" class=\"table table-responsive\">";
                    newTable += "<thead><tr><th style=\"width:10%\">#</th><th style=\"width:30%\">Attribute</th><th style=\"width:60%\">Value</th></tr></thead><tbody>";
                    newTable += "<tr><td style=\"width:10%\"></td><td style=\"width:30%\">Id</td><td style=\"width:60%\"><div id=\"nodeInfoId\">" + event.clickNode.id + "<div></td></tr>";
                    newTable += "<tr><td style=\"width:10%\"></td><td style=\"width:30%\">Type</td><td style=\"width:60%\">" + makeFirstLetterUpper(event.clickNode.data.type) + "</td></tr>";

                    // get node info from servlet
                    var request = new XMLHttpRequest();
                    request.open('GET', '/Simulator/SimServlet?request=getNodeInfo&node=' + event.clickNode.id, false); // `false` makes the request synchronous
                    request.send(null);
                    if (request.status === 200) {

                        var res = request.responseText.split(",");
                        var line;
                        for (var i = 0; i < res.length; i++) {

                            res[i] = res[i].replace("{", "");
                            res[i] = res[i].replace("}", "");
                            line = res[i].split("=");

                            newTable += "<tr><td style=\"width:10%\"><input type=\"checkbox\" id=\"" + makeFirstLetterUpper(line[0]) + "\" value\"" + makeFirstLetterUpper(line[1]) + "\"></td><td style=\"width:30%\">" + makeFirstLetterUpper(line[0]) + "</td><td style=\"width:60%\">" + makeFirstLetterUpper(line[1]) + "</td></tr>";
                        }
                        newTable += "</tbody></table>";

                        parent.top.$("#nodeInfoDiv").html(newTable);
                    }

                }
                event.preventDefault();
            }
        }
    };

    function nodeStyle(node) {
        node.image = "./Images/" + node.data.type + ".png";
        node.radius = 5;
        //alert(node.data.type);
        var type = node.data.type.split("_");
        //alert(type[1]);
        if (type[1] === "world")
            node.fillColor = "rgba(10,25,170,0.5)";
        else
            node.fillColor = "rgba(110,255,70,0.5)";
    }

    chart = new NetChart(chartOptions);

    // slider of nodes radius (expand the graph)
    parent.top.$("#sliderNodes").slider({
        slide: function(event, ui) {
            $("#sliderNodesVal", parent.document).text("Radius expand = " + log(2, ui.value));
        }
    });
    parent.top.$("#sliderNodes").slider({
        change: function(event, ui) {
            chartOptions.navigation.focusNodeExpansionRadius = log(2, ui.value);
            chart = new NetChart(chartOptions);
        }
    });

    // tick control slider. control the speed of the messages in graph relative to the speed of the tick. 
    parent.top.$("#slider").slider({
        change: function(event, ui) {
            sliderTickValue = ui.value;
            chartOptions.navigation.keren_speed_of_messages = ui.value;
            chart = new NetChart(chartOptions);
        }
    });
}

function makeFirstLetterUpper(word) {
    word = $.trim(word);
    return word.substring(0, 1).toUpperCase() + word.substring(1);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function log(b, n) {
    return n;//((Math.log(n) / Math.log(b)).toFixed(2)) + 20;
}

function createNodesSlider(numOfNodes) {
    parent.top.$("#sliderNodes").slider({min: 1});
    parent.top.$("#sliderNodes").slider("option", "max", numOfNodes);
    parent.top.$("#sliderNodes").slider("option", "value", log(2, 1));
    parent.top.$("#sliderNodesVal").text("Radius expand = " + log(2, 1));
}

function resetTimeForMessages() {
    time = 0;
}

function sendMessageList(result, tick) {
    var messagesList = result.split(",,");
    var ifFullRouthOnTick = false;

    for (var i = 0; i < messagesList.length; i++) {
        if (messagesList[i].split(",").length > 4) {
            ifFullRouthOnTick = true;
            break;
        }
    }

    if (ifFullRouthOnTick)
        SendMessagesToChartFullRouthOnTick(messagesList);
    else
        SendMessagesToChartOneStepOnTick(messagesList);
}

function SendMessagesToChartOneStepOnTick(messagesList) {
    var source;
    var target;
    var numOfLoop;
    var messageType;
    var allSourceAndTarget;

    if (messagesList.indexOf(",,") === -1)
        numOfLoop = messagesList.length;
    else
        numOfLoop = messagesList.length - 1;

    // last one is the message type
    for (var i = 0; i < numOfLoop; i++) {

        allSourceAndTarget = messagesList[i].split(",");
        source = allSourceAndTarget[0];
        target = allSourceAndTarget[1];
        messageType = allSourceAndTarget[3]; // second place is rout size

        if (isNumber(source) && isNumber(target)) {

            (function(source1, target1, messageType1, tick1) {
                setTimeout(function() {
                    //alert(source1 + "," + target1 + " " + messageType1 + " " + tick1);
                    chart.runMovingMessage(source1, target1, messageType1, tick1);
                },
                        time
                        );
            })(source, target, messageType, 1);
        }
    }

    //time += 0;//sliderTickValue / 1000;
}

function SendMessagesToChartFullRouthOnTick(messagesList) {
    var allSourceAndTarget;
    var ifStop = false;
    var oneHasMore;
    var stepInRout = 0;

    //alert(messagesList);

    while (!ifStop) {
        oneHasMore = false;

        for (var i = 0; i < messagesList.length; i++) {
            //alert("checking " + messagesList[i]);

            allSourceAndTarget = messagesList[i].split(",");

            // go over nodes list
            if (messagesList[i] === "e")
                continue;

            var source = allSourceAndTarget[0]; // source
            var target = allSourceAndTarget[1]; // next step
            var messageType = allSourceAndTarget[allSourceAndTarget.length - 1];
            var speed = allSourceAndTarget[allSourceAndTarget.length - 2]; // rout length

            //alert("s:" + source + " t:" + target + " " + messageType + "   speed:" + speed + "   time waiting:" + time);

            if (allSourceAndTarget.length > 3 && isNumber(source) && isNumber(target)) {
                oneHasMore = true;
                // remove first node from list
                messagesList[i] = allSourceAndTarget.splice(1).toString();
            }
            else {
                messagesList[i] = "e";
            }

            if (isNumber(source) && isNumber(target)) {

                (function(source1, target1, messageType1, tick1)
                {
                    setTimeout(function()
                    {
                        //alert("2:    " + source1 + "," + target1 + " " + messageType1 + " " + tick1);
                        chart.runMovingMessage(source1, target1, messageType1, tick1);
                    },
                            // accumulative time + (tick value / edgeCount) * (step in route)
                            time + ((sliderTickValue / speed) * stepInRout)
                            );
                })(source, target, messageType, speed);

                stepInRout++;
            }
        }

        // if nobody has more nodes, stop.
        if (oneHasMore === false) {
            ifStop = true;
        }
    }
}