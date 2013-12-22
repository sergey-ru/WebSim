/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sim.web.samples;

import sim.web.servlet.XMLTree;

/**
 *
 * @author Keren Fruchter
 */
public class Tests {

    public static void main1(String[] args) {
        try {
            XMLTree k = XMLTree.getInstance();
            System.out.println("Result: " + k.getResult());
        } catch (Exception ex) {
            System.err.println(ex.getMessage());
        }
    }
}
