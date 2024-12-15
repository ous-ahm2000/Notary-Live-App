import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";

const StepFour = ({ caseUUID, buyerInfo, nextStep, prevStep }) => {
  const [agreementFiles, setAgreementFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const signatureRef = useRef(null);

  const handleFilesChange = (e) => setAgreementFiles(e.target.files);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!caseUUID || signatureRef.current.isEmpty() || agreementFiles.length === 0) {
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

      // Convert files to Base64
      const filesBase64 = [];
      for (const file of agreementFiles) {
        const base64 = await convertFileToBase64(file);
        filesBase64.push({ filename: file.name, data: base64 });
      }

      // Prepare payload
      const payload = {
        caseUUID,
        buyerInfo, // Example buyerInfo
        files: filesBase64,
        signature: signatureData,
      };

      // Make the API request
      await axios.post("/api/upload-four", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setUploadStatus("Buyer's agreement uploaded successfully!");
      nextStep();
    } catch (error) {
      console.error(error);
      setUploadStatus("Error uploading the buyer's agreement. Please try again.");
    }
  };

  return (
    <div>
      <h2 id="heading" style={{ color: "white" }}>Step 4: Buyers Agreement and Signature</h2>
      <SignatureCanvas
        ref={signatureRef}
        canvasProps={{
          className: "signatureCanvas",
          style: { border: "1px solid black", width: "100%", height: "200px" },
        }}
      />
      <button id="convertButton" onClick={() => signatureRef.current.clear()}>Clear Signature</button>
      <p>Sign the agreement</p>
            {/* File Upload */}      <label style={{ color: "white" }}>Upload deed of sale agreement files : (proof of fund)</label>

      <input id="imageUrlInput" type="file" multiple onChange={handleFilesChange} />
      <p>Upload agreement files</p>
      <button id="convertButton" onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
      <button id="convertButton" onClick={prevStep}>Back</button>
    </div>
  );
};

export default StepFour;