import { DataBase } from "../config/DbConnect";
import { eq, and, or, isNull, sql, inArray } from "drizzle-orm";
import { exercicio, exercicio_musculo, exercicio_aparelho, musculo, aluno, item_rotina } from "../config/db/schema";
import { type_exercicio } from "../types/dbSchemas";
import { FiltrosExercicio, ResultadoPaginadoExercicio } from "../types/filters";
import { parseDatabaseError } from "../utils/errors/DatabaseError";
import ExercicioFilterBuilder from "./filters/ExercicioFilterBuilder"

class ExercicioRepository {
    private db: typeof DataBase;
    constructor() {
        this.db = DataBase;
    }

    async createExercicio(
        novoExercicio: type_exercicio,
        musculos: { musculo_id: string; tipo_ativacao: 'PRIMARIO' | 'SECUNDARIO' }[],
    ): Promise<type_exercicio> {
        try {
            const resultado = await this.db.transaction(async (tx) => {
                // 1) Insere exercício
                const [exercicioCriado] = await tx
                    .insert(exercicio)
                    .values(novoExercicio)
                    .returning();

                // 2) Insere vínculos N:M com músculos
                if (musculos.length > 0) {
                    await tx.insert(exercicio_musculo).values(
                        musculos.map((m) => ({
                            exercicio_id: exercicioCriado.id,
                            musculo_id: m.musculo_id,
                            tipo_ativacao: m.tipo_ativacao,
                        })),
                    );
                }

                return exercicioCriado;
            });
            return resultado;
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.createExercicio');
        }
    }

    async getAllExercicios(
        filtros: FiltrosExercicio,
        page: number,
        limite: number,
    ): Promise<ResultadoPaginadoExercicio> {
        try {
            const where = new ExercicioFilterBuilder()
                .comNome(filtros.nome)
                .comAluno(filtros.aluno_id)
                .comGrupoMuscular(filtros.grupo_muscular)
                .comTipoAtivacao(filtros.tipo_ativacao)
                .build();
            const offset = (page - 1) * limite;

            const [dados, countResult] = await Promise.all([
                this.db
                    .select()
                    .from(exercicio)
                    .where(where)
                    .limit(limite)
                    .offset(offset)
                    .orderBy(exercicio.nome),
                this.db
                    .select({ count: sql<number>`count(*)` })
                    .from(exercicio)
                    .where(where),
            ]);

            const total = Number(countResult[0].count);

            let dadosComMusculos: (type_exercicio & { musculos: any[] })[] = dados.map(e => ({ ...e, musculos: [] }));

            if (dados.length > 0) {
                const ids = dados.map(e => e.id!);
                const vinculosMusculos = await this.db
                    .select({
                        exercicio_id: exercicio_musculo.exercicio_id,
                        musculo_id: exercicio_musculo.musculo_id,
                        tipo_ativacao: exercicio_musculo.tipo_ativacao,
                        nome: musculo.nome,
                        grupo_muscular: musculo.grupo_muscular,
                    })
                    .from(exercicio_musculo)
                    .innerJoin(musculo, eq(exercicio_musculo.musculo_id, musculo.id))
                    .where(inArray(exercicio_musculo.exercicio_id, ids));

                const musculosPorExercicio = new Map<string, any[]>();
                for (const vínculo of vinculosMusculos) {
                    if (!musculosPorExercicio.has(vínculo.exercicio_id)) {
                        musculosPorExercicio.set(vínculo.exercicio_id, []);
                    }
                    musculosPorExercicio.get(vínculo.exercicio_id)!.push(vínculo);
                }

                dadosComMusculos = dadosComMusculos.map(e => ({
                    ...e,
                    musculos: musculosPorExercicio.get(e.id!) ?? [],
                }));
            }

            return {
                dados: dadosComMusculos,
                total,
                page,
                limite,
                totalPages: Math.ceil(total / limite),
            };
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.getAllExercicios');
        }
    }

    async getByIdExercicio(id: string): Promise<(type_exercicio & { musculos?: any[] }) | null> {
        try {
            const resposta = await this.db
                .select()
                .from(exercicio)
                .where(and(eq(exercicio.id, id), isNull(exercicio.deletado_em)));

            if (!resposta[0]) return null;

            // Busca vínculos de músculos do exercício
            const vinculosMusculos = await this.db
                .select({
                    musculo_id: exercicio_musculo.musculo_id,
                    tipo_ativacao: exercicio_musculo.tipo_ativacao,
                    nome: musculo.nome,
                    grupo_muscular: musculo.grupo_muscular,
                })
                .from(exercicio_musculo)
                .innerJoin(musculo, eq(exercicio_musculo.musculo_id, musculo.id))
                .where(eq(exercicio_musculo.exercicio_id, id));

            return { ...resposta[0], musculos: vinculosMusculos };
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.getByIdExercicio');
        }
    }

