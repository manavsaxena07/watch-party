import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) setUsername(saved);

    const handleRoomCreated = (data) => {
      const code = typeof data === 'string'? data : data.roomCode || data.roomId;
      console.log("Room created:", code);
      localStorage.setItem("username", username || saved || "");
      navigate(/room/${code}, { state: { username: username || saved, isHost: true } });
    };

    const handleRoomJoined = (data) => {
      const code = data.roomCode || data.roomId;
      localStorage.setItem("username", username || saved || "");
      navigate(/room/${code}, { state: { username: username || saved, isHost: false } });
    };

    socket.on("roomCreated", handleRoomCreated);
    socket.on("room-created", handleRoomCreated);
    socket.on("roomJoined", handleRoomJoined);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-error", (m) => alert(m));
    socket.on("error", (m) => alert(m));

    return () => {
      socket.off("roomCreated", handleRoomCreated);
      socket.off("room-created", handleRoomCreated);
      socket.off("roomJoined", handleRoomJoined);
      socket.off("room-joined", handleRoomJoined);
    };
  }, []); // <--- Yaha se username hata diya

  const createRoom = () => {
    if (!username.trim()) return alert("Please Enter Username");
    console.log("Creating room for", username);
    socket.emit("createRoom", { username: username.trim() });
  };

  const joinRoom = () => {
    if (!username.trim()) return alert("Please Enter Username");
    if (!roomId.trim()) return alert("Please Enter Room Code");
    socket.emit("joinRoom", { roomCode: roomId.trim().toUpperCase(), username: username.trim() });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">🍿 Watch Party</h1>
        <p className="text-zinc-400 text-center mb-8">Watch together with friends</p>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4"
        />

        <button
          onClick={createRoom}
          className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl py-3 font-semibold mb-6"
        >
          Create New Room
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
          <span className="text-zinc-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
        </div>

        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room Code (e.g. AB12CD)"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-4"
        />

        <button
          onClick={joinRoom}
          className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl py-3 font-semibold"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;
