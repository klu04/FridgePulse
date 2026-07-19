import { createContext } from 'react'

export const GUEST_KEY        = 'guest_mode'
export const ACCESS_TOKEN_KEY = 'access_token'
export const AuthContext      = createContext(undefined)

export function clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(GUEST_KEY)
}