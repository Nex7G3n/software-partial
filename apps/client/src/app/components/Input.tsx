import React from 'react';

type InputVariant = 'primary' | 'outline' | 'secondary';

interface BaseProps {
	id: string;
	register?: (name: string) => Record<string, unknown>;
	className?: string;
	variant?: InputVariant;
}

type InputProps = BaseProps &
	React.InputHTMLAttributes<HTMLInputElement> & {
		as?: 'input';
	};

type TextAreaProps = BaseProps &
	React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
		as: 'textarea';
	};

type Props = InputProps | TextAreaProps;

const baseClasses =
	'w-full py-2 px-3 rounded-lg border transition-all duration-200 outline-none shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';

const variantClasses: Record<InputVariant, string> = {
	primary: 'border-gray-300 bg-white text-gray-900 focus:border-black',
	outline:
		'border-black bg-transparent text-gray-900 focus:bg-gray-100 focus:border-black',
	secondary: 'border-gray-200 bg-gray-100 text-gray-700 focus:border-black',
};

const Input: React.FC<Props> = ({
	id,
	register,
	className = '',
	variant = 'primary',
	as = 'input',
	...rest
}) => {
	const commonProps = {
		id,
		...(register ? register(id) : {}),
		className: `${baseClasses} ${variantClasses[variant]} mt-1 ${className}`,
		...rest,
	};

	if (as === 'textarea') {
		return (
			<textarea
				{...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
			/>
		);
	}

	return (
		<input
			{...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)}
		/>
	);
};

export default Input;
