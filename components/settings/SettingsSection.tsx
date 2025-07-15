import React, { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    actionButton?: ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children, actionButton }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>
                {actionButton && <div className="mt-2 sm:mt-0">{actionButton}</div>}
            </div>
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default SettingsSection;
