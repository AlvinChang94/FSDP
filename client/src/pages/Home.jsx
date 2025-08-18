import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import http from '../http';

export default function Home() {
  const [status, setStatus] = useState('init');
  const [qr, setQr] = useState(null);
  const [poller, setPoller] = useState(null);
  const [userName, setName] = useState(null);
  const [userId, setId] = useState(null);
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await http.get('/user/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setName(res.data.name || "");
        setId(res.data.id || "");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
    if (!userId) return;
    (async () => {
      try {
        const { data } = await http.get(`/api/wa/${userId}/status`);
        setStatus(data.status);
        setQr(data.qr || null);
      } catch (err) {
        console.error("Error fetching WA status:", err);
      }
    })();
  }, [userId]);

  const start = async () => {
    await http.post(`/api/wa/${userId}/start`);
    poll();
  };

  const poll = () => {
    clearInterval(poller);
    const id = setInterval(async () => {
      const { data } = await http.get(`/api/wa/${userId}/status`);
      setStatus(data.status);
      setQr(data.qr || null);

      if (['ready', 'delinked', 'auth_failure'].includes(data.status)) {
        clearInterval(id);
        setPoller(null);
      }
    }, 1500);
    setPoller(id);
  };

  const logout = async () => {
    await http.post(`/api/wa/${userId}/logout`);
    setStatus('init');
    setQr(null);
  };

  useEffect(() => {
    return () => clearInterval(poller);
  }, [poller]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Welcome section remains */}
      <h1 className="text-4xl font-bold mb-4">
        Welcome{userName ? `, ${userName}` : ""}
      </h1>
      <p className="text-lg text-gray-700 mb-6">Link your WhatsApp to start.</p>

      {/* WA linking logic */}
      {status === 'init' && (
        <button
          onClick={start}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Connect WhatsApp
        </button>
      )}

      {status === 'qr' && qr && (
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          {/* ✅ Now renders SVG instead of canvas */}
          <QRCodeSVG value={qr} size={256} />
          <p className="mt-2 text-gray-600">Scan this QR with WhatsApp</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="flex flex-col items-center">
          <p className="text-green-600 font-semibold mb-4">
            ✅ WhatsApp Linked
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delink WhatsApp
          </button>
        </div>
      )}

      {status === 'delinked' && (
        <button
          onClick={start}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Reconnect WhatsApp
        </button>
      )}
    </div>
  );
}