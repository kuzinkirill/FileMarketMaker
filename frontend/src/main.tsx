import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import LoadingIcon from './assets/img/Capibebra.gif'

const App = React.lazy(() => import('./App').then(module => ({ default: module.App })))

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <React.Suspense fallback={(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
          <img src={LoadingIcon} />
        </div>
      )}
      >
        <App />
      </React.Suspense>
    </React.StrictMode>,
  )
}
