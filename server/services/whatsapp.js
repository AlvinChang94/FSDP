// services/WhatsApp.js
const path = require('path');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { User } = require('../models'); // ⬅️ Sequelize models index (adjust path if needed)
const axios = require('axios');

const sessions = new Map(); // userId -> { client, started, lastUpdate, dir }

// Make userId filesystem‑safe
function sanitizeId(id) {
  return String(id).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Persist 'linked' to DB using the raw PK (not sanitized)
async function setLinked(rawUserId, linked) {
  try {
    await User.update({ linked }, { where: { id: rawUserId } });
  } catch (err) {
    console.error(`[${rawUserId}] Failed to update linked in DB:`, err);
  }
}

function sessionDir(userId) {
  // wa-auth/session/<userId>
  return path.join(process.cwd(), 'wa-auth', 'session', userId);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function startSession(rawUserId) {
  const userId = sanitizeId(rawUserId);
  let state = sessions.get(userId);
  if (state?.started) return state; // already running

  const dir = sessionDir(userId);
  ensureDir(dir);

  state = {
    started: false,
    lastUpdate: { status: 'init' },
    client: null,
    dir,
  };

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: userId,      // folder per user
      dataPath: dir,         // ensures one folder per userId
    }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  // --- Event handlers ---
  client.on('qr', (qr) => {
    console.log(`[${userId}] 📡 Got QR from WA`);
    state.lastUpdate = { status: 'qr', qr };
  });

  client.on('authenticated', () => {
    console.log(`[${userId}] 🔐 Authenticated`);
    state.lastUpdate = { status: 'authenticated' };
  });

  client.on('ready', () => {
    console.log(`[${userId}] ✅ Client ready`);
    state.lastUpdate = { status: 'ready' };
    // Mark DB as linked
    setLinked(rawUserId, true);
  });

  client.on('auth_failure', (message) => {
    console.error(`[${userId}] ❌ Auth failure:`, message);
    markDelinked(userId, state, 'auth_failure', rawUserId);
  });

  client.on('disconnected', (reason) => {
    console.warn(`[${userId}] ⚠️ Disconnected:`, reason);
    markDelinked(userId, state, reason || 'disconnected', rawUserId);
  });

  client.on('change_state', (newState) => {
    if (String(newState).toUpperCase().includes('UNPAIRED')) {
      console.warn(`[${userId}] ⚠️ Unpaired by user`);
      markDelinked(userId, state, 'unpaired', rawUserId);
    }
  });

  // --- Your bot logic here ---
  client.on('message', async (msg) => {
    if (msg.fromMe || msg.isStatus) return;
    try {
      const contact = await msg.getContact();
      console.log(`[${userId}] 💬 Message from ${msg.from}, ${contact.pushname || contact.name || "Unknown"}: ${msg.body}`);
      const { data } = await axios.post('http://localhost:3001/sendchatbot/receive', {
        userId: rawUserId,      // pass the userId that owns this WA session
        From1: msg.from,         // the WhatsApp sender
        Body: msg.body,        // message text
        ProfileName: contact.name || contact.pushname || "Unknown",
        // add more fields if your API expects them
      });
      const replyText =
        typeof data === 'string' ? data :
          data?.reply || "🤖 Sorry, I didn't quite catch that.";

      //await msg.reply(String(replyText));


    } catch (err) {
      console.error(`[${userId}] Chatbot error:`, err);
    }
  });

  state.client = client;
  sessions.set(userId, state);

  client.initialize();
  state.started = true;
  return state;
}

function getLastUpdate(rawUserId) {
  const userId = sanitizeId(rawUserId);
  return sessions.get(userId)?.lastUpdate ?? { status: 'init' };
}

async function stopSession(rawUserId, { wipe = false } = {}) {
  const userId = sanitizeId(rawUserId);
  const state = sessions.get(userId);
  if (!state) return false;

  try { state.client?.removeAllListeners(); } catch { }
  try { await state.client?.destroy(); } catch { }
  sessions.delete(userId);

  if (wipe) {
    try { fs.rmSync(state.dir, { recursive: true, force: true }); } catch { }
  }
  return true;
}

async function logoutSession(rawUserId) {
  const userId = sanitizeId(rawUserId);
  const state = sessions.get(userId);
  if (!state?.client) {
    // Even if no client, ensure DB reflects delinked
    await setLinked(rawUserId, false);
    return false;
  }
  try { await state.client.logout(); } catch { }
  await stopSession(rawUserId);
  await setLinked(rawUserId, false);
  return true;
}

function listSessions() {
  return Array.from(sessions.keys());
}

function markDelinked(userId, state, reason, rawUserId) {
  state.lastUpdate = { status: 'delinked', reason };
  try { state.client?.removeAllListeners(); } catch { }
  try { state.client?.destroy(); } catch { }
  sessions.set(userId, {
    client: null,
    started: false,
    lastUpdate: state.lastUpdate,
    dir: state.dir,
  });
  // Reflect unlink in DB
  setLinked(rawUserId, false);
}

module.exports = {
  startSession,
  getLastUpdate,
  stopSession,
  logoutSession,
  listSessions,
};