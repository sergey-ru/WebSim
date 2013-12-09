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
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

public final class XMLTree {

    private static boolean ifSuccsessParswing;
    private StringBuilder result;
    private Element root;
    private Set<String> StatisticListenerChoosen = new HashSet<>();
    private Set<String> RoutingAlgoChoosen = new HashSet<>();

    private XMLTree() {
        try {
            parse();
        } catch (Exception ex) {
            System.err.println("Error Parsing XML.");
        }
    }

    public Element getRoot() {
        return root;
    }

    public void updateElementProperty(String Element, int Index, String Property, String Value) {
        Node ElementNode = root.getElementsByTagName(Element.toLowerCase()).item(Index - 1);
        ElementNode.getAttributes().getNamedItem(lowerCaseFirstLetter(Property)).setNodeValue(Value);
    }

    public static XMLTree getInstance() {
        return XMLTree.XMLTreeHolder.INSTANCE;
    }

    public StringBuilder getResult() {
        System.out.println("they called me!!!!!");
        if (ifSuccsessParsing()) {
            return result;
        } else {
            return new StringBuilder("Error.");
        }
    }

    public static boolean ifSuccsessParsing() {
        return ifSuccsessParswing;
    }

    public String ifStatisticIsChoosen(String name) {
        if (StatisticListenerChoosen.contains(name)) {
            return "true";
        }
        return "false";
    }

    public String ifRoutAlgIsChoosen(String name) {
        if (RoutingAlgoChoosen.contains(name)) {
            return "true";
        }
        return "false";
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
            res += ",";
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
        Node simulation = li.item(index - 1); // cuz it is array

        NamedNodeMap fres = simulation.getAttributes();
        // name
        for (int i = 0; i < fres.getLength(); i++) {
            res += upperFirstLetter(fres.item(i).getNodeName()); // upper first letter
            res += "::";
            res += fres.item(i).getNodeValue();
            //res += ","; // only one property
        }
        res += ",";
        // actions
        ClassesLister allActions = ClassesLister.getInstance();
        List<Class> actionsList = allActions.GetActions();
        for (Class action : actionsList) {
            res += "Action"; // upper first letter
            res += "::";
            res += getNameOfClass(action.getName());
            res += ",";
        }

        // must be one action
        NodeList children = simulation.getChildNodes();
        // the one action
        Node child = children.item(0);

        // get the value attribute
        NamedNodeMap tmp = child.getAttributes();
        for (int i = 0; i < tmp.getLength(); i++) {
            res += upperFirstLetter(tmp.item(i).getNodeName()); // upper first letter
            res += "::";
            res += getNameOfClass(tmp.item(i).getNodeValue());
            //res += ","; // only one property
        }

        return res;
    }

