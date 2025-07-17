


import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useNavigate, Link, useLocation, NavLink, Navigate } from 'react-router-dom';
import { supabase } from './src/supabaseClient';
import { RootState, AppDispatch } from './src/store/store';
import {
    setPrefilledRequestDataReducer,
    clearPrefilledRequestDataReducer
} from './src/store/slices/navigationSlice';
import { setClients, clearClients, addClient, updateClient, deleteClientReducer } from './src/store/slices/clientsSlice';
import { setHotels, clearHotels, addHotel, updateHotel, deleteHotelReducer } from './src/store/slices/hotelsSlice';
import { setCollaborators, clearCollaborators, addCollaborator, updateCollaborator, deleteCollaboratorReducer } from './src/store/slices/collaboratorsSlice';
import { setRequests, clearRequests, addRequest, updateRequest, deleteRequestReducer } from './src/store/slices/requestsSlice';
import { setHistory, clearHistory, addHistoryItem, updateHistoryItem, deleteHistoryItemReducer } from './src/store/slices/historySlice';
import { setRoutes, clearRoutes, addRoute, updateRoute, deleteRoute } from './src/store/slices/routesSlice';
import { setStockItems, clearStock, addStockItem, updateStockItem, deleteStockItem } from './src/store/slices/stockSlice';
import { setStockHistory, clearStockHistory, addStockHistoryEntry, updateStockHistoryEntry, deleteStockHistoryEntry } from './src/store/slices/stockHistorySlice';
import { setStockPdfSettings, clearStockSettings } from './src/store/slices/stockSettingsSlice';
import { setVehicles, clearFleet, addVehicle, updateVehicle, deleteVehicleReducer } from './src/store/slices/fleetSlice';
import { setDiarias, clearDiarias, addDiaria, updateDiaria, deleteDiaria } from './src/store/slices/diariasSlice';
import { setDiariaSettings, clearDiariaSettings } from './src/store/slices/diariaSettingsSlice';
import { setUserAndSession, clearAuth } from './src/store/slices/authSlice';

import {
  AddNotificationType, Client, Hotel, Collaborator, MockData, Notification as NotificationType,
  DEFAULT_NOTIFICATION_DURATION,
  Request,
  HistoryRequest,
  Rota,
  StockItem,
  StockHistoryItem,
  Vehicle,
  Diaria,
  DiariaSettings,
  PdfSettings
} from './types';
import SettingsSidePanel from './components/settings/SettingsSidePanel';

// ICONS
import {
  ChevronsRight, Edit, Trash2, MapPin, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Paperclip, RefreshCw, FilePlus, CheckCircle, AlertTriangle, Eye, Upload, Briefcase, RotateCcw,
  FileText as FileTextIcon,
  Users, X, Wrench, Download, Square, CheckSquare, FileText,
  Settings as SettingsIcon, Home, DollarSign, Archive, LogOut, ArrowLeft, ClipboardCopy, Menu, Truck, Building2, Database
} from 'lucide-react';

export {
  ChevronsRight, Edit, Trash2, MapPin as MapPinIcon, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Paperclip, RefreshCw, FilePlus, CheckCircle, AlertTriangle, Eye, Upload, Briefcase, RotateCcw,
  FileTextIcon as FileExport,
  Users, X as XIcon, Wrench, Download, Square, CheckSquare, FileText, SettingsIcon,
  Home as HomeIcon, Users as UsersIcon, FileText as RequestsIcon, Truck as FleetIcon,
  DollarSign as DiariaIcon, Archive as StockIcon, LogOut as LogoutIcon, ChevronDown as ChevronDownIcon, Menu as MenuIcon,
  ArrowLeft as ArrowLeftIcon, ClipboardCopy as CopyIcon,
  Archive as WhatsAppIcon, // Placeholder for WhatsApp icon
  Building2 as AuthIcon,
  Database as DatabaseIcon
};


