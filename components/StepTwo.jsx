
import React, { useState } from "react";
import axios from "axios";
const StepTwo = ({ nextStep, prevStep, caseUUID, setBuyerInfo }) => {
  const [files, setFiles] = useState([]);
  const [buyerInfo, setLocalBuyerInfo] = useState({
    id: "",
    firstName: "",
    familyName: "",
  });
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFilesChange = (event) => {
    setFiles(event.target.files);
  };

  const handleInfoChange = (event) => {
    const { name, value } = event.target;
    setLocalBuyerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0 || !buyerInfo.id || !buyerInfo.firstName || !buyerInfo.familyName) {
      setUploadStatus("Please provide all information and at least one image.");
      return;
    }

    try {
      setUploadStatus("Preparing data...");

      const timestamp = new Date().toISOString();
      const folderPath = `${caseUUID}/${buyerInfo.id}_${buyerInfo.firstName}_${buyerInfo.familyName}/${timestamp}`;
      const images = [];

      for (const file of files) {
        const base64Image = await convertToBase64(file);
        const filename = `${folderPath}/${file.name}`;
        images.push({ filename, data: base64Image });
      }

      const payload = { caseUUID, buyerInfo: buyerInfo, images };

      setUploadStatus("Uploading...");
      await axios.post("/api/upload-two", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setUploadStatus("Upload successful!");
      setBuyerInfo(buyerInfo); // Pass buyer info to parent
      nextStep();
    } catch (error) {
      setUploadStatus("Error uploading files.");
      console.error("Upload error:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2 id="heading" style={{ color: "white" }}>Step 2: Buyer Information</h2>
      <input id="imageUrlInput" type="text" name="id" placeholder="Buyer ID" onChange={handleInfoChange} />
      <input id="imageUrlInput" type="text" name="firstName" placeholder="First Name" onChange={handleInfoChange} />
      <input id="imageUrlInput" type="text" name="familyName" placeholder="Family Name" onChange={handleInfoChange} />
      <label style={{ color: "white" }}>ID Card:</label>

      <input id="imageUrlInput" type="file" accept="image/*" multiple onChange={handleFilesChange} />
      <button id="convertButton" onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
      <button id="convertButton" onClick={prevStep}>Back</button>
    </div>
  );
};
export default StepTwo;
