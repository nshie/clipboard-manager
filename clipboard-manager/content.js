/* content.js */

chrome.runtime.sendMessage({ message: "add_tab" });
log("content-script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.message) {
		case "copy":
			log("received copy command");

			let selectedText = getSelectedText();
			if (selectedText.length === 0) return;
			chrome.runtime.sendMessage({
				message: "set_clipboard_value",
				slot: request.slot,
				value: selectedText,
			});
			break;
		case "paste":
			let activeEl = document.activeElement;
			if (!activeEl) {
				break;
			}
			log("activeEl: " + activeEl.outerHTML);

			let activeElTagName = activeEl
				? activeEl.tagName.toLowerCase()
				: null;
			if (activeElTagName != "text" && activeElTagName != "input" && activeElTagName != "textarea") break;

			log("was text area ig");

			getClipboardText(request.slot).then((text) => {
				activeEl.value += text;
			});
			break;
	}

	log(`Command: ${command}`);

	return true;
});

async function getClipboardText(slot) {
	let response = await chrome.runtime.sendMessage({
		message: "get_clipboard_value",
		slot: slot,
	});
	return response.text;
}

function getSelectedText() {
	var text = "";
	var activeEl = document.activeElement;
	if (!activeEl) {
		return "";
	}
	var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	if (
		activeElTagName == "textarea" ||
		(activeElTagName == "input" &&
			/^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
			typeof activeEl.selectionStart == "number")
	) {
		text = activeEl.value.slice(
			activeEl.selectionStart,
			activeEl.selectionEnd
		);
	} else if (window.getSelection) {
		text = window.getSelection().toString();
	}

	return text;
}

/*
chrome.storage.local.set({ key: value }).then(() => {
	log("Value is set");
});

chrome.storage.local.get(["key"]).then((result) => {
	log("Value currently is " + result.key);
});
*/

function log(string) {
	chrome.runtime.sendMessage({ message: "debug", value: string });
}
