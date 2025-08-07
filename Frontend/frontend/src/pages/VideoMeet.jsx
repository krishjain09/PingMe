import { useState,useRef,useEffect } from "react";
import "../styles/videoComponent.module.css"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import io, { connect } from "socket.io-client"
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import Badge from "@mui/material/Badge";
import {useNavigate} from "react-router-dom";
import { server } from "../environment";

const server_url= server.prod;

var connections = {}

const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export function VideoMeetComponent() {
    
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let routeTo = useNavigate();

  let [videoAvailable,setVideoAvailable]= useState(true);

  let [audioAvailable,setAudioAvailable]= useState(true);

  let [audio,setAudio] = useState();
  let [video,setVideo]= useState([]); 

  let [screen,setScreen]= useState();

  let [showModal,setShowModal]= useState(true);

  let [screenAvailable,setScreenAvailable]= useState();

  let [messages,setMessages]= useState([]);

  let [message,setMessage]= useState("");

  let [newMessages , setNewMessages]= useState(0);

  let[askForUsername,setAskForUsername] = useState(true);

  let[username,setUsername] = useState("")

  const videoRef = useRef([])

  let [videos,setVideos] = useState([]);
  let getPermissions = async () =>{
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false);
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

                if(userMediaStream){

                    window.localStream=userMediaStream;

                    if(localVideoRef.current){
                        localVideoRef.current.srcObject=userMediaStream;
                    }
                }
            }
        }catch(error){
            throw error;
        }
        
    }

    useEffect(()=>{
        getPermissions();
    },[])

    let getUserMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop());
        }catch(e){console.log(e);}

        window.localStream = stream;
        console.log(localVideoRef.current);
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach((track)=>track.onended = ()=>{
            console.log("Track ended: ",track);
            setAudio(false);
            setVideo(false);
            try{
                let tracks= localVideoRef.current.srcObject.getTracks();   
                tracks.forEach(track => track.stop());
            }catch(e){ console.log(e);}

            //Todo Blacksilence
            let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for(let id in connections){
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description).then(()=>{
                        socketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].localDescription}));
                    }).catch((e)=>{
                        console.log("Error setting local description: ",e);
                    })
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext(); // Creates a virtual audio engine in the browser — part of Web Audio API.
        let oscillator = ctx.createOscillator(); //Makes sound
        let dst = oscillator.connect(ctx.createMediaStreamDestination()); //sent to another computer.
        oscillator.start();
        ctx.resume(); // Starts the audio context, allowing sound to be played.
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false}); // Returns a silent audio track
    }

    let blackScreen =({width = 640 , height = 480 }={})=>{
        let canvas = Object.assign(document.createElement("canvas"), {width, height});
        canvas.getContext("2d").fillRect(0, 0, width, height); // Fills the canvas with black color 
        let stream = canvas.captureStream(); // Captures the canvas as a video stream
        return Object.assign(stream.getVideoTracks()[0], {enabled: false}); // Returns a black video track
    }

    let getUserMedia = ()=>{
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess)
            .then((stream)=>{})
            .catch((e)=>{console.log(e)});
        }
        else{
            try{
                let tracks=localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            }catch(e){
                console.log(e);
            }
        }
    }
    
    let gotMessageFromServer = (fromId,message) =>{
        var signal = JSON.parse(message);
        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type === "offer"){
                        connections[fromId].createAnswer().then((description)=>{
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit("signal",fromId,JSON.stringify({'sdp': connections[fromId].localDescription}));
                            }).catch((e)=>{
                                console.log("Error setting local description: ",e);
                            })
                        })
                    }                    
                })
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let addMessageToChat = (data,sender,socketIdSender) => {
        
        setMessages((prevmessages) => [
            ...prevmessages,
            {sender: sender, data: data}
        ]);

        if(socketIdSender !== socketIdRef.current && showModal === false){
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }

    }

    let connectToSocketServer = () =>{
        socketRef.current = io.connect(server_url,{secure:false});
        console.dir(socketRef.current);

        socketRef.current.on("signal",gotMessageFromServer);

        socketRef.current.on("connect",()=>{
            console.log("Connected to socket server");
            socketRef.current.emit("join-call",window.location.href);
            
            socketIdRef.current = socketRef.current.id;
            console.log("Socket ID: ",socketIdRef.current);
            console.dir(socketRef.current);

            //chat-message event is emitted when a new message is sent in the chat
            socketRef.current.on("chat-message",addMessageToChat);


            //user-left event is emitted when a user leaves the call
            socketRef.current.on("user-left",(id)=>{
                setVideos((videos)=>videos.filter((video)=>video.socketId!==id));
            })


            //user-joined event is emitted when a new user joins the call
            socketRef.current.on("user-joined",(id,clients)=>{
                //creates a new RTCPeerConnection for the new user
                clients.forEach((socketListId)=>{
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate){
                            socketRef.current.emit("signal",socketListId,JSON.stringify({'ice': event.candidate}));
                        }
                    }

                    //adds the local stream to the peer connection
                    connections[socketListId].onaddstream = (event) => {
                        console.log("🟢 onaddstream triggered from:", socketListId);
                        let videoExists = videoRef.current.find((video) => video.socketId === socketListId);
                        if(videoExists){
                            
                            setVideos(videos => {
                                const updatedVideos = videos.map((video) => 
                                    video.socketId === socketListId ? {...video, stream: event.stream} : video
                            );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                             })
                        }else{
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                playsinline: true,
                                autoPlay: true
                            };
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                console.log("✅ Added new video stream from: ", newVideo.socketId);
                                return updatedVideos;
                            });
                        }
                };
            
            if(window.localStream){
                connections[socketListId].addStream(window.localStream);
            }else{
                //Todo Blacksilence 
                let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
                window.localStream = blackSilence();
                connections[socketListId].addStream(window.localStream);
            }

            })

            if(id==socketIdRef.current){
                console.log("You are the host of the call");
                for(let id2 in connections){
                    if(id2 === socketIdRef.current) continue;

                    try{
                        connections[id2].addStream(window.localStream);
                    }catch(e) {}

                    connections[id2].createOffer().then((description)=>{
                        connections[id2].setLocalDescription(description).then(()=>{
                            socketRef.current.emit("signal",id2,JSON.stringify({'sdp': connections[id2].localDescription}));
                        }).catch((e)=>{
                            console.log("Error setting local description: ",e);
                        })
                    })
                }
            }

        })
        }
    )}

    

    useEffect(()=>{
        if(video !== undefined && audio!==undefined){
            getUserMedia();
        }
    },[audio,video])

    let getMedia = ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let handleVideoClick = () => {
        setVideo(!video)
    }

    let handleAudioClick = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) =>{
        try{
            window.localStream.getTracks().forEach(track => track.stop());
        }catch(e){console.log(e);}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;
            try{
                connections[id].addStream(window.localStream);
            }catch(e) {console.log(e);}
            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description).then(()=>{
                    socketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].localDescription}));
                }).catch((e)=>{
                    console.log("Error setting local description: ",e);
                })
            })
        }

        stream.getTracks().forEach((track)=>track.onended = ()=>{
            console.log("Track ended: ",track);
            setScreen(false);
            try{
                let tracks= localVideoRef.current.srcObject.getTracks();   
                tracks.forEach(track => track.stop());
            }catch(e){ console.log(e);}

            
            let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia = () =>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({audio: true, video: true})
                .then(getDisplayMediaSuccess)
                .then((stream)=>{})
                .catch((error)=>{console.log(error)})
            }
        }
    }



    useEffect(()=>{
        if(screen!==undefined){
            getDisplayMedia();
        }
    },[screen]);

    let handleScreenClick = ()=>{
        setScreen(!screen);
    }

    let sendMessage = ()=>{
        socketRef.current.emit("chat-message",message,username);
        setMessage("");
    }

    let handleCallEnd = () => {
        try{
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }catch(e){
            console.log(e);
        }
        routeTo("/home");
    }

    let handleChatClick = () => {
        const newState = !showModal;
        setShowModal(newState);

        if (newState === true) {
            setNewMessages(0);
        }
    }

    return (
        <div>

            {askForUsername === true ?

                <div>
                    <h2 style={{margin:"20px"}}>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter"){connect()}}} variant="outlined" style={{margin:"20px", width:"32em"}} />
                    <Button variant="contained" onClick={connect} style={{height: "56px", marginInline: "5px", margin:"20px"}} >Connect</Button>
                    
                    <div className={styles.localVideoContainer}>
                        <video ref={localVideoRef} autoPlay muted ></video>
                    </div>

                </div> :


                <div className={styles.meetVideoContainer}>
                    
                    {
                        showModal ? 
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>
                            
                                <div className={styles.chattingDisplay}>

                                    {messages.length !== 0 ? messages.map((item, index) => {

                                        console.log(messages)
                                        return (
                                            <div style={{ marginBottom: "20px" }} key={index}>
                                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p>No Messages Yet</p>}

                                </div>


                                <div className={styles.chattingArea}>
                                    <TextField value={message} onChange={(e)=>setMessage(e.target.value)} label="Enter your message" variant="outlined"  style={{width: "17rem"}}/>
                                    <Button type="submit" variant="contained" onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                        : <></>
                    }


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideoClick} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleCallEnd} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudioClick} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton  style={{ color: "white" }} onClick={handleScreenClick}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={handleChatClick} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                    </div>


                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video

                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                </div>

            }

        </div>
    )
}