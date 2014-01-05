/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.servlet;

import bgu.sim.api.*;
import bgu.sim.core.Routing.DB.BinaryFile;
import bgu.sim.core.Routing.DB.SqlLiteData;
import bgu.sim.core.stat.CSVListener;
import bgu.sim.core.stat.StatisticCollector;
import java.io.BufferedWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.w3c.dom.css.CSSValueList;
import static sim.web.utils.Constans.*;

/**
 *
 * @author Keren Fruchter
 */
public class HandleRequests {

    private int _nextScenarioIndex;
    private int _nextTickIndex;
    private boolean _ifInitSim;

    public HandleRequests() {
        _nextTickIndex = 0;
        _nextScenarioIndex = 0;
        _ifInitSim = false;
    }

    public void checkRequest(String theRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            XMLTree m;
            switch (theRequest) {
                case "runBaseInit":

                    SimApi.initBaseSim();

                    break;
                case "runInitRules":

                    SimApi.nextScenario();
                    returnResponse(response, Boolean.toString(SimApi.ifNextScenario()));

                    break;
                case "runOneStepInScenario":

                    boolean ifNextStep = SimApi.ifNextTick();
                    if (ifNextStep) {
                        SimApi.nextTick();
                        returnResponse(response, "true");
                    } else {
                        returnResponse(response, "false");
                    }

                    break;
                case "runFullScenario":

                    SimApi.runFullScenario();

                    break;
                case "ifExistNextScenario":

                    returnResponse(response, Boolean.toString(SimApi.ifNextScenario()));

                    break;
                case "loadXmlTree":

                    m = XMLTree.getInstance();
                    boolean ifByPath = Boolean.parseBoolean(request.getParameter("ifByPath"));
                    m.parse(ifByPath);
                    response.getWriter().write(m.getResult().toString());

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

                    m = XMLTree.getInstance();
                    String fullClassPath = request.getParameter("fullClassPath");
                    int ElementIndex = Integer.parseInt(request.getParameter("index"));
                    String result = m.getPValuesByActionValue(fullClassPath, ElementIndex);
                    response.getWriter().write(result);

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

                    m = XMLTree.getInstance();
                    String elementTopic = request.getParameter("elementToSave");
                    String indexString = request.getParameter("elementIndex");
                    int elementIndex = Integer.parseInt(indexString);
                    String Info = request.getParameter("info");
                    String BackRequest = saveChanges(Info, elementTopic, m, elementIndex);
                    response.getWriter().write(BackRequest);

                    break;
                case "IfTreeIsValid":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.validate());

                    break;
                case "NewTree":

                    m = XMLTree.getInstance();
                    response.getWriter().write(m.newTree());

                    break;
                case "SaveTree":

                    m = XMLTree.getInstance();
                    String res = m.saveTree();
                    response.getWriter().write(res);

                    break;
                case "getNodeInfo":

                    int nodeId = Integer.parseInt(request.getParameter("node"));
                    response.getWriter().write(SimApi.getNodeInfo(nodeId));

                    break;
                case "getShortestPath":

                    m = XMLTree.getInstance();
                    ArrayList<Integer> path = new ArrayList<>();

                    int source = Integer.parseInt(request.getParameter("source"));
                    int target = Integer.parseInt(request.getParameter("target"));
                    int numOfNodes = 1035;//SimApi.getNumberOfNodes();
                    BinaryFile data = BinaryFile.getInstance(numOfNodes, m.getRoutingAlgorithmDataPath());
                    int nextStep = data.readFromFile(source, target);
                    path.add(nextStep);
                    while (nextStep != target) {
                        nextStep = data.readFromFile(nextStep, target);
                        path.add(nextStep);
                    }
                    response.getWriter().write(path.toString());

                    break;
                case "getStatistics":

                    //BufferedWriter ll = CSVListener._bufferWriter2;
                    //BufferedWriter llg = ll;

                    String statistics = "{"
                            + "\"labels\" : [\"January\",\"February\",\"March\",\"April\",\"May\",\"June\",\"July\"],"
                            + "\"datasets\" : ["
                            + "{"
                            + "\"fillColor\" : \"rgba(220,220,220,0.5)\","
                            + "\"strokeColor\" : \"rgba(220,220,220,1)\","
                            + "\"pointColor\" : \"rgba(220,220,220,1)\","
                            + "\"pointStrokeColor\" : \"#fff\","
                            + "\"data\" : [65,59,90,81,56,55,40]"
                            + "}"
                            + ","
                            + "{"
                            + "\"fillColor\" : \"rgba(200,220,120,0.5)\","
                            + "\"strokeColor\" : \"rgba(200,220,120,1)\","
                            + "\"pointColor\" : \"rgba(200,220,120,1)\","
                            + "\"pointStrokeColor\" : \"#fff\","
                            + "\"data\" : [25,39,30,31,59,95,60]"
                            + "}"
                            + ","
                            + "{"
                            + "\"fillColor\" : \"rgba(110,165,220,0.5)\","
                            + "\"strokeColor\" : \"rgba(110,165,220,1)\","
                            + "\"pointColor\" : \"rgba(110,165,220,1)\","
                            + "\"pointStrokeColor\" : \"#fff\","
                            + "\"data\" : [65,19,30,67,51,13,80]"
                            + "}"
                            + ","
                            + "{"
                            + "\"fillColor\" : \"rgba(151,187,205,0.5)\","
                            + "\"strokeColor\" : \"rgba(151,187,205,1)\","
                            + "\"pointColor\" : \"rgba(151,187,205,1)\","
                            + "\"pointStrokeColor\" : \"#fff\","
                            + "\"data\" : [28,48,40,19,96,27,100]"
                            + "}"
                            + "]"
                            + "}";
                    response.getWriter().write(statistics);

                    break;
            }
        } catch (Exception ex) {
            System.err.println("Error taking request. " + ex.getMessage());
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
                    m.updateStatisticListenerProperties(elementIndex, parsedInfo);
                }

            }
        } else if (elementTopic.indexOf(XML_ROUTINGALGORITHM) != -1) {

            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);

                if (keyval[0].toString().equals("Radio")) {
                    BackRequest += m.updateRoutingAlgorithmOnOff(elementTopic, elementIndex, keyval[0], keyval[1]);
                } else {
                    m.updateRoutingAlgorithmProperties(elementIndex, parsedInfo);
                }
            }

        } else {
            for (String parsedInfo1 : parsedInfo) {
                String[] keyval = parsedInfo1.split(KEY_VAL_SPLITTER);
                m.updateElementAttribute(elementTopic, elementIndex, keyval[0], keyval[1]);
            }
        }
        return BackRequest;
    }

    private void returnResponse(HttpServletResponse response, String res) {
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
