module.exports = {
  splitDeck(deck, players) {
    const splitNum = deck.length / players.length;
    let remainder = Math.round((splitNum % 1) * players.length);
    let splitDeck = {};
    let playersShuffled = shuffle(players); // Ensure randomness of who gets less cards
    console.log('-------', splitNum, remainder, playersShuffled)

    for (player in playersShuffled) {
      let numCard = Math.floor(splitNum);
      if (remainder > 0) {
        numCard++;
      }
      splitDeck[playersShuffled[player].id] = deck.splice(0, numCard);
      remainder--;
    }
    return splitDeck;
  },
  makeDeck() {
    let deck = new Array();
    let suits = ['S', 'D', 'C', 'H'];
    let values = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K'
    ];
    for (let i = 0; i < suits.length; i++) {
      for (let x = 0; x < values.length; x++) {
        let card = { Value: values[x], Suit: suits[i] };
        deck.push(card);
      }
    }
    return shuffle(deck);
  }
};

function shuffle(array) {
  let currIndex = array.length,
    tempValue,
    randomIndex;
  while (0 !== currIndex) {
    randomIndex = Math.floor(Math.random() * currIndex);
    currIndex -= 1;
    tempValue = array[currIndex];
    array[currIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }
  return array;
}
