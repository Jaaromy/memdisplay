const CLI = require('clui');
const clc = require('cli-color');
const keypress = require('keypress');
keypress(process.stdin);
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const file = 'e:/git/privacy.collector/db.json';

CLI.Clear();

function toscreen() {
	CLI.Clear();
	const adapter = new FileSync(file);
	const db = low(adapter);
	let Line = CLI.Line;
	let LineBuffer = CLI.LineBuffer;

	let outputBuffer = new LineBuffer({
		x: 0,
		y: 0,
		width: 'console',
		height: 'console'
	});

	let message = new Line(outputBuffer)
		.column('Memory Watcher', 20, [clc.green])
		.fill()
		.store();

	let headers = new Line(outputBuffer)
		.padding(2)
		.column('Max MB', 20, [clc.cyanBright])
		.column('Min MB', 20, [clc.cyanBright])
		.column('Est Base MB', 20, [clc.cyanBright])
		.column('Current Base MB', 20, [clc.cyanBright])
		.column('Usage Trend', 20, [clc.cyanBright])
		.column('Data.json MB', 20, [clc.cyanBright])
		.column('Stat Count', 20, [clc.cyanBright])
		.fill()
		.store();

	let max = 0;
	let min = 0;
	let estimatedBase = 0;
	let currentBase = 0;
	let usageTrend = 0;
	let statCount = db.get('stats').size().value();

	if (statCount !== 0) {
		// statMaxHigh = (db.get('stats')
		// 	.orderBy(['max'], 'desc')
		// 	.take(1)
		// 	.value()[0].max / 1048576);

		// statMaxLow = (db.get('stats')
		// 	.orderBy(['max'], 'asc')
		// 	.take(1)
		// 	.value()[0].max / 1048576);
		max = (db.get('stats')
			.last()
			.value().max / 1048576);

		min = (db.get('stats')
			.last()
			.value().min / 1048576);

		estimatedBase = (db.get('stats')
			.last()
			.value().estimated_base / 1048576);

		currentBase = (db.get('stats')
			.last()
			.value().current_base / 1048576);

		usageTrend = (db.get('stats')
			.last()
			.value().usage_trend);
	}

	let line = new Line(outputBuffer)
		.padding(2)
		.column(max.toFixed(3), 20)
		.column(min.toFixed(3), 20)
		.column(estimatedBase.toFixed(3), 20)
		.column(currentBase.toFixed(3), 20)
		.column(usageTrend.toFixed(3), 20)
		.column((fs.statSync(file).size / 1048576).toFixed(3), 20)
		.column(statCount.toString(), 20)
		.fill()
		.store();

	let changeHeaders = new Line(outputBuffer)
		.padding(2)
		.column('Latest Change', 20, [clc.cyanBright])
		.column('First After', 20, [clc.cyanBright])
		.column('Latest After', 20, [clc.cyanBright])
		.fill()
		.store();

	let change = '';
	let firstAfter = '';
	let latestAfter = '';
	let diffCount = db.get('diff').size().value();

	if (diffCount !== 0) {
		change = (db.get('diff')
			.last()
			.value().change.size);

		firstAfter = (db.get('diff')
			.first()
			.value().after.size);

		latestAfter = (db.get('diff')
			.last()
			.value().after.size);

	}

	let changeLine = new Line(outputBuffer)
		.padding(2)
		.column(change, 20)
		.column(firstAfter, 20)
		.column(latestAfter, 20)
		.fill()
		.store();

	let detailHeaders = new Line(outputBuffer)
		.padding(2)
		.column('What', 20, [clc.cyanBright])
		.column('Size', 20, [clc.cyanBright])
		.column('+', 20, [clc.cyanBright])
		.column('-', 20, [clc.cyanBright])
		.fill()
		.store();

	let details = [];

	if (diffCount !== 0) {
		details = (db.get('diff')
			.last()
			.value().change.details);

		for (let i = 0; i < details.length; i++) {
			let det = details[i];
			let ln = new Line(outputBuffer)
				.padding(2)
				.column(det.what, 20)
				.column(det.size, 20)
				.column(det['+'].toString(), 20)
				.column(det['-'].toString(), 20)
				.fill()
				.store();
		}

		firstAfter = (db.get('diff')
			.first()
			.value().after.size);

		latestAfter = (db.get('diff')
			.last()
			.value().after.size);

	}


	outputBuffer.output();
}

toscreen();

process.stdin.on('keypress', function (ch, key) {
	if (key && key.ctrl && key.name === 'r') {
		const adapter = new FileSync(file);
		const db = low(adapter);
		db.get('stats')
			.remove()
			.write();

		db.get('diff')
			.remove()
			.write();
	} else if (key && key.ctrl && key.name === 'c') {
		process.exit(0);
	}


});

fs.watchFile(file, (curr, prev) => {
	if (curr.mtimeMs - prev.mtimeMs > 1000) {
		toscreen();
	}
});

process.on('exit', () => {
	fs.unwatchFile(file);
});

//setInterval(toscreen, 2000);