    async updateExercicio(
        id: string,
        dadosAtualizados: Partial<type_exercicio>,
        musculos?: { musculo_id: string; tipo_ativacao: 'PRIMARIO' | 'SECUNDARIO' }[],
    ): Promise<type_exercicio> {
        try {
            const resultado = await this.db.transaction(async (tx) => {
                let exercicioAtualizado;

                if (Object.keys(dadosAtualizados).length > 0) {
                    const [atualizado] = await tx
                        .update(exercicio)
                        .set(dadosAtualizados)
                        .where(and(eq(exercicio.id, id), isNull(exercicio.deletado_em)))
                        .returning();
                    exercicioAtualizado = atualizado;
                } else {
                    const [existente] = await tx
                        .select()
                        .from(exercicio)
                        .where(and(eq(exercicio.id, id), isNull(exercicio.deletado_em)));
                    exercicioAtualizado = existente;
                }

                if (musculos) {
                    await tx
                        .delete(exercicio_musculo)
                        .where(eq(exercicio_musculo.exercicio_id, id));

                    if (musculos.length > 0) {
                        await tx.insert(exercicio_musculo).values(
                            musculos.map((m) => ({
                                exercicio_id: id,
                                musculo_id: m.musculo_id,
                                tipo_ativacao: m.tipo_ativacao,
                            })),
                        );
                    }
                }

                return exercicioAtualizado;
            });
            return resultado;
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.updateExercicio');
        }
    }

    async softDeleteExercicio(id: string): Promise<type_exercicio> {
        try {
            const [exercicioDeletado] = await this.db
                .update(exercicio)
                .set({ deletado_em: new Date() })
                .where(and(eq(exercicio.id, id), isNull(exercicio.deletado_em)))
                .returning();

            return exercicioDeletado;
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.softDeleteExercicio');
        }
    }

    async findByNome(nome: string, alunoId?: string | null): Promise<type_exercicio | null> {
        try {
            const condicoes = alunoId
                ? and(
                    eq(exercicio.nome, nome),
                    isNull(exercicio.deletado_em),
                    or(isNull(exercicio.aluno_id), eq(exercicio.aluno_id, alunoId)),
                )
                : and(
                    eq(exercicio.nome, nome),
                    isNull(exercicio.deletado_em),
                    isNull(exercicio.aluno_id),
                );

            const resposta = await this.db.select().from(exercicio).where(condicoes);
            return resposta[0] || null;
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.findByNome');
        }
    }

    async verificarMusculosExistem(
        ids: string[],
    ): Promise<{ validos: boolean; inexistentes: string[] }> {
        try {
            const encontrados = await this.db
                .select({ id: musculo.id })
                .from(musculo)
                .where(inArray(musculo.id, ids));

            const idsEncontrados = new Set(encontrados.map((m) => m.id));
            const inexistentes = ids.filter((id) => !idsEncontrados.has(id));

            return { validos: inexistentes.length === 0, inexistentes };
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.verificarMusculosExistem');
        }
    }

    async verificarAlunoExiste(id: string): Promise<boolean> {
        try {
            const resultado = await this.db
                .select({ id: aluno.id })
                .from(aluno)
                .where(eq(aluno.id, id))
                .limit(1);

            return resultado.length > 0;
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.verificarAlunoExiste');
        }
    }

    async contarReferenciasEmRotina(id: string): Promise<number> {
        try {
            const resultado = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(item_rotina)
                .where(eq(item_rotina.exercicio_id, id));

            return Number(resultado[0].count);
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.contarReferenciasEmRotina');
        }
    }

    // TODO: [APARELHOS] Implementar vínculo de aparelhos (exercicio_aparelho) nos métodos
    // createExercicio, updateExercicio e getByIdExercicio — retornar aparelhos junto ao exercício
    // assim como já é feito com músculos.
    async hardDeleteExercicio(id: string): Promise<void> {
        try {
            await this.db.transaction(async (tx) => {
                // Remove vínculos N:M antes do registro principal (sem cascade no schema)
                await tx
                    .delete(exercicio_musculo)
                    .where(eq(exercicio_musculo.exercicio_id, id));

                await tx
                    .delete(exercicio_aparelho)
                    .where(eq(exercicio_aparelho.exercicio_id, id));

                await tx
                    .delete(exercicio)
                    .where(eq(exercicio.id, id));
            });
        } catch (error) {
            throw parseDatabaseError(error, 'ExercicioRepository.hardDeleteExercicio');
        }
    }
}

export default ExercicioRepository;
