'use strict';

const {basename, dirname, join} = require('path');
const originalExecFile = require('child_process').execFile;
const {promisify} = require('util');

const test = require('tape');

const execFile = promisify(originalExecFile);
const [node] = process.argv;
const reiwa = require.resolve(join(__dirname, require('./package.json').bin));

test('A `reiwa` command', async t => {
	if (process.platform !== 'linux' && process.platform !== 'darwin') {
		t.comment('The test cannot be run on this system as libfaketime only supports Linux and macOS.');
		t.end();

		return;
	}

	t.plan(8);

	const env = {...process.env};

	if (process.platform === 'linux') {
		env.LD_PRELOAD = (await execFile('dpkg', ['--listfiles', 'libfaketime'])).stdout.split('\n').find(path => basename(path) === 'libfaketime.so.1');
	} else {
		env.DYLD_FORCE_FLAT_NAMESPACE = '1';
		env.DYLD_INSERT_LIBRARIES = `${(await execFile('brew', ['--prefix', 'libfaketime'])).stdout.trim()}/lib/faketime/libfaketime.1.dylib`;
	}

	try {
		env.NODE_ICU_DATA = dirname(require.resolve('full-icu/package.json'));
	} catch {}

	/*
	(async () => {
		const {stderr, stdout} = await execFile(node, [reiwa], {
			env: {
				...env,
				FAKETIME: '2019-05-01 00:00:00',
				TZ: 'Asia/Tokyo'
			}
		});

		t.equal(
			stdout,
			'1\n',
			'should print the current year in the Reiwa period.'
		);

		t.equal(
			stderr,
			'',
			'should write nothing to the stderr even when there is no problem.'
		);
	})();
	*/

	(async () => {
		try {
			await execFile(node, [reiwa], {
				env: {
					...env,
					FAKETIME: '2019-05-01 00:00:00',
					// PGT (Papua New Guinea Time): UTC+10:00
					TZ: 'Pacific/Port_Moresby'
				}
			});
			t.fail('Unexpectedly succeeded.');
		} catch ({code, stderr, stdout}) {
			t.equal(
				stdout,
				'The current Japanese period is not 令和 but 平成.\n',
				'should print no year when it\'s not the Reiwa period.'
			);

			t.equal(
				stderr,
				'',
				'should write nothing to the stderr even when it\'s not the Reiwa period.'
			);

			t.equal(
				code,
				19,
				'should exit with code 19 when it\'s not the Reiwa period.'
			);
		}
	})();

	(async () => {
		try {
			await execFile(node, [reiwa, '--unknown'], {
				env: {
					...env,
					FAKETIME: '1989-01-08 00:00:00',
					// PGT (Papua New Guinea Time): UTC+10:00
					TZ: 'Pacific/Port_Moresby'
				}
			});
			t.fail('Unexpectedly succeeded.');
		} catch ({stderr, stdout}) {
			t.ok(
				stdout.endsWith('but 昭和.\n'),
				'should print the current period when it\'s not the Reiwa period.'
			);

			t.equal(
				stderr,
				'(This program just shows the current year in the Reiwa era and has no available command-line flags. The provided argument \'--unknown\' is ignored.)\n',
				'should show a warning when an extra flag is provided.'
			);
		}
	})();

	(async () => {
		try {
			if (process.env.TRAVIS) {
				await execFile(node, [reiwa], {
					env: {
						...env,
						NODE_ICU_DATA: ''
					}
				});
			} else {
				await execFile('docker', ['pull', 'node:alpine']);
				await execFile('docker', [
					'run',
					'--rm',
					`--volume=${__dirname}:${__dirname}`,
					`--workdir=${__dirname}`,
					'node:alpine',
					require.resolve('./node_modules/.bin/nyc'),
					'--clean=0',
					'--silent',
					reiwa
				]);
			}

			t.fail('Unexpectedly succeeded.');
		} catch ({code, stderr, stdout}) {
			t.equal(
				code,
				1,
				'should exit with a fatal signal.'
			);

			t.ok(
				stderr.startsWith('Node.js currently running doesn\'t support Japanese date localization'),
				'should promote ICU installation.'
			);

			t.equal(
				stdout,
				'',
				'should write nothing to the stdout.'
			);
		}
	})();
});
