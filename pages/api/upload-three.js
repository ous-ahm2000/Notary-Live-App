
import fs from "fs";
import path from "path";
import axios from "axios";
require('dotenv').config({ path: '.env.local' });

const bucketDomain = process.env.NEXT_PUBLIC_CLOUD_bucketDomain; 

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { caseUUID, sellerInfo, files, signature } = req.body;

    if (!caseUUID || !sellerInfo || !sellerInfo.id || !files || !signature) {
      return res.status(400).json({ error: "Missing caseUUID, seller information, files, or signature" });
    }

    try {
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const timestamp = new Date().toISOString();
      const folderPath = `${caseUUID}/${sellerInfo.id}_${sellerInfo.firstName}_${sellerInfo.familyName}/${timestamp}`;
      const uploadedUrls = [];

      for (const file of files) {
        const { data, filename } = file;

        // Convert base64 to buffer
        const buffer = Buffer.from(data, "base64");

        // Write to temp file
        const tempFilePath = path.join(tempDir, path.basename(filename));
        fs.writeFileSync(tempFilePath, buffer);

        // Upload to the bucket
        const cloudPath = `${folderPath}/${path.basename(filename)}`;
        await axios.put(`https://${bucketDomain}/${cloudPath}`, fs.createReadStream(tempFilePath), {
          headers: {
            "Content-Type": "application/octet-stream",
            "x-obs-acl": "public-read",
          },
        });

        fs.unlinkSync(tempFilePath);

        const fileUrl = `https://${bucketDomain}/${cloudPath}`;
        uploadedUrls.push(fileUrl);
      }

      // Upload signature
      const signatureBuffer = Buffer.from(signature, "base64");
      const signatureFilename = `${folderPath}/signature.png`;
      const signatureTempPath = path.join(tempDir, "signature.png");
      fs.writeFileSync(signatureTempPath, signatureBuffer);

      await axios.put(`https://${bucketDomain}/${signatureFilename}`, fs.createReadStream(signatureTempPath), {
        headers: { "Content-Type": "image/png", "x-obs-acl": "public-read" },
      });

      fs.unlinkSync(signatureTempPath);

      const metadata = {
        caseUUID,
        sellerInfo,
        uploadedFiles: uploadedUrls,
        signatureUrl: `https://${bucketDomain}/${signatureFilename}`,
        timestamp,
      };

      const metadataFilename = `${folderPath}/metadata.json`;
      const tempMetadataPath = path.join(tempDir, "metadata.json");
      fs.writeFileSync(tempMetadataPath, JSON.stringify(metadata, null, 2));

      await axios.put(`https://${bucketDomain}/${metadataFilename}`, fs.createReadStream(tempMetadataPath), {
        headers: { "Content-Type": "application/json" },
      });

      fs.unlinkSync(tempMetadataPath);

      res.status(200).json({
        message: "Seller files and signature uploaded successfully",
        urls: uploadedUrls,
        signatureUrl: `https://${bucketDomain}/${signatureFilename}`,
        metadataUrl: `https://${bucketDomain}/${metadataFilename}`,
      });
    } catch (error) {
      console.error("Error uploading seller files:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to upload seller files" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
