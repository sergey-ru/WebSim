package sim.web.servlet;

import bgu.sim.api.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

/**
 *
 * @author Keren Fruchter
 */
public class SimServlet extends HttpServlet {

    private static final long _serialVersionUID = 1L;
    private ServletFileUpload _uploader;
    private HandleRequests _requests;

    @Override
    // Called when user press Upload.
    public void init() throws ServletException {
        _uploader = null;
        _requests = new HandleRequests();

        initLoadingFileEnviroment();
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
        try {
            List<FileItem> fileItemsList = _uploader.parseRequest(request);
            Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();
            while (fileItemsIterator.hasNext()) {
                FileItem fileItem = fileItemsIterator.next();

                // relative path
                Path currentRelativePath = Paths.get("");
                String relativePath = currentRelativePath.toAbsolutePath().toString();

                // save file
                File file = new File(relativePath + File.separator + fileItem.getName());
                fileItem.write(file);

                SimApi.setSimulatorScenarioXmlPath(file.getAbsolutePath());

                // file info
                System.out.println("FieldName = " + fileItem.getFieldName());
                System.out.println("FileName = " + fileItem.getName());
                System.out.println("ContentType = " + fileItem.getContentType());
                System.out.println("Size in bytes = " + fileItem.getSize());
                System.out.println("Absolute Path at server = " + file.getAbsolutePath());
            }
        } catch (Exception e) {
            System.out.println("Exception in uploading file. " + e.getMessage());
        }
    }

    private void initLoadingFileEnviroment() {
        // file init
        try {
            Path currentRelativePath = Paths.get("");
            String relativePath = currentRelativePath.toAbsolutePath().toString();

            DiskFileItemFactory fileFactory = new DiskFileItemFactory();
            File filepath = new File(relativePath);
            fileFactory.setRepository(filepath);
            this._uploader = new ServletFileUpload(fileFactory);

        } catch (Exception ex) {
            System.err.println("Error init new file environment. " + ex.getMessage());
        }
    }
}
