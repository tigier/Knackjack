Document.designMode = 'on';
const suits = ['diamonds', 'spades', 'clubs', 'hearts'];
const symbols = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const handSize = 2;
const buttonHit = document.getElementById('hit');
const buttonStand = document.getElementById('stand');
const buttonSplit = document.getElementById('split');
const buttonSplitHit = document.getElementById('split-hit');
const buttonSplitStand = document.getElementById('split-stand');
const gameButtons = [buttonHit, buttonStand, buttonSplit, buttonSplitHit, buttonSplitStand];

const playerHandValueDisplay = document.getElementById('player-hand-value');
const dealerHandValueDisplay = document.getElementById('dealer-hand-value');
const playerSplitHandValueDisplay = document.getElementById('player-split-hand-value');
const handValueDisplays = [dealerHandValueDisplay, playerHandValueDisplay, playerSplitHandValueDisplay]

class Card {
    constructor(name, value, suite) {
        this.name = name;
        this.value = value;
        this.suite = suite;
    }
}

class Deck {
    constructor(numberOfDecks = 6) {
        this.cards = [];
        this.discardPile = [];
        for(let suit of suits) {
            for (let symbol of symbols) {
                let cardValue = symbol;
                if (symbol === 'A') {
                    cardValue = 11;
                } else if (['K', 'Q', 'J'].includes(symbol)) {
                    cardValue = 10;
                } else {
                    cardValue = parseInt(symbol);
                }
                this.cards.push(new Card(`${symbol}${suit[0].toUpperCase()}`, cardValue, suit));
            }
        }
        for (let i = 1; i < numberOfDecks; i++) {
            this.cards = this.cards.concat(this.cards);
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = 0; i < 3; i++) {
            for (let j = this.cards.length - 1; j > 0; j--) {
                const randomIndex = Math.floor(Math.random() * (j + 1));
                [this.cards[j], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[j]];
            }
        }
    }

    dealCard() {
        if (!this.cards.length) {
            this.resetDiscard();
        }
        return this.cards.pop();
    }

    discardCard(card) {
        this.discardPile.push(card);
    }

    resetDiscard() {
        while (this.discardPile.length) {
            this.cards.push(this.discardPile.pop());
        }
        this.shuffle();
    }
}

class Hand {
    constructor(handValueDisplay) {
        this.cards = [];
        this.value = 0;
        this.handValueDisplay = handValueDisplay;
    }

    addCard(card) {
        this.cards.push(card);
        this.calculateValue();
    }
    
    removeCard() {
        const card = this.cards.pop();
        this.calculateValue();
        return card;
    }

    calculateValue() {
        let handValue = 0;
        for (let card of this.cards) {
            handValue += card.value;
        }
        this.value = handValue;
        //this.handValueDisplay.textContent = handValue;
    }
}

let hands = [];
function addNewHand(handValueDisplay) {
    hands.push(new Hand(handValueDisplay));
}

let deck = new Deck(6);

handValueDisplays.forEach(handValueDisplay => {addNewHand(handValueDisplay)});
let dealerHand = hands[0];
let playerHand = hands[1];
let playerSplitHand = hands[2];

function dealCardsToHand(hand, amount) {
    for (let i = 0; i < amount; i++) {
          hand?.addCard(deck.dealCard());
    }
}

function discardEntireHand(hand) {
    while (hand?.cards.length) {
       deck.discardCard(hand.removeCard());
    }
}

function burnTopCardOfDeck(amount) {
    for (let i = 0; i < amount; i++) {
        deck.discardCard(deck.dealCard());
    }
}

function dealNewRound(amount) {
    burnTopCardOfDeck(1);
    hands.forEach(hand => {
        discardEntireHand(hand);
    });
    for (let i = 0; i < amount; i++) {
        dealCardsToHand(playerHand, 1);
        dealCardsToHand(dealerHand, 1);
    }
}

function splitHand() {
    if (playerHand.cards.length != 2) {
        console.log('You can only split with two cards');
    } else if (playerSplitHand.cards.length) {
        console.log('You can only split once');
    } else {
        playerSplitHand.addCard(playerHand.removeCard());
        dealCardsToHand(playerHand, 1);
        dealCardsToHand(playerSplitHand, 1);
    }
}

function checkGameStatus() {
    if (playerHand.value === 21) {
        console.log('You got blackjack!');
    } else if (playerHand.value > 21) {
        console.log('You busted!');
    } else {
        return
    }
    butt
    
}

function playerHit() {
    dealCardsToHand(playerHand, 1);
    checkGameStatus();
}

function disableButtons(button) {
    button.disabled = true;
}
function enableButtons(button) {
    button.disabled = false;
}
function disableAllGameButtons() {
    gameButtons.forEach(button => {
        disableButtons(button);
    });
}
function enableAllGameButtons() {
    gameButtons.forEach(button => {
        enableButtons(button);
    });
}  

dealNewRound(handSize);



splitHand();

console.log(gameButtons);
console.log(handValueDisplays);
