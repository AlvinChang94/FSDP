module.exports = (sequelize, DataTypes) => {
    //specifies that the "Tutorial" table has 2 fields: title & description
    const Tutorial = sequelize.define("Tutorial", {
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        imageFile: {
            type: DataTypes.STRING(20)
        }
    }, {
        tableName: 'tutorials' //name in sql db
    });
    Tutorial.associate = (models) => {
        Tutorial.belongsTo(models.User, {
            foreignKey: "userId",
            as: 'user'
        });
    };
    //Example if there is a one-to-many relationship (User has many tutorials)

    //Tutorial.associate = (models) => {
    //    Tutorial.belongsTo(models.User, { foreignKey: 'userId' });
    //};
    return Tutorial;
}