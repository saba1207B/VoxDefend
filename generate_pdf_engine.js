/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import fs from 'fs';

function createPdf(title, sections, outputPath) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 13;

  const pages = [];
  let currentCommands = [];
  let currentY = pageHeight - margin;

  function newPage() {
    if (currentCommands.length > 0) {
      pages.push(currentCommands.join('\n'));
      currentCommands = [];
    }
    currentY = pageHeight - margin;
  }

  function escapePdf(text) {
    return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function addHeader(text) {
    if (currentY < margin + 60) newPage();
    currentY -= 8;
    // Draw horizontal separator
    currentCommands.push(`0.2 0.3 0.4 rg`);
    currentCommands.push(`0.7 0.75 0.8 RG`);
    currentCommands.push(`1 w`);
    currentCommands.push(`${margin} ${currentY} m ${pageWidth - margin} ${currentY} l S`);
    currentY -= 16;

    currentCommands.push(`BT`);
    currentCommands.push(`/F2 13 Tf`);
    currentCommands.push(`0.05 0.2 0.4 rg`);
    currentCommands.push(`${margin} ${currentY} Td`);
    currentCommands.push(`(${escapePdf(text)}) Tj`);
    currentCommands.push(`ET`);
    currentY -= 18;
  }

  function addSubHeader(text) {
    if (currentY < margin + 40) newPage();
    currentCommands.push(`BT`);
    currentCommands.push(`/F2 10 Tf`);
    currentCommands.push(`0.15 0.35 0.55 rg`);
    currentCommands.push(`${margin} ${currentY} Td`);
    currentCommands.push(`(${escapePdf(text)}) Tj`);
    currentCommands.push(`ET`);
    currentY -= 14;
  }

  function addParagraph(text, isBullet = false) {
    const words = text.split(' ');
    let currentLine = '';
    const maxChars = isBullet ? 85 : 90;
    const indent = isBullet ? margin + 15 : margin;

    for (const word of words) {
      if ((currentLine + word).length > maxChars) {
        if (currentY < margin + 25) newPage();
        currentCommands.push(`BT`);
        currentCommands.push(`/F1 9 Tf`);
        currentCommands.push(`0.15 0.15 0.18 rg`);
        currentCommands.push(`${indent} ${currentY} Td`);
        currentCommands.push(`(${escapePdf(currentLine.trim())}) Tj`);
        currentCommands.push(`ET`);
        currentY -= lineHeight;
        currentLine = '';
      }
      currentLine += word + ' ';
    }

    if (currentLine.trim().length > 0) {
      if (currentY < margin + 25) newPage();
      currentCommands.push(`BT`);
      currentCommands.push(`/F1 9 Tf`);
      currentCommands.push(`0.15 0.15 0.18 rg`);
      currentCommands.push(`${indent} ${currentY} Td`);
      currentCommands.push(`(${escapePdf((isBullet ? '• ' : '') + currentLine.trim())}) Tj`);
      currentCommands.push(`ET`);
      currentY -= lineHeight;
    }
  }

  // Cover / Header banner on first page
  currentCommands.push(`0.05 0.12 0.25 rg`);
  currentCommands.push(`${margin} ${currentY - 45} ${contentWidth} 55 re f`);
  currentCommands.push(`BT`);
  currentCommands.push(`/F2 18 Tf`);
  currentCommands.push(`1 1 1 rg`);
  currentCommands.push(`${margin + 15} ${currentY - 22} Td`);
  currentCommands.push(`(${escapePdf(title)}) Tj`);
  currentCommands.push(`ET`);

  currentCommands.push(`BT`);
  currentCommands.push(`/F1 9.5 Tf`);
  currentCommands.push(`0.8 0.9 1 rg`);
  currentCommands.push(`${margin + 15} ${currentY - 37} Td`);
  currentCommands.push(`(${escapePdf("Real-Time Voice Cloning Detection & Enterprise Impersonation Defense | SIH 2026 PS-26104")}) Tj`);
  currentCommands.push(`ET`);
  currentY -= 65;

  // Process sections
  for (const section of sections) {
    if (section.header) addHeader(section.header);
    if (section.subHeader) addSubHeader(section.subHeader);
    if (section.content) {
      for (const item of section.content) {
        if (typeof item === 'string') {
          addParagraph(item);
        } else if (item.bullet) {
          addParagraph(item.bullet, true);
        }
      }
      currentY -= 6;
    }
  }

  if (currentCommands.length > 0) {
    pages.push(currentCommands.join('\n'));
  }

  // Build PDF Objects
  let objIndex = 1;
  const objects = [];

  // 1: Catalog
  const catalogObj = objIndex++;
  // 2: Pages
  const pagesObj = objIndex++;
  // Font 1: Helvetica
  const font1Obj = objIndex++;
  // Font 2: Helvetica-Bold
  const font2Obj = objIndex++;

  const pageObjIds = [];
  const pageStreamIds = [];

  for (let i = 0; i < pages.length; i++) {
    pageObjIds.push(objIndex++);
    pageStreamIds.push(objIndex++);
  }

  const out = [];
  const xrefOffsets = [];

  out.push('%PDF-1.4\n');

  function addObj(str) {
    xrefOffsets.push(out.reduce((acc, chunk) => acc + Buffer.byteLength(chunk, 'latin1'), 0));
    out.push(str);
  }

  // Catalog
  addObj(`${catalogObj} 0 obj\n<< /Type /Catalog /Pages ${pagesObj} 0 R >>\nendobj\n`);

  // Pages
  const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(' ');
  addObj(`${pagesObj} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pages.length} >>\nendobj\n`);

  // Fonts
  addObj(`${font1Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  addObj(`${font2Obj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Pages and Streams
  for (let i = 0; i < pages.length; i++) {
    const pId = pageObjIds[i];
    const sId = pageStreamIds[i];
    const streamContent = pages[i] + `\nBT\n/F1 8 Tf\n0.5 0.5 0.5 rg\n${pageWidth - margin - 60} 25 Td\n(Page ${i + 1} of ${pages.length}) Tj\nET\n`;
    const streamLen = Buffer.byteLength(streamContent, 'latin1');

    addObj(`${pId} 0 obj\n<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${sId} 0 R /Resources << /Font << /F1 ${font1Obj} 0 R /F2 ${font2Obj} 0 R >> >> >>\nendobj\n`);
    addObj(`${sId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`);
  }

  // Xref
  const startXref = out.reduce((acc, chunk) => acc + Buffer.byteLength(chunk, 'latin1'), 0);
  out.push('xref\n');
  out.push(`0 ${objIndex}\n`);
  out.push('0000000000 65535 f \n');
  for (let i = 0; i < xrefOffsets.length; i++) {
    const off = String(xrefOffsets[i]).padStart(10, '0');
    out.push(`${off} 00000 n \n`);
  }
  out.push('trailer\n');
  out.push(`<< /Size ${objIndex} /Root ${catalogObj} 0 R >>\n`);
  out.push('startxref\n');
  out.push(`${startXref}\n`);
  out.push('%%EOF\n');

  fs.writeFileSync(outputPath, out.join(''), 'latin1');
  console.log(`PDF successfully generated at: ${outputPath}`);
}

export { createPdf };
