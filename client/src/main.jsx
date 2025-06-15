import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//initialises react
createRoot(document.getElementById('root')).render( 
  <StrictMode> {/*catches issues in app*/}
    <App /> {/*where the app starts*/}
  </StrictMode>,
)
//main file, imports App.jsx and renders