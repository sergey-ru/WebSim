<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ page import="java.io.*,java.util.*" %>
<%@ page import="sim.web.servlet.XMLTree"%>
<html>
    <head>
        <title>Simulator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <link rel="shortcut icon" href="favicon.ico" /> 

        <!-- Main jQuery -->
        <script type="text/javascript" src="js/jquery-2.0.3.min.js"></script>
        <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
        <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
        <script src="http://code.jquery.com/ui/1.10.4/jquery-ui.js"></script>

        <!--  Tree View -->
        <link rel="stylesheet" href="Included/TreeView/jquery.treeview.css" />
        <script src="Included/TreeView/jquery.cookie.js" type="text/javascript"></script>
        <script src="Included/TreeView/jquery.treeview.js" type="text/javascript"></script>
        <script type="text/javascript" src="Included/TreeView/demo.js"></script>

        <link rel="stylesheet" href="Style.css">
        <!-- tree and tabs control -->
        <script type="text/javascript" src="js/gui.Control.js"></script>
        <!-- simulation methods -->
        <script type="text/javascript" src="js/simulation.Control.js"></script>
        <!-- tree methods -->
        <script type="text/javascript" src="js/tree.Control.js"></script>


        <!-- ajax queue: call ajax calls in order -->
        <script type="text/javascript" src="js/jquery.ajaxQueue.js"></script>
        <script type="text/javascript" src="js/ajaxQueue.js"></script>

        <!-- <script type="text/javascript" src="js/jquery.blockUI.js"></script>-->

        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

    </head>
    <body>
        <form id="form1">

            <!-- HEADER -->
            <div>
                <h1><p>Simulator</p></h1>
                <div id="sessionId"></div>
                <hr/>
            </div>

            <!--MENU-->
            <div id="treeMenu">

                <button type="button" id="saveTree" class="btn btn-default btn-sm">Save Experiment</button>
                <p></p>

                <div id="loadingmessage">
                    <img id="loadingmessageSrc" src="Images/ajax-loader.gif"/>
                </div>

                <!-- For expanding the xml tree-->
                <div id="treecontrol">
                    <a href="#" id="collapTree">a</a>
                    <a href="#" id="expandTree">b</a>
                    <a href="#">c</a>
                </div>

                <ul id="red" class="treeview-gray">
                    <%
                        XMLTree m = XMLTree.getInstance();
                        out.println(m.getResult());
                    %>
                </ul>

                <div id="TreeValidation">
                    <div id="ifTreeValidDiv" class="alert alert-success">The Tree Is Valid</div>
                </div>
            </div>

            <!--space between menu and content-->
            <div id="spaceMenuContent"></div>

            <!--CONTENT-->
            <div id="content">
                <!--Tab menu by bootstrap-->
                <div id="myTabs">   
                    <ul class="nav nav-tabs" id="myTab">
                        <li id="simTab" class="active"><a href="#home" data-toggle="tab">Simulator</a></li>
                        <li id="editTab"><a href="#profile" data-toggle="tab">Edit</a></li>
                        <li id="viewTab"><a href="#view" data-toggle="tab">View</a></li>
                        <li id="statTab"><a href="#stat" data-toggle="tab">Statistics</a></li>
                    </ul>
                </div>

                <!--menu content-->
                <div id="myTabContent" class="tab-content">
                    <div class="tab-pane fade in active" id="home">
                        <p>
                        <div id="RunSimDiv">
                            <h3> Step 1.a: </h3>
                            Select XML Simulator Scenario File To Simulate or create a new:
                            <br/><br/>

                            <table border="0">
                                <tr>
                                    <td><input type="file" name="sampleFile" id="sampleFile"></td>
                                    <td><button type="button" id="UploadFileButton" onclick="upl();" class ="btn btn-primary" accept=".xml">Upload</button></td>
                                </tr>
                            </table>

                            <br/>
                            <h3> Step 1.b: </h3>
                            Or, Create a new experiment.
                            <br/>
                            <button type="button" id="newTree" class="btn btn-primary btn-sm">New Experiment</button>
                            <br/>
                            <br/>
                            <h3> Step 2: </h3>
                            Edit the tree.
                            <br/>
                            <br/>
                            <h3> Step 3: </h3>
                            Load the tree into the simulator.
                            <br/>
                            <button type="button" id="loadTreeToSim" class="btn btn-primary doAction">Load</button>
                            <br/>
                            <br/>
                            <h3> Step 4: </h3>
                            Run simulator.  
                            <br/>
                            <button type="button" id="viewgui" class="btn btn-primary btn-lg doAction">View Simulator</button>

                        </div>
                        </p>
                    </div>
                    <div class="tab-pane fade" id="profile">
                        <div id="EditNodeDivHide">
                            Select property from the xml tree to edit.
                        </div>
                        <div id="EditNodeDivLoading">
                            <img src='Images/ajax-loader.gif' width="5%"/>
                        </div>
                        <div id="EditNodeDivShow">

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

                    <div class="tab-pane fade" id="view">
                        <div id="ViewSimulatorDiv">

                            <!-- Graph Control -->
                            <table border="0" style="width: 100%;">
                                <tr>
                                    <td id="scenarioNameTd"><span id="scenarioNumberInfo"></span></td>
                                    <td id="1td"><button type="button" id="runInitRules" class="btn btn-primary doAction"><span class="glyphicon glyphicon-play"></span> Run Init</button></td>
                                    <td id="2td"><button type="button" id="runOneStepInScenario" class="btn btn-primary  doAction" disabled="disabled"><span class="glyphicon glyphicon-step-forward"></span> Run One Step</button></td>
                                    <td id="3td"><button type="button" id="runFullScenario" class="btn btn-primary doAction" disabled="disabled"><span class="glyphicon glyphicon-play"></span> Run Full Scenario</button></td>
                                    <td id="4td"><button type="button" id="nextScenario" class="btn btn-primary doAction" disabled="disabled"><span class="glyphicon glyphicon-chevron-right"></span> Next Scenario</button></td>
                                    <td id="5td"><button type="button" id="restart" class="btn btn-primary doAction"><span class="glyphicon glyphicon-repeat"></span> Restart</button></td>
                                    <td id="6td"><button type="button" id="runFullTime" class="btn btn-primary  doAction"><span class="glyphicon glyphicon-play"></span> Run Full With Time</button></td>
                                    <td id="7td"><button type="button" id="pause" class="btn btn-primary doAction" disabled="disabled"><span class="glyphicon glyphicon-pause"></span> Pause</button></td>
                                    <td id="ticksTd"><div id="sliderVal">Tick = 0 Seconds</div><div id="slider"></div></td>
                                    <td id="simConsol"><div id="output"></div> <div id="output2"></div><div id="output3"></div><div id="output4"></div><div id="output5"></div></td>
                                </tr>
                            </table>

                            <!-- Graph -->
                            <iframe id="iframeID" src="SimGui/demo/netchart/SimViewGraph.html" height="740" width="99%" frameborder="0"></iframe>
                            <div id="output6"></div>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="stat">
                        <div id="StatisticsDiv">
                            <div class="center">
                                <center>
                                    <iframe id="iframeStat" src="" height="740" width="99%" frameborder="0"></iframe>
                                </center>
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