/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.simgui;

import bgu.sim.data.*;
import bgu.sim.netFile.NetFileParser;
import bgu.sim.netFile.SimulatedEnvironment;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import sim.web.servlet.XMLTree;

/**
 *
 * @author Keren Fruchter
 */
public class createJsonData {

    public createJsonData() {

        JSONArray nodes = new JSONArray();
        JSONArray links = new JSONArray();

        // get the net file path
        XMLTree m = XMLTree.getInstance();
        String netFilePath = m.getNetFilePath();
        File netfile = new File(netFilePath);
        SimulatedEnvironment parser = null;
        try {
            parser = NetFileParser.read(netfile);
        } catch (IOException ex) {
            System.err.println("Cant parse net file.");
            System.exit(1);
        }

        // add nodes
        for (NetDevice netdevice : parser.getNodesArray()) {
            Map node = new LinkedHashMap();
            node.put("id", netdevice.getObjectId());
            node.put("type", "company");
            node.put("expanded", "true");
            nodes.add(node);
        }

        // add links
        for (NetLink netlink : parser.getLinksArray()) {
            Map link = new LinkedHashMap();

            link.put("end", null);
            link.put("to", netlink.getDevice1ID());
            link.put("from", netlink.getDevice2ID());
            link.put("type", "share");
            link.put("id", netlink.getObjectId());

            links.add(link); 
        }

        JSONObject obj = new JSONObject();
        obj.put("nodes", nodes);
        obj.put("links", links);

        try {
            FileWriter file = new FileWriter("C:\\Users\\admin\\Documents\\NetBeansProjects\\WebSimulator\\web\\SimGui\\demo\\netchart\\data\\test.json");
            file.write(obj.toJSONString());
            file.flush();
            file.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.print(obj);

    }
}
