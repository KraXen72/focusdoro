<script lang="ts>
	/**
	 * @typedef {Object} Props
	 * @property {string} [title]
	 * @property {import('svelte').Snippet} [top]
	 * @property {import('svelte').Snippet} [list]
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('svelte').Snippet} [btns]
	 */

	/** @type {Props} */
	let {
		title = '',
		top,
		list,
		children,
		btns
	} = $props();
</script>

<div class="lay">
	<div class="container">
		{@render top?.()}

		{#if title}
			<h3>{title}</h3>
		{/if}

		<ul class="table">
			{#if list}{@render list()}{:else}
				<li>list-item</li>
			{/if}
		</ul>

		{@render children?.()}

		<div class="btns">
			{@render btns?.()}
		</div>
	</div>
</div>

<style>
	:global(h3) {
		margin: 0;
	}

	.lay {
		margin-block: 1rem 2rem;

		background: var(--bg);
		border-radius: 1em;
		/* border: var(--border); */
	}

	.container {
		padding-block: 4rem 8rem;
		padding-inline: 2rem;
	}

	ul {
		margin-top: 1.15rem;
	}
	.btns {
		margin-top: 3rem;
	}

	ul > :global(li) {
		border-bottom: 1px dashed var(--fl);
	}
</style>
