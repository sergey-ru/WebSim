$(document).ready(function() {
    // hide edit properties
    $('#EditNodeDivShow').hide();
    $('#EditNodeDivHide').show();
    $('#expandTree').trigger("click");



    // ----- CLICK EVENT HANDLE -------
    // hide manu tab
    $('#simTab').click(function(event) {
        $('#EditNodeDivShow').hide();
    });

    // run full scenario
    $('#runfull').click(function(event) {
        //$.growlUI('Simulation', 'Simulation Started'); 
        $('#statis').text("");
        $.get('SimServlet', {request: "startfull"}, function(responseText) {
            $('#statis').append(responseText);
        });
        // $.growlUI('Simulation', 'Simulation Finished'); 
    });

    // run full scenario
    $('#runscenario').click(function(event) {
        //alert("start scenario");
        //$.growlUI('Simulation', 'Simulation Started'); 
        $('#statis').text("");
        $.get('SimServlet', {request: "startscenario"}, function(responseText) {
            $('#statis').append(responseText);
        });
        // $.growlUI('Simulation', 'Simulation Finished'); 
    });

    // new tree
    $('#newTree').click(function(event) {
        //alert("newTree");
        newTree();
    });

    // save tree
    $('#saveTree').click(function(event) {
        saveTree();
    });

    // when adding a new scenario rule, handle select change
//    $('#ModalListOfRules').change(function() {
//        var htmlcode = "";
//        var selectedRule = $('#ModalListOfRules option:selected').text();
//        if (selectedRule == "Init") {
//            htmlcode += "";
//        }
//        $('#DivOfSelectedRulesToAdd').html(htmlcode);
//    });

    // Save Changes in XML Tree
    $('#SavePropertyChanges').click(function(event) {
        // prevent from the page to refresh after click
        event.preventDefault();
        //alert("save changes");
        var elementToSave;
        var radioCheckVal = "";
        var actionSelect = "";
        var info = [];
        var elementIndex = 1; // always
        var i = 0;

        // If it is a Init save, there is a select to save
        actionSelect = $("#ActionSelect option:selected").attr("id");

        // action
        if (actionSelect != "" && actionSelect) {
            info[i] = "Action" + "::" + actionSelect;
            i++;
        }

        // the element name
        $("#form1 input[type=hidden]").each(function() {
            elementToSave = this.value;
            //alert("elementToSave: " + elementToSave);
            var patt1 = /\d+/g;
            //alert("1");
            var matches = elementToSave.match(patt1);
            //alert("2");
            //alert(matches != null);
            if (matches != null) {
                elementIndex = matches[0];
                elementToSave = elementToSave.replace(elementIndex, "");
            }
        });

        // radio
        $("#form1 input[type=radio]:checked").each(function() {
            //alert(this.value);
            radioCheckVal = this.value;
        });

        // radio
        if (radioCheckVal != "") {
            info[i] = "Radio" + "::" + radioCheckVal;
            i++;
        }

        // all text input
        $("#form1 input[type=text]").each(function() {
            //alert("id: " + this.id);
            //alert("value: " + this.value);
            info[i] = this.id + "::" + this.value;
            i++;
        });


        var parseInfo = "";
        for (var i = 0; i < info.length; i++) {
            parseInfo = parseInfo + info[i] + ",,";
            //alert("1 " + info[i]);
            //alert("2 " + parseInfo);
        }

        //alert("parseInfo:" + parseInfo);
        //alert("elementToSave: " + elementToSave);
        //alert("index:" + elementIndex + ".");

        $.get('SimServlet', {request: "SaveProperties", elementToSave: elementToSave, elementIndex: elementIndex, info: parseInfo}, function(responseText) {
            //alert("REMOVE OR ADD result?: " + responseText);
            if (responseText.indexOf("remove") != -1) {
                //alert("remove vi");
                responseText = responseText.replace("remove ", "");
                var tmp = responseText.split(".");
                $('span[id^="' + responseText + '"] a').text(tmp[tmp.length - 1]);
            }
            else if (responseText.indexOf("add") != -1) {
                //alert("add vi");
                responseText = responseText.replace("add ", "");
                var tmp = $('span[id^="' + responseText + '"] a').text();
                $('span[id^="' + responseText + '"] a').html(tmp + "&#10004;");
            }

            //alert("Changes have been successfully saved");
            $.growlUI('Changes', 'have been successfully saved');
            ifTreeIsValid();
        });
    });

    // Handle "Save" button on modal, for each form that exists.
    $('#ModalSave').click(function(event) {
        //alert("modal save");
        var newruleSelect = $("#ModalListOfRules option:selected").text();
        var ScenarioIndexString = $("#ModalListOfRules option:selected").attr("id");
        var ScenarioIndex = 1;
        //alert(ScenarioIndexString);

        var doModalaction = $('input[name="ModalAction"]').val();
        //alert("action! " + doModalaction + ".");

        if (doModalaction === "add_to_experiment") {
            //alert("yes im in");
            $.get('SimServlet', {request: "AddNewScenario"}, function(responseText) {
                LoadXmlMenuTree("false");
            });

        }
        else if (doModalaction === "show_List_Of_Actions") {
            //alert("newruleSelect: " + newruleSelect);
            //alert("ScenarioIndex: " + ScenarioIndex);

            // get scenario index
            var patt1 = /\d+/g;
            var matches = ScenarioIndexString.match(patt1);
            //alert(matches.length);
            if (matches != null) {
                //alert(matches[0]);
                ScenarioIndex = matches[0];
            }

            ScenarioIndex = ScenarioIndex.replace("Scenario", "");
            $.get('SimServlet', {request: "AddScenarioNewRule", rule: newruleSelect, index: ScenarioIndex}, function(responseText) {
                LoadXmlMenuTree("false");
            });
        }
    });
});

