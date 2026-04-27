<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		accent?: 'base' | 'alpha' | 'beta' | 'gamma' | 'danger' | '';
		text?: string;
		title?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		accent = '',
		text = '',
		title = '',
		onclick,
		children
	}: Props = $props();
</script>

<button class="btn colored outlined {accent}" {onclick} {title}>
	{#if text}
		<b> {text} </b>
	{:else}
		{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
	{/if}
</button>
