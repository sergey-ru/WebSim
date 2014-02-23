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
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.Iterator;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import static sim.web.utils.Constans.*;
import static bgu.sim.Properties.StringsProperties.*;

/**
 *
 * @author Keren Fruchter
 */
public class HandleRequests {

    private String _sessionId;
    private ServletFileUpload _uploader;

    public HandleRequests() {
        _uploader = null;
    }

    public void checkRequest(String theRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            XMLTree tree;
            switch (theRequest) {
                case "initSession":

                    // create  new seassion for user
                    HttpSession session = request.getSession();
                    if (session != null) {
                        _sessionId = session.getId();
                    }

                    returnResponse(response, _sessionId);

                    break;
                case "getJSONgraphData":

                    returnResponse(response, FROM_JS_DATA_PATH + _sessionId + ".json");

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

                    response.getWriter().write(Boolean.toString(SimApi.ifNextScenario()));

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
                case "DeleteScenario":

                    int ScenarioIndexToDelete = Integer.parseInt(request.getParameter("index"));

                    tree = XMLTree.getInstance();
                    tree.DeleteScenario(ScenarioIndexToDelete);

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

    /*
     Get the messages created by the simulator
     */
    private void getMessages(HttpServletResponse response) throws IOException {
        String allPaths = "";

        for (Message me : SimApi.getMessages()) {
            allPaths += me.getRoute() + ",,";
        }

        if (!allPaths.equals("")) {
            allPaths = allPaths.substring(1, allPaths.length() - 2);
        }

        response.getWriter().write(allPaths);
    }

    /*
     Create an HTML table with the statistic data.
     */
    private void getStatistics(HttpServletResponse response) throws IOException {
        Map<Integer, StatisticsDataStruct> stats = SimApi.getStatistics();
        String newTableOfStat = "<table id=\"statTable\">";

        for (int i = 0; i < stats.size(); i++) {
            StatisticsDataStruct ListAndScenarioNumber = stats.get(i);
            List<String> list = ListAndScenarioNumber.newList;

            newTableOfStat = createStatisticsStringHtmlTable(newTableOfStat, list);
        }

        newTableOfStat += "</table>";
        response.getWriter().write(newTableOfStat);
    }

    /*
     Creates a row in the HTML statistic's table.
     */
    private String createStatisticsStringHtmlTable(String allRows, List<String> list) {
        String tmpListAsString = list.toString();

        if (!tmpListAsString.contains("Scenario")) {
            allRows += "<tr><td>";

            tmpListAsString = tmpListAsString.replace(",", "</td><td>");
            tmpListAsString = tmpListAsString.replace("[", "");
            tmpListAsString = tmpListAsString.replace("]", "");

            allRows += tmpListAsString + "</td></tr>";
        }

        return allRows;
    }

    /*
     Create a JSON format of the statistics data for showing on a chart.
     */
    private void getChartStatistics(HttpServletResponse response, int scenario, int index) throws IOException {
        JSONObject obj = new JSONObject();
        Map<Integer, JSONArray> jsonArays = new HashMap<>();

        List<String> listOfStatistics = SimApi.getChartStatistics(scenario, index);

        if (listOfStatistics == null) {
            response.getWriter().write(obj.toJSONString());
            return;
        }

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

        response.getWriter().write(obj.toJSONString());
    }

    /*
     A final validator for the tree, just before running the simulator.
     */
    private void validateInitTree(HttpServletResponse response) throws IOException {
        // save xml file at server
        try {
            XMLTree.getInstance().saveTree(_sessionId);
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
            new createJsonData(_sessionId);
        } catch (Exception ex) {
            response.getWriter().write("Error creating the JsonData. " + ex.getMessage());
            return;
        }

        // validate succeed
        response.getWriter().write("true");
    }

    /*
     Saving the properties of an element that were updated in the GUI.
     */
    private void saveProperties(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        String elementTopic = request.getParameter("elementToSave");
        String indexString = request.getParameter("elementIndex");
        String Info = request.getParameter("info");
        int elementIndex = Integer.parseInt(indexString);

        String BackRequest = saveChanges(Info, elementTopic, XMLTree.getInstance(), elementIndex);
        response.getWriter().write(BackRequest);
    }

    /*
     Get the p values of an requested class
     */
    private void getPByActionValue(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        String fullClassPath = request.getParameter("fullClassPath");
        String indexStr = request.getParameter("index");
        int ElementIndex = Integer.parseInt(indexStr);

        String result = XMLTree.getInstance().getPValuesByActionValue(fullClassPath, ElementIndex);
        response.getWriter().write(result);
    }

    /*
     Loading the xml tree by its saved path, or by the root itself.
     */
    private void loadXmlTree(HttpServletRequest request, HttpServletResponse response) throws Exception, IOException {
        boolean ifByPath = Boolean.parseBoolean(request.getParameter("ifByPath"));
        XMLTree m;

        m = XMLTree.getInstance();
        m.parse(ifByPath);
        response.getWriter().write(m.getResult().toString());
    }

    /*
     Loading file. an xml or a net file.
     */
    public String loadFile(HttpServletRequest request, HttpServletResponse response, String fileType) {
        try {
            List<FileItem> fileItemsList = _uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();

            if (fileItemsIterator.hasNext()) {
                saveFileOnServer(fileItemsIterator, fileType);
            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
            return "false";
        }
        return "true";
    }

    /*
     Saving the file on the server, by the user's session id.
     */
    private void saveFileOnServer(Iterator<FileItem> fileItemsIterator, String fileType) throws Exception {
        FileItem fileItem = fileItemsIterator.next();

        // save file
        String newFileName = _sessionId;
        if (fileType.equalsIgnoreCase("netFile")) {
            newFileName += ".net";
            XMLTree m = XMLTree.getInstance();
            m.setNetFilePath(newFileName);
        } else {
            newFileName += ".xml";
        }

        File file = new File(DATA_PATH + newFileName);
        fileItem.write(file);

        // if the file is xml, validate it
        if (!fileType.equalsIgnoreCase("netFile")) {
            SimApi.setSimulatorScenarioXmlPath(file.getAbsolutePath());
            XMLTree m = XMLTree.getInstance();
            m.parse(true);
        } else {
            try {
                SimApi.parseNetFile(file);
            } catch (IOException ex) {
                throw new Exception("Net file is not a valid NET file.");
            }
        }

        // file info
        System.out.println("FileName = " + fileItem.getName());
        System.out.println("Absolute Path at server = " + file.getAbsolutePath());
    }

    /*
     Initialization for the file enviroment.
     */
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

    /*
     The actual saving changes. By giving the element name, its index, and its new information.
     */
    private String saveChanges(String Info, String elementTopic, XMLTree m, int elementIndex) {
        String[] parsedInfo = Info.split(PARAMETERS_SPLITTER);
        String BackRequest = "";

        if (elementTopic.equalsIgnoreCase(XML_INIT)) {  // init rule
            m.updateInitProperties(elementTopic, elementIndex, parsedInfo);
        } else if (elementTopic.equalsIgnoreCase(XML_DEVICE) // device/external/link rule
                || (elementTopic.equalsIgnoreCase(XML_EXTERNAL))
                || (elementTopic.equalsIgnoreCase(XML_LINK))) {

            m.updateDevExLinkProperties(elementTopic, elementIndex, parsedInfo);

        } else if (elementTopic.indexOf(XML_STATISTICLISTENER) != -1) { // statisticlistener
            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);

                if (keyval[0].toString().equals("Radio")) {
                    BackRequest += m.updateStatisticListenerOnOff(elementTopic, elementIndex, keyval[0], keyval[1]);
                } else {
                    m.updateStatisticListenerProperties(elementTopic, parsedInfo);
                }

            }
        } else if (elementTopic.indexOf(XML_ROUTINGALGORITHM) != -1) { // routingalgorithm

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

    /*
     Return a response as UTF-8.
     */
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
}
