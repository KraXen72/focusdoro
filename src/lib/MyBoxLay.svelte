<script lang="ts>
	import { getContext } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	
	

	
	
	

	

	/**
	 * @typedef {Object} Props
	 * @property {'base' | 'alpha' | 'beta' | 'gamma' | 'danger' | ''} [accent]
	 * @property {string } heading
	 * @property {string | number} HH
	 * @property {string | number} MM
	 * @property {string | number} SS
	 * @property {string } [init_nums]
	 * @property {boolean} [with_controls]
	 * @property {number} [days]
	 * @property {boolean} [with_label]
	 * @property {import('svelte').Snippet} [btns]
	 */

	/** @type {Props} */
	let {
		accent = '',
		heading,
		HH,
		MM,
		SS,
		init_nums = '',
		with_controls = true,
		days = 0,
		with_label = false,
		btns
	} = $props();
</script>

<div class={accent}>
	<div class="box">
		<div class="header f-mono">{heading}</div>

		<div class="tablo">
			{#if init_nums}
				<time class="init-nums font-x" datetime={init_nums}>
					[ {init_nums} ]
				</time>
			{/if}

			{#if days}
				<!-- <div class="init-nums font-x">{l.t.time.days} : {days}</div> -->
				<div class="init-nums font-x days">{l.t.time.days}: {days}</div>
			{/if}

			<time class="font-x nums" class:labeled={with_label}>
				<b title={l.t.time.hh}>{HH}</b>
				<i>:</i>
				<b title={l.t.time.mm}>{MM}</b>
				<i>:</i>
				<b title={l.t.time.ss}>{SS}</b>
			</time>
		</div>
	</div>

	{#if with_controls}
		<div class="btns g-action-btns">
			{#if btns}{@render btns()}{:else}<!-- optional fallback -->{/if}
		</div>
	{/if}
</div>

<style>
	time {
		display: block;
	}
	.init-nums {
		padding-top: 1em;
		margin-bottom: -0.25em;

		color: var(--__fg0);
		line-height: 1;
		text-align: center;
		/* font-weight: 900; */
		font-size: clamp(1.5rem, 10vw, 3rem);
	}
	.days {
		/* text-transform: uppercase; */
		font-weight: 700;
	}
	time.labeled {
		/* background: black; */
		padding-bottom: 2.5rem;

		& > b {
			position: relative;
			&::after {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				content: attr(title);
				font-size: clamp(1rem, 5vw, 2.25rem);
				/* background: black; */
				text-align: center;
				color: var(--__fg0);
			}
		}
	}

	.box {
		padding-top: max(3rem, 8vh);
	}

	.header,
	.tablo {
		background: var(--__bga);
		backdrop-filter: blur(3px);
	}

	.header {
		text-align: center;
		text-wrap: balance;
		/* text-transform: uppercase; */
		font-size: 1.75rem;
		font-weight: 900;

		/* border: 3px dotted var(--__fl0); */
		border: 0.5rem double var(--__fl0);
		border-radius: 0 0 1rem 1rem;

		padding: 1rem;
		color: var(--__fg);
	}

	.tablo {
		user-select: none;
		border-radius: 1rem;
		border: 0.25rem solid var(--__fl0);
		border-left: 0.75rem solid var(--__fl0);
		border-right: 0.75rem solid var(--__fl0);
	}

	.tablo,
	.btns {
		margin-top: 2rem;
	}

	.nums {
		padding-block: 0.2em 0em;
		padding-inline: 0.2em;
		color: var(--__fg);

		display: grid;
		grid-template-columns: 2ch 0.75ch 2ch 0.75ch 2ch;
		justify-content: center;
		/* gap: 0.25rem; */

		text-align: center;
		font-variant-numeric: tabular-nums;
		font-size: clamp(4rem, 20vw, 10rem);

		/* background: black; */
	}
	b {
		text-align: center;
	}
	b:first-child {
		text-align: right;
	}
	b:last-child {
		text-align: left;
		/* color: var(--fg-danger); */
	}
	i {
		font-style: normal;
		transform: translateY(-4%);
		/* background: black; */
	}

	.btns {
		/* display: grid; */
		/* grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); */
		/* gap: 1rem; */

		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.btns :global(.btn) {
		flex-grow: 1;
		flex-basis: 30%;
	}
</style>
