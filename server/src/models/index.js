const User = require('./User');
const Deck = require('./Deck');
const Card = require('./Card');
const Attack = require('./Attack');

// User-Deck Association (already present)
User.hasOne(Deck);
Deck.belongsTo(User);

// Deck-Card Association (one-to-many)
Deck.hasMany(Card);
Card.belongsTo(Deck);

// Card-Attack Association (many-to-many)
Card.belongsToMany(Attack, { through: 'CardAttacks' });
Attack.belongsToMany(Card, { through: 'CardAttacks' });

module.exports = { User, Deck, Card, Attack };
