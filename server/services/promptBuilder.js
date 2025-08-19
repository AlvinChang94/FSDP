function buildPrompt({ systemPrompt, docs, faqs, userMsg }) {
    const contextLines = [
        ...docs.map(d => `Doc[${d.documentId}]: ${d.text}`),
        ...faqs.map(f => `FAQ: Q: ${f.question}\nA: ${f.answer ?? f.answerSummary ?? ''}`)
    ];

    const contextPolicy = [
        "Use only the CONTEXT above for factual claims.",
        "If not enough info, ask a clarifying question.",
        "Prefer FAQ guidance when available."
    ].join(' ');

    return [
        systemPrompt.trim(),
        "Context:",
        contextLines.length ? contextLines.join("\n\n") : "[No relevant context found]",

        `Instructions: ${contextPolicy}`,
        `User: ${userMsg}`
    ].join("\n\n");
}

module.exports = { buildPrompt };
