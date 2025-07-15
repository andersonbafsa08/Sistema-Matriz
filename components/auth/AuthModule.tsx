
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AddNotificationType } from '../../types';
import AuthLayout from './AuthLayout';
import { FullPageSpinner } from '../../App';

const LoginPage = lazy(() => import('./LoginPage'));
const SignUpPage = lazy(() => import('./SignUpPage'));

interface AuthModuleProps {
    addNotification: AddNotificationType;
}

const AuthModule: React.FC<AuthModuleProps> = ({ addNotification }) => {
    return (
        <AuthLayout>
            <Suspense fallback={<FullPageSpinner />}>
                <Routes>
                    <Route path="/login" element={<LoginPage addNotification={addNotification} />} />
                    <Route path="/signup" element={<SignUpPage addNotification={addNotification} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        </AuthLayout>
    );
};

export default AuthModule;
