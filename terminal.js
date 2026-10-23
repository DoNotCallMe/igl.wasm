(function () {
	const terminalStyles = [
		{ name: 'first', description: 'Return the first match' },
		{ name: 'deep', description: 'Search in data arrays (off by default to avoid slowdown)' },
		{ name: 'all', description: 'Export all settings including default unchanged values' },
		{ name: 'color names', description: 'Save color using names if available' },
		{ name: 'print array', description: 'Use special numeric array processing (convert to a,b,c,.. text)' },
		{ name: 'binary array', description: 'Use a special binary array processing (convert to 0101001 text)' },
		{ name: 'description', description: 'Add description if available' },
		{ name: 'const array', description: 'Compact const array form (value + count)' },
		{ name: 'zip', description: 'Return data as a text blob' },
		{ name: 'compact', description: 'Compact JSON format (one line)' }
	];

	function formatJsonResult(value) {
		if (typeof value === 'undefined') {
			return '';
		}

		if (value === null) {
			return 'null';
		}

		if (typeof value === 'string') {
			if (!value.trim()) {
				return '';
			}

			try {
				return JSON.stringify(JSON.parse(value), null, 2);
			}
			catch (error) {
				return value;
			}
		}

		try {
			return JSON.stringify(value, null, 2);
		}
		catch (error) {
			return String(value);
		}
	}

	function ensureTerminalModal(options) {
		const modalId = options.modalId || 'sageTerminalModal';
		const titleId = options.titleId || 'sageTerminalModalTitle';
		const closeButtonId = options.closeButtonId || 'sageTerminalModalClose';
		const queryId = options.queryId || 'sageTerminalQuery';
		const stylesContainerId = options.stylesContainerId || 'sageTerminalStyles';
		const runButtonId = options.runButtonId || 'sageTerminalRun';
		const resultId = options.resultId || 'sageTerminalResult';

		let modal = document.getElementById(modalId);

		if (!modal) {
			modal = document.createElement('div');
			modal.id = modalId;
			modal.className = 'sage-modal';
			modal.setAttribute('aria-hidden', 'true');
			modal.inert = true;

			const backdrop = document.createElement('div');
			backdrop.className = 'sage-modal__backdrop';

			const dialog = document.createElement('div');
			dialog.className = 'sage-modal__dialog sage-modal__dialog--terminal';
			dialog.setAttribute('role', 'dialog');
			dialog.setAttribute('aria-modal', 'true');
			dialog.setAttribute('aria-labelledby', titleId);

			const header = document.createElement('div');
			header.className = 'sage-window-header';

			const title = document.createElement('div');
			title.id = titleId;
			title.className = 'sage-window-title';
			title.textContent = options.titleText || 'Terminal';

			const actions = document.createElement('div');
			actions.className = 'sage-window-actions';

			const closeButton = document.createElement('button');
			closeButton.id = closeButtonId;
			closeButton.type = 'button';
			closeButton.className = 'sage-window-button';
			closeButton.setAttribute('aria-label', 'Close terminal');
			closeButton.title = 'Close';
			closeButton.textContent = '\u2715';

			actions.appendChild(closeButton);
			header.appendChild(title);
			header.appendChild(actions);

			const body = document.createElement('div');
			body.className = 'sage-modal__body sage-modal__body--terminal';

			const terminal = document.createElement('div');
			terminal.className = 'sage-terminal';

			const queryLayout = document.createElement('div');
			queryLayout.className = 'sage-terminal__query-layout';

			const queryPanel = document.createElement('div');
			queryPanel.className = 'sage-terminal__query-panel';

			const queryLabel = document.createElement('label');
			queryLabel.className = 'sage-terminal__label';
			queryLabel.htmlFor = queryId;
			queryLabel.textContent = 'Query';

			const query = document.createElement('textarea');
			query.id = queryId;
			query.className = 'sage-terminal__query';
			query.spellcheck = false;
			query.placeholder = options.queryPlaceholder || '';

			queryPanel.appendChild(queryLabel);
			queryPanel.appendChild(query);

			const styles = document.createElement('div');
			styles.className = 'sage-terminal__styles';

			const stylesTitle = document.createElement('div');
			stylesTitle.className = 'sage-terminal__section-title';
			stylesTitle.textContent = 'Styles';

			const stylesContainer = document.createElement('div');
			stylesContainer.id = stylesContainerId;
			stylesContainer.className = 'sage-terminal__styles-list';

			styles.appendChild(stylesTitle);
			styles.appendChild(stylesContainer);

			queryLayout.appendChild(queryPanel);
			queryLayout.appendChild(styles);

			const terminalActions = document.createElement('div');
			terminalActions.className = 'sage-terminal__actions';

			const runButton = document.createElement('button');
			runButton.id = runButtonId;
			runButton.type = 'button';
			runButton.className = options.runButtonClassName || 'sage-action-button';
			runButton.textContent = options.runButtonText || 'Run';

			terminalActions.appendChild(runButton);

			const resultWrapper = document.createElement('div');
			resultWrapper.className = 'sage-terminal__result';

			const result = document.createElement('textarea');
			result.id = resultId;
			result.name = resultId;

			resultWrapper.appendChild(result);

			terminal.appendChild(queryLayout);
			terminal.appendChild(terminalActions);
			terminal.appendChild(resultWrapper);

			body.appendChild(terminal);

			dialog.appendChild(header);
			dialog.appendChild(body);

			modal.appendChild(backdrop);
			modal.appendChild(dialog);

			document.body.appendChild(modal);
		}
		else {
			modal.inert = modal.getAttribute('aria-hidden') !== 'false';
		}

		const title = document.getElementById(titleId);
		const query = document.getElementById(queryId);
		const runButton = document.getElementById(runButtonId);

		if (title && typeof options.titleText === 'string') {
			title.textContent = options.titleText;
		}

		if (query && typeof options.queryPlaceholder === 'string') {
			query.placeholder = options.queryPlaceholder;
		}

		if (runButton && typeof options.runButtonClassName === 'string' && options.runButtonClassName.trim()) {
			runButton.className = options.runButtonClassName;
		}

		if (runButton && typeof options.runButtonText === 'string' && options.runButtonText.trim()) {
			runButton.textContent = options.runButtonText;
		}

		return {
			modal: modal,
			backdrop: modal.querySelector('.sage-modal__backdrop'),
			closeButton: document.getElementById(closeButtonId),
			runButton: document.getElementById(runButtonId),
			query: document.getElementById(queryId),
			result: document.getElementById(resultId),
			stylesContainer: document.getElementById(stylesContainerId)
		};
	}

	window.createSAGETerminal = function (options) {
		options = options || {};

		const button = document.getElementById(options.buttonId);
		const elements = ensureTerminalModal(options);
		const modal = elements.modal;
		const backdrop = elements.backdrop;
		const closeButton = elements.closeButton;
		const runButton = elements.runButton;
		const query = elements.query;
		const result = elements.result;
		const stylesContainer = elements.stylesContainer;

		let resultEditor = null;
		let lastFocusedElement = null;

		if (!modal || !button || !closeButton || !runButton || !query || !result || !stylesContainer || !backdrop) {
			return null;
		}

		function notifyModalStateChanged() {
			if (typeof options.onModalStateChanged === 'function') {
				options.onModalStateChanged();
			}
		}

		function ensureResultEditor() {
			if (resultEditor) {
				return resultEditor;
			}

			resultEditor = CodeMirror.fromTextArea(result, {
				mode: 'application/json',
				lineNumbers: true,
				matchBrackets: true,
				autoCloseBrackets: true,
				readOnly: true,
				theme: 'default'
			});

			return resultEditor;
		}

		function getSelectedStyles() {
			const checkboxes = stylesContainer.querySelectorAll('input:checked');
			const values = [];

			checkboxes.forEach((checkbox) => {
				values.push(checkbox.value);
			});

			return values.join(', ');
		}

		function setResult(value) {
			const editor = ensureResultEditor();
			editor.setValue(formatJsonResult(value));
			editor.refresh();
		}

		function runQuery() {
			if (typeof options.onBeforeRun === 'function') {
				options.onBeforeRun();
			}

			try {
				const queryText = query.value.trim();
				const styles = getSelectedStyles();

				if (typeof getSAGEJsonValue !== 'function') {
					setResult({ error: 'SAGE terminal is unavailable.' });
					return;
				}

				setResult(getSAGEJsonValue(queryText, styles));
			}
			catch (error) {
				setResult({
					error: error && error.message ? error.message : String(error)
				});

				console.error('Terminal query failed.', error);
			}
		}

		function closeModal() {
			const activeElement = document.activeElement;

			if (activeElement && modal.contains(activeElement) && typeof activeElement.blur === 'function') {
				activeElement.blur();
			}

			modal.classList.remove('is-open');
			modal.setAttribute('aria-hidden', 'true');
			modal.inert = true;
			notifyModalStateChanged();

			window.requestAnimationFrame(() => {
				if (lastFocusedElement && document.contains(lastFocusedElement) && typeof lastFocusedElement.focus === 'function') {
					lastFocusedElement.focus();
				}
				else if (typeof button.focus === 'function') {
					button.focus();
				}
			});
		}

		function openModal() {
			if (typeof options.onBeforeOpen === 'function') {
				options.onBeforeOpen();
			}

			lastFocusedElement = document.activeElement;

			modal.inert = false;
			modal.classList.add('is-open');
			modal.setAttribute('aria-hidden', 'false');
			notifyModalStateChanged();

			try {
				if (typeof getSAGEJsonValue === 'function') {
					setResult(getSAGEJsonValue('', getSelectedStyles()));
				}
				else {
					setResult({ error: 'SAGE terminal is unavailable.' });
				}
			}
			catch (error) {
				setResult({
					error: error && error.message ? error.message : String(error)
				});
			}

			window.requestAnimationFrame(() => {
				query.focus();

				if (resultEditor) {
					resultEditor.refresh();
				}
			});
		}

		function renderStyles() {
			stylesContainer.textContent = '';

			terminalStyles.forEach((style) => {
				const label = document.createElement('label');
				const checkbox = document.createElement('input');
				const text = document.createElement('span');

				label.className = 'sage-terminal__style-item';
				label.title = style.description;

				checkbox.type = 'checkbox';
				checkbox.value = style.name;
				checkbox.className = 'sage-terminal__style-checkbox';
				checkbox.checked = style.name === 'all';
				checkbox.addEventListener('change', runQuery);

				text.textContent = style.name;

				label.appendChild(checkbox);
				label.appendChild(text);
				stylesContainer.appendChild(label);
			});
		}

		renderStyles();

		button.addEventListener('click', openModal);
		closeButton.addEventListener('click', closeModal);
		backdrop.addEventListener('click', closeModal);
		runButton.addEventListener('click', runQuery);

		query.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				runQuery();
			}
		});

		return {
			openModal,
			closeModal,
			runQuery,
			isOpen() {
				return modal.classList.contains('is-open');
			}
		};
	};
})();