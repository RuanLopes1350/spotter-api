import { DataBase } from "../config/DbConnect";
import { aluno, treinador } from "../config/db/schema";
import { auth } from "../utils/auth";

export async function seedUsuarios(academiasIds: number[]): Promise<void> {
    if (academiasIds.length === 0) throw new Error("Nenhuma academia encontrada para vincular usuários.");

    // Criando usuários de auth (alunos)
    const authAluno1 = await auth.api.signUpEmail({
        body: { name: "Carlos Eduardo Silva", email: "carlos.silva@gmail.com", password: "Aluno@2026!" },
    });

    const authAluno2 = await auth.api.signUpEmail({
        body: { name: "Ana Beatriz Oliveira", email: "ana.oliveira@hotmail.com", password: "Aluno@2026!" },
    });

    const authAluno3 = await auth.api.signUpEmail({
        body: { name: "Rafael Mendes Costa", email: "rafael.costa@gmail.com", password: "Aluno@2026!" },
    });

    const authAluno4 = await auth.api.signUpEmail({
        body: { name: "Juliana Ferreira Lima", email: "juliana.lima@outlook.com", password: "Aluno@2026!" },
    });

    // Criando usuários de auth (treinadores)
    const authTreinador1 = await auth.api.signUpEmail({
        body: { name: "Marcos Antônio Rocha", email: "marcos.rocha@personalfit.com", password: "Treinador@2026!" },
    });

    const authTreinador2 = await auth.api.signUpEmail({
        body: { name: "Fernanda Souza Almeida", email: "fernanda.almeida@personalfit.com", password: "Treinador@2026!" },
    });

    // Criando perfis de alunos
    await DataBase.insert(aluno).values([
        {
            user_id: authAluno1.user.id,
            nome: "Carlos Eduardo Silva",
            data_nascimento: "1995-03-12",
            sexo: "M",
            academia_id: academiasIds[0],
            status_conta: true,
        },
        {
            user_id: authAluno2.user.id,
            nome: "Ana Beatriz Oliveira",
            data_nascimento: "2001-08-25",
            sexo: "F",
            academia_id: academiasIds[0],
            status_conta: true,
        },
        {
            user_id: authAluno3.user.id,
            nome: "Rafael Mendes Costa",
            data_nascimento: "1998-11-07",
            sexo: "M",
            academia_id: academiasIds[1],
            status_conta: true,
        },
        {
            user_id: authAluno4.user.id,
            nome: "Juliana Ferreira Lima",
            data_nascimento: "2000-06-18",
            sexo: "F",
            academia_id: academiasIds[2],
            status_conta: true,
        },
    ]);

    // Criando perfis de treinadores
    await DataBase.insert(treinador).values([
        {
            user_id: authTreinador1.user.id,
            nome: "Marcos Antônio Rocha",
            data_nascimento: "1985-01-20",
            sexo: "M",
            cref: "012345-G/RO",
            turnos: ["MANHA", "TARDE"],
            especializacao: "Hipertrofia e Força",
            graduacao: "Educação Física - Bacharel",
            academia_id: academiasIds[0],
            status_conta: true,
        },
        {
            user_id: authTreinador2.user.id,
            nome: "Fernanda Souza Almeida",
            data_nascimento: "1990-09-14",
            sexo: "F",
            cref: "067890-G/RO",
            turnos: ["TARDE", "NOITE"],
            especializacao: "Emagrecimento e Condicionamento",
            graduacao: "Educação Física - Licenciatura",
            academia_id: academiasIds[1],
            status_conta: true,
        },
    ]);
}