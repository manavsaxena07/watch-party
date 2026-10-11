import { useEffect, useRef } from "react";

export default function YouTubePlayer({ videoId, socket, roomCode, canControl = true }) {
  const playerRef = useRef(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        videoId: videoId,
        events: {
          onStateChange: (e) => {
            if (isSyncing.current) {
              isSyncing.current = false;
              return;
            }
            if (!canControl) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              socket.emit("video_action", { roomCode, action: "play", time: playerRef.current.getCurrentTime() });
            }
            if (e.data === window.YT.PlayerState.PAUSED) {
              socket.emit("video_action", { roomCode, action: "pause", time: playerRef.current.getCurrentTime() });
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current = new window.YT.Player("player", { videoId });
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (!socket) return;

    const handleAction = ({ action, time }) => {
      if (!playerRef.current) return;
      isSyncing.current = true;
      const currentTime = playerRef.current.getCurrentTime? playerRef.current.getCurrentTime() : 0;
      if (Math.abs(currentTime - time) > 2) {
        playerRef.current.seekTo(time, true);
      }
      if (action === "play") playerRef.current.playVideo();
      if (action === "pause") playerRef.current.pauseVideo();
    };

    socket.on("video_action", handleAction);
    return () => {
      socket.off("video_action", handleAction);
    };
  }, [socket]);

  return <div id="player" className="w-full h-full"></div>;
}