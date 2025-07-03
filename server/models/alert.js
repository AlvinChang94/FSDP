module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define('Alert', {
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

  return Alert;
};
