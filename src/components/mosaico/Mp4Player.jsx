import { useRef, useEffect } from "react";

export default function Mp4Player({ src, onEnd }) {
  const ref = useRef();

  useEffect(() => {
    const video = ref.current;
    const onReady = () => {
      video.currentTime = 10;
      video.play();
    };
    video.addEventListener("loadedmetadata", onReady);
    return () => video.removeEventListener("loadedmetadata", onReady);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      controls
      className="w-full h-full object-contain"
      onEnded={onEnd}
    />
  );
}
