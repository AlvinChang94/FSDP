module.exports = (sequelize, DataTypes) => {
    const Escalation = sequelize.define("Escalation", {
        escalationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        chathistory: {
            type: DataTypes.STRING(2000),
            allowNull: true
        },
        chatsummary: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            default: "Pending"
        }
    }, {
        tableName: 'escalations'
    });

    Escalation.associate = (models) => {
        Escalation.belongsTo(models.Client, { foreignKey: 'clientId' })
        Escalation.belongsTo(models.User, { foreignKey: 'userId'})
    };

    return Escalation;
}