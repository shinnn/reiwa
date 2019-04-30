# reiwa

[![npm version](https://img.shields.io/npm/v/reiwa.svg)](https://www.npmjs.com/package/reiwa)
[![Build Status](https://travis-ci.com/shinnn/reiwa.svg?branch=master)](https://travis-ci.com/shinnn/reiwa)
[![codecov](https://codecov.io/gh/shinnn/reiwa/branch/master/graph/badge.svg)](https://codecov.io/gh/shinnn/reiwa)

A command-line tool to show the current year in the new Japanese era [令和 (Reiwa)](https://japan.kantei.go.jp/98_abe/statement/201904/_00001.html)

## Usage

Make sure you have [install](https://nodejs.org/en/download/)ed [Node.js](https://nodejs.org/), and run `npx reiwa`:

```console
$ npx -q reiwa # at May 1, 2019 in JST (the Japan Standard Time)
1

$ npx -q reiwa # at April 30, 2019 in JST
The current Japanese era is not 令和 but 平成.
```

## License

[ISC License](./LICENSE) © 2019 Shinnosuke Watanabe
