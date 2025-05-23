# Source

The template for this app was first inspired by [this example](https://lab.arts.ac.uk/books/web-technology/page/web-app-template-for-beginners), and completed by the following resources:

- The official Socket.io [Get started](https://socket.io/get-started/chat), [Server](https://socket.io/docs/v4/server-api/) and [Client](https://socket.io/docs/v4/client-api/) pages;
- The lovely tutorial by [Dan Shiffman](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6b36TzJidYfIYwTFEq3K5qH).

See also the [Anthropic API reference](https://docs.anthropic.com/en/docs/welcome).

---

## NPM

Install [nvm](https://www.npmjs.com/package/@anthropic-ai/sdk) (the Node Version Manager) that will install and manage `npm` and `node` for you.

First, install the packages:

```bash
cd p5.Claude/
npm install
```

## API Key

You need to generate an API key to interact with Claude:
- go to the [console](https://console.anthropic.com/);
- click on 'Get API keys';
- finally, 'Create Key'. You will be able to copy the key and store it locally.

You then need the program to know how to access this variable, either by setting it as an environment variable in the terminal, or by saving it in a file.

1. Saved in a file

Save your secret API key in `secret.txt`.

If you wish to use the file, paste the key into it and save it.

It is then recommended to tell Git to ignore this file and keep its content unchanged, so that you don't add it by mistake to your fork:

```bash
git update-index --skip-worktree p5.Claude/secret.txt
```

2. Environment variable:

```bash
export ANTHROPIC_API_KEY=`cat $the/file/with/the/key.txt`
```

Or:

```bash
export ANTHROPIC_API_KEY=`theCrazyLongAPIKey`
```

(You could also have the above line saved in your `.bashrc` or `.zshrc` in the home directory (`~`) on Mac and Linux.)

## Running the server

This sketch requires you to have npm installed, and to use the plain `node server.js` command or 'nodemon server.js' (that reloads the server whenever you save changes).

```bash
node server.js
```

Or

```bash
nodemon server.js
```
