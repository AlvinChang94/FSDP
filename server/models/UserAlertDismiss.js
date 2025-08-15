module.exports = (sequelize, DataTypes) => {
  const UserAlertDismiss = sequelize.define('UserAlertDismiss', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    alertId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Alerts', key: 'id' }
    },
    dismissedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_alert_dismiss'
  });

  UserAlertDismiss.associate = (models) => {
    UserAlertDismiss.belongsTo(models.User, { foreignKey: 'userId' });
    UserAlertDismiss.belongsTo(models.Alert, { foreignKey: 'alertId' });
  };

  return UserAlertDismiss;
};