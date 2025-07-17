
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
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          cliente: string;
          cidade: string;
          distancia: string;
          lat_final: string;
          lon_final: string;
          searchableKeywords: string[];
          observacoes: Json | null;
        };
        Insert: {
          cliente: string;
          cidade: string;
          distancia: string;
          lat_final: string;
          lon_final: string;
          searchableKeywords: string[];
          observacoes?: Json | null;
          user_id?: string;
        };
        Update: {
          cliente?: string;
          cidade?: string;
          distancia?: string;
          lat_final?: string;
          lon_final?: string;
          searchableKeywords?: string[];
          observacoes?: Json | null;
        };
      };
      hoteis: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
        Update: {
          client_id?: string;
          hotel?: string;
          cnpj?: string;
          telefone?: string;
          dados_pag?: string;
          quarto_ind?: number;
          quarto_dup?: number;
          quarto_tri?: number;
        };
      };
      colaboradores: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
        Update: {
            nome?: string;
            cpf?: string;
            data_nasc?: string;
            pix?: string;
            banco?: string;
            telefone?: string;
            filial?: string;
            funcao?: 'Técnico' | 'Motorista' | 'Mangueirista' | 'Carreteiro' | 'Outros' | '';
            funcao_outros?: string;
            valor_diaria_custom?: number;
            valor_pernoite_custom?: number;
        };
      };
      solicitacoes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
          nf_attachments: Json;
          pix_attachments: Json;
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
          nf_attachments: Json;
          pix_attachments: Json;
          user_id?: string;
        };
        Update: {
          solicitante?: string;
          data_solicitacao?: string;
          centro_custo?: string;
          equipe_members?: string;
          quant_equipe?: number;
          hotel_name?: string;
          client_name?: string;
          check_in?: string;
          check_out?: string;
          quant_diarias?: number;
          valor_diaria?: number;
          valor_total?: number;
          pix?: string;
          cnpj?: string;
          nf?: string;
          nf_attachments?: Json;
          pix_attachments?: Json;
        };
      };
      historico: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
          nf_attachments: Json;
          pix_attachments: Json;
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
          nf_attachments: Json;
          pix_attachments: Json;
          attachments_status: 0 | 1;
          user_id?: string;
        };
        Update: {
          solicitante?: string;
          data_solicitacao?: string;
          centro_custo?: string;
          equipe_members?: string;
          quant_equipe?: number;
          hotel_name?: string;
          client_name?: string;
          check_in?: string;
          check_out?: string;
          quant_diarias?: number;
          valor_diaria?: number;
          valor_total?: number;
          pix?: string;
          cnpj?: string;
          nf_number?: string;
          nf_attachments?: Json;
          pix_attachments?: Json;
          attachments_status?: 0 | 1;
        };
      };
      rotas: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
          user_id?: string;
        };
        Update: {
          filial?: string;
          default_latitude?: string;
          default_longitude?: string;
          isDefault?: boolean;
        };
      };
      stock_items: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
        };
        Insert: {
          id: string;
          classe: 'UNIFORME' | 'EPI';
          tipo: string;
          tamanho: string;
          quantidade: number;
          user_id?: string;
        };
        Update: {
          classe?: 'UNIFORME' | 'EPI';
          tipo?: string;
          tamanho?: string;
          quantidade?: number;
        };
      };
      stock_history: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          idColaborador: string;
          nomeColaborador: string;
          items: Json;
          data: string;
          receiptGeneratedAt?: string;
        };
        Insert: {
          idColaborador: string;
          nomeColaborador: string;
          items: Json;
          data: string;
          receiptGeneratedAt?: string;
          user_id?: string;
        };
        Update: {
          idColaborador?: string;
          nomeColaborador?: string;
          items?: Json;
          data?: string;
          receiptGeneratedAt?: string;
        };
      };
      stock_pdf_settings: {
        Row: {
          id: number;
          created_at: string;
          headerTitle: string;
          branchName: string;
          managerName: string;
          logoURL: string;
        };
        Insert: {
            id?: number;
            headerTitle: string;
            branchName: string;
            managerName: string;
            logoURL: string;
        };
        Update: {
            headerTitle?: string;
            branchName?: string;
            managerName?: string;
            logoURL?: string;
        };
      };
      veiculos: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
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
        Update: {
          placa?: string;
          filial?: string;
          tipo?: string;
          modelo?: string;
          chassi?: string;
          ano?: string;
          isLocado?: boolean;
        };
      };
      diarias: {
        Row: {
            id: string;
            created_at: string;
            user_id: string;
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
        Update: {
            solicitante?: string;
            idColaborador?: string;
            data_inicial?: string;
            data_final?: string;
            hora_inicial?: string;
            hora_final?: string;
            destino?: string;
            observacao?: string;
            centro_custo?: string;
            total_cafes?: number;
            total_almocos?: number;
            total_jantas?: number;
            total_pernoites?: number;
            valor_total_refeicoes?: number;
            valor_total_pernoites?: number;
            valor_total_geral?: number;
        };
      };
      diaria_settings: {
        Row: {
            id: number;
            created_at: string;
            valor_diaria: number;
            valor_pernoite: number;
            valor_diaria_carreteiro: number;
        };
        Insert: {
            id?: number;
            valor_diaria: number;
            valor_pernoite: number;
            valor_diaria_carreteiro: number;
        };
        Update: {
            valor_diaria?: number;
            valor_pernoite?: number;
            valor_diaria_carreteiro?: number;
        };
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