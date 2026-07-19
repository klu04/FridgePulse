function CardRow({ children }) {
    return (
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 -mx-4 scrollbar-hide">
            {children}
        </div>
    )
}

export default CardRow;