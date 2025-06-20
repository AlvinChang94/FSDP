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
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    }
  });

  return Notification;
};
