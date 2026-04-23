<script>
	import { onDestroy, onMount } from 'svelte';
	import { msg } from '$lib/vars';
	import { sendNotification } from '$lib/sendNotification';
	import { opts } from '$store/settings';
	import { createEventDispatcher } from 'svelte';
	import { ch } from '$lib/utils';
	import MyBtn from '$lib/MyBtn.svelte';
	import MyBoxLay from '$lib/MyBoxLay.svelte';
	import { ensureAlarmPermission, playAlarm } from '$lib/audio';
	import { getContext } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	const bb = l.t.btn;

	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [with_label]
	 * @property {number} [days]
	 * @property {boolean} [with_controls]
	 * @property {boolean} [show_init_nums]
	 * @property {boolean} [autostart]
	 * @property {any} [t]
	 * @property {any} [heading]
	 * @property {string } [title]
	 */

	/** @type {Props} */
	let {
		with_label = false,
		days = 0,
		with_controls = true,
		show_init_nums = true,
		autostart = true,
		t = /** @type {{hh: number, mm: number, ss: number}} */ ({ hh: 0, mm: 0, ss: 0 }),
		heading = l.t.timers.countdown.h,
		title = $bindable('')
	} = $props();

	let h0 = $state('00');
	let m0 = $state('00');
	let s0 = $state('00');
	let init_nums = $state('');
	let HH = $state('00');
	let MM = $state('00');
	let SS = $state('00');
	let initialized = false;

	$effect(() => {
		h0 = String(ch(t.hh));
		m0 = String(ch(t.mm));
		s0 = String(ch(t.ss));
		init_nums = show_init_nums ? `${h0}:${m0}:${s0}` : '';
		if (!initialized) {
			HH = h0;
			MM = m0;
			SS = s0;
			initialized = true;
		}
	});

	/** @type {Worker | null} */
	let w = null;
	onMount(() => {
		w = new Worker(new URL('$lib/worker_backward.js', import.meta.url), {
			type: 'module'
		});

		w.onmessage = function (e) {
			// console.log(e.data);
			if (e.data.mes == msg.tick) {
				SS = String(ch(e.data.sec));

				const m = e.data.min;

				if (m >= 60) {
					HH = String(ch(Math.floor(m / 60)));
					MM = String(ch(m % 60));
				} else {
					HH = '00';
					MM = String(ch(m));
				}

				title = `${HH}:${MM}:${SS} / ${h0}:${m0}:${s0}`;
			}

			if (e.data.mes == msg.finish) {
				is_finished = true;
				is_running = false;
				if ($opts.notifications) sendNotification('Timer');
				if ($opts.alarm) playAlarm();
			}
		};

		start_ticking();

		if (!autostart) {
			// pause
			handle_play();
		}
	});

	function start_ticking() {
		const data = {
			mes: msg.start,
			min: t.hh ? t.hh * 60 + t.mm : t.mm,
			sec: t.ss
		};

		if (w) {
			w.postMessage(data);
			is_running = true;
			is_finished = false;
		}
	}

	onDestroy(() => {
		// console.log('on destroy');
		if (w) {
			w.postMessage({ mes: msg.stop });
			w.terminate();
			w = null;
		}
	});

	let is_finished = $state(false);
	let is_running = $state(false);

	function handle_play() {
		// console.log('play');
		if (is_finished) {
			ensureAlarmPermission();
			return start_ticking();
		}
		if (is_running) {
			is_running = false;
			w?.postMessage({ mes: msg.stop });
		} else {
			ensureAlarmPermission();
			is_running = true;
			w?.postMessage({ mes: msg.resume });
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<MyBoxLay
	{heading}
	{init_nums}
	accent={is_running ? 'alpha' : 'beta'}
	{HH}
	{MM}
	{SS}
	{with_controls}
	{with_label}
	{days}
>
	{#snippet btns()}
	
			<MyBtn
				text={is_finished ? bb.restart : is_running ? bb.pause : bb.start}
				onclick={handle_play}
			/>
			<MyBtn accent="danger" text={bb.reset} onclick={() => dispatch('close')} />
		
	{/snippet}
</MyBoxLay>

<!-- <style> -->
<!-- </style> -->
