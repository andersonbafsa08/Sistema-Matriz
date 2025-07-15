
import React, { ReactNode } from 'react';
import { AuthIcon } from '../../App';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <AuthIcon size={48} className="mx-auto text-blue-600" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-800">Sistema Matriz</h1>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
