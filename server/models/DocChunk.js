module.exports = (sequelize, DataTypes) => {
  const DocChunk = sequelize.define('DocChunk', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    chunkIndex: DataTypes.INTEGER,
    text: DataTypes.TEXT,
    textHash: DataTypes.STRING(64),
    tokenCount: DataTypes.INTEGER,
    embedding: DataTypes.BLOB('long') // store binary embedding
  }, { tableName: 'doc_chunks' });

  DocChunk.associate = (models) => {
    DocChunk.belongsTo(models.Document, { foreignKey: 'documentId' });
    DocChunk.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return DocChunk;
};
