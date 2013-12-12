/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.journaldev.servlet;

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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Attr;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

public final class XMLTree {

    private static boolean ifSuccsessParsing;
    private StringBuilder result;
    private Element root;
    private Set<String> StatisticListenerChoosen = new HashSet<>();
    private Set<String> RoutingAlgoChoosen = new HashSet<>();
    Document doc;

    private XMLTree() {
        try {
            parse();
        } catch (Exception ex) {
            System.err.println("Error Parsing XML.");
        }
    }

    public static XMLTree getInstance() {
        return XMLTree.XMLTreeHolder.INSTANCE;
    }

    public Element getRoot() {
        return root;
    }

    public StringBuilder getResult() {
        if (ifSuccsessParsing()) {
            return result;
        } else {
            return new StringBuilder("Error.");
        }
    }

    public static boolean ifSuccsessParsing() {
        return ifSuccsessParsing;
    }

    // ---------- UPDATE ELEMENTS ----------------
    public void updateElementProperty(String Element, int Index, String Property, String Value) {
        Node ElementNode = root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);
        ElementNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property)).setNodeValue(Value);
    }

    String updateStatisticListenerProperty(String Element, int Index, String Property, String Value) {
        // remove the vi sign
        switch (Value) {
            case "off": {
                Node SimulationNode = root.getElementsByTagName("simulation").item(0);
                Node ElementNode = root.getElementsByTagName("statisticlistener").item(0);
                if (ElementNode != null) {
                    SimulationNode.removeChild(ElementNode);
                }
                String tmpElement = Element.replace("statisticlistener ", "");
                StatisticListenerChoosen.remove(tmpElement);

                return "remove " + Element;
            }
            case "on": {
                // add the vi sign to the title in xml tree
                Node SimulationNode = root.getElementsByTagName("simulation").item(0);

                // ------------create StatisticListener child
                Attr valAttribute = doc.createAttribute("value");
                String tmpElement = Element.replace("statisticlistener ", "");
                valAttribute.setValue(tmpElement);

                // create statisticlistener
                Element p = doc.createElement("statisticlistener");
                p.setAttributeNode(valAttribute);

                SimulationNode.appendChild(p);
                // -------------------------

                StatisticListenerChoosen.add(tmpElement);
                return "add " + Element;
            }
        }
        return "";
    }

    String updateRoutingAlgorithmProperty(String Element, int Index, String Property, String Value) {
        switch (Value) {
            case "off": {
                Node SimulationNode = root.getElementsByTagName("simulation").item(0);
                Node ElementNode = root.getElementsByTagName("routingalgorithm").item(0);
                if (ElementNode != null) {
                    SimulationNode.removeChild(ElementNode);
                }
                String tmpElement = Element.replace("routingalgorithm ", "");
                StatisticListenerChoosen.remove(tmpElement);

                return "remove " + Element;
            }
            case "on": {
                // add the vi sign to the title in xml tree
                Node SimulationNode = root.getElementsByTagName("simulation").item(0);

                // ------------create RoutingAlgorithm child
                Attr valAttribute = doc.createAttribute("value");
                String tmpElement = Element.replace("routingalgorithm ", "");
                valAttribute.setValue(tmpElement);

                // create routingalgorithm
                Element p = doc.createElement("routingalgorithm");
                p.setAttributeNode(valAttribute);

                SimulationNode.appendChild(p);
                // -------------------------

                StatisticListenerChoosen.add(tmpElement);
                return "add " + Element;
            }
        }
        return "";
    }

    void updateInitProperties(String Element, int Index, String[] parsedInfo) {
        Node InitNode = root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);

        // save action (first)
        String[] newActionValue = parsedInfo[0].split("::");
        Node action = InitNode.getFirstChild(); // one action
        action.getAttributes().item(0).setNodeValue(newActionValue[1]);

        // save init name (second)
        String[] Property = parsedInfo[1].split("::");
        InitNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property[0])).setNodeValue(Property[1]);

        // --- save all p (third and so on...)---
        // delete all children first
        NodeList childrenDelete = action.getChildNodes();
        for (int j = 0; j < childrenDelete.getLength(); j++) {
            action.removeChild(childrenDelete.item(j));
        }
        // add all p
        for (int i = 2; i < parsedInfo.length; i++) {
            String[] info = parsedInfo[i].split("::");
            String key = info[0];
            String val = info[1];
            // create attribute
            Attr keyAttribute = doc.createAttribute("key");
            keyAttribute.setValue(key);

            Attr valAttribute = doc.createAttribute("value");
            valAttribute.setValue(val);

            // create p
            Element p = doc.createElement("p");
            p.setAttributeNode(keyAttribute);
            p.setAttributeNode(valAttribute);

            action.appendChild(p);
        }
    }

    void updateDevExLinkProperties(String Element, int Index, String[] parsedInfo) {
        Node InitNode = root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);

        // save action (first)
        String[] newActionValue = parsedInfo[0].split("::");
        NodeList allDevChildren = InitNode.getChildNodes();
        Node order = allDevChildren.item(0); // order
        Node select = allDevChildren.item(1); // select
        Node action = allDevChildren.item(2); // action

        // set action path
        action.getAttributes().item(0).setNodeValue(newActionValue[1]);

        String[] Property;
        // save init name (second)
        Property = parsedInfo[1].split("::");
        InitNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property[0])).setNodeValue(Property[1]);

        // order 3
        Property = parsedInfo[2].split("::");
        order.getAttributes().item(0).setNodeValue(Property[1]);

        // select 4
        Property = parsedInfo[3].split("::");
        select.getAttributes().item(0).setNodeValue(Property[1]);

        // --- save all p (5 and so on...) ---
        // delete all children first
        NodeList childrenDelete = action.getChildNodes();
        for (int j = 0; j < childrenDelete.getLength(); j++) {
            action.removeChild(childrenDelete.item(j));
        }
        // add all p
        for (int i = 4; i < parsedInfo.length; i++) {
            String[] info = parsedInfo[i].split("::");
            String key = info[0];
            String val = info[1];
            // create attribute
            Attr keyAttribute = doc.createAttribute("key");
            keyAttribute.setValue(key);

            Attr valAttribute = doc.createAttribute("value");
            valAttribute.setValue(val);

            // create p
            Element p = doc.createElement("p");
            p.setAttributeNode(keyAttribute);
            p.setAttributeNode(valAttribute);

            action.appendChild(p);
        }
    }
    // --- END UPDATE --------------

    // --- GET PROPERTIES -------------
    public String getStatisticProperties(String name) {
        //System.out.println(name);
        String res = "";
        ClassesLister allActions = ClassesLister.getInstance();
        List<Property> pList;

        // first - choosen or not
        if (StatisticListenerChoosen.contains(name)) {
            res += "Choosen";
            res += "::";
            res += "true";
            res += ",,";
        } else {
            res += "Choosen";
            res += "::";
            res += "false";
            res += ",,";
        }

        // second and so, the rest
        try {
            pList = allActions.getClassProperties(name);
            for (Property property : pList) {
                String pKey = upperFirstLetter(property.getMetadata().getName());
                String pVal = getPValueByItsKey("StatisticListener", name, pKey);

                res += pKey; // upper first letter
                res += "::";
                res += pVal;
                res += ",,"; // only one property
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

        // first - choosen or not
        if (RoutingAlgoChoosen.contains(name)) {
            res += "Choosen";
            res += "::";
            res += "true";
            res += ",,";

            // second and so, the rest
            try {
                pList = allActions.getClassProperties(name);
                for (Property property : pList) {
                    String pKey = upperFirstLetter(property.getMetadata().getName());
                    String pVal = getPValueByItsKey("RoutingAlgorithm", name, pKey);

                    res += pKey; // upper first letter
                    res += "::";
                    res += pVal;
                    res += ",,"; // only one property
                }
            } catch (ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
                //Logger.getLogger(XMLTree.class.getName()).log(Level.SEVERE, null, ex);
            }
        } else {
            res += "Choosen";
            res += "::";
            res += "false";
            res += ",,";
        }
        return res;
    }

    public String getSimulationProperties() {
        String res = "";
        NodeList li = root.getElementsByTagName("simulation");
        Node simulation = li.item(0);
        NamedNodeMap fres = simulation.getAttributes();
        for (int i = 0; i < fres.getLength(); i++) {
            res += upperFirstLetter(fres.item(i).getNodeName());
            res += "::";
            res += fres.item(i).getNodeValue();
            res += ",,";
        }
        return res;
    }

    public String getScenarioProperties(int index) {
        String res = "";
        NodeList li = root.getElementsByTagName("scenario");
        Node simulation = li.item(index - 1); // cuz it is array
        NamedNodeMap fres = simulation.getAttributes();
        for (int i = 0; i < fres.getLength(); i++) {
            res += upperFirstLetter(fres.item(i).getNodeName()); // upper first letter
            res += "::";
            res += fres.item(i).getNodeValue();
            //res += ","; // only one property
        }
        return res;
    }

    public String getInitProperties(int index) {
        String res = "";
        NodeList li = root.getElementsByTagName("init");
        Node initNode = li.item(index - 1); // cuz it is array

        NamedNodeMap initAtt = initNode.getAttributes();
        // name
        for (int i = 0; i < initAtt.getLength(); i++) {
            res += upperFirstLetter(initAtt.item(i).getNodeName()); // upper first letter
            res += "::";
            res += initAtt.item(i).getNodeValue();
            //res += ","; // only one property
        }
        res += ",,";
        // actions
        ClassesLister allActions = ClassesLister.getInstance();
        List<Class> actionsList = allActions.GetActions();
        for (Class action : actionsList) {
            res += "ActionList"; // upper first letter
            res += "::";
            res += action.getName();
            res += ",,";
        }

        // must be one action
        NodeList children = initNode.getChildNodes();
        // the one action
        Node child = children.item(0);

        // get the value attribute
        NamedNodeMap tmp = child.getAttributes();
        for (int i = 0; i < tmp.getLength(); i++) {
            res += upperFirstLetter(tmp.item(i).getNodeName()); // upper first letter
            res += "::";
            res += tmp.item(i).getNodeValue();
            //res += ","; // only one property
        }
        return res;
    }

    String getPValuesByActionValue(String fullClassPath) {
        ClassesLister allActions = ClassesLister.getInstance();
        String res = "";
        String pKey;
        String pVal;
        try {
            List<Property> pList = allActions.getClassProperties(fullClassPath);
            for (int i = 0; i < pList.size(); i++) {
                pKey = upperFirstLetter(pList.get(i).getMetadata().getName());
                pVal = getPValueByItsKey("action", fullClassPath, pKey);

                res += pKey; // upper first letter
                res += "::";
                res += pVal;
                res += ",,"; // only one property
            }
        } catch (Exception ex) {
            return "Error";
        }
        return res;
    }

    public String getPValueByItsKey(String underElement, String ClassName, String Key) {
        Node action = null;
        NodeList li = root.getElementsByTagName(underElement);
        // find init by its name
        for (int i = 0; i < li.getLength(); i++) {
            System.out.println(li.item(i).getAttributes().item(0).getNodeValue());
            if (li.item(i).getAttributes().item(0).getNodeValue().equalsIgnoreCase(ClassName)) {
                action = li.item(i);
                break;
            }
        }

        NodeList pList = action.getChildNodes();
        for (int i = 0; i < pList.getLength(); i++) {
            NamedNodeMap attMap = pList.item(i).getAttributes();
            for (int j = 0; j < attMap.getLength(); j++) {
                System.out.println(attMap.item(j).getNodeValue());
                if (attMap.item(j).getNodeValue().equalsIgnoreCase(Key)) {
                    return attMap.item(j + 1).getNodeValue();
                }
            }
        }
        return "";
    }

    String getDeviceExLinkProperties(String type, int index) {
        String res = "";
        NodeList li = root.getElementsByTagName(type);
        Node initNode = li.item(index - 1); // cuz it is array

        NamedNodeMap initAtt = initNode.getAttributes();
        // name
        for (int i = 0; i < initAtt.getLength(); i++) {
            res += upperFirstLetter(initAtt.item(i).getNodeName()); // upper first letter
            res += "::";
            res += initAtt.item(i).getNodeValue();
        }
        res += ",,";

        // Order & Select
        NodeList Children = initNode.getChildNodes();
        for (int i = 0; i < Children.getLength(); i++) {
            Node devExLink = Children.item(i);
            String typeName = devExLink.getNodeName();
            String val = devExLink.getAttributes().item(0).getNodeValue(); // one value
            val = val.replace("\"", "\'");
            res += upperFirstLetter(typeName);
            res += "::";
            res += val;
            res += ",,"; // only one property
        }
        //res += ",";

        // actions
        ClassesLister allActions = ClassesLister.getInstance();
        List<Class> actionsList = allActions.GetActions();
        for (Class action : actionsList) {
            res += "ActionList"; // upper first letter
            res += "::";
            res += action.getName();
            res += ",,";
        }

        // must be one action
        NodeList children = initNode.getChildNodes();
        // the one action after order and select
        Node child = children.item(2);

        // get the value attribute. selected action.
        NamedNodeMap tmp = child.getAttributes();
        for (int i = 0; i < tmp.getLength(); i++) {
            res += upperFirstLetter(tmp.item(i).getNodeName()); // upper first letter
            res += "::";
            res += tmp.item(i).getNodeValue();
            //res += ","; // only one property
        }

        return res;
    }
    // --- END PROPERTIES -------------

    /*  
     PARSE THE XML TREE INTO HTML CODE
     */
    public void parse() throws Exception {
        int initIndex = 0;
        int deviceIndex = 0;
        int externalIndex = 0;
        int linkIndex = 0;

        result = new StringBuilder("");
        ifSuccsessParsing = true;
        try {
            System.out.println("start parsing");
            File fXmlFile = new File(SIMULATOR_SCENARIO_XML_PATH);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            doc = dBuilder.parse(fXmlFile);

            doc.getDocumentElement().normalize();

            // check if root is "experiment"
            Element experiment = doc.getDocumentElement();
            validateName(experiment, "experiment");
            // add code to result for building a tree

            // 1 exp
            addHtmlHeader("Experiment", "Experiment", false);

            root = experiment;

            // experiment childrens
            NodeList ExperimentNodeChildren = experiment.getChildNodes();

            // check if after experiment, the node "simulation" is coming
            Element simulation = (Element) experiment.getFirstChild();
            validateName(simulation, "simulation");
            // simulation start code
            addHtmlHeader("Simulation", "Simulation", false);

            // check simulation childrens
            NodeList SimulationNodeChildren = simulation.getChildNodes();
            validateMinNumOfChildren(SimulationNodeChildren, 1);

            // check that first child of Simulation is StatisticListener
            validateName((Element) SimulationNodeChildren.item(0), "statisticlistener");

            // check statisticlistener and routingAlgorithms
            for (int i = 0; i < SimulationNodeChildren.getLength(); i++) {
                Node currChild = SimulationNodeChildren.item(i);
                switch (currChild.getNodeName().toLowerCase()) {
                    case "statisticlistener":
                        // Get Class Name
                        String StatId = currChild.getAttributes().item(0).getNodeValue().toString();
                        // Add as choosen class
                        StatisticListenerChoosen.add(StatId);
                        break;
                    case "routingalgorithm":
                        // Get Class Name
                        String RoutId = currChild.getAttributes().item(0).getNodeValue().toString();
                        // Add as choosen class
                        RoutingAlgoChoosen.add(RoutId);
                        break;
                    default:
                        ifSuccsessParsing = false;
                        return;
                }
            }
            // Now we will add the rest of the classes that implements "StatisticListener".
            AddAllClassesThatImpStatisticListener();

            // Now we will add the rest of the classes that implements "RoutingAlgorithm".
            AddAllClassesThatImpRoutingAlgorithm();

            // simulation end code
            addEndHtmlHeader();

            // checking that there is one Simulation and one and more Scenarios
            validateMinNumOfChildren(ExperimentNodeChildren, 2);

            Node Scenario = experiment.getFirstChild().getNextSibling();
            validateName((Element) Scenario, "scenario");

            // go over the scenarios
            for (int i = 1; i < ExperimentNodeChildren.getLength(); i++) {

                Element currScenario = (Element) ExperimentNodeChildren.item(i);
                // check if it is Scenario
                validateName(currScenario, "scenario");

                // 2 Scenario
                addHtmlHeader("Scenario", "Scenario" + i, false);

                // check Scenario childrens
                NodeList ScenarioNodeChildren = currScenario.getChildNodes();
                for (int j = 0; j < ScenarioNodeChildren.getLength(); j++) {
                    Node scenarioChild = ScenarioNodeChildren.item(j);

                    // check Init (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("init")) {
                        NodeList initChildren = scenarioChild.getChildNodes();
                        initIndex++;

                        addHtmlNode("Init", "Init" + initIndex, false);

                        // must be exactly one action
                        validateMinNumOfChildren(initChildren, 1);
                        validateMaxNumOfChildren(initChildren, 1);

                        // check action name
                        Element action = (Element) initChildren.item(0);
                        validateName(action, "action");
                    }

                    // check Device/External/Link (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("device")
                            || scenarioChild.getNodeName().equalsIgnoreCase("external")
                            || scenarioChild.getNodeName().equalsIgnoreCase("link")) {

                        switch (scenarioChild.getNodeName()) {
                            case "external":
                                externalIndex++;
                                addHtmlNode(scenarioChild.getNodeName(), scenarioChild.getNodeName() + externalIndex, false);
                                break;
                            case "device":
                                deviceIndex++;
                                addHtmlNode(scenarioChild.getNodeName(), scenarioChild.getNodeName() + deviceIndex, false);
                                break;
                            case "link":
                                linkIndex++;
                                addHtmlNode(scenarioChild.getNodeName(), scenarioChild.getNodeName() + linkIndex, false);
                                break;
                        }

                        NodeList DeviceExternalLinkChildren = scenarioChild.getChildNodes();

                        // must have 1 Order 1 Select 1 Action. Length must be exactly 3.
                        validateMinNumOfChildren(DeviceExternalLinkChildren, 3);
                        validateMaxNumOfChildren(DeviceExternalLinkChildren, 3);

                        // check first is 1 Order
                        // check second is 1 select
                        // check third is 1 action
                        if (!DeviceExternalLinkChildren.item(0).getNodeName().equalsIgnoreCase("order")
                                || !DeviceExternalLinkChildren.item(1).getNodeName().equalsIgnoreCase("select")
                                || !DeviceExternalLinkChildren.item(2).getNodeName().equalsIgnoreCase("action")) {
                            ifSuccsessParsing = false;
                            return;
                        }

                        Element action = (Element) DeviceExternalLinkChildren.item(2);
                        removeWhitespaceNodes(action);
                    }
                }
                // 2 Scenario end code
                addEndHtmlHeader();
            }
            // 1 Experiment end code
            addEndHtmlHeader();

        } catch (IOException | ParserConfigurationException | SAXException e) {
            ifSuccsessParsing = false;
        }
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
            ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMinNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() < i) {
            ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMaxNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() > i) {
            ifSuccsessParsing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void addHtmlHeader(String text, String id, boolean Selected) {
        result.append("<li><span id='")
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
            result.append("&#10004;");
        }
        result.append("</a>");

        if (text.contains("Scenario") || text.contains("Experiment")) {
            result.append("<button type=\"button\" id=\"" + text + "_" + id + "_delete\" class=\"close\" aria-hidden=\"true\" data-target=\"#myModal\">&times;</button>");
            result.append("<button type=\"button\" id=\"" + text + "_" + id + "_add\" class=\"close\" aria-hidden=\"true\" data-target=\"#myModal\">+</button>");
        }
        result.append("</span><ul>");
    }

    private void addHtmlNode(String text, String id, boolean Selected) {
        result.append("<li><span id='")
                .append(id)
                .append("'>")
                .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                .append(id)
                .append("')\" id=\"a_href_")
                .append(id)
                .append("')\">")
                .append(text);

        if (Selected) {
            result.append("&#10004;</a>");
        } else {
            result.append("</a>");
        }

        if (text.contains("Init") || text.contains("device") || text.contains("external") || text.contains("link")) {
            result.append("<button type=\"button\" id=\"" + text + "_" + id + "_delete\" class=\"close\" aria-hidden=\"true\" data-target=\"#myModal\">&times;</button>");
        }
        result.append("</span></li>");
    }

    private void addEndHtmlHeader() {
        result.append("</ul></li>");
    }

    private void AddAllClassesThatImpStatisticListener() {
        // Now we will add the rest of the classes that implements "StatisticListener".
        ClassesLister allClassesImpSt = ClassesLister.getInstance();
        List<Class> m = allClassesImpSt.GetStatisticListeners();

        for (Class class1 : m) {
            String id = class1.getName();
            if (StatisticListenerChoosen.contains(id)) {
                addHtmlNode(getNameOfClass(id), "statisticlistener " + id, true);
            } else {
                addHtmlNode(getNameOfClass(id), "statisticlistener " + id, false);
            }
            //addEndHtmlHeader();
        }
    }

    private void AddAllClassesThatImpRoutingAlgorithm() {
        // Now we will add the rest of the classes that implements "RoutingAlgorithm".
        ClassesLister allClassesImpSt = ClassesLister.getInstance();

        List<Class> m = allClassesImpSt.GetRoutingAlgorithms();
        for (Class class1 : m) {
            String id = class1.getName();
            if (RoutingAlgoChoosen.contains(id)) {
                addHtmlNode(getNameOfClass(id), "RoutingAlgorithm " + id, true);
            } else {
                addHtmlNode(getNameOfClass(id), "RoutingAlgorithm " + id, false);
            }
            //addEndHtmlHeader();
        }
    }

    public String getNameOfClass(String classPath) {
        String[] StatIdarr = classPath.split("\\.");
        return StatIdarr[StatIdarr.length - 1];
    }

    private String lowerCaseFirstLetter(String userIdea) {
        return Character.toLowerCase(userIdea.charAt(0)) + userIdea.substring(1);
    }

    String parseAndCheckIfValid() {
        if (ifRootIsValid()) {
            return "true";
        }
        return "false";
    }

    private boolean ifRootIsValid() {
        try {
            ifSuccsessParsing = true;
            Element experiment = root;
            validateName(experiment, "experiment");
            // add code to result for building a tree

            // experiment childrens
            NodeList ExperimentNodeChildren = experiment.getChildNodes();

            // check if after experiment, the node "simulation" is coming
            Element simulation = (Element) experiment.getFirstChild();
            validateName(simulation, "simulation");

            // check simulation childrens
            NodeList SimulationNodeChildren = simulation.getChildNodes();
            validateMinNumOfChildren(SimulationNodeChildren, 1);

            // check that first child of Simulation is StatisticListener
            validateName((Element) SimulationNodeChildren.item(0), "statisticlistener");

            if (StatisticListenerChoosen.size() != 1) {
                ifSuccsessParsing = false;
                return ifSuccsessParsing;
            }

            // check statisticlistener and routingAlgorithms
            for (int i = 0; i < SimulationNodeChildren.getLength(); i++) {
                Node currChild = SimulationNodeChildren.item(i);
                System.out.println(currChild.getNodeName().toLowerCase());
                switch (currChild.getNodeName().toLowerCase()) {
                    case "statisticlistener":
                        // Get Class Name
                        String StatId = currChild.getAttributes().item(0).getNodeValue().toString();
                        // Add as choosen class
                        StatisticListenerChoosen.add(StatId);
                        break;
                    case "routingalgorithm":
                        // Get Class Name
                        String RoutId = currChild.getAttributes().item(0).getNodeValue().toString();
                        // Add as choosen class
                        RoutingAlgoChoosen.add(RoutId);
                        break;
                    default:
                        ifSuccsessParsing = false;
                        return ifSuccsessParsing;
                }
            }
            validateMinNumOfChildren(ExperimentNodeChildren, 2);

            Node Scenario = experiment.getFirstChild().getNextSibling();
            validateName((Element) Scenario, "scenario");

            // go over the scenarios
            for (int i = 1; i < ExperimentNodeChildren.getLength(); i++) {

                Element currScenario = (Element) ExperimentNodeChildren.item(i);
                // check if it is Scenario
                validateName(currScenario, "scenario");

                NodeList ScenarioNodeChildren = currScenario.getChildNodes();
                for (int j = 0; j < ScenarioNodeChildren.getLength(); j++) {
                    Node scenarioChild = ScenarioNodeChildren.item(j);

                    // check Init (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("init")) {
                        NodeList initChildren = scenarioChild.getChildNodes();
                        //nitIndex++;

                        //addHtmlNode("Init", "Init" + initIndex, false);
                        // must be exactly one action
                        validateMinNumOfChildren(initChildren, 1);
                        validateMaxNumOfChildren(initChildren, 1);

                        // check action name
                        Element action = (Element) initChildren.item(0);
                        validateName(action, "action");
                    }

                    // check Device/External/Link (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("device")
                            || scenarioChild.getNodeName().equalsIgnoreCase("external")
                            || scenarioChild.getNodeName().equalsIgnoreCase("link")) {

                        NodeList DeviceExternalLinkChildren = scenarioChild.getChildNodes();

                        // must have 1 Order 1 Select 1 Action. Length must be exactly 3.
                        validateMinNumOfChildren(DeviceExternalLinkChildren, 3);
                        validateMaxNumOfChildren(DeviceExternalLinkChildren, 3);

                        // check first is 1 Order
                        // check second is 1 select
                        // check third is 1 action
                        if (!DeviceExternalLinkChildren.item(0).getNodeName().equalsIgnoreCase("order")
                                || !DeviceExternalLinkChildren.item(1).getNodeName().equalsIgnoreCase("select")
                                || !DeviceExternalLinkChildren.item(2).getNodeName().equalsIgnoreCase("action")) {
                            ifSuccsessParsing = false;
                            return ifSuccsessParsing;
                        }

                        Element action = (Element) DeviceExternalLinkChildren.item(2);
                        removeWhitespaceNodes(action);
                    }
                }
            }
        } catch (Exception e) {
            ifSuccsessParsing = false;
        }

        return ifSuccsessParsing;
    }

    private static class XMLTreeHolder {

        private static final XMLTree INSTANCE = new XMLTree();
    }

    public String upperFirstLetter(String userIdea) {
        return Character.toUpperCase(userIdea.charAt(0)) + userIdea.substring(1);
    }
}
