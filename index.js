#!/usr/bin/env node
'use strict';

function isEra({type}) {
	return type === 'era';
}

function isYear({type}) {
	return type === 'year';
}

const formatter = new Intl.DateTimeFormat('en-US-u-ca-japanese', {
	timeZone: 'Asia/Tokyo',
	era: 'narrow',
	year: 'numeric'
});
const reiwaDateExample = new Date(2020, 0);

if (formatter.formatToParts(reiwaDateExample).find(isEra).value !== 'R') {
	console.error(`Node.js currently running doesn't support the Reiwa era. In order for this program to work, try the following solutions step by step.

1. Install the latest version of Node.js.
2. Install the latest Japanese era localization data, mostly by upgrading the current operating system. If the system is up to date, wait for the OS vendor to include the latest localization data to the system.
3. If both 1. and 2. don't work, install the latest version of ICU http://userguide.icu-project.org/ and provide it to Node.js at runtime via --icu-data-dir or NODE_ICU_DATA.

Read https://nodejs.org/api/intl.html for more details about internationalization in Node.js.`);
	process.exitCode = 1;
} else {
	if (process.argv.length > 2) {
		const {inspect} = require('util');

		console.error(
			'(This program just shows the current year in the Reiwa era and doesn\'t have any options. The provided argument%s %s %s ignored.)',
			...process.argv.length === 3 ? ['', inspect(process.argv[2]), 'is'] : ['s', new Intl.ListFormat('en').format(process.argv.slice(2).map(arg => inspect(arg))), 'are']
		);

		process.exitCode = 9;
	}

	const parts = formatter.formatToParts();
	const era = parts.find(isEra).value;

	if (era !== 'R') {
		const longEraFormatter = new Intl.DateTimeFormat(['ja-JP-u-ca-japanese', 'en-US-u-ca-japanese'], {
			timeZone: 'Asia/Tokyo',
			era: 'long'
		});

		console.log(`The current Japanese era is not ${longEraFormatter.formatToParts(reiwaDateExample).find(isEra).value} but ${longEraFormatter.formatToParts().find(isEra).value}.`);
		process.exitCode = 19;
	} else {
		console.log(parts.find(isYear).value);
	}
}