// HOOKS
export type UseFormChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type UseFormSetFormData<T> = React.Dispatch<React.SetStateAction<T>>;
export type UseFormHook<T> = [T, UseFormChangeHandler, UseFormSetFormData<T>];

export function useForm<T>(initialState: T): UseFormHook<T> {
  const [formData, setFormData] = useState<T>(initialState);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  return [formData, handleChange, setFormData];
}

export const NotificationContext = createContext<AddNotificationType | null>(null);
export const useNotification = (): AddNotificationType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

// UTILITY FUNCTIONS
export const formatCollaboratorName = (name?: string): string => {
    if (!name) return '';
    return name.trim().split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
};
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        }
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return dateString;
    }
};
export const formatCpfInput = (cpf: string = ''): string => {
    const digitsOnly = cpf.replace(/\D/g, '').slice(0, 11);
    if (digitsOnly.length > 9) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9, 11)}`;
    if (digitsOnly.length > 6) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}`;
    if (digitsOnly.length > 3) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}`;
    return digitsOnly;
};
export const formatCpfDisplay = (cpf: string = ''): string => {
    const digitsOnly = cpf.replace(/\D/g, '');
    if (digitsOnly.length !== 11) return cpf || '-';
    return formatCpfInput(digitsOnly);
};
export const formatCnpjInput = (cnpj: string = ''): string => {
    const digitsOnly = cnpj.replace(/\D/g, '').slice(0, 14);
    if (digitsOnly.length > 12) return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5, 8)}/${digitsOnly.slice(8, 12)}-${digitsOnly.slice(12, 14)}`;
    if (digitsOnly.length > 8) return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5, 8)}/${digitsOnly.slice(8, 12)}`;
    if (digitsOnly.length > 5) return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}.${digitsOnly.slice(5, 8)}`;
    if (digitsOnly.length > 2) return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 5)}`;
    return digitsOnly;
};
export const formatCnpjDisplay = (cnpj: string = ''): string => {
    const digitsOnly = cnpj.replace(/\D/g, '');
    if (digitsOnly.length !== 14) return cnpj || '-';
    return formatCnpjInput(digitsOnly);
};
export const formatPhoneDisplay = (phone: string = ''): string => {
    if (!phone) return '-';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 11) return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
    if (digitsOnly.length === 10) return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
    return phone;
};

// SHARED UI COMPONENTS
export const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
);

export const FullPageSpinner: React.FC<{ text?: string }> = ({ text = "Carregando..." }) => (
  <div className="flex flex-col justify-center items-center h-screen w-screen bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
    <p className="text-lg text-gray-700">{text}</p>
  </div>
);


export interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  modalContentClassName?: string;
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, title, modalContentClassName = 'max-w-lg', zIndex = 50 }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        const handleClickOutside = (event: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 transition-opacity duration-300" style={{ zIndex }}>
            <div ref={modalRef} className={`bg-white rounded-lg shadow-xl w-full flex flex-col ${modalContentClassName}`} style={{ maxHeight: '90vh' }}>
                <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </header>
                <main className="p-6 flex-grow overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export interface TooltipProps {
  text: string;
  children: ReactNode;
  tooltipClassName?: string; 
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, tooltipClassName = '' }) => (
    <div className="relative group flex items-center">
        {children}
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 ${tooltipClassName}`}>
            {text}
        </div>
    </div>
);

export interface CopyableFieldProps {
    label?: string;
    value: string | undefined | null;
    prefix?: string;
}
export const CopyableField: React.FC<CopyableFieldProps> = ({ value, label, prefix }) => {
    const addNotification = useNotification();
    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value) {
            navigator.clipboard.writeText(value);
            addNotification(`'${value}' copiado!`, 'success');
        }
    };
    if (!value) return <span>-</span>;
    return (
        <span onClick={copyToClipboard} className="cursor-pointer hover:text-blue-500 transition-colors" title={`Copiar: ${value}`}>
            {label && <strong className="font-normal">{label}: </strong>}
            <span className="font-medium">{prefix}{value}</span>
        </span>
    );
};

