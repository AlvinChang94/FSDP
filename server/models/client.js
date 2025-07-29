module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define("Client", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'clients',
        timestamps: false
    });

    Client.associate = (models) => {
        Client.hasMany(models.ClientMessage, { foreignKey: 'senderPhone', sourceKey: 'phoneNumber' });
        Client.hasMany(models.Escalation, { foreignKey: 'clientId', sourceKey: 'id' })
    };

    return Client;
}