import { DataBase } from "../config/DbConnect";
import { user, account, aluno, treinador } from "../config/db/schema";
import crypto from "crypto";

/**
 * Seed de usuários compatível com BetterAuth.
 * Cria registros na tabela 'user' (auth) e depois vincula a 'aluno'/'treinador' (perfil).
 *
 * Senhas: utiliza hash via crypto (scrypt) no mesmo formato do BetterAuth.
 */
async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
}

export async function seedUsuarios(academiasIds: string[]): Promise<string[]> {
    if (academiasIds.length === 0) throw new Error("Nenhuma academia encontrada para vincular usuários.");

    const senhaHash = await hashPassword("Senha@123");
    const now = new Date();

    // 1. Criar users na tabela de auth do BetterAuth
    const usersCriados = await DataBase.insert(user).values([
        {
            id: crypto.randomUUID(),
            name: "José Lucas Brandão Montes",
            email: "lucas.montes@ifro.edu.br",
            emailVerified: true,
            image: null,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: crypto.randomUUID(),
            name: "Mariana Silva",
            email: "mariana.silva@email.com",
            emailVerified: true,
            image: null,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: crypto.randomUUID(),
            name: "Paulo Muzy",
            email: "paulo.muzy@ironberg.com",
            emailVerified: true,
            image: null,
            createdAt: now,
            updatedAt: now,
        },
    ]).returning({ id: user.id });

    // 2. Criar accounts com senha (provider: credential)
    await DataBase.insert(account).values(
        usersCriados.map((u) => ({
            id: crypto.randomUUID(),
            accountId: u.id,
            providerId: "credential",
            userId: u.id,
            password: senhaHash,
            createdAt: now,
            updatedAt: now,
        })),
    );

    // 3. Criar perfis de aluno vinculados aos users
    const alunosCriados = await DataBase.insert(aluno).values([
        {
            user_id: usersCriados[0].id,
            nome: "José Lucas Brandão Montes",
            data_nascimento: "1998-05-15",
            sexo: "M" as const,
            academia_id: academiasIds[0],
            status_conta: true,
        },
        {
            user_id: usersCriados[1].id,
            nome: "Mariana Silva",
            data_nascimento: "2000-10-22",
            sexo: "F" as const,
            academia_id: academiasIds[1],
        },
    ]).returning({ id: aluno.id });

    // 4. Criar perfil de treinador
    await DataBase.insert(treinador).values([
        {
            user_id: usersCriados[2].id,
            nome: "Paulo Muzy",
            data_nascimento: "1979-07-16",
            sexo: "M" as const,
            cref: "123456-G/SP",
            turnos: ["MANHA", "TARDE"],
            especializacao: "Hipertrofia e Emagrecimento",
            graduacao: "Educação Física - Bacharel",
            academia_id: academiasIds[1],
        },
    ]);

    return alunosCriados.map((a) => a.id);
}
