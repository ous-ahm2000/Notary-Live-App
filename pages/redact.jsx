
import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";

const NotaryDocument = () => {
  const [clientName, setClientName] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [caseUUID, setcaseUUID] = useState("");

  const [documentDate, setDocumentDate] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Deed of Sale");
  const [documentText, setDocumentText] = useState("");
  const [notaryName, setNotaryName] = useState("");
  const [dateSigned, setDateSigned] = useState("");
  const [sellerSignatureUrl, setSellerSignatureUrl] = useState("");
  const [buyerSignatureUrl, setBuyerSignatureUrl] = useState("");
  const [notaryStampUrl, setNotaryStampUrl] = useState("");

  // Function to generate PDF
  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();

      // Add text to the PDF
      page.drawText(documentTitle, { x: 50, y: height - 50, size: 20, color: rgb(0, 0.53, 0.71) });
      page.drawText(`Client Name: ${clientName}`, { x: 50, y: height - 80, size: 12 });
      page.drawText(`Seller Name: ${sellerName}`, { x: 50, y: height - 100, size: 12 });
      page.drawText(`Case UUID: ${caseUUID}`, { x: 50, y: height - 120, size: 12 });
      page.drawText(`Document Date: ${documentDate}`, { x: 50, y: height - 140, size: 12 });
      page.drawText(`Notary Name: ${notaryName}`, { x: 50, y: height - 160, size: 12 });
      page.drawText(`Date Signed: ${dateSigned}`, { x: 50, y: height - 180, size: 12 });
      page.drawText("Agreement :", { x: 50, y: height - 200, size: 12 });
      page.drawText(documentText, {
        x: 50,
        y: height - 220,
        size: 10,
        lineHeight: 12,
        maxWidth: 500,
      });

      // Add signatures and notary stamp images
      if (sellerSignatureUrl) {
        const sellerSignatureBytes = await fetch(sellerSignatureUrl).then((res) => res.arrayBuffer());
        const sellerSignatureImage = await pdfDoc.embedPng(sellerSignatureBytes);
        page.drawImage(sellerSignatureImage, { x: 50, y: 100, width: 150, height: 50 });
        page.drawText("Seller's Signature", { x: 50, y: 90, size: 10 });
      }
      if (buyerSignatureUrl) {
        const buyerSignatureBytes = await fetch(buyerSignatureUrl).then((res) => res.arrayBuffer());
        const buyerSignatureImage = await pdfDoc.embedPng(buyerSignatureBytes);
        page.drawImage(buyerSignatureImage, { x: 250, y: 100, width: 150, height: 50 });
        page.drawText("Buyer's Signature", { x: 250, y: 90, size: 10 });
      }
      if (notaryStampUrl) {
        const notaryStampBytes = await fetch(notaryStampUrl).then((res) => res.arrayBuffer());
        const notaryStampImage = await pdfDoc.embedPng(notaryStampBytes);
        page.drawImage(notaryStampImage, { x: width - 150, y: height - 200, width: 100, height: 100 });
      }

      // Save the PDF as bytes
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Error generating PDF");
    }
  };

  // Function to handle PDF download
const download = async () => {
  try {
    const pdfBytes = await generatePDF();  // Generate PDF
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    // Create a URL for the Blob and trigger download
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseUUID}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};


  
  
  
  return (
    <div id="ocrContainer" style={{ marginTop: '20px', maxWidth: '1200px', width: '100%' }}>

    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 id="heading"style={{ color: "white" , marginBottom: "20px"}}>{documentTitle}</h1>
      <label style={{ color: "white" }}>Case UUID:</label>

      <input
        type="text"id="imageUrlInput"
        value={caseUUID}
        onChange={(e) => setcaseUUID(e.target.value)}
        placeholder="Enter client name"
        style={{ display: "block", marginBottom: "20px" }}
      />
      <label style={{ color: "white" }}>Client Name:</label>

      <input
        type="text"id="imageUrlInput"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Enter client name"
        style={{ display: "block", marginBottom: "20px" }}
      />
      <label style={{ color: "white" }}>Seller Name:</label>

<input
  type="text"id="imageUrlInput"
  value={sellerName}
  onChange={(e) => setSellerName(e.target.value)}
  placeholder="Enter client name"
  style={{ display: "block", marginBottom: "20px" }}
/>
              <label style={{ color: "white" }}>Document Date:</label>

      <input
        type="date"id="imageUrlInput"
        value={documentDate}
        onChange={(e) => setDocumentDate(e.target.value)}
        style={{ display: "block", marginBottom: "20px" }}
      />
              <label style={{ color: "white" }}>Document Content:</label>
              <div style={{ marginBottom: '20px'  }}>
      <textarea
        value={documentText}id="imageUrlInput"
        onChange={(e) => setDocumentText(e.target.value)}
        placeholder="Write the agreement..."
        style={{ width: '700px', height: '500px', padding: '10px' }}
      /></div>
              <label style={{ color: "white" }}>Notary s Name :</label>

      <input
        type="text"id="imageUrlInput"
        value={notaryName}
        onChange={(e) => setNotaryName(e.target.value)}
        placeholder="Enter notary name"
        style={{ display: "block", marginBottom: "20px" }}
      />
              <label style={{ color: "white" }}>Date of signature</label>

      <input
        type="date"id="imageUrlInput"
        value={dateSigned}
        onChange={(e) => setDateSigned(e.target.value)}
        style={{ display: "block", marginBottom: "20px" }}
      />
              <label style={{ color: "white" }}>Seller Signature</label>

      <input
        type="text"id="imageUrlInput"
        value={sellerSignatureUrl}
        onChange={(e) => setSellerSignatureUrl(e.target.value)}
        placeholder="Seller's signature image URL"
        style={{ display: "block", marginBottom: "20px" }}
      />
              <label style={{ color: "white" }}>Buyer Signature</label>

      <input
        type="text"id="imageUrlInput"
        value={buyerSignatureUrl}
        onChange={(e) => setBuyerSignatureUrl(e.target.value)}
        placeholder="Buyer's signature image URL"
        style={{ display: "block", marginBottom: "20px" }}
      />
              <label style={{ color: "white" }}>Notary Stamp:</label>
              <div style={{ marginBottom: '20px' }}>
      <input
        type="text"id="imageUrlInput"
        value={notaryStampUrl}
        onChange={(e) => setNotaryStampUrl(e.target.value)}
        placeholder="Notary stamp image URL"
        style={{ display: "block", marginBottom: "20px" }}
      /></div>
        {/* Add other fields here (Document Date, Notary Name, Signatures, etc.) */                  }
        <button id="convertButton" onClick={download}>
          download Agreement to send to client 
        </button>
      </div>
    </div>
  );
};

export default NotaryDocument;
