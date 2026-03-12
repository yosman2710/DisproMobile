export interface Perfil {
    nombre: string;
}

export interface Transaction {
    id: number;
    monto_total: number;
    fecha: string;
    tipo: string;
    perfil: Perfil | null;
}

export interface QRToken {
    token_auth: string;
    perfil_id: string;
    expira_at: string;
}
