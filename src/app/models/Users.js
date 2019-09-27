import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Users extends Model {
  static init(sequelize) {
    // instancia do pai o init
    super.init(
      {
        // atribui os campos da tabela,somente os que o usuario irá interagir
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async user => {
      const { password } = user;
      if (password) {
        // eslint-disable-next-line no-param-reassign
        user.password_hash = await bcrypt.hash(password, 10);
      }
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Files, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassord(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Users;
