const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { User, Deck, Card, Attack } = require('.');
const db = require('../db/config');

// Define variables in global scope
let user, deck, card1, card2, attack1, attack2;

// Clear db and create new instances before tests
beforeAll(async () => {
  await db.sync({ force: true });
  
  user = await User.create({ username: 'gandalf' });
  deck = await Deck.create({ name: 'Magic Deck', xp: 0 });
  card1 = await Card.create({ name: 'Fireball', mojo: 20, stamina: 15, imgUrl: 'http://example.com/fireball.jpg' });
  card2 = await Card.create({ name: 'Shield', mojo: 10, stamina: 25, imgUrl: 'http://example.com/shield.jpg' });
  attack1 = await Attack.create({ title: 'Flame Burst', mojoCost: 15, staminaCost: 10 });
  attack2 = await Attack.create({ title: 'Defend', mojoCost: 5, staminaCost: 20 });
});

// Clear db after tests
afterAll(async () => await db.sync({ force: true }));

describe('Model Associations', () => {
  test('User has one Deck', async () => {
    await user.setDeck(deck);
    const userDeck = await user.getDeck();
    expect(userDeck.id).toBe(deck.id);
  });

  test('Deck belongs to User', async () => {
    const deckUser = await deck.getUser();
    expect(deckUser.id).toBe(user.id);
  });

  test('Deck has many Cards', async () => {
    await deck.addCards([card1, card2]);
    const deckCards = await deck.getCards();
    expect(deckCards.length).toBe(2);
    expect(deckCards[0].name).toBe('Fireball');
    expect(deckCards[1].name).toBe('Shield');
  });

  test('Card belongs to Deck', async () => {
    const card1Deck = await card1.getDeck();
    expect(card1Deck.id).toBe(deck.id);
  });

  test('Card has many Attacks', async () => {
    await card1.addAttacks([attack1, attack2]);
    const card1Attacks = await card1.getAttacks();
    expect(card1Attacks.length).toBe(2);
    expect(card1Attacks[0].title).toBe('Flame Burst');
    expect(card1Attacks[1].title).toBe('Defend');
  });

  test('Attack belongs to many Cards', async () => {
    await attack1.addCard(card2);
    const attack1Cards = await attack1.getCards();
    expect(attack1Cards.length).toBe(2);
    expect(attack1Cards[0].name).toBe('Fireball');
    expect(attack1Cards[1].name).toBe('Shield');
  });
});

describe('User', () => {
  test('has an id', async () => {
    expect(user).toHaveProperty('id');
  });

  test('has the correct username', async () => {
    expect(user.username).toBe('gandalf');
  });
});
