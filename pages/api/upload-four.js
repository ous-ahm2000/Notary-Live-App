
import fs from "fs";
import path from "path";
import axios from "axios";
require('dotenv').config({ path: '.env.local' });

const bucketDomain = process.env.NEXT_PUBLIC_CLOUD_bucketDomain; 

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { caseUUID, buyerInfo, files, signature } = req.body;

    if (!caseUUID || !buyerInfo || !files || !signature) {
      return res.status(400).json({ error: "Missing buyer information, files, or signature" });
    }

    try {
      const { id, firstName, familyName } = buyerInfo;
      if (!id || !firstName || !familyName) {
        return res.status(400).json({ error: "Incomplete buyer information" });
      }

      // Generate timestamp and folder path
      const timestamp = new Date().toISOString();
      const folderPath = `${caseUUID}/${id}_${firstName}_${familyName}/${timestamp}`;

      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const uploadedUrls = [];

      for (const file of files) {
        const { data, filename } = file;

        const buffer = Buffer.from(data, "base64");
        const tempFilePath = path.join(tempDir, path.basename(filename));
        fs.writeFileSync(tempFilePath, buffer);

        const objectKey = `${folderPath}/${filename}`;
        await axios.put(`https://${bucketDomain}/${objectKey}`, fs.createReadStream(tempFilePath), {
          headers: {
            "Content-Type": "application/octet-stream",
            "x-obs-acl": "public-read",
          },
        });

        fs.unlinkSync(tempFilePath);

        const fileUrl = `https://${bucketDomain}/${objectKey}`;
        uploadedUrls.push(fileUrl);
      }

      // Upload signature
      const signatureBuffer = Buffer.from(signature, "base64");
      const signatureFilename = `${folderPath}/buyer-signature.png`;
      const signatureTempPath = path.join(tempDir, "buyer-signature.png");
      fs.writeFileSync(signatureTempPath, signatureBuffer);

      await axios.put(`https://${bucketDomain}/${signatureFilename}`, fs.createReadStream(signatureTempPath), {
        headers: { "Content-Type": "image/png", "x-obs-acl": "public-read" },
      });

      fs.unlinkSync(signatureTempPath);

      // Save metadata
      const metadata = {
        caseUUID,
        buyerInfo,
        uploadedFiles: uploadedUrls,
        signatureUrl: `https://${bucketDomain}/${signatureFilename}`,
        timestamp,
      };

      const metadataFilename = `${folderPath}/buyer-metadata.json`;
      const tempMetadataPath = path.join(tempDir, "buyer-metadata.json");
      fs.writeFileSync(tempMetadataPath, JSON.stringify(metadata, null, 2));

      await axios.put(`https://${bucketDomain}/${metadataFilename}`, fs.createReadStream(tempMetadataPath), {
        headers: { "Content-Type": "application/json" },
      });

      fs.unlinkSync(tempMetadataPath);

      res.status(200).json({
        message: "Buyer files and signature uploaded successfully",
        urls: uploadedUrls,
        signatureUrl: `https://${bucketDomain}/${signatureFilename}`,
        metadataUrl: `https://${bucketDomain}/${metadataFilename}`,
      });
    } catch (error) {
      console.error("Error uploading buyer files:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to upload buyer files" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
