import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import http from '../http';

export default function Home() {
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
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Welcome section remains */}
      <h1 className="text-4xl font-bold mb-4">
        Welcome{userName ? `, ${userName}` : ""}
      </h1>
      This is a simple react Application

    </div>
  );
}