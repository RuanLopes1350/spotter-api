import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chalk from 'chalk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//função para iniciar o servidor
async function startServer() {
    //TODO: adicionar await para conectar ao banco de dados antes de iniciar o servidor
  app.listen(PORT, () => {
    console.log(chalk.green(`Servidor rodando em ${chalk.blue(`http://localhost:${PORT}/`)}`));
  });
};

startServer();