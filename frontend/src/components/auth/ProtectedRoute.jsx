import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'

export function AppRoute() {
    const { isLoggedIn } = useAuthContext()
    return isLoggedIn ? <Outlet /> : <Navigate to="/" />
}

export function PublicRoute() {
    const { isLoggedIn, isGuest } = useAuthContext()
    return isLoggedIn && !isGuest ? <Navigate to="/dashboard" /> : <Outlet />
}