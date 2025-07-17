/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Function to export data to Excel
export const downloadExcel = (data, fileName) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data.map(item => {
      // Flatten nested objects for Excel export
      return {
        ...item,
        applicantName: item.applicant?.name || '',
        applicantId: item.applicant?.id || '',
        plotNumber: item.plot?.number || '',
        plotType: item.plot?.type || '',
        plotSize: item.plot?.size || '',
        plotWard: item.plot?.ward || '',
        plotVillage: item.plot?.village || '',
      };
    }));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Function to export data to PDF
export const downloadPdf = (data, fileName) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Allocations Report', 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare data for the table
    const tableData = data.map(item => [
      item.id,
      item.applicant?.name || '',
      item.plot?.number || '',
      item.plot?.type || '',
      item.plot?.size || '',
      item.plot?.ward || '',
      item.plot?.village || '',
      new Date(item.allocationDate).toLocaleDateString(),
      item.status,
      item.paymentStatus
    ]);
    
    // Add table to PDF
    doc.autoTable({
      head: [
        ['ID', 'Applicant', 'Plot No.', 'Type', 'Size', 'Ward', 'Village', 'Allocation Date', 'Status', 'Payment Status']
      ],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Save the PDF
    doc.save(`${fileName}_${new Date().toISOString().slice(0,10)}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};