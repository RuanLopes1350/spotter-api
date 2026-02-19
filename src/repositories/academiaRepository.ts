import { DataBase } from "../config/DbConnect";
import { academia } from "../config/db/schema";
import { type_academia } from "../types/dbSchemas"

class AcademiaRepository {
    private db: typeof DataBase;
    constructor() {
        this.db = DataBase;
    }

    async createAcademia(novaAcademia: type_academia): Promise<type_academia> {
        try {
            const resposta = await this.db.insert(academia).values(novaAcademia).returning();
            return resposta[0]
        } catch (error) { 
            throw new Error(`Erro ao criar academia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getAllAcademias(): Promise<type_academia[]> {
        try {
            const resposta = await this.db.select().from(academia);
            return resposta;
        } catch (error) {
            throw new Error(`Erro ao buscar academias: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

}

export default AcademiaRepository;