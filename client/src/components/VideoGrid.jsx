import { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { createPeer, getPeer, destroyPeer } from '../utils/peer';
import socket from '../socket';
import VideoTile from './VideoTile';

function VideoGrid() {
  const { user } = useContext(AuthContext);
  const { currentRoom } = useRoom();
  const roomId = currentRoom?.roomId;

  const [localStream, setLocalStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [remotePeers, setRemotePeers] = useState({});
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const localStreamRef = useRef(null);
  const callsRef = useRef({});
  const peerNamesRef = useRef({});

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);

        const peer = createPeer();

        peer.on('open', (peerId) => {
          socket.emit('videoReady', { roomId, peerId, userName: user?.name });
          setReady(true);
        });

        peer.on('call', (call) => {
          call.answer(localStreamRef.current);
          call.on('stream', (remoteStream) => {
            setRemotePeers((prev) => ({
              ...prev,
              [call.peer]: {
                stream: remoteStream,
                userName: peerNamesRef.current[call.peer] || 'Participant',
                cameraOn: true,
              },
            }));
          });
          callsRef.current[call.peer] = call;
        });

        peer.on('error', (err) => {
          setError('Video connection error: ' + err.message);
        });
      } catch (err) {
        setError('Camera/microphone access is required for video: ' + err.message);
      }
    }

    setup();

    return () => {
      cancelled = true;
      Object.values(callsRef.current).forEach((call) => call.close());
      callsRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      destroyPeer();
      setLocalStream(null);
      setRemotePeers({});
      setReady(false);
    };
  }, [roomId, user?.name]);

  useEffect(() => {
    if (!roomId) return;

    const handleExistingPeers = (peers) => {
      peers.forEach(({ peerId, userName }) => {
        peerNamesRef.current[peerId] = userName;
        const peer = getPeer();
        if (peer && localStreamRef.current && !callsRef.current[peerId]) {
          const call = peer.call(peerId, localStreamRef.current);
          call.on('stream', (remoteStream) => {
            setRemotePeers((prev) => ({
              ...prev,
              [peerId]: { stream: remoteStream, userName, cameraOn: true },
            }));
          });
          callsRef.current[peerId] = call;
        }
      });
    };

    const handleNewPeer = ({ peerId, userName }) => {
      peerNamesRef.current[peerId] = userName;
      // Intentionally don't call them back — they'll call us once they
      // receive us in their own "existingPeers" list. Prevents duplicate
      // connections from both sides calling each other simultaneously.
    };

    const handlePeerLeft = ({ peerId }) => {
      if (callsRef.current[peerId]) {
        callsRef.current[peerId].close();
        delete callsRef.current[peerId];
      }
      setRemotePeers((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    };

    socket.on('existingPeers', handleExistingPeers);
    socket.on('newPeer', handleNewPeer);
    socket.on('peerLeft', handlePeerLeft);

    return () => {
      socket.off('existingPeers', handleExistingPeers);
      socket.off('newPeer', handleNewPeer);
      socket.off('peerLeft', handlePeerLeft);
    };
  }, [roomId]);

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  if (!roomId) return null;

  if (error) {
    return <div className="mb-4 rounded-lg bg-white p-4 text-sm text-red-500 shadow">{error}</div>;
  }

  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">🎥 Video</h2>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <VideoTile stream={localStream} userName={user?.name} isLocal cameraOn={cameraOn} />
        {Object.entries(remotePeers).map(([peerId, p]) => (
          <VideoTile key={peerId} stream={p.stream} userName={p.userName} isLocal={false} cameraOn={p.cameraOn} />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleCamera}
          disabled={!ready}
          className={`rounded px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${
            cameraOn ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          {cameraOn ? 'Camera On' : 'Camera Off'}
        </button>
        <button
          onClick={toggleMic}
          disabled={!ready}
          className={`rounded px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${
            micOn ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          {micOn ? 'Mic On' : 'Mic Off'}
        </button>
      </div>
    </div>
  );
}

export default VideoGrid;