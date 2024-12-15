
import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";

const StepThree = ({ caseUUID, sellerInfo, nextStep, prevStep }) => {
  const [agreementFiles, setAgreementFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const signatureRef = useRef(null);

  // Handle agreement files change
  const handleFilesChange = (e) => setAgreementFiles(e.target.files);

  // Convert file to Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle upload
  const handleUpload = async () => {
    if (!caseUUID || !sellerInfo || signatureRef.current.isEmpty() || agreementFiles.length === 0) {
      setUploadStatus("Please sign and upload the agreement files.");
      return;
    }

    try {
      setUploadStatus("Uploading...");

      // Prepare signature data
      const signatureData = signatureRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png")
        .split(",")[1];

      // Convert agreement files to Base64
      const filesBase64 = [];
      for (const file of agreementFiles) {
        const base64 = await convertFileToBase64(file);
        filesBase64.push({ filename: file.name, data: base64 });
      }

      // Prepare payload
      const payload = {
        caseUUID,
        sellerInfo,
        files: filesBase64,
        signature: signatureData,
      };

      // Send data to the server
      await axios.post("/api/upload-three", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setUploadStatus("Seller's agreement uploaded successfully!");
      nextStep();
    } catch (error) {
      console.error(error);
      setUploadStatus("Error uploading the seller's agreement. Please try again.");
    }
  };

  return (
    <div>
      <h2 id="heading" style={{ color: "white" }}>Step 3: Sellers Agreement and Signature</h2>
      
      {/* Signature Canvas */}
      <SignatureCanvas
        ref={signatureRef}
        canvasProps={{
          className: "signatureCanvas",
          style: { border: "1px solid black", width: "100%", height: "200px" },
        }}
      />
      <button id="convertButton" onClick={() => signatureRef.current.clear()}>Clear Signature</button>
      <p>Sign the agreement</p>
      
      {/* File Upload */}      <label style={{ color: "white" }}>Upload deed of sale agreement files : (proof of ownership)</label>

      <input id="imageUrlInput" type="file" multiple onChange={handleFilesChange} />

      {/* Upload Button */}
      <button id="convertButton" onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
      
      {/* Navigation Buttons */}
      <button id="convertButton" onClick={prevStep}>Back</button>
    </div>
  );
};

export default StepThree;

