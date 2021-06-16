const fs = require('fs');
const Sentencer = require('sentencer');

class Markov {
  constructor() {
    this.wordPairs = {};
    // Converts file to bytes to string to array of words
    const words = fs.readFileSync('./sentences.txt').toString().toLowerCase().replace(/\./g, "").split(/\r\n| /);
    for(let i = 0; i < words.length - 4; i += 4) {
      // Break words into two 2-word groups (2-gram sequences)
      const group1 = `${words[i]} ${words[i + 1]}`;
      const group2 = `${words[i + 2]} ${words[i + 3]}`;
      // Add word to array if it exists in wordPairs
      if(group1 in this.wordPairs) {
        this.wordPairs[group1].push(group2);
      // Create the word array otherwise
      } else {
        this.wordPairs[group1] = [group2];
      }
    }
  }

  generate(minPairs, maxPairs, hideWord) {
    let chain = [this.getRandom(Object.keys(this.wordPairs))];
    while(chain.length / 2 < maxPairs) {
      // Choose a random next word
      const possibleWords = this.wordPairs[chain[chain.length - 1]];
      if(possibleWords) {
        chain.push(this.getRandom(possibleWords));
      } else if(chain.length / 2 < minPairs) {
        chain.push(this.getRandom(Object.keys(this.wordPairs)));
      } else {
        break;
      }
    }

    // Fixes sentences that end with prepositions and adjectives
    const lastNoun = Sentencer.make(`{{ noun }}`);
    // Capitalize first letter of generated card
    chain[0] = chain[0].charAt(0).toUpperCase() + chain[0].slice(1);
    if(hideWord) {
      chain[Math.floor(Math.random() * chain.length)] = "___";
    }
    return `${chain.join(" ")} ${lastNoun}`;
  }

  getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

const markov = new Markov();
module.exports = markov;