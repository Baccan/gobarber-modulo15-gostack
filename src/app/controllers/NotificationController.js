import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    /**
     * Check id provider_id is provider
     */
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' });
    }

    // como estamos utilizando mongodb, os métodos para filtragem, limite e ordenação mudam
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    // const notification = await Notification.findById(req.params.id)

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      // caso não se coloque este new como true, o dado será atualizado mas não listado
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
