import withAuth from '../utils/withAuth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import "../App.css";
import TextField from '@mui/material/TextField';
import { AuthContext } from '../context/AuthContext';

export function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = React.useState("");
  const {addToUserHistory} = React.useContext(AuthContext);

  let handleJoinVideoMeet = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  }
  
  return (
    <>
      <div className='navbar'>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <h2>Ping Me</h2>
        </div>
        <div style={{display:'flex', alignItems: 'center'}}>
          <div style={{display: 'flex', textAlign: 'center'}}>
            <IconButton>
              <RestoreIcon/>
            </IconButton>
            <p style={{paddingTop:'7px'}}>History</p>
          </div>
          <Button onClick={()=>{
            localStorage.removeItem("token");
            navigate("/auth");
          }}>
            Logout
          </Button>
        </div>
    </div>
    
    <div className='meet-container'>
      <div className="leftPanel">
        <div>
          <h2>Providing Quality Video Call Just Like Quality Education</h2>
          <div style={{display:'flex',gap: '10px'}}>
            <TextField onChange={(e) => setMeetingCode(e.target.value)} variant='outlined' id='outlined-basic' label="Meeting Code"></TextField>
            <Button variant='contained' onClick={handleJoinVideoMeet} style={{marginLeft: '10px'}}>Join</Button>
          </div>
        </div>
      </div>
      <div className="rightPanel">
       <img src="logo3.png"></img>
      </div>
    </div>

    </>
  )
}

export default withAuth(HomeComponent);
