import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 'lofi', label: 'Lo-Fi', src: '/sounds/lofi.mp3' },
  { id: 'rain', label: 'Rain', src: '/sounds/rain.mp3' },
  { id: 'whitenoise', label: 'White Noise', src: null },
];

function SoundscapePlayer() {
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const noiseCtxRef = useRef(null);

  const stopWhiteNoise = () => {
    if (noiseCtxRef.current) {
      noiseCtxRef.current.close();
      noiseCtxRef.current = null;
    }
  };

  const playWhiteNoise = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    noise.connect(gain).connect(ctx.destination);
    noise.start();
    noiseCtxRef.current = ctx;
  };

  const handleSelect = (track) => {
    if (audioRef.current) audioRef.current.pause();
    stopWhiteNoise();

    if (current === track.id && isPlaying) {
      setIsPlaying(false);
      setCurrent(null);
      return;
    }

    setCurrent(track.id);
    setIsPlaying(true);

    if (track.id === 'whitenoise') {
      playWhiteNoise();
    } else {
      audioRef.current.src = track.src;
      audioRef.current.loop = true;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    return () => stopWhiteNoise();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 shadow-lg">
      <audio ref={audioRef} />
      <span className="text-xs text-gray-400">🎵</span>
      {TRACKS.map((track) => (
        <button
          key={track.id}
          onClick={() => handleSelect(track)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            current === track.id && isPlaying
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {track.label}
        </button>
      ))}
    </div>
  );
}

export default SoundscapePlayer;