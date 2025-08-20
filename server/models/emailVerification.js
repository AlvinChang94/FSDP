module.exports = (sequelize, DataTypes) => {
  const EmailVerification = sequelize.define('EmailVerification', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'email_verifications',
    timestamps: true
  });

  return EmailVerification;
};
