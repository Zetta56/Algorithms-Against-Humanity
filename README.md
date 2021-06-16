# Algorithms Against Humanity

![Game](/docs/images/game.PNG)

Algorithms Against Humanity (a.k.a. AAH) is my custom Cards Against Humanity spinoff that uses the power of Websockets and Markov Chains.
This version also implements rooms and bots for both singleplayer and multiplayer needs.

**A live demo can be found here: https://a-a-h.glitch.me/**

## Requirements
1. [npm](https://www.npmjs.com/get-npm)
2. [Node.js](https://nodejs.org/en/download/)

## Usage
1. Run `git clone https://github.com/Zetta56/AAH.git` in your desired folder destination.
2. Add a `.env` file in the root with the following:
```
JWT_SECRET="[your string key goes here]"
```
2. Run `npm install` in the client and root directories to install required dependencies
3. Run `npm run build` in the client directory to build the client
4. Run `node server.js` in the root directory to start the app

## Development
- Instead of building the client, you can run `npm run serve` to start the Vue development server.
- You can edit `sentences.txt` to change the dataset used by the markov chain.
