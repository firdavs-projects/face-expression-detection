


export const Button: React.FC<
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = ({children, className, ...props}) => {

    return (
        <button className={`bg-[#007AFF] hover:bg-blue-700 text-white py-6 px-8 shadow-xl rounded-2xl ${className}`} {...props}>
            {children}
        </button>
    )
}