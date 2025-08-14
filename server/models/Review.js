module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        len: [3, 500],
      },
    },
    
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });

  return Review;
};