import jwt from 'jsonwebtoken';
// promisify transforma uma função de callback em uma async await
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'token not provider' });
  }

  const [, token] = authHeader.split(' ');

  try {
    // decoded recebe o result de promisify
    // promisify irá transformar o callback de jwt.verify e devolve uma função
    // () que irá pedir o token e o authConfig
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
};
