import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          // comparação entre - between
          /**
           * 2019-07-20 00:00:00
           * pega a primeira hora do dia e compara com
           * 2019-07-20 23:59:59
           */
          // retorna como chave de date
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    // horarios disponiveis
    const schedule = [
      '08:00', // 2018-06-23 08:00:00
      '09:00', // 2018-06-23 09:00:00
      '10:00', // 2018-06-23 10:00:00
      '11:00', // 2018-06-23 11:00:00
      '12:00', // 2018-06-23 12:00:00
      '13:00', // 2018-06-23 13:00:00
      '14:00', // 2018-06-23 14:00:00
      '15:00', // 2018-06-23 15:00:00
      '16:00', // 2018-06-23 16:00:00
      '17:00', // 2018-06-23 17:00:00
      '18:00', // 2018-06-23 18:00:00
      '19:00', // 2018-06-23 19:00:00
      '20:00', // 2018-06-23 20:00:00
      '21:00', // 2018-06-23 21:00:00
      '22:00', // 2018-06-23 22:00:00
      '23:00', // 2018-06-23 23:00:00
    ];

    // verificar se o horario nao passou e se nao possui nenhum appointment neste horario
    const available = schedule.map(time => {
      const [hour, minute] = time.split(':'); // tudo antes dos : é hora e depois é minutos
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time, // 08:00 por exemplo
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"), // representação timestamp
        available:
          isAfter(value, new Date()) &&
          !appointments.find(
            appointment => format(appointment.date, 'HH:mm') === time
          ),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
