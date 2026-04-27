<script lang="ts>
	/** @typedef {'base' | 'alpha' | 'beta' | 'gamma' | 'danger'} Accent*/
	
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [accent]
	 * @property {import("$typings/types").IMyIcon} name
	 * @property {string} [fill]
	 * @property {string} [width]
	 */

	/** @type {Props} */
	let {
		accent = '',
		name,
		fill = 'currentColor',
		width = '1.5em'
	} = $props();
</script>

<svg
	height="24px"
	width="24px"
	viewBox="0 0 24 24"
	{fill}
	class={accent}
	style="width: {width}; height: auto; {accent &&
		'fill: var(--__fg, var(--fg1));'}"
>
	<use href={`#${name}`} />
</svg>
