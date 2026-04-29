const FALLBACK = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80'

export default function DesignImage({ src, alt, style, className }) {
    return (
        <img
            src={src || FALLBACK}
            alt={alt || 'Design'}
            style={style}
            className={className}
            onError={(e) => {
                if (e.target.src !== FALLBACK) {
                    e.target.src = FALLBACK
                }
            }}
        />
    )
}
