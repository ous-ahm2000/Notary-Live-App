import fs from "fs";
import path from "path";
import axios from "axios";
require('dotenv').config({ path: '.env.local' });

const bucketDomain = process.env.NEXT_PUBLIC_CLOUD_bucketDomain; 

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { caseUUID, buyerInfo, images } = req.body;

    if (!caseUUID || !buyerInfo || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing buyer information or images" });
    }

    try {
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const uploadedUrls = [];
      let folderPath = "";

      for (const image of images) {
        const { data, filename } = image;

        const buffer = Buffer.from(data, "base64");
        folderPath = path.dirname(filename);

        const tempFilePath = path.join(tempDir, path.basename(filename));
        fs.writeFileSync(tempFilePath, buffer);

        await axios.put(`https://${bucketDomain}/${filename}`, fs.createReadStream(tempFilePath), {
          headers: {
            "Content-Type": "application/octet-stream",
            "x-obs-acl": "public-read",
          },
        });

        fs.unlinkSync(tempFilePath);

        const fileUrl = `https://${bucketDomain}/${filename}`;
        uploadedUrls.push(fileUrl);
      }

      const metadata = {
        caseUUID,
        buyerInfo,
        uploadedFiles: uploadedUrls,
        timestamp: new Date().toISOString(),
      };

      const metadataFilename = `${folderPath}/metadata.json`;
      const tempMetadataPath = path.join(tempDir, "metadata.json");
      fs.writeFileSync(tempMetadataPath, JSON.stringify(metadata, null, 2));

      await axios.put(`https://${bucketDomain}/${metadataFilename}`, fs.createReadStream(tempMetadataPath), {
        headers: { "Content-Type": "application/json" },
      });

      fs.unlinkSync(tempMetadataPath);

      res.status(200).json({
        message: "Buyer files uploaded successfully",
        urls: uploadedUrls,
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
