import { Link } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'

export function GuestBanner() {
    const { isGuest } = useAuthContext()
    if (!isGuest) return null

    return (
        <div className="flex items-center justify-between gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
            <span>You're in guest mode — data is only stored on this device.</span>
            <div className="flex gap-3 shrink-0">
                <Link to="/signup" className="font-medium underline underline-offset-2 hover:text-yellow-900">
                    Sign up
                </Link>
                <span className="text-yellow-300">|</span>
                <Link to="/login" className="font-medium underline underline-offset-2 hover:text-yellow-900">
                    Log in
                </Link>
            </div>
        </div>
    )
}