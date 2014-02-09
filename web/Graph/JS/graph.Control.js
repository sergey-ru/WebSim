/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var chart;

function log(b, n) {
    return Math.log(n) / Math.log(b);
}

function createNodesSlider(numOfNodes) {
    parent.top.$("#sliderNodes").slider({min: 1});
    parent.top.$("#sliderNodes").slider({max: numOfNodes});
    parent.top.$("#sliderNodesVal").text("Radius expand = " + log(2, 1));
}

$('#viewgui', parent.document).click(function(event) {
    $(document).ready(function() {

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
            jsonFilePath = jsonFilePath.replace("&#10;", "");
        }

        chartOptions = {
            height: 700,
            container: $("#chart")[0],
            navigation: {
                mode: "focusnodes",
                initialNodes: ["1"],
                focusNodeExpansionRadius: 1,
                focusHistoryRelevanceCooldown: 0.4,
                numberOfFocusNodes: 1
            },
            data: {url: jsonFilePath},
            style: {nodeRules: {
                    "radius": function(node) {
                        node.radius = Math.max(0.2, node.relevance);
                    },
                    "image": function(node) {

                        var image = null;
                        var sliceNo = 0;
                        var sliceSize = 239;
                        if (node.data.type == "pc")
                        {
                            image = "./Images/pc.png";
                        }
                        else if (node.data.type == "switch")
                        {
                            image = "./Images/switch.png";
                        }
                        else if (node.data.type == "router")
                        {
                            image = "./Images/router.png";
                        }

                        if (node.data.foreign) {
                            sliceNo = 1;
                        } else {
                            sliceNo = 0;
                        }

                        node.image = image;
                        node.imageSlicing = [0, sliceNo * sliceSize, sliceSize, sliceSize];
                    }
                }},
            events: {onClick: function(event) {
                    if (event.clickNode) {
                        chart.addFocusNode(event.clickNode.id);
                        var newTable = "<table class=\"table table-striped\">";
                        newTable += "<tr><td>ID</td><td>" + event.clickNode.id + "</td></tr>";
                        newTable += "<tr><td>Type</td><td>" + event.clickNode.data.type + "</td></tr>";
                        
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
                                newTable += "<tr><td>" + line[0] + "</td><td>" + line[1] + "</td></tr>";
                            }
                            newTable += "</table>";
                            parent.top.$("#state")[0].innerHTML = newTable;
                        }

                    }
                    event.preventDefault();
                }}
        };
        chart = new NetChart(chartOptions);

        // slider
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
        // end slider handle
    });
});

function sendMessageList(result) {
    $('#runOneStepInScenario', parent.document).attr("disabled", "disabled");
    $('#runFullScenario', parent.document).attr("disabled", "disabled");

    var messagesList = result.split(",,");
    var ifStop = false;
    var oneHasMore;
    var time = 0;
    while (!ifStop) {
        oneHasMore = false;
        for (var i = 0; i < messagesList.length; i++) {
            var allSourceAndTarget = messagesList[i].split(",");
            // go over nodes list
            if (messagesList[i] == "e")
                continue;
            var source = allSourceAndTarget[0];
            var target = allSourceAndTarget[1];
            if (allSourceAndTarget.length > 2) {
                oneHasMore = true;
                // remove first node from list
                messagesList[i] = allSourceAndTarget.splice(1).toString();
            }
            else {
                messagesList[i] = "e";
            }

            (function(source1, target1)
            {
                setTimeout(function()
                {
                    chart.runMovingMessage(source1, target1);
                }, time);
            })(source, target);
        }
        time = time + 1000;
        // if nobody has more nodes, stop.
        if (oneHasMore == false) {
            ifStop = true;
        }
    }

    $('#runOneStepInScenario', parent.document).removeAttr("disabled");
    $('#runFullScenario', parent.document).removeAttr("disabled");
}
