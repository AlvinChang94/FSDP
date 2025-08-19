function chunkText(text, { targetTokens = 100, overlap = 5 } = {}) {
  // 1) Clean and normalize
  let clean = String(text || '')
    .replace(/undefined/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Insert a newline BEFORE list/section markers if they are glued to prior text
  // Examples handled: "...etc.]1. Coverage", "...losses resulting from: a. Intentional", "...text- Bullet"
  clean = clean
    // Before numbered clauses like "1. Coverage"
    .replace(/([^\n])(?=\d+\.\s+[A-Z])/g, '$1\n')
    // Before lettered sub-clauses like "a. Intentional"
    .replace(/([^\n])(?=[a-z]\.\s+[A-Z])/g, '$1\n')
    // Before bullets like "- Premiums"
    .replace(/([^\n])(?=\s*[-•*]\s+)/g, '$1\n');

  // 2) Scan lines and build structure
  const lines = clean.split('\n');

  const sections = []; // [{ heading: 'Coverage', items: ['Covers...', 'Includes...'], body: '...' }]
  let introBuffer = [];
  let currentSection = null;
  let currentItem = null;

  const numRe = /^\s*(\d+)\.\s+(.*)$/;
  const letterRe = /^\s*([a-z])\.\s+(.*)$/;
  const bulletRe = /^\s*[-•*]\s+(.*)$/;

  const flushItem = () => {
    if (currentItem && currentItem.text.trim()) {
      currentSection.items.push(currentItem.text.trim());
    }
    currentItem = null;
  };

  const flushSection = () => {
    if (currentSection) {
      flushItem();
      sections.push(currentSection);
    }
    currentSection = null;
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const numMatch = line.match(numRe);
    const letterMatch = line.match(letterRe);
    const bulletMatch = line.match(bulletRe);

    if (numMatch) {
      // New top-level section
      flushSection();
      const heading = numMatch[2].trim();
      currentSection = { heading, items: [], body: '' };
      currentItem = null;
      continue;
    }

    if (letterMatch || bulletMatch) {
      // Bullet or lettered item (attach to current section if present)
      const textAfter = (letterMatch ? letterMatch[2] : bulletMatch[1]).trim();
      if (!currentSection) {
        // No section yet: create a synthetic section so bullets aren't lost
        currentSection = { heading: '', items: [], body: '' };
      }
      flushItem();
      currentItem = { text: textAfter };
      continue;
    }

    // Continuation line: append to current item or section body or intro
    if (currentItem) {
      currentItem.text += ' ' + line;
    } else if (currentSection) {
      currentSection.body = (currentSection.body ? currentSection.body + ' ' : '') + line;
    } else {
      introBuffer.push(line);
    }
  }
  flushSection();

  // 3) Build conceptual chunks
  const chunks = [];

  // Intro as a single chunk if present
  const introText = introBuffer.join(' ').trim();
  if (introText) chunks.push(introText);

  for (const sec of sections) {
    const hasItems = sec.items.length > 0;

    if (hasItems) {
      // One chunk per bullet/lettered item, include heading context
      for (const item of sec.items) {
        const title = sec.heading ? `${sec.heading} — ${item}` : item;
        chunks.push(title);
      }
      // If there is meaningful section body aside from items, include it as its own chunk
      if (sec.body && sec.body.trim()) {
        const title = sec.heading ? `${sec.heading} — ${sec.body.trim()}` : sec.body.trim();
        chunks.push(title);
      }
    } else {
      // No bullets: emit the section body with heading
      const text = [sec.heading, sec.body].filter(Boolean).join(' — ').trim();
      if (text) chunks.push(text);
    }
  }

  // 4) Respect token target by splitting only within oversized chunks
  const finalChunks = [];
  for (const c of chunks) {
    const estTokens = c.length / 4;
    if (estTokens <= targetTokens) {
      finalChunks.push(c.trim());
      continue;
    }
    // Split long chunks by sentence/paragraph boundaries
    const pieces = splitBySize(c, targetTokens);
    for (const p of pieces) {
      if (p.trim()) finalChunks.push(p.trim());
    }
  }

  // 5) Optional overlap for continuity (applied across adjacent final chunks)
  if (overlap > 0 && finalChunks.length > 1) {
    return finalChunks.map((chunk, i) => {
      if (i === 0) return chunk;
      const prevTokens = finalChunks[i - 1].split(/\s+/).slice(-overlap).join(' ');
      return `${prevTokens} ${chunk}`.trim();
    });
  }

  return finalChunks;
}

// Helper: split a long string into ~token-sized pieces on natural boundaries
function splitBySize(text, targetTokens) {
  const sentences = text.split(/(?<=[.!?])\s+/); // if your runtime lacks lookbehind, use a simpler splitter
  const out = [];
  let cur = '';
  for (const s of sentences) {
    const next = cur ? cur + ' ' + s : s;
    if (next.length / 4 > targetTokens && cur) {
      out.push(cur);
      cur = s;
    } else {
      cur = next;
    }
  }
  if (cur) out.push(cur);
  return out;
}



module.exports = { chunkText };