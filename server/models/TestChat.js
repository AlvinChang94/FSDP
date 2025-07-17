module.exports = (sequelize, DataTypes) => {
  const TestChat = sequelize.define('TestChat', {
    chat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allownull: false
    }
  }, {
    tableName: 'test_chats',
    timestamps: false
  });

  TestChat.associate = models => {
    TestChat.hasMany(models.TestChatMessage, { foreignKey: 'chat_id' });
  };

  return TestChat;
};