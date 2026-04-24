// no import $aliases
import { msg } from '$lib/vars';

const INTERVAL = 1000;

let sendTickEverySecond = true;

let min = 0;
let sec = 0;
// let startAt;

/**
 * @param {number | string | undefined} value
 */
function toTimePart(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return 0;
	return Math.max(0, Math.floor(parsed));
}

function normalizeMinuteSecond() {
	if (sec >= 60) {
		min += Math.floor(sec / 60);
		sec = sec % 60;
	}
}

/** @type {ReturnType<setInterval>} */
let reminderID;
function startReminder() {
	reminderID = setInterval(() => {
		// console.log('reminde me');
		postMessage({ mes: msg.remindTimerEnded });
	}, 5 * 60 * INTERVAL);
}
function stopReminder() {
	clearInterval(reminderID);
}

function tick() {
	if (min === 0 && sec === 0) {
		postMessage({ mes: msg.finish });
		stopTimer();
		startReminder();
		// const endAt = performance.now();
		// console.log({ startAt, endAt, diff: endAt - startAt });

		return;
	}

	if (sec === 0) {
		min = min - 1;
		sec = 59;
	} else {
		sec = sec - 1;
	}

	if (sendTickEverySecond) {
		postMessage({ mes: msg.tick, min, sec });
	} else if (sec % 5 == 0) {
		postMessage({ mes: msg.tick, min, sec });
	}
}

/** @type {ReturnType<setInterval>} */
let intervalID;
function startTimer() {
	clearInterval(intervalID);
	intervalID = setInterval(tick, INTERVAL);
}
function stopTimer() {
	clearInterval(intervalID);
}

self.onmessage = handle;
/** @param {{ data: { mes: string; min?: number; sec?: number; }; }} e */
function handle(e) {
	// console.log({ w: e.data });
	if (e.data.mes == msg.visible) {
		sendTickEverySecond = true;
		return;
	}

	if (e.data.mes == msg.hidden) {
		sendTickEverySecond = false;
		return;
	}

	if (reminderID) {
		// console.log('stop reminder');
		stopReminder();
	}

	if (e.data.mes == msg.resume) {
		startTimer();
	}

	if (e.data.mes == msg.stop) {
		stopTimer();
	}

	if (e.data.mes == msg.start) {
		min = toTimePart(e.data.min);
		sec = toTimePart(e.data.sec);
		normalizeMinuteSecond();

		// startAt = performance.now();
		startTimer();
	}

	if (e.data.mes == msg.set) {
		min = toTimePart(e.data.min ?? min);
		sec = toTimePart(e.data.sec ?? sec);
		normalizeMinuteSecond();
		postMessage({ mes: msg.tick, min, sec });
	}
}

export {};
