import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import YouTubePlayer from "../components/YouTubePlayer";
import RoomMembers from "../components/RoomMembers";

const socket = io("https://watch-party-backend-9k8x.onrender.com");

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
    socket.on("user_joined", (d) => setUsers(d.participants));
    socket.on("sync_state", (r) => {
      setUsers(Object.values(r.participants || {}));
      if (r.videoId) setVideoId(r.videoId);
    });
    socket.on("receive_message", (d) => setMessages((m) => [...m, d]));
    socket.on("video_changed", (d) => setVideoId(d.videoId));
    return () => {
      socket.off("user_joined");
      socket.off("sync_state");
      socket.off("receive_message");
      socket.off("video_changed");
    };
  }, [roomId]);

    const send = () => {
    if (!msg.trim()) return;
    const username = localStorage.getItem("username") || "Guest";
    const newMsg = { username, message: msg };
    setMessages((m) => [...m, newMsg]); // ye line add ki - khud ko bhi dikhega
    socket.emit("send_message", { roomCode: roomId, message: msg, username });
    setMsg("");
  };

  const changeVideo = () => {
    let id = inputVideo;
    if (id.includes("youtu.be/")) id = id.split("youtu.be/")[1];
    if (id.includes("v=")) id = id.split("v=")[1].split("&")[0];
    if (!id) return;
    socket.emit("change_video", { roomCode: roomId, videoId: id });
    setVideoId(id);
    setInputVideo("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl">
          <div>
            <h1 className="text-xl font-bold">Watch Party</h1>
            <p className="text-sm text-gray-400">Room: {roomId}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">Copy Link</button>
        </div>
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
          <YouTubePlayer videoId={videoId} socket={socket} roomCode={roomId} />
        </div>
        <div className="flex gap-2">
          <input value={inputVideo} onChange={(e) => setInputVideo(e.target.value)} placeholder="Paste YouTube Link" className="flex-1 bg-zinc-900 p-3 rounded-xl outline-none" />
          <button onClick={changeVideo} className="bg-red-600 px-6 py-3 rounded-xl font-bold">Change</button>
        </div>
      </div>
      <div className="w-full lg:w-80 bg-zinc-900 flex flex-col">
        <RoomMembers users={users} />
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="bg-black p-2 rounded-lg"><b>{m.username}: </b>{m.message}</div>
          ))}
        </div>
        <div className="p-4 flex gap-2 border-t border-zinc-800">
          <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type message..." className="flex-1 bg-black p-3 rounded-xl outline-none" />
          <button onClick={send} className="bg-white text-black px-5 rounded-xl font-bold">Send</button>
        </div>
      </div>
    </div>
  );
}