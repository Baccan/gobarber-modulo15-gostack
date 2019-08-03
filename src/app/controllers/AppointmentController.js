import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20, // limite por pagina
      offset: (page - 1) * 20, // page 1 - 1 = 0 * 20 = 0. Ou seja, não será pulado nenhum registro
      include: [
        {
          model: User,
          as: 'provider', // O 'as' tem que ser igual ao valor que está model Appointment.js
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar', // O 'as' tem que ser igual ao valor que está no model User
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;

    /**
     * Check id provider_id is provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    // parse transforma string em objeto date de javascript
    // start of hour irá sempre pegar o inicio da hora, sem minutos e segundos
    const hourStart = startOfHour(parseISO(date));

    /**
     * Check for past dates
     */
    // caso a data passada seja uma data anterior a data atual
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
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
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     * Notify appointment provider (mongodb)
     */
    const user = await User.findByPk(req.userId);
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

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    // Se ele não for o dono do agendamento, ele não pode cancelar
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    // retorna a data do agendamento no banco e retira 2 horas
    const dateWithSub = subHours(appointment.date, 2);

    // 13:00h
    // dateWithSub: 11h
    // now: 11:25h
    // ou seja, o horario limite pra cancelar o agendamento já passou
    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointments 2 hours advance' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    // Enviar email
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
