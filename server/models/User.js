const { Hooks } = require("sequelize/lib/hooks");

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
        },
        business_name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        business_overview: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone_num: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        profile_picture: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        autoDelete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'users'
    });
    User.associate = (models) => {
        User.hasMany(models.Tutorial, {
            foreignKey: "userId",
            onDelete: "cascade",
            hooks: true
        });
        User.hasMany(models.Message, {
            as: 'sentMessages', foreignKey: 'senderId', onDelete: "cascade",
            hooks: true
        });
        User.belongsToMany(models.Client, {
            through: models.ClientUser,
            foreignKey: 'userId',
            otherKey: 'clientId',
            onDelete: "cascade",
            hooks: true
        });

    };
    return User;
}