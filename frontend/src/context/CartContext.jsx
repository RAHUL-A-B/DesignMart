import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartIds, setCartIds] = useState([])

    const loadCart = async () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        if (user) {
            try {
                const res = await api.get('/shoppers/cart/')
                const ids = res.data.items?.map(i => i.design) || []
                setCartIds(ids)
            } catch { setCartIds([]) }
        } else {
            const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
            // normalize both string and {id,qty} formats
            const ids = guest.map(i => typeof i === 'string' ? i : i.id)
            setCartIds(ids)
        }
    }

    useEffect(() => { loadCart() }, [])

    const addToCart = async (design_id) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        if (cartIds.includes(design_id)) return false

        if (user) {
            await api.post('/shoppers/cart/', { design_id })
        } else {
            const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
            const ids = guest.map(i => typeof i === 'string' ? i : i.id)
            if (ids.includes(design_id)) return false
            guest.push({ id: design_id, qty: 1 })
            localStorage.setItem('guest_cart', JSON.stringify(guest))
        }
        setCartIds(prev => [...prev, design_id])
        return true
    }

    const cartCount = cartIds.length

    return (
        <CartContext.Provider value={{ cartIds, cartCount, addToCart, loadCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
