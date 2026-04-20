import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'
import Home from './pages/Home.jsx'
import SinglePlayer from './pages/SinglePlayer.jsx'
import MultiPlayer from './pages/MultiPlayer.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solo" element={<SinglePlayer />} />
          <Route path="/multi" element={<MultiPlayer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
