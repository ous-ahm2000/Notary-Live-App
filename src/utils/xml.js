import { saveAs } from 'file-saver';

/**
 * Function to download text as an XML file
 * @param {string} text - The text to be saved in XML format
 */
export const downloadAsXml = (text, filename) => {
    const xmlContent = `<extractedText><![CDATA[${text}]]></extractedText>`;
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    saveAs(xmlBlob, filename);
};
