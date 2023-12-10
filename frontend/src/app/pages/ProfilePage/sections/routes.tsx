import { Navigate, type RouteObject } from 'react-router-dom'

import OwnedSection from './OwnedSection.tsx'
import WithdrawSection from './WithdrawSection.tsx'

export const profileRoutes: RouteObject[] = [
  {
    path: '',
    element: <Navigate replace to={'owned'} />,
  },
  {
    path: 'owned',
    element: <OwnedSection />,
  },
  {
    path: 'withdraw',
    element: <WithdrawSection />,
  },
]
