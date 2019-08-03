import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // o cb() precisa receber um erro, caso exista e o nome do arquivo.
        // neste caso null é o erro e estamos retornando uma string dos 16bytes
        //  de conteúdo aleatorio em uma string hexadecimal + o nome da extensao original
        // que o usuario inseriu
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
