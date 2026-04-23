<script>
	import EditSequence from './EditSequence.svelte';
	import MyIcon from '$lib/MyIcon.svelte';
	import MyLayout from '$lib/MyLayout.svelte';
	import { currSequenceName, sequences } from '$store/store';
	import { Btn, Icon, Modal } from '@kazkadien/svelte';
	import { ldb } from '$lib/db';
	import {
		download_json_backup,
		pick_json_backup_with_retry
	} from '$lib/backup';
	import { getContext } from 'svelte';
	/** @type {import('$lib/types').Localize } */
	const l = getContext('ttt');
	const bb = l.t.btn;

	let modalIsOpen = $state(false);

	/** @param {string} name */
	function onDelete(name) {
		console.log(name);
		ldb.sequences.deleteOneByName(name).then(() => {
			sequences.update((v) => v.filter((e) => e != name));
		});
	}

	function onAdd() {
		modalIsOpen = true;
	}

	/** @type {import('$lib/types').ISequence | undefined} */
	let sequence2edit = $state();
	/** @param {string} name */
	function onEdit(name) {
		ldb.sequences.getOneByName(name).then((v) => {
			if (!v) return;
			sequence2edit = v;
			modalIsOpen = true;
		});
	}
	function onCloseModal() {
		modalIsOpen = false;
		sequence2edit = undefined;
	}

	/** @param {unknown} v */
	function is_valid_sequence(v) {
		if (!v || typeof v !== 'object') return false;
		/** @type {{name?: unknown, rounds?: unknown}} */
		const seq = v;
		if (typeof seq.name !== 'string' || !seq.name.trim()) return false;
		if (!Array.isArray(seq.rounds) || !seq.rounds.length) return false;
		return true;
	}

	/** @param {unknown} data */
	function is_valid_sessions_backup(data) {
		if (Array.isArray(data)) {
			return data.length > 0 && data.every(is_valid_sequence);
		}
		if (!data || typeof data !== 'object') return false;
		/** @type {{type?: unknown, version?: unknown, data?: unknown}} */
		const x = data;
		return (
			x.type === 'focusdoro-sessions' &&
			x.version === 1 &&
			Array.isArray(x.data) &&
			x.data.length > 0 &&
			x.data.every(is_valid_sequence)
		);
	}

	/** @param {unknown} data */
	function get_sequences_from_backup(data) {
		if (Array.isArray(data)) return data;
		const x = /** @type {{data?: unknown}} */ (data);
		return Array.isArray(x.data) ? x.data : [];
	}

	async function onExport() {
		const data = await ldb.sequences.list();
		download_json_backup('sessions', {
			type: 'focusdoro-sessions',
			version: 1,
			data
		});
	}

	async function onImport() {
		const parsed = await pick_json_backup_with_retry(is_valid_sessions_backup);
		if (!parsed) return;

		/** @type {import('$lib/types').ISequence[]} */
		const next = get_sequences_from_backup(parsed);
		const unique = [...new Map(next.map((el) => [el.name, el])).values()];

		const prev_names = await ldb.sequences.listNames();
		await Promise.all(prev_names.map((name) => ldb.sequences.deleteOneByName(name)));
		await Promise.all(unique.map((seq) => ldb.sequences.upsertOne(seq)));

		const next_names = unique.map((el) => el.name);
		sequences.set(next_names);
		if (next_names.length && !next_names.includes($currSequenceName)) {
			$currSequenceName = next_names[0];
		}
	}
</script>

<svelte:head>
	<title>{l.t.r.sequences.head.title}</title>
	<meta name="description" content={l.t.r.sequences.head.desc} />
</svelte:head>

{#if modalIsOpen}
	<Modal on:close={onCloseModal}>
		<EditSequence on:close={onCloseModal} seq={sequence2edit} />
	</Modal>
{/if}

<MyLayout title={l.t.r.sequences.body.h}>
	{#snippet list()}
	
			{#each $sequences as el}
				<li>
					<span> {el} </span>

					<div class="btns" style="font-size: .75em;">
						<Btn
							iconOnly
							colored
							accent="alpha"
							variant="text"
							on:click={() => onEdit(el)}
							title={bb.edit}
						>
							<MyIcon name="edit" />
						</Btn>

						<Btn
							title={bb.del}
							colored
							iconOnly
							variant="text"
							accent="danger"
							on:click={() => onDelete(el)}
							disabled={el === $currSequenceName}
						>
							<Icon name="delete" />
						</Btn>
					</div>
				</li>
			{/each}
		
	{/snippet}

	{#snippet btns()}
		<div  class="fce import-export-wrap-parent">
			<Btn
				on:click={onAdd}
				accent="alpha"
				variant="filled"
				text={l.t.r.sequences.body.add}
			/>
			<div class="import-export-wrap">
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
		</div>
	{/snippet}
</MyLayout>

<style> 
	.import-export-wrap-parent {
		display: flex;
		flex-direction: column;
	}
	.import-export-wrap {
		margin-block-start: .5rem;
		display: flex;
		gap: .75rem;
	}
</style>
