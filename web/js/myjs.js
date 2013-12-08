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
        //alert("save changes");
        var elementToSave;
        var radioCheckVal;
        var info = [];
        info[0] = 'hi';
        info[1] = 'hello';

        // the element name
        $("#form1 input[type=hidden]").each(function() {
            elementToSave = this.value;
        });
        $("#form1 input[type=radio]:checked").each(function() {
            radioCheckVal = this.value;
        });

        // all text input
//        var myKeys = new Array();
//        var myValues = new Array();
        var i = 0;
        $("#form1 input[type=text]").each(function() {
            info[i] = 'hi';
            alert("name: " + this.name);
//            myValues[i] = this.value;
            //alert(myValues[i]);
//            myKeys[i] = this.name;
//            alert(myKeys[i]);
            i++;
            alert("val: " + this.value);
        });

        var str = $("#form1").serialize();
        alert("str: " + str);
        alert("elementToSave: " + elementToSave);

        // $.get('SimServlet', {request: "SaveProperty", elementToSave: elementToSave, info: info}, function(responseText) {
        //alert(responseText);
        //$('#statis').append(responseText);
        // });
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
                $('#statis').text("File were loaded successfully.");
                // Load the new xml and parse it to a tree and replace the old tree.
                $.get('SimServlet', {request: "loadXmlTree"}, function(responseText) {
                    //alert(responseText);
                    //$('#statis').append(responseText);
                    $('#red').html(responseText);
                    $.ajax({
                        url: "Included/TreeView/demo.js",
                        dataType: "script"
                    });
                });
            }
        };
    });
}

function EditPropertyJS(node) {
    //alert("iv been clicked");
    alert(node);

    $('#EditNodeDivShow').show();
    $('#EditNodeDivHide').hide();

    $(document).ready(function() {
        if (node == "Simulation") {
            var v0, v1, v2, v3;
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
                            'for="Value' + v0[0] + '" ' +
                            'class="col-sm-2 control-label">' +
                            v0[0] +
                            '</label>' +
                            '</div>' +
                            '<div class="col-md-10">' +
                            '<input type="text" class="form-control input-sm" ' +
                            'id="Value' + v0[0] + '" value="' +
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

        else {
            $('#Key').text(node);
        }

        // send request for knowing which properties to display
        $.get('SimServlet', {request: "getElementProperties", element: node}, function(responseText) {
            //alert(responseText);
            //$('#statis').append(responseText);
        });
    });
}