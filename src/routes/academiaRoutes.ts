import express from 'express'
const router = express.Router();

import Academia_Controller from '../controllers/academiaController';
const academiaController = new Academia_Controller();

router
    .post('/academia', academiaController.createAcademia)
    .get('/academia', academiaController.getAllAcademia)

export default router;