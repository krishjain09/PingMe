import { useState,useRef,useEffect } from "react";
import "../styles/videoComponent.module.css"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { iconButtonClasses } from "@mui/material/IconButton";
import io from "socket.io-client"

const server_url= "http://localhost:8080";

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

  let [videoAvailable,setVideoAvailable]= useState(true);

  let [audioAvailable,setAudioAvailable]= useState(true);

  let [audio,setAudio] = useState();
  let [video,setVideo]= useState(); 

  let [screen,setScreen]= useState();

  let [showModal,setShowModal]= useState();

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
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;
            try{
                connections[id].addStream(window.localStream);
            }catch(e) {console.log(e);}
            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description).then(()=>{
                    socketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].description}));
                }).catch((e)=>{
                    console.log("Error setting local description: ",e);
                })
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

            for(let id in connections){
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description).then(()=>{
                        socketRef.current.emit("signal",id,JSON.stringify({'sdp': connections[id].description}));
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
                                socketRef.current.emit("signal",fromId,JSON.stringify({'sdp': connections[fromId].description}));
                            }).catch((e)=>{
                                console.log("Error setting local description: ",e);
                            })
                        })
                    }                    
                })
            }
        }
    }
    let addMessageToChat = (message) => {
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
                setVideo((videos)=>videos.filter((video)=>video.socketId!==id));
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
                                return updatedVideos;
                            });
                        }
                };
            
            if(window.localStream){
                connections[socketListId].addStream(window.localStream);
            }else{
                //Todo Blacksilence 
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
                            socketRef.current.emit("signal",id2,JSON.stringify({'sdp': connections[id2].description}));
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

    return (
        <>
        {askForUsername===true ?
            <div>
                <h2>Enter into Lobby</h2>
                <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" style={{height: "56px"}}>Connect</Button>
                <div style={{marginTop: "50px"}}>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div> : <></>
        }
    </>
  )
}