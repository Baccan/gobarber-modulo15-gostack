import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // Método chamado automaticamente pelo sequelize.
  // Instancia a conexão
  static init(sequelize) {
    // Chama o método init da classe Model e define as colunas que podem ser criadas por usuarios
    super.init(
      // Objeto que contem nas colunas
      // VIRTUAL - Campo que existe apenas para verificação. Não armazena na base de dados
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    // Hooks são techos de código que são executados automatcamente com ações realizadas no Model
    // Apagando beforeSave e dando ctrl + space vc pode ver todoas as opções
    this.addHook('beforeSave', async user => {
      if (user.password) {
        // 8 é a força da criptografia. Valores muito altos acabam pesando na aplicação
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    // Retorna o model que acaba de ser inicializado
    return this;
  }

  static associate(models) {
    // este model de User pertence ao model de File
    // um id de arquivo sera armazenado dentro do model User
    // as = codenome para o relacionamento do modelo File
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
