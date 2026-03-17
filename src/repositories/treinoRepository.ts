import { DataBase } from '../config/DbConnect';
import { aluno, treinador, treino } from '../config/db/schema';
import { eq } from 'drizzle-orm';
import { type_treino } from '../types/dbSchemas';
import { parseDatabaseError } from '../utils/errors/DatabaseError';

export interface PerfilAcessoTreino {
    alunoId: string | null;
    treinadorId: string | null;
    isAluno: boolean;
    isTreinador: boolean;
    isAdmin: boolean;
}

class TreinoRepository {
    private db: typeof DataBase;

    constructor() {
        this.db = DataBase;
    }

    async create(novoTreino: type_treino): Promise<type_treino> {
        try {
            const [resultado] = await this.db
                .insert(treino)
                .values(novoTreino)
                .returning();

            return resultado as type_treino;
        } catch (error) {
            throw parseDatabaseError(error, 'TreinoRepository.create');
        }
    }

    async verificarAlunoExiste(alunoId: string): Promise<boolean> {
        try {
            const resultado = await this.db
                .select({ id: aluno.id })
                .from(aluno)
                .where(eq(aluno.id, alunoId))
                .limit(1);

            return resultado.length > 0;
        } catch (error) {
            throw parseDatabaseError(error, 'TreinoRepository.verificarAlunoExiste');
        }
    }

    async buscarPerfilAcesso(userId: string): Promise<PerfilAcessoTreino> {
        try {
            const [treinadorResult, alunoResult] = await Promise.all([
                this.db
                    .select({ id: treinador.id, is_admin: treinador.is_admin })
                    .from(treinador)
                    .where(eq(treinador.user_id, userId))
                    .limit(1),
                this.db
                    .select({ id: aluno.id, is_admin: aluno.is_admin })
                    .from(aluno)
                    .where(eq(aluno.user_id, userId))
                    .limit(1),
            ]);

            const isAluno = Boolean(alunoResult[0]);
            const isTreinador = Boolean(treinadorResult[0]);
            const isAdmin =
                treinadorResult[0]?.is_admin === true ||
                alunoResult[0]?.is_admin === true;

            return {
                alunoId: alunoResult[0]?.id ?? null,
                treinadorId: treinadorResult[0]?.id ?? null,
                isAluno,
                isTreinador,
                isAdmin,
            };
        } catch (error) {
            throw parseDatabaseError(error, 'TreinoRepository.buscarPerfilAcesso');
        }
    }
}

export default TreinoRepository;
