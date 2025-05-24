import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	children: React.ReactNode;
}

const baseClasses =
	'w-full py-2 rounded-md transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none shadow-md hover:shadow-lg';

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-black text-white hover:bg-neutral-800',
	outline:
		'bg-transparent border border-black text-black hover:bg-black hover:text-white',
	secondary: 'bg-neutral-200 text-black hover:bg-neutral-300',
};

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	children,
	className = '',
	...props
}) => {
	return (
		<button
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};
