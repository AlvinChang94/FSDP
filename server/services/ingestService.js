const crypto = require('crypto');
const { chunkText } = require('./chunkText');
const { Document, DocChunk, Faq } = require('../models');
const { getEmbedding } = require('./embeddingService');


async function ingestDocument(userId, meta, rawText) {
  // Step 1: Chunk the document with structure awareness
  const chunks = chunkText(rawText, { targetTokens: 100, overlap: 5 });

  // Step 2: Create the document record
  const document = await Document.create({ userId, ...meta });

  // Step 3: Loop through chunks, dedupe, embed, and save
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i].trim();
    if (!text) continue;

    const hash = crypto.createHash('sha256').update(text).digest('hex');

    const exists = await DocChunk.findOne({ where: { userId, textHash: hash } });
    if (exists) continue;

    const embedding = await getEmbedding(text);

    await DocChunk.create({
      userId,
      documentId: document.id,
      chunkIndex: i,
      text,
      textHash: hash,
      tokenCount: Math.ceil(text.length / 4),
      embedding: Buffer.from(new Float32Array(embedding).buffer)
    });
  }
}



async function ingestFaq(userId, { category, question, answer }) {
    const answerSummary = answer.length > 300 ? answer.slice(0, 297) + '...' : answer;
    const embQuestion = await getEmbedding(question);
    const embQa = await getEmbedding(`Q: ${question}\nA: ${answerSummary}`);

    const newFaq = await Faq.create({
        userId,
        category,
        question,
        answer,
        embQuestion: Buffer.from(new Float32Array(embQuestion).buffer),
        embQa: Buffer.from(new Float32Array(embQa).buffer),
    });
    return newFaq
}

module.exports = { ingestDocument, ingestFaq };
