// routes/waRouter.js
const express = require('express');
const QRCode = require('qrcode');
const pino = require('pino');
const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys');

const { validateToken } = require('../middlewares/auth');
// Optional: bring in your models if you need DB linking here
// const { Client, ClientUser, ClientMessage, User } = require('../models');
// const { Op } = require('sequelize');

const router = express.Router();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const sessions = new Map();
const cooldownMap = new Map();
const COOLDOWN_MS = 5000;

const toJid = (e164) => e164.replace(/^\+/, '') + '@s.whatsapp.net';
const jidToE164 = (jid) => '+' + (jid?.split('@')[0]?.split(':')[0] || '');

async function startSession(ownerId) {
  if (sessions.has(ownerId)) return sessions.get(ownerId);

  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${ownerId}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['QueryEase', 'Chrome', '122.0'],
    markOnlineOnConnect: false,
  });

  const session = { sock, status: 'init', lastQr: null, number: null };
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      session.lastQr = qr;
      session.status = 'pending-qr';
      logger.info(`[${ownerId}] QR updated`);
    }
    if (connection === 'open') {
      session.status = 'ready';
      session.number = jidToE164(sock?.user?.id) || null;
      logger.info(`[${ownerId}] Ready as ${session.number}`);
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        try { sock.logout?.(); } catch {}
        sessions.delete(ownerId);
        logger.warn(`[${ownerId}] Logged out; session removed`);
        return;
      }
      setTimeout(() => startSession(ownerId), 1500);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    const msg = m.messages?.[0];
    if (!msg || msg.key.fromMe) return;
    const fromJid = msg.key.remoteJid;
    if (!fromJid?.endsWith('@s.whatsapp.net')) return;

    const now = Date.now();
    const fromE164 = jidToE164(fromJid);
    if (cooldownMap.has(fromE164) && now - cooldownMap.get(fromE164) < COOLDOWN_MS) return;
    cooldownMap.set(fromE164, now);
    const remoteJid = msg.key.remoteJid; // e.g. '6591234567@s.whatsapp.net'
    const phoneNumber = '+' + remoteJid.split('@')[0].split(':')[0]
    const senderName = msg.pushName || 'Unknown';

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption || '';
    
    console.log('From:', phoneNumber);
    console.log('Name:', senderName);
    console.log('Body:', body);
    // Plug in your own AWS/chatbot logic here:
    const reply = await getBotReply(ownerId, { fromE164, body: (text || '').trim() });
    if (reply) await sock.sendMessage(fromJid, { text: reply });
  });

  sessions.set(ownerId, session);
  return session;
}

// Replace this with your AWS bot handler
async function getBotReply(ownerId, { fromE164, body }) {
  return `You said: "${body}"`;
}

router.post('/:ownerId/init', validateToken, async (req, res) => {
  try {
    const s = await startSession(req.params.ownerId);
    res.json({ ok: true, status: s.status, number: s.number });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Init failed' });
  }
});

router.get('/:ownerId/qr', validateToken, async (req, res) => {
  try {
    const s = await startSession(req.params.ownerId);
    if (!s.lastQr) {
      return res.json({ ok: true, status: s.status, dataUrl: null });
    }
    const dataUrl = await QRCode.toDataURL(s.lastQr, { margin: 1, width: 320 });
    res.json({ ok: true, status: s.status, dataUrl });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'QR generation failed' });
  }
});

router.post('/:ownerId/send', validateToken, async (req, res) => {
  try {
    const { toE164, text } = req.body;
    if (!toE164 || !text) {
      return res.status(400).json({ ok: false, error: 'toE164 and text required' });
    }
    const s = await startSession(req.params.ownerId);
    if (s.status !== 'ready') {
      return res.status(409).json({ ok: false, error: 'Session not ready' });
    }
    await s.sock.sendMessage(toJid(toE164), { text });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to send' });
  }
});

module.exports = router;