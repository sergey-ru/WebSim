/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.servlet;

import bgu.sim.api.*;
import bgu.sim.data.Message;
import bgu.sim.data.StatisticsDataStruct;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import static sim.web.utils.Constans.*;
import static bgu.sim.Properties.StringsProperties.*;

/**
 *
 * @author Keren Fruchter
 */
public class HandleRequests {

    private int _nextScenarioIndex;
    private int _nextTickIndex;
    private boolean _ifInitSim;
    private String sessionId;
    private ServletFileUpload _uploader;

    public HandleRequests() {
        _nextTickIndex = 0;
        _nextScenarioIndex = 0;
        _ifInitSim = false;
        _uploader = null;
    }

    public void checkRequest(String theRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            XMLTree m;
            switch (theRequest) {
                case "initSession":

                    // create  new seassion for user
                    HttpSession session = request.getSession();
                    if (session == null) {
                        // Session is not created.
                    } else {
                        sessionId = session.getId();
                    }

                    returnResponse(response, sessionId);

                    break;
                case "getJSONgraphData":

                    returnResponse(response, FROM_JS_DATA_PATH + sessionId + ".json");

                    break;
                case "runBaseInit":

                    SimApi.initBaseSim();

                    break;
                case "runInitRules":

                    SimApi.nextScenario();
                    returnResponse(response, Boolean.toString(SimApi.ifNextScenario()));

                    break;
                case "runOneStepInScenario":

                    if (SimApi.ifNextTick()) {
                        SimApi.nextTick();
                        returnResponse(response, "true");
                    } else {
                        returnResponse(response, "false");
                    }

                    break;
                case "runFullScenario":

                    SimApi.runFullScenario();

                    break;
                case "getNextScenarioName":

                    response.getWriter().write(SimApi.getNextScenarioName());

                    break;
                case "getFirstScenarioName":

                    response.getWriter().write(SimApi.getFirstScenarioName());

                    break;
                case "ifExistNextScenario":

                    returnResponse(response, Boolean.toString(SimApi.ifNextScenario()));

                    break;
                case "restart":

                    SimApi.resetSim();

                    break;
                case "loadXmlTree":

                    loadXmlTree(request, response);

                    break;
                case "SimulationProperty":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getSimulationProperties());

                    break;
                case "ScenarioProperty":

                    m = XMLTree.getInstance();
                    int scenarioIndex = Integer.parseInt(request.getParameter("index"));
                    response.getWriter().write(m.getScenarioProperties(scenarioIndex));

                    break;
                case "InitProperty":

                    m = XMLTree.getInstance();
                    int initIndex = Integer.parseInt(request.getParameter("index"));
                    response.getWriter().write(m.getInitProperties(initIndex));

                    break;
                case "DeviceExLinkProperty":

                    m = XMLTree.getInstance();
                    int Index = Integer.parseInt(request.getParameter("index"));
                    String type = request.getParameter("type");
                    response.getWriter().write(m.getDeviceExLinkProperties(type, Index));

                    break;
                case "StatisticProperties":

                    String statisticNodeToCheck = request.getParameter("element");
                    statisticNodeToCheck = statisticNodeToCheck.replace(XML_STATISTICLISTENER + " ", "");
                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getStatisticProperties(statisticNodeToCheck));

                    break;
                case "RoutingAlgProperties":

                    String routalgNodeToCheck = request.getParameter("element");
                    routalgNodeToCheck = routalgNodeToCheck.replace(XML_ROUTINGALGORITHM + " ", "");
                    m = XMLTree.getInstance();
                    response.getWriter().write(m.getRoutingAlgProperties(routalgNodeToCheck));

                    break;
                case "GetPByActionValue":

                    getPByActionValue(request, response);

                    break;
                case "AddScenarioNewRule":

                    int ScenarioIndex = Integer.parseInt(request.getParameter("index"));
                    String Rule = request.getParameter("rule");

                    m = XMLTree.getInstance();
                    m.AddNewRuleToScenario(ScenarioIndex, Rule);

                    break;
                case "AddNewScenario":

                    m = XMLTree.getInstance();
                    m.AddNewScenario();

                    break;
                case "SaveProperties":

                    saveProperties(request, response);

