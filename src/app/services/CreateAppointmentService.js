import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Appointment from '../models/Appointment';

import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /**
     * Check id provider_id is provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new Error('You can only create appointments with providers');
    }

    // parse transforma string em objeto date de javascript
    // start of hour irá sempre pegar o inicio da hora, sem minutos e segundos
    const hourStart = startOfHour(parseISO(date));

    /**
     * Check for past dates
     */
    // caso a data passada seja uma data anterior a data atual
    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are not permitted');
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    // caso o provider já tenha algo marcado
    // não é possível marcar datas já ocupadas
    if (checkAvailability) {
      throw new Error('Appointment date is not available');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /**
     * Notify appointment provider (mongodb)
     */
    const user = await User.findByPk(user_id);
    const formattedDate = format(
      hourStart,
      // formato da data
      // tudo oq está em aspas simples não será considerado para a formatação
      // "dia - seria 22ia / d'dia' - seria 22dia"
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      // Ex: dia 22 de Junho, às 8:40h
      { locale: pt }
    );

    await Notification.create({
      // não é preciso armazenar quem está realizando o agendamento e nem a data
      // Como o Discord, que ao alterar o nome ou o avatar, as msgs antigas não mudam
      // isso é feito para se ter performance
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      // este sim é o relacionamento
      user: provider_id,
    });

    /**
     * Invalidate cache
     */
    await Cache.invalidatePrefix(`user:${user.id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
