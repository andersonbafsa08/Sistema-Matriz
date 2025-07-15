


import { Client, Hotel, Collaborator, Request, HistoryRequest, Rota, StockItem, StockHistoryItem, PdfSettings, Vehicle, Diaria, DiariaSettings } from "../types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Copied from types.ts to make this file self-contained
interface SupabaseBase {
  id?: string;
  created_at?: string;
  user_id?: string;
}

export interface ClientObservacoes {
  sismografia: string;
  granulometria: string;
  carro_tracado: string;
  carro_passeio: string;
  observacao: string;
}

export interface AttachmentFile {
  name: string;
  data: string;
  type?: string;
  size?: number;
}
// End of copied types

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: SupabaseBase & {
          id: string;
          cliente: string;
          cidade: string;
          distancia: string;
          lat_final: string;
          lon_final: string;
          searchableKeywords: string[];
          observacoes?: ClientObservacoes;
        };
        Insert: {
          cliente: string;
          cidade: string;
          distancia: string;
          lat_final: string;
          lon_final: string;
          searchableKeywords: string[];
          observacoes?: ClientObservacoes | null;
          user_id?: string;
        };
        Update: Partial<{
          cliente: string;
          cidade: string;
          distancia: string;
          lat_final: string;
          lon_final: string;
          searchableKeywords: string[];
          observacoes?: ClientObservacoes | null;
        }>;
      };
      hoteis: {
        Row: SupabaseBase & {
          id: string;
          client_id: string;
          hotel: string;
          cnpj: string;
          telefone: string;
          dados_pag: string;
          quarto_ind: number;
          quarto_dup: number;
          quarto_tri: number;
        };
        Insert: {
          client_id: string;
          hotel: string;
          cnpj: string;
          telefone: string;
          dados_pag: string;
          quarto_ind: number;
          quarto_dup: number;
          quarto_tri: number;
          user_id?: string;
        };
        Update: Partial<{
          client_id: string;
          hotel: string;
          cnpj: string;
          telefone: string;
          dados_pag: string;
          quarto_ind: number;
          quarto_dup: number;
          quarto_tri: number;
        }>;
      };
      colaboradores: {
        Row: SupabaseBase & {
          id: string;
          nome: string;
          cpf: string;
          data_nasc: string;
          pix: string;
          banco: string;
          telefone?: string;
          filial?: string;
          funcao?: 'Técnico' | 'Motorista' | 'Mangueirista' | 'Carreteiro' | 'Outros' | '';
          funcao_outros?: string;
          valor_diaria_custom?: number;
          valor_pernoite_custom?: number;
        };
        Insert: {
            nome: string;
            cpf: string;
            data_nasc: string;
            pix: string;
            banco: string;
            telefone?: string;
            filial?: string;
            funcao?: 'Técnico' | 'Motorista' | 'Mangueirista' | 'Carreteiro' | 'Outros' | '';
            funcao_outros?: string;
            valor_diaria_custom?: number;
            valor_pernoite_custom?: number;
            user_id?: string;
        };
        Update: Partial<{
            nome: string;
            cpf: string;
            data_nasc: string;
            pix: string;
            banco: string;
            telefone?: string;
            filial?: string;
            funcao?: 'Técnico' | 'Motorista' | 'Mangueirista' | 'Carreteiro' | 'Outros' | '';
            funcao_outros?: string;
            valor_diaria_custom?: number;
            valor_pernoite_custom?: number;
        }>;
      };
      solicitacoes: {
        Row: SupabaseBase & {
            id: string;
            solicitante: string;
            data_solicitacao: string;
            centro_custo: string;
            equipe_members: string;
            quant_equipe: number;
            hotel_name: string;
            client_name: string;
            check_in: string;
            check_out: string;
            quant_diarias: number;
            valor_diaria: number;
            valor_total: number;
            pix: string;
            cnpj: string;
            nf: string; 
            nf_attachments: AttachmentFile[]; 
            pix_attachments: AttachmentFile[];
        };
        Insert: {
          solicitante: string;
          data_solicitacao: string;
          centro_custo: string;
          equipe_members: string;
          quant_equipe: number;
          hotel_name: string;
          client_name: string;
          check_in: string;
          check_out: string;
          quant_diarias: number;
          valor_diaria: number;
          valor_total: number;
          pix: string;
          cnpj: string;
          nf: string; 
          nf_attachments: AttachmentFile[]; 
          pix_attachments: AttachmentFile[];
          user_id?: string;
        };
        Update: Partial<{
          solicitante: string;
          data_solicitacao: string;
          centro_custo: string;
          equipe_members: string;
          quant_equipe: number;
          hotel_name: string;
          client_name: string;
          check_in: string;
          check_out: string;
          quant_diarias: number;
          valor_diaria: number;
          valor_total: number;
          pix: string;
          cnpj: string;
          nf: string; 
          nf_attachments: AttachmentFile[]; 
          pix_attachments: AttachmentFile[];
        }>;
      };
      historico: {
        Row: SupabaseBase & {
          id: string;
          solicitante: string;
          data_solicitacao: string;
          centro_custo: string;
          equipe_members: string;
          quant_equipe: number;
          hotel_name: string;
          client_name: string;
          check_in: string;
          check_out: string;
          quant_diarias: number;
          valor_diaria: number;
          valor_total: number;
          pix: string; 
          cnpj: string;
          nf_number?: string; 
          nf_attachments: AttachmentFile[];
          pix_attachments: AttachmentFile[];
          attachments_status: 0 | 1; 
        };
        Insert: {
          solicitante: string;
          data_solicitacao: string;
          centro_custo: string;
          equipe_members: string;
          quant_equipe: number;
          hotel_name: string;
          client_name: string;
          check_in: string;
          check_out: string;
          quant_diarias: number;
          valor_diaria: number;
          valor_total: number;
          pix: string; 
          cnpj: string;
          nf_number?: string; 
          nf_attachments: AttachmentFile[];
          pix_attachments: AttachmentFile[];
          attachments_status: 0 | 1;
          user_id?: string;
        };
        Update: Partial<{
          solicitante: string;
          data_solicitacao: string;
          centro_custo: string;
          equipe_members: string;
          quant_equipe: number;
          hotel_name: string;
          client_name: string;
          check_in: string;
          check_out: string;
          quant_diarias: number;
          valor_diaria: number;
          valor_total: number;
          pix: string; 
          cnpj: string;
          nf_number?: string; 
          nf_attachments: AttachmentFile[];
          pix_attachments: AttachmentFile[];
          attachments_status: 0 | 1;
        }>;
      };
      rotas: {
        Row: SupabaseBase & {
            id: string;
            filial: string;
            default_latitude: string;
            default_longitude: string;
            isDefault: boolean;
        };
        Insert: {
          filial: string;
          default_latitude: string;
          default_longitude: string;
          isDefault: boolean;
        };
        Update: Partial<{
          filial: string;
          default_latitude: string;
          default_longitude: string;
          isDefault: boolean;
        }>;
      };
      stock_items: {
        Row: SupabaseBase & {
          id: string;
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
        };
        Insert: {
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
        };
        Update: Partial<{
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
        }>;
      };
      stock_history: {
        Row: SupabaseBase & {
          id: string;
          idColaborador: string;
          nomeColaborador: string;
          items: {
            id: string;
            classe: 'UNIFORME' | 'EPI';
            tipo: string;
            tamanho: string;
            quantidade: number;
          }[];
          data: string;
          receiptGeneratedAt?: string;
        };
        Insert: {
          idColaborador: string;
          nomeColaborador: string;
          items: {
            id: string;
            classe: 'UNIFORME' | 'EPI';
            tipo: string;
            tamanho: string;
            quantidade: number;
          }[];
          data: string;
          receiptGeneratedAt?: string;
        };
        Update: Partial<{
          idColaborador: string;
          nomeColaborador: string;
          items: {
            id: string;
            classe: 'UNIFORME' | 'EPI';
            tipo: string;
            tamanho: string;
            quantidade: number;
          }[];
          data: string;
          receiptGeneratedAt?: string;
        }>;
      };
      stock_pdf_settings: {
        Row: {
            id?: number;
            created_at?: string;
            headerTitle: string;
            branchName: string;
            managerName: string;
            logoURL: string;
        };
        Insert: {
            headerTitle: string;
            branchName: string;
            managerName: string;
            logoURL: string;
        };
        Update: Partial<{
            headerTitle: string;
            branchName: string;
            managerName: string;
            logoURL: string;
        }>;
      };
      veiculos: {
        Row: SupabaseBase & {
          id: string;
          placa: string;
          filial: string;
          tipo: string;
          modelo: string;
          chassi: string;
          ano: string;
          isLocado?: boolean;
        };
        Insert: {
          placa: string;
          filial: string;
          tipo: string;
          modelo: string;
          chassi: string;
          ano: string;
          isLocado?: boolean;
          user_id?: string;
        };
        Update: Partial<{
          placa: string;
          filial: string;
          tipo: string;
          modelo: string;
          chassi: string;
          ano: string;
          isLocado?: boolean;
        }>;
      };
      diarias: {
        Row: SupabaseBase & {
            id: string;
            solicitante: string;
            idColaborador: string;
            data_inicial: string;
            data_final: string;
            hora_inicial: string;
            hora_final: string;
            destino: string;
            observacao: string;
            centro_custo: string;
            total_cafes: number;
            total_almocos: number;
            total_jantas: number;
            total_pernoites: number;
            valor_total_refeicoes: number;
            valor_total_pernoites: number;
            valor_total_geral: number;
        };
        Insert: {
            solicitante: string;
            idColaborador: string;
            data_inicial: string;
            data_final: string;
            hora_inicial: string;
            hora_final: string;
            destino: string;
            observacao: string;
            centro_custo: string;
            total_cafes: number;
            total_almocos: number;
            total_jantas: number;
            total_pernoites: number;
            valor_total_refeicoes: number;
            valor_total_pernoites: number;
            valor_total_geral: number;
            user_id?: string;
        };
        Update: Partial<{
            solicitante: string;
            idColaborador: string;
            data_inicial: string;
            data_final: string;
            hora_inicial: string;
            hora_final: string;
            destino: string;
            observacao: string;
            centro_custo: string;
            total_cafes: number;
            total_almocos: number;
            total_jantas: number;
            total_pernoites: number;
            valor_total_refeicoes: number;
            valor_total_pernoites: number;
            valor_total_geral: number;
        }>;
      };
      diaria_settings: {
        Row: {
            id?: number;
            created_at?: string;
            valor_diaria: number;
            valor_pernoite: number;
            valor_diaria_carreteiro: number;
        };
        Insert: {
            valor_diaria: number;
            valor_pernoite: number;
            valor_diaria_carreteiro: number;
        };
        Update: Partial<{
            valor_diaria: number;
            valor_pernoite: number;
            valor_diaria_carreteiro: number;
        }>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
