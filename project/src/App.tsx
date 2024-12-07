import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { TermsNotice } from './components/TermsNotice';
import { MobileAuthCard } from './components/MobileAuthCard';
import { Home } from './pages/Home';
import { AskQuestion } from './pages/AskQuestion';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Messages } from './pages/Messages';
import { SearchResults } from './pages/SearchResults';
import { AuthProvider } from './contexts/AuthContext';
import { SessionTimeoutProvider } from './contexts/SessionTimeoutContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SessionTimeoutProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="animate-slide-in">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/perguntar" element={<AskQuestion />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="/mensagens" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/search" element={<SearchResults />} />
                </Routes>
              </div>
            </main>
            <TermsNotice />
            <MobileAuthCard />
          </div>
        </SessionTimeoutProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;