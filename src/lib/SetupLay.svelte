<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	/** @type {Props} */
	let { children }: Props = $props();
</script>

<article class="container">
	<div class="card-x alpha">
		{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
	</div>
</article>

<style>
	article {
		padding-block: max(3rem, 8vh);
		min-width: min(100%, 60ch);
		/* background: black; */
	}
</style>
