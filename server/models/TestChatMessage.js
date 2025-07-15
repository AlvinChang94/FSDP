module.exports = (sequelize, DataTypes) => {
  const TestChatMessage = sequelize.define('TestChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    message_uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_chats',
        key: 'chat_id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sender: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'test_chat_messages',
    timestamps: false
  });

  TestChatMessage.associate = models => {
    TestChatMessage.belongsTo(models.TestChat, { foreignKey: 'chat_id' });
  };

  return TestChatMessage;
};