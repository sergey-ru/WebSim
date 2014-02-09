Data filters
==

A series of filer functions can be applied to data in the browser.
This allows interactive selection of displayed parts of a graph without reloading data.

The following filter functions are available:

* `settings.filters.nodeFilter(nodeData, linksData[])` = true/false - determines if a particular node is displayed
* `settings.filters.linkFilter(linkData, sourceNodeData, targetNodeData)` = true/false - determines if a particular link is displayed
* `settings.filters.nodeLinksProcessor(nodeData, linksData[])` = array of links - determines witch links to display relative to a specific node.
* `settings.filters.multilinkProcessor(linksData[], fromNodeData, toNodeData)` = array of links - determines witch how to handle multiple links between two nodes.

 The filter functions are executed in the order shown above.

Changing filter functions
==
To change filter functions call `chart.updateSettings(settingsObj)` with new filter functions specified in the `settingsObj`.

You can also call `chart.updateFilters()` to force reevaluation of filter functions. For example if their behavior has changed.
