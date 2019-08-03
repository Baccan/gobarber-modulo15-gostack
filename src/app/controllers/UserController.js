import User from '../models/User';
import File from '../models/File';

import Cache from '../../lib/Cache';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    if (provider) {
      await Cache.invalidate('providers');
    }

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  // Atualizar dados cadastrais do usuario
  async update(req, res) {
    const { email, oldPassword } = req.body;

    // findByPk - primary key
    const user = await User.findByPk(req.userId);

    // se o email que o usuario enviou é diferente do email que esta cadastrado, realiza a troca
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // Se o usuario quer trocar a senha, o valor oldPassword será passado e verificado
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // const { id, name, provider } = await user.update(req.body);
    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      // provider,
      avatar,
    });
  }
}

export default new UserController();
