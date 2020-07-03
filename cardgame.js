/*                  ----card game----
    
    const decks  -> is deck names
    const DISTRIBUTION_SIZE -> is each user will get that much cards 
    
    cardsSequence :[{ seq: 1, alias: "A", value: 14 }]
    * seq   -> is in which card running order is comes 
    * alias -> is how you want to display the card as alias name or value 
    * value -> bigger number denotes bigger value of card

*/

const decks = ["spade", "heart", "club", "diamond"];
const DISTRIBUTION_SIZE = 3;
const cardsSequence = [
  //
  { seq: 1, alias: "A", value: 14 },
  { seq: 2, value: 2 },
  { seq: 3, value: 3 },
  { seq: 4, value: 4 },
  { seq: 5, value: 5 },
  { seq: 6, value: 6 },
  { seq: 7, value: 7 },
  { seq: 8, value: 8 },
  { seq: 9, value: 9 },
  { seq: 10, value: 10 },
  { seq: 11, alias: "J", value: 11 },
  { seq: 12, alias: "Q", value: 12 },
  { seq: 13, alias: "K", value: 13 },
];

/* 
for manual testing uncomment this one, uncomment line number 82 and comment line number 81
const INPUT_CARDS = [
  {
    name: "bipin",
    cards: [
      { seq: 2, value: 2, deckName: "diamond", color: "red" },
      { seq: 3, value: 3, deckName: "heart", color: "red" },
      { seq: 4, value: 4, deckName: "spade", color: "black" },
    ],
  },
  {
    name: "raghu",
    cards: [
      { seq: 1, value: 14, deckName: "diamond", color: "red", alias: "A" },
      { seq: 1, value: 14, deckName: "heart", color: "red", alias: "A" },
      { seq: 1, value: 14, deckName: "spade", color: "black", alias: "A" },
    ],
  },
  {
    name: "amit",
    cards: [
      { seq: 5, value: 5, deckName: "heart", color: "red" },
      { seq: 6, value: 6, deckName: "club", color: "black" },
      { seq: 7, value: 7, deckName: "club", color: "black" },
    ],
  },
  {
    name: "ankit",
    cards: [
      { seq: 6, value: 6, deckName: "heart", color: "red" },
      { seq: 5, value: 5, deckName: "diamond", color: "red" },
      { seq: 7, value: 7, deckName: "spade", color: "black" },
    ],
  },
];
*/

$(document).ready(function () {
  initializeGame();
});

function initializeGame() {
  let plyrCards;
  let deck;
  $("#performTieBreaker").hide();
  $("#startgame").click(function () {
    $(".player-card").removeClass("winnerCard");
    let res = startGame();
    plyrCards = res.plyrs; // for manual testing comment this line
    // plyrCards = INPUT_CARDS;  for manual testing uncomment this line
    if (plyrCards) {
      renderCards(plyrCards);
    }
    deck = res.cards;
  });
  $("#checkResult").click(function () {
    if (!plyrCards) {
      alert("distribute card first");
      return;
    }
    if (!deck) {
      alert("deck is empty");
      return;
    }
    let result = decideWinner(plyrCards, deck);
    $("#player_" + result.name).addClass("winnerCard");
  });

  //   $("#performTieBreaker").click(function () {});
}

function startGame() {
  let allCards = formWholeDeck(); // forming all 52 cards
  let players = [
    { name: "bipin", cards: [] },
    { name: "raghu", cards: [] },
    { name: "amit", cards: [] },
    { name: "ankit", cards: [] },
  ];
  let result = distributeCards(players, allCards); // distributing 3 cards to each
  return result;
}

function formWholeDeck() {
  let allCards = [];
  for (let d in decks) {
    for (let c in cardsSequence) {
      let card = Object.assign({}, cardsSequence[c]);
      card["color"] =
        decks[d] == "spade" || decks[d] == "club" ? "black" : "red";
      card["deckName"] = decks[d];
      allCards.push(card);
    }
  }
  return allCards;
}

function getRandomIndex(cards) {
  return Math.floor(Math.random() * cards.length);
}

function distributeCards(players, cards) {
  // distribute cards to each players from deck
  let plyrs = [...players];
  for (let i = 0; i < DISTRIBUTION_SIZE; i++) {
    for (let plr of plyrs) {
      let idx = getRandomIndex(cards);
      if (cards[idx]) {
        let card = cards[idx];
        plr.cards.push(card);
        cards.splice(idx, 1);
      }
    }
  }
  return { plyrs, cards };
}

