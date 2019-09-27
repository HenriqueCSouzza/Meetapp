// lib yup não tem export default por isso é preciso pegar tudo oque tem dentro com *
import * as Yup from 'yup';
import Users from '../models/Users';

class UserController {
  async index(req, res) {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'email'],
    });

    res.json(users);
  }

  async store(req, res) {
    // criando Yup.Object -> mostra para o yup oque ele irá receber de REQ
    // shape() irá ver oque tem dentro do objeto
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const userExist = await Users.findOne({ where: { email: req.body.email } });
    if (userExist) {
      return res.status(400).json({ error: 'User email already exists.' });
    }

    const { id, name, email } = await Users.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        // field representa o campo que está sendo validado no caso (password)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        // oneOf recebe um array de possibilidade para o field
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, oldPassword } = req.body;
    // recebe o usuario com o id vindo pelo token
    const user = await Users.findByPk(req.userId);
    // verifica se o email é igual au usuario que quer trocar
    if (email !== user.email) {
      // verifica se tem algum usuario que contenha esse email
      const userExist = await Users.findOne({ where: { email } });
      if (userExist) {
        return res.status(400).json({ error: 'User email already exists.' });
      }
    }
    // verifica se o usuario colocou a senha
    // caso tenha colocado, compara a senha
    // se for diferente cai no erro
    if (oldPassword && !(await user.checkPassord(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);
    return res.json({ id, name, email, provider });
  }
}
export default new UserController();
