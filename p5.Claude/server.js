// --------------------------------------------------------------------------------
// P5js + Node server with websockets and the Claude API
//
// Jérémie Wenger, 2025
// With Robin Leverton and Nathan Bayliss, in the context of *Tech, Tea + Exchange*:
// A residency in partnership with Tate, Anthropic, Goldsmiths and UAL
// --------------------------------------------------------------------------------

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

// Authentication, two ways: environment or a file
// -----------------------------------------------
// 1) Synchronous file read, cf.
// https://nodejs.dev/en/learn/reading-files-with-nodejs/ (and GPT :>) let
// secretOpenAIKey;

let secretAnthropicKey;

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const data = fs.readFileSync(__dirname + '/secret.txt');
  secretAnthropicKey = data.toString().trim();
} catch (err) {
  console.error(err);
}

// 2) local environment
//    for this, you need to define the variable in your terminal before launching node:
//    export ANTHROPIC_API_KEY=...
if (!secretAnthropicKey) {

  console.log('configuration through the `secret.txt` file, trying the environment variable');

  secretAnthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!secretAnthropicKey) {
    console.log('---------------------------------------------------------------------------------');
    console.log('could not access the secret API key, please read `readme.md` on how to configure!');
    console.log('---------------------------------------------------------------------------------');
    process.exit(2);
  } else {
    console.log('configuration through the environment variable successful!');
  }

} else {
  console.log('configuration through the secret text file successful!');
}

const anthropic = new Anthropic({
  apiKey: secretAnthropicKey,
});

// // to see all available models in the terminal
// // (the official list can be found here: https://platform.anthropic.com/docs/models/overview)
// async function listEngines() {
//   return await anthropic.models.list();
// }
// console.log('requesting engines');
// const response = listEngines().then(r => {
//   console.log(r);
//   console.log('done');
//   process.exit(2);
// });

// https://socket.io/get-started/chat#integrating-socketio
// See also Dan Shiffman's tutorial on Node & Websockets for more information
// https://www.youtube.com/watch?v=bjULmG8fqc8&list=PLRqwX-V7Uu6b36TzJidYfIYwTFEq3K5qH

import express from 'express';
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = app.listen(port, () => {
    console.log(`it works. listening on port ${server.address().port}`);
}); // https://stackoverflow.com/a/4842885

// make our 'public' folder visible to the outside world
app.use(express.static('public'));

const io = new Server(server);

io.on('connection', (socket) => {

  console.log(`connection! id: ${socket.id}`);
  // console.log(socket);

  io.emit('message', 'hello');
  // console.log('sent message');

  socket.on('chat request', (message, sock) => {
    console.log(`chat requested by user:`);
    console.log(message);
    sock('the server received your chat request');
    console.log('making request to the model...');
    requestMessage(...Object.values(message))
      .then((response) => {
        // console.log(response); // see the full horror of the response object
        const t = response.content[0].text;
        console.log('it answered!');
        console.log(response.content);
        io.emit('chat response', t);
      })
      .catch((e) => {
        io.emit('chat response', "");
        console.error(e);
      });
  });

  socket.on('image request', (message, sock) => {
    console.log(`image analysis requested by user, with the prompt:`);
    console.log(message.prompt);
    sock('the server received your image request');
    console.log('making request to the model...');
    requestImageAnalysis(...Object.values(message))
      .then((response) => {
        // console.log(response); // see the full horror of the response object
        const t = response.content[0].text;
        console.log('it answered!');
        console.log(response);
        io.emit('image response', t);
      })
      .catch((e) => {
        io.emit('image response', "");
        console.error(e);
      });
  });

});

// separate async function (required if we want to use the await keyword)
// this allows us to make a call to the API, and wait for it to respond
// without breaking our code

async function requestMessage(
  prompt = 'Say this is a test',
  system_prompt = 'You are William Shakespeare and speak like in the 1590s.',
  max_tokens = 7,
  temperature = 0.7,
) {
  // console.log('inside requestChat', prompt, system_prompt, max_tokens, temperature);
  return await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // Replace with your preferred model
    max_tokens: parseInt(max_tokens),
    temperature: parseFloat(temperature),
    system: system_prompt,
    messages: [
      { role: 'user', content: prompt }
    ],
  });
}

async function requestImageAnalysis(base64Image, prompt, system_prompt) {

  // console.log('inside requestImageAnalysis:');
  // console.log(prompt, system_prompt);

  return await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // Replace with your preferred model
    system: system_prompt,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png', // Adjust if your image is a different format
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });
}
