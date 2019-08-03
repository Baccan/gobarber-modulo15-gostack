import 'dotenv/config';
// ^^^^^^^^^^^^^ armazena todas as variaveis do arquivo .env em process.env.DB_HOST por exemplo

import Queue from './lib/Queue';

// arquivo separado para processar a fila em outra aplicação para não influenciar na performance
Queue.processQueue();