function ifTreeIsValid() {
    $.get('SimServlet', {request: "IfTreeIsValid"}, function(responseText) {
        //alert("responseText " + responseText);
        //alert(responseText);
        if (responseText == "true") {
            $("#ifTreeValidDiv").attr("class", "alert alert-success");
            $("#ifTreeValidDiv").text("The Tree Is Valid");
        }
        else {
            $("#ifTreeValidDiv").attr("class", "alert alert-danger");
            $("#ifTreeValidDiv").text("Tree Is Not Valid!");
        }
        $('#expandTree').trigger("click");
    });
}

// upload new xml file
function upl() {
    $(document).ready(function() {
        //alert("start upload");
        var sampleFile = document.getElementById("sampleFile").files[0];
        var formdata = new FormData();
        formdata.append("sampleFile", sampleFile);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "SimServlet", true);
        xhr.send(formdata);
        xhr.onload = function(e) {
            if (this.status == 200) {
                LoadXmlMenuTree("true");
            }
        };
    });
}

function deleteAndAddRule() {
    //alert("modal click");
    var res = event.target.id.split("_");
    var action = res[2];
    var objectId = res[1];
    var element = res[0];
    //alert("action " + action);
    //alert("element " + element);

    if (action === "delete")
    {
        //$.get('SimServlet', {request: "DeleteScenarioChild"}, function(responseText) {
        //$('#statis').append(responseText);
        //});
        $(".modal-body").html("Do You Want To Delete " + res[0] + "?" + "<input type=\"hidden\" name=\"ModalAction\" value=\"delete_" + objectId + "\">");
        $("#ModalClose").text("No");
        $("#ModalSave").text("Yes");
    }
    else if (action === "add")
    {
        if (element === "Experiment")
        {
            $(".modal-body").html("Do You Want To Add New Scenario?" + "<input type=\"hidden\" name=\"ModalAction\" value=\"add_to_" + objectId + "\">");
            $("#ModalClose").text("No");
            $("#ModalSave").text("Yes");
        }
        else
        {
            var htmlcode = "";
            htmlcode += "<select id=\"ModalListOfRules\" class=\"form-control\">";
            htmlcode += "<option id=\"" + res[1] + "\">Initialization Rule</option>";
            htmlcode += "<option id=\"" + res[1] + "\">Device Rule</option>";
            htmlcode += "<option id=\"" + res[1] + "\">External Variable Rule</option>";
            htmlcode += "<option id=\"" + res[1] + "\">Link Rule</option>";
            htmlcode += "</select>" + "<input type=\"hidden\" name=\"ModalAction\" value=\"show_List_Of_Actions\">";
            $(".modal-body").html(htmlcode);
        }
    }
    $("#myModal").modal("show");
}

