const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "ap-southeast-2" });



async function getEmbedding(text) {
  const command = new InvokeModelCommand({
    modelId: "amazon.titan-embed-text-v2:0",
    body: JSON.stringify({ inputText: text }),
    contentType: "application/json"
  });

  const response = await client.send(command);
  const payload = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(payload);
  return parsed.embedding; // Array of floats
}

function cosineSim(a, b) {
  // a and b are number[]
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}




module.exports = { getEmbedding, cosineSim };
