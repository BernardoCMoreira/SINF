const exportBtn = document.getElementById("print-to-pdf");

exportBtn.addEventListener("click", exportToPDF);

function exportToPDF(){
    var pdf = new jsPDF()

    var pdf = new jsPDF('p', 'pt', 'a4');
    pdf.addHTML($("#content-wrapper"), function() {
        pdf.save("report.pdf"); //This will output the PDF in a new window
    });
}