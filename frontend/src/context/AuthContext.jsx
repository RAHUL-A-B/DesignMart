import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })

    const sendOtp = (phone_number) =>
        api.post('/auth/login/send-otp/', { phone_number })

    const verifyOtp = async (phone_number, otp) => {
        const res = await api.post('/auth/verify-otp/', { phone_number, otp })
        const { tokens, user } = res.data
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)

        // Sync guest cart after login
        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        if (guestCart.length > 0) {
            await api.post('/shoppers/cart/sync/', { offline_cart: guestCart })
            localStorage.removeItem('guest_cart')
        }
        return user
    }

    const logout = () => {
        localStorage.clear()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, sendOtp, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
