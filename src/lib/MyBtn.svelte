<script>
	/**
	 * @typedef {Object} Props
	 * @property {'base' | 'alpha' | 'beta' | 'gamma' | 'danger' | ''} [accent]
	 * @property {string } [text]
	 * @property {string } [title]
	 * @property {(event: MouseEvent) => void} [onclick]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		accent = '',
		text = '',
		title = '',
		onclick,
		children
	} = $props();
</script>

<button class="btn colored outlined {accent}" {onclick} {title}>
	{#if text}
		<b> {text} </b>
	{:else}
		{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
	{/if}
</button>
