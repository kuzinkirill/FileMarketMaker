import { Navigate, type RouteObject } from 'react-router-dom'

import { CreateDealPage } from './Deal/CreateDealPage.tsx'

export const createRoutes: RouteObject[] = [
  {
    path: 'deal',
    element: <CreateDealPage />,
  },
  {
    path: '',
    element: <Navigate replace to={'deal'} />,
  },
]
