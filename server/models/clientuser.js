module.exports = (sequelize, DataTypes) => {
  const ClientUser = sequelize.define("ClientUser", {
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'clients',
        key: 'id'
      },
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      primaryKey: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'client_users',
    timestamps: false
  });
  ClientUser.associate = (models) => {
    ClientUser.belongsTo(models.User, { foreignKey: 'userId' });
    ClientUser.belongsTo(models.Client, { foreignKey: 'clientId' });
  };
  return ClientUser;
};
