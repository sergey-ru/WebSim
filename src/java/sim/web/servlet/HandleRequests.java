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
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import javax.xml.parsers.ParserConfigurationException;
import org.josql.QueryExecutionException;

/**
 *
 * @author Keren Fruchter
 */
public class HandleRequests {

    private String _sessionId;
    private ServletFileUpload _uploader;
    private static HandleRequests _instance = null;

    private HandleRequests() {
        _uploader = null;
    }

    public static HandleRequests getInstance() {
        if (_instance == null) {
            _instance = new HandleRequests();

        }
        return _instance;
    }

    /*
     Handle the client requests
     */
    public void checkRequest(String theRequest, HttpServletRequest request, HttpServletResponse response) {
        try {

            Method requestMethod = this.getClass().getDeclaredMethod(theRequest, HttpServletRequest.class, HttpServletResponse.class);
            requestMethod.invoke(this, request, response);

        } catch (IllegalAccessException ex) {
            System.err.println("IllegalAccessException Error: " + ex.getCause());
        } catch (IllegalArgumentException ex) {
            System.err.println("IllegalArgumentException Error: " + ex.getCause());
        } catch (NoSuchMethodException ex) {
            System.err.println("NoSuchMethodException Error: " + ex.getCause());
        } catch (SecurityException ex) {
            System.err.println("SecurityException Error: " + ex.getCause());
        } catch (InvocationTargetException ex) {
            System.err.println("InvocationTargetException Error: " + ex.getCause());
        }
    }

    /*
     Returns the number of the toal nodes (from Net file)
     */
    private void getNodesCount(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int countNodes = SimApi.getNodesCount();
        response.getWriter().write(Integer.toString(countNodes));
    }

    /*
     Given the node id, returns its information
     */
    private void getNodeInfo(HttpServletRequest request, HttpServletResponse response) throws NumberFormatException, ClassNotFoundException, QueryExecutionException, IOException {
        int nodeId = Integer.parseInt(request.getParameter("node"));
        String nodeProp = request.getParameter("prop");

        if (nodeProp == null) {
            response.getWriter().write(SimApi.getNodeInfo(nodeId));
        } else {
            response.getWriter().write(SimApi.getNodeInfo(nodeId, nodeProp));
        }
    }

    /*
     Returns the error message from the tree parser (null/"" if the tree is valid)
     */
    private void getParserTreeErrorMessage(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.getWriter().write(XMLTree.getParserErrorMessage());
    }

