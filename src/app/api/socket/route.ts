import {Server} from "socket.io"
interface SocketRequest {
    socket: {
        server: {
            io: Server
        }
    }
}
export default function socketHandler(res: Request) {
    if (res.socket.)
}