                    break;
                case "IfTreeIsValid":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.validate());

                    break;
                case "getParserTreeErrorMessage":

                    response.getWriter().write(XMLTree.getParserErrorMessage());

                    break;
                case "NewTree":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.newTree());

                    break;
                case "validateAndInitTree":

                    validateInitTree(response);

                    break;
                case "getNodeInfo":

                    int nodeId = Integer.parseInt(request.getParameter("node"));
                    response.getWriter().write(SimApi.getNodeInfo(nodeId));

                    break;
                case "getNodesCount":

                    int countNodes = SimApi.getNodesCount();
                    response.getWriter().write(Integer.toString(countNodes));

                    break;
                case "getStatistics":
                    
                    getStatistics(response);

                    break;
                case "getMessages":
                    
                    getMessages(response);

                    break;
            }
        } catch (Exception ex) {
            System.err.println("Error: " + ex.getMessage());
        }
    }

    private void getMessages(HttpServletResponse response) throws IOException {
        String allPaths = "";
        for (Message me : SimApi.getMessages()) {
            allPaths += me.getRoute() + ",,";
        }
        if (allPaths != "") {
            allPaths = allPaths.substring(1, allPaths.length() - 2);
        }
        response.getWriter().write(allPaths);
        return;
    }

    private void getStatistics(HttpServletResponse response) throws IOException {
        String allRows = "";
        String tmpListAsString;

        Map<Integer, StatisticsDataStruct> stats = SimApi.getStatistics();
        int i = 0;
        for (i = 0; i < stats.size(); i++) {
            StatisticsDataStruct ListAndScenarioNumber = stats.get(i);
            List<String> list = ListAndScenarioNumber.newList;

            tmpListAsString = list.toString();

            if (tmpListAsString.contains("Scenario")) {
                tmpListAsString = tmpListAsString.replace("[", "");
                tmpListAsString = tmpListAsString.replace("]", "");
                if (allRows != "") {
                    allRows = allRows.substring(0, allRows.length() - 1);
                }
                allRows += tmpListAsString;

            } else {
                tmpListAsString = list.toString() + ", " + ListAndScenarioNumber.ScenarioNumber;
                tmpListAsString = tmpListAsString.replace("[", "");
                tmpListAsString = tmpListAsString.replace("]", "");

                allRows += tmpListAsString + "\r\n";
            }
        }

        allRows = allRows.substring(0, allRows.length() - 1);
        response.getWriter().write(allRows);
    }

    private void validateInitTree(HttpServletResponse response) throws IOException, Exception {
        XMLTree m;
        // save tree
        m = XMLTree.getInstance();
        String resultSaving = m.saveTree(sessionId);
        // init base ( Simulator class and read & parse netFile
        SimApi.initBaseSim();
        // create JSON
        createJsonData createJsonData = new createJsonData(sessionId);
        response.getWriter().write("true");
    }

    private void saveProperties(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        XMLTree m;
        m = XMLTree.getInstance();
        String elementTopic = request.getParameter("elementToSave");
        String indexString = request.getParameter("elementIndex");
        int elementIndex = Integer.parseInt(indexString);
        String Info = request.getParameter("info");
        String BackRequest = saveChanges(Info, elementTopic, m, elementIndex);
        response.getWriter().write(BackRequest);
    }

    private void getPByActionValue(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        XMLTree m;
        m = XMLTree.getInstance();
        String fullClassPath = request.getParameter("fullClassPath");
        int ElementIndex = Integer.parseInt(request.getParameter("index"));
        String result = m.getPValuesByActionValue(fullClassPath, ElementIndex);
        response.getWriter().write(result);
    }

    private void loadXmlTree(HttpServletRequest request, HttpServletResponse response) throws Exception, IOException {
        XMLTree m;
        m = XMLTree.getInstance();
        boolean ifByPath = Boolean.parseBoolean(request.getParameter("ifByPath"));
        m.parse(ifByPath);
        response.getWriter().write(m.getResult().toString());
    }

    public String loadNewXml(HttpServletRequest request, HttpServletResponse response) {
        try {
            List<FileItem> fileItemsList = _uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();
            while (fileItemsIterator.hasNext()) {
                FileItem fileItem = fileItemsIterator.next();

                // save file
                String newFileName = sessionId + ".xml";
                File file = new File(DATA_PATH + newFileName);
                fileItem.write(file);

                SimApi.setSimulatorScenarioXmlPath(file.getAbsolutePath());
                XMLTree m = XMLTree.getInstance();
                m.parse(true);

                // file info
                System.out.println("FileName = " + fileItem.getName());
                System.out.println("Absolute Path at server = " + file.getAbsolutePath());
            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
            return "false";
        }
        return "true";
    }

    public String loadNetFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            List<FileItem> fileItemsList = _uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();
            while (fileItemsIterator.hasNext()) {
                FileItem fileItem = fileItemsIterator.next();

                // save file
                String newFileName = sessionId + ".net";
                File file = new File(DATA_PATH + newFileName);
                fileItem.write(file);

                XMLTree m = XMLTree.getInstance();
                m.setNetFilePath(newFileName);

                // file info
                System.out.println("FileName = " + fileItem.getName());
                System.out.println("Absolute Path at server = " + file.getAbsolutePath());

            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
            return "false";
        }
        return "true";
    }

    public void initLoadingFileEnviroment() {
        // file init
        try {
            DiskFileItemFactory fileFactory = new DiskFileItemFactory();
            File filepath = new File(DATA_PATH);
            fileFactory.setRepository(filepath);
            this._uploader = new ServletFileUpload(fileFactory);

        } catch (Exception ex) {
            System.err.println("Error init new file environment. " + ex.getMessage());
        }
    }

    private String saveChanges(String Info, String elementTopic, XMLTree m, int elementIndex) {
        String[] parsedInfo = Info.split(PARAMETERS_SPLITTER);
        String BackRequest = "";

        // init rule
        if (elementTopic.equalsIgnoreCase(XML_INIT)) {
            m.updateInitProperties(elementTopic, elementIndex, parsedInfo);
        } // device/external/link rule
        else if (elementTopic.equalsIgnoreCase(XML_DEVICE)
                || (elementTopic.equalsIgnoreCase(XML_EXTERNAL))
                || (elementTopic.equalsIgnoreCase(XML_LINK))) {

            m.updateDevExLinkProperties(elementTopic, elementIndex, parsedInfo);

        } // statisticlistener
        else if (elementTopic.indexOf(XML_STATISTICLISTENER) != -1) {
            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);

                if (keyval[0].toString().equals("Radio")) {
                    BackRequest += m.updateStatisticListenerOnOff(elementTopic, elementIndex, keyval[0], keyval[1]);
                } else {
                    m.updateStatisticListenerProperties(elementTopic, parsedInfo);
                }

            }
        } else if (elementTopic.indexOf(XML_ROUTINGALGORITHM) != -1) {

            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);

                if (keyval[0].toString().equals("Radio")) {
                    BackRequest += m.updateRoutingAlgorithmOnOff(elementTopic, elementIndex, keyval[0], keyval[1]);
                } else {
                    m.updateRoutingAlgorithmProperties(elementTopic, parsedInfo);
                }
            }

        } else {
            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);
                if (keyval.length > 1) // there is key and val
                {
                    m.updateElementAttribute(elementTopic, elementIndex, keyval[0], keyval[1]);
                } else {
                    m.updateElementAttribute(elementTopic, elementIndex, keyval[0], "");
                }
            }
        }
        return BackRequest;
    }

    public void returnResponse(HttpServletResponse response, String res) {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        try {
            response.getWriter().write(res + "&#10;");
            response.getWriter().flush();
        } catch (IOException ex) {
            System.err.println("Error return response.");
        }
    }

    /*
     Init simulator
     */
    public void initSim() {
        try {
            SimApi.initBaseSim();
            _ifInitSim = true;
        } catch (Exception ex) {
            System.err.println("Error Init the simulator.");
        }
    }

    /*
     Run full simulator
     */
    protected void runFull(HttpServletRequest request, HttpServletResponse response) {
        // init sim first
        initSim();

        // run
        try {
            while (SimApi.ifNextScenario()) {
                long start = System.currentTimeMillis();

                while (SimApi.ifNextTick()) {
                    _nextTickIndex++;
                }

                _nextScenarioIndex++;
                returnResponse(response, "Scenario Number " + _nextScenarioIndex);
                String timeForRunningFull = Long.toString(System.currentTimeMillis() - start);
                returnResponse(response, timeForRunningFull);
            }

        } catch (Exception e) {
            // Simlation failed.
            returnResponse(response, "Error running the simulator.");
            System.err.println("Error running the simulator.");
        }
        System.out.println("Done.");
    }

    /*
     Run only one scenario in the simulator
     */
    private void runScenario(HttpServletRequest request, HttpServletResponse response) {
        // if sim is not init
        if (!_ifInitSim) {
            initSim();
        }

        try {
            if (SimApi.ifNextScenario()) {
                long start = System.currentTimeMillis();

                while (SimApi.ifNextTick()) {
                    _nextTickIndex++;
                }

                _nextScenarioIndex++;
                returnResponse(response, "Scenario Number " + _nextScenarioIndex);
                String timeForRunningFull = Long.toString(System.currentTimeMillis() - start);
                returnResponse(response, timeForRunningFull);

            } else {
                returnResponse(response, "No More Scenarios.");
                System.out.println("No More Scenarios.");
            }

        } catch (Exception e) {
            // Simlation failed.
            returnResponse(response, "Error running the simulator.");
            System.err.println("Error running the simulator on one scenario.");
        }
        System.out.println("Done.");
    }
}
