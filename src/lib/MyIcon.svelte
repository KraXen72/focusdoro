<script lang="ts">
	import type { IMyIcon } from "$typings/types";

	interface Props {
		accent?: 'base' | 'alpha' | 'beta' | 'gamma' | 'danger' | '';
		name: IMyIcon;
		fill?: string;
		width?: string;
	}

	let {
		accent = '',
		name,
		fill = 'currentColor',
		width = '1.5em'
	}: Props = $props();
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
