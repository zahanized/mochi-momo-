import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const TRACKS = [
  { id: 'lofi', label: 'Lo-Fi', type: 'file', src: '/sounds/lofi.mp3' },
  { id: 'rain', label: 'Rain', type: 'file', src: '/sounds/rain.mp3' },
  { id: 'cafe', label: 'Cafe', type: 'file', src: '/sounds/cafe.mp3' },
  { id: 'forest', label: 'Forest', type: 'file', src: '/sounds/forest.mp3' },
  { id: 'ocean', label: 'Ocean', type: 'file', src: '/sounds/ocean.mp3' },
  { id: 'fireplace', label: 'Fireplace', type: 'file', src: '/sounds/fireplace.mp3' },
  { id: 'whitenoise', label: 'White Noise', type: 'noise', noiseType: 'white' },
  { id: 'brownnoise', label: 'Brown Noise', type: 'noise', noiseType: 'brown' },
];

function SoundscapePlayer() {
  const { user } = useContext(AuthContext);
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const noiseCtxRef = useRef(null);

  const stopNoise = () => {
    if (noiseCtxRef.current) {
      noiseCtxRef.current.close();
      noiseCtxRef.current = null;
    }
  };

  const playNoise = (noiseType) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (noiseType === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
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

  const logPlay = (track) => {
    fetch('http://localhost:5001/api/soundscape/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ trackId: track.id, label: track.label }),
    }).catch(() => {}); // popularity tracking is best-effort, never block playback
  };

  const handleSelect = (track) => {
    if (audioRef.current) audioRef.current.pause();
    stopNoise();

    if (current === track.id && isPlaying) {
      setIsPlaying(false);
      setCurrent(null);
      return;
    }

    setCurrent(track.id);
    setIsPlaying(true);
    logPlay(track);

    if (track.type === 'noise') {
      playNoise(track.noiseType);
    } else {
      audioRef.current.src = track.src;
      audioRef.current.loop = true;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    return () => stopNoise();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-md flex-wrap items-center gap-2 rounded-full bg-gray-900 px-4 py-2 shadow-lg">
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