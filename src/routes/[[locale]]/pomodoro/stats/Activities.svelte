<script lang="ts">
	import { getContext } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');

	
	/**
	 * @typedef {Object} Props
	 * @property {[string, number][]} [activities]
	 */

	/** @type {Props} */
	let { activities = [] } = $props();
</script>

<table>
	<thead>
		<tr>
			<th>{l.t.r.stats.body.activity}</th>
			<th>{l.t.r.stats.body.total}</th>
		</tr>
	</thead>
	{#each activities.sort((a, b) => b[1] - a[1]) as a}
		<tbody>
			<tr>
				<td>{a[0]}</td>
				<td class="beta">{a[1]}</td>
			</tr>
		</tbody>
	{/each}
</table>

<!-- <style> -->
<!-- </style> -->
