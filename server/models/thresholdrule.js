module.exports = (sequelize, DataTypes) => {
  const ThresholdRule = sequelize.define('ThresholdRule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // FK to users/config
    ruleName: { type: DataTypes.STRING, allowNull: false },
    triggerType: { type: DataTypes.STRING, allowNull: false },
    keyword: { type: DataTypes.TEXT, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: true },
    confidenceThreshold: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.5 }
  }, {
    tableName: 'threshold_rules'
  });

  ThresholdRule.associate = (models) => {
    ThresholdRule.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE',}); // convenience
    // optionally belongsTo ConfigSettings if you prefer linking to config id
  };

  return ThresholdRule;
}