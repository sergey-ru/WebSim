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
        int read;
        ServletContext ctx = getServletContext();
        HttpSession session = request.getSession();
        String fileName = session.getId() + ".xml";

        if (fileName == null || fileName.equals("")) {
            //throw new ServletException("File Name can't be null or empty");
            return;
        }

        File file = new File(DATA_PATH + fileName);
        if (!file.exists()) {
            //throw new ServletException("File doesn't exists on server.");
            return;
        }

        // get file and set the header
        String mimeType = ctx.getMimeType(file.getAbsolutePath());
        response.setContentType(mimeType != null ? mimeType : "application/octet-stream");
        response.setContentLength((int) file.length());
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        // write the file to the response
        byte[] bufferData = new byte[1024];
        try (InputStream fis = new FileInputStream(file); ServletOutputStream os = response.getOutputStream()) {

            while ((read = fis.read(bufferData)) != -1) {
                os.write(bufferData, 0, read);
            }

            os.flush();
        }
    }
}
