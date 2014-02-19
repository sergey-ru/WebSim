/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {

    function exportTableToCSV($table, filename) {

        var $rows = $table.find('tr:has(td)'),
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0), // null character

                // actual delimiter characters for CSV format
                colDelim = '","',
                rowDelim = '"\r\n"',
                // Grab text from table into CSV formatted string
                csv = '"' + $rows.map(function(i, row) {
                    var $row = $(row),
                            $cols = $row.find('td');

                    return $cols.map(function(j, col) {
                        var $col = $(col),
                                text = $col.text();

                        return text.replace('"', '""'); // escape double quotes

                    }).get().join(tmpColDelim);

                }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',
                // Data URI
                csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
                .attr({
                    'download': filename,
                    'href': csvData,
                    'target': '_blank'
                });
    }

    // This must be a hyperlink
    $(".export").on('click', function(event) {
        exportTableToCSV.apply(this, [$('#statTableDiv>table'), 'export.csv']);
    });

    parent.top.$('#statTab').click(function(event) {
        var request = new XMLHttpRequest();
        request.open('GET', '/Simulator/SimServlet?request=getStatistics', false);
        request.send(null);
        if (request.status === 200) {
            $("#statTableDiv").html(request.responseText);
            $("#statTable").addClass("table table-condensed");
        }
    });
});
