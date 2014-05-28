<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!doctype html>
<%@ page import="java.io.*,java.util.*" %>
<%@ page import="sim.web.servlet.XMLTree"%>
<html>
    <head>
        <title>Simulator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <link rel="shortcut icon" href="Images/favicon.ico" /> 

        <!-- Main jQuery -->
        <script type="text/javascript" src="JS/jqueryAndBootstrap/jquery-2.0.3.min.js"></script>
        <link rel="stylesheet" href="JS/jqueryAndBootstrap/jquery-ui.css">
        <script src="JS/jqueryAndBootstrap/jquery-1.9.1.js"></script>
        <script src="JS/jqueryAndBootstrap/jquery-ui.js"></script>

        <!--  Layout -->
        <script type="text/javascript" src="JS/Layout/jquery.layout-latest.js"></script> 

        <!--  Tree View -->
        <link rel="stylesheet" href="JS/TreeView/jquery.treeview.css" />
        <script src="JS/TreeView/jquery.cookie.js" type="text/javascript"></script>
        <script src="JS/TreeView/jquery.treeview.js" type="text/javascript"></script>
        <script type="text/javascript" src="JS/TreeView/demo.js"></script>

        <!-- ajax queue: call ajax calls in order -->
        <script type="text/javascript" src="JS/ajaxQueue/jquery.ajaxQueue.js"></script>
        <script type="text/javascript" src="JS/ajaxQueue/ajaxQueue.js"></script>

        <link rel="stylesheet" href="Style.css">
        <!-- init simulator -->
        <script type="text/javascript" src="JS/initialization.js"></script>  
        <!-- tree and tabs control -->
        <script type="text/javascript" src="JS/gui.Control.js"></script>
        <!-- simulation methods -->
        <script type="text/javascript" src="JS/simulation.Control.js"></script>
        <!-- tree methods -->
        <script type="text/javascript" src="JS/tree.Control.js"></script>

        <!-- original bootstrap for styling -->
        <link rel="stylesheet" href="JS/jqueryAndBootstrap/bootstrap.min.css">
        <!-- jansy bootstrap for more style (file upload) -->
        <link rel="stylesheet" href="JS/jqueryAndBootstrap/bootstrapJ.min.css">

    </head>
    <body>

        <div class="ui-layout-center">

            <!--CONTENT-->

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

                        <h3> Step 1: </h3>
                        Select XML simulator experiment file to simulate, or create a new experiment:
                        <br/>

                        <table id="fileinputtable1" border="0" class="wide">
                            <tr>
                                <td colspan="3" class="wide">
                                    <button type="button" id="newTree" class="btn btn-primary" style="width: 70%;">Create New Experiment</button>
                                </td>
                            </tr>
                            <tr>
                                <td class="tdOfInputFile">
                                    <div class="fileinput fileinput-new wide" data-provides="fileinput">
                                        <div class="input-group" class="wide">
                                            <div class="form-control" data-trigger="fileinput"><i class="glyphicon glyphicon-file fileinput-exists"></i> <span class="fileinput-filename"></span></div>
                                            <span class="input-group-addon btn btn-default btn-file" ><span class="fileinput-new" >Select file</span><span class="fileinput-exists">Change</span><input type="file" name="xmlFile" id="xmlFile"></span>
                                            <a href="#" class="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">Remove</a>
                                        </div>
                                    </div>
                                </td>
                                <td style="width: 20%"><button type="button" id="UploadFileButton" onclick="uploadXmlTreeFile();" class ="btn btn-primary" style="width: 100%;">Upload</button></td>
                                <td style="width: 2%;"></td>
                                <td style="width: 28%"><div id="xmlFileDiv"></div></td>
                            </tr>
                        </table>


                        <h3> Step 2: </h3>
                        Please load a .net file (that represent a network):
                        <br/>

                        <table id="fileinputtable2" border="0" class="wide">
                            <tr>
                                <td class="tdOfInputFile">
                                    <div class="fileinput fileinput-new wide" data-provides="fileinput">
                                        <div class="input-group" class="wide">
                                            <div class="form-control" data-trigger="fileinput"><i class="glyphicon glyphicon-file fileinput-exists"></i> <span class="fileinput-filename"></span></div>
                                            <span class="input-group-addon btn btn-default btn-file"><span class="fileinput-new">Select file</span><span class="fileinput-exists">Change</span><input type="file" name="netFile" id="netFile"></span>
                                            <a href="#" class="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">Remove</a>
                                        </div>
                                    </div>
                                </td>
                                <td style="width: 20%"><button type="button" id="UploadFileButton2" onclick="uploadNetFile();" class ="btn btn-primary" style="width: 100%;">Upload</button></td>
                                <td style="width: 2%;"></td>
                                <td style="width: 28%"><div id="netFileDiv"></div></td>
                            </tr>
                        </table>


                        <br/>
                        <h3> Step 3: </h3>
                        Edit the tree.

                        <br/>
                        <br/>
                        <h3> Step 4: </h3>
                        <br/>
                        <button type="button" id="loadTreeToSim" class="btn btn-primary doAction" style="width: 70%;">Load the tree into the simulator</button>
                        <div id="waitToLoad"></div>
                        <br/>
                        <br/>
                        <h3> Step 5: </h3>
                        Run simulator.  
                        <br/>
                        <button type="button" id="viewgui" class="btn btn-primary doAction"  style="width: 70%;">View Simulator</button>

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
                        <form id="form1">
                            <div id="AllFormDynamicInputs">

                            </div>

                            <br/>
                            <div class="row">
                                <div class="col-md-2">
                                    <button type="submit" id="SavePropertyChanges" class="btn btn-primary">Save</button>
                                </div>
                                <div class="col-md-10">
                                    <div id="saveResult"></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>  

                <div class="tab-pane fade" id="view">
                    <div id="ViewSimulatorDiv">


                        <!-- Graph Control -->
                        <table id="graphControlTable1" border="0">
                            <tr>
                                <td id="scenarioNameTd" width="35%"><span id="scenarioNumberInfo"></span></td>
                                <td id="ticksTd" width="20%"><div id="sliderVal">Tick = 1820 Milli</div><div id="slider"></div></td>
                                <td id="nodesTd" width="30%"><div id="sliderNodesVal"></div><div id="sliderNodes" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"></div></td>
                                <td id="simConsolTd" width="15%"><div style="display: inline-block;">Tick: </div><div id="output" style="display: inline-block;"></div></td>
                            </tr>
                        </table>
                        <table id="graphControlTable2" border="0">      
                            <tr>
                                <td id="1td"><button type="button" id="runInitRules" class="btn btn-primary doAction" title="Run Init rules for currect scenario"><span class="glyphicon glyphicon-play"></span> Run Init</button></td>
                                <td id="2td"><button type="button" id="runOneStepInScenario" class="btn btn-primary  doAction" disabled="disabled" title="Run one step in currect scenario"><span class="glyphicon glyphicon-step-forward"></span> One Step</button></td>
                                <td id="3td"><button type="button" id="runFullScenario" class="btn btn-primary doAction" disabled="disabled" title="Run Full Scenario"><span class="glyphicon glyphicon-play"></span> Full Scenario</button></td>
                                <td id="4td"><button type="button" id="nextScenario" class="btn btn-primary doAction" disabled="disabled" title="Move to the next scenario"><span class="glyphicon glyphicon-chevron-right"></span> Next Scenario</button></td>
                                <td id="5td"><button type="button" id="restart" class="btn btn-primary doAction" title="Restart the simulation"><span class="glyphicon glyphicon-repeat"></span> Restart</button></td>
                                <td id="6td"><button type="button" id="runFullTime" class="btn btn-primary doAction" title="Run full scenario with the tick control"><span class="glyphicon glyphicon-play"></span> Full With Time</button></td>
                                <td id="7td"><button type="button" id="pause" class="btn btn-primary doAction" disabled="disabled" title="Pause running"><span class="glyphicon glyphicon-pause"></span> Pause</button></td>
                            </tr>
                        </table>

                        <!-- Graph -->
                        <iframe id="iframeID" src="Graph/SimViewGraph.html" height="100%" width="100%" frameborder="0"></iframe>
                    </div>
                </div>

                <div class="tab-pane fade" id="stat">
                    <div id="StatisticsDiv">
                        <iframe id="iframeStat" src="Statistics/statistics.html"  height="100%" width="100%" style="position: absolute;" frameborder="0"></iframe>
                    </div>  
                </div>
            </div>
        </div>

        <!--    <div class="ui-layout-north">
        
                 HEADER 
                <h2>Simulator</h2>
                <div id="sessionId"></div>
        
            </div>-->

        <div class="ui-layout-east">

            <div class="ui-layout-center">
                <form id="nodePropertyCheckboxesForm">
                    <div id="nodeInfoDiv"></div>
                </form>
            </div>
            <div class="ui-layout-south">
                <iframe id="iframeStat" src="Chart/Chart.html" frameborder="0"></iframe>
                <div id="output6"></div>
            </div>

        </div>

        <div class="ui-layout-west">

            <!--MENU-->
            <div id="treeMenu">
                <div id="downloadXMLDiv">
                </div>

                <div id="errroDownload"></div>
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

        </div>


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
    <!-- jansy bootstrap js -->
    <script src="JS/jqueryAndBootstrap/bootstrapj.min.js"></script>
</html>