import { useState,useRef,useEffect } from "react";
import "../styles/videoComponent.css"
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

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

    let getUserMedia = ()=>{
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(()=>{})
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

    useEffect(()=>{
        if(video !== undefined && audio!==undefined){
            getUserMedia();
        }
    },[audio,video])

    let getMedia = ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
    }

    return (
        <>
        {askForUsername===true ?
            <div>
                <h2>Enter into Lobby</h2>
                <TextField id="outlined-basic" label="Username" value={username}  onChange={(e)=>setUsername(e.target.value)} variant="outlined" />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained">Connect</Button>
                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div> : <></>
        }
    </>
  )
}
