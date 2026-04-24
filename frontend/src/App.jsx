// App.jsx
// Root component of the application.
// Now simplified to only wrap AppRoutes inside BrowserRouter.
// All routing logic lives in routes/AppRoutes.jsx.

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
