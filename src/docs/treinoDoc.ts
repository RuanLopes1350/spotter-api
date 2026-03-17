import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { treinoSchema } from '../utils/validations/treinoValidation';

export const treinoRegistry = new OpenAPIRegistry();

const TreinoResponse = z.object({
    id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440009' }),
    nome: z.string().openapi({ example: 'Treino A - Peito e Tríceps' }),
    descricao: z.string().nullable().openapi({ example: 'Treino focado em membros superiores' }),
    data_criacao: z.coerce.date().openapi({ example: '2026-03-17T10:00:00.000Z' }),
    usuario_id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    treinador_id: z.string().uuid().nullable().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
}).openapi('Treino');

// POST /treinos
treinoRegistry.registerPath({
    method: 'post',
    path: '/treinos',
    summary: 'Criar treino',
    description: 'Cria um novo treino. Aluno pode criar apenas treino próprio; treinador/admin podem criar para qualquer aluno existente. Quando criado por aluno, treinador_id pode ser null.',
    tags: ['Treino'],
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            required: true,
            content: {
                'application/json': { schema: treinoSchema },
            },
        },
    },
    responses: {
        201: {
            description: 'Treino criado com sucesso',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.boolean().openapi({ example: false }),
                        code: z.number().openapi({ example: 201 }),
                        message: z.string().nullable().openapi({ example: 'Recurso criado com sucesso' }),
                        data: TreinoResponse,
                        errors: z.array(z.any()),
                    }),
                },
            },
        },
        401: { description: 'Não autorizado' },
        403: { description: 'Sem permissão para criar treino para outro aluno' },
        404: { description: 'Aluno não encontrado' },
        422: { description: 'Erro de validação' },
    },
});