    /*
     Returns boolean as string if the tree is valid
     */
    private void IfTreeIsValid(HttpServletRequest request, HttpServletResponse response) throws IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        response.getWriter().write(tree.validate());
    }

    /*
     Add new empty scenario to the xml tree
     */
    private void AddNewScenario(HttpServletRequest request, HttpServletResponse response) {
        XMLTree.getInstance().AddNewScenario();
    }

    /*
     Delete a scenario by its given index
     */
    private void DeleteScenario(HttpServletRequest request, HttpServletResponse response) throws NumberFormatException {
        int ScenarioIndexToDelete = Integer.parseInt(request.getParameter("index"));
        XMLTree.getInstance().DeleteScenario(ScenarioIndexToDelete);
    }

    /*
     Add new rule to the scenario by given the rule type and the scenario index
     */
    private void AddScenarioNewRule(HttpServletRequest request, HttpServletResponse response) throws NumberFormatException {
        String Rule = request.getParameter("rule");
        int ScenarioIndex = Integer.parseInt(request.getParameter("index"));
        XMLTree.getInstance().AddNewRuleToScenario(ScenarioIndex, Rule);
    }

    /*
     Returns the properties of the selected routing algorithm element
     */
    private void RoutingAlgProperties(HttpServletRequest request, HttpServletResponse response) throws IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        String routalgNodeToCheck = request.getParameter("element");
        routalgNodeToCheck = routalgNodeToCheck.replace(XML_ROUTINGALGORITHM + " ", "");

        response.getWriter().write(tree.getRoutingAlgProperties(routalgNodeToCheck));
    }

    /*
     Returns the properties of the selected statistics element
     */
    private void StatisticProperties(HttpServletRequest request, HttpServletResponse response) throws IOException {
        XMLTree tree;
        String statisticNodeToCheck = request.getParameter("element");
        statisticNodeToCheck = statisticNodeToCheck.replace(XML_STATISTICLISTENER + " ", "");
        tree = XMLTree.getInstance();
        response.getWriter().write(tree.getStatisticProperties(statisticNodeToCheck));
    }

    /*
     Returns the properties of the selected Device/Ex/Link
     */
    private void DeviceExLinkProperty(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        int Index = Integer.parseInt(request.getParameter("index"));
        String type = request.getParameter("type");
        response.getWriter().write(tree.getDeviceExLinkProperties(type, Index));
    }

    /*
     Returns the properties of the selected Initialization rule
     */
    private void InitProperty(HttpServletRequest request, HttpServletResponse response) throws NumberFormatException, IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        int initIndex = Integer.parseInt(request.getParameter("index"));
        response.getWriter().write(tree.getInitProperties(initIndex));
    }

    /*
     Returns the properties of the selected scenario
     */
    private void ScenarioProperty(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        int scenarioIndex = Integer.parseInt(request.getParameter("index"));
        response.getWriter().write(tree.getScenarioProperties(scenarioIndex));
    }

    /*
     Returns the properties of the simulation element
     */
    private void SimulationProperty(HttpServletRequest request, HttpServletResponse response) throws IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        response.getWriter().write(tree.getSimulationProperties());
    }

    /*
     Restart the simulator
     */
    private void restart(HttpServletRequest request, HttpServletResponse response) throws Exception {
        SimApi.resetSim();
    }

    /*
     Return true if there is one more scenario (for GUI validation)
     */
    private void ifExistNextScenario(HttpServletRequest request, HttpServletResponse response) throws QueryExecutionException, ClassNotFoundException, IOException {
        response.getWriter().write(Boolean.toString(SimApi.ifNextScenario()));
    }

    /*
     Returns the name of the first scenario (for the GUI)
     */
    private void getFirstScenarioName(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.getWriter().write(SimApi.getFirstScenarioName());
    }

    /*
     Returns the name of the next scenario (for the GUI)
     */
    private void getNextScenarioName(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.getWriter().write(SimApi.getNextScenarioName());
    }

    /*
     Return the number of the total ticks in the simulator
     */
    private void getTicksNumber(HttpServletRequest request, HttpServletResponse response) throws IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        response.getWriter().write(tree.getTicksNumber());
    }

    /*
     Run the scenario to its end (all the ticks)
     */
    private void runFullScenario(HttpServletRequest request, HttpServletResponse response) throws IOException, ClassNotFoundException, InterruptedException, QueryExecutionException {
        SimApi.runFullScenario();
    }

    /*
     Run one tick in the current scenario
     */
    private void runOneStepInScenario(HttpServletRequest request, HttpServletResponse response) throws InterruptedException, QueryExecutionException, IOException {
        if (SimApi.ifNextTick()) {
            SimApi.nextTick();
            response.getWriter().write("true");
        } else {
            response.getWriter().write("false");
        }
    }

    /*
     Run the initializations rules of the current scenario
     */
    private void runInitRules(HttpServletRequest request, HttpServletResponse response) throws IOException, QueryExecutionException, ClassNotFoundException {
        SimApi.nextScenario();
        String answer = Boolean.toString(SimApi.ifNextScenario());
        // _response.getWriter().write(answer);
        returnResponse(response, answer);
    }

    /*
     Run the basic initialization for the simulator
     */
    private void runBaseInit(HttpServletRequest request, HttpServletResponse response) throws Exception {
        SimApi.initBaseSim();
    }

    /*
     Returns the file path of the json data (graph data).
     */
    private void getJSONgraphData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.getWriter().write(FROM_JS_DATA_PATH + _sessionId + ".json");
    }

    /*
     Creates a new, empty xml tree
     */
    private void NewTree(HttpServletRequest request, HttpServletResponse response) throws ParserConfigurationException, IOException {
        XMLTree tree;
        tree = XMLTree.getInstance();
        //_response.getWriter().write(tree.newTree());
        String answer = tree.newTree();
        returnResponse(response, answer);
    }

    /*
     Set the user's session and put it in its global variable
     */
    private void initSession(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // create  new seassion for user
        HttpSession session = request.getSession();
        if (session != null) {
            _sessionId = session.getId();
        }

        response.getWriter().write(_sessionId);
    }

    /*
     Get the messages created by the simulator
     */
    private void getMessages(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
    private void getStatistics(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
     Returns 
     */
    private void getChartStatistics(HttpServletRequest request, HttpServletResponse response) throws NumberFormatException, IOException {
        int statIndex = Integer.parseInt(request.getParameter("index"));
        int scenarioNum = Integer.parseInt(request.getParameter("scenario"));
        getChartStatistics(response, scenarioNum, statIndex);
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
    private void validateAndInitTree(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
            SimApi.resetSim();
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
    private void SaveProperties(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
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
    private void GetPByActionValue(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException {
        String fullClassPath = request.getParameter("fullClassPath");
        String indexStr = request.getParameter("index");
        String type = request.getParameter("type");
        int ElementIndex = Integer.parseInt(indexStr);

        String result = XMLTree.getInstance().getPValuesByActionValue(fullClassPath, ElementIndex, type);
        response.getWriter().write(result);
    }

    /*
     Loading the xml tree by its saved path, or by the root itself.
     */
    private void loadXmlTree(HttpServletRequest request, HttpServletResponse response) throws Exception, IOException {
        XMLTree m;
        boolean ifByPath = Boolean.parseBoolean(request.getParameter("ifByPath"));

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
