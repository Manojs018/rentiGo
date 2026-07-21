import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketIo = null;
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
      socketIo = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
      setSocket(socketIo);
    } catch (err) {
      console.warn('Socket connection deferred:', err);
    }

    return () => {
      if (socketIo) socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext;
