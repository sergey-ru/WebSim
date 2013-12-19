<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ page import="sim.web.servlet.XMLTree"%>
<html>
    <head>
        <title>Simulator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

        <!--Main jQuery-->
        <script type="text/javascript" src="js/jquery-2.0.3.min.js"></script>

        <!--Tree View-->
        <link rel="stylesheet" href="Included/TreeView/jquery.treeview.css" />
        <script src="Included/TreeView/jquery.cookie.js" type="text/javascript"></script>
        <script src="Included/TreeView/jquery.treeview.js" type="text/javascript"></script>
        <script type="text/javascript" src="Included/TreeView/demo.js"></script>

        <link rel="stylesheet" href="Style.css">
        <script type="text/javascript" src="js/myjs.js"></script>
        <script type="text/javascript" src="js/jquery.blockUI.js"></script>

        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

    </head>
    <body>
        <form id="form1">

            <!-- HEADER -->
            <div class="ui-layout-north">
                <h1><p>Simulator</p></h1>
                <hr/>
            </div>

            <!--MENU-->
            <div class="outer-west" style="float: left; width: 15%;">

                <button type="button" id="newTree" class="btn btn-default btn-sm">New Experiment</button>
                <button type="button" id="saveTree" class="btn btn-default btn-sm">Save Experiment</button>

                <p></p>
                <div id='loadingmessage' style='display:none'>
                    <img src='Images/ajax-loader.gif' width="20%"/>
                </div>
                <!-- For expanding the xml tree-->
                <div id="treecontrol" style="display: none;">
                    <a href="#" style="display: none;" id="collapTree">a</a>
                    <a href="#" style="display: none;" id="expandTree">b</a>
                    <a href="#" style="display: none;">c</a>
                </div>
                <ul id="red" class="treeview-gray">
                    <%
                        XMLTree m = XMLTree.getInstance();
                        out.println(m.getResult());
                    %>
                </ul>
                <div id="TreeValidation" style="position:absolute; bottom:0;">
                    <div id="ifTreeValidDiv" class="alert alert-success">The Tree Is Valid</div>
                </div>
            </div>

            <!--SPACE between menu and content-->
            <div class="outer-center" style="float: right; width: 2%;"></div>

            <!--CONTENT-->
            <div class="outer-center" style="float: right; width: 83%;">
                <!--Tab menu by bootstrap-->
                <div id="myTabs">   
                    <ul class="nav nav-tabs" id="myTab">
                        <li id="simTab" class="active"><a href="#home" data-toggle="tab">Simulator</a></li>
                        <li id="editTab"><a href="#profile" data-toggle="tab">Edit</a></li>
                    </ul>
                </div>

                <!--menu content-->
                <div id="myTabContent" class="tab-content">
                    <div class="tab-pane fade in active" id="home">
                        <p>
                        <div id="RunSimDiv">
                            Select XML Simulator Scenario File To Simulate:
                            <br/><br/>
                            <input type="file" name="sampleFile" id="sampleFile">
                            <br/>
                            <button type="button" id="UploadFileButton" onclick="upl();" class ="btn btn-primary"><span class="glyphicon glyphicon-upload"></span> Upload</button>
                            <br/>
                            <br/>
                            <button type="button" id="loadXmlToSim" class="btn btn-primary btn-lg doAction">Load the tree into the simulator</button>
                            <br/>
                            <br/>
                            <button type="button" id="runfull" class="btn btn-primary btn-lg doAction"><span class="glyphicon glyphicon-play"></span> Run Full Simulator</button>
                            <button type="button" id="runscenario" class="btn btn-primary btn-lg doAction"><span class="glyphicon glyphicon-step-forward"></span> Run Next Scenario In Simulator</button>
                            <br/>
                            <br/>
                            <textarea name="statis" id="statis" class="form-control" rows="13">
                            </textarea>
                        </div>
                        </p>
                    </div>
                    <div class="tab-pane fade" id="profile">

                        <div id="EditNodeDivHide">
                            Select property from the xml tree to edit.
                        </div>
                        <div id="EditNodeDivLoading" style="display:none">
                            <img src='Images/ajax-loader.gif' width="5%"/>
                        </div>
                        <div id="EditNodeDivShow" style="width: 80%; margin: 20px 20px 20px 20px;">

                            <div id="AllFormDynamicInputs">
                                <label id="Key" for="Value" class="col-sm-2 control-label">Value</label>
                                <div class="col-sm-10">
                                    <input type="email" class="form-control" id="Value" placeholder="">
                                </div>
                            </div>

                            <br/>
                            <div class="row">
                                <div class="col-md-4">
                                    <button type="submit" id="SavePropertyChanges" class="btn btn-primary">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <!-- Modal -->
        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title" id="myModalLabel">Modal title</h4>
                    </div>
                    <div class="modal-body">

                    </div>
                    <div class="modal-footer">
                        <button type="button" id="ModalClose" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" id="ModalSave" class="btn btn-primary" data-dismiss="modal">Save changes</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal --> 

    </body>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
</html>