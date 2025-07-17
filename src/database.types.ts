import { Client, Hotel, Collaborator, Request, HistoryRequest, Rota, StockItem, StockHistoryItem, PdfSettings, Vehicle, Diaria, DiariaSettings, ClientObservacoes, AttachmentFile } from "../types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: Client;
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
        Row: Hotel;
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
        Row: Collaborator;
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
        Row: Request;
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
        Row: HistoryRequest;
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
        Row: Rota;
        Insert: {
          filial: string;
          default_latitude: string;
          default_longitude: string;
          isDefault: boolean;
          user_id?: string;
        };
        Update: Partial<{
          filial: string;
          default_latitude: string;
          default_longitude: string;
          isDefault: boolean;
        }>;
      };
      stock_items: {
        Row: StockItem;
        Insert: {
          id: string;
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
          user_id?: string;
        };
        Update: Partial<{
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
        }>;
      };
      stock_history: {
        Row: StockHistoryItem;
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
          user_id?: string;
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
        Row: PdfSettings;
        Insert: {
            id?: number;
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
        Row: Vehicle;
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
        Row: Diaria;
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
        Row: DiariaSettings;
        Insert: {
            id?: number;
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