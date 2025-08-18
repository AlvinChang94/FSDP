const { v4: uuidv4 } = require('uuid');
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const ClientMessage = sequelize.define("ClientMessage", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message_uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: () => uuidv4()
        },
        senderPhone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        senderName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // 
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE(3),
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)')
        },

    }, {
        tableName: 'client_messages',
        timestamps: false
    });
    ClientMessage.associate = (models) => {
        ClientMessage.belongsTo(models.Client, {
            foreignKey: 'senderPhone',
            targetKey: 'phoneNumber',
            as: 'client',
            constraints: false
        });
    };


    return ClientMessage;
};