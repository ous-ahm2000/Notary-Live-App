
const core = require('@huaweicloud/huaweicloud-sdk-core');
const ocr = require("@huaweicloud/huaweicloud-sdk-ocr/v1/public-api");
require('dotenv').config({ path: '.env.local' });

const ak = process.env.NEXT_PUBLIC_CLOUD_SDK_AK; 
const sk = process.env.NEXT_PUBLIC_CLOUD_SDK_SK; 
const endpoint = "https://ocr.ap-southeast-3.myhuaweicloud.com";
const projectId = process.env.NEXT_PUBLIC_project_id_Table; //  project ID

const credentials = new core.BasicCredentials()
    .withAk(ak)
    .withSk(sk)
    .withProjectId(projectId);

const client = ocr.OcrClient.newBuilder()
    .withCredential(credentials)
    .withEndpoint(endpoint)
    .build();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const request = new ocr.RecognizeGeneralTableRequest();
        const body = new ocr.GeneralTableRequestBody().withUrl(imageUrl);
        request.withBody(body);
        const result = await client.recognizeGeneralTable(request);
        
        console.log("OCR Table API Response:", JSON.stringify(result.result, null, 2));

        res.status(200).json(result.result); // Send the OCR result back to the client
    } catch (error) {
        console.error("OCR request error:", error);
        res.status(500).json({ error: 'Failed to process OCR request' });
    }
}
