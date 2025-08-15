module.exports = (sequelize, DataTypes) => {
    const Escalation = sequelize.define("Escalation", {
        escalationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        chathistory: {
            type: DataTypes.STRING(2000),
            allowNull: true
        },
        chatsummary: {
            type: DataTypes.STRING(2000),
            allownull: true
        },
    }, {
        tableName: 'escalations'
    });

    Escalation.associate = (models) => {
        Escalation.belongsTo(models.Client, { foreignKey: 'clientId', sourceKey: 'id' })
    };

    return Escalation;
}