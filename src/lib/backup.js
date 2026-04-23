/** @returns {string} */
function backup_date() {
	return new Date().toLocaleDateString('fr-CA');
}

/**
 * @param {'sessions' | 'breaks'} kind
 * @param {unknown} data
 */
export function download_json_backup(kind, data) {
	const name = `${backup_date()}-focusdoro-${kind}.json`;
	const body = JSON.stringify(data, null, 2);
	const blob = new Blob([body], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	a.click();

	setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * @param {(data: unknown) => boolean} is_valid
 * @returns {Promise<unknown | null>}
 */
export async function pick_json_backup_with_retry(is_valid) {
	/** @type {any} */
	const ww = window;
	if (typeof ww.showOpenFilePicker !== 'function') {
		alert('File picker API is not supported in this browser.');
		return null;
	}

	while (true) {
		/** @type {FileSystemFileHandle[]} */
		let handles = [];
		try {
			handles = await ww.showOpenFilePicker({
				multiple: false,
				types: [
					{
						description: 'JSON backup',
						accept: { 'application/json': ['.json'] }
					}
				]
			});
		} catch {
			return null;
		}

		const handle = handles[0];
		if (!handle) {
			return null;
		}

		try {
			const file = await handle.getFile();
			const text = await file.text();
			const parsed = JSON.parse(text);
			if (is_valid(parsed)) {
				return parsed;
			}
		} catch {
			// continue
		}

		alert('Invalid backup file. Please choose a valid Focusdoro backup JSON.');
	}
}
