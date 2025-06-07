const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.get("/", function (req, res) {
    res.render("index");
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);
    
    // Handle location updates
    socket.on("sendLocation", (data) => {
        // Broadcast to all other clients
        socket.broadcast.emit("receiveLocation", {
            id: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });
        
        // Also send to sender (optional, if you want them to see their own marker)
        socket.emit("receiveLocation", {
            id: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("userDisconnected", { id: socket.id });
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});