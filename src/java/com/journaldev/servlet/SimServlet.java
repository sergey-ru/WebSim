package com.journaldev.servlet;

import static bgu.sim.Properties.StringsProperties.SIMULATOR_SCENARIO_XML_PATH;
import bgu.sim.core.Simulator;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.List;
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

    @Override
    // Called when user press Upload.
    public void init() throws ServletException {
        nextTickIndex = 0;
        nextScenarioIndex = 0;
        // init sim
        initSim();

        // file
        DiskFileItemFactory fileFactory = new DiskFileItemFactory();
        File filepath = new File("c:/tmp/Sim/");
        fileFactory.setRepository(filepath);
        this.uploader = new ServletFileUpload(fileFactory);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
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
                case "loadXmlTree":
                    m = XMLTree.getInstance();
                    m.parse();
                    response.getWriter().write(m.getResult().toString());
                    break;
                case "SimulationProperty":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getSimulationProperties());

                    break;
                case "ScenarioProperty":
                    //m = XMLTree.getInstance();
                    //int scenarioIndex = Integer.parseInt(request.getParameter("index"));
                    //response.getWriter().write(m.getScenarioProperties(scenarioIndex));
                    break;
                case "InitProperty":

                    m = XMLTree.getInstance();
                    int scenarioIndex = Integer.parseInt(request.getParameter("index"));
                    response.getWriter().write(m.getInitProperties(scenarioIndex));

                    break;
                case "DeviceExLinkProperty":

                    m = XMLTree.getInstance();
                    int Index = Integer.parseInt(request.getParameter("index"));
                    String type = request.getParameter("type");
                    response.getWriter().write(m.getDeviceExLinkProperties(type, Index));

                    break;
                case "StatisticProperties":

                    String statisticNodeToCheck = request.getParameter("element");
                    statisticNodeToCheck = statisticNodeToCheck.replace("statisticlistener ", "");
                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getStatisticProperties(statisticNodeToCheck));

                    break;
                case "RoutingAlgProperties":

                    String routalgNodeToCheck = request.getParameter("element");
                    routalgNodeToCheck = routalgNodeToCheck.replace("RoutingAlgorithm ", "");
                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getRoutingAlgProperties(routalgNodeToCheck));

                    break;
                case "GetPByActionValue":

                    m = XMLTree.getInstance();
                    //String selectedName = request.getParameter("selectedName");
                    String fullClassPath = request.getParameter("fullClassPath");
                    String result = m.getPValuesByActionValue(fullClassPath);
                    response.getWriter().write(result);

                    break;
                case "SaveProperties":

                    m = XMLTree.getInstance();
                    String elementTopic = request.getParameter("elementToSave");
                    int elementIndex = Integer.parseInt(request.getParameter("index"));
                    String Info = request.getParameter("info");
                    String[] parsedInfo = Info.split(",,");
                    String BackRequest = "";

                    if (elementTopic.equalsIgnoreCase("init")) {
                        m.updateInitProperties(elementTopic, elementIndex, parsedInfo);
                    } else if (elementTopic.equalsIgnoreCase("device") || (elementTopic.equalsIgnoreCase("external")) || (elementTopic.equalsIgnoreCase("link"))) {
                        m.updateDevExLinkProperties(elementTopic, elementIndex, parsedInfo);
                    } else if (elementTopic.indexOf("statisticlistener") != -1) {
                        for (int i = 0; i < parsedInfo.length; i++) {
                            String[] keyval = parsedInfo[i].split("::");
                            BackRequest += m.updateStatisticListenerProperty(elementTopic, elementIndex, keyval[0], keyval[1]);
                        }
                    } else if (elementTopic.indexOf("routingalgorithm") != -1) {
                        for (int i = 0; i < parsedInfo.length; i++) {
                            String[] keyval = parsedInfo[i].split("::");
                            BackRequest += m.updateRoutingAlgorithmProperty(elementTopic, elementIndex, keyval[0], keyval[1]);
                        }
                    } else {
                        for (int i = 0; i < parsedInfo.length; i++) {
                            String[] keyval = parsedInfo[i].split("::");
                            m.updateElementProperty(elementTopic, elementIndex, keyval[0], keyval[1]);
                        }
                    }
                    response.getWriter().write(BackRequest);

                    break;
                case "IfTreeIsValid":
                    m = XMLTree.getInstance();
                    response.getWriter().write(m.parseAndCheckIfValid());
                    break;
            }
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            System.err.println("Error taking request from client.");
        } catch (Exception ex) {
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

                Path currentRelativePath = Paths.get("");
                String s = currentRelativePath.toAbsolutePath().toString();

                //File file = new File(("c:/tmp/Sim/") + File.separator + fileItem.getName());
                File file = new File(s + File.separator + fileItem.getName());

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
            System.err.println("Error running the simulator.");
        }
        System.out.println("Done.");
    }

    private void initSim() {
        try {
            simTest = Simulator.fromXML(SIMULATOR_SCENARIO_XML_PATH);
        } catch (Exception ex) {
            System.err.println("Error Init the simulator.");
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
            System.err.println("Error running the simulator on one scenario.");
        }
        System.out.println("Done.");
    }
}
