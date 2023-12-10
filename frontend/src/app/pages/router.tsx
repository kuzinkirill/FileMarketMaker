import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'

import { AppLayout } from '../components/App'
import { Params } from '../utils/router'
import { createRoutes } from './CreatePage/routes.tsx'
import { DealPage } from './DealPage/DealPage.tsx'
import { ExplorePage } from './ExplorePage/ExplorePage.tsx'
import ProfilePage from './ProfilePage/ProfilePage.tsx'
import { profileRoutes } from './ProfilePage/sections/routes.tsx'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <ExplorePage />,
  },
  {
    path: `/deal/:${Params.dealId}`,
    element: <DealPage />,
  },
  {
    path: `profile/:${Params.profileAddress}`,
    element: <ProfilePage />,
    children: profileRoutes,
  },
  {
    path: 'create',
    children: createRoutes,
  },
  {
    path: '*',
    element: <Navigate replace to={'/'} />,
  },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: routes,
  },
])
