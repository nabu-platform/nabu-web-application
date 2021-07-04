function wtf() {
	
}
function toggle(element) {
	if (element.classList.contains("show")) {
		element.classList.remove("show");	
	}
	else {
		element.classList.add("show");	
	}
}
function generateToc() {
	var content = document.getElementById("content");
	var entries = [];
	generateTocFor(content, entries);
	
	var addToToc = function(entry) {
		var a = document.createElement("a");
		a.setAttribute("class", "toc-entry toc-entry-" + entry.depth);
		a.innerHTML = entry.title;
		a.onclick = function() {
			entry.element.scrollIntoView();
		}
		document.getElementById("toc").appendChild(a);
	}
	
	for (var i = 0; i < entries.length; i++) {
		 addToToc(entries[i]);
		 console.log("adding", entries[i]);
	}
}
function generateTocFor(element, entries) {
	for (var i = 0; i < element.childNodes.length; i++) {
		if (element.childNodes[i].tagName && element.childNodes[i].tagName.toLowerCase().substring(0, 1) == "h") {
			var title = element.childNodes[i].innerHTML;
			if (title) {
				var depth = parseInt(element.childNodes[i].tagName.substring(1, 2));
				if (!isNaN(depth)) {
					entries.push({
						title: title,
						depth: depth,
						element: element.childNodes[i]
					});
				}
			}
		}
		// recurse
		if (element.childNodes[i].childNodes) {
			generateTocFor(element.childNodes[i], entries);	
		}
	}
}
window.addEventListener("load", function () {
	generateToc();	
});