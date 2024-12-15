import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { downloadAsExcel } from '../src/utils/excel';
import { downloadAsCsv } from '../src/utils/csv';
import { downloadAsPdf } from '../src/utils/pdf';
import { downloadAsWord } from '../src/utils/word';
import { downloadAsXml } from '../src/utils/xml';
import { downloadAsHtml } from '../src/utils/html';
import { downloadAsTxt } from '../src/utils/txt';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/authent';

const allowedFormats = ['png', 'jpg', 'jpeg', 'bmp', 'tiff'];
const acceptedFormats = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tga', 'webp', 'ico', 'pcx', 'gif'];

const OcrManager = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [tableData, setTableData] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [fileFormat, setFileFormat] = useState('pdf');
  const [user, setUser] = useState(null);
  const [ocrMode, setOcrMode] = useState('table'); // Default mode is 'table'
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <p>...</p>; // Show loading until user is authenticated
  }

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setTableData([]);
    setExtractedText('');
    setError(null);
  };

  const handleOcrRequest = async () => {
    if (!imageUrl) return;

    const fileExtension = imageUrl.split('.').pop().toLowerCase();

    if (ocrMode === 'table' && !allowedFormats.includes(fileExtension)) {
      setError('Only images in PNG, JPG, JPEG, BMP, or TIFF format can be recognized for tables.');
      return;
    }

    if (ocrMode === 'text' && !acceptedFormats.includes(fileExtension)) {
      setError('Only images in JPG, JPEG, PNG, BMP, TIFF, TGA, WebP, ICO, PCX, or GIF format can be recognized for text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        ocrMode === 'table' ? '/api/ocrTableHandler' : '/api/ocrHandler', 
        { imageUrl }
      );

      if (ocrMode === 'table') {
        setTableData(response.data.words_region_list[0].words_block_list || []);
        setIsTableVisible(true);
      } else {
        setExtractedText(response.data.extractedText || "No text extracted");
      }
    } catch (error) {
      setError("Error processing OCR: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (ocrMode === 'table') {
      if (tableData.length === 0) {
        alert("No table data to download.");
        return;
      }
      if (fileFormat === 'excel') {
        downloadAsExcel(tableData, 'OCR_Table.xlsx');
      } else if (fileFormat === 'csv') {
        downloadAsCsv(tableData, 'OCR_Table.csv');
      }
    } else {
      if (!extractedText) {
        alert("No text data to download.");
        return;
      }
      switch (fileFormat) {
        case 'pdf':
          downloadAsPdf(extractedText, 'OCR_Live.pdf');
          break;
        case 'word':
          downloadAsWord(extractedText, 'OCR_Live.docx');
          break;
        case 'excel':
          downloadAsExcel(extractedText, 'OCR_Live.xlsx');
          break;
        case 'xml':
          downloadAsXml(extractedText, 'OCR_Live.xml');
          break;
        case 'html':
          downloadAsHtml(extractedText, 'OCR_Live.html');
          break;
        case 'txt':
          downloadAsTxt(extractedText, 'OCR_Live.txt');
          break;
        default:
          break;
      }
    }
  };

  const getTableRows = () => {
    const maxRow = Math.max(...tableData.map(block => Math.max(...(block.rows || [0]))));
    const maxCol = Math.max(...tableData.map(block => Math.max(...(block.columns || [0]))));
    const tableRows = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(""));

    tableData.forEach(block => {
      if (block.rows && block.columns) {
        block.rows.forEach(row => {
          block.columns.forEach(col => {
            tableRows[row][col] = block.words || "";
          });
        });
      }
    });

    return tableRows;
  };

  const handleCellChange = (e, rowIndex, colIndex) => {
    const newData = [...tableData];
    newData.forEach((block) => {
      if (block.rows.includes(rowIndex) && block.columns.includes(colIndex)) {
        block.words = e.target.value;
      }
    });
    setTableData(newData);
  };

  return (
    <div id="ocrContainer" style={{ marginTop: '20px', maxWidth: '1200px', width: '90%' }}>
      <h2 id="heading" style={{ color: "white" }}>{ocrMode === 'table' ? 'Place your table document image URL from verification to extract agreement related data' : 'Place your document image URL from verification to extract agreement related data'}</h2>
      <div>
  <label style={{ color: "white" }}>
    <input
      type="radio"
      name="ocrMode"
      value="table"
      
      checked={ocrMode === 'table'}
      onChange={() => setOcrMode('table')}
    />
    OCR Table
  </label>
  <label style={{ color: "white" }}>
    <input
      type="radio"
      name="ocrMode"
      value="text"
       
      checked={ocrMode === 'text'}
      onChange={() => setOcrMode('text')}
    />
    OCR Text
  </label>
</div>
      <input
        id="imageUrlInput"
        type="text"
        placeholder="Enter image URL"
        value={imageUrl}
        onChange={handleUrlChange}
      />
      <button id="convertButton" onClick={handleOcrRequest} disabled={loading}>
        {loading ? 'Processing...' : 'Convert'}
      </button>

      {error && <div id="errorText" style={{ color: 'red' }}>{error}</div>}

     {/* <div>
        <button onClick={() => setOcrMode('table')}>OCR Table</button>
        <button onClick={() => setOcrMode('text')}>OCR Text</button>
      </div>*/}
      
      {ocrMode === 'table' && isTableVisible && (
        <div className="table-container">
          <h3 id="headings" style={{ color: "white" }}>Make necessary edits before download:</h3>
          <div className="table-wrapper">
            <table>
              <tbody>
                {getTableRows().map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(e, rowIndex, colIndex)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 id="formatHeading" style={{ color: "white" }}>Choose a file format</h3>
          <div id="formatContainer">
            <select id="formatSelect" value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <button id="downloadButton" onClick={handleDownload}>Download</button>
          </div>
        </div>
      )}

      {ocrMode === 'text' && extractedText && (
        <div id="textContainer">
          <h3 id="editHeading" style={{ color: "white" }}>Make necessary edit before download:</h3>
          <textarea
            id="textArea"
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows="10"
            cols="50"
          />
          <h3 id="heading" style={{ color: "white" }}>Choose a file format</h3>
          <div id="formatContainer">
            <select id="formatSelect" value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
              <option value="xml">XML</option>
              <option value="html">HTML</option>
              <option value="txt">TXT</option>
            </select>
            <button id="downloadButton" onClick={handleDownload}>Download</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrManager;
