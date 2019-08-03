import File from '../models/File';

class FileController {
  async store(req, res) {
    // desestruturação para trasformar originalname e filename do arquivo
    // vindo da requisição em tableas com os nomes name e path
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
