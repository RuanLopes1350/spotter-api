import { ZodError } from 'zod';
import TreinoRepository from '../repositories/treinoRepository';
import { treinoSchema } from '../utils/validations/treinoValidation';
import { type_treino } from '../types/dbSchemas';

class TreinoService {
    private repository: TreinoRepository;

    constructor() {
        this.repository = new TreinoRepository();
    }

    async createTreino(body: unknown, userId: string): Promise<type_treino> {
        try {
            const dadosValidados = treinoSchema.parse(body);
            const perfil = await this.repository.buscarPerfilAcesso(userId);
            const usuarioPodeCriar = perfil.isAluno || perfil.isTreinador || perfil.isAdmin;
            let alunoIdDestino = dadosValidados.aluno_id;

            if (!usuarioPodeCriar) {
                throw new Error('FORBIDDEN: usuário sem perfil para criar treinos');
            }

            // Aluno cria apenas treino próprio e não pode criar para outro aluno.
            if (perfil.isAluno && !perfil.isTreinador && !perfil.isAdmin) {
                if (alunoIdDestino && alunoIdDestino !== perfil.alunoId) {
                    throw new Error('FORBIDDEN: aluno só pode criar treino para si mesmo');
                }
                alunoIdDestino = perfil.alunoId ?? undefined;
            }

            // Treinador/admin precisam informar o aluno de destino, exceto quando também tiverem perfil de aluno.
            if (!alunoIdDestino) {
                if (perfil.alunoId) {
                    alunoIdDestino = perfil.alunoId;
                } else {
                    throw new Error('VALIDATION: aluno_id é obrigatório para este perfil');
                }
            }

            const alunoExiste = await this.repository.verificarAlunoExiste(alunoIdDestino);
            if (!alunoExiste) {
                throw new Error('Aluno não encontrado');
            }

            const novoTreino: type_treino = {
                nome: dadosValidados.nome,
                descricao: dadosValidados.descricao ?? null,
                usuario_id: alunoIdDestino,
                treinador_id: perfil.treinadorId,
            };

            return await this.repository.create(novoTreino);
        } catch (error) {
            if (error instanceof ZodError) {
                console.warn('[TreinoService] [createTreino] Falha na validação Zod:', error.issues);
            }
            throw error;
        }
    }
}

export default TreinoService;
