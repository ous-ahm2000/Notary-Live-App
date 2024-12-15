export const downloadAsCsv = (tableData, fileName) => {
    // Find the max rows and columns in the table
    const maxRow = Math.max(...tableData.map(block => Math.max(...(block.rows || [0]))));
    const maxCol = Math.max(...tableData.map(block => Math.max(...(block.columns || [0]))));

    // Create an empty 2D array for the table
    const csvArray = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(""));

    // Populate the array with words from tableData based on rows and columns
    tableData.forEach(block => {
        block.rows.forEach(row => {
            block.columns.forEach(col => {
                csvArray[row][col] = block.words || "";
            });
        });
    });

    // Convert array to CSV format
    const csvContent = csvArray
        .map(row => row.join(","))
        .join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    link.click();
};
