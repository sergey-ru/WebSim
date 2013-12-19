/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.servlet;

/**
 *
 * @author Keren Fruchter
 */
import static bgu.sim.Properties.StringsProperties.SIMULATOR_SCENARIO_XML_PATH;
import bgu.sim.reflection.ClassesLister;
import bgu.sim.ruleEngine.property.Property;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.DOMException;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;
import static sim.web.utils.Constans.*;

public final class XMLTree {

    private Document _doc;
    private Element _root;
    private StringBuilder _result;
    private static boolean _ifSuccsessParsing;
    private Set<String> _RoutingAlgoChosen = new HashSet<>();
    private Set<String> _StatisticListenerChosen = new HashSet<>();

    int initIndex;
    int deviceIndex;
    int externalIndex;
    int linkIndex;

    private XMLTree() {
        try {
            parse(true);
        } catch (Exception ex) {
            System.err.println(ERROR_PARSING_XML);
        }
    }

    public static XMLTree getInstance() {
        return XMLTree.XMLTreeHolder.INSTANCE;
    }

    public Element getRoot() {
        return _root;
    }

    /*
     Get XML HTML Code
     */
    public StringBuilder getResult() {
        if (ifSuccsessParsing()) {
            return _result;
        } else {
            return new StringBuilder(ERROR_PARSING_XML);
        }
    }

    public static boolean ifSuccsessParsing() {
        return _ifSuccsessParsing;
    }

