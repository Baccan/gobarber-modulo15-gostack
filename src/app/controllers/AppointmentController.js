import { isBefore, subHours } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import CreateAppointmentService from '../services/CreateAppointmentService';

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

    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userId,
      date,
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
