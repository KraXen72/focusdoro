<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { BoxField, BoxFieldEntry, Btn } from '@kazkadien/svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { getContext } from 'svelte';
	import TimerForm from './TimerForm.svelte';
	import { add_recent_timers, ch as formatTwoDigits, get_JSON_from_LS } from '$lib/utils';
	import { LS } from '$lib/vars';
	import { ensureAlarmPermission } from '$lib/audio';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');

	const dispatchEvent = createEventDispatcher();

	let timerValues = $state({
		hh: 0,
		mm: 0,
		ss: 0
	});
	let rememberTimerValues = $state(false);

	/** @type {{ hh: number; mm: number; ss: number; }[]} */
	let recentTimers = $state([]);

	const ls_timer_vals = 'CT_values';
	const ls_remember = 'CT_remember';

	function on_submit() {
		if (!timerValues.hh && !timerValues.mm && !timerValues.ss) return;

		if (rememberTimerValues) {
			localStorage.setItem(ls_timer_vals, JSON.stringify(timerValues));
		}

		const startPayload = timerValues;
		ensureAlarmPermission();
		add_recent_timers(LS.recent_timers, timerValues);
		dispatchEvent('start', startPayload);
	}

	onMount(() => {
		recentTimers = get_JSON_from_LS(LS.recent_timers, []);
		rememberTimerValues = !!localStorage.getItem(ls_remember);
		if (!rememberTimerValues) return;
		const storedTimerValuesJson = localStorage.getItem(ls_timer_vals);
		if (!storedTimerValuesJson) return;
		try {
			const storedTimerValues = JSON.parse(storedTimerValuesJson);
			timerValues = storedTimerValues;
		} catch (error) {
			console.log(error);
		}
	});

	/** @param {any} changeEvent */
	function on_change_remember(changeEvent) {
		// console.log(changeEvent);
		rememberTimerValues = changeEvent.target.checked;
		if (rememberTimerValues) {
			localStorage.setItem(ls_remember, '1');
		} else {
			localStorage.removeItem(ls_remember);
		}
	}

	/**
	 * @param {{ hh: number; mm: number; ss: number; }} selectedTimerValues
	 */
	function on_sub_recent(selectedTimerValues) {
		timerValues.hh = selectedTimerValues.hh;
		timerValues.mm = selectedTimerValues.mm;
		timerValues.ss = selectedTimerValues.ss;
	}
</script>

<form class="form v2 alpha" onsubmit={preventDefault(on_submit)}>
	<TimerForm vv={timerValues} />

	<BoxField rows>
		<BoxFieldEntry label={l.t.opts.etc.preserve_HMS}>
			<input
				name="remember_timer"
				type="checkbox"
				checked={rememberTimerValues}
				onchange={on_change_remember}
			/>
		</BoxFieldEntry>
	</BoxField>

	{#if recentTimers.length}
		<div class="recent_timers_wrap">
			<small class="recent_timers_label">{l.t.time.recent_timers}</small>
			<div class="recent_timers">
				{#each recentTimers as timerValues}
					<Btn
						type="submit"
						text={Object.values(timerValues)
							.map((value) => formatTwoDigits(value))
							.join(':')}
						on:click={() => on_sub_recent(timerValues)}
					/>
				{/each}
			</div>
		</div>
	{/if}
</form>

<style>
	form {
		display: grid;
		gap: 3rem;
	}
	.recent_timers_wrap {
		display: grid;
		gap: 0.5rem;
	}
	.recent_timers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.recent_timers_label {
		color: var(--fg2);
		font-size: 0.85rem;
	}
</style>
