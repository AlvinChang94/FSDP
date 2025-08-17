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
        Client.hasMany(models.Escalation, { foreignKey: 'clientId', sourceKey: 'id' })
        Client.hasMany(models.ClientMessage, {
            foreignKey: 'senderPhone',   // field in ClientMessage
            sourceKey: 'phoneNumber',    // field in Client
            as: 'messages',
            constraints: false           // don’t enforce strict DB FK
        });
        Client.hasMany(models.ClientUser, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE'
        });
        Client.belongsToMany(models.User, {
            through: models.ClientUser,
            foreignKey: 'clientId',
            otherKey: 'userId',
            onDelete: 'CASCADE'
        });




    };


    return Client;
}