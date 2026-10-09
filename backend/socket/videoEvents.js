import { useState, useEffect } from "react";
import socket from "../socket";

function YouTubePlayer({ room }) {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState(room?.video?.videoId || "");

  const getId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\s]+)/);
    return match? match[1] : url.trim();
  };

  const handlePlay = () => {
    const id = getId(input);
    if (!id) return alert("Sahi link daal");
    setVideoId(id);
    // TERI BACKEND EVENT - yahi naam hona chahiye
    socket.emit("change_video", {
      roomId: room.roomCode || room.roomId,
      videoId: id
    });
    setInput("");
  };

  useEffect(() => {
    if (room?.video?.videoId) setVideoId(room.video.videoId);
  }, [room]);

  useEffect(() => {
    const onVideoChange = (data) => {
      const id = data.videoId || data.newVideoId || data;
      setVideoId(typeof id === 'string'? id : id.videoId);
    };
    // Backend kya bhejta hai check karne ke liye saare naam sun lo
    socket.on("video_changed", onVideoChange);
    socket.on("videoChanged", onVideoChange);
    socket.on("change_video", onVideoChange);
    socket.on("roomUpdated", (r) => {
      if (r.video?.videoId) setVideoId(r.video.videoId);
    });

    return () => {
      socket.off("video_changed", onVideoChange);
      socket.off("videoChanged", onVideoChange);
      socket.off("change_video", onVideoChange);
      socket.off("roomUpdated");
    };
  }, []);

  return (
    <div className="w-full h-full bg-black flex flex-col min-h-[500px]">
      <div className="p-3 bg-zinc-900 flex gap-2 border-b border-zinc-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="YouTube link paste kar..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
        />
        <button onClick={handlePlay} className="bg-purple-600 px-5 py-2 rounded-lg text-sm font-bold">Play</button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black">
        {videoId? (
          <iframe
            className="w-full h-full aspect-video"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="yt"
          />
        ) : (
          <div className="text-center text-zinc-500 p-10">
            <div className="text-5xl mb-3">🎬</div>
            <p>Upar link daal ke Play daba</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default YouTubePlayer;