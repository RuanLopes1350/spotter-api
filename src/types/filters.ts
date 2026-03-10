import { type_exercicio } from './dbSchemas';

export interface FiltrosExercicio {
    nome?: string;
    grupo_muscular?: string;
    tipo_ativacao?: string;
    aluno_id?: string;
}

export interface ResultadoPaginadoExercicio {
    dados: type_exercicio[];
    total: number;
    page: number;
    limite: number;
    totalPages: number;
}
