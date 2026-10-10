import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://watch-party-backend-8y6s.onrender.com");

export default function Room() {
  const { roomId } = useParams();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [inputVideo, setInputVideo] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username") || "Guest";
    socket.emit("join_room", { roomCode: roomId, username });
    socket.on("user_joined", d => setUsers(d.participants));
    socket.on("sync_state", r => {
        setUsers(Object.values(r.participants || {}));
        if(r.videoId) setVideoId(r.videoId);
    });
    socket.on("receive_message", d => setMessages(m => [...m, d]));
    socket.on("video_changed", d => setVideoId(d.videoId));
    return () => socket.disconnect();
  }, [roomId]);

  const send = () => {
    if(!msg.trim()) return;
    socket.emit("send_message", { roomCode: roomId, message: msg, username: localStorage.getItem("username") });
    setMsg("");
  };

  const changeVideo = () => {
    let id = inputVideo;
    if(id.includes("youtu.be/")) id = id.split("youtu.be/")[1];
    if(id.includes("v=")) id = id.split("v=")[1].split("&")[0];
    socket.emit("change_video", { roomCode: roomId, videoId: id });
    setVideoId(id);
    setInputVideo("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col lg:flex-row">
      {/* LEFT */}
      <div className="flex-[3] p-4 lg:p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl border border-white/10">
            <div>
                <h1 className="text-xl font-bold">🎬 Watch Party</h1>
                <p className="text-sm text-gray-400">Room Code: <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span></p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-gray-200">Copy Link</button>
        </div>

        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <iframe className="w-full h-full" src={https://www.youtube.com/embed/${videoId}?autoplay=1} allowFullScreen></iframe>
        </div>

        <div className="flex gap-2 bg-[#1a1a1a] p-3 rounded-xl border border-white/10">
            <input value={inputVideo} onChange={e=>setInputVideo(e.target.value)} placeholder="Paste YouTube link here..." className="flex-1 bg-[#2a2a2a] px-4 py-3 rounded-lg outline-none focus:ring-2 ring-red-600"/>
            <button onClick={changeVideo} className="bg-[#e50914] px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition">Play</button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 bg-[#141414] border-l border-white/10 flex flex-col lg:h-screen">
        <div className="p-5 border-b border-white/10">
            <h2 className="font-bold text-lg">Live Now ({users.length})</h2>
            <div className="mt-3 flex flex-col gap-2">
                {users.map(u=>(
                    <div key={u.userId} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center font-bold">{u.username[0].toUpperCase()}</div>
                        <span className="text-sm">{u.username}</span>
                        <span className="ml-auto text-[10px] bg-red-600 px-2 py-1 rounded-full">{u.role}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length===0 && <p className="text-gray-500 text-center mt-10">No messages yet. Say Hi! 👋</p>}
            {messages.map((m,i)=>(
                <div key={i} className="bg-[#1f1f1f] p-3 rounded-xl">
                    <p className="text-xs text-red-400 font-bold">{m.username}</p>
                    <p className="text-sm mt-1">{m.message}</p>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="Message..." className="flex-1 bg-[#2a2a2a] px-4 py-3 rounded-full outline-none"/>
            <button onClick={send} className="w-12 h-12 bg-[#e50914] rounded-full flex items-center justify-center text-xl">➤</button>
        </div>
      </div>
    </div>
  );
}
