import express from"express"
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose"
import dotenv from "dotenv";
import cors from "cors";

import { connectToSocket } from "./controllers/socketManager.js";
import router from "./routers/user.router.js";
dotenv.config();

const app = express(); // Creates an Express app instance (not an HTTP server)
const server = createServer(app); // Converts Express app into an HTTP server
const io = connectToSocket(server); // Passes the HTTP server to socket.io

app.set("PORT", (process.env.PORT || 3000));

app.use(cors());
app.use(express.json({limit: "40kb"}))
app.use(express.urlencoded({limit: "40kb"}));

app.use("/api/v1",router);


server.listen(app.get("PORT"),async ()=>{
    try{
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connection has been successfully established ",connectionDb.connection.host);
    }catch(error){
        console.log("Connection failed: ", error);
    }
    console.log(`Server is listening on port number ${app.get("PORT")}`);
})