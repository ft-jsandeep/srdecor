import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Bill } from '@/contexts/AppContext'
import { generateESTRTTemplate } from './billTemplate'

const generateBillHTML = (billData: Bill) => {
  // Use the exact same template as BillPreview
  return generateESTRTTemplate(billData)
}

export async function generatePDFFromBill(bill: Bill): Promise<Blob> {
  const html = generateBillHTML(bill)
  
  // Create a temporary container element
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 800,
      windowWidth: 800
    })

    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgScaledWidth = imgWidth * ratio
    const imgScaledHeight = imgHeight * ratio
    const xOffset = (pdfWidth - imgScaledWidth) / 2
    const yOffset = (pdfHeight - imgScaledHeight) / 2

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)

    // If content is taller than one page, add new pages
    let heightLeft = imgScaledHeight
    let position = 0

    while (heightLeft >= pdfHeight) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight)
      heightLeft -= pdfHeight
    }

    // Convert PDF to blob
    const blob = pdf.output('blob')
    return blob
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

export async function mergeBillsToPDF(bills: Bill[]): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  let isFirstPage = true

  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i]
    const html = generateBillHTML(bill)
    
    // Create a temporary container element
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.innerHTML = html
    document.body.appendChild(container)

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        windowWidth: 800
      })

      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgScaledWidth = imgWidth * ratio
      const imgScaledHeight = imgHeight * ratio
      const xOffset = (pdfWidth - imgScaledWidth) / 2
      const yOffset = (pdfHeight - imgScaledHeight) / 2

      if (!isFirstPage) {
        pdf.addPage()
      }
      isFirstPage = false

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight)

      // If content is taller than one page, add new pages
      let heightLeft = imgScaledHeight
      let position = 0

      while (heightLeft >= pdfHeight) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight)
        heightLeft -= pdfHeight
      }
    } finally {
      // Clean up
      document.body.removeChild(container)
    }
  }

  return pdf.output('blob')
}

