<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ page import="com.journaldev.servlet.XMLTree"%>
<html>
    <head>
        <title>Simulator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

        <!-- Main Jquery-->
        <script type="text/javascript" src="js/jquery-2.0.3.min.js"></script>

        <!-- Latest compiled and minified JavaScript-->
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
        <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.js"></script>

        <!--tree view-->
        <link rel="stylesheet" href="Included/TreeView/jquery.treeview.css" />
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
        <script src="Included/TreeView/jquery.cookie.js" type="text/javascript"></script>
        <script src="Included/TreeView/jquery.treeview.js" type="text/javascript"></script>
        <script type="text/javascript" src="Included/TreeView/demo.js"></script>

        <!-- My Css Style -->
        <link rel="stylesheet" href="Style.css">

        <!-- All JavaScript Code-->
        <script type="text/javascript" src="js/myjs.js"></script>

    </head>
    <body>
        <form id="form1">

            <!-- HEADER -->
            <div class="ui-layout-north">
                <h1><p>Simulator</p></h1>
                <hr/>
            </div>

            <!--CONTENT-->
            <div class="outer-center" style="float: right; width: 1500px;">

                <!--Tab menu by bootstrap-->
                <ul id="myTab" class="nav nav-tabs">
                    <li class="active"><a href="#home" data-toggle="tab">Simulator</a></li>
                    <li><a href="#profile" data-toggle="tab">Edit</a></li>
                </ul>

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
                            <button type="button" id="runfull" class="btn btn-primary btn-lg doAction"><span class="glyphicon glyphicon-play"></span> Run Full Simulator</button>
                            <button type="button" id="runscenario" class="btn btn-primary btn-lg doAction"><span class="glyphicon glyphicon-step-forward"></span> Run Next Scenario In Simulator</button>
                            <br/>
                            <br/>
                            <textarea name="statis" id="statis" class="form-control" rows="13"></textarea>
                        </div>
                        </p>
                    </div>
                    <div class="tab-pane fade" id="profile">

                        <div id="EditNodeDivHide">
                            Select property from the xml tree to edit.
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

            <!--MENU-->
            <div class="outer-west" style="float: left; width: 200px;">
                <ul id="red" class="treeview-red">
                    <%
                        XMLTree m = XMLTree.getInstance();
                        out.println(m.getResult());
                    %>
                </ul>
            </div>

        </form>
    </body>

    <!--
        <script type='text/javascript'>
            $(document).ready(function() {
                $('.tree-toggle').click(function() {
                    $(this).parent().children('ul.tree').toggle(300);
                });
            });
        </script>-->

</html>