function LoadXmlMenuTree(ifByPath) {
    // Show the loading message
    $('#loadingmessage').show();
    $('#red').hide();
    // Load the new xml and parse it to a tree and replace the old tree.
    $.get('SimServlet', {request: "loadXmlTree", ifByPath: ifByPath}, function(responseText) {
        //alert(responseText);
        $('#red').html(responseText);

        $.ajax({
            url: "Included/TreeView/demo.js",
            dataType: "script"
        });


        // Hide the loading message
        $('#loadingmessage').hide();
        $('#red').show();
        //alert("expand");
        $('#expandTree').trigger("click");
        // $('#collapTree').trigger("click");

        ifTreeIsValid();
    });
}

function createPvaluesByActionPath(fullClassPath, index) {
    var htmlcode = "";
    $.get('SimServlet', {request: "GetPByActionValue", fullClassPath: fullClassPath, index: index}, function(responseText) {

        var pListRes = responseText.split(",,");

        for (var i = 0; i < pListRes.length - 1; i++) {
            var pList = pListRes[i].split("::");
            htmlcode = '<div class="row">' +
                    '<div class="col-md-2">' +
                    '<label id="Labelp" ' +
                    'for="' + pList[0] + '" ' +
                    'class="col-sm-2 control-label">' +
                    pList[0] +
                    '</label>' +
                    '</div>' +
                    '<div class="col-md-10">' +
                    '<input type="text" class="form-control input-sm" ' +
                    'id="' + pList[0] + '" value="' +
                    pList[1] +
                    '">' +
                    '</div>' +
                    '</div><p></p>';
        }

        // add p and if no p, clean content
        $('#pValues').html(htmlcode);
    });
}

function newTree() {
    //alert("new");
    $('#loadingmessage').show();
    $('#red').hide();

    $.get('SimServlet', {request: "NewTree"}, function(responseText) {
        LoadXmlMenuTree("false");
    });
}

function saveTree() {
    //alert("start");
    $.get('SimServlet', {request: "SaveTree"}, function(responseText) {
        //alert(responseText);
        $.growlUI('Xml File', responseText);
    });
}

