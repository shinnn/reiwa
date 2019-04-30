import {dirname, join} from 'path';
import {execFile as originalExecFile} from 'child_process';
import {fileURLToPath} from 'url';
import {promisify} from 'util';

import libfaketimeEnv from 'libfaketime-env';
import test from 'tape';
import packageJson from './package.json';

const execFile = promisify(originalExecFile);
const node = process.execPath;
const projectDir = dirname(fileURLToPath(import.meta.url));
const reiwa = join(projectDir, packageJson.bin);

test('The `reiwa` command', async t => {
	t.plan(12);

	const env = {...process.env, ...await libfaketimeEnv()};

	(async () => {
		const {stderr, stdout} = await execFile(node, [reiwa], {
			env: {
				...env,
				FAKETIME: '2020-01-01 00:00:00',
				TZ: 'Asia/Tokyo'
			}
		});

		t.equal(
			stdout,
			'2\n',
			'should print the current year in the Reiwa period.'
		);

		t.equal(
			stderr,
			'',
			'should write nothing to the stderr when there is no problem.'
		);
	})();

	(async () => {
		try {
			await execFile(node, [reiwa, '--unknown'], {
				env: {
					...env,
					FAKETIME: '2019-05-01 00:00:00',
					TZ: 'Asia/Tokyo'
				}
			});
			t.fail('Unexpectedly succeeded.');
		} catch ({code, stderr, stdout}) {
			t.equal(
				stdout,
				'1\n',
				'should print 1 instead of 元 in 2019.'
			);

			t.equal(
				stderr,
				'(This program just shows the current year in the Reiwa era and doesn\'t have any options. The provided argument \'--unknown\' is ignored.)\n',
				'should show a warning when an extra flag is provided.'
			);

			t.equal(
				code,
				9,
				'should exit with code 9.'
			);
		}
	})();

	(async () => {
		try {
			await execFile(node, [reiwa, '--unknown0', '--unknown1'], {
				env: {
					...env,
					FAKETIME: '2019-05-01 00:00:00',
					// PGT (Papua New Guinea Time): UTC+10:00, JST+01:00
					TZ: 'Pacific/Port_Moresby'
				}
			});
			t.fail('Unexpectedly succeeded.');
		} catch ({code, stderr, stdout}) {
			t.ok(
				/^The current Japanese era is not (?:令和|Reiwa) but (?:平成|Heisei)\.\n$/u.test(stdout),
				'should print no year when it\'s not the Reiwa period.'
			);

			t.equal(
				stderr,
				'(This program just shows the current year in the Reiwa era and doesn\'t have any options. The provided arguments \'--unknown0\', \'--unknown1\' are ignored.)\n',
				'should show a warning when extra flags are provided.'
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
			if (process.env.TRAVIS) {
				await execFile(join(projectDir, 'node-v12.0.0-linux-x64', 'bin', 'node'), [reiwa], {
					env: {
						NODE_V8_COVERAGE: process.env.NODE_V8_COVERAGE
					}
				});
			} else {
				const image = 'node:12.0.0-alpine';

				await execFile('docker', ['pull', image]);
				await execFile('docker', [
					'run',
					'--rm',
					`--volume=${projectDir}:${projectDir}`,
					`--workdir=${projectDir}`,
					'--env',
					`NODE_V8_COVERAGE=${process.env.NODE_V8_COVERAGE}`,
					image,
					'node',
					reiwa
				]);
			}

			t.fail('Unexpectedly succeeded.');
		} catch ({code, stderr, stdout}) {
			t.equal(
				code,
				1,
				'should exit with a fatal signal when the Reiwa era is not supported.'
			);

			t.ok(
				stderr.startsWith('Node.js currently running doesn\'t support the Reiwa era.'),
				'should show a message when the Reiwa era is not supported.'
			);

			t.ok(
				stderr.endsWith('Read https://nodejs.org/api/intl.html for more details about internationalization in Node.js.\n'),
				'should show a link to the Node.js documentation when the Reiwa era is not supported.'
			);

			t.equal(
				stdout,
				'',
				'should write nothing to the stdout when the Reiwa era is not supported.'
			);
		}
	})();
});
