
import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const StepOne = ({ nextStep, setCaseUUID, setSellerInfo }) => {
  const [files, setFiles] = useState([]);
  const [sellerInfoLocal, setSellerInfoLocal] = useState({
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
    setSellerInfoLocal((prev) => ({ ...prev, [name]: value }));
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
    if (
      files.length === 0 ||
      !sellerInfoLocal.id ||
      !sellerInfoLocal.firstName ||
      !sellerInfoLocal.familyName
    ) {
      setUploadStatus("Please provide all information and at least one image.");
      return;
    }

    try {
      setUploadStatus("Preparing data...");

      const caseUUID = uuidv4();
      setCaseUUID(caseUUID);
      setSellerInfo(sellerInfoLocal); // Pass seller info to parent

      const timestamp = new Date().toISOString();
      const folderPath = `${caseUUID}/${sellerInfoLocal.id}_${sellerInfoLocal.firstName}_${sellerInfoLocal.familyName}/${timestamp}`;
      const images = [];

      for (const file of files) {
        const base64Image = await convertToBase64(file);
        const filename = `${folderPath}/${file.name}`;
        images.push({ filename, data: base64Image });
      }

      const payload = { caseUUID, sellerInfo: sellerInfoLocal, images };

      setUploadStatus("Uploading...");

      const response = await axios.post("/api/upload", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setUploadStatus("Upload successful!");
      console.log("Response:", response.data);
      nextStep();
    } catch (error) {
      setUploadStatus("Error uploading files.");
      console.error("Upload error:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2 id="heading" style={{ color: "white" }}>
        Step 1: Seller Information
      </h2>

      <input
        id="imageUrlInput"
        type="text"
        name="id"
        placeholder="Seller ID"
        onChange={handleInfoChange}
      />
      <input
        id="imageUrlInput"
        type="text"
        name="firstName"
        placeholder="First Name"
        onChange={handleInfoChange}
      />

      <input
        id="imageUrlInput"
        type="text"
        name="familyName"
        placeholder="Family Name"
        onChange={handleInfoChange}
      />            
      <label style={{ color: "white" }}>ID Card:</label>

      <input id="imageUrlInput" type="file" accept="image/*" multiple onChange={handleFilesChange} />
      <button id="convertButton" onClick={handleUpload}>
        Upload
      </button>
      <p>{uploadStatus}</p>
    </div>
  );
};

export default StepOne;
