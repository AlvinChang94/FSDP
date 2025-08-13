import React, { useEffect, useState } from "react";
import http from "../http";

function Home() {
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("init");
  const [qrUrl, setQrUrl] = useState(null);

  // 1) Still fetch the user, just to personalise the greeting
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await http.get(`/user/me`);
        setUserName(res.data.name || "");
        
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);
  const userId = localStorage.getItem("userId");

  // 2) Init WA session and poll QR/status
  useEffect(() => {
    // Kick off WA session
    http.post(`/api/testchat/wa/${encodeURIComponent(userId)}/init`);

    const poll = async () => {
      try {
        const res = await http.get(`/api/testchat/wa/${encodeURIComponent(userId)}/qr`);
        setStatus(res.data.status);
        setQrUrl(res.data.dataUrl);
        if (res.data.status !== "ready") {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error("QR poll error:", err);
      }
    };

    poll();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Weclome to the Home Page</h1>
      <p className="text-lg text-gray-700 mb-6">This is a simple React application.</p>

      {/* WhatsApp QR section */}
      <div className="bg-white shadow rounded p-4 text-center w-full max-w-md">
        <p className="font-medium mb-3">WhatsApp session status: {status}</p>

        {status === "pending-qr" && qrUrl && (
          <img
            src={qrUrl}
            alt="WhatsApp QR"
            className="mx-auto"
            style={{ width: 320, imageRendering: "pixelated" }}
          />
        )}

        {status === "ready" && (
          <p className="text-green-600 font-semibold">✅ Linked successfully!</p>
        )}
      </div>
    </div>
  );
}

export default Home;