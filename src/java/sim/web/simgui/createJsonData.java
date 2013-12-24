/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.simgui;

import bgu.sim.api.*;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
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
        try {
            SimApi.parseNetFile(netfile);
        } catch (IOException ex) {
            System.err.println("Cant parse net file.");
            System.exit(1);
        }

        // add nodes
        for (NetDevice netdevice : SimApi.getNodesArray()) {
            Map node = new LinkedHashMap();
            node.put("id", Integer.toString(netdevice.getObjectId()));
            switch (netdevice.getNeighbors().size()) {
                case 1:
                    node.put("type", "pc");
                    break;
                case 2:
                    node.put("type", "switch");
                    break;
                case 3:
                    node.put("type", "switch");
                    break;
                case 4:
                    node.put("type", "switch");
                    break;
                default:
                    node.put("type", "router");
                    break;
            }

            node.put("expanded", true);
            nodes.add(node);
        }

        // add links
        for (NetLink netlink : SimApi.getLinksArray()) {
            Map link = new LinkedHashMap();

            link.put("end", null);
            link.put("to", Integer.toString(netlink.getDevice1ID()));
            link.put("from", Integer.toString(netlink.getDevice2ID()));
            link.put("type", "share");
            link.put("id", Integer.toString(netlink.getObjectId()));

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

        System.out.print("Finished");
    }
}
