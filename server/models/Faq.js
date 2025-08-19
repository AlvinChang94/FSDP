module.exports = (sequelize, DataTypes) => {
  const Faq = sequelize.define('Faq', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    category: DataTypes.STRING,
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    answerSummary: DataTypes.TEXT,
    embQuestion: DataTypes.BLOB('long'),
    embQa: DataTypes.BLOB('long')
  }, { tableName: 'faqs' });

  Faq.associate = (models) => {
    Faq.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Faq;
};
