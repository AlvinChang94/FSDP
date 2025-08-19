const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const ingestService = require('../services/ingestService')
const { Document, DocChunk, Faq } = require('../models');

async function extractText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
}

async function ingestPdf(userId, fileName) {
    const filePath = path.join(__dirname, '..', 'uploaded', String(userId), fileName);
    const rawText = await extractText(filePath);

    // meta can hold fileName, source type, etc.
    const meta = { title: fileName, source: 'upload-policy/pdf', mimeType: 'application/pdf' };
    await ingestService.ingestDocument(userId, meta, rawText);
}


async function removePdf(userId, fileName) {
    const document = await Document.findOne({
        where: { userId, title: fileName }
    });
    if (!document) return;

    // Remove all related chunks
    await DocChunk.destroy({
        where: { userId, documentId: document.id }
    });

    // Remove the document record
    await Document.destroy({
        where: { id: document.id }
    });

}

module.exports = { ingestPdf, removePdf };