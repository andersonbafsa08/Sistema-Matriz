
import React from 'react';
import { SettingsFeaturesProps } from '../../types';
import { Wrench } from '../../App';

const SettingsPageContent: React.FC<SettingsFeaturesProps> = (props) => {
    return (
        <div className="w-full text-center p-8 bg-white rounded-lg shadow-md border">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Área de Configurações</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                Esta área é reservada para futuras configurações da página.
                A funcionalidade principal de configurações, incluindo importação, exportação e gerenciamento de rotas, está disponível no painel lateral.
            </p>
            <p className="text-gray-500 text-sm mt-2">
                Clique no ícone de engrenagem no canto superior direito para abrir o painel.
            </p>
        </div>
    );
};

export default SettingsPageContent;
