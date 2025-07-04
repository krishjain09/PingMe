import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from "./pages/LandingPage"
import './App.css'
import { Authentication } from './pages/Authentication';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/auth" element={<Authentication/>}></Route>
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
