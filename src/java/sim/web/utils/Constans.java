package sim.web.utils;

/**
 *
 * @author Keren Fruchter
 */
public final class Constans {

    public static final String ATTRIBUTE_VALUE = "value";
    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_KEY = "key";

    public static final String PARAMETERS_SPLITTER = ",,";
    public static final String FILES_SPLITTER = "\\";
    public static final String KEY_VAL_SPLITTER = "::";
    public static final String ERROR_PARSING_XML = "XML File is not valid.";

    public static final String XML_EXPERIMENT = "experiment";
    public static final String XML_SIMULATION = "simulation";
    public static final String XML_SCENARIO = "scenario";
    public static final String XML_DEVICE = "device";
    public static final String XML_ORDER = "order";
    public static final String XML_SELECT = "select";
    public static final String XML_ACTION = "action";
    public static final String XML_EXTERNAL = "external";
    public static final String XML_LINK = "link";
    public static final String XML_INIT = "init";
    public static final String XML_OFF = "Off";
    public static final String XML_ON = "On";
    public static final String XML_STATISTICLISTENER = "StatisticListener";
    public static final String XML_ROUTINGALGORITHM = "RoutingAlgorithm";
    public static final String XML_STATISTICLISTENER_LOW = "statisticlistener";
    public static final String XML_ROUTINGALGORITHM_LOW = "routingalgorithm";
    public static final String XML_PROPERTY = "p";

    public static final String TREEVIEW_EXPERIMENT = "Experiment";
    public static final String TREEVIEW_SIMULATION = "Simulation";
    public static final String TREEVIEW_SCENARIO = "Scenario";
    public static final String TREEVIEW_DEVICE = "Device";
    public static final String TREEVIEW_ORDER = "Order";
    public static final String TREEVIEW_EXTERNAL = "External";
    public static final String TREEVIEW_LINK = "Link";
    public static final String TREEVIEW_INIT = "Initialization";
    public static final String TREEVIEW_DeviceExternalLink = "DeviceExternalLink";

    public static final String SIMULATION_PROPERTY_SEED = "seed";
    public static final String SIMULATION_PROPERTY_TICKS = "ticks";
    public static final String SIMULATION_PROPERTY_NETFILEPATH = "netFilePath";
    public static final String SIMULATION_PROPERTY_SYSTEMFOLDER = "systemFolder";

    public static final String XML_PARSER_ERROR_STATISTICLISTENER = "Simulation must have at least one statistic listener.";
    public static final String XML_PARSER_ERROR_SIMULATION_ATTRIBUTES = "Simulation attribute # is empty";
    public static final String XML_PARSER_ERROR_GUILISTENER_IS_A_MUST = "Must set GUIListener on true.";
    public static final String XML_PARSER_ERROR_ROUTINGALGO = "Simulation can have only one routing algorithm.";

    public static final String GUILISTENER_A_MUST = "bgu.sim.core.stat.GUIListener";
}
