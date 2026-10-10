import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <h1 className="text-3xl font-bold mb-2">Watch Party</h1>
        <p className="text-zinc-400 mb-8">Watch YouTube together with friends</p>
        
        <button onClick={createRoom} className="w-full bg-white text-black py-3 rounded-xl font-bold mb-6 hover:bg-zinc-200">
          Create New Room
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-zinc-700"></div>
          <span className="text-zinc-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room Code"
          className="w-full bg-black border border-zinc-700 p-3 rounded-xl outline-none mb-3"
        />
        <button onClick={joinRoom} className="w-full bg-red-600 py-3 rounded-xl font-bold">
          Join Room
        </button>
      </div>
    </div>
  );
}