/*
 * all js function to control the tree menu
 */

$(document).ready(function() {

    // load the edited tree menu to the simulator
    $('#loadTreeToSim').click(function(event) {
        $('#waitToLoad').text("Please wait...");

        $.get('SimServlet', {request: "validateAndInitTree"}, function(responseText) {
            // only if tree is valid
            if (responseText === "true") {
                $('#waitToLoad').html("<div class=\"success\"><b>Well done!</b> You successfully loaded the simulator.</div>");
                $("#viewgui").removeAttr("disabled");
                $("#viewTab").removeAttr("disabled");
            }
            else {
                $('#waitToLoad').html("<div class=\"danger\">" + responseText + "</div>");
            }
        });
    });

    // new tree
    $('#newTree').click(function(event) {
        $("#viewgui").attr("disabled", "disabled");
        newTree();
    });

    // Save Changes in XML Tree
    $('#SavePropertyChanges').click(function(event) {
        /*
         * Do not use "serialize" bacause there are objects
         * such "file" that you dont want to save here,
         * but only after "upload" button, and serialize will take
         * it anyways and will update it.
         */

        // prevent from the page to refresh after click
        event.preventDefault();
        var elementToSave;
        var radioCheckVal = "";
        var actionSelect = "";
        var info = [];
        var elementIndex = 1; // always
        var i = 0;

        // If it is a Init save, there is a select to save
        actionSelect = $("#ActionSelect option:selected").attr("id");

        // action
        if (actionSelect !== "" && actionSelect) {
            info[i] = "Action" + "::" + actionSelect;
            i++;
        }

        // the element name
        $("#form1 input[type=hidden]").each(function() {
            elementToSave = this.value;
            var patt1 = /\d+/g;
            var matches = elementToSave.match(patt1);
            if (matches !== null) {
                elementIndex = matches[0];
                elementToSave = elementToSave.replace(elementIndex, "");
            }
        });

        // radio
        $("#form1 input[type=radio]:checked").each(function() {
            radioCheckVal = this.value;
        });

        if (radioCheckVal !== "") {
            info[i] = "Radio" + "::" + radioCheckVal;
            i++;
        }

        // all text input
        $("#form1 input[type=text]").each(function() {
            info[i] = this.id + "::" + this.value;
            i++;
        });

        var parseInfo = "";
        for (var i = 0; i < info.length; i++) {
            parseInfo = parseInfo + info[i] + ",,";
        }

        $.get('SimServlet', {request: "SaveProperties", elementToSave: elementToSave, elementIndex: elementIndex, info: parseInfo}, function(responseText) {
            if (responseText.indexOf("remove") !== -1) {
                responseText = responseText.replace("remove ", "");
                var tmp = responseText.split(".");
                $('span[id^="' + responseText + '"] a').text(tmp[tmp.length - 1]);
            }
            else if (responseText.indexOf("add") !== -1) {
                responseText = responseText.replace("add ", "");
                var tmp = $('span[id^="' + responseText + '"] a').text();
                $('span[id^="' + responseText + '"] a').html(tmp + "&#10004;");
            }

            $("#saveResult").html("<div class=\"success\">Successfully saved.</div>");
            ifTreeIsValid();
        });
    });

    // Handle "Save" button on modal, for each form that exists.
    $('#ModalSave').click(function(event) {
        var newruleSelect = $("#ModalListOfRules option:selected").text();
        var ScenarioIndexString = $("#ModalListOfRules option:selected").attr("id");
        var ScenarioIndex = 1;
        var doModalaction = $('input[name="ModalAction"]').val();

        if (doModalaction === "add_to_experiment") {
            $.get('SimServlet', {request: "AddNewScenario"}, function(responseText) {
                LoadXmlMenuTree("false");
            });
        }

        else if (doModalaction === "show_List_Of_Actions") {
            // get scenario index
            var patt1 = /\d+/g;
            var matches = ScenarioIndexString.match(patt1);

            if (matches !== null) {
                ScenarioIndex = matches[0];
            }

            ScenarioIndex = ScenarioIndex.replace("Scenario", "");
            $.get('SimServlet', {request: "AddScenarioNewRule", rule: newruleSelect, index: ScenarioIndex}, function(responseText) {
                LoadXmlMenuTree("false");
            });
        }

        else if (doModalaction.indexOf("delete_scenario") !== -1) {
            // get scenario index
            ScenarioIndex = doModalaction.replace("delete_scenario", "");
            $.get('SimServlet', {request: "DeleteScenario", index: ScenarioIndex}, function(responseText) {
                LoadXmlMenuTree("false");
            });
        }
    });
});

