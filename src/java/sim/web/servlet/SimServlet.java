package sim.web.servlet;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 *
 * @author Keren Fruchter
 */
public class SimServlet extends HttpServlet {

    private static final long _serialVersionUID = 1L;
    private HandleRequests _requests;

    @Override
    // Called when user press Upload.
    public void init() throws ServletException {
        _requests = new HandleRequests();

        // init file environment
        _requests.initLoadingFileEnviroment();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String theRequest = request.getParameter("request");
            _requests.checkRequest(theRequest, request, response);

        } catch (Exception ex) {
            System.err.println("Error taking request from client. " + ex.getMessage());
        }
    }

    @Override
    // load xml file sim scenario
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        _requests.loadNewXml(request, response);
    }
}
