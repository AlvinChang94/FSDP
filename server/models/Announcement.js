module.exports = (sequelize, DataTypes) => {
    const Announcement = sequelize.define("Announcement", {
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        content: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },
        AudienceisModerator: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allownull: false
        },
        AudienceisUser: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allownull: false
        },
        sendNow: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allownull: false
        },
        scheduledDate: {
            type: DataTypes.DATE,
            allownull: true
        }
    }, {
        tableName: 'announcements' 
    });
    return Announcement;
}