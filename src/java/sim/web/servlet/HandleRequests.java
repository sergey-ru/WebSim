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
import java.text.ParseException;
import java.util.HashMap;
import org.josql.QueryExecutionException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

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
            XMLTree tree;
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
                        response.getWriter().write("true");
                    } else {
                        response.getWriter().write("false");
                    }

                    break;
                case "runFullScenario":

                    SimApi.runFullScenario();

                    break;
                case "getTicksNumber":

                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.getTicksNumber());

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

                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.getSimulationProperties());

                    break;
                case "ScenarioProperty":

                    tree = XMLTree.getInstance();
                    int scenarioIndex = Integer.parseInt(request.getParameter("index"));
                    response.getWriter().write(tree.getScenarioProperties(scenarioIndex));

                    break;
                case "InitProperty":

                    tree = XMLTree.getInstance();
                    int initIndex = Integer.parseInt(request.getParameter("index"));
                    response.getWriter().write(tree.getInitProperties(initIndex));

                    break;
                case "DeviceExLinkProperty":

                    tree = XMLTree.getInstance();
                    int Index = Integer.parseInt(request.getParameter("index"));
                    String type = request.getParameter("type");
                    response.getWriter().write(tree.getDeviceExLinkProperties(type, Index));

                    break;
                case "StatisticProperties":

                    String statisticNodeToCheck = request.getParameter("element");
                    statisticNodeToCheck = statisticNodeToCheck.replace(XML_STATISTICLISTENER + " ", "");
                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.getStatisticProperties(statisticNodeToCheck));

                    break;
                case "RoutingAlgProperties":

                    String routalgNodeToCheck = request.getParameter("element");
                    routalgNodeToCheck = routalgNodeToCheck.replace(XML_ROUTINGALGORITHM + " ", "");
                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.getRoutingAlgProperties(routalgNodeToCheck));

                    break;
                case "GetPByActionValue":

                    getPByActionValue(request, response);

                    break;
                case "AddScenarioNewRule":

                    int ScenarioIndex = Integer.parseInt(request.getParameter("index"));
                    String Rule = request.getParameter("rule");

                    tree = XMLTree.getInstance();
                    tree.AddNewRuleToScenario(ScenarioIndex, Rule);

                    break;
                case "AddNewScenario":

                    tree = XMLTree.getInstance();
                    tree.AddNewScenario();

                    break;
                case "SaveProperties":

                    saveProperties(request, response);

                    break;
                case "IfTreeIsValid":

                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.validate());

                    break;
                case "getParserTreeErrorMessage":

                    response.getWriter().write(XMLTree.getParserErrorMessage());

                    break;
                case "NewTree":

                    tree = XMLTree.getInstance();
                    response.getWriter().write(tree.newTree());

                    break;
                case "validateAndInitTree":

                    validateInitTree(response);

                    break;
                case "getNodeInfo":

                    int nodeId = Integer.parseInt(request.getParameter("node"));
                    String nodeProp = request.getParameter("prop");

                    if (nodeProp == null) {
                        response.getWriter().write(SimApi.getNodeInfo(nodeId));
                    } else {
                        response.getWriter().write(SimApi.getNodeInfo(nodeId, nodeProp));
                    }

                    break;
                case "getNodesCount":

                    int countNodes = SimApi.getNodesCount();
                    response.getWriter().write(Integer.toString(countNodes));

                    break;
                case "getStatistics":

                    getStatistics(response);

                    break;
                case "getChartStatistics":

                    int statIndex = Integer.parseInt(request.getParameter("index"));
                    int scenarioNum = Integer.parseInt(request.getParameter("scenario"));
                    getChartStatistics(response, scenarioNum, statIndex);

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

        if (!"".equals(allPaths)) {
            allPaths = allPaths.substring(1, allPaths.length() - 2);
        }

        response.getWriter().write(allPaths);
    }

    private void getStatistics(HttpServletResponse response) throws IOException {
        String newTableOfStat = "<table id=\"statTable\">";
        String tmpListAsString;
        Map<Integer, StatisticsDataStruct> stats = SimApi.getStatistics();

        for (int i = 0; i < stats.size(); i++) {
            StatisticsDataStruct ListAndScenarioNumber = stats.get(i);
            List<String> list = ListAndScenarioNumber.newList;

            tmpListAsString = list.toString();
            newTableOfStat = createStatisticsStringHtmlTable(tmpListAsString, newTableOfStat, list, ListAndScenarioNumber);
        }

        //newTableOfStat = newTableOfStat.substring(0, newTableOfStat.length() - 1);
        newTableOfStat += "</table>";
        response.getWriter().write(newTableOfStat);
    }

    private String createStatisticsStringHtmlTable(String tmpListAsString, String allRows, List<String> list, StatisticsDataStruct ListAndScenarioNumber) {
        if (tmpListAsString.contains("Scenario")) {
//            tmpListAsString = tmpListAsString.replace("[", "");
//            tmpListAsString = tmpListAsString.replace("]", "");
//            if (!"".equals(allRows)) {
//                allRows = allRows.substring(0, allRows.length() - 1);
//            }
//            allRows += tmpListAsString;

        } else {
            allRows += "<tr><td>";

            tmpListAsString = list.toString();
            tmpListAsString = tmpListAsString.replace(",", "</td><td>");
            tmpListAsString = tmpListAsString.replace("[", "");
            tmpListAsString = tmpListAsString.replace("]", "");

            allRows += tmpListAsString + "</td></tr>";
        }

        return allRows;
    }

    private void getChartStatistics(HttpServletResponse response, int scenario, int index) throws IOException {
        JSONObject obj = new JSONObject();
        Map<Integer, JSONArray> jsonArays = new HashMap<>();
        // Map<Integer, StatisticsDataStruct> stats = SimApi.getStatistics();

        List<String> listOfStatistics = SimApi.getChartStatistics(scenario, index);
        if (listOfStatistics == null) {
            response.getWriter().write(obj.toJSONString());
            return;
        }

        // if (stats.size() <= index) {
        //     response.getWriter().write(obj.toJSONString());
        //     return;
        // }
        if (index > 0) {
            for (int i = 0; i < listOfStatistics.size(); i++) {
                JSONArray listJ = new JSONArray();
                listJ.add(listOfStatistics.get(i));
                jsonArays.put(i, listJ);
            }
        }

        // always add the headers to the result.
        List<String> listOfHeaders = SimApi.getChartStatistics(0, 0);
        for (int i = 0; i < listOfHeaders.size(); i++) {
            if (jsonArays.size() > 0) {
                obj.put(listOfHeaders.get(i), jsonArays.get(i));
            } else {
                obj.put(listOfHeaders.get(i), new JSONArray());
            }
        }
//
//        if (stats.size() > 1 && index > 1) {
//            StatisticsDataStruct ListAndScenarioNumber = stats.get(index);
//            List<String> list = ListAndScenarioNumber.newList;
//
//            for (int i = 0; i < list.size(); i++) {
//                JSONArray listJ = new JSONArray();
//                listJ.add(list.get(i));
//                jsonArays.put(i, listJ);
//            }
//
//        }

//        if (stats.size() > 1) {
//            StatisticsDataStruct ListAndScenarioNumber = stats.get(1);
//            List<String> list = ListAndScenarioNumber.newList;
//
//            for (int i = 0; i < list.size(); i++) {
//                if (jsonArays.size() > 0) {
//                    obj.put(list.get(i), jsonArays.get(i));
//                } else {
//                    obj.put(list.get(i), new JSONArray());
//                }
//            }
//        }
        response.getWriter().write(obj.toJSONString());
    }

    private void validateInitTree(HttpServletResponse response) throws IOException {
        // save xml file at server
        try {
            XMLTree.getInstance().saveTree(sessionId);
        } catch (Exception ex) {
            response.getWriter().write("Can't save tree. " + ex.getMessage());
            return;
        }
        
        // Validate the tree
        try {
            if (!XMLTree.getInstance().validateBool()) {
                response.getWriter().write("The tree must be valid.");
                return;
            }
        } catch (IOException ex) {
            response.getWriter().write("Error validating the tree. " + ex.getMessage());
        }
        
        // init base (Simulator class, read & parse netFile)
        try {    
            SimApi.initBaseSim();
        } catch (Exception ex) {
            response.getWriter().write("Error initialize the simulator. " + ex.getMessage());
            return;
        }

        // create JSON
        try {
            new createJsonData(sessionId);
        } catch (Exception ex) {
            response.getWriter().write("Error creating the JsonData. " + ex.getMessage());
            return;
        }

        // validate succeed
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
        String indexStr = request.getParameter("index");
        int ElementIndex = Integer.parseInt(indexStr);
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

            if (fileItemsIterator.hasNext()) {
                saveXMLFileOnServer(fileItemsIterator);
            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
            return "false";
        }
        return "true";
    }

    private void saveXMLFileOnServer(Iterator<FileItem> fileItemsIterator) throws Exception {
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

    public String loadNetFile(HttpServletRequest request, HttpServletResponse response) {
        try {
            List<FileItem> fileItemsList = _uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();

            if (fileItemsIterator.hasNext()) {
                saveNETFileOnServer(fileItemsIterator);

            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
            return "false";
        }
        return "true";
    }

    private void saveNETFileOnServer(Iterator<FileItem> fileItemsIterator) throws Exception {
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

        } catch (IOException | ClassNotFoundException | InterruptedException | QueryExecutionException e) {
            // Simlation failed.
            returnResponse(response, "Error running the simulator.");
            System.err.println("Error running the simulator. " + e.getMessage());
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
            }

        } catch (IOException | ClassNotFoundException | InterruptedException | QueryExecutionException e) {
            // Simlation failed.
            returnResponse(response, "Error running the simulator.");
            System.err.println("Error running the simulator on one scenario. " + e.getMessage());
        }
    }
}