// LAZY LOADED MODULES
const AuthModule = lazy(() => import('./components/auth/AuthModule'));
const ClientModule = lazy(() => import('./components/ClientModule'));
const RequestModule = lazy(() => import('./components/RequestModule'));
const CollaboratorModule = lazy(() => import('./components/CollaboratorModule'));
const SettingsModule = lazy(() => import('./components/SettingsModule'));
const StockControlModule = lazy(() => import('./components/StockControlModule'));
const FleetModule = lazy(() => import('./components/FleetModule'));
const DiariaModule = lazy(() => import('./components/DiariaModule'));

const App: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { session, user, loading: authLoading } = useSelector((state: RootState) => state.auth);

    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    
    const addNotification = useCallback((
        message: string, 
        type: 'success' | 'error' | 'info' = 'info', 
        options: { duration?: number; isUndoable?: boolean; undoCallback?: () => void } = {}
    ) => {
        const id = Date.now() + Math.random();
        const { duration = DEFAULT_NOTIFICATION_DURATION, isUndoable = false, undoCallback } = options;
        const notification: NotificationType = { id, message, type, duration, isUndoable, undoCallback };
        setNotifications(prev => [...prev, notification]);
        if (duration) setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
    }, []);

    const handleError = useCallback((error: any, context: string) => {
        console.error(`Error ${context}:`, error);
        let errorMessage = "Ocorreu um erro inesperado.";
    
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
            errorMessage = error.message;
            if ('details' in error && typeof error.details === 'string') errorMessage += ` Detalhes: ${error.details}`;
            if ('hint' in error && typeof error.hint === 'string') errorMessage += ` Dica: ${error.hint}`;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
    
        const finalErrorMessage = String(errorMessage);
        const isPermissionError = /permission denied/i.test(finalErrorMessage) || (error?.code && (String(error.code) === '42501' || String(error.code).startsWith('PGRST3')));
        const isChannelError = /CHANNEL_ERROR/i.test(finalErrorMessage) || context.includes('subscrição');
        const isFetchError = /fetch failed|failed to fetch|network request failed/i.test(finalErrorMessage);
        
        let hint = "";
        if (isPermissionError) {
            hint = " Dica: Verifique as políticas de Row Level Security (RLS) no Supabase. Garanta que o usuário logado tenha permissão para a operação desejada.";
        } else if (isChannelError) {
            hint = ` Dica: Verifique se a replicação em tempo real está ativada para a(s) tabela(s) no painel do Supabase e se as políticas de RLS permitem 'SELECT'.`;
        } else if (isFetchError) {
            hint = " Dica: Verifique sua conexão com a internet e se o URL do Supabase está configurado corretamente e acessível.";
        }
        
        const errorCode = error?.code ? ` (Código: ${error.code})` : '';
    
        addNotification(`Erro ${context}${errorCode}: ${finalErrorMessage}${hint}`, "error", { duration: 15000 });
    }, [addNotification]);
    
    // Auth state listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            dispatch(setUserAndSession({ user: session?.user ?? null, session }));
        });
        return () => subscription.unsubscribe();
    }, [dispatch]);

    const handleRealtimeUpdate = useCallback((payload: any) => {
        const { table, eventType, new: newRecord, old: oldRecord } = payload;
        console.log(`Realtime event: ${eventType} on ${table}`, payload);

        switch (table) {
            case 'clientes':
                if (eventType === 'INSERT') dispatch(addClient(newRecord as Client));
                else if (eventType === 'UPDATE') dispatch(updateClient(newRecord as Client));
                else if (eventType === 'DELETE') dispatch(deleteClientReducer(oldRecord.id));
                break;
            case 'hoteis':
                if (eventType === 'INSERT') dispatch(addHotel(newRecord as Hotel));
                else if (eventType === 'UPDATE') dispatch(updateHotel(newRecord as Hotel));
                else if (eventType === 'DELETE') dispatch(deleteHotelReducer(oldRecord.id));
                break;
            case 'colaboradores':
                if (eventType === 'INSERT') dispatch(addCollaborator(newRecord as Collaborator));
                else if (eventType === 'UPDATE') dispatch(updateCollaborator(newRecord as Collaborator));
                else if (eventType === 'DELETE') dispatch(deleteCollaboratorReducer(oldRecord.id));
                break;
            case 'solicitacoes':
                if (eventType === 'INSERT') dispatch(addRequest(newRecord as Request));
                else if (eventType === 'UPDATE') dispatch(updateRequest(newRecord as Request));
                else if (eventType === 'DELETE') dispatch(deleteRequestReducer(oldRecord.id));
                break;
            case 'historico':
                if (eventType === 'INSERT') dispatch(addHistoryItem(newRecord as HistoryRequest));
                else if (eventType === 'UPDATE') dispatch(updateHistoryItem(newRecord as HistoryRequest));
                else if (eventType === 'DELETE') dispatch(deleteHistoryItemReducer(oldRecord.id));
                break;
            case 'rotas':
                if (eventType === 'INSERT') dispatch(addRoute(newRecord as Rota));
                else if (eventType === 'UPDATE') dispatch(updateRoute(newRecord as Rota));
                else if (eventType === 'DELETE') dispatch(deleteRoute(oldRecord.id));
                break;
            case 'stock_items':
                if (eventType === 'INSERT') dispatch(addStockItem(newRecord as StockItem));
                else if (eventType === 'UPDATE') dispatch(updateStockItem(newRecord as StockItem));
                else if (eventType === 'DELETE') dispatch(deleteStockItem(oldRecord.id));
                break;
            case 'stock_history':
                if (eventType === 'INSERT') dispatch(addStockHistoryEntry(newRecord as StockHistoryItem));
                else if (eventType === 'UPDATE') dispatch(updateStockHistoryEntry(newRecord as StockHistoryItem));
                else if (eventType === 'DELETE') dispatch(deleteStockHistoryEntry(oldRecord.id));
                break;
            case 'veiculos':
                if (eventType === 'INSERT') dispatch(addVehicle(newRecord as Vehicle));
                else if (eventType === 'UPDATE') dispatch(updateVehicle(newRecord as Vehicle));
                else if (eventType === 'DELETE') dispatch(deleteVehicleReducer(oldRecord.id));
                break;
            case 'diarias':
                if (eventType === 'INSERT') dispatch(addDiaria(newRecord as Diaria));
                else if (eventType === 'UPDATE') dispatch(updateDiaria(newRecord as Diaria));
                else if (eventType === 'DELETE') dispatch(deleteDiaria(oldRecord.id));
                break;
            case 'stock_pdf_settings':
                if (eventType === 'INSERT' || eventType === 'UPDATE') dispatch(setStockPdfSettings(newRecord as PdfSettings));
                break;
            case 'diaria_settings':
                 if (eventType === 'INSERT' || eventType === 'UPDATE') dispatch(setDiariaSettings(newRecord as DiariaSettings));
                break;
        }
    }, [dispatch]);

    // Data loading effect
    useEffect(() => {
        const tableConfigs = [
            { name: 'clientes', fetcher: () => supabase.from('clientes').select('*'), dispatcher: (data: any) => setClients(data as Client[]) },
            { name: 'hoteis', fetcher: () => supabase.from('hoteis').select('*'), dispatcher: (data: any) => setHotels(data as Hotel[]) },
            { name: 'colaboradores', fetcher: () => supabase.from('colaboradores').select('*'), dispatcher: (data: any) => setCollaborators(data as Collaborator[]) },
            { name: 'solicitacoes', fetcher: () => supabase.from('solicitacoes').select('*'), dispatcher: (data: any) => setRequests(data as Request[]) },
            { name: 'historico', fetcher: () => supabase.from('historico').select('*'), dispatcher: (data: any) => setHistory(data as HistoryRequest[]) },
            { name: 'rotas', fetcher: () => supabase.from('rotas').select('*'), dispatcher: (data: any) => setRoutes(data as Rota[]) },
            { name: 'stock_items', fetcher: () => supabase.from('stock_items').select('*'), dispatcher: (data: any) => setStockItems(data as StockItem[]) },
            { name: 'stock_history', fetcher: () => supabase.from('stock_history').select('*'), dispatcher: (data: any) => setStockHistory(data as StockHistoryItem[]) },
            { name: 'veiculos', fetcher: () => supabase.from('veiculos').select('*'), dispatcher: (data: any) => setVehicles(data as Vehicle[]) },
            { name: 'diarias', fetcher: () => supabase.from('diarias').select('*'), dispatcher: (data: any) => setDiarias(data as Diaria[]) },
            { name: 'stock_pdf_settings', fetcher: () => supabase.from('stock_pdf_settings').select('*').maybeSingle(), dispatcher: (data: any) => setStockPdfSettings(data as PdfSettings) },
            { name: 'diaria_settings', fetcher: () => supabase.from('diaria_settings').select('*').maybeSingle(), dispatcher: (data: any) => setDiariaSettings(data as DiariaSettings) },
        ];
    
        const loadInitialData = async () => {
            const promises = tableConfigs.map(config => config.fetcher());
            const results = await Promise.allSettled(promises);
    
            let hadError = false;
            results.forEach((result, index) => {
                const config = tableConfigs[index];
                if (result.status === 'fulfilled') {
                    // Note: .maybeSingle() does not produce an error for 0 rows, it returns null data.
                    if (result.value.error) {
                        handleError(result.value.error, `carregar dados da tabela '${config.name}'`);
                        hadError = true;
                    } else {
                        const data = result.value.data;
                         // For settings tables using maybeSingle(), data is an object or null
                        if (config.name === 'stock_pdf_settings' || config.name === 'diaria_settings') {
                            if (data) {
                                dispatch(config.dispatcher(data));
                            }
                        } else {
                            // For other tables, data is an array
                            dispatch(config.dispatcher(data));
                        }
                    }
                } else {
                    handleError(result.reason, `carregar dados da tabela '${config.name}'`);
                    hadError = true;
                }
            });
    
            if (hadError) {
                 addNotification("Alguns dados não puderam ser carregados. Verifique as notificações de erro individuais.", "error", { duration: 8000 });
            }
        };

        if (session) {
            loadInitialData().catch(error => handleError(error, 'carregar todos os dados'));
    
            const channels = tableConfigs.map(config => 
                supabase.channel(`public:${config.name}`)
                    .on('postgres_changes', 
                        { event: '*', schema: 'public', table: config.name }, 
                        handleRealtimeUpdate
                    )
                    .subscribe((status, err) => {
                        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                            handleError(err || new Error(`A subscrição em tempo real falhou com o status: ${status}`), `na subscrição da tabela '${config.name}'`);
                        }
                    })
            );
    
            return () => {
                channels.forEach(channel => {
                    supabase.removeChannel(channel).catch(err => console.error('Failed to remove channel', err));
                });
            };
        }
    }, [session, dispatch, addNotification, handleError, handleRealtimeUpdate]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            handleError(error, "ao fazer logout");
        } else {
            // Clear all data from redux store
            dispatch(clearAuth());
            dispatch(clearClients());
            dispatch(clearHotels());
            dispatch(clearCollaborators());
            dispatch(clearRequests());
            dispatch(clearHistory());
            dispatch(clearRoutes());
            dispatch(clearStock());
            dispatch(clearStockHistory());
            dispatch(clearStockSettings());
            dispatch(clearFleet());
            dispatch(clearDiarias());
            dispatch(clearDiariaSettings());
            dispatch(clearPrefilledRequestDataReducer());
            addNotification("Você foi desconectado.", "info");
        }
    };
    
    if (authLoading) {
        return <FullPageSpinner />;
    }

    return (
        <NotificationContext.Provider value={addNotification}>
            <Suspense fallback={<FullPageSpinner />}>
                {!session ? <AuthModule addNotification={addNotification} /> : (
                    <MainAppLayout 
                        userEmail={user?.email} 
                        onLogout={handleLogout} 
                        onToggleSettings={() => setIsSettingsPanelOpen(true)}
                    >
                         <Routes>
                            <Route path="/" element={<div className="text-center p-8">
                                <h2 className="text-3xl font-bold text-gray-800">Bem-vindo ao Sistema Matriz</h2>
                                <p className="text-gray-600 mt-2">Selecione uma opção no menu para começar.</p>
                            </div>} />
                            <Route path="/clients/*" element={<ClientModule addNotification={addNotification} onNavigateToRequest={() => {}} />} />
                            <Route path="/requests" element={<RequestModule addNotification={addNotification} />} />
                            <Route path="/collaborators" element={<CollaboratorModule addNotification={addNotification} />} />
                            <Route path="/settings" element={<SettingsModule addNotification={addNotification} importFullData={() => {}}/>} />
                            <Route path="/stock" element={<StockControlModule addNotification={addNotification} />} />
                            <Route path="/fleet" element={<FleetModule addNotification={addNotification} />} />
                            <Route path="/diaria" element={<DiariaModule addNotification={addNotification} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </MainAppLayout>
                )}
            </Suspense>
            <div className="fixed bottom-5 right-5 z-[100] space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg shadow-lg text-white ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {n.message}
                        {n.isUndoable && <button onClick={n.undoCallback} className="ml-4 font-bold underline">Desfazer</button>}
                    </div>
                ))}
            </div>
            {isSettingsPanelOpen && <SettingsSidePanel addNotification={addNotification} importFullData={() => {}} onClose={() => setIsSettingsPanelOpen(false)} />}
        </NotificationContext.Provider>
    );
};


