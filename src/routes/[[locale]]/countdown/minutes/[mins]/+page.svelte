<script lang="ts">
	import { goto } from '$app/navigation';
	import RunTimer from '../../RunTimer.svelte';
	import { getContext, untrack } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	const th = l.t.r.c_preset.head;
	const tb = l.t.r.c_preset.body;

	
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	const { data } = $props();

	// const t = { hh: 0, mm: data.minutes, ss: 0 };
	const minutes = untrack(() => data.minutes);
	const t = { hh: 0, mm: 0, ss: 0 };

	if (minutes >= 60) {
		t.hh = Math.floor(minutes / 60);
		t.mm = minutes % 60;
	} else {
		t.mm = minutes;
	}

	function handle_close() {
		// console.log('close');
		goto(`${l.r.prefix}/countdown`);
	}
	const title = th.title(minutes);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={th.desc(minutes)} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={th.desc(minutes)} />
</svelte:head>

<div class="wrap container">
	<article>
		<!-- pass title!-->
		<RunTimer {title} {t} autostart={false} on:close={handle_close} />

		<h1>{tb.h1(minutes)}</h1>
		<p class="tac">
			{tb.d1} <a href="{l.r.prefix}/countdown/minutes">{tb.d2}</a>.
		</p>
	</article>
</div>

<style>
	h1 {
		margin-top: 3rem;
		text-align: center;
	}
</style>
