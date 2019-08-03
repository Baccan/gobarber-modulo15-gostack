import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Desestruturar Bearer do token
  // desestruturar com uma , no início ignora os outros parametros do array
  const [, token] = authHeader.split(' ');

  try {
    // ()() significa que a primeira função retorna outra função
    // decoded são as informações descriptografadas to token passado pelo header de autenticação ({ id, name, email, secret, expiresIn }) criano em SessionController
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
