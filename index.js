const suits = ['&#9830;', '&#9824;', '&#9827;', '&#9829;'];
const symbols = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const handSize = 2;

//Buttons
const buttonHit = document.getElementById('hit');
const buttonStand = document.getElementById('stand');
const buttonSplit = document.getElementById('split');
const buttonSplitHit = document.getElementById('split-hit');
const buttonBet = document.getElementById('bet');
const gameButtons = [buttonHit, buttonStand, buttonSplit, buttonSplitHit];

const handValueDisplays = [
    document.getElementById('dealer-hand-value'),
    document.getElementById('player-hand-value')
]
const pointsDisplay = document.getElementById('points');
const betInput = document.getElementById('bet-amount');

class Player {
    constructor() {
        this.points = 10;
        this._bet;
        this.bet = 0;
    }

    set bet(value) {
        this._bet = value;
        this.addPoints(-value);
    }

    addPoints(value) {
        this.points += value;
        this.updatePointsDisplay(value);
    }

    updatePointsDisplay(add) {
        if (add > 0) {
            pointsDisplay.textContent = `${this.points - add} + ${add}`;
            console.log(`${this.points - add} + ${add}`);
        } else if (add < 0) {
            let posAdd = Math.abs(add);
            pointsDisplay.textContent = `${this.points + posAdd} - ${posAdd}`;
        }else {
            pointsDisplay.textContent = this.points;
        }
        betInput.max = this.points;
    }
}

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
        this.buildDeck();
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

    buildDeck() {
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
                this.cards.push(new Card(`${symbol}${suit}`, cardValue, suit));
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
    constructor() {
        this.cards = [];
        this.value = 0;
    }

    addValue(value) {
        this.value += value;
    }
    
    addCard(card) {
        this.cards.push(card);
        this.addValue(card.value);
        if(this.checkForBust()) {
            switch (this) {
                case playerHand:
                    console.log('Player busts');
                    winner('dealer');
                    break;
                case dealerHand:
                    console.log('Dealer busts');
                    break;
            }
        }
    }

    removeCard() {
        const card = this.cards.pop();
        this.addValue(-card.value);
        if (card.value === 1) card.value = 11;
        return card;
    }

    discardEntireHand() {
        while (this.cards.length) {
            deck.discardCard(this.removeCard());
            this.value = 0;
        }
    }

    dealToSixteenOrHigher() {
        while (this.value < 17) {
            this.addCard(deck.dealCard());
        }
    }

    checkForBust() {
        if (this.value <= 21) return false;
        if (this.cards.some(card => card.value === 11)) {
            this.cards.find(card => card.value === 11).value = 1;
            this.addValue(-10);
        }
        return this.value > 21;
    }
}

const player = new Player('Player');
let hands = [new Hand(), new Hand()];
let deck = new Deck(6);
let dealerHand = hands[0];
let playerHand = hands[1];

function updateHandValueDisplay() {
    handValueDisplays.forEach((display, index) => {
        if (index === 0) {
            display.innerHTML = `${hands[index].cards[0].name} ?? => ${hands[index].cards[0].value} + ??`;
            return;
        }
        display.innerHTML = hands[index].cards.map(card => card.name).join(' ') + ` => ${hands[index].value}`;
    });
}

function revealDealerHand() {
    handValueDisplays[0].innerHTML = dealerHand.cards.map(card => card.name).join(' ') + ` => ${dealerHand.value}`;
}


function checkForBlackjack() {
    if (playerHand.value === 21 && dealerHand.value === 21) {
        revealDealerHand();
        console.log('Push');
        winner('push');
        return;
    }
    if (playerHand.value === 21) {
        console.log('Player wins with blackjack');
        winner('blackjack');
        return;
    }
    if (dealerHand.value === 21) {
        revealDealerHand();
        console.log('Dealer wins with blackjack');
        winner('dealer');
    }
}

function dealCardsToHand(hand, amount) {
    for (let i = 0; i < amount; i++) {
        hand?.addCard(deck.dealCard());
    }
}

function dealNewRound(amount) {
    hands.forEach(hand => {
        hand.discardEntireHand();
    });
    for (let i = 0; i < amount; i++) {
        dealCardsToHand(playerHand, 1);
        dealCardsToHand(dealerHand, 1);
    }
    updateHandValueDisplay();
}

function hitButtonPressed(hand) {
    dealCardsToHand(hand, 1);
    updateHandValueDisplay();
}

function standButtonPressed() {
    dealerHand.dealToSixteenOrHigher();
    revealDealerHand();
    if (dealerHand.value > playerHand.value && dealerHand.value <= 21) {
        console.log('Dealer wins');
        winner('dealer');
        return;
    }
    if (dealerHand.value === playerHand.value) {
        console.log('Push');
        winner('push');
        return;
    }
    console.log('Player wins');
    winner('player');
}

function winner(win) {
    switch (win) {
        case 'player':
            console.log('Player receives double their bet');
            player.addPoints(player._bet*2);
            break;
        case 'dealer':
            console.log('Player loses their bet');
            break;
        case 'push':
            console.log('Player receives their bet back');
            player.addPoints(player._bet);
            break;
        case 'blackjack':
            console.log('Player receives 2.5 times their bet');
            player.addPoints(player._bet*2.5);
            break;
    }
    displayColors(win);
}

function startNewRound() {
    player.bet = Number(betInput.value);
    displayColors('reset');
    dealNewRound(handSize);
    checkForBlackjack();
}

function displayColors(win) {
    switch (win) {
        case 'player':
            handValueDisplays[1].style.color = 'green';
            handValueDisplays[0].style.color = 'red';
            break;
        case 'dealer':
            handValueDisplays[0].style.color = 'green';
            handValueDisplays[1].style.color = 'red';
            break;
        case 'push':
            handValueDisplays[0].style.color = 'blue';
            handValueDisplays[1].style.color = 'blue';
            break;
        case 'blackjack':
            handValueDisplays[1].style.color = 'green';
            break;
        case 'reset':
            handValueDisplays.forEach(display => {
                display.style.color = 'black';
            });
    }
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

buttonBet.onclick = () => {startNewRound()}
buttonHit.onclick = () => {hitButtonPressed(playerHand)}
buttonStand.onclick = () => {standButtonPressed()}


betInput.onchange = () => {
    switch (true) {
        case betInput.value > player.points:
            betInput.value = player.points;
            break;
        case betInput.value < 1:
            betInput.value = 1;
            break;
    }
}


console.log("loaded");
