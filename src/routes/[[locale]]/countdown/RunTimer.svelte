<script>
	import MyBoxLay from '$lib/MyBoxLay.svelte';
	import MyBtn from '$lib/MyBtn.svelte';
	import { ensureAlarmPermission, playAlarm } from '$lib/audio';
	import { sendNotification } from '$lib/sendNotification';
	import { ch } from '$lib/utils';
	import { msg } from '$lib/vars';
	import { opts } from '$store/settings';
	import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	const buttonLabels = l.t.btn;

	const dispatchEvent = createEventDispatcher();

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
		t: initialTime = /** @type {{hh: number, mm: number, ss: number}} */ ({ hh: 0, mm: 0, ss: 0 }),
		heading = l.t.timers.countdown.h,
		title = $bindable('')
	} = $props();

	let initialHours = $state('00');
	let initialMinutes = $state('00');
	let initialSeconds = $state('00');
	let initialTimeLabel = $state('');
	let HH = $state('00');
	let MM = $state('00');
	let SS = $state('00');
	let hasInitializedDisplay = false;

	$effect(() => {
		initialHours = String(ch(initialTime.hh));
		initialMinutes = String(ch(initialTime.mm));
		initialSeconds = String(ch(initialTime.ss));
		initialTimeLabel = show_init_nums
			? `${initialHours}:${initialMinutes}:${initialSeconds}`
			: '';
		if (!hasInitializedDisplay) {
			HH = initialHours;
			MM = initialMinutes;
			SS = initialSeconds;
			hasInitializedDisplay = true;
		}
	});

	/** @type {Worker | null} */
	let timerWorker = null;
	onMount(() => {
		timerWorker = new Worker(new URL('$lib/worker_backward.js', import.meta.url), {
			type: 'module'
		});

		timerWorker.onmessage = function (workerEvent) {
			if (workerEvent.data.mes == msg.tick) {
				SS = String(ch(workerEvent.data.sec));

				const totalMinutes = workerEvent.data.min;

				if (totalMinutes >= 60) {
					HH = String(ch(Math.floor(totalMinutes / 60)));
					MM = String(ch(totalMinutes % 60));
				} else {
					HH = '00';
					MM = String(ch(totalMinutes));
				}

				title = `${HH}:${MM}:${SS} / ${initialHours}:${initialMinutes}:${initialSeconds}`;
			}

			if (workerEvent.data.mes == msg.finish) {
				isFinished = true;
				isRunning = false;
				if ($opts.notifications) sendNotification('Timer');
				if ($opts.alarm) playAlarm();
			}
		};

		startTicking();

		if (!autostart) {
			// pause
			handlePlayPause();
		}
	});

	onDestroy(() => {
		// console.log('on destroy');
		if (timerWorker) {
			timerWorker.postMessage({ mes: msg.stop });
			timerWorker.terminate();
			timerWorker = null;
		}
	});

	let isFinished = $state(false);
	let isRunning = $state(false);
	const minuteOptions = [1, 5, 10];

	function getTotalSeconds() {
		return Number(HH) * 60 * 60 + Number(MM) * 60 + Number(SS);
	}

	/**
	 * @param {number} totalSeconds
	 */
	function setDisplayTime(totalSeconds) {
		const hh = Math.floor(totalSeconds / 3600);
		const mm = Math.floor((totalSeconds % 3600) / 60);
		const ss = totalSeconds % 60;

		HH = String(ch(hh));
		MM = String(ch(mm));
		SS = String(ch(ss));
		title = `${HH}:${MM}:${SS} / ${initialHours}:${initialMinutes}:${initialSeconds}`;
	}

	/**
	 * @param {number} minuteDelta
	 */
	function handleAdjustTime(minuteDelta) {
		const currentSeconds = getTotalSeconds();
		if (minuteDelta < 0 && currentSeconds === 0) return;

		const totalSeconds = Math.max(0, currentSeconds + minuteDelta * 60);
		setDisplayTime(totalSeconds);
		isFinished = false;

		timerWorker?.postMessage({
			mes: msg.set,
			min: Math.floor(totalSeconds / 60),
			sec: totalSeconds % 60
		});
	}

	function handlePlayPause() {
		// console.log('play');
		if (isFinished) {
			ensureAlarmPermission();
			return startTicking();
		}
		if (isRunning) {
			isRunning = false;
			timerWorker?.postMessage({ mes: msg.stop });
		} else {
			ensureAlarmPermission();
			isRunning = true;
			timerWorker?.postMessage({ mes: msg.resume });
		}
	}

	/**
	 * @param {number} [totalSeconds]
	 */
	function startTicking(
		totalSeconds = initialTime.hh * 60 * 60 + initialTime.mm * 60 + initialTime.ss
	) {
		const min = Math.floor(totalSeconds / 60);
		const sec = totalSeconds % 60;

		const data = {
			mes: msg.start,
			min,
			sec
		};

		if (timerWorker) {
			timerWorker.postMessage(data);
			isRunning = true;
			isFinished = false;
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<MyBoxLay
	{heading}
	init_nums={initialTimeLabel}
	accent={isRunning ? 'alpha' : 'beta'}
	{HH}
	{MM}
	{SS}
	{with_controls}
	{with_label}
	{days}
>
	{#snippet btns()}
		<div class="btn-row">
			<MyBtn
				text={isFinished ? buttonLabels.restart : isRunning ? buttonLabels.pause : buttonLabels.start}
				onclick={handlePlayPause}
			/>
			<MyBtn accent="danger" text={buttonLabels.reset} onclick={() => dispatchEvent('close')} />
		</div>
		<div class="controls-sep" aria-hidden="true"></div>
		<div class="btn-row adjust-row">
			{#each minuteOptions as minutes}
				<div class="adjust-group">
					<MyBtn
						text={`-${minutes} ${l.t.time.mins}`}
						onclick={() => handleAdjustTime(-minutes)}
					/>
					<MyBtn
						text={`+${minutes} ${l.t.time.mins}`}
						onclick={() => handleAdjustTime(minutes)}
					/>
				</div>
			{/each}
		</div>
	{/snippet}
</MyBoxLay>

<style>
	.btn-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		width: 100%;
	}

	.controls-sep {
		width: 100%;
		height: 1px;
		background: var(--fl0);
		opacity: 0.4;
		margin: 0.15rem 0;
	}

	.adjust-row {
		flex-wrap: nowrap;
	}

	.adjust-row :global(.btn) {
		--btn-h: 1.95em;
		--_bg: var(--bga1);
		--__mg0: var(--bga0);
		--__mg1: var(--bg2);
		--__fg: var(--fg2);
		--__fg2: var(--fg);
		--__fl1: var(--fl1);

		font-size: 1.125rem;
		border-radius: 0.65rem;
	}

	.adjust-row :global(.btn.outlined:not(:hover):not(:focus-visible)) {
		background: var(--bga1);
		backdrop-filter: blur(3px);
	}

	.adjust-group {
		display: flex;
		gap: 0;
		flex: 1 1 0;
		min-width: 0;
	}

	.adjust-group :global(.btn) {
		flex: 1 1 0;
		min-width: 0;
	}

	.adjust-group :global(.btn:first-child) {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		border-right-width: 0;
	}

	.adjust-group :global(.btn:last-child) {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.adjust-group :global(.btn:first-child:is(:hover, :focus-visible)) {
		border-right-width: 1px;
	}

	.adjust-group :global(.btn:first-child:is(:hover, :focus-visible) + .btn) {
		border-left-width: 0;
	}
</style>
