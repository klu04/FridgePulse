function CardGrid({ children }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {children}
        </div>
    )
}

export default CardGrid;