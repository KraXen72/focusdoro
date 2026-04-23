<script>
	import MyLayout from '$lib/MyLayout.svelte';
	import { ldb } from '$lib/db';
	import { Btn, Field, Icon } from '@kazkadien/svelte';
	import {
		download_json_backup,
		pick_json_backup_with_retry
	} from '$lib/backup';
	import { getContext } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	const th = l.t.r.breaks.head;
	const tb = l.t.r.breaks.body;

	let newListName = '';
	function handleSubmitNewList() {
		console.log({ newListName });
		listNames = [newListName, ...listNames];
		name = newListName;
		values = new Set();
		upsert();
		newListName = '';
	}
	function deleteList() {
		if (listNames.length < 2) {
			return;
		}
		ldb.activities.deleteOne(name);
		listNames = listNames.filter((e) => e !== name);
		name = listNames[0];
		fetchOne(name);
	}

	function upsert() {
		ldb.activities.upsertOne({ name, values });
	}

	/** @type {string[]} */
	let listNames = [];
	ldb.activities.getNames().then((res) => {
		listNames = res;
		if (res.length) {
			name = res[0];
			fetchOne(name);
		}
	});
	/** @param {string} name */
	function fetchOne(name) {
		// @ts-ignore
		ldb.activities.getOneByName(name).then((v) => (values = v?.values));
	}
	let name = '';
	/** @type {Set<string>} */
	let values = new Set();

	/** @param {Event & { currentTarget: EventTarget & HTMLSelectElement; }} ev */
	function onChangeList(ev) {
		const val = ev.currentTarget.value;
		console.log({ val });
		name = val;
		fetchOne(name);
		// currList = val;
	}
	/** @param {string} val */
	function onDelete(val) {
		console.log(val);
		values.delete(val);
		values = values;
		upsert();
	}

	let action = '';
	function handleSubmitNewActivity() {
		console.log(values);
		console.log(action);
		values.add(action);
		values = values;
		upsert();
		action = '';
	}

	/** @param {unknown} v */
	function is_valid_activity_list(v) {
		if (!v || typeof v !== 'object') return false;
		/** @type {{name?: unknown, values?: unknown}} */
		const one = v;
		if (typeof one.name !== 'string' || !one.name.trim()) return false;
		return Array.isArray(one.values) && one.values.every((x) => typeof x === 'string');
	}

	/** @param {unknown} data */
	function is_valid_breaks_backup(data) {
		if (Array.isArray(data)) {
			return data.length > 0 && data.every(is_valid_activity_list);
		}
		if (!data || typeof data !== 'object') return false;
		/** @type {{type?: unknown, version?: unknown, data?: unknown}} */
		const x = data;
		return (
			x.type === 'focusdoro-breaks' &&
			x.version === 1 &&
			Array.isArray(x.data) &&
			x.data.length > 0 &&
			x.data.every(is_valid_activity_list)
		);
	}

	/** @param {unknown} data */
	function get_activity_lists_from_backup(data) {
		if (Array.isArray(data)) return data;
		/** @type {{data?: unknown}} */
		const x = data;
		return Array.isArray(x.data) ? x.data : [];
	}

	async function onExport() {
		const lists = await ldb.activities.list();
		download_json_backup('breaks', {
			type: 'focusdoro-breaks',
			version: 1,
			data: lists.map((el) => ({ name: el.name, values: [...el.values] }))
		});
	}

	async function onImport() {
		const parsed = await pick_json_backup_with_retry(is_valid_breaks_backup);
		if (!parsed) return;

		/** @type {{name: string, values: string[]}[]} */
		const next = get_activity_lists_from_backup(parsed);
		const unique = [...new Map(next.map((el) => [el.name, el])).values()];

		const prev_names = await ldb.activities.getNames();
		await Promise.all(prev_names.map((list_name) => ldb.activities.deleteOne(list_name)));
		await Promise.all(
			unique.map((el) =>
				ldb.activities.upsertOne({ name: el.name, values: new Set(el.values) })
			)
		);

		listNames = unique.map((el) => el.name);
		name = listNames[0] || '';
		values = name ? new Set(unique[0].values) : new Set();
	}
</script>

<svelte:head>
	<title>{th.title}</title>
	<meta name="description" content={th.desc} />
</svelte:head>

<MyLayout title="">
	<div slot="top">
		<form class="form v2 alpha" on:submit|preventDefault={handleSubmitNewList}>
			<Field label={tb.new}>
				<input
					bind:value={newListName}
					type="text"
					required
					maxlength="240"
					minlength="2"
					placeholder="My list name"
				/>
			</Field>
		</form>

		<div class="g1a">
			<div class="form v2 ll">
				<Field label={tb.list}>
					<select on:change={onChangeList}>
						{#each listNames as val}
							<option selected={val === name}>{val}</option>
						{/each}
					</select>
				</Field>
			</div>
			<Btn
				iconOnly
				colored
				accent="danger"
				variant="text"
				title={l.t.btn.del}
				on:click={deleteList}
			>
				<Icon name="delete" />
			</Btn>
		</div>
	</div>

	<svelte:fragment slot="list">
		{#each [...values] as el}
			<li>
				<span>{el}</span>
				<Btn
					iconOnly
					accent="danger"
					colored
					variant="text"
					on:click={() => onDelete(el)}
				>
					<Icon name="delete" />
				</Btn>
			</li>
		{:else}
			<li>Empty</li>
		{/each}
	</svelte:fragment>

	<form
		slot="btns"
		class="form v2 alpha end"
		on:submit|preventDefault={handleSubmitNewActivity}
	>
		<Field label={tb.new_activity}>
			<input
			bind:value={action}
			type="text"
			required
			maxlength="240"
			minlength="2"
			placeholder="Plank"
			/>
		</Field>
		<div class="backup-btns">
			<Btn
				type="button"
				on:click={onExport}
				accent="beta"
				variant="outlined"
				text="Export JSON"
			/>
			<Btn
				type="button"
				on:click={onImport}
				accent="gamma"
				variant="outlined"
				text="Import JSON"
			/>
		</div>
	</form>
</MyLayout>

<div class="notes" lang="en">
	<p>
		<a href="https://www.bbc.com/news/health-66303982">
			Wall squats and planks best at lowering blood pressure
		</a>
	</p>
</div>

<style>
	form {
		background: var(--bg);
		/* padding: 1em; */
		border-radius: 1em;
	}
	.ll {
		/* margin-top: 2em; */
		display: flex;
	}
	.ll :global(label) {
		flex-grow: 1;
		/* background: black; */
	}
	li {
		padding-inline-start: 1ch;
	}

	.g1a {
		margin-block: 3em 1em;
		/* background: black; */
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2ch;
		align-items: flex-start;

		/* outline: 1px solid orange; */
	}
	.end {
		margin-top: 2em;
	}
	.backup-btns {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-block-start: 1rem;
	}

	.notes {
		padding: 1rem;
		border-radius: 1rem;
		/* border: var(--border); */
		background: var(--bg);
		margin-block: 4rem;
	}
</style>
