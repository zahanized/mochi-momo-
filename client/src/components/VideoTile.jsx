import { useEffect, useRef } from 'react';

function VideoTile({ stream, userName, isLocal, cameraOn }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
      {cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-700">
          <span className="text-3xl font-bold text-gray-400">
            {userName?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {userName} {isLocal && '(You)'}
      </span>
    </div>
  );
}

export default VideoTile;