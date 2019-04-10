#!/usr/bin/env node
'use strict';

if (!new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {era: 'long'}).format(new Date(0)).startsWith('昭和')) {
	console.error('Node.js currently running doesn\'t support Japanese date localization. In order for this program to work, install Japanese ICU to the operating system or build Node.js with embedding the ICU and use it. Read https://nodejs.org/api/intl.html for more details about internationalization in Node.js.');
	process.exit(1);
}

const parts = new Map(new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
	era: 'long',
	year: 'numeric',
	timeZone: 'Asia/Tokyo'
}).formatToParts().map(({type, value}) => [type, value]));

if (process.argv.length > 2) {
	const {inspect} = require('util');

	console.error(
		'(This program just shows the current year in the Reiwa era and has no available command-line flags. The provided argument%s %s %s ignored.)',
		...process.argv.length === 3 ? ['', inspect(process.argv[2]), 'is'] : ['s', inspect(process.argv.slice(2), {breakLength: Infinity}).replace(/^\[ (?<args>.*) \]$/u, '$<args>'), 'are']
	);

	process.exitCode = 9;
}

if (parts.get('era') !== '令和') {
	console.log(`The current Japanese period is not 令和 but ${parts.get('era')}.`);
	process.exit(19);
}

console.log(parts.get('year'));
