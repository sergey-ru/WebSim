/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.simgui;

import java.io.FileWriter;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

/**
 *
 * @author Keren Fruchter
 */
public class createJsonData {

    public createJsonData() {

        JSONArray nodes = new JSONArray();
        JSONArray links = new JSONArray();

        // add one node
        for (int i = 0; i < 2; i++) {
            Map node = new LinkedHashMap();
            node.put("id", Integer.toString(i));
            node.put("type", "company");
            node.put("expanded", "true");
            nodes.add(node);
        }

        // add one link
        Map link = new LinkedHashMap();

        link.put("end", null);
        link.put("to", "0");
        link.put("from", "1");
        link.put("type", "share");
        link.put("id", "0");

        links.add(link);

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
