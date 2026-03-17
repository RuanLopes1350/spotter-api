import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const treinoSchema = z.object({
    nome: z
        .string()
        .min(1, { message: 'O nome do treino é obrigatório' })
        .max(255, { message: 'O nome do treino deve ter no máximo 255 caracteres' })
        .openapi({ description: 'Nome do treino', example: 'Treino A - Peito e Tríceps' }),
    descricao: z
        .string()
        .max(1000, { message: 'A descrição deve ter no máximo 1000 caracteres' })
        .nullable()
        .optional()
        .openapi({ description: 'Descrição do treino', example: 'Treino focado em membros superiores' }),
    aluno_id: z
        .string()
        .uuid({ message: 'O ID do aluno deve ser um UUID válido' })
        .optional()
        .openapi({ description: 'UUID do aluno dono do treino', example: '550e8400-e29b-41d4-a716-446655440000' }),
}).strict().openapi('TreinoInput');

export { treinoSchema };
