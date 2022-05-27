type Callback = () => void;

export function detectIframeFocus(cb: Callback) {
	let isFocused = false;

	window?.addEventListener('focus', () => {
		if (!isFocused) {
			cb();
		}
		isFocused = true;
	});

	window?.addEventListener('blur', () => {
		isFocused = false;
	});
}

export function detectIdentifier() {
	const params = new URLSearchParams(window.location.search);

	return params.get('id');
}
