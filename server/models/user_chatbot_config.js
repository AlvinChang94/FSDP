module.exports = (sequelize, DataTypes) => {
    const ConfigSettings = sequelize.define("ConfigSettings", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tone: {
            type: DataTypes.STRING, // e.g. "Friendly, Professional"
            allowNull: true,
            defaultValue: 'None'
        },
        personality: {
            type: DataTypes.STRING, // e.g. "Concise, Empathetic"
            allowNull: true,
            defaultValue: 'None'
        },
        emojiUsage: {
            type: DataTypes.STRING, // e.g. "Light", "Heavy", "None"
            allowNull: true,
            defaultValue: 'None'
        },
        signature: {
            type: DataTypes.STRING, // e.g. "Let us know if you need anything else!"
            allowNull: true,
            defaultValue: 'None'
        },
        dataRetention: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        notificationMethod: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'None'
        },
        holdingMsg: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dataRetention: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

        // Add more fields as needed for other config options
    }, {
        tableName: 'config_settings'
    });

    ConfigSettings.associate = (models) => {
        ConfigSettings.belongsTo(models.User, { foreignKey: 'userId' });
        ConfigSettings.hasMany(models.ThresholdRule, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE', hooks: true });
    };

    return ConfigSettings;
}