require('dotenv/config');
// ^^^^^^^^^^^^^ armazena todas as variaveis do arquivo .env em process.env.DB_HOST por exemplo

module.exports = {
  // Para utilizar este dialeto é preciso as dependencias: pg pg-hstore
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    // Garante uma colune "CreatedAt" e "UpdatedAt" no banco
    timestamps: true,

    // Utiliza o padrão de tabelas e colunas underscored "Model: UserGroup cria a tabela: user_groups"
    underscored: true,
    // Para colunas e relacionamentos
    underscoredAll: true,
  },
};
