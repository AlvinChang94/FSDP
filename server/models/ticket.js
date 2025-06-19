module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("Ticket", {
        ticketId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ticketStatus: {
            type: DataTypes.ENUM('open', 'solved'),
            defaultValue: 'open'
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'tickets',
        timestamps: false
    });

    Ticket.associate = (models) => {
        Ticket.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
        // Optionally:
        // Ticket.belongsTo(models.User, { as: 'assignedAdmin', foreignKey: 'assignedAdminId' });
        Ticket.hasMany(models.Message, { foreignKey: 'ticketId', onDelete: 'CASCADE', hooks: true});
    };

    return Ticket;
}

/* // GET /api/tickets (for admins)
router.get('/', async (req, res) => {
    // Add admin authentication middleware here
    const tickets = await db.Ticket.findAll({
        include: [{ model: db.User, as: 'client' }]
    });
    res.json(tickets);
}); */