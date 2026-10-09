import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState({ roomCode: roomId, users: [], video: {} });
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    const username = location.state?.username || localStorage.getItem("username") || "manav";
    socket.emit("joinRoom", { roomCode: roomId, username });

    socket.on("roomUpdated", (data) => {
      console.log("Room update", data);
      setRoom(data);
      if (data.video?.videoId) setVideoId(data.video.videoId);
    });

    socket.on("video_changed", (data) => {
      const id = data.videoId || data.newVideoId || data;
      if (typeof id === 'string') setVideoId(id);
      else if (id.videoId) setVideoId(id.videoId);
    });

    return () => {
      socket.off("roomUpdated");
      socket.off("video_changed");
    };
  }, [roomId, location]);

  const getId = (url) => {
    const m = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\s]+)/);
    return m? m[1] : url.trim();
  };

  const handlePlay = () => {
    const id = getId(input);
    if (!id) return alert("Link sahi daal");
    setVideoId(id);
    socket.emit("change_video", { roomId: roomId, videoId: id });
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <header className="p-4 flex justify-between items-center bg-zinc-900 border-b border-zinc-800">
        <h2 className="font-bold">Room: <span className="text-purple-400">{roomId}</span></h2>
        <button onClick={() => navigate("/")} className="bg-zinc-800 px-4 py-2 rounded">Leave</button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* VIDEO PART */}
        <div className="bg-black flex flex-col min-h-[60vh]">
          <div className="p-3 bg-zinc-900 flex gap-2 border-b border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="YouTube link yaha paste kar..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-white"
            />
            <button onClick={handlePlay} className="bg-purple-600 px-6 py-3 rounded-lg font-bold">Play</button>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black">
            {videoId? (
              <iframe
                className="w-full h-full min-h-[400px]"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="player"
              />
            ) : (
              <div className="text-zinc-500 text-center p-10">
                <p className="text-6xl mb-4">🎬</p>
                <p>Upar link daal ke Play daba - yaha video chalega</p>
              </div>
            )}
          </div>
        </div>

        {/* MEMBERS */}
        <div className="bg-zinc-900 border-l border-zinc-800 p-4">
          <h3 className="font-bold mb-3">Members ({room.users?.length || 1})</h3>
          <div className="space-y-2">
            {(room.users || [{ username: 'manav' }]).map((u, i) => (
              <div key={i} className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg">
                {u.username || u}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;