import { z } from 'zod';

const alunoSchema = z.object({
    user_id: z
        .string({ message: "O ID do usuário é obrigatório" }),
    nome: z
        .string()
        .min(1, { message: "O nome é obrigatório" }),
    data_nascimento: z
        .string()
        .date("A data de nascimento deve estar no formato YYYY-MM-DD"),
    sexo: z
        .enum(["M", "F"], { message: "Genero deve ser 'M' para 'Masculino' e 'F' para 'Feminino'" }),
    is_admin: z
        .boolean()
        .optional()
        .default(false),
    status_conta: z
        .boolean()
        .optional()
        .default(true),
    academia_id: z
        .string({ message: "O ID da academia é obrigatório" })
        .uuid({ message: "O ID da academia deve ser um UUID válido" }),
}).strict();

const alunoUpdateSchema = alunoSchema.partial();

const alunoIdSchema = z
    .string()
    .uuid('ID inválido, deve ser um UUID válido');

export { alunoSchema, alunoUpdateSchema, alunoIdSchema }