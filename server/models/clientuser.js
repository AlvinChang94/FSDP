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
    clientSummary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contactName: {
      type:DataTypes.STRING,
      allowNull: true
    },
    customFields: { type: DataTypes.JSON }
  }, {
    tableName: 'client_users',
    timestamps: false
  });
  ClientUser.associate = (models) => {
    ClientUser.belongsTo(models.Client, {
      foreignKey: 'clientId',
      onDelete: 'CASCADE'
    });
    ClientUser.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };

  return ClientUser;
};