function ifTreeIsValid() {
    $.get('SimServlet', {request: "IfTreeIsValid"}, function(responseText) {

        if (responseText === "true") {
            $("#ifTreeValidDiv").attr("class", "alert alert-success");
            $("#ifTreeValidDiv").text("The Tree Is Valid");
        }
        else {
            $("#viewgui").attr("disabled", "disabled");
            $("#ifTreeValidDiv").attr("class", "alert alert-danger");
            $.get('SimServlet', {request: "getParserTreeErrorMessage"}, function(responseText) {
                $("#ifTreeValidDiv").html("Tree Is Not Valid!<br/><div style=\"font-size: 10px;\">" + responseText + "</div>");
            });
        }
        $('#expandTree').trigger("click");
    });
}

// upload new xml file
function uploadNewXmlTree() {
    $(document).ready(function() {
        $("#viewgui").attr("disabled", "disabled");
        var sampleFile = document.getElementById("sampleFile").files[0];
        var formdata = new FormData();
        formdata.append("sampleFile", sampleFile);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "SimServlet?request=newxmlTree", true);
        xhr.send(formdata);
        xhr.onload = function(e) {
            if (this.status === 200) {
                LoadXmlMenuTree("true");
            }
        };
    });
}

// upload new net file
function uploadNetFile() {
    $(document).ready(function() {
        $("#viewgui").attr("disabled", "disabled");
        var sampleFile = document.getElementById("NetFilePath").files[0];
        var formdata = new FormData();
        formdata.append("sampleFile", sampleFile);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "SimServlet?request=netFile", true);
        xhr.send(formdata);
        xhr.onload = function(e) {
            if (this.status === 200) {
                if (xhr.responseText === "true&#10;")
                    $("#netFileDiv").html("<div class=\"success\">Net file uploaded successfully.</div>");
                else
                    $("#netFileDiv").html("<div class=\"danger\">Net file were not uploaded. Please try another net file.</div>");
            }
        };
    });
}

// for modal gui only. real update & delete is in ModalSave.click handle
function deleteAndAddRule() {
    var res = event.target.id.split("_");
    var action = res[2];
    var objectId = res[1];
    var element = res[0];

    if (action === "delete")
    {
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
        $('#red').html(responseText);

        $.ajax({
            url: "JS/TreeView/demo.js",
            dataType: "script"
        });

        // Hide the loading message
        $('#loadingmessage').hide();
        $('#red').show();
        $('#expandTree').trigger("click");

        ifTreeIsValid();
    });
}

function createPvaluesByActionPath(fullClassPath, index) {
    htmlcode = "";

    $.get('SimServlet', {request: "GetPByActionValue", fullClassPath: fullClassPath, index: index}, function(responseText) {
        var pListRes = responseText.split(",,");

        for (var i = 0; i < pListRes.length - 1; i++) {
            var pList = pListRes[i].split("::");

            htmlBuilder.addRow();
            htmlBuilder.addLabel(pList[0]);
            htmlBuilder.addInput(pList[0], pList[1]);
            htmlBuilder.addEndRow();
        }

        // add p and if no p, clean content
        $('#pValues').html(htmlBuilder.html);
        htmlBuilder.clear();
    });
}

function newTree() {
    $('#loadingmessage').show();
    $('#red').hide();

    $.get('SimServlet', {request: "NewTree"}, function(responseText) {
        LoadXmlMenuTree("false");
    });
}

