Predictable Farm — Proxy
---

### Introduction

This is the authentication proxy for predictable farm. It sits before the authentication bridge (see [here](https://github.com/airliquide/predictable.farm.authentication-bridge)) that grants access to the underlying server. Once the authentication is done, the proxy redirects to the correct instance for the requested farm.

This proxy uses the [redbird](https://www.npmjs.com/package/redbird) reverse proxy.

### Installation

    npm install

Copy `config.json.dist`  to  `config.json` and change the values for the servers as needed.

### Run

    node index.js

### Licenses

Our work is licensed under the MIT license. See license.txt.

**This work uses sofware that is licensed under the BSD 2-Clause "Simplified" License. The respective files have kept their original license notices.**