function EditPropertyJS(node) {
    //alert(node);

    $('#simTab').removeClass("active");
    $('#editTab').attr("Class", "in active");

    $('#home').removeClass("active");
    $('#profile').attr("Class", "in active");


    $(document).ready(function() {

        $('#EditNodeDivHide').hide(); // always hide
        $('#EditNodeDivShow').hide();
        $('#EditNodeDivLoading').show();

        if (node === "simulation") {
            var v0;
            var htmlcode = "";
            // alert("simulation choosen");
            // ask about the Simulation property
            $.get('SimServlet', {request: "SimulationProperty", element: node}, function(responseText) {
                var res = responseText.split(",,");
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

                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if (node.indexOf("statisticlistener") != -1) {

            $.get('SimServlet', {request: "StatisticProperties", element: node}, function(responseText) {
                //alert("req sent");
                //alert(responseText);
                var res = responseText.split(",,");
                var choosen = res[0].split("::");

                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="LabelActive" ' +
                        'for="Active" ' +
                        'class="col-sm-2 control-label">' +
                        'Active' +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">';

                if (choosen[1] == 'true') {
                    htmlcode += '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="Active" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="Active" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                else {
                    htmlcode += '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                htmlcode += '</div></div><p></p>';

                // add p properties
                for (var i = 1; i < res.length - 1; i++) {
                    var pList = res[i].split("::");
                    htmlcode += '<div class="row">' +
                            '<div class="col-md-2">' +
                            '<label id="Labelp" ' +
                            'for="' + pList[0] + '" ' +
                            'class="col-sm-2 control-label">' +
                            pList[0] +
                            '</label>' +
                            '</div>' +
                            '<div class="col-md-10">' +
                            '<input type="text" class="form-control input-sm" ' +
                            'id="' + pList[0] + '" value="' +
                            pList[1] +
                            '">' +
                            '</div>' +
                            '</div><p></p>';
                }


                htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
                $('#AllFormDynamicInputs').html(htmlcode);

                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if (node.indexOf("routingalgorithm") != -1) {
            $.get('SimServlet', {request: "RoutingAlgProperties", element: node}, function(responseText) {
                //alert("req sent");
                //alert(responseText);
                var res = responseText.split(",,");
                var choosen = res[0].split("::");

                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="LabelActive" ' +
                        'for="Active" ' +
                        'class="col-sm-2 control-label">' +
                        'Active' +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">';

                if (choosen[1] == 'true') {
                    htmlcode += '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="Active" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="Active" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                else {
                    htmlcode += '<div class="btn-group" data-toggle="buttons">' +
                            '<label class="btn btn-default">' +
                            '<input type="radio" name="year" value="on">On' +
                            '</label>' +
                            '<label class="btn btn-default active">' +
                            '<input type="radio" name="year" value="off">Off' +
                            '</label>' +
                            '</div>';
                }

                htmlcode += '</div></div><p></p>';

                // add p properties
                for (var i = 1; i < res.length - 1; i++) {
                    var pList = res[i].split("::");
                    htmlcode += '<div class="row">' +
                            '<div class="col-md-2">' +
                            '<label id="Labelp" ' +
                            'for="' + pList[0] + '" ' +
                            'class="col-sm-2 control-label">' +
                            pList[0] +
                            '</label>' +
                            '</div>' +
                            '<div class="col-md-10">' +
                            '<input type="text" class="form-control input-sm" ' +
                            'id="' + pList[0] + '" value="' +
                            pList[1] +
                            '">' +
                            '</div>' +
                            '</div><p></p>';
                }


                htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
                $('#AllFormDynamicInputs').html(htmlcode);

                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if (node.indexOf("scenario") != -1) {
            //alert("yay!");
            var index = node.replace("scenario", "");
            //alert(index);
            $.get('SimServlet', {request: "ScenarioProperty", index: index}, function(responseText) {
                //alert("responseText:" + responseText);
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

                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if (node.indexOf("init") != -1) {
            //alert("yay!");
            var index = node.replace("init", "");
            //alert(index);
            $.get('SimServlet', {request: "InitProperty", index: index}, function(responseText) {
                //alert(responseText);
                var res = responseText.split(",,");
                var InitNamKeyVal = res[0].split("::");
                var selectedFullPathClass = res[res.length - 1].split("::");
                selectedFullPathClass = selectedFullPathClass[1];

                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        InitNamKeyVal[0] +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Name" value="' +
                        InitNamKeyVal[1] +
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
                        '<select class="form-control" id="ActionSelect">';

                for (var i = 1; i < res.length - 1; i++) {
                    var listofclass = res[i].split("::");
                    var listAfterDots = listofclass[1].split(".");
                    //alert("selectedFullPathClass: " + selectedFullPathClass);

                    if (listofclass[0] == "ActionList") {
                        if (selectedFullPathClass != listofclass[1]) {
                            htmlcode += "<option id='" + listofclass[1] + "'>" + listAfterDots[listAfterDots.length - 1] + "</option>";
                        }
                        else {
                            htmlcode += "<option id='" + listofclass[1] + "' selected>" + listAfterDots[listAfterDots.length - 1] + "</option>";
                        }
                    }
                }
                htmlcode += '</select></div></div>';
                htmlcode += '<p></p>';

                // div for all the p's
                htmlcode += '<div id="pValues"></div><p></p>';
                // hidden input for the saving
                htmlcode += '<input id="initname" type="hidden" value="' + node + '" name="initname">';

                // add all
                $('#AllFormDynamicInputs').html(htmlcode);

                // p in the xml (0..1)
                createPvaluesByActionPath(selectedFullPathClass, index);
                // add method if select chenge, replace the p values
                $('#ActionSelect').change(function() {
                    var selectedFullPathClass = $('#ActionSelect option:selected').attr('id');
                    createPvaluesByActionPath(selectedFullPathClass, index);
                });


                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if ((node.indexOf("device") != -1) || (node.indexOf("external") != -1) || (node.indexOf("link") != -1)) {
            //alert("yaya");
            var tmpNode = node;
            var type1;
            var index;

            tmpNode = tmpNode.replace("device", "");
            tmpNode = tmpNode.replace("external", "");
            tmpNode = tmpNode.replace("link", "");

            index = tmpNode;

            // find type
            type1 = node.replace(index, "");

            $.get('SimServlet', {request: "DeviceExLinkProperty", index: index, type: type1}, function(responseText) {
                //alert("!!!: " + responseText);
                var res = responseText.split(",,");
                var DevNamKeyVal = res[0].split("::");
                //alert("SelectedAction: " + res[res.length - 1]);
                var selectedFullPathClass = res[res.length - 1].split("::");
                selectedFullPathClass = selectedFullPathClass[1];
                var orderVal;
                var selectVal;

                // find order and select
                for (var i = 1; i < res.length - 1; i++) {
                    var tmpOrderSelect = res[i].split("::");
                    if (tmpOrderSelect[0] == "Order") {
                        orderVal = tmpOrderSelect[1];
                    }
                    else if (tmpOrderSelect[0] == "Select") {
                        selectVal = tmpOrderSelect[1];
                    }
                }

                htmlcode = '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        DevNamKeyVal[0] +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Name" value="' +
                        DevNamKeyVal[1] +
                        '">' +
                        '</div>' +
                        '</div><p></p>';

                // Order
                htmlcode += '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="OrderLabel" ' +
                        'for="Order" ' +
                        'class="col-sm-2 control-label">' +
                        "Order" +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Order" value="' +
                        orderVal +
                        '">' +
                        '</div>' +
                        '</div><p></p>';

                // Select
                htmlcode += '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="SelectLabel" ' +
                        'for="Select" ' +
                        'class="col-sm-2 control-label">' +
                        "Select" +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<input type="text" class="form-control input-sm" ' +
                        'id="Select" value="' +
                        selectVal +
                        '">' +
                        '</div>' +
                        '</div><p></p>';


                htmlcode += '<div class="row">' +
                        '<div class="col-md-2">' +
                        '<label id="NameLabel" ' +
                        'for="Name" ' +
                        'class="col-sm-2 control-label">' +
                        'Actions' +
                        '</label>' +
                        '</div>' +
                        '<div class="col-md-10">' +
                        '<select class="form-control" id="ActionSelect">';

                for (var i = 1; i < res.length - 1; i++) {
                    //alert("res: " + res[i]);
                    var listofclass = res[i].split("::");
                    var listAfterDots = listofclass[1].split(".");

                    if (listofclass[0] == "ActionList") {
                        if (selectedFullPathClass != listofclass[1]) {
                            htmlcode += "<option id='" + listofclass[1] + "'>" + listAfterDots[listAfterDots.length - 1] + "</option>";
                        }
                        else {
                            htmlcode += "<option id='" + listofclass[1] + "' selected>" + listAfterDots[listAfterDots.length - 1] + "</option>";
                        }
                    }
                }
                htmlcode += '</select></div></div>';
                htmlcode += '<p></p>';

                // div for all the p's
                htmlcode += '<div id="pValues"></div><p></p>';
                // hidden input for the saving
                htmlcode += '<input id="initname" type="hidden" value="' + node + '" name="initname">';

                // add all
                $('#AllFormDynamicInputs').html(htmlcode);

                // p in the xml (0..1)
                createPvaluesByActionPath(selectedFullPathClass);
                // add method if select chenge, replace the p values
                $('#ActionSelect').change(function() {
                    var selectedFullPathClass = $('#ActionSelect option:selected').attr('id');
                    createPvaluesByActionPath(selectedFullPathClass);
                });


                $('#EditNodeDivLoading').hide();
                $('#EditNodeDivShow').show();
            });
        }

        else if (node.indexOf("experiment") != -1) {
            // nothing. dont show #EditNodeDivShow div.
            $('#EditNodeDivLoading').hide();
        }

        else {
            htmlcode = '<label id="Key" for="Value" class="col-sm-2 control-label">' + node + '</label>' +
                    '<div class="col-sm-10">' +
                    '<input type="text" class="form-control" id="Value" placeholder="">' +
                    '</div>';
            htmlcode = htmlcode + '<input id="name" type="hidden" value="' + node + '" name="name">';
            $('#AllFormDynamicInputs').html(htmlcode);

            $('#EditNodeDivLoading').hide();
            $('#EditNodeDivShow').show();
        }
    });
}