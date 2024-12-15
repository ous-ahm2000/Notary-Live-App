import { OcrClient, RecognizeWebImageRequest, WebImageRequestBody } from '@huaweicloud/huaweicloud-sdk-ocr/v1/public-api';
import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core';

require('dotenv').config({ path: '.env.local' });

const ak = process.env.NEXT_PUBLIC_CLOUD_SDK_AK; 
const sk = process.env.NEXT_PUBLIC_CLOUD_SDK_SK; 
const endpoint = "https://ocr.ap-southeast-2.myhuaweicloud.com";
const projectId = process.env.NEXT_PUBLIC_project_id_Image; // project ID



const credentials = new BasicCredentials()
    .withAk(ak)
    .withSk(sk)
    .withProjectId(projectId);

const client = OcrClient.newBuilder()
    .withCredential(credentials)
    .withEndpoint(endpoint)
    .build();

const ocrHandler = async (req, res) => {
    if (req.method === 'POST') {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        const body = new WebImageRequestBody().withUrl(imageUrl);
        const request = new RecognizeWebImageRequest().withBody(body);

        try {
            const result = await client.recognizeWebImage(request);

            console.log("Full OCR Response:", result); // Log the full response to verify structure
            const wordsBlockList = result?.result?.words_block_list;

            if (!wordsBlockList || wordsBlockList.length === 0) {
                return res.status(500).json({ error: 'No text found in OCR response' });
            }
 
            console.log("Full Words Block List Response:", JSON.stringify(wordsBlockList));

            // Extract and concatenate text from each words block
            const extractedText = wordsBlockList.map(block => block.words).join('\n');
            res.status(200).json({ extractedText }); // Send extracted text as response
        } catch (error) {
            console.error("OCR Error:", error); // Log the error for debugging
            res.status(500).json({ error: 'Error processing OCR' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default ocrHandler; 