import { Server } from "socket.io";

export async function connectToSocket(server){
    const io = new Server(server);
    return io;
}