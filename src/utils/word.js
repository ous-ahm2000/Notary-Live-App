
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph } from 'docx';

// Function to download extracted text as a Word document with line breaks preserved
export const downloadAsWord = async (text) => {
    // Split the text by line breaks to create paragraphs
    const paragraphs = text.split(/\r?\n/).map(line => new Paragraph(line));

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_text.docx");
};

/** import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph } from 'docx';

// Function to download extracted text as a Word document
export const downloadAsWord = async (text) => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph(text),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_text.docx");
}; **/
