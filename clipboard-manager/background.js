/* background.js */

let clipboard = {};

let tabs = [];

/*
chrome.runtime.onInstalled.addListener(async () => {
	for (const cs of chrome.runtime.getManifest().content_scripts) {
		for (const tab of await chrome.tabs.query({ url: cs.matches })) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: cs.js,
			});
		}
	}
});
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.message) {
		case "debug":
			console.log(request.value);
			break;
		case "add_tab":
			tabs.push(sender.tab);
			break;
		case "set_clipboard_value":
			clipboard[request.slot] = request.value;
			console.log("setting clipboard value to: " + request.value);
			break;
		case "get_clipboard_value":
			sendResponse({ text: clipboard[request.slot] });
			break;
	}

	return true;
});

chrome.commands.onCommand.addListener((command) => {
	let parse = command.split("-");
	let slot = parse[1];

	if (parse[0] === "paste" && !(slot in clipboard)) return;

	//sendCommandToCurrentTab(parse[0], slot);

	for (tab of tabs) {
		chrome.tabs.sendMessage(tab.id, {
			message: parse[0],
			slot: slot,
		});
	}

	console.log("background.js received command: " + command);
	console.log("tabs: " + tabs);

	return true;
});

async function sendCommandToCurrentTab(command, slot) {
	getCurrentTab().then((currentTab) => {
		chrome.tabs.sendMessage(currentTab.id, {
			message: command,
			slot: slot,
		});
	});

	console.log("sent message to current tab");
}

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	// `tab` will either be a `tabs.Tab` instance or `undefined`.
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}
