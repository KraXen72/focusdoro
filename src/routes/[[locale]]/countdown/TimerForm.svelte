<script>
	import { Btn, Field, Icon } from '@kazkadien/svelte';
	import { parseDuration } from '@timelang/parse';
	import { getContext, onMount } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');

	let { vv: timerValues = $bindable({
		hh: 0,
		mm: 0,
		ss: 0
	}) } = $props();

	let durationText = $state('');
	/** @type {HTMLInputElement | null} */
	let durationInput = null;

	/**
	 * @param {number} hh
	 * @param {number} mm
	 * @param {number} ss
	 */
	function setTimerValues(hh, mm, ss) {
		timerValues.hh = hh;
		timerValues.mm = mm;
		timerValues.ss = ss;
	}

	/** @param {number} totalSeconds */
	function setTimerFromSeconds(totalSeconds) {
		const safeSeconds = Math.max(0, Math.floor(totalSeconds));
		setTimerValues(
			Math.floor(safeSeconds / 3600),
			Math.floor((safeSeconds % 3600) / 60),
			safeSeconds % 60
		);
	}

	function clearDurationValidity() {
		durationInput?.setCustomValidity('');
	}

	/**
	 * @param {boolean} [showInvalidError]
	 */
	function applyParsedDuration(showInvalidError = true) {
		const durationExpression = durationText.trim();
		if (!durationExpression || !durationInput) {
			clearDurationValidity();
			return;
		}

		const durationMs = parseDuration(durationExpression);
		if (durationMs == null) {
			if (showInvalidError) {
				durationInput.setCustomValidity(l.t.time.duration_invalid);
				durationInput.reportValidity();
			}
			return;
		}

		const totalSeconds = Math.floor(durationMs / 1000);
		if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
			if (showInvalidError) {
				durationInput.setCustomValidity(l.t.time.duration_invalid);
				durationInput.reportValidity();
			}
			return;
		}

		clearDurationValidity();
		setTimerFromSeconds(totalSeconds);
	}

	/** @param {KeyboardEvent} keyboardEvent */
	function onDurationKeydown(keyboardEvent) {
		if (keyboardEvent.key === 'Enter') {
			keyboardEvent.preventDefault();
			applyParsedDuration();
		}
	}

	function onDurationBlur() {
		applyParsedDuration(false);
	}

	/** @param {number} hours */
	function on_add_hours(hours) {
		const nextHours = timerValues.hh + hours;
		timerValues.hh = nextHours > 10 ? 10 : nextHours;
	}
	/** @param {number} hpurs */
	function on_subtract_hours(hpurs) {
		const nextHours = timerValues.hh - hpurs;
		timerValues.hh = nextHours < 0 ? 0 : nextHours;
	}

	/** @param {number} mins */
	function on_add_minutes(mins) {
		const nextMinutes = timerValues.mm + mins;
		timerValues.mm = nextMinutes > 60 ? 60 : nextMinutes;
	}
	/** @param {number} mins */
	function on_subtract_minutes(mins) {
		const nextMinutes = timerValues.mm - mins;
		timerValues.mm = nextMinutes < 0 ? 0 : nextMinutes;
	}

	/** @param {number} sec */
	function on_add_seconds(sec) {
		const nextSeconds = timerValues.ss + sec;
		timerValues.ss = nextSeconds > 60 ? 60 : nextSeconds;
	}
	/** @param {number} sec */
	function on_subtract_seconds(sec) {
		const nextSeconds = timerValues.ss - sec;
		timerValues.ss = nextSeconds < 0 ? 0 : nextSeconds;
	}

	onMount(() => {
		durationInput?.focus();
	});
</script>

<div class="b1">
	<Field label={l.t.time.duration}>
		<input
			type="text"
			placeholder="30m, 15 minutes, 14m 32s"
			autocomplete="off"
			bind:this={durationInput}
			bind:value={durationText}
			oninput={clearDurationValidity}
			onkeydown={onDurationKeydown}
			onblur={onDurationBlur}
		/>
	</Field>

	<div class="bbb">
		<Btn text={l.t.btn.start} type="submit" />

		<!-- <Btn text="000" type="submit" on:click={() => (vv.ss = 26)} /> -->
		<Btn
			text={l.t.btn.reset}
			accent="danger"
			on:click={() => {
				setTimerValues(0, 0, 0);
			}}
		/>
	</div>

	<div class="controls-sep" aria-hidden="true"></div>

	<section>
		<div class="">
			<Field label={l.t.time.hh}>
				<input type="number" bind:value={timerValues.hh} min="0" max="10" required />
			</Field>

			<div class="i2">
				<Btn
					on:click={() => on_subtract_hours(1)}
					variant="outlined"
					title="-1"
				>
					<Icon name="remove" />
				</Btn>
				<Btn on:click={() => on_add_hours(1)} variant="outlined" title="+1">
					<Icon name="add" />
				</Btn>
			</div>
		</div>

		<div class="">
			<Field label={l.t.time.mm}>
				<input type="number" bind:value={timerValues.mm} min="0" max="60" required />
			</Field>

			<div class="i2">
				<Btn
					title="-1"
					on:click={() => on_subtract_minutes(1)}
					variant="outlined"
				>
					<Icon name="remove" />
				</Btn>

				<Btn title="+1" on:click={() => on_add_minutes(1)} variant="outlined">
					<Icon name="add" />
				</Btn>
			</div>
		</div>

		<div class="">
			<Field label={l.t.time.ss}>
				<input type="number" bind:value={timerValues.ss} min="0" max="60" required />
			</Field>

			<div class="i2">
				<Btn
					title="-5"
					on:click={() => on_subtract_seconds(5)}
					variant="outlined"
				>
					<Icon name="remove" />
				</Btn>

				<Btn title="+5" on:click={() => on_add_seconds(5)} variant="outlined">
					<Icon name="add" />
				</Btn>
			</div>
		</div>
	</section>

	<div class="btns base pluses">
		<Btn on:click={() => on_add_minutes(5)}>+5 {l.t.time.mins}</Btn>
		<Btn on:click={() => on_add_minutes(10)}>+10 {l.t.time.mins}</Btn>
		<Btn on:click={() => on_add_minutes(30)}>+30 {l.t.time.mins}</Btn>
	</div>
</div>

<style>
	.b1 {
		display: grid;
		gap: 1.25rem;
	}
	section,
	.btns,
	.bbb {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.i2 {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 0.5rem;
		/* background: black; */
	}

	.i2 :global(.btn) {
		flex-grow: 1;
		/* outline: 1px solid red; */
	}
	.pluses {
		margin-top: 0.5rem;
	}
	.bbb {
		grid-template-columns: repeat(2, 1fr);
	}
	.controls-sep {
		height: 1px;
		background: var(--fl0);
		opacity: 0.4;
		margin-block: 0.25rem 0.75rem;
	}
	input[type='text'] {
		font-size: 1.5rem;
	}
	input[type='number'] {
		/* min-width: min(14ch, 25vw); */

		font-size: 1.75rem;
		--_x: 2px;
		--_x2: 4px;
	}
</style>
