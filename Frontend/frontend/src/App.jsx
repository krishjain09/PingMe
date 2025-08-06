import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from "./pages/LandingPage"
import './App.css'
import { Authentication } from './pages/Authentication';
import { AuthProvider } from './context/AuthContext';
import {VideoMeetComponent} from './pages/VideoMeet.jsx';
import { HomeComponent } from './pages/Home.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/auth" element={<Authentication/>}></Route>
        <Route path="/home" element={<HomeComponent />}></Route>
        
        <Route path='/:url' element={<VideoMeetComponent />} />
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
