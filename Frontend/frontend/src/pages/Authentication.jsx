import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import Snackbar from '@mui/material/Snackbar';



const theme = createTheme();

export function Authentication() {
  

  // Generate a random image URL once on first load
  const randomImageUrl = React.useMemo(() => {
  const ids = [
    "photo-1506744038136-46273834b3fb",
    "photo-1522199710521-72d69614c702",
    "photo-1520813792240-56fc4a3765a7",
    "photo-1495567720989-cebdbdd97913",
    "photo-1506748686214-e9df14d4d9d0",
    "photo-1470770841072-f978cf4d019e"
  ];
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return `https://images.unsplash.com/${randomId}?auto=format&fit=crop&w=1200&q=80`;
}, []);

    const [username,setUsername] = React.useState();
    const [password,setPassword]=React.useState();
    const [name,setName]=React.useState();
    const [error,setError]=React.useState();
    const [message,setMessage]=React.useState();

    const [formState,setFormState]=React.useState(0);
    const [open,setOpen]=React.useState(false);
    
    const {handleRegister,handleLogin} = React.useContext(AuthContext);

    let handleAuth = async ()=>{
      try{
          if(formState===0){
            let result = await handleLogin(username,password);
            console.log(result);
          }

          if(formState===1){
            let result = await handleRegister(name,username,password);
            console.log(result);
            setMessage(result);
            setOpen(true);
            setError("");
            setFormState(0);
            setName("");
            setUsername("");
            setPassword("");
          }

      }catch(err){
           console.log(err);
            let message = (err.response.data.message);
            setError(message);
      }
    }

  return (
    <ThemeProvider theme={theme}>
      <Grid container sx={{ height: '100vh' }}>
        <CssBaseline />

        {/* Left side: Random image background */}
        <Grid
          sx={{
            flex: 1,
            backgroundImage: `url(${randomImageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Right side: Login form */}
        <Grid
          sx={{
            width: { xs: '100%', md: '40%' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          component={Paper}
          elevation={6}
          square
        >
          <Box
            sx={{
              mx: 4,
              my: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 400,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            
            <div>
                <Button variant={formState===0 ? "contained" : ""} onClick={()=>setFormState(0)}>
                    Sign In
                </Button>
                <Button variant={formState===1 ? "contained" : ""} onClick={()=>setFormState(1)}>
                    Sign Up
                </Button>
            </div>

            <Box component="form" noValidate  sx={{ mt: 1 }}>
              {
                formState===1 ? <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={name}
                autoComplete="name"
                autoFocus
                onChange={(e)=>setName(e.target.value)}
              /> : <></>
              }
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoComplete="username"
                autoFocus
                onChange={(e)=>setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                value={password}
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e)=>setPassword(e.target.value)}
              />
              
              <p style={{color:"red"}}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
              {formState===0 ? "LogIn" : "Register"}
              </Button>
              
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
