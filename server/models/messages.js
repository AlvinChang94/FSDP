const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        message_uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: () => uuidv4()
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        recipientId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isEdited: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'messages',
        timestamps: false
    });

    // Associations (optional, for easier querying)
    Message.associate = (models) => {
        Message.belongsTo(models.Ticket, { foreignKey: 'ticketId' });
        Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    };

    return Message;
}