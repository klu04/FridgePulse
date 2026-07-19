import { useEffect, useState } from 'react'
import { AuthContext, GUEST_KEY, ACCESS_TOKEN_KEY, clearAuth } from '@/lib/auth'
import { USER_INFO_URL } from '@/lib/api'
import { API_BASE } from '@/lib/api'
import { onLogout, syncGuestData } from '@/lib/syncService'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === 'true')
    const [isLoggedIn, setIsLoggedIn] = useState(
        () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)) || localStorage.getItem(GUEST_KEY) === 'true'
    )

    const login = async ({ email, password }) => {
        const body = new URLSearchParams({
            username: email,
            password,
        })

        const res = await fetch(`${API_BASE}/api/v1/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.detail ?? `Login failed (${res.status})`)
        }

        const { access_token } = await res.json()
        const nextUser = { email }

        localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
        localStorage.setItem('user', JSON.stringify(nextUser))
        localStorage.removeItem(GUEST_KEY)
        setUser(nextUser)
        setIsGuest(false)
        setIsLoggedIn(true)

        try {
            if (isGuest) {
                await syncGuestData()
            }
        } catch (err) {
            console.error("Guest data sync failed after login:", err)
        }
    }

    const register = async ({ name, email, password }) => {
        const res = await fetch(`${API_BASE}/api/v1/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            const detail = err.detail
            const message = Array.isArray(detail)
                ? detail.map((item) => item.msg).join(', ')
                : detail ?? `Registration failed (${res.status})`
            throw new Error(message)
        }

        return res.json()
    }

    const logout = async () => {
        await onLogout()
        clearAuth()
        localStorage.removeItem('user')
        setUser(null)
        setIsGuest(false)
        setIsLoggedIn(false)
    }

    const isAuthenticated = () => isLoggedIn

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (!token || localStorage.getItem(GUEST_KEY) === 'true') return

        let cancelled = false
        fetch(USER_INFO_URL, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch user')
                return r.json()
            })
            .then(async (currentUser) => {
                if (cancelled || localStorage.getItem(GUEST_KEY) === 'true') return
                setUser(currentUser)
                setIsGuest(false)
                setIsLoggedIn(true)
                localStorage.setItem('user', JSON.stringify(currentUser))
            })
            .catch(async () => {
                if (cancelled) return
                if (localStorage.getItem(GUEST_KEY) === 'true') {
                    setIsGuest(true)
                    setIsLoggedIn(true)
                    return
                }
                await onLogout()
                clearAuth()
                localStorage.removeItem('user')
                setUser(null)
                setIsGuest(false)
                setIsLoggedIn(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === GUEST_KEY || e.key === ACCESS_TOKEN_KEY) {
                setIsGuest(localStorage.getItem(GUEST_KEY) === 'true')
                setIsLoggedIn(
                    Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)) ||
                    localStorage.getItem(GUEST_KEY) === 'true'
                )
                if (!localStorage.getItem(ACCESS_TOKEN_KEY)) setUser(null)
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const setGuestMode = (value) => {
        if (value) {
            localStorage.setItem(GUEST_KEY, 'true')
        } else {
            localStorage.removeItem(GUEST_KEY)
        }
        setIsGuest(value)
        setIsLoggedIn(value || Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)))
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isGuest,
            isLoggedIn,
            setIsLoggedIn,
            setGuestMode,
            login,
            register,
            logout,
            isAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    )
}