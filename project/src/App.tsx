import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LoginPrompt } from './components/LoginPrompt';
import { Home } from './pages/Home';
import { AskQuestion } from './pages/AskQuestion';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/perguntar" element={<AskQuestion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <LoginPrompt />
      </div>
    </BrowserRouter>
  );
}

export default App;