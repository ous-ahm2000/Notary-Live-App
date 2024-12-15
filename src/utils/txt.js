import { saveAs } from 'file-saver';

/**
 * Function to download text as a TXT file
 * @param {string} text - The text to be saved in TXT format
 */
export const downloadAsTxt = (text, filename) => {
    const txtBlob = new Blob([text], { type: 'text/plain' });
    saveAs(txtBlob, filename);
};