    // ---------- UPDATE ELEMENTS ----------------
    /*
     Given element name, its index, update its propery with the given value.
     */
    public void updateElementAttribute(String Element, int Index, String Property, String Value) {
        try {
            Node ElementNode = _root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);
            ElementNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property)).setNodeValue(Value);
        } catch (Exception ex) {
            System.err.println("Cant find " + Element + ". " + ex.getMessage());
        }
    }

    void AddNewRuleToScenario(int ScenarioIndex, String Rule) {
        Node scenarioNode = _root.getElementsByTagName(XML_SCENARIO).item(ScenarioIndex - 1);

        if (Rule.contains(TREEVIEW_DEVICE)) {
            Rule = XML_DEVICE;
        } else if (Rule.contains(TREEVIEW_EXTERNAL)) {
            Rule = XML_EXTERNAL;
        } else if (Rule.contains(TREEVIEW_LINK)) {
            Rule = XML_LINK;
        } else if (Rule.contains(TREEVIEW_INIT)) {
            Rule = XML_INIT;
        }

        // Create statisticlistener
        Element newRuleNode = _doc.createElement(Rule);
        newRuleNode.setAttribute(ATTRIBUTE_NAME, "");

        // handle rule type
        switch (Rule) {
            case XML_EXTERNAL:
            case XML_LINK:
            case XML_DEVICE: {
                Element order = _doc.createElement(XML_ORDER);
                order.setAttribute(ATTRIBUTE_VALUE, "");
                Element select = _doc.createElement(XML_SELECT);
                select.setAttribute(ATTRIBUTE_VALUE, "");
                Element action = _doc.createElement(XML_ACTION);
                action.setAttribute(ATTRIBUTE_VALUE, "");
                newRuleNode.appendChild(order);
                newRuleNode.appendChild(select);
                newRuleNode.appendChild(action);
                break;
            }
            case XML_INIT: {
                Element action = _doc.createElement(XML_ACTION);
                action.setAttribute(ATTRIBUTE_VALUE, "");
                newRuleNode.appendChild(action);
                break;
            }
        }
        // append new rule to scenario
        scenarioNode.appendChild(newRuleNode);
    }

    void AddNewScenario() {
        Node ExperimentNode = _root;

        // create new scenario
        Element scenario = _doc.createElement(XML_SCENARIO);
        scenario.setAttribute(ATTRIBUTE_NAME, "");

        ExperimentNode.appendChild(scenario);
    }

    /*
     Given an array of properties and values, and add them to the statisticlistener
     */
    void updateStatisticListenerProperties(int Index, String[] keyValArr) {
        Node statisticListenerNode = _root.getElementsByTagName(XML_STATISTICLISTENER).item(Index - 1);

        if (statisticListenerNode != null) {
            // remove properties
            NodeList childrenDelete = statisticListenerNode.getChildNodes();
            for (int j = 0; j < childrenDelete.getLength(); j++) {
                statisticListenerNode.removeChild(childrenDelete.item(j));
            }
            // add all p
            for (int i = 1; i < keyValArr.length; i++) {
                // start from 1 because 0 is not a property, its on/off
                String[] keyAndVal = keyValArr[i].split(KEY_VAL_SPLITTER);
                String key = keyAndVal[0];
                String val;

                if (keyAndVal.length > 1) {
                    val = keyAndVal[1];
                } else {
                    val = "";
                }

                // create p
                Element p = _doc.createElement(XML_PROPERTY);
                p.setAttribute(ATTRIBUTE_KEY, key);
                p.setAttribute(ATTRIBUTE_VALUE, val);

                // add new p to statisticlistener
                statisticListenerNode.appendChild(p);
            }
        }
    }

    // NEED TO BE CHECKED
    void updateRoutingAlgorithmProperties(int Index, String[] keyValArr) {
        Node routingAlgorithmNode = _root.getElementsByTagName(XML_ROUTINGALGORITHM).item(Index - 1);

        if (routingAlgorithmNode != null) {
            // remove properties
            NodeList childrenDelete = routingAlgorithmNode.getChildNodes();
            for (int j = 0; j < childrenDelete.getLength(); j++) {
                routingAlgorithmNode.removeChild(childrenDelete.item(j));
            }
            // add all p
            for (int i = 1; i < keyValArr.length; i++) {
                // start from 1 because 0 is not a property, its on/off
                String[] keyAndVal = keyValArr[i].split(KEY_VAL_SPLITTER);
                String key = keyAndVal[0];
                String val;

                if (keyAndVal.length > 1) {
                    val = keyAndVal[1];
                } else {
                    val = "";
                }

                // create p
                Element p = _doc.createElement(XML_PROPERTY);
                p.setAttribute(ATTRIBUTE_KEY, key);
                p.setAttribute(ATTRIBUTE_VALUE, val);

                // add new p to statisticlistener
                routingAlgorithmNode.appendChild(p);
            }
        }
    }

    /*
     between all the StatisticListener classes, set the chosen to on or off
     */
    String updateStatisticListenerOnOff(String Element, int Index, String Property, String Value) {
        String fullPathClass = Element.replace(XML_STATISTICLISTENER + " ", "");

        // handle on/off
        switch (Value) {
            case "off": {

                // delete the statisticlistener child
                Node simulationNode = _root.getElementsByTagName(XML_SIMULATION).item(0);
                Node statisticListenerNode = _root.getElementsByTagName(XML_STATISTICLISTENER).item(Index - 1);
                if (statisticListenerNode != null) {
                    simulationNode.removeChild(statisticListenerNode);
                }
                // remove from the selected statisticlistener list
                _StatisticListenerChosen.remove(fullPathClass);

                // for vi sign
                return "remove " + Element;
            }
            case "on": {
                //check if it already on
                if (!_StatisticListenerChosen.contains((fullPathClass))) {
                    // add new statisticlistener element
                    Node SimulationNode = _root.getElementsByTagName(XML_SIMULATION).item(0);
                    // create statisticlistener
                    Element newStatisticListenerNode = _doc.createElement(XML_STATISTICLISTENER);
                    newStatisticListenerNode.setAttribute(ATTRIBUTE_VALUE, fullPathClass);

                    // add statisticlistener to simulation.
                    // MUST BE FIRST CHILD
                    NodeList routhingAlgoNodes = _root.getElementsByTagName(XML_ROUTINGALGORITHM);
                    if (routhingAlgoNodes.getLength() > 0) {
                        SimulationNode.insertBefore(newStatisticListenerNode, routhingAlgoNodes.item(0));
                    } else {
                        SimulationNode.appendChild(newStatisticListenerNode);
                    }

                    // add to the selected statisticlistener list
                    _StatisticListenerChosen.add(fullPathClass);
                    // for vi sign
                    return "add " + Element;
                }
            }
        }
        return "";
    }

    /*
     between all the RoutingAlgorithm classes, set the chosen to on or off
     */
    String updateRoutingAlgorithmOnOff(String Element, int Index, String Property, String Value) {
        String fullPathClass = Element.replace(XML_ROUTINGALGORITHM + " ", "");

        // handle on/off
        switch (Value) {
            case "off": {

                // delete the routingalgorithm child
                Node simulationNode = _root.getElementsByTagName(XML_SIMULATION).item(0);
                Node routingAlgorithmNode = _root.getElementsByTagName(XML_ROUTINGALGORITHM).item(Index - 1);
                if (routingAlgorithmNode != null) {
                    simulationNode.removeChild(routingAlgorithmNode);
                }
                // remove from the selected routingalgorithm list
                _RoutingAlgoChosen.remove(fullPathClass);

                // for vi sign
                return "remove " + Element;
            }
            case "on": {
                //check if it already on
                if (!_RoutingAlgoChosen.contains((fullPathClass))) {
                    // add new routingalgorithm element
                    Node SimulationNode = _root.getElementsByTagName(XML_SIMULATION).item(0);
                    // create routingalgorithm
                    Element newRoutingAlgorithmNode = _doc.createElement(XML_ROUTINGALGORITHM);
                    newRoutingAlgorithmNode.setAttribute(ATTRIBUTE_VALUE, fullPathClass);

                    // add routingalgorithm to simulation.
                    // MUST BE AFTER STATISTICLISTENER
                    //NodeList routhingAlgoNodes = _root.getElementsByTagName(XML_ROUTINGALGORITHM);
                    //if (routhingAlgoNodes.getLength() > 0) {
                    //    SimulationNode.insertBefore(newRoutingAlgorithmNode, routhingAlgoNodes.item(0));
                    //} else {
                    SimulationNode.appendChild(newRoutingAlgorithmNode);
                    //}

                    // add to the selected statisticlistener list
                    _RoutingAlgoChosen.add(fullPathClass);
                    // for vi sign
                    return "add " + Element;
                }
            }
        }
        return "";
    }

    /*
     Given Init index and list of ALL its properties, update its attributs, and its action.
     */
    void updateInitProperties(String Element, int Index, String[] parsedInfo
    ) {
        Node InitNode = _root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);

        // save action (first)
        String[] newActionValue = parsedInfo[0].split(KEY_VAL_SPLITTER);
        Node action = InitNode.getFirstChild(); // one action
        action.getAttributes().item(0).setNodeValue(newActionValue[1]);

        // save init name (second)
        String[] Property = parsedInfo[1].split(KEY_VAL_SPLITTER);
        InitNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property[0])).setNodeValue(Property[1]);

        // --- save all p (third and so on...)---
        // delete all children first
        NodeList childrenDelete = action.getChildNodes();
        for (int j = 0; j < childrenDelete.getLength(); j++) {
            action.removeChild(childrenDelete.item(j));
        }
        // add all p
        for (int i = 2; i < parsedInfo.length; i++) {
            String[] info = parsedInfo[i].split(KEY_VAL_SPLITTER);
            String key = info[0];
            String val = info[1];

            // create p
            Element p = _doc.createElement(XML_PROPERTY);
            p.setAttribute(ATTRIBUTE_KEY, key);
            p.setAttribute(ATTRIBUTE_VALUE, val);

            // add the new p to the action
            action.appendChild(p);
        }
    }

    /*
     Given Element, index and list of ALL its properties, update its attributs and children.
     */
    void updateDevExLinkProperties(String Element, int Index, String[] parsedInfo
    ) {
        Node InitNode = _root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);

        // save action (first)
        String[] newActionValue = parsedInfo[0].split(KEY_VAL_SPLITTER);
        NodeList allDevChildren = InitNode.getChildNodes();
        Node order = allDevChildren.item(0); // order
        Node select = allDevChildren.item(1); // select
        Node action = allDevChildren.item(2); // action

        // set action path
        action.getAttributes().item(0).setNodeValue(newActionValue[1]);

        String[] Property;
        // save init name (second)
        Property = parsedInfo[1].split(KEY_VAL_SPLITTER);
        InitNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property[0])).setNodeValue(Property[1]);

        // order 3
        Property = parsedInfo[2].split(KEY_VAL_SPLITTER);
        order.getAttributes().item(0).setNodeValue(Property[1]);

        // select 4
        Property = parsedInfo[3].split(KEY_VAL_SPLITTER);
        select.getAttributes().item(0).setNodeValue(Property[1]);

        // --- save all p (5 and so on...) ---
        // delete all children first
        NodeList childrenDelete = action.getChildNodes();
        for (int j = 0; j < childrenDelete.getLength(); j++) {
            action.removeChild(childrenDelete.item(j));
        }
        // add all p
        for (int i = 4; i < parsedInfo.length; i++) {
            String[] info = parsedInfo[i].split(KEY_VAL_SPLITTER);
            String key = info[0];
            String val = info[1];

            // create p
            Element p = _doc.createElement(XML_PROPERTY);
            p.setAttribute(ATTRIBUTE_KEY, key);
            p.setAttribute(ATTRIBUTE_VALUE, val);

            action.appendChild(p);
        }
    }

    /*
     Create new XML template and insert to root
     */
    String newTree() {
        // remove all children
        NodeList rootChildren = _root.getChildNodes();
        System.out.println(rootChildren.getLength());
        for (int i = 0; i <= rootChildren.getLength(); i++) {
            System.out.println(rootChildren.item(i).getNodeName());
            _root.removeChild(rootChildren.item(i));
        }
        if (_root.getLastChild() != null) {
            _root.removeChild(_root.getLastChild());
        }

        // create simulation
        Element simulation = _doc.createElement(XML_SIMULATION);
        simulation.setAttribute(SIMULATION_PROPERTY_TICKS, "");
        simulation.setAttribute(SIMULATION_PROPERTY_SEED, "");
        simulation.setAttribute(SIMULATION_PROPERTY_NETFILEPATH, "");
        simulation.setAttribute(SIMULATION_PROPERTY_SYSTEMFOLDER, "");

        // create StatisticListener - NOOOOO VERYYY BADDDDDD
        //Element StatisticListener = doc.createElement(XML_STATISTICLISTENER);
        //StatisticListener.setAttribute(ATTRIBUTE_VALUE, "");
        // add StatisticListener ti simulation
        //simulation.appendChild(StatisticListener);
        // create scenario
        Element Scenario = _doc.createElement(XML_SCENARIO);
        Scenario.setAttribute(ATTRIBUTE_NAME, "");

        _root.appendChild(simulation);
        _root.appendChild(Scenario);

        try {
            parse(false);
        } catch (Exception ex) {
            return ERROR_PARSING_XML;
        }
        return getResult().toString();
    }
        // --- END UPDATE --------------

    // --- GET PROPERTIES -------------
    public String getStatisticProperties(String name) {
        //System.out.println(name);
        String res = "";
        ClassesLister allActions = ClassesLister.getInstance();
        List<Property> pList;

        // first - chosen or not
        if (_StatisticListenerChosen.contains(name)) {
            res += "Chosen";
            res += KEY_VAL_SPLITTER;
            res += "true";
            res += PARAMETERS_SPLITTER;
        } else {
            res += "Chosen";
            res += KEY_VAL_SPLITTER;
            res += "false";
            res += PARAMETERS_SPLITTER;
        }

        // second and so, the rest
        try {
            pList = allActions.getClassProperties(name);
            for (Property property : pList) {
                String pKey = upperFirstLetter(property.getMetadata().getName());
                String pVal = getPValueByItsKey(XML_STATISTICLISTENER, name, pKey, -1);

                res += pKey; // upper first letter
                res += KEY_VAL_SPLITTER;
                res += pVal;
                res += PARAMETERS_SPLITTER; // only one property
            }
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            //Logger.getLogger(XMLTree.class.getName()).log(Level.SEVERE, null, ex);
        }

        return res;
    }

    public String getRoutingAlgProperties(String name) {
        //System.out.println(name);
        String res = "";
        ClassesLister allActions = ClassesLister.getInstance();
        List<Property> pList;

        // first - chosen or not
        if (_RoutingAlgoChosen.contains(name)) {
            res += "Chosen";
            res += KEY_VAL_SPLITTER;
            res += "true";
            res += PARAMETERS_SPLITTER;
        } else {
            res += "Chosen";
            res += KEY_VAL_SPLITTER;
            res += "false";
            res += PARAMETERS_SPLITTER;
        }

        // second and so, the rest
        try {
            pList = allActions.getClassProperties(name);
            for (Property property : pList) {
                String pKey = upperFirstLetter(property.getMetadata().getName());
                String pVal = getPValueByItsKey(XML_ROUTINGALGORITHM, name, pKey, -1);

                res += pKey; // upper first letter
                res += KEY_VAL_SPLITTER;
                res += pVal;
                res += PARAMETERS_SPLITTER; // only one property
            }
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            //Logger.getLogger(XMLTree.class.getName()).log(Level.SEVERE, null, ex);
        }

        return res;
    }

    public String getSimulationProperties() {
        String res = "";
        NodeList li = _root.getElementsByTagName(XML_SIMULATION);
        Node simulation = li.item(0);
        NamedNodeMap fres = simulation.getAttributes();
        for (int i = 0; i < fres.getLength(); i++) {
            res += upperFirstLetter(fres.item(i).getNodeName());
            res += KEY_VAL_SPLITTER;
            res += fres.item(i).getNodeValue();
            res += PARAMETERS_SPLITTER;
        }
        return res;
    }

    public String getScenarioProperties(int index) {
        String res = "";
        NodeList li = _root.getElementsByTagName(XML_SCENARIO);
        Node simulation = li.item(index - 1); // cuz it is array
        NamedNodeMap fres = simulation.getAttributes();
        for (int i = 0; i < fres.getLength(); i++) {
            res += upperFirstLetter(fres.item(i).getNodeName()); // upper first letter
            res += KEY_VAL_SPLITTER;
            res += fres.item(i).getNodeValue();
        }
        return res;
    }

    public String getInitProperties(int index) {
        String res = "";
        NodeList allInit = _root.getElementsByTagName(XML_INIT);
        Node initNode = allInit.item(index - 1); // cuz it is array

        NamedNodeMap initAtt = initNode.getAttributes();
        // name
        for (int i = 0; i < initAtt.getLength(); i++) {
            res += upperFirstLetter(initAtt.item(i).getNodeName()); // upper first letter
            res += KEY_VAL_SPLITTER;
            res += initAtt.item(i).getNodeValue();
        }
        res += PARAMETERS_SPLITTER;

        // actions
        ClassesLister allActions = ClassesLister.getInstance();
        List<Class> actionsList = allActions.GetInitActions();

        for (Class action : actionsList) {
            res += "ActionList"; // upper first letter
            res += KEY_VAL_SPLITTER;
            res += action.getName();
            res += PARAMETERS_SPLITTER;
        }

        // must be one action
        NodeList children = initNode.getChildNodes();
        // the one action
        Node oneAction = children.item(0);

        // get the value attribute
        NamedNodeMap tmp = oneAction.getAttributes();
        for (int i = 0; i < tmp.getLength(); i++) {
            res += upperFirstLetter(tmp.item(i).getNodeName()); // upper first letter
            res += KEY_VAL_SPLITTER;
            res += tmp.item(i).getNodeValue();
            //res += ","; // only one property
        }
        return res;
    }

    String getPValuesByActionValue(String fullClassPath, int index) {
        ClassesLister allActions = ClassesLister.getInstance();
        String res = "";
        String pKey;
        String pVal;
        try {
            List<Property> pList = allActions.getClassProperties(fullClassPath);
            for (int i = 0; i < pList.size(); i++) {
                pKey = upperFirstLetter(pList.get(i).getMetadata().getName());
                pVal = getPValueByItsKey(XML_ACTION, fullClassPath, pKey, index);

                res += pKey; // upper first letter
                res += KEY_VAL_SPLITTER;
                res += pVal;
                res += PARAMETERS_SPLITTER; // only one property
            }
        } catch (Exception ex) {
            return ERROR_PARSING_XML;
        }
        return res;
    }

    public String getPValueByItsKey(String underElement, String ClassName, String Key, int index) {
        Node action = null;
        NodeList li = _root.getElementsByTagName(underElement);

        if (index != -1) {
            Node initNode = _root.getElementsByTagName(XML_INIT).item(index - 1); //?
            action = initNode.getFirstChild();
        } else {
            // find element by its class
            for (int i = 0; i < li.getLength(); i++) {
                System.out.println(li.item(i).getAttributes().item(0).getNodeValue());
                if (li.item(i).getAttributes().item(0).getNodeValue().equalsIgnoreCase(ClassName)) {
                    action = li.item(i);
                    break;
                }
            }
        }

        if (action != null) {
            NodeList pList = action.getChildNodes();
            System.out.println(pList.getLength());
            for (int i = 0; i < pList.getLength(); i++) {
                NamedNodeMap attMap = pList.item(i).getAttributes();
                for (int j = 0; j < attMap.getLength(); j++) {
                    System.out.println(attMap.item(j).getNodeValue());
                    if (attMap.item(j).getNodeValue().equalsIgnoreCase(Key)) {
                        return attMap.item(j + 1).getNodeValue();
                    }
                }
            }
        }
        return "";
    }

    String getDeviceExLinkProperties(String type, int index) {
        String res = "";
        NodeList li = _root.getElementsByTagName(type);
        Node initNode = li.item(index - 1); // cuz it is array

        NamedNodeMap initAtt = initNode.getAttributes();
        // name
        for (int i = 0; i < initAtt.getLength(); i++) {
            res += upperFirstLetter(initAtt.item(i).getNodeName()); // upper first letter
            res += KEY_VAL_SPLITTER;
            res += initAtt.item(i).getNodeValue();
        }
        res += PARAMETERS_SPLITTER;

        // Order & Select
        NodeList Children = initNode.getChildNodes();
        for (int i = 0; i < Children.getLength(); i++) {
            Node devExLink = Children.item(i);
            String typeName = devExLink.getNodeName();
            String val = devExLink.getAttributes().item(0).getNodeValue(); // one value
            val = val.replace("\"", "\'");
            res += upperFirstLetter(typeName);
            res += KEY_VAL_SPLITTER;
            res += val;
            res += PARAMETERS_SPLITTER; // only one property
        }

        // actions
        List<Class> actionsList = null;
        ClassesLister allActions = ClassesLister.getInstance();
        switch (type) {
            case XML_DEVICE:
                actionsList = allActions.GetDeviceActions();
                break;
            case XML_EXTERNAL:
                actionsList = allActions.GetExternalActions();
                break;
            case XML_LINK:
                actionsList = allActions.GetLinkActions();
                break;
        }

        for (Class action : actionsList) {
            res += "ActionList"; // upper first letter
            res += KEY_VAL_SPLITTER;
            res += action.getName();
            res += PARAMETERS_SPLITTER;
        }

        // must be one action
        NodeList children = initNode.getChildNodes();
        // the one action after order and select
        Node child = children.item(2);

        // get the value attribute. selected action.
        NamedNodeMap tmp = child.getAttributes();
        for (int i = 0; i < tmp.getLength(); i++) {
            res += upperFirstLetter(tmp.item(i).getNodeName()); // upper first letter
            res += KEY_VAL_SPLITTER;
            res += tmp.item(i).getNodeValue();
        }

        return res;
    }
    // --- END PROPERTIES -------------

    /*
     Parse XML tree to htm,l treeview code
     */
    public void parse(boolean ifByPath) throws Exception {
        Element experiment;

        // init
        parseInitialization();

        try {
            // by Path or by the Root
            if (ifByPath) {
                experiment = initParseByXmlFile();

            } else {
                experiment = _root;
            }

            // check if root is XML_EXPERIMENT
            validateName(experiment, XML_EXPERIMENT);
            addHtmlHeader(TREEVIEW_EXPERIMENT, XML_EXPERIMENT, false);

            // experiment childrens
            NodeList experimentChildren = experiment.getChildNodes();
            Element simulation = (Element) experiment.getFirstChild();

            validateName(simulation, XML_SIMULATION);
            addHtmlHeader(TREEVIEW_SIMULATION, XML_SIMULATION, false);

            // check simulation childrens
            NodeList simulationChildren = simulation.getChildNodes();

            //validateMinNumOfChildren(simulationChildren, 1);
            if (simulationChildren.getLength() > 0) {
                // check that first child of Simulation is StatisticListener
                validateName((Element) simulationChildren.item(0), XML_STATISTICLISTENER);
                parseStatisticAndRouting(simulationChildren);
            }

            // Now we will add the rest of the classes that implements "StatisticListener".
            AddAllClassesThatImpStatisticListener();

            // Now we will add the rest of the classes that implements "RoutingAlgorithm".
            AddAllClassesThatImpRoutingAlgorithm();

            // simulation end code
            addEndHtmlHeader();

            // checking that there is one Simulation and one and more Scenarios
            validateMinNumOfChildren(experimentChildren, 2);

            // validate name of one scenario
            Node Scenario = experiment.getFirstChild().getNextSibling();
            validateName((Element) Scenario, XML_SCENARIO);

            // parse all scenarios
            if (!parseScenarios(experimentChildren)) {
                return;
            }

            // experiment end code
            addEndHtmlHeader();

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            _ifSuccsessParsing = false;
        }
    }

    private boolean parseScenarios(NodeList ExperimentNodeChildren) throws Exception {

        // go over the scenarios
        for (int i = 1; i < ExperimentNodeChildren.getLength(); i++) {
            Element currScenario = (Element) ExperimentNodeChildren.item(i);
            // check if it is Scenario
            validateName(currScenario, XML_SCENARIO);
            // 2 Scenario
            addHtmlHeader(TREEVIEW_SCENARIO, XML_SCENARIO + i, false);
            // check Scenario childrens
            NodeList ScenarioNodeChildren = currScenario.getChildNodes();
            for (int j = 0; j < ScenarioNodeChildren.getLength(); j++) {
                Node scenarioChild = ScenarioNodeChildren.item(j);
                // check Init (0..*)
                if (scenarioChild.getNodeName().equalsIgnoreCase(XML_INIT)) {
                    parseInit(scenarioChild, initIndex);
                    initIndex++;
                }
                // check Device/External/Link (0..*)
                if (scenarioChild.getNodeName().equalsIgnoreCase(XML_DEVICE)
                        || scenarioChild.getNodeName().equalsIgnoreCase(XML_EXTERNAL)
                        || scenarioChild.getNodeName().equalsIgnoreCase(XML_LINK)) {
                    if (!parseDevExtLink(scenarioChild)) {
                        return false;
                    }
                }
            }
            // 2 Scenario end code
            addEndHtmlHeader();
        }
        return true;
    }

    private void parseInit(Node scenarioChild, int initIndex) throws Exception {
        NodeList initChildren = scenarioChild.getChildNodes();

        addHtmlNode(TREEVIEW_INIT, XML_INIT + initIndex, false);

        // must be exactly one action
        validateMinNumOfChildren(initChildren, 1);
        validateMaxNumOfChildren(initChildren, 1);

        // check action name
        Element action = (Element) initChildren.item(0);
        validateName(action, XML_ACTION);
    }

    private boolean parseDevExtLink(Node scenarioChild) throws Exception {
        switch (scenarioChild.getNodeName()) {
            case XML_EXTERNAL:
                addHtmlNode(TREEVIEW_EXTERNAL, scenarioChild.getNodeName() + externalIndex, false);
                externalIndex++;
                break;
            case XML_DEVICE:
                addHtmlNode(TREEVIEW_DEVICE, scenarioChild.getNodeName() + deviceIndex, false);
                deviceIndex++;
                break;
            case XML_LINK:
                addHtmlNode(TREEVIEW_LINK, scenarioChild.getNodeName() + linkIndex, false);
                linkIndex++;
                break;
        }
        NodeList DeviceExternalLinkChildren = scenarioChild.getChildNodes();
        // must have 1 Order 1 Select 1 Action. Length must be exactly 3.
        validateMinNumOfChildren(DeviceExternalLinkChildren, 3);
        validateMaxNumOfChildren(DeviceExternalLinkChildren, 3);
        // check first is 1 Order
        // check second is 1 select
        // check third is 1 action
        if (!DeviceExternalLinkChildren.item(0).getNodeName().equalsIgnoreCase(XML_ORDER)
                || !DeviceExternalLinkChildren.item(1).getNodeName().equalsIgnoreCase(XML_SELECT)
                || !DeviceExternalLinkChildren.item(2).getNodeName().equalsIgnoreCase(XML_ACTION)) {
            _ifSuccsessParsing = false;
            return false;
        }
        Element action = (Element) DeviceExternalLinkChildren.item(2);
        removeWhitespaceNodes(action);
        return true;
    }

    private void parseStatisticAndRouting(NodeList SimulationNodeChildren) throws DOMException {
        // check statisticlistener and routingAlgorithms

        for (int i = 0; i < SimulationNodeChildren.getLength(); i++) {
            Node currChild = SimulationNodeChildren.item(i);
            switch (currChild.getNodeName()) {
                case XML_STATISTICLISTENER_LOW:
                    // Get Class Name
                    String StatId = currChild.getAttributes().item(0).getNodeValue().toString();
                    // Add as chosen class
                    if (!"".equals(StatId)) {
                        _StatisticListenerChosen.add(StatId);
                    }
                    break;
                case XML_ROUTINGALGORITHM_LOW:
                    // Get Class Name
                    String RoutId = currChild.getAttributes().item(0).getNodeValue().toString();
                    // Add as chosen class
                    if (!"".equals(RoutId)) {
                        _RoutingAlgoChosen.add(RoutId);
                    }
                    break;
                case XML_STATISTICLISTENER:
                    // Get Class Name
                    String StatIda = currChild.getAttributes().item(0).getNodeValue().toString();
                    // Add as chosen class
                    if (!"".equals(StatIda)) {
                        _StatisticListenerChosen.add(StatIda);
                    }
                    break;
                case XML_ROUTINGALGORITHM:
                    // Get Class Name
                    String RoutIdaa = currChild.getAttributes().item(0).getNodeValue().toString();
                    // Add as chosen class
                    if (!"".equals(RoutIdaa)) {
                        _RoutingAlgoChosen.add(RoutIdaa);
                    }
                    break;
                default:
                    _ifSuccsessParsing = false;
                    return;
            }
        }
    }

    private Element initParseByXmlFile() throws SAXException, ParserConfigurationException, IOException {
        // by path
        Element experiment;
        File fXmlFile = new File(SIMULATOR_SCENARIO_XML_PATH);
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
        _doc = dBuilder.parse(fXmlFile);
        _doc.getDocumentElement().normalize();
        experiment = _doc.getDocumentElement();
        _root = experiment;
        return experiment;
    }

    private void parseInitialization() {
        _result = new StringBuilder("");
        _ifSuccsessParsing = true;
        _StatisticListenerChosen.clear();
        _RoutingAlgoChosen.clear();

        initIndex = 1;
        deviceIndex = 1;
        externalIndex = 1;
        linkIndex = 1;
    }

    // --- HELPERS -------------
    public static void removeWhitespaceNodes(Element e) {
        NodeList children = e.getChildNodes();
        for (int i = children.getLength() - 1; i >= 0; i--) {
            Node child = children.item(i);
            if (child instanceof Text && ((Text) child).getData().trim().length() == 0) {
                e.removeChild(child);
            } else if (child instanceof Element) {
                removeWhitespaceNodes((Element) child);
            }
        }
    }

    private void validateName(Element experiment, String name) throws Exception {
        removeWhitespaceNodes(experiment);
        if (!experiment.getNodeName().equalsIgnoreCase(name)) {
            _ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMinNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() < i) {
            _ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMaxNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() > i) {
            _ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void addHtmlHeader(String text, String id, boolean Selected) {
        _result.append("<li><span id='")
                .append(id)
                .append("'>")
                .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                .append(id)
                .append("')\" id=\"a_href_")
                .append(id)
                .append("\">")
                .append(text);

        if (Selected) {
            // add a icon next to text
            _result.append("&#10004;");
        }
        _result.append("</a>");

        if (text.contains(TREEVIEW_SCENARIO) || text.contains(TREEVIEW_EXPERIMENT)) {
            _result.append("<button type=\"button\" id=\"").append(text).append("_").append(id).append("_delete\" onclick=\"deleteAndAddRule(this)\" class=\"close\" aria-hidden=\"true\" data-target=\"#myModal\">&times;</button>");
            _result.append("<button type=\"button\" id=\"").append(text).append("_").append(id).append("_add\"    onclick=\"deleteAndAddRule(this)\" class=\"close\" aria-hidden=\"true\" data-target=\"#myModal\">+</button>");
        }
        _result.append("</span><ul>");
    }

    private void addHtmlNode(String text, String id, boolean Selected) {
        _result.append("<li><span id='")
                .append(id)
                .append("'>")
                .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                .append(id)
                .append("')\" id=\"a_href_")
                .append(id)
                .append("')\">")
                .append(text);

        if (Selected) {
            _result.append("&#10004;</a>");
        } else {
            _result.append("</a>");
        }

        if (text.contains(XML_INIT) || text.contains(XML_DEVICE) || text.contains(XML_EXTERNAL) || text.contains(XML_LINK)) {
            _result.append("<button type=\"button\" id=\"")
                    .append(text)
                    .append("_")
                    .append(id)
                    .append("_delete\" class=\"close\" onclick=\"deleteAndAddRule(this)\" aria-hidden=\"true\" data-target=\"#myModal\">&times;</button>");
        }
        _result.append("</span></li>");
    }

    private void addEndHtmlHeader() {
        _result.append("</ul></li>");
    }

    private void AddAllClassesThatImpStatisticListener() {
        // Now we will add the rest of the classes that implements XML_STATISTICLISTENER.
        ClassesLister allClassesImpSt = ClassesLister.getInstance();
        List<Class> m = allClassesImpSt.GetStatisticListeners();

        for (Class class1 : m) {
            String id = class1.getName();
            if (_StatisticListenerChosen.contains(id)) {
                addHtmlNode(getNameOfClass(id), XML_STATISTICLISTENER + " " + id, true);
            } else {
                addHtmlNode(getNameOfClass(id), XML_STATISTICLISTENER + " " + id, false);
            }
        }
    }

    private void AddAllClassesThatImpRoutingAlgorithm() {
        // Now we will add the rest of the classes that implements "RoutingAlgorithm".
        ClassesLister allClassesImpSt = ClassesLister.getInstance();

        List<Class> m = allClassesImpSt.GetRoutingAlgorithms();
        for (Class class1 : m) {
            String id = class1.getName();
            if (_RoutingAlgoChosen.contains(id)) {
                addHtmlNode(getNameOfClass(id), XML_ROUTINGALGORITHM + " " + id, true);
            } else {
                addHtmlNode(getNameOfClass(id), XML_ROUTINGALGORITHM + " " + id, false);
            }
        }
    }

    public String getNameOfClass(String classPath) {
        String[] StatIdarr = classPath.split("\\.");
        return StatIdarr[StatIdarr.length - 1];
    }

    private String lowerCaseFirstLetter(String userIdea) {
        return Character.toLowerCase(userIdea.charAt(0)) + userIdea.substring(1);
    }

    String validate() {
        if (ifRootIsValid()) {
            return "true";
        }
        return "false";
    }

    private boolean ifRootIsValid() {
        try {
            _ifSuccsessParsing = true;
            Element experiment = _root;
            validateName(experiment, XML_EXPERIMENT);

            // experiment childrens
            NodeList experimentChildren = experiment.getChildNodes();

            // validate simulation
            Element simulation = (Element) experiment.getFirstChild();
            validateName(simulation, XML_SIMULATION);

            // validate simulation childrens
            NodeList simulationChildren = simulation.getChildNodes();
            validateMinNumOfChildren(simulationChildren, 1);

            // validate that first child of simulation is StatisticListener
            validateName((Element) simulationChildren.item(0), XML_STATISTICLISTENER);

            // validate that at least one is chosen
            if (_StatisticListenerChosen.size() < 1) {
                _ifSuccsessParsing = false;
                return _ifSuccsessParsing;
            }

            // validate that one or non RoutingAlgorithm is chosen
            if (_RoutingAlgoChosen.size() > 1) {
                _ifSuccsessParsing = false;
                return _ifSuccsessParsing;
            }

            // check XML_STATISTICLISTENER and routingAlgorithms
            parseStatisticAndRouting(simulationChildren);

            if (!validateStatisticClasses()) {
                return false;
            }

            validateMinNumOfChildren(experimentChildren, 2);

            Node Scenario = experiment.getFirstChild().getNextSibling();
            validateName((Element) Scenario, XML_SCENARIO);
            if (!validateScenarios(experimentChildren)) {
                return false;
            }
        } catch (Exception e) {
            _ifSuccsessParsing = false;
        }
        return _ifSuccsessParsing;
    }

    private boolean validateScenarios(NodeList ExperimentNodeChildren) throws Exception {
        // go over the scenarios
        for (int i = 1; i < ExperimentNodeChildren.getLength(); i++) {
            Element currScenario = (Element) ExperimentNodeChildren.item(i);
            // check if it is Scenario
            validateName(currScenario, XML_SCENARIO);
            NodeList ScenarioNodeChildren = currScenario.getChildNodes();
            for (int j = 0; j < ScenarioNodeChildren.getLength(); j++) {
                Node scenarioChild = ScenarioNodeChildren.item(j);
                // check Init (0..*)
                if (scenarioChild.getNodeName().equalsIgnoreCase(XML_INIT)) {
                    validateInit(scenarioChild);
                }
                // check Device/External/Link (0..*)
                if (scenarioChild.getNodeName().equalsIgnoreCase(XML_DEVICE)
                        || scenarioChild.getNodeName().equalsIgnoreCase(XML_EXTERNAL)
                        || scenarioChild.getNodeName().equalsIgnoreCase(XML_LINK)) {
                    if (!validateDevExtLink(scenarioChild)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private boolean validateStatisticClasses() {
        // check if classes are really exist
        ClassesLister allClassesImpSt = ClassesLister.getInstance();
        List<Class> m = allClassesImpSt.GetStatisticListeners();
        boolean ifIsExist = true;
        boolean tmp = false;
        for (String chosenClass : _StatisticListenerChosen) {
            for (Class class1 : m) {
                tmp = false;
                if (class1.getName().equals(chosenClass)) {
                    tmp = true;
                }
            }
            if (!tmp) {
                ifIsExist = false;
            }
        }
        if (!ifIsExist) {
            _ifSuccsessParsing = false;
            return false;
        }
        return true;
    }

    private void validateInit(Node scenarioChild) throws Exception {
        NodeList initChildren = scenarioChild.getChildNodes();

        // must be exactly one action
        validateMinNumOfChildren(initChildren, 1);
        validateMaxNumOfChildren(initChildren, 1);

        // check action name
        Element action = (Element) initChildren.item(0);
        validateName(action, XML_ACTION);
    }

    private boolean validateDevExtLink(Node scenarioChild) throws Exception {
        NodeList DeviceExternalLinkChildren = scenarioChild.getChildNodes();
        // must have 1 Order 1 Select 1 Action. Length must be exactly 3.
        validateMinNumOfChildren(DeviceExternalLinkChildren, 3);
        validateMaxNumOfChildren(DeviceExternalLinkChildren, 3);
        // check first is 1 Order
        // check second is 1 select
        // check third is 1 action
        if (!DeviceExternalLinkChildren.item(0).getNodeName().equalsIgnoreCase(XML_ORDER)
                || !DeviceExternalLinkChildren.item(1).getNodeName().equalsIgnoreCase(XML_SELECT)
                || !DeviceExternalLinkChildren.item(2).getNodeName().equalsIgnoreCase(XML_ACTION)) {
            _ifSuccsessParsing = false;
            return false;
        }
        Element action = (Element) DeviceExternalLinkChildren.item(2);
        removeWhitespaceNodes(action);
        return true;

    }

    /*
     Save root xml to a file
     */
    public String saveTree() {
        try {
            //DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
            //DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

            // write the content into xml file
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource source = new DOMSource(_root);

            // relative path
            Path currentRelativePath = Paths.get("");
            String relativePath = currentRelativePath.toAbsolutePath().toString();

            StreamResult result = new StreamResult(new File(relativePath + "\\SimulatorExperiment.xml"));
            
            SIMULATOR_SCENARIO_XML_PATH = relativePath + "\\SimulatorExperiment.xml";

            // Output to console for testing
            // StreamResult result = new StreamResult(System.out);
            transformer.transform(source, result);

            return "File saved in " + relativePath + "\\SimulatorExperiment.xml";

        } catch (Exception ex) {
            return "Sorry, cant save file. " + ex.getMessage();
        }
    }

    private static class XMLTreeHolder {

        private static final XMLTree INSTANCE = new XMLTree();
    }

    public String upperFirstLetter(String userIdea) {
        return Character.toUpperCase(userIdea.charAt(0)) + userIdea.substring(1);
    }
}
