import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Appointment extends Model {
  // Método chamado automaticamente pelo sequelize.
  // Instancia a conexão
  static init(sequelize) {
    // Chama o método init da classe Model e define as colunas que podem ser criadas por usuarios
    super.init(
      // Objeto que contem nas colunas
      // VIRTUAL - Campo que existe apenas para verificação. Não armazena na base de dados
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          // verifica se a data e a hora já passaram
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          // verifica se o agendamento pode ser cancelado ou nao, sendo 2 horas antes da hora agendada
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
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

  static associate(models) {
    // este model de Appointment pertence ao model de User
    // um id de agendamento sera armazenado dentro do model User
    // as = codenome para o relacionamento do modelo User
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
