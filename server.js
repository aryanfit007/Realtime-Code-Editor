const express = require('express')
const app = express();
const http =require('http');
const path = require('path');
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const ACTIONS = require('./src/actions');

app.use(express.static('build'));
app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build','index.html'))
})

const userSocketMap = {};
function getAllConnectedClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map((socketId)=>{
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    });
}
io.on('connection',(socket)=>{
    console.log('socket connected',socket.id);
    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id]=username;
        socket.join(roomId);
        console.log(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id, 
            });
        })
    });

    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
        // console.log('re');
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{
            code,roomId
        });

    })
    socket.on(ACTIONS.SYNC_CODE,({code,socketId})=>{
        // console.log('re');
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{
            code
        });
        
    })

    socket.on('disconnecting',()=>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId: socket.id,
                username: userSocketMap[socket.id],
            })
        })
        userSocketMap[socket.id];
        socket.leave();
    })
})

const PORT = process.env.PORT||5000;
server.listen(PORT,()=>console.log(`Listening on the port ${PORT}`));