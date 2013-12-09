$(document).ready(function() {
    // hide edit properties
    $('#EditNodeDivShow').hide();
    $('#EditNodeDivHide').show();

    $('#runfull').click(function(event) {
        alert("start full");
        //var username = $('#user').val();
        $('#statis').text("");
        $.get('SimServlet', {request: "startfull"}, function(responseText) {
            $('#statis').append(responseText);
        });
    });
    $('#runscenario').click(function(event) {
        alert("start scenario");
        //var username = $('#user').val();
        $('#statis').text("");
        $.get('SimServlet', {request: "startscenario"}, function(responseText) {
            $('#statis').append(responseText);
        });
    });

    // Save Changes in XML Tree
    $('#SavePropertyChanges').click(function(event) {
        // prevent from the page to refresh after click
        event.preventDefault();
        //alert("save changes");
        var elementToSave;
        var radioCheckVal;
        var actionSelect;
        var info = [];
        var index = 1; // always

        // the element name
        $("#form1 input[type=hidden]").each(function() {
            elementToSave = this.value;
            var matches = elementToSave.match(/\d+/g);
            if (matches != null) {
                index = matches;
                // elementToSave = elementToSave.replace(index,"");
                //alert('number');
                //alert(matches);
            }
        });

        // radio
        $("#form1 input[type=radio]:checked").each(function() {
            radioCheckVal = this.value;
        });

        // If it is a Init save, there is a select to save
        actionSelect = $("#" + elementToSave + " option:selected").text();

        // all text input
        var i = 0;
        $("#form1 input[type=text]").each(function() {
            info[i] = this.id + "::" + this.value;
            i++;
        });

        if (actionSelect != "") {
            info[i] = "Action" + "::" + actionSelect;
            i++;
        }

        //alert("1");

        var parseInfo = "";
        for (var i = 0; i < info.length; i++) {
            parseInfo = parseInfo + info[i] + ",";
        }

        alert("parseInfo:" + parseInfo);
        alert("elementToSave: " + elementToSave);
        alert("index: " + index);
        alert("parseInfo: " + parseInfo);
        $.get('SimServlet', {request: "SaveProperties", elementToSave: elementToSave, index: index, info: parseInfo}, function(responseText) {
            alert(responseText);
        });
    });
});

function upl() {
    $(document).ready(function() {
        alert("start upload");
        var sampleFile = document.getElementById("sampleFile").files[0];
        var formdata = new FormData();
        formdata.append("sampleFile", sampleFile);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "SimServlet", true);
        xhr.send(formdata);
        xhr.onload = function(e) {
            if (this.status == 200) {
                // Show the loading message
                $('#loadingmessage').show();
                $('#red').hide();
                // Load the new xml and parse it to a tree and replace the old tree.
                $.get('SimServlet', {request: "loadXmlTree"}, function(responseText) {
                    $('#red').html(responseText);
                    $.ajax({
                        url: "Included/TreeView/demo.js",
                        dataType: "script"
                    });
                    // Hide the loading message
                    $('#loadingmessage').hide();
                    $('#red').show();

                    // finally
                    $('#statis').text("File were loaded successfully.");
                });
            }
        };
    });
}

function EditPropertyJS(node) {
    //alert("iv been clicked");
    alert(node);
    //alert((node.indexOf("Scenario") != -1));

    $('#EditNodeDivShow').show();
    $('#EditNodeDivHide').hide();

    $(document).ready(function() {
        if (node == "Simulation") {
            var v0;
            var htmlcode = "";
            //alert("simulation choosen");
            // ask about the Simulation property
            $.get('SimServlet', {request: "SimulationProperty", element: node}, function(responseText) {
                var res = responseText.split(",");
                //alert(res);

                for (var i = 0; i < 4; i++) {
                    v0 = res[i].split("::");

                    var input1 = '<div class="row">' +
                            '<div class="col-md-2">' +
                            '<label id="Label' + v0[0] + '" ' +
                            'for="' + v0[0] + '" ' +
                            'class="col-sm-2 control-label">' +
                            v0[0] +
                            '</label>' +
                            '</div>' +
                            '<div class="col-md-10">' +
                            '<input type="text" class="form-control input-sm" ' +
                            'id="' + v0[0] + '" value="' +
                            v0[1] +
                            '">' +
                            '</div>' +
                            '</div><p></p>';

                    htmlcode = htmlcode + input1;
                }

                // add the code
                htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
                $('#AllFormDynamicInputs').html(htmlcode);
            });
        }

        else if (node.indexOf("StaticListener") != -1) {
            $.get('SimServlet', {request: "IfStaticIsSelected", element: node}, function(responseText) {
                //alert("req sent");
                //alert(responseText);
                if (responseText == 'true') {
                    htmlcode = '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                else {
                    htmlcode = '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }
                // add code on/off
                htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
                $('#AllFormDynamicInputs').html(htmlcode);
            });
        }

        else if (node.indexOf("RoutingAlgorithm") != -1) {
            $.get('SimServlet', {request: "IfRoutingAlgSelected", element: node}, function(responseText) {
                //alert("req sent");
                //alert(responseText);
                if (responseText == 'true') {
                    htmlcode = '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                else {
                    htmlcode = '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }
                // add code on/off
                htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
                $('#AllFormDynamicInputs').html(htmlcode);
            });
        }

        else if (node.indexOf("Scenario") != -1) {
            //alert("yay!");
            var index = node.replace("Scenario", "");
            //alert(index);
            $.get('SimServlet', {request: "ScenarioProperty", index: index}, function(responseText) {
                alert("responseText:" + responseText);
                var v0 = responseText.split("::");
                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        v0[0] +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Name" value="' +
                        v0[1] +
                        '">' +
                        '</div>' +
                        '</div><p></p>';

                // add code on/off
                htmlcode = htmlcode + '<input id="scenarioname" type="hidden" value="' + node + '" name="scenarioname">';
                $('#AllFormDynamicInputs').html(htmlcode);
            });
        }

        else if (node.indexOf("Init") != -1) {
            //alert("yay!");
            var index = node.replace("Init", "");
            //alert(index);
            $.get('SimServlet', {request: "InitProperty", index: index}, function(responseText) {
                alert("responseText:" + responseText);

                var res = responseText.split(",");
                //alert(res);
                var v0 = res[0].split("::");

                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        v0[0] +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Name" value="' +
                        v0[1] +
                        '">' +
                        '</div>' +
                        '</div><p></p>' +
                        '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        'Actions' +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<select class="form-control" id="' + node + '">';

                for (var i = 1; i < res.length - 1; i++) {
                    var tmp = res[i].split("::");
                    htmlcode += "<option>" + tmp[1] + "</option>";
                }

                htmlcode += '</select></div></div><p></p>';

                // add code on/off
                htmlcode = htmlcode + '<input id="scenarioname" type="hidden" value="' + node + '" name="scenarioname">';
                $('#AllFormDynamicInputs').html(htmlcode);
            });
        }

        else {
            //$('#Key').text(node);
            htmlcode = '<label id="Key" for="Value" class="col-sm-2 control-label">' + node + '</label>' +
                    '<div class="col-sm-10">' +
                    '<input type="text" class="form-control" id="Value" placeholder="">' +
                    '</div>';
            htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
            $('#AllFormDynamicInputs').html(htmlcode);
        }

        // send request for knowing which properties to display
        $.get('SimServlet', {request: "getElementProperties", element: node}, function(responseText) {
            //alert(responseText);
            //$('#statis').append(responseText);
        });
    });
}