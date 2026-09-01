import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import PomodoroTimer from '../components/PomodoroTimer';
import BreakAlertModal from '../components/BreakAlertModal';
import Scratchpad from '../components/Scratchpad';
import socket from '../socket';
import VideoGrid from '../components/VideoGrid';

const MODES = {
  SELECT: 'select',
  CREATE: 'create',
  JOIN_PRIVATE: 'joinPrivate',
  BROWSE_PUBLIC: 'browsePublic',
};

function RoomPage() {
  const { user } = useContext(AuthContext);
  const {
    currentRoom,
    publicRooms,
    loading,
    createRoom,
    joinRoom,
    fetchPublicRooms,
    leaveRoom,
  } = useRoom();

  const [mode, setMode] = useState(MODES.SELECT);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [formError, setFormError] = useState('');

  const [createName, setCreateName] = useState('');
  const [createIsPublic, setCreateIsPublic] = useState(true);
  const [createPassword, setCreatePassword] = useState('');

  const [joinName, setJoinName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    if (!currentRoom) return;

    const handleReceiveMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleUserJoined = ({ userName }) =>
      setMessages((prev) => [...prev, { system: true, message: `${userName} joined the room` }]);
    const handleUserLeft = ({ userName }) =>
      setMessages((prev) => [...prev, { system: true, message: `${userName} left the room` }]);

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);

    socket.emit('joinRoom', { roomId: currentRoom.roomId, userName: user?.name });

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.emit('leaveRoom', { roomId: currentRoom.roomId, userName: user?.name });
    };
  }, [currentRoom, user?.name]);

  useEffect(() => {
    if (mode === MODES.BROWSE_PUBLIC) {
      fetchPublicRooms().catch(() => {});
    }
  }, [mode, fetchPublicRooms]);

  const goTo = (nextMode) => {
    setFormError('');
    setMode(nextMode);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!createName.trim()) return;
    if (!createIsPublic && !createPassword) {
      setFormError('Password is required for private rooms');
      return;
    }
    try {
      await createRoom(
        createName.trim(),
        createIsPublic,
        createIsPublic ? undefined : createPassword
      );
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleJoinPrivate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!joinName.trim() || !joinPassword) return;
    try {
      await joinRoom(joinName.trim(), joinPassword);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleJoinPublic = async (roomName) => {
    setFormError('');
    try {
      await joinRoom(roomName);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;
    socket.emit('sendMessage', {
      roomId: currentRoom.roomId,
      message: messageInput,
      userName: user?.name,
    });
    setMessageInput('');
  };

  const handleLeave = () => {
    setMessages([]);
    setCreateName('');
    setCreatePassword('');
    setJoinName('');
    setJoinPassword('');
    setMode(MODES.SELECT);
    leaveRoom();
  };

  if (currentRoom) {
    return (
      <div className="flex h-screen flex-col bg-gray-100 p-6 pb-32">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Room: {currentRoom.name}{' '}
            <span className="text-sm font-normal text-gray-400">
              ({currentRoom.isPublic ? 'public' : 'private'})
            </span>
          </h1>
          <button
            onClick={handleLeave}
            className="rounded bg-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-400"
          >
            Leave Room
          </button>
        </div>

        <PomodoroTimer />
        <BreakAlertModal />
        <Scratchpad />
        <PomodoroTimer />
        <BreakAlertModal />
        <Scratchpad />
        <VideoGrid />

        <div className="mb-4 flex-1 overflow-y-auto rounded-lg bg-white p-4 shadow">
          {messages.map((m, i) =>
            m.system ? (
              <p key={i} className="mb-2 text-sm italic text-gray-400">
                {m.message}
              </p>
            ) : (
              <p key={i} className="mb-2">
                <span className="font-semibold text-purple-600">{m.userName}:</span>{' '}
                {m.message}
              </p>
            )
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded border border-gray-300 p-2"
          />
          <button
            type="submit"
            className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {mode === MODES.SELECT && (
          <>
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Rooms</h1>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => goTo(MODES.CREATE)}
                className="rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700"
              >
                Create a Room
              </button>
              <button
                onClick={() => goTo(MODES.JOIN_PRIVATE)}
                className="rounded border border-purple-600 py-2 font-semibold text-purple-600 hover:bg-purple-50"
              >
                Join a Private Room
              </button>
              <button
                onClick={() => goTo(MODES.BROWSE_PUBLIC)}
                className="rounded border border-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Browse Public Rooms
              </button>
            </div>
          </>
        )}

        {mode === MODES.CREATE && (
          <form onSubmit={handleCreate}>
            <button
              type="button"
              onClick={() => goTo(MODES.SELECT)}
              className="mb-4 text-sm text-gray-400 hover:text-gray-600"
            >
              &larr; Back
            </button>
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Create a Room</h1>

            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Room name (must be unique)"
              className="mb-4 w-full rounded border border-gray-300 p-2"
              required
            />

            <label className="mb-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={createIsPublic}
                onChange={(e) => setCreateIsPublic(e.target.checked)}
              />
              Make this room public
            </label>

            {!createIsPublic && (
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Room password"
                className="mb-4 w-full rounded border border-gray-300 p-2"
                required
              />
            )}

            {formError && <p className="mb-4 text-sm text-red-500">{formError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Room'}
            </button>
          </form>
        )}

        {mode === MODES.JOIN_PRIVATE && (
          <form onSubmit={handleJoinPrivate}>
            <button
              type="button"
              onClick={() => goTo(MODES.SELECT)}
              className="mb-4 text-sm text-gray-400 hover:text-gray-600"
            >
              &larr; Back
            </button>
            <h1 className="mb-6 text-2xl font-bold text-gray-800">Join a Private Room</h1>

            <input
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Room name"
              className="mb-4 w-full rounded border border-gray-300 p-2"
              required
            />
            <input
              type="password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Room password"
              className="mb-4 w-full rounded border border-gray-300 p-2"
              required
            />

            {formError && <p className="mb-4 text-sm text-red-500">{formError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Joining…' : 'Join Room'}
            </button>
          </form>
        )}

        {mode === MODES.BROWSE_PUBLIC && (
          <div>
            <button
              type="button"
              onClick={() => goTo(MODES.SELECT)}
              className="mb-4 text-sm text-gray-400 hover:text-gray-600"
            >
              &larr; Back
            </button>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Public Rooms</h1>
              <button
                onClick={() => fetchPublicRooms().catch(() => {})}
                className="text-sm text-purple-600 hover:underline"
              >
                Refresh
              </button>
            </div>

            {formError && <p className="mb-4 text-sm text-red-500">{formError}</p>}

            {loading && publicRooms.length === 0 && (
              <p className="text-sm text-gray-400">Loading rooms…</p>
            )}
            {!loading && publicRooms.length === 0 && (
              <p className="text-sm text-gray-400">No public rooms right now.</p>
            )}

            <ul className="flex flex-col gap-2">
              {publicRooms.map((room) => (
                <li key={room.roomId}>
                  <button
                    onClick={() => handleJoinPublic(room.name)}
                    disabled={loading}
                    className="flex w-full items-center justify-between rounded border border-gray-200 p-3 text-left hover:bg-purple-50 disabled:opacity-50"
                  >
                    <span className="font-semibold text-gray-800">{room.name}</span>
                    <span className="text-sm text-gray-400">{room.userCount} online</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomPage;