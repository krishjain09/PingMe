import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from "./pages/LandingPage"
import './App.css'
import { Authentication } from './pages/Authentication';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/auth" element={<Authentication/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
