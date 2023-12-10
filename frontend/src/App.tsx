import { observer } from 'mobx-react-lite'
import { RouterProvider } from 'react-router-dom'

import { router } from './app/pages/router.tsx'
import { Providers } from './providers.tsx'

const App = observer(function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
})

export default App
