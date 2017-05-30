# To install

You need a relatively recent version of node (eg 7.9.0, but may work in earlier versions).

```sh
npm install
```

# To run

Ensure `cert/certificate.pem` is trusted by the browser. The best way to do this is to add it to the OS keychain. However, you should remove/disable it after testing, as the private key is in this repo.

```sh
npm run dev
```

This will set up an HTTP/2 HTTPS server on port 3001. Edit `index.js` if you want to change the port.

# `/`

This slowly pushes `/data` which contains 4 random numbers, and has `max-age=3000`.

`/data`, if requested from the server, returns "NOT FROM PUSH".

The page contains various ways to fetch `/data`, or refetch the page itself.

# `/no-cache/`

As `/`, but the pushed resource has `no-cache` rather than `max-age`.

# `/no-store/`

As `/`, but the pushed resource has `no-store` rather than `max-age`.

# `/img/`

This slowly pushes `/img/cat.svg` and has `max-age=3000`.

`/img/cat.svg`, if requested from the server, is a 404.

# `/cross-origin-push/`

This slowly pushes 4 random numbers to `https://www.example.com:3001/`, and has `max-age=3000`. `www.example.com` is a SAN, so the push should work.

The page contains button to fetch `https://www.example.com:3001/`, which won't pick up the pushed resource unless you use your hosts file to make `example.com` resolve to `127.0.0.1`.

# `/vary-cookie/`

This slowly pushes 4 random numbers. The push's request has `Cookie: val=a`, and the response has `Vary: Cookie`. Buttons on the page allow you to set the cookie.

# `/push-post/`

This slowly pushes 4 random numbers. The push's request has a method of `POST`.

# `/preload-fetch/`

Uses `<link rel="preload">` to preload `/preload-fetch/data`.

# `/preload-img/`

Uses `<link rel="preload">` to preload `/preload-img/cat.svg`.

# `/preload-and-push/`

Pushes `/preload-and-push/data`, but also has a `Link rel=preload` header for the same resource.

# `/preload-and-push/img/`

As above, but pushes and preloads `/preload-and-push/img/cat.svg`.