import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Helper function to split text into lines that fit within the page width.
 * @param {string} text - The text to split.
 * @param {number} fontSize - The font size.
 * @param {number} maxWidth - The maximum width for each line.
 * @param {Object} font - The font to use for measuring text width.
 * @returns {string[]} - An array of lines that fit within the specified width.
 */
const splitTextIntoLines = (text, fontSize, maxWidth, font) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        const lineWithWord = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = font.widthOfTextAtSize(lineWithWord, fontSize);

        if (lineWidth < maxWidth) {
            currentLine = lineWithWord;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

/**
 * Function to download extracted text as a PDF document with multi-page support.
 * @param {string} text - The extracted text.
 */
export const downloadAsPdf = async (text) => {
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28; // Standard A4 page width in points
    const pageHeight = 841.89; // Standard A4 page height in points
    const margin = 50;
    const fontSize = 12;
    
    // Load a font to use for the text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const maxWidth = pageWidth - margin * 2;

    // Split the text by newline characters to handle paragraphs
    const paragraphs = text.split("\n");
    const lineHeight = fontSize * 1.2;
    let yPosition = pageHeight - margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    paragraphs.forEach(paragraph => {
        const lines = splitTextIntoLines(paragraph, fontSize, maxWidth, font);

        lines.forEach(line => {
            // Add a new page if we're running out of space on the current page
            if (yPosition - lineHeight < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            page.drawText(line, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });

            yPosition -= lineHeight;
        });

        // Add extra space between paragraphs
        yPosition -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "extracted_text.pdf");
};
















/**      import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Helper function to split text into lines that fit within the page width.
 * @param {string} text - The text to split.
 * @param {number} fontSize - The font size.
 * @param {number} maxWidth - The maximum width for each line.
 * @param {Object} font - The font to use for measuring text width.
 * @returns {string[]} - An array of lines that fit within the specified width.
 */
/**const splitTextIntoLines = (text, fontSize, maxWidth, font) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        const lineWithWord = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = font.widthOfTextAtSize(lineWithWord, fontSize);

        if (lineWidth < maxWidth) {
            currentLine = lineWithWord;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

/**
 * Function to download extracted text as a Word document with line-by-line organization.
 * @param {string} text - The extracted text.
 */
/**export const downloadAsWord = async (text) => {
    const doc = new Document();
    
    // Split the text by newline characters to handle paragraphs
    const paragraphs = text.split("\n");

    paragraphs.forEach(paragraphText => {
        // Create a new paragraph for each line in the text
        const paragraph = new Paragraph({
            children: [
                new TextRun(paragraphText),
            ],
        });
        doc.addSection({
            properties: {},
            children: [paragraph],
        });
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "extracted_text.docx");
};

/**
 * Function to download extracted text as a PDF document with multi-page support.
 * /**@param {string} text - The extracted text.
 */
/**export const downloadAsPdf = async (text) => {
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28; // Standard A4 page width in points
    const pageHeight = 841.89; // Standard A4 page height in points
    const margin = 50;
    const fontSize = 12;
    
    // Load a font to use for the text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const maxWidth = pageWidth - margin * 2;

    // Split the text by newline characters to handle paragraphs
    const paragraphs = text.split("\n");
    const lineHeight = fontSize * 1.2;
    let yPosition = pageHeight - margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    paragraphs.forEach(paragraph => {
        const lines = splitTextIntoLines(paragraph, fontSize, maxWidth, font);

        lines.forEach(line => {
            // Add a new page if we're running out of space on the current page
            if (yPosition - lineHeight < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            page.drawText(line, {
                x: margin,
                y: yPosition,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });

            yPosition -= lineHeight;
        });

        // Add extra space between paragraphs
        yPosition -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "extracted_text.pdf");
};
      **/