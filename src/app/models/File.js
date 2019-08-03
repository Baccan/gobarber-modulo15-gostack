import Sequelize, { Model } from 'sequelize';

class File extends Model {
  // Método chamado automaticamente pelo sequelize.
  // Instancia a conexão
  static init(sequelize) {
    // Chama o método init da classe Model e define as colunas que podem ser criadas por usuarios
    super.init(
      // Objeto que contem nas colunas
      // VIRTUAL - Campo que existe apenas para verificação. Não armazena na base de dados
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    // Retorna o model que acaba de ser inicializado
    return this;
  }
}

export default File;
