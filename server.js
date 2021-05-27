const express = require('express');
const { Server } = require("socket.io");


const app = express();
const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server is live.",);
})
const io = new Server(server);

app.use(express.static('public'));

io.on("connection", socket => {
    console.log("User connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })

    socket.on("offer", data => {
        socket.broadcast.emit("connection-requested", data);
    })

    socket.on("answer", data => {
        socket.broadcast.emit("connection-accepted", data);
    })

    socket.on("new-ice-candidate", data => {
        socket.broadcast.emit("ice-candidate-received", data);
    })
})
