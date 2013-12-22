<%-- 
    Document   : SimView
    Created on : Dec 22, 2013, 9:47:57 AM
    Author     : admin
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Simulator</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Bootstrap -->
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">


    </head>
    <body style="text-align: center;">
        <div class="row" style="margin-top: 20px;">

            <div class="col-md-4" style="text-align: left;">
                <button type="button" class="btn btn-primary btn-lg">
                    <span class="glyphicon glyphicon-arrow-left"></span> Back
            </div>

            <div class="col-md-4">
                <button type="button" class="btn btn-default btn-lg">
                    <span class="glyphicon glyphicon-play"></span>
                </button>

                <button type="button" class="btn btn-default btn-lg">
                    <span class="glyphicon glyphicon-pause"></span>
                </button>

                <button type="button" class="btn btn-default btn-lg">
                    <span class="glyphicon glyphicon-fast-backward"></span>
                </button>

                <button type="button" class="btn btn-default btn-lg">
                    <span class="glyphicon glyphicon-stop"></span>
                </button>

                <button type="button" class="btn btn-default btn-lg">
                    <span class="glyphicon glyphicon-fast-forward"></span>
                </button>

            </div>
            <div class="col-md-4"></div>
        </div>
        <div class="row">
            <iframe src="SimGui/demo/netchart/exploration.html" height="850" width="100%" frameborder="0"></iframe>
        </div>
    </body>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://code.jquery.com/jquery.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

</html>
