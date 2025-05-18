import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
