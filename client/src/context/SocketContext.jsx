import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const socketUrl = apiUrl.replace(/\/api$/, '');

    console.log(`🔌 Connecting to Socket server at ${socketUrl}`);
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server successfully');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
    });

    return () => {
      newSocket.disconnect();
      console.log('🔌 Disconnected from Socket.io server');
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
