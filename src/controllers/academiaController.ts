import { type_academia } from "../types/dbSchemas"
import { academiaSchema } from "../utils/validations/academiaValidation";
import AcademiaService from "../services/academiaService";
import { Request, Response } from 'express';

class AcademiaController {
    private service: AcademiaService;
    constructor() {
        this.service = new AcademiaService();
    }

    createAcademia = async (req: { body: type_academia }, res: Response) => {
        const { nome, endereco_numero, endereco_rua, endereco_bairro, endereco_cidade, endereco_estado } = req.body;
        if (!nome || !endereco_numero || !endereco_rua || !endereco_bairro || !endereco_cidade || !endereco_estado) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        try {
            academiaSchema.parse({ nome, endereco_numero, endereco_rua, endereco_bairro, endereco_cidade, endereco_estado });
            const novaAcademia: type_academia = {
                nome: nome,
                endereco_numero: endereco_numero,
                endereco_rua: endereco_rua,
                endereco_bairro: endereco_bairro,
                endereco_cidade: endereco_cidade,
                endereco_estado: endereco_estado,
                created_at: new Date(),
            }

            const resposta = await this.service.createAcademia(novaAcademia);
            res.status(201).json(resposta);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    getAllAcademia = async (req: Request, res: Response) => {
        try { 
            const resposta = await this.service.getAllAcademias();
            res.status(200).json(resposta);
         } catch (error) { 
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno do servidor" });
         }
    }
}

export default AcademiaController;