import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(410).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      // pega todos os agendamentos se o usuario é provider, não estao canceladas
      // e se está entre o começo e o fim daquele dia
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          // comparação entre - between
          /**
           * 2019-07-20 00:00:00
           * pega a primeira hora do dia e compara com
           * 2019-07-20 23:59:59
           */
          // retorna como chave de date
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
