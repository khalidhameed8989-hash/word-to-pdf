const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");
const loading = document.getElementById("loading");

let selectedFile = null;

dropArea.addEventListener("dragover", function(e) {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", function() {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", function(e) {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        selectedFile = files[0];
        handleFile(selectedFile);
    }
});

fileInput.addEventListener("change", function() {
    selectedFile = fileInput.files[0];
    handleFile(selectedFile);
});

function handleFile(file) {
    if (!file.name.endsWith(".docx")) {
        alert("Only .docx files allowed!");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then(function(result) {
            preview.innerHTML = result.value;
            
        })
        .catch(function(error) {
            alert("Error reading file");
            convertBtn.disabled = false;
       });
    };
    reader.readAsArrayBuffer(file);
}

convertBtn.addEventListener("click", function() {
    if (!selectedFile) {
        alert("Upload a Word file first!");
        return;
    }
    loading.classList.remove("hidden");
    setTimeout(function() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const text = preview.innerText;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 10;
        const maxWidth = 180;
        const lines = pdf.splitTextToSize(text, maxWidth);
        let y = margin;
        lines.forEach(function(line) {
            if (y > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }
            pdf.text(line, margin, y);
            y += 7;
        });
        pdf.save("converted.pdf");
        loading.classList.add("hidden");
        alert("PDF Downloaded Successfully!");
    }, 500);
});
