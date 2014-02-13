package sim.web.servlet;

import static bgu.sim.Properties.StringsProperties.DATA_PATH;
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 *
 * @author Keren Fruchter
 */
public class DownloadFileServlet extends HttpServlet {

    private static final long _serialVersionUID = 1L;

    @Override
    /*
     download the xml tree as a file to the client
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        String fileName = session.getId() + ".xml";

        if (fileName == null || fileName.equals("")) {
            throw new ServletException("File Name can't be null or empty");
        }

        File file = new File(DATA_PATH + fileName);
        if (!file.exists()) {
            throw new ServletException("File doesn't exists on server.");
        }

        // get file and set the header
        ServletContext ctx = getServletContext();
        InputStream fis = new FileInputStream(file);
        String mimeType = ctx.getMimeType(file.getAbsolutePath());
        response.setContentType(mimeType != null ? mimeType : "application/octet-stream");
        response.setContentLength((int) file.length());
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        // write the filr to the response
        ServletOutputStream os = response.getOutputStream();
        byte[] bufferData = new byte[1024];
        int read;
        while ((read = fis.read(bufferData)) != -1) {
            os.write(bufferData, 0, read);
        }

        os.flush();
        os.close();
        fis.close();
        System.out.println("File downloaded at client successfully");
    }
}
