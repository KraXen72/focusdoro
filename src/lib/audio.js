import { Howl, Howler } from 'howler';

export const audio = new Howl({
	src: ['/flute.wav'],
	html5: true,
	preload: true
});

export function playAlarm() {
	/** @type {{ ctx?: AudioContext }} */
	const howler_global = /** @type {any} */ (Howler);
	if (howler_global.ctx && howler_global.ctx.state === 'suspended') {
		howler_global.ctx.resume().catch((/** @type {unknown} */ err) => {
			console.error('Failed to resume audio context:', err);
		});
	}

	/** @type {any} */ (audio).stop();
	/** @type {any} */ (audio).seek(0);
	return /** @type {any} */ (audio).play();
}

export const noise = new Howl({
	src: [
		'/_sounds/empty_loop_for_js_performance.ogg',
		'/_sounds/empty_loop_for_js_performance.wav'
	],
	// mute: true,
	volume: 0.5,
	loop: true
});
