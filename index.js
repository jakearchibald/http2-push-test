const spdy = require('spdy');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync(__dirname + '/cert/private.key'),
  cert: fs.readFileSync(__dirname + '/cert/certificate.pem')
};

app.get('/data', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'no-cache');
  res.send('NOT FROM PUSH');
});

app.get('/no-cache/data', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'no-cache');
  res.send('NOT FROM PUSH');
});

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

app.get('/img/', (req, res) => {
  const stream = res.push('/img/cat.svg', {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'image/svg+xml',
      'cache-control': 'max-age=3000'
    }
  });

  let pushErrored = false;

  stream.on('error', err => {
    pushErrored = true;
    console.log('Push error', err);
  });

  stream.on('data', chunk => {
    console.log('Push data', chunk);
  });

  (async() => {
    await wait(1000);
    if (!pushErrored) {
      fs.createReadStream(__dirname + '/resources/cat.svg').pipe(stream);
    }
  })();

  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/resources/img.html');
});
 
app.get('/', (req, res) => {
  const stream = res.push('/data', {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'text/plain',
      'cache-control': 'max-age=3000'
    }
  });

  let pushErrored = false;

  stream.on('error', err => {
    pushErrored = true;
    console.log('Push error', err);
  });

  stream.on('data', chunk => {
    console.log('Push data', chunk);
  });

  (async () => {
    for (let i = 0; i < 4; i++) {
      if (pushErrored) break;
      const val = Math.random().toString();
      console.log(`pushing: ${val}`);
      stream.write(val + '\n');
      await wait(1000);
    }
    stream.end();
    console.log('push complete')
  })();

  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/resources/fetch.html');
});

app.get('/no-cache/', (req, res) => {
  const stream = res.push('/no-cache/data', {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'text/plain',
      'cache-control': 'no-cache'
    }
  });

  let pushErrored = false;

  stream.on('error', err => {
    pushErrored = true;
    console.log('Push error', err);
  });

  stream.on('data', chunk => {
    console.log('Push data', chunk);
  });

  (async () => {
    for (let i = 0; i < 4; i++) {
      if (pushErrored) break;
      const val = Math.random().toString();
      console.log(`pushing: ${val}`);
      stream.write(val + '\n');
      await wait(1000);
    }
    stream.end();
    console.log('push complete')
  })();

  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/resources/fetch.html');
});

const server = spdy.createServer(options, app);

server.listen(3001);