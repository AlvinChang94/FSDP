const { DocChunk, Faq } = require('../models');
const { getEmbedding, cosineSim } = require('./embeddingService');

const minScore = 0.5;
const minScoreDoc = 0.28

function bufferToFloatArray(buf) {
  // Slice out the exact bytes into a standalone ArrayBuffer
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return Array.from(new Float32Array(ab));
}



function normalize(vec) {
  const len = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return len ? vec.map(v => v / len) : vec;
}

async function retrieveContext(userId, query, { topDocK = 5, topFaqK = 3 } = {}) {
  // 1. Embed the query & normalise it
  let qEmb = await getEmbedding(query);
  qEmb = normalize(qEmb);

  // 2. Fetch stored docs/faqs
  const docChunks = await DocChunk.findAll({ where: { userId }, limit: 200 });
  const faqChunks = await Faq.findAll({ where: { userId }, limit: 100 });

  // 3. Compute scores safely
  const docScores = docChunks.map(chunk => {
    const emb = normalize(bufferToFloatArray(chunk.embedding));
    return { ...chunk.get({ plain: true }), score: cosineSim(qEmb, emb) };
  });

  const faqScores = faqChunks.map(faq => {
    const embQ = normalize(bufferToFloatArray(faq.embQuestion));
    const embQA = normalize(bufferToFloatArray(faq.embQa));
    return {
      ...faq.get({ plain: true }),
      score: Math.max(cosineSim(qEmb, embQ), cosineSim(qEmb, embQA))
    };
  });

  // Optional: log for debugging
  //console.log('Doc scores:', docScores);
  //console.log('FAQ scores:', faqScores);
  

  // 4. Filter & sort
  const topDocs = docScores
    .filter(d => d.score >= minScoreDoc)
    .sort((a, b) => b.score - a.score)
    .slice(0, topDocK);

  const topFaqs = faqScores
    .filter(f => f.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topFaqK);

  return { topDocs, topFaqs };
}

module.exports = { retrieveContext };