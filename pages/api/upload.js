
import fs from "fs";
import path from "path";
import axios from "axios";
require('dotenv').config({ path: '.env.local' });

const bucketDomain = process.env.NEXT_PUBLIC_CLOUD_bucketDomain; 

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { sellerInfo, images } = req.body;

    // Validate input
    if (
      !sellerInfo ||
      !sellerInfo.id ||
      !sellerInfo.firstName ||
      !sellerInfo.familyName ||
      !images ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return res.status(400).json({ error: "Missing seller information or images" });
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

        if (!data || !filename) {
          throw new Error("Invalid image data or filename");
        }

        // Decode Base64 image into a buffer
        const buffer = Buffer.from(data, "base64");

        // Extract folder path
        folderPath = path.dirname(filename);

        // Save the file temporarily
        const tempFilePath = path.join(tempDir, path.basename(filename));
        fs.writeFileSync(tempFilePath, buffer);

        // Upload to Huawei OBS
        const headers = {
          "Content-Type": "application/octet-stream",
          "x-obs-acl": "public-read", // Optional: Public access
        };

        await axios.put(`https://${bucketDomain}/${filename}`, fs.createReadStream(tempFilePath), {
          headers,
        });

        // Cleanup temporary file
        fs.unlinkSync(tempFilePath);

        // Add the public URL to the result array
        const fileUrl = `https://${bucketDomain}/${filename}`;
        uploadedUrls.push(fileUrl);
      }

      // Save metadata as a JSON file
      const metadata = {
        sellerInfo,
        uploadedFiles: uploadedUrls,
        timestamp: new Date().toISOString(),
      };

      const metadataFilename = `${folderPath}/metadata.json`;
      const tempMetadataPath = path.join(tempDir, "metadata.json");
      fs.writeFileSync(tempMetadataPath, JSON.stringify(metadata, null, 2));

      await axios.put(`https://${bucketDomain}/${metadataFilename}`, fs.createReadStream(tempMetadataPath), {
        headers: { "Content-Type": "application/json" },
      });

      // Cleanup metadata file
      fs.unlinkSync(tempMetadataPath);

      res.status(200).json({
        message: "Files uploaded successfully",
        urls: uploadedUrls,
        metadataUrl: `https://${bucketDomain}/${metadataFilename}`,
      });
    } catch (error) {
      console.error("Error uploading to OBS:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to upload to OBS" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
