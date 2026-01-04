import { Bill } from '@/contexts/AppContext'
import { generateESTRTTemplate } from './billTemplate'

const generateBillHTML = (billData: Bill) => {
  // Use the exact same template as BillPreview
  return generateESTRTTemplate(billData)
}

/**
 * Opens bills in a new window for native browser print preview
 * Uses browser's native print dialog to save as PDF
 */
export function openBillsForPrint(bills: Bill[]): void {
  if (bills.length === 0) {
    alert('No bills to print')
    return
  }

  // Generate HTML for all bills
  const billsHTML = bills.map((bill, index) => {
    const billHTML = generateBillHTML(bill)
    // Add page break after each bill (except the last one)
    const pageBreak = index < bills.length - 1 ? '<div style="page-break-after: always;"></div>' : ''
    return `<div class="bill-page">${billHTML}${pageBreak}</div>`
  }).join('')

  // Create complete HTML document with print styles
  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Merged Bills - Print</title>
        <style>
          @media screen {
            body {
              margin: 20px;
              background: #f5f5f5;
            }
            .bill-page {
              background: white;
              margin-bottom: 20px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 24px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .print-button:hover {
              background: #0056b3;
            }
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .bill-page {
              page-break-after: always;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            .bill-page:last-child {
              page-break-after: auto;
            }
            .print-button {
              display: none;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        ${billsHTML}
        <script>
          // Auto-focus and optionally auto-print (commented out - user can click button)
          window.focus();
          // Uncomment the line below if you want to auto-trigger print dialog
          // setTimeout(() => window.print(), 500);
        </script>
      </body>
    </html>
  `

  // Open new window and write HTML
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('Please allow popups to open the print preview')
    return
  }

  printWindow.document.write(fullHTML)
  printWindow.document.close()

  // Wait for content to load, then focus
  printWindow.onload = () => {
    printWindow.focus()
  }
}

