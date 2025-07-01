module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sendDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return Notification;
};
