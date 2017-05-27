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

app.get('/preload-img/cat.svg', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'no-cache');
  res.sendFile(__dirname + '/resources/cat.svg');
});

app.get('/preload-and-push/img/cat.svg', (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'no-cache');
  res.sendFile(__dirname + '/resources/cat.svg');
});

app.get('/:dir/data', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'no-cache');
  let errored = false;

  res.on('error', err => {
    errored = true;
    console.log('Send error', err);
  });

  (async () => {
    for (let i = 0; i < 4; i++) {
      if (errored) break;
      const val = Math.random().toString();
      console.log(`sending: ${val}`);
      res.write(val + '\n');
      await wait(1000);
    }
    res.end();
    console.log('send complete')
  })();
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
    await wait(5000);
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

app.get('/cross-origin-push/', (req, res) => {
  const stream = res.push('/', {
    host: 'www.example.com:3001',
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'text/plain',
      'cache-control': 'max-age=3000',
      'Access-Control-Allow-Origin': 'https://localhost:3001',
      'Access-Control-Allow-Credentials': 'true'
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
  res.sendFile(__dirname + '/resources/cross-origin-push.html');
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

app.get('/preload-and-push/', (req, res) => {
  const stream = res.push('/preload-and-push/data', {
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
  res.set('Link', '</preload-and-push/data>; rel=preload');
  res.sendFile(__dirname + '/resources/fetch.html');
});

app.get('/preload-and-push/img/', (req, res) => {
  const stream = res.push('/preload-and-push/img/cat.svg', {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'image/svg+xml',
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
    await wait(5000);
    if (!pushErrored) {
      fs.createReadStream(__dirname + '/resources/cat.svg').pipe(stream);
    }
  })();

  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.set('Link', '</preload-and-push/img/cat.svg>; rel=preload');
  res.sendFile(__dirname + '/resources/img.html');
});

app.get('/preload-fetch/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/resources/preload-fetch.html');
});

app.get('/preload-img/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/resources/preload-img.html');
});

const server = spdy.createServer(options, app);

server.listen(3001);