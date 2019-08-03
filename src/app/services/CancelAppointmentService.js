import { isBefore, subHours } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({ provider_id, user_id }) {
    const appointment = await Appointment.findByPk(provider_id, {
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
    if (appointment.user_id !== user_id) {
      throw new Error("You don't have permission to cancel this appointment.");
    }

    // retorna a data do agendamento no banco e retira 2 horas
    const dateWithSub = subHours(appointment.date, 2);

    // 13:00h
    // dateWithSub: 11h
    // now: 11:25h
    // ou seja, o horario limite pra cancelar o agendamento já passou
    if (isBefore(dateWithSub, new Date())) {
      throw new Error('You can only cancel appointments 2 hours advance');
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    // Enviar email
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    /**
     * Invalidate cache
     */
    await Cache.invalidatePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CancelAppointmentService();
