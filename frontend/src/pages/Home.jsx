import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [roomInput, setRoomInput] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username.trim()) {
      alert("Pehle apna naam daalo!");
      return;
    }
    localStorage.setItem("username", username);
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    if (!username.trim()) {
      alert("Pehle apna naam daalo!");
      return;
    }
    if (!roomInput.trim()) {
      alert("Room Code daalo!");
      return;
    }
    localStorage.setItem("username", username);
    navigate(`/room/${roomInput.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🍿 Watch Party</h1>
          <p className="text-zinc-400">YouTube Together</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Tumhara Naam</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Jaise - Aman, Rahul..."
              className="w-full mt-1 bg-black p-4 rounded-xl outline-none border border-zinc-800 focus:border-white"
            />
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-white text-black p-4 rounded-xl font-bold text-lg hover:bg-zinc-200"
          >
            Create New Room
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <div className="flex gap-2">
            <input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Room Code"
              className="flex-1 bg-black p-4 rounded-xl outline-none border border-zinc-800 uppercase"
            />
            <button
              onClick={joinRoom}
              className="bg-zinc-800 px-6 rounded-xl font-bold hover:bg-zinc-700"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}