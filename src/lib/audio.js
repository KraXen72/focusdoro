import { Howl, Howler } from 'howler';
import { base } from '$app/paths';

export const audio = new Howl({
	src: [`${base}/flute.wav`],
	html5: true,
	preload: true
});

let is_alarm_permission_ready = false;

export function ensureAlarmPermission() {
	if (is_alarm_permission_ready) {
		return;
	}

	/** @type {any} */
	const howl = audio;
	/** @type {{ ctx?: AudioContext }} */
	const howler_global = /** @type {any} */ (Howler);

	const unlock_with_silent_play = () => {
		const was_muted = howl.mute();
		howl.mute(true);
		const id = howl.play();

		if (id === null) {
			howl.mute(was_muted);
			return;
		}

		howl.once('play', () => {
			howl.stop(id);
			howl.mute(was_muted);
			is_alarm_permission_ready = true;
		});

		howl.once('playerror', () => {
			howl.mute(was_muted);
		});
	};

	if (howler_global.ctx && howler_global.ctx.state === 'suspended') {
		howler_global.ctx.resume().then(unlock_with_silent_play).catch(() => {
			unlock_with_silent_play();
		});
		return;
	}

	unlock_with_silent_play();
}

export function playAlarm() {
	/** @type {any} */
	const howl = audio;
	/** @type {{ ctx?: AudioContext }} */
	const howler_global = /** @type {any} */ (Howler);
	const play_now = () => {
		howl.stop();
		howl.play();
	};

	// Retry once the browser unlocks audio (autoplay policy).
	howl.once('playerror', (/** @type {number} */ _id, /** @type {unknown} */ err) => {
		console.error('Alarm play failed:', err);
		howl.once('unlock', play_now);
	});

	if (howler_global.ctx && howler_global.ctx.state === 'suspended') {
		howler_global.ctx.resume().then(play_now).catch((/** @type {unknown} */ err) => {
			console.error('Failed to resume audio context:', err);
			play_now();
		});
		return;
	}

	play_now();
}

export const noise = new Howl({
	src: [
		`${base}/_sounds/empty_loop_for_js_performance.ogg`,
		`${base}/_sounds/empty_loop_for_js_performance.wav`
	],
	// mute: true,
	volume: 0.5,
	loop: true
});
