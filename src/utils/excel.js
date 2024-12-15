import * as XLSX from 'xlsx';

export const downloadAsExcel = (tableData, fileName) => {
    // Find the max rows and columns in the table
    const maxRow = Math.max(...tableData.map(block => Math.max(...(block.rows || [0]))));
    const maxCol = Math.max(...tableData.map(block => Math.max(...(block.columns || [0]))));

    // Create an empty 2D array for the table
    const excelArray = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(""));

    // Populate the array with words from tableData based on rows and columns
    tableData.forEach(block => {
        block.rows.forEach(row => {
            block.columns.forEach(col => {
                excelArray[row][col] = block.words || "";
            });
        });
    });

    // Convert 2D array to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelArray);
    
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Write the file
    XLSX.writeFile(workbook, fileName);
};
