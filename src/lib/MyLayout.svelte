<script lang="ts">
	import type { Snippet } from "svelte"

	interface Props {
		title?: string;
		top?: Snippet;
		list?: Snippet;
		children?: Snippet;
		btns?: Snippet;
	}

	let {
		title = '',
		top,
		list,
		children,
		btns
	}: Props = $props();
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
