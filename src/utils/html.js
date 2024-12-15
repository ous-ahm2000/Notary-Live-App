import { saveAs } from 'file-saver';

/**
 * Function to download text as an HTML file
 * @param {string} text - The text to be saved in HTML format
 */
export const downloadAsHtml = (text, filename) => {
    const htmlContent = `<html><body><pre>${text}</pre></body></html>`;
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    saveAs(htmlBlob, filename);
};
