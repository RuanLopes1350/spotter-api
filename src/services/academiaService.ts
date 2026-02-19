import AcademiaRepository from "../repositories/academiaRepository";
import { type_academia } from "../types/dbSchemas";

class AcademiaService {
    private repository: AcademiaRepository;

    constructor() {
        this.repository = new AcademiaRepository();
    }

    async createAcademia(novaAcademia: type_academia): Promise<type_academia> {
        try {
            const academiaCriada = await this.repository.createAcademia(novaAcademia);
            return academiaCriada;
        } catch (error) {
            throw new Error(`Erro ao criar academia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async getAllAcademias(): Promise<type_academia[]> {
        try {
            const academias = await this.repository.getAllAcademias();
            return academias;
        } catch (error) {
            throw new Error(`Erro ao buscar academias: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}

export default AcademiaService;