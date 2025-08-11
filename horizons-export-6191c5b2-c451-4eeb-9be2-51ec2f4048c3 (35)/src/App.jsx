
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Helmet } from 'react-helmet';
import { AppRouter } from '@/AppRouter.jsx';

function App() {
  return (
    <>
      <Helmet>
        <title>Puff Perks</title>
      </Helmet>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <AppRouter />
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
