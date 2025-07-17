module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'user'
        },
        muted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        link_code: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'users'
    });
    User.associate = (models) => {
        User.hasMany(models.Tutorial, {
            foreignKey: "userId",
            onDelete: "cascade"
        });
        User.hasMany(models.Message, { as: 'sentMessages', foreignKey: 'senderId' });
        User.belongsToMany(models.Client, {
            through: models.ClientUser,
            foreignKey: 'userId',      // column in ClientUser referring to User
            otherKey: 'clientId'       // column in ClientUser referring to Client
        });

        // Optional: also allow accessing the join table records directly
        User.hasMany(models.ClientUser, { foreignKey: 'userId' });
    };
    return User;
}