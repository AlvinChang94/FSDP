module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: { 
      type: DataTypes.INTEGER,  // matches default User.id type
      autoIncrement: true,
      primaryKey: true
    },
    userId: { 
      type: DataTypes.INTEGER,  // must match User.id exactly
      allowNull: false
    },
    title: DataTypes.STRING,
    source: DataTypes.STRING,
    mimeType: DataTypes.STRING
  }, { 
    tableName: 'documents'
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { foreignKey: 'userId' });
    Document.hasMany(models.DocChunk, { foreignKey: 'documentId' });
  };

  return Document;
};