const MainAppLayout: React.FC<{ children: ReactNode; userEmail?: string; onLogout: () => void; onToggleSettings: () => void }> = ({ children, userEmail, onLogout, onToggleSettings }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSubPage = location.pathname.split('/').filter(Boolean).length > 1;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <nav className="w-64 bg-white border-r p-4 flex flex-col hidden md:flex">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 mb-6">Matriz</h1>
                    <NavLink to="/" className={({isActive}) => `flex items-center p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><Home size={20} className="mr-3"/> Início</NavLink>
                    <NavLink to="/clients" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><Users size={20} className="mr-3"/> Clientes</NavLink>
                    <NavLink to="/requests" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FileText size={20} className="mr-3"/> Solicitações</NavLink>
                    <NavLink to="/collaborators" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><Users size={20} className="mr-3"/> Colaboradores</NavLink>
                    <NavLink to="/stock" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><Archive size={20} className="mr-3"/> Estoque</NavLink>
                    <NavLink to="/fleet" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><Truck size={20} className="mr-3"/> Frota</NavLink>
                    <NavLink to="/diaria" className={({isActive}) => `flex items-center p-2 rounded-lg mt-2 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><DollarSign size={20} className="mr-3"/> Diárias</NavLink>
                </div>
                <div className="mt-auto">
                    <div className="text-xs text-gray-500 mb-2 truncate" title={userEmail}>
                        {userEmail}
                    </div>
                    <button onClick={onLogout} className="flex items-center p-2 rounded-lg w-full text-left text-gray-600 hover:bg-red-100 hover:text-red-700">
                        <LogOut size={20} className="mr-3"/> Sair
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
                    {isSubPage && <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900"><ArrowLeft size={20} className="mr-2"/> Voltar</button>}
                    <div className="flex-1"></div>
                    <button onClick={onToggleSettings} className="p-2 rounded-full hover:bg-gray-200" aria-label="Configurações"><SettingsIcon size={24} /></button>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Suspense fallback={<div className="flex justify-center items-center h-full"><Spinner /></div>}>
                        {children}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};


export default App;