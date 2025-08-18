module.exports = (sequelize, DataTypes) => {
  const ReadReviews = sequelize.define('ReadReviews', {
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Reviews', key: 'id' },
      onDelete: 'CASCADE'
    },
    readAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'read_reviews'
  });

  ReadReviews.associate = (models) => {
    ReadReviews.belongsTo(models.Review, { foreignKey: 'reviewId' });
  };

  return ReadReviews;
};