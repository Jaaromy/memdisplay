let CLI = require('clui');
let clc = require('cli-color');
let jsonfile = require('jsonfile');
let fs = require('fs');

CLI.Clear();

let file = 'e:/git/privacy.collector/data.json';

function toscreen() {
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
		.column('Highest Max MB', 20, [clc.cyan])
		.column('Data.json MB', 20, [clc.cyan])
		.column('Stat Count', 20, [clc.cyan])
		.fill()
		.store();

	let val = {
		stats: [],
		diff: []
	};

	try {
		val = jsonfile.readFileSync(file);
	} catch (e) {
		val = {
			stats: [],
			diff: []
		};
	}

	val.stats.sort((a, b) => {
		return a.max - b.max;
	});

	let line = new Line(outputBuffer)
		.padding(2)
		.column((val.stats[val.stats.length - 1].max / 1048576).toFixed(3), 20)
		.column((fs.statSync(file).size / 1048576).toFixed(3), 20)
		.column(val.stats.length.toString(), 20)
		.fill()
		.store();

	jsonfile.writeFileSync(file, val, {
		spaces: 2
	});

	outputBuffer.output();
}

setInterval(toscreen, 2000);
