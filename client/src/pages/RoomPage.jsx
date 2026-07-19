import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';

function RoomPage() {
  const { user } = useContext(AuthContext);
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('userJoined', ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `${userName} joined the room` },
      ]);
    });

    socket.on('userLeft', ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `${userName} left the room` },
      ]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    socket.emit('joinRoom', { roomId, userName: user.name });
    setJoined(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    socket.emit('sendMessage', {
      roomId,
      message: messageInput,
      userName: user.name,
    });
    setMessageInput('');
  };

  if (!joined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <form
          onSubmit={handleJoin}
          className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md"
        >
          <h1 className="mb-6 text-2xl font-bold text-gray-800">
            Join a Room
          </h1>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Room name (e.g. study-1)"
            className="mb-4 w-full rounded border border-gray-300 p-2"
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700"
          >
            Join Room
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 p-6">
      <h1 className="mb-4 text-xl font-bold text-gray-800">
        Room: {roomId}
      </h1>

      <div className="mb-4 flex-1 overflow-y-auto rounded-lg bg-white p-4 shadow">
        {messages.map((m, i) =>
          m.system ? (
            <p key={i} className="mb-2 text-sm italic text-gray-400">
              {m.message}
            </p>
          ) : (
            <p key={i} className="mb-2">
              <span className="font-semibold text-purple-600">
                {m.userName}:
              </span>{' '}
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

export default RoomPage;