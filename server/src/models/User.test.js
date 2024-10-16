const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { User, Deck, Card, Attack } = require('.');
const db = require('../db/config');
const { Op } = require('sequelize');

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

  // Create data for eager loading tests
  const eagerUser = await User.create({ username: 'eageruser' });
  const eagerDeck = await Deck.create({ name: 'Eager Deck', xp: 50 });
  await eagerUser.setDeck(eagerDeck);

  const eagerCard1 = await Card.create({ name: 'Eager Card 1', mojo: 30, stamina: 40, imgUrl: 'http://example.com/eagercard1.jpg' });
  const eagerCard2 = await Card.create({ name: 'Eager Card 2', mojo: 25, stamina: 35, imgUrl: 'http://example.com/eagercard2.jpg' });
  await eagerDeck.addCards([eagerCard1, eagerCard2]);

  const eagerAttack1 = await Attack.create({ title: 'Eager Attack 1', mojoCost: 10, staminaCost: 15 });
  const eagerAttack2 = await Attack.create({ title: 'Eager Attack 2', mojoCost: 8, staminaCost: 12 });
  await eagerCard1.addAttacks([eagerAttack1, eagerAttack2]);
  await eagerCard2.addAttack(eagerAttack1);
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
    await card1.setDeck(deck);
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

describe('User Model', () => {
  test('has an id', async () => {
    expect(user).toHaveProperty('id');
  });

  test('has the correct username', async () => {
    expect(user.username).toBe('gandalf');
  });

  test('cannot create a user without a username', async () => {
    await expect(User.create({})).rejects.toThrow();
  });

  test('cannot create two users with the same username', async () => {
    await expect(User.create({ username: 'gandalf' })).rejects.toThrow();
  });
});

describe('Deck Model', () => {
  test('can create a deck', async () => {
    const newDeck = await Deck.create({ name: 'Test Deck', xp: 100 });
    expect(newDeck.name).toBe('Test Deck');
    expect(newDeck.xp).toBe(100);
    expect(newDeck.id).toBeDefined();
  });

  test('cannot create a deck without a name', async () => {
    await expect(Deck.create({ xp: 100 })).rejects.toThrow();
  });

  test('xp defaults to 0 if not provided', async () => {
    const newDeck = await Deck.create({ name: 'Zero XP Deck' });
    expect(newDeck.xp).toBe(0);
  });
});

describe('Card Model', () => {
  test('can create a card', async () => {
    const newCard = await Card.create({
      name: 'Test Card',
      mojo: 10,
      stamina: 20,
      imgUrl: 'http://example.com/testcard.jpg'
    });
    expect(newCard.name).toBe('Test Card');
    expect(newCard.mojo).toBe(10);
    expect(newCard.stamina).toBe(20);
    expect(newCard.imgUrl).toBe('http://example.com/testcard.jpg');
    expect(newCard.id).toBeDefined();
  });

  test('cannot create a card without required fields', async () => {
    await expect(Card.create({ name: 'Incomplete Card' })).rejects.toThrow();
  });
});

describe('Attack Model', () => {
  test('can create an attack', async () => {
    const newAttack = await Attack.create({
      title: 'Test Attack',
      mojoCost: 5,
      staminaCost: 10
    });
    expect(newAttack.title).toBe('Test Attack');
    expect(newAttack.mojoCost).toBe(5);
    expect(newAttack.staminaCost).toBe(10);
    expect(newAttack.id).toBeDefined();
  });

  test('cannot create an attack without required fields', async () => {
    await expect(Attack.create({ title: 'Incomplete Attack' })).rejects.toThrow();
  });
});

describe('Eager Loading', () => {
  test('User can be loaded with its Deck', async () => {
    const userWithDeck = await User.findOne({
      where: { username: 'eageruser' },
      include: Deck
    });

    expect(userWithDeck).toBeDefined();
    expect(userWithDeck.Deck).toBeDefined();
    expect(userWithDeck.Deck.name).toBe('Eager Deck');
    expect(userWithDeck.Deck.xp).toBe(50);
  });

  test('Deck can be loaded with its Cards', async () => {
    const deckWithCards = await Deck.findOne({
      where: { name: 'Eager Deck' },
      include: Card
    });

    expect(deckWithCards).toBeDefined();
    expect(deckWithCards.Cards).toBeDefined();
    expect(deckWithCards.Cards.length).toBe(2);
    expect(deckWithCards.Cards[0].name).toBe('Eager Card 1');
    expect(deckWithCards.Cards[1].name).toBe('Eager Card 2');
  });

  test('Cards can be loaded with their Attacks', async () => {
    const cardsWithAttacks = await Card.findAll({
      where: {
        name: {
          [Op.like]: 'Eager Card%'
        }
      },
      include: Attack,
      order: [['name', 'ASC']]
    });

    expect(cardsWithAttacks).toBeDefined();
    expect(cardsWithAttacks.length).toBe(2);

    // Check first card
    expect(cardsWithAttacks[0].name).toBe('Eager Card 1');
    expect(cardsWithAttacks[0].Attacks).toBeDefined();
    expect(cardsWithAttacks[0].Attacks.length).toBe(2);
    expect(cardsWithAttacks[0].Attacks[0].title).toBe('Eager Attack 1');
    expect(cardsWithAttacks[0].Attacks[1].title).toBe('Eager Attack 2');

    // Check second card
    expect(cardsWithAttacks[1].name).toBe('Eager Card 2');
    expect(cardsWithAttacks[1].Attacks).toBeDefined();
    expect(cardsWithAttacks[1].Attacks.length).toBe(1);
    expect(cardsWithAttacks[1].Attacks[0].title).toBe('Eager Attack 1');
  });
});
