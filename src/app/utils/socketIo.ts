import io, { Socket } from "socket.io-client";

let socketIo: Socket;

const SocketIO = (url: string): Socket => {
  socketIo = io(url);

  return socketIo;
};

export default SocketIO;
export { socketIo };
