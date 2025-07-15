
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../src/supabaseClient';
import { useForm, Spinner } from '../../App';
import { AddNotificationType } from '../../types';

interface LoginPageProps {
    addNotification: AddNotificationType;
}

const LoginPage: React.FC<LoginPageProps> = ({ addNotification }) => {
    const [formData, handleChange] = useForm({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                if (error.message === 'Invalid login credentials') {
                    addNotification('Email ou senha inválidos.', 'error');
                } else {
                    addNotification(`Erro de login: ${error.message}`, 'error');
                }
            } else {
                addNotification('Login bem-sucedido!', 'success');
                // The onAuthStateChange listener in App.tsx will handle the state update and redirect.
            }
        } catch (err: any) {
            addNotification(`Ocorreu um erro inesperado: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [formData, addNotification]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-700">Acessar sua conta</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Senha</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Spinner /> : 'Entrar'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Cadastre-se
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
