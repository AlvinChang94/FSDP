import React, { useEffect, useState } from "react";
import http from "../http"

function Home() {
  const [linkCode, setLinkCode] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await http.get(`/user/me`);
        // Axios puts data in response.data
        setLinkCode(response.data.link_code);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchUser();
  }, []);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
      <p className="text-lg text-gray-700">This is a simple React application.</p>
      <p>Your link code: <strong>{linkCode || "Loading..."}</strong></p>
    </div>
  );
}

export default Home;