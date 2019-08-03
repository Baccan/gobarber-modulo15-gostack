import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancelationMail {
  // import CancelationMail from '..'
  // chama-se CancelationMail.key por cause do get
  get key() {
    // para cada job retorna-se uma chave única
    return 'CancelationMail';
  }

  // Tarefa a ser executado após a execução do processo
  // se vier 10 emails, o handle será chamado na execução de cada
  async handle({ data }) {
    const { appointment } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      // poderia ser html, text, template...
      template: 'cancellation',
      // variaveis a serem passadas para o template
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          // formato da data
          // tudo oq está em aspas simples não será considerado para a formatação
          // "dia - seria 22ia / d'dia' - seria 22dia"
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          // Ex: dia 22 de Junho, às 8:40h
          { locale: pt }
        ),
      },
    });
  }
}

export default new CancelationMail();