function renderCards(distributedCards) {
  for (let dist of distributedCards) {
    let temp = `<h5 class="card-title">${dist.name}</h5>`;
    let content = "";
    for (let c of dist.cards) {
      let subContent = `<p class="card-text" style="color:${c.color}">${
        c.alias || c.seq
      } - ${c.deckName}</p>`;
      content = content + subContent;
    }
    let wholeTemp = temp + content;
    $("#player_" + dist.name).empty();
    $("#player_" + dist.name).append(wholeTemp);
  }
  return distributedCards;
}

function renderRedrawnCardsFromDeck(distributedCards) {
  // render cards which is fetched from deck , after two more player get tied between them
  for (let dist of distributedCards) {
    for (let c of dist.cards) {
      let content = `<p class="card-text" style="color:${c.color}">${
        c.alias || c.seq
      } - ${c.deckName} (extra drawn for tie breaker)</p>`;
      $("#player_" + dist.name).append(content);
    }
  }
}

function decideWinner(plyrCards, deck) {
  // check for occurence of triplets, doublets, sequence or highest card , and return final winner
  let tripletResult = checkTriplets(plyrCards);
  if (tripletResult.isWinner) {
    return tripletResult.winner;
  }
  let sequenceResult = checkSequence(plyrCards, deck);
  if (sequenceResult.isWinner) {
    return sequenceResult.winner;
  }
  let doublesResult = checkDoubles(plyrCards, deck);
  if (doublesResult.isWinner) {
    return doublesResult.winner;
  }
  let highestCard = decideByHighestCard(plyrCards, deck);
  return highestCard.winner;
}

function checkTriplets(userCards) {
  // check users having triplets cards
  let resArr = [];
  for (let crd of userCards) {
    let isTriplets = isTripletsCards(crd.cards);
    if (isTriplets) {
      resArr.push(crd);
    }
  }
  if (resArr.length > 0) {
    let winner = getMaxValue(resArr, "value");
    return { isWinner: true, winner: winner };
  }
  return { isWinner: false };
}

function isTripletsCards(cards) {
  let vals = cards.map((as) => as.value);
  if (vals && vals[0] == vals[1] && vals[1] == vals[2]) {
    return true;
  }
  return false;
}

function getMaxValue(res, key) {
  // get maximun card value out of users cards , Ex: user1 cards[4,5,6] & user2 cards[6,7,J], this fn returns user2
  let maxIdx = 0;
  let maxVal;
  for (let r in res) {
    let crd = res[r].cards;
    for (let c in crd) {
      if (!maxVal) {
        maxVal = crd[c][key];
        continue;
      }
      if (maxVal && crd[c][key] > maxVal) {
        maxVal = crd[c][key];
        maxIdx = r;
      }
    }
  }
  return res[maxIdx];
}

function checkSequence(userCards, deck) {
  //returns user with highest sequence
  let resArr = [];
  for (let crd of userCards) {
    let isSeq = isSequence(crd.cards);
    if (isSeq) {
      resArr.push(crd);
    }
  }
  if (resArr.length == 1) {
    // let winner = getMaxValue(resArr, "seq");
    return { isWinner: true, winner: resArr[0] };
  }
  if (resArr.length > 1) {
    let psudoWinner = getMaxValue(resArr, "seq");
    let highestCard = sortAndGetMax(psudoWinner.cards);
    let userWithTie = getSequenceDuplication(highestCard, resArr);
    let winnerUser = higestTieBreaker(userWithTie, deck);
    return { isWinner: true, winner: winnerUser };
    // return {  winner: winner };
  }
  return { isWinner: false };
}

function getSequenceDuplication(highestCard, userCards) {
  let usrResult = [];
  for (let usr of userCards) {
    let maxCardVal = sortAndGetMax(usr.cards);
    if (isSequence(usr.cards) && maxCardVal == highestCard) {
      if (!checkCardPresent(usrResult, usr.name)) {
        usrResult.push(usr);
      }
    }
  }
  return usrResult;
}

function isSequence(cards) {
  let values = cards.map((as) => as.seq);
  values.sort(function (a, b) {
    return a - b;
  });
  let min = values[0];
  let max = values[values.length - 1];
  if (max - min + 1 == values.length) {
    return true;
  }
  return false;
}