    public void parse() throws Exception {
        int initIndex = 0;
        //int actionIndex = 0;
        result = new StringBuilder("");
        ifSuccsessParswing = true;
        try {
            System.out.println("start parsing");
            File fXmlFile = new File(SIMULATOR_SCENARIO_XML_PATH);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(fXmlFile);

            doc.getDocumentElement().normalize();

            // check if root is "experiment"
            Element experiment = doc.getDocumentElement();
            validateName(experiment, "experiment");
            // add code to result for building a tree
            addHtmlHeader("Experiment", "Experiment", false);

            root = experiment;

            // experiment childrens
            NodeList ExperimentNodeChildren = experiment.getChildNodes();
            //System.out.println("ExperimentNodeChildren count: " + ExperimentNodeChildren.getLength());

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
                        String StatId = getNameOfClass(currChild.getAttributes().item(0).getNodeValue().toString());
                        // Add as choosen class
                        StatisticListenerChoosen.add(StatId);
                        break;
                    case "routingalgorithm":
                        // Get Class Name
                        String RoutId = getNameOfClass(currChild.getAttributes().item(0).getNodeValue().toString());
                        // Add as choosen class
                        RoutingAlgoChoosen.add(RoutId);
                        break;
                    default:
                        ifSuccsessParswing = false;
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
                addHtmlHeader("Scenario", "Scenario" + i, false);

                // check Scenario childrens
                NodeList ScenarioNodeChildren = currScenario.getChildNodes();
                for (int j = 0; j < ScenarioNodeChildren.getLength(); j++) {
                    Node scenarioChild = ScenarioNodeChildren.item(j);

                    // check Init (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("init")) {
                        NodeList initChildren = scenarioChild.getChildNodes();
                        initIndex++;
                        addHtmlHeader("Init", "Init" + initIndex, false);
                        // must be exactly one action
                        validateMinNumOfChildren(initChildren, 1);
                        validateMaxNumOfChildren(initChildren, 1);

                        // check action name
                        Element action = (Element) initChildren.item(0);
                        validateName(action, "action");
                        addHtmlHeader("Action", "Action" + initIndex, false);

                        // p (0..*)
                        NodeList actionChildren = action.getChildNodes();
                        checkActionChildren(actionChildren);

                        // action end code
                        addEndHtmlHeader();

//                        // Init end code
//                        addEndHtmlHeader();
                    }

                    // check Device/External/Link (0..*)
                    if (scenarioChild.getNodeName().equalsIgnoreCase("device")
                            || scenarioChild.getNodeName().equalsIgnoreCase("external")
                            || scenarioChild.getNodeName().equalsIgnoreCase("link")) {
                        NodeList DeviceExternalLinkChildren = scenarioChild.getChildNodes();
                        addHtmlHeader(scenarioChild.getNodeName(), scenarioChild.getNodeName(), false);

                        // must have 1 Order 1 Select 1 Action. Length must be exactly 3.
                        validateMinNumOfChildren(DeviceExternalLinkChildren, 3);
                        validateMaxNumOfChildren(DeviceExternalLinkChildren, 3);

                        // check first is 1 Order
                        // check second is 1 select
                        // check third is 1 action
                        if (!DeviceExternalLinkChildren.item(0).getNodeName().equalsIgnoreCase("order")
                                || !DeviceExternalLinkChildren.item(1).getNodeName().equalsIgnoreCase("select")
                                || !DeviceExternalLinkChildren.item(2).getNodeName().equalsIgnoreCase("action")) {
                            ifSuccsessParswing = false;
                            return;
                        }

                        addHtmlNode("Order");
                        addHtmlNode("Select");
                        addHtmlHeader("Action", "Action", false);

                        Element action = (Element) DeviceExternalLinkChildren.item(2);
                        removeWhitespaceNodes(action);
                        // check action children. p (0..*)
                        NodeList actionChildren = action.getChildNodes();

                        checkActionChildren(actionChildren);
                        // action end code
                        addEndHtmlHeader();
                    }
                    // Device/External/Link end code
                    addEndHtmlHeader();
                }
                // Scenario end code
                addEndHtmlHeader();
            }
            // Experiment end code
            addEndHtmlHeader();

//            System.out.println("Root element : " + doc.getDocumentElement().getNodeName());
//            NodeList nList = doc.getElementsByTagName("simulation");
//            System.out.println("----------------------------");
//
//            Node simulationNode = nList.item(0);
//            Element simulationElement = (Element) simulationNode;
//            NodeList firstNameList = simulationElement.getElementsByTagName("StatisticListener");
//
//            for (int temp = 0; temp < nList.getLength(); temp++) {
//
//                Node nNode = nList.item(temp);
//
//                System.out.println("\nCurrent Element :" + nNode.getNodeName());
//
//                if (nNode.getNodeType() == Node.ELEMENT_NODE) {
//                    Element eElement = (Element) nNode;
//
//                    System.out.println("Staff id : " + eElement.getAttribute("id"));
//                    System.out.println("First Name : " + eElement.getElementsByTagName("firstname").item(0).getTextContent());
//                    System.out.println("Last Name : " + eElement.getElementsByTagName("lastname").item(0).getTextContent());
//                    System.out.println("Nick Name : " + eElement.getElementsByTagName("nickname").item(0).getTextContent());
//                    System.out.println("Salary : " + eElement.getElementsByTagName("salary").item(0).getTextContent());
//                }
//            }
        } catch (IOException | ParserConfigurationException | SAXException e) {
            ifSuccsessParswing = false;
        }
    }

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
            ifSuccsessParswing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMinNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() < i) {
            ifSuccsessParswing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void validateMaxNumOfChildren(NodeList ListChildren, int i) throws Exception {
        if (ListChildren.getLength() > i) {
            ifSuccsessParswing = false;
            throw new Exception("XML is not build currectly.");
        }
    }

    private void checkActionChildren(NodeList actionChildren) {
        for (int k = 0; k < actionChildren.getLength(); k++) {
            addHtmlNode(actionChildren.item(k).getNodeName());
        }
    }

    private void addHtmlHeader(String text, String id, boolean Selected) {
        //result.append("<li><label class=\"tree-toggle nav-header\">").append(text).append("</label>");
        //result.append("<ul class=\"nav nav-list tree\">");
        if (!"".equals(id)) {
            if (Selected) {
                // add a icon next to text
                result.append("<li><span id='")
                        .append(id)
                        .append("'>")
                        .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                        .append(id)
                        .append("')\">")
                        .append(text)
                        .append("&#10004;</span><ul>");
            } else {
                result.append("<li><span id='")
                        .append(id)
                        .append("'>")
                        .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                        .append(id)
                        .append("')\">")
                        .append(text)
                        .append("</a>")
                        .append("<button type=\"button\" class=\"close\" aria-hidden=\"true\">&times;</button>")
                        .append("<button type=\"button\" class=\"close\" aria-hidden=\"true\">+</button>")
                        .append("</span><ul>");
            }
        } else {
            result.append("<li><span>")
                    .append("<a href=\"#\" onclick=\"EditPropertyJS('")
                    .append(id)
                    .append("')\">")
                    .append(text)
                    .append("</span><ul>");
        }
    }

    private void addHtmlNode(String text) {
        //result.append("<li><a href=\"#\" onclick=\"EditPropertyJS('" + text + "')\">").append(text).append("</a></li>");
        result.append("<li><span><a href=\"#\" onclick=\"EditPropertyJS('")
                .append(text)
                .append("')\">")
                .append(text)
                .append("</a></span></li>");
    }

    private void addEndHtmlHeader() {
        result.append("</ul></li>");
    }

    private void AddAllClassesThatImpStatisticListener() {
        // Now we will add the rest of the classes that implements "StatisticListener".
        ClassesLister allClassesImpSt = ClassesLister.getInstance();

        List<Class> m = allClassesImpSt.GetStatisticListeners();
        for (Class class1 : m) {
            String id = getNameOfClass(class1.getName());
            if (StatisticListenerChoosen.contains(id)) {
                addHtmlHeader(id, "StaticListener " + id, true);
            } else {
                addHtmlHeader(id, "StaticListener " + id, false);
            }
            addEndHtmlHeader();
        }
    }

    private void AddAllClassesThatImpRoutingAlgorithm() {
        // Now we will add the rest of the classes that implements "RoutingAlgorithm".
        ClassesLister allClassesImpSt = ClassesLister.getInstance();

        List<Class> m = allClassesImpSt.GetRoutingAlgorithms();
        for (Class class1 : m) {
            String id = getNameOfClass(class1.getName());
            if (RoutingAlgoChoosen.contains(id)) {
                addHtmlHeader(id, "RoutingAlgorithm " + id, true);
            } else {
                addHtmlHeader(id, "RoutingAlgorithm " + id, false);
            }
            addEndHtmlHeader();
        }
    }

    public String getNameOfClass(String classPath) {
        String[] StatIdarr = classPath.split("\\.");
        return StatIdarr[StatIdarr.length - 1];
    }

    private String lowerCaseFirstLetter(String userIdea) {
        return Character.toLowerCase(userIdea.charAt(0)) + userIdea.substring(1);
    }

    private static class XMLTreeHolder {

        private static final XMLTree INSTANCE = new XMLTree();
    }

    public String upperFirstLetter(String userIdea) {
        return Character.toUpperCase(userIdea.charAt(0)) + userIdea.substring(1);
    }
}
