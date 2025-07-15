
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../src/supabaseClient';
import { useForm, Spinner } from '../../App';
import { AddNotificationType } from '../../types';

interface SignUpPageProps {
    addNotification: AddNotificationType;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ addNotification }) => {
    const [formData, handleChange] = useForm({ email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            addNotification("As senhas não coincidem.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                 addNotification(`Erro no cadastro: ${error.message}`, 'error');
            } else {
                addNotification('Cadastro realizado! Verifique seu email para confirmar sua conta.', 'success', { duration: 10000 });
            }
        } catch (err: any) {
            addNotification(`Ocorreu um erro inesperado: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [formData, addNotification]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-700">Criar uma nova conta</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
                 <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email-signup"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="password-signup"className="block text-sm font-medium text-gray-700">Senha</label>
                    <input
                        id="password-signup"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword-signup"className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <input
                        id="confirmPassword-signup"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Spinner /> : 'Cadastrar'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Faça login
                </Link>
            </p>
        </div>
    );
};

export default SignUpPage;
