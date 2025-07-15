import React, { useCallback } from 'react';
import { useNotification } from '../../App';

const SupportPanel: React.FC = () => {
    const addNotification = useNotification();
    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); addNotification("Mensagem de suporte enviada (simulação).", 'success'); e.currentTarget.reset();
    }, [addNotification]);
    return (
        <div className="space-y-4">
            <div><h4 className="font-semibold text-gray-800">Entre em Contato</h4><p className="text-sm text-gray-600">Para problemas ou dúvidas.</p><p className="text-sm text-gray-600 mt-2"><strong>Email:</strong> suporte@matrizsistemas.com.br</p><p className="text-sm text-gray-600"><strong>Telefone:</strong> (XX) XXXXX-XXXX</p></div>
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4"><h4 className="font-semibold text-gray-800">Enviar uma Mensagem</h4><textarea placeholder="Descreva seu problema..." className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[120px]" required></textarea><div className="flex justify-end"><button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Enviar Mensagem</button></div></form>
        </div>
    );
};
export default SupportPanel;