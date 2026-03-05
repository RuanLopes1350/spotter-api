import { DataBase } from "../config/DbConnect";
import { eq } from "drizzle-orm";
import { aluno } from "../config/db/schema";
import { type_aluno } from "../types/dbSchemas";
import { parseDatabaseError } from "../utils/errors/DatabaseError";

class AlunoRepository {
    private db: typeof DataBase;
    constructor() {
        this.db = DataBase
    }

    async createAluno(novoAluno: type_aluno): Promise<type_aluno> {
        console.log('[AlunoRepository] [createAluno] Iniciando inserção no banco de dados...');
        console.log('[AlunoRepository] [createAluno] Dados a inserir:', JSON.stringify(novoAluno, null, 2));
        try {
            const { academia_id, ...restAluno } = novoAluno;
            const resposta = await this.db.insert(aluno).values({ ...restAluno, academia_id: academia_id }).returning();
            console.log('[AlunoRepository] [createAluno] Inserção concluída. Registro retornado:', JSON.stringify(resposta[0], null, 2));
            return resposta[0];
        } catch (error) {
            throw parseDatabaseError(error, 'AlunoRepository.createAluno');
        }
    }

    async getAllStudents(): Promise<type_aluno[]> {
            try {
                const resultado = await this.db
                    .select()
                    .from(aluno);
    
                return resultado as unknown as type_aluno[];
            } catch (error) {
                throw parseDatabaseError(error, 'AlunoRepository.getAllStudents');
            }
        }

    async findById(id: number): Promise<type_aluno | null> {
        try {
            const resultado = await this.db
                .select()
                .from(aluno)
                .where(eq(aluno.id, id))
                .limit(1);

            if (resultado.length === 0) {
                return null;
            }

            return resultado[0] as unknown as type_aluno;
        } catch (error) {
            throw parseDatabaseError(error, 'AlunoRepository.findById');
        }
    }

}

export default AlunoRepository