import YouTube from "react-youtube";

export default function YoutubePlayer({ url, onEnd }) {
  const videoId = url
    .replace("https://www.youtube.com/watch?v=", "")
    .replace("https://youtu.be/", "")
    .split("&")[0];

  return (
    <div className="w-full h-full">
      <YouTube
        videoId={videoId}
        className="w-full h-full"
        iframeClassName="w-full h-full"
        onEnd={onEnd}
        opts={{
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            showinfo: 0,
            fs: 1,
          },
        }}
      />
    </div>
  );
}
