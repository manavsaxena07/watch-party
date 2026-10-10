import { useEffect, useRef } from "react";

export default function YouTubePlayer({ videoId, socket, roomCode }) {
  const playerRef = useRef(null);

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
            if (e.data === window.YT.PlayerState.PLAYING) {
              socket.emit("play_video", { roomCode });
            }
            if (e.data === window.YT.PlayerState.PAUSED) {
              socket.emit("pause_video", { roomCode });
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
    socket.on("video_played", () => {
      if (playerRef.current && playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    });
    socket.on("video_paused", () => {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    });
    return () => {
      socket.off("video_played");
      socket.off("video_paused");
    };
  }, [socket]);

  return <div id="player" className="w-full h-full"></div>;
}