function initGuiForEditProperty() {
    $('#simTab').removeClass("active");
    $('#viewTab').removeClass("active");
    $('#editTab').attr("Class", "in active");
    $('#home').removeClass("active");
    $('#view').removeClass("active");
    $('#profile').attr("Class", "in active");
    $('#EditNodeDivHide').hide();
    $('#EditNodeDivShow').hide();
    $('#ViewSimulatorDiv').hide();
    $('#EditNodeDivLoading').show();
}

function editSimulationProperty(node) {
    var v0;

    $.get('SimServlet', {request: "SimulationProperty", element: node}, function(responseText) {
        var res = responseText.split(",,");
        for (var i = 0; i < res.length - 1; i++) {
            v0 = res[i].split("::");

            // build html code
            htmlBuilder.addRow();
            htmlBuilder.addLabel(v0[0]);
            if (v0[0] === "NetFilePath") {
                htmlBuilder.addInputFile(v0[0], v0[1]);
            }
            else {
                htmlBuilder.addInput(v0[0], v0[1]);
            }
            htmlBuilder.addEndRow();
        }

        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

        $('#EditNodeDivLoading').hide();
        $('#EditNodeDivShow').show();
    });
}

function editStatisticListenerProperty(node) {

    $.get('SimServlet', {request: "StatisticProperties", element: node}, function(responseText) {

        var res = responseText.split(",,");
        var choosen = res[0].split("::");

        htmlBuilder.addRow();
        htmlBuilder.addLabel("Active");
        htmlBuilder.addStartRadio();

        if (choosen[1] === 'true') {
            htmlBuilder.addActiveRadio("On");
            htmlBuilder.addNotActiveRadio("Off");
        }
        else {
            htmlBuilder.addNotActiveRadio("On");
            htmlBuilder.addActiveRadio("Off");
        }

        htmlBuilder.addEndRadio();
        htmlBuilder.addEndRow();

        for (var i = 1; i < res.length - 1; i++) {
            var pList = res[i].split("::");

            htmlBuilder.addRow();
            htmlBuilder.addLabel(pList[0]);
            htmlBuilder.addInput(pList[0], pList[1]);
            htmlBuilder.addEndRow();
        }

        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

        $('#EditNodeDivLoading').hide();
        $('#EditNodeDivShow').show();
    });
}

function editRoutingProperty(node) {

    $.get('SimServlet', {request: "RoutingAlgProperties", element: node}, function(responseText) {

        var res = responseText.split(",,");
        var choosen = res[0].split("::");

        htmlBuilder.addRow();
        htmlBuilder.addLabel("Active");
        htmlBuilder.addStartRadio();

        if (choosen[1] === 'true') {
            htmlBuilder.addActiveRadio("On");
            htmlBuilder.addNotActiveRadio("Off");
        }
        else {
            htmlBuilder.addNotActiveRadio("On");
            htmlBuilder.addActiveRadio("Off");
        }

        htmlBuilder.addEndRadio();
        htmlBuilder.addEndRow();

        for (var i = 1; i < res.length - 1; i++) {
            var pList = res[i].split("::");

            htmlBuilder.addRow();
            htmlBuilder.addLabel(pList[0]);
            htmlBuilder.addInput(pList[0], pList[1]);
            htmlBuilder.addEndRow();
        }

        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

        $('#EditNodeDivLoading').hide();
        $('#EditNodeDivShow').show();
    });
}

function editScenarioProperty(node) {

    var index = node.replace("scenario", "");

    $.get('SimServlet', {request: "ScenarioProperty", index: index}, function(responseText) {

        var v0 = responseText.split("::");

        htmlBuilder.addRow();
        htmlBuilder.addLabel(v0[0]);
        htmlBuilder.addInput("Name", v0[1]);
        htmlBuilder.addEndRow();
        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

        $('#EditNodeDivLoading').hide();
        $('#EditNodeDivShow').show();
    });
}

function editInitProperty(node) {
    var index = node.replace("init", "");

    $.get('SimServlet', {request: "InitProperty", index: index}, function(responseText) {

        var res = responseText.split(",,");
        var InitNamKeyVal = res[0].split("::");

        var selectedFullPathClass = res[res.length - 1].split("::");
        selectedFullPathClass = selectedFullPathClass[1];

        htmlBuilder.addRow();
        htmlBuilder.addLabel(InitNamKeyVal[0]);
        htmlBuilder.addInput("Name", InitNamKeyVal[1]);
        htmlBuilder.addEndRow();

        htmlBuilder.addRow();
        htmlBuilder.addLabel("Actions");
        htmlBuilder.addStartSelect();

        for (var i = 1; i < res.length - 1; i++) {
            var listofclass = res[i].split("::");
            var listAfterDots = listofclass[1].split(".");

            if (listofclass[0] === "ActionList") {
                if (selectedFullPathClass !== listofclass[1]) {
                    htmlBuilder.addOption(listofclass[1], listAfterDots[listAfterDots.length - 1], false);
                }
                else {
                    htmlBuilder.addOption(listofclass[1], listAfterDots[listAfterDots.length - 1], true);
                }
            }
        }

        htmlBuilder.addEndSelect();
        htmlBuilder.addEndRow();
        htmlBuilder.addPValues();
        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

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

function editExDevLinkProperty(node) {
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

        var res = responseText.split(",,");
        var DevNamKeyVal = res[0].split("::");
        var selectedFullPathClass = res[res.length - 1].split("::");
        selectedFullPathClass = selectedFullPathClass[1];
        var orderVal;
        var selectVal;

        // find order and select
        for (var i = 1; i < res.length - 1; i++) {
            var tmpOrderSelect = res[i].split("::");
            if (tmpOrderSelect[0] === "Order") {
                orderVal = tmpOrderSelect[1];
            }
            else if (tmpOrderSelect[0] === "Select") {
                selectVal = tmpOrderSelect[1];
            }
        }

        htmlBuilder.addRow();
        htmlBuilder.addLabel(DevNamKeyVal[0]);
        htmlBuilder.addInput("Name", DevNamKeyVal[1]);
        htmlBuilder.addEndRow();

        //Order
        htmlBuilder.addRow();
        htmlBuilder.addLabel("Order");
        htmlBuilder.addInput("Order", orderVal);
        htmlBuilder.addEndRow();

        // Select
        htmlBuilder.addRow();
        htmlBuilder.addLabel("Select");
        htmlBuilder.addInput("Select", selectVal);
        htmlBuilder.addEndRow();

        // Action
        htmlBuilder.addRow();
        htmlBuilder.addLabel("Actions");
        htmlBuilder.addStartSelect();

        for (var i = 1; i < res.length - 1; i++) {
            var listofclass = res[i].split("::");
            var listAfterDots = listofclass[1].split(".");

            if (listofclass[0] === "ActionList") {
                if (selectedFullPathClass !== listofclass[1]) {
                    htmlBuilder.addOption(listofclass[1], listAfterDots[listAfterDots.length - 1], false);
                }
                else {
                    htmlBuilder.addOption(listofclass[1], listAfterDots[listAfterDots.length - 1], true);
                }
            }
        }

        htmlBuilder.addEndSelect();
        htmlBuilder.addEndRow();
        htmlBuilder.addPValues();
        htmlBuilder.addEnd(node);
        htmlBuilder.Flush();

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

function EditPropertyJS(node) {
    $(document).ready(function() {
        // init gui
        initGuiForEditProperty();
        $('#saveResult').html("");

        if (node === "simulation") {
            editSimulationProperty(node);
        }

        else if (node.indexOf("StatisticListener") !== -1) {
            editStatisticListenerProperty(node);
        }

        else if (node.indexOf("RoutingAlgorithm") !== -1) {
            editRoutingProperty(node);
        }

        else if (node.indexOf("scenario") !== -1) {
            editScenarioProperty(node);
        }

        else if (node.indexOf("init") !== -1) {
            editInitProperty(node);
        }

        else if ((node.indexOf("device") !== -1) || (node.indexOf("external") !== -1) || (node.indexOf("link") !== -1)) {
            editExDevLinkProperty(node);
        }

        else if (node.indexOf("experiment") !== -1) {
            // nothing. dont show #EditNodeDivShow div.
            $('#EditNodeDivLoading').hide();
        }

        else {

            htmlBuilder.addLabel(node);
            htmlBuilder.addInput("Value", "");
            htmlBuilder.addEnd(node);
            htmlBuilder.Flush();

            // $('#AllFormDynamicInputs').html(htmlcode);
            $('#EditNodeDivLoading').hide();
            $('#EditNodeDivShow').show();
        }
    });
}

var htmlBuilder = {
    html: '',
    clear: function() {
        this.html = '';
    },
    addRow: function() {
        this.html += '<div class="row">';
    },
    addLabel: function(id) {
        this.html += '<div class="col-md-2">' +
                '<label id="Label' + id + '" ' +
                'for="' + id + '" ' +
                'class="col-sm-2 control-label">' +
                id +
                '</label>' +
                '</div>';
    },
    addInputFile: function(id, value) {
        this.html += '<div class="col-md-10">' +
                '<div class="fileinput fileinput-new" data-provides="fileinput">' +
                '<div class="input-group">' +
                '<div class="col-md-8">' +
                '<div class="form-control uneditable-input span3" data-trigger="fileinput"><i class="glyphicon glyphicon-file fileinput-exists"></i> <span class="fileinput-filename"></span>' +
                '</div>' +
                '<span class="input-group-addon btn btn-default btn-file"><span class="fileinput-new">Select file</span><span class="fileinput-exists">Change</span><input type="file" ' +
                'id="' + id + '" ' +
                'name="' + id + '" ' +
                'value="' + value + '">' +
                '</span>' +
                '<a href="#" class="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">Remove</a>' +
                '</div>' +
                '<div class="col-md-2">' +
                '<button type="button" onclick="uploadNetFile();" class="btn btn-primary">Upload</button>' +
                '</div>' +
                '<div class="col-md-2" style="position:relative;">' +
                '<div id="netFileDiv">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
    },
    addInput: function(id, value) {
        this.html += '<div class="col-md-10">' +
                '<input type="text" class="form-control input-sm" ' +
                'id="' + id + '" ' +
                'name="' + id + '" ' +
                'value="' + value + '" /></div>';
    },
    addEndRow: function() {
        this.html += '</div><p></p>';
    },
    addStartSelect: function() {
        this.html += '<div class="col-md-10">' +
                '<select class="form-control" id="ActionSelect">';
    },
    addEndSelect: function() {
        this.html += '</select></div>';
    },
    addPValues: function() {
        this.html += '<div id="pValues"></div><p></p>';
    },
    addOption: function(id, value, selected) {
        if (!selected)
            this.html += '<option id="' + id + '">' + value + '</option>';
        else
            this.html += '<option id="' + id + '" selected>' + value + '</option>';
    },
    addEnd: function(node) {
        this.html += '<input id="name" type="hidden" value="' + node + '" name="name" />';
    },
    addStartRadio: function() {
        this.html += '<div class="col-md-10"><div class="btn-group" data-toggle="buttons">';
    },
    addActiveRadio: function(value) {
        this.html += '<label class="btn btn-default active">' +
                '<input type="radio" name="Active" value="' + value + '">' + value +
                '</label>';
    },
    addNotActiveRadio: function(value) {
        this.html += '<label class="btn btn-default">' +
                '<input type="radio" name="Active" value="' + value + '">' + value +
                '</label>';
    },
    addEndRadio: function() {
        this.html += '</div></div><p></p>';
    },
    Flush: function() {
        $('#AllFormDynamicInputs').html(this.html);
        $('#EditNodeDivLoading').hide();
        $('#EditNodeDivShow').show();
        this.clear();
    }
};
