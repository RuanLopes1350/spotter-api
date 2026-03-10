import express from 'express';
import AlunoController from '../controllers/alunoController';
const router = express.Router();

const alunoController = new AlunoController();

router
    .get('/alunos', alunoController.getAllAlunos)
    .get('/alunos/:id', alunoController.getAlunoById)
    .post('/alunos', alunoController.createAluno)

export default router
