/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.journaldev.servlet;

import static bgu.sim.Properties.StringsProperties.SIMULATOR_SCENARIO_XML_PATH;
import bgu.sim.core.Simulator;
import bgu.sim.reflection.ClassesLister;
import bgu.sim.ruleEngine.property.Property;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.josql.QueryExecutionException;

/**
 *
 * @author Keren Fruchter
 */
public class SimServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private ServletFileUpload uploader = null;
    private Simulator simTest;
    private int nextTickIndex;
    private int nextScenarioIndex;
    //private ServletPrintCollector gg = new ServletPrintCollector();

    @Override
    // Called when user press Upload.
    public void init() throws ServletException {
        nextTickIndex = 0;
        nextScenarioIndex = 0;
        // init sim
        initSim();

        System.out.println("YAAAAAAAAAAAYYYYYYYYYYYYYYYYY");
        DiskFileItemFactory fileFactory = new DiskFileItemFactory();
        File filepath = new File("c:/tmp/Sim/");
        fileFactory.setRepository(filepath);
        this.uploader = new ServletFileUpload(fileFactory);
        System.out.println("Init UploadFileServer.");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            // TODO Auto-generated method stub
            String theRequest;
            theRequest = request.getParameter("request");
            XMLTree m;

            switch (theRequest) {
                case "startfull":
                    returnResponse(response, "Simulator Started.");
                    runFull(request, response);
                    returnResponse(response, "Simulator Finished.");
                    break;
                case "startscenario":
                    returnResponse(response, "Simulator Started Next Scenario.");
                    runOneCenario(request, response);
                    returnResponse(response, "Simulator Finished One Next Step.");
                    break;
                case "getElementProperties":
                    String node = request.getParameter("element");
                    // here its faling!!!!!!!!!
                    List<Property> ans = ClassesLister.getInstance().getClassProperties("bgu.sim.core.Simulator");
                    response.setContentType("text/plain");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("yayyyyyyyyy");
                    break;
                case "loadXmlTree":
                    try {
                        m = XMLTree.getInstance();
                        m.parse();
                        response.getWriter().write(m.getResult().toString());
                    } catch (IOException ex) {
                        response.getWriter().write("error");
                    } catch (Exception ex) {
                        response.getWriter().write("error");
                    }
                    break;
                case "SimulationProperty":
                    try {
                        m = XMLTree.getInstance();
                        response.getWriter().write(m.getSimulationProperties());
                    } catch (IOException ex) {
                        response.getWriter().write("error");
                    }
                    break;
                case "IfStaticIsSelected":
                    try {
                        String statisticNodeToCheck = request.getParameter("element");
                        statisticNodeToCheck = statisticNodeToCheck.replace("StaticListener ", "");
                        m = XMLTree.getInstance();
                        response.getWriter().write(m.ifStatisticIsChoosen(statisticNodeToCheck));
                    } catch (IOException ex) {
                        response.getWriter().write("error");
                    }
                    break;
                case "IfRoutingAlgSelected":
                    try {
                        String routalgNodeToCheck = request.getParameter("element");
                        routalgNodeToCheck = routalgNodeToCheck.replace("RoutingAlgorithm ", "");
                        m = XMLTree.getInstance();
                        response.getWriter().write(m.ifRoutAlgIsChoosen(routalgNodeToCheck));
                    } catch (IOException ex) {
                        response.getWriter().write("error");
                    }
                    break;
            }
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            System.err.println("Error taking request from client.");
        }
    }

    private void returnResponse(HttpServletResponse response, String res) {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        try {
            response.getWriter().write(res + "&#10;");
        } catch (IOException ex) {
            System.err.println("ERROR RETURN RESPONSE.");
            //Logger.getLogger(SimServlet.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    // load xml file sim scenario
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            List<FileItem> fileItemsList = uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();
            while (fileItemsIterator.hasNext()) {
                FileItem fileItem = fileItemsIterator.next();
                System.out.println("FieldName=" + fileItem.getFieldName());
                System.out.println("FileName=" + fileItem.getName());
                System.out.println("ContentType=" + fileItem.getContentType());
                System.out.println("Size in bytes=" + fileItem.getSize());

                File file = new File(("c:/tmp/Sim/") + File.separator + fileItem.getName());
                System.out.println("Absolute Path at server=" + file.getAbsolutePath());
                // set parameter for the simulator, the path of the xml scenarios
                SIMULATOR_SCENARIO_XML_PATH = file.getAbsolutePath();
                fileItem.write(file);
            }
        } catch (FileUploadException e) {
            System.out.println("Exception in uploading file.");
        } catch (Exception e) {
            System.out.println("Exception in uploading file.");
        }

    }

    // run simulator
    protected void runFull(HttpServletRequest request, HttpServletResponse response) {
        try {
            while (simTest.nextScenario()) {
                long start = System.currentTimeMillis();
                while (simTest.nextTick()) {
                    //returnResponse(response, "Tick " + nextTickIndex);
                    nextTickIndex++;
                }
                nextScenarioIndex++;
                returnResponse(response, "Scenario Number " + nextScenarioIndex);
                //System.out.println(("Time Took: " + (System.currentTimeMillis() - start)));
                String timeForRunningFull = Long.toString(System.currentTimeMillis() - start);
                returnResponse(response, timeForRunningFull);
            }

        } catch (IOException | ClassNotFoundException | InterruptedException | QueryExecutionException e) {
            // Simlation failed.
            //StringWriter sw = new StringWriter();
            //e.printStackTrace(new PrintWriter(sw));
            //String exceptionAsString = sw.toString();
            System.err.println("Error running the simulator.");
        }
        System.out.println("Done.");
    }

    private void initSim() {
        try {
            simTest = Simulator.fromXML(SIMULATOR_SCENARIO_XML_PATH);
        } catch (Exception ex) {
            System.err.println("Error Init the simulator.");
            //
        }
    }

    private void runOneCenario(HttpServletRequest request, HttpServletResponse response) {
        try {
            if (simTest.nextScenario()) {
                long start = System.currentTimeMillis();
                while (simTest.nextTick()) {
                    //returnResponse(response, "Tick " + nextTickIndex);
                    nextTickIndex++;
                }
                nextScenarioIndex++;
                returnResponse(response, "Scenario Number " + nextScenarioIndex);
                //System.out.println(("Time Took: " + (System.currentTimeMillis() - start)));
                String timeForRunningFull = Long.toString(System.currentTimeMillis() - start);
                returnResponse(response, timeForRunningFull);
            } else {
                returnResponse(response, "No More Scenarios.");
                System.out.println("No More Scenarios.");
            }

        } catch (IOException | ClassNotFoundException | InterruptedException | QueryExecutionException e) {
            // Simlation failed.
            //StringWriter sw = new StringWriter();
            //e.printStackTrace(new PrintWriter(sw));
            //String exceptionAsString = sw.toString();
            System.err.println("Error running the simulator on one scenario.");
        }
        System.out.println("Done.");
    }
}
