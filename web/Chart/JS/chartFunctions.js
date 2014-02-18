/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
    var plot;
    var ifUpdated = false;
    var intervalUpdate;
    var scenario = 0;
    var ticks = 0;


    parent.top.$('#restart').click(function(event) {
        scenario = 0;
        alert("resrt scenario num in chart");
    });

    parent.top.$('#runOneStepInScenario, #runFullScenario, #runFullTime').click(function(event) {
        alert("in");
        // data source fetched from the server

        // if exist next scenario
        var request = new XMLHttpRequest();
        request.open('GET', '/Simulator/SimServlet?request=ifExistNextScenario', false);
        request.send(null);
        if (request.status === 200) {
            alert(request.responseText);
            if (request.responseText === "false&#10;") {
                clearTimeout(intervalUpdate);
                return;
            }
        }

        // init
        $("#placeholder").text();
        var data = new Array([]);
        var countRow = 1;
        var placeholder = $("#placeholder");
        var updateInterval = 8;
        var needInit = true;
        var headlines = [];

        scenario++;
        if (plot) {
            plot.setData([]);
            plot.setupGrid();
            plot.draw();
        }

        // get total ticks
        var request = new XMLHttpRequest();
        request.open('GET', '/Simulator/SimServlet?request=getTicksNumber', false);
        request.send(null);
        if (request.status === 200) {
            ticks = parseInt(request.responseText);
        }


        function getData() {
            var request = new XMLHttpRequest();
            request.open('GET', '/Simulator/SimServlet?request=getChartStatistics&index=' + countRow + '&scenario=' + scenario, false);
            request.send(null);
            if (request.status === 200) {

                //alert(request.responseText);

                var tags = $.parseJSON(request.responseText);
                var countColumn = 0;
                for (var headline in tags) {
                    // save headers
                    if (needInit) {
                        headlines.push(headline);
                    }

                    // init
                    if (!data[countColumn]) {
                        data[countColumn] = [];
                    }

                    for (var i = 0; i < tags[headline].length; i++) { // need it. usually 0 or 1.
                        // inserting new data
                        data[countColumn].push([countRow, tags[headline][i]]);
                        // for rows count. update it only when there was a real update with data
                        ifUpdated = true;
                    }

                    countColumn++;
                }


                if (ifUpdated) {
                    countRow++;
                    ifUpdated = false;
                    needInit = false;
                }
            }
        }

        plot = $.plot(placeholder, [], {
            series: {
                lines: {
                    show: true
                },
                shadowSize: 0
            },
            xaxis: {
                min: 0,
                max: 2000
                        //zoomRange: [1, 200],
                        //panRange: [-10, 2000]
            },
            yaxis: {
                min: 0,
                max: 2000
                        //zoomRange: [1, 200],
                        //panRange: [-10, 2000]
            },
            zoom: {
                interactive: true
            },
            pan: {
                interactive: true
            }
        });
        // show pan/zoom messages to illustrate events 
        placeholder.bind("plotpan", function(event, plot) {
            var axes = plot.getAxes();
            $(".message").html("Panning to x: " + axes.xaxis.min.toFixed(2)
                    + " &ndash; " + axes.xaxis.max.toFixed(2)
                    + " and y: " + axes.yaxis.min.toFixed(2)
                    + " &ndash; " + axes.yaxis.max.toFixed(2));
        });
        placeholder.bind("plotzoom", function(event, plot) {
            var axes = plot.getAxes();
            $(".message").html("Zooming to x: " + axes.xaxis.min.toFixed(2)
                    + " &ndash; " + axes.xaxis.max.toFixed(2)
                    + " and y: " + axes.yaxis.min.toFixed(2)
                    + " &ndash; " + axes.yaxis.max.toFixed(2));
        });
        // add zoom out button 
        $("<div class='button' style='right:20px;top:20px'></div>")
                .appendTo(placeholder)
                .click(function(event) {
                    event.preventDefault();
                    plot.zoomOut();
                });
//        function addArrow(dir, right, top, offset) {
//            $("<img class='button' src='arrow-" + dir + ".gif' style='right:" + right + "px;top:" + top + "px'>")
//                    .appendTo(placeholder)
//                    .click(function(e) {
//                        e.preventDefault();
//                        plot.pan(offset);
//                    });
//        }
//
//        addArrow("left", 55, 60, {left: -100});
//        addArrow("right", 25, 60, {left: 100});
//        addArrow("up", 40, 45, {top: -100});
//        addArrow("down", 40, 75, {top: 100});

        function createJSONwithAllDatas() {
            var outer = [];
            for (var i = 0; i < headlines.length; i++) {
                if (data[i])
                    outer.push({data: data[i], label: headlines[i]});
            }

            return outer;
        }

        function update() {
            // draw new data
            getData();
            if (plot) {
                plot.setData(createJSONwithAllDatas());
                //plot.setData([{data: data[0], label: headlines[0]}, {data: data[1], label: headlines[1]}, {data: data[2], label: headlines[2]}, {data: data[3], label: headlines[3]}]);            
                plot.setupGrid();
                plot.draw();
            }

            intervalUpdate = setTimeout(update, updateInterval);
            if (countRow > ticks) {
                alert("stoping update()");
                clearTimeout(intervalUpdate);
            }
        }

        update();
    });



//    $('form#chartForm').submit(function() {
//        var funcToParse = $('#functionToParse').text();
//
//        alert(funcToParse);
//    });
});