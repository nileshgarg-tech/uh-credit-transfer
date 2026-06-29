// Pure fetch-based test — no broken package imports
import { readFileSync, existsSync } from 'fs';

// Manually parse .env.local
function loadEnv(filePath) {
  const lines = readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/\r$/, '');
    process.env[key] = val;
  }
}

if (existsSync('.env.local')) {
  loadEnv('.env.local');
  console.log('✅ Loaded .env.local\n');
} else {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const openaiKey      = process.env.VITE_OPENAI_KEY;
const openaiEndpoint = process.env.VITE_OPENAI_ENDPOINT?.replace(/\/$/, '');
const deployment     = process.env.VITE_OPENAI_DEPLOYMENT || 'gpt-4';
const azureKey       = process.env.VITE_AZURE_DOCUMENT_KEY;
const azureEndpoint  = process.env.VITE_AZURE_DOCUMENT_ENDPOINT?.replace(/\/$/, '');

// ─── TEST 1: Azure OpenAI ────────────────────────────────────────────────────
console.log('=== TEST 1: Azure OpenAI ===');
console.log(`Endpoint : ${openaiEndpoint}`);
console.log(`Deployment: ${deployment}`);
console.log(`Key      : ${openaiKey?.slice(0, 8)}...`);

try {
  const url = `${openaiEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': openaiKey,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Say the single word: hello' }],
      max_tokens: 10,
      temperature: 0,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ Azure OpenAI FAILED (HTTP ${res.status})`);
    console.error('   Error:', JSON.stringify(data?.error ?? data, null, 2));
  } else {
    const reply = data.choices?.[0]?.message?.content?.trim();
    console.log(`✅ Azure OpenAI responded: "${reply}"`);
  }
} catch (err) {
  console.error(`❌ Azure OpenAI network error: ${err.message}`);
}

// ─── TEST 2: Azure Document Intelligence (ping) ──────────────────────────────
console.log('\n=== TEST 2: Azure Document Intelligence ===');
console.log(`Endpoint : ${azureEndpoint}`);
console.log(`Key      : ${azureKey?.slice(0, 8)}...`);

try {
  // Hit the "list models" endpoint — lightweight, no document needed
  const url = `${azureEndpoint}/formrecognizer/documentModels?api-version=2023-07-31`;
  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': azureKey },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ Azure Document Intelligence FAILED (HTTP ${res.status})`);
    console.error('   Error:', JSON.stringify(data?.error ?? data, null, 2));
  } else {
    const modelCount = data.value?.length ?? '?';
    console.log(`✅ Azure Document Intelligence is alive — ${modelCount} model(s) available`);
  }
} catch (err) {
  console.error(`❌ Azure Document Intelligence network error: ${err.message}`);
}

console.log('\n=== DONE ===');