function checkDoubles(userCards, deck) {
  // returns user having highest doublets
  let resArr = [];
  for (let crd of userCards) {
    let isDoublets = isDoubles(crd.cards);
    if (isDoublets) {
      resArr.push(crd);
    }
  }
  if (resArr.length == 1) {
    return { isWinner: true, winner: resArr[0] };
  }
  if (resArr.length > 1) {
    let updatedArr = removeThirdCardInDoublets(resArr);
    let psudoWinner = getMaxValue(updatedArr, "value");
    let highestCard = sortAndGetMax(psudoWinner.cards);
    let userWithTie = getDoublesDuplication(highestCard, updatedArr);
    let winnerUser = higestTieBreaker(userWithTie, deck);
    return { isWinner: true, winner: winnerUser };
    // return {  winner: winner };
  }

  return { isWinner: false };
}

function removeThirdCardInDoublets(usersCard) {
  let resArr = [...usersCard];
  for (let rs of resArr) {
    let idx = getThirdCardIdxInDoublets(rs.cards);
    rs.cards.splice(idx, 1);
  }
  return resArr;
}

function getThirdCardIdxInDoublets(cards) {
  let vals = cards.map((as) => as.value);
  if (vals[1] == vals[2]) {
    return 0;
  }
  if (vals[0] == vals[2]) {
    return 1;
  }

  if (vals[0] == vals[1]) {
    return 2;
  }
}

function getDoublesDuplication(highestCard, userCards) {
  // get those user having same doubles   Eg : user1 card [K,K] and user2 card [K,K]
  let usrResult = [];
  for (let usr of userCards) {
    let maxCardVal = sortAndGetMax(usr.cards);
    if (isDoubles(usr.cards) && maxCardVal == highestCard) {
      if (!checkCardPresent(usrResult, usr.name)) {
        usrResult.push(usr);
      }
    }
  }
  return usrResult;
}

function isDoubles(cards) {
  // check cards having doubles
  if (
    cards[0] &&
    cards[1] &&
    cards[2] &&
    (cards[0].value == cards[1].value ||
      cards[1].value == cards[2].value ||
      cards[0].value == cards[2].value)
  ) {
    return true;
  }
  return false;
}

function sortAndGetMax(cards) {
  // get users highest card value
  let vals = cards.map((as) => as.value);
  vals.sort(function (a, b) {
    return a - b;
  });
  return vals.pop();
}

function decideByHighestCard(userCards, deck) {
  let psudoWinner = getMaxValue(userCards, "value");
  let highestCard = sortAndGetMax(psudoWinner.cards);
  let userWithTie = getHighestCardDuplication(highestCard, userCards);
  let winnerUser = higestTieBreaker(userWithTie, deck);
  return { winner: winnerUser };
}

function higestTieBreaker(usersCard, deck) {
  if (usersCard.length == 1) {
    return usersCard[0];
  }
  let distributedCards = redistributeSingleCard(usersCard, deck);
  renderRedrawnCardsFromDeck(distributedCards);
  let winnerUser = getHighestWinners(distributedCards);
  return higestTieBreaker(winnerUser, deck);
}

function getHighestWinners(usersCards) {
  let maxCardVal = getMaxValue(usersCards, "value");
  let highestCard = sortAndGetMax(maxCardVal.cards);
  let userWithTie = getHighestCardDuplication(highestCard, usersCards);
  return userWithTie;
}

function redistributeSingleCard(users, deck) {
  // resdistribute cards to user for tie breaker
  let plyrs = [...users];
  for (let i = 0; i < 1; i++) {
    for (let plr of plyrs) {
      let idx = getRandomIndex(deck);
      plr.cards = [];
      if (deck[idx]) {
        let card = deck[idx];
        plr["cards"].push(card);
        deck.splice(idx, 1);
      }
    }
  }
  return plyrs;
}

function getHighestCardDuplication(highestCards, userCards) {
  let usrResult = [];
  for (let usr of userCards) {
    for (let crd of usr.cards) {
      if (crd.value == highestCards) {
        if (!checkCardPresent(usrResult, usr.name)) {
          usrResult.push(usr);
        }
      }
    }
  }
  return usrResult;
}

function checkCardPresent(arr, username) {
  let userExist = arr.filter((r) => r.name == username);
  if (userExist.length > 0) {
    return true;
  }
  return false;
}
