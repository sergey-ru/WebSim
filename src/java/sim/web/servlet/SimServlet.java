package sim.web.servlet;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 *
 * @author Keren Fruchter
 */
public class SimServlet extends HttpServlet {

    private HandleRequests _requests;
    private static final long _serialVersionUID = 1L;

    @Override
    public void init() throws ServletException {
        _requests = HandleRequests.getInstance();
        _requests.initLoadingFileEnviroment();
    }

    @Override
    /* 
     Handle all the requests from the client.
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String theRequest = request.getParameter("request");
            _requests.checkRequest(theRequest, request, response);

        } catch (Exception ex) {
            System.err.println("Error taking request from client. " + ex.getMessage());
        }
    }

    @Override
    /* 
     Load a new file (xml or net) and save it on the server.
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String theRequest = request.getParameter("request");
        _requests.returnResponse(response, _requests.loadFile(request, response, theRequest));
    }
}
