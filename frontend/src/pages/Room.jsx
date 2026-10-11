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
  const [myRole, setMyRole] = useState("Participant");

  useEffect(() => {
    const username = localStorage.getItem("username") || "Guest";
    socket.emit("join_room", { roomId, roomCode: roomId, username });

    socket.on("user_joined", (d) => setUsers(d.participants));
    socket.on("sync_state", (r) => {
      setUsers(Object.values(r.participants || {}));
      if (r.videoId) setVideoId(r.videoId);
    });
    socket.on("receive_message", (d) => setMessages((m) => [...m, d]));
    socket.on("video_changed", (d) => setVideoId(d.videoId));

    // NAYA - Roles ke liye
    socket.on("role_assigned", (d) => {
      if (d.role &&!d.userId) setMyRole(d.role); // khud ka role
      if (d.participants) setUsers(d.participants);
    });
    socket.on("user_left", (d) => { if(d.participants) setUsers(d.participants); });
    socket.on("participant_removed", () => { alert("Host ne tumhe remove kar diya"); window.location.href = "/"; });
    socket.on("error_msg", (m) => alert(m));

    return () => {
      socket.off("user_joined");
      socket.off("sync_state");
      socket.off("receive_message");
      socket.off("video_changed");
      socket.off("role_assigned");
      socket.off("user_left");
    };
  }, [roomId]);

  const send = () => {
    if (!msg.trim()) return;
    const username = localStorage.getItem("username") || "Guest";
    const newMsg = { username, message: msg };
    setMessages((m) => [...m, newMsg]);
    socket.emit("send_message", { roomCode: roomId, roomId, message: msg, username });
    setMsg("");
  };

  const changeVideo = () => {
    if(myRole!== 'Host' && myRole!== 'Moderator') return alert("Only Host/Moderator can change video");
    let id = inputVideo;
    if (id.includes("youtu.be/")) id = id.split("youtu.be/")[1];
    if (id.includes("v=")) id = id.split("v=")[1].split("&")[0];
    setVideoId(id);
    socket.emit("change_video", { roomId, roomCode: roomId, videoId: id });
    setInputVideo("");
  };

  const isHost = myRole === 'Host';
  const canControl = myRole === 'Host' || myRole === 'Moderator';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl">
          <div>
            <h1 className="text-xl font-bold">Watch Party - {myRole}</h1>
            <p className="text-sm text-gray-400">Room: {roomId}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-white text-black px-3 py-1 rounded">Copy Link</button>
        </div>
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
          <YouTubePlayer videoId={videoId} socket={socket} roomCode={roomId} roomId={roomId} canControl={canControl} />
        </div>
        <div className="flex gap-2">
          <input value={inputVideo} onChange={(e)=>setInputVideo(e.target.value)} placeholder="Paste YouTube Link" className="flex-1 bg-zinc-900 p-2 rounded" disabled={!canControl} />
          <button onClick={changeVideo} disabled={!canControl} className={`px-4 py-2 rounded ${canControl? 'bg-green-600' : 'bg-zinc-700'}`}>Change</button>
        </div>
      </div>

      <div className="w-full lg:w-[360px] bg-zinc-900 flex flex-col">
        <RoomMembers users={users} currentUserId={socket.id} isHost={isHost} socket={socket} roomId={roomId} roomCode={roomId} />
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m,i)=><div key={i} className="mb-2 text-sm"><b>{m.username}:</b> {m.message}</div>)}
        </div>
        <div className="p-3 flex gap-2 border-t border-zinc-800">
          <input value={msg} onChange={(e)=>setMsg(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && send()} className="flex-1 bg-black p-2 rounded" placeholder="Message..." />
          <button onClick={send} className="bg-white text-black px-4 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}