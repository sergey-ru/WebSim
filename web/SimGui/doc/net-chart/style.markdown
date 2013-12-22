Display style
==

The display style of nodes and links is fully customizable.

Style attributes
==
Node and link objects have a number of style attributes.

__Node attributes__

* `id`: node ID
* `data`: node data, as received from data function
* `links`: array of visible link objects that connect to this node
* `dataLinks`: array of all links data that connect to this node
* `loading`: true if node data is still loading 

__Node style attributes__
 
* `radius`: node radius
* `label`: label text
* `labelStyle`: label rendering style
* `labelBackground`: fill and stoke for label background
* `fillColor`: fill color 
* `lineColor`: border line color
* `lineWidth`: border line width in pixels
* `image`: image URL to render
* `icons`: array of icons to attach to the node, see icon attributes.
* `hilight`: highlight object if needed, see hilight attributes. 

__Link attributes__

* `id`: link ID
* `data`: link data, as received from data function
* `from`: from node
* `to`: to node

__Link style attributes__

* `radius`: radius of the link line (actual size is 2x radius)
* `length = 1`: link length multiplier. Each link has a default length based on node sizes and number of neighbor nodes. The default length gets multiplied by this value.
* `strength = 1`: link strength. When there is no room to place all links at desired length, links with bigger strength take precedence. Useful range: `[0.. 10]`.
* `fillColor`: color of the link
* `label`: link label text
* `labelStyle`: label rendering style
* `labelBackground`: fill and stoke for label background
* `dashed`: if true link is drawn as dashed line
* `fromDecoration`: decoration at the "from" end, one of "circle", "arrow"
* `toDecoration`: decoration at the "to" end, one of "circle", "arrow"
* `fromIcons`: array of icons at the "from" end, see icon attributes.
* `toIcons`: array of icons at the "to" end, see icon attributes.
* `hilight`: hilight object if needed, see highlight attributes.

__Icon attributes__

Icons are painted as circles diameter `settings.style.iconSize`, default is 16px. 
The actual icon image must be in circular shape with transparent background.

* `image`: icon image URL
* `imageSlicing = [left, top, width, height]`: optional slicing to use tiled images.     

__Highlight attributes__

Highlight is additional circle around the node.
__Link highlights are not implemented yet.__

* `fillColor`: fill color
* `sizeProportional`: size as proportion of the radius
* `sizeConstant`: extra size in pixels 

Styling process
===
When a node or link is added to the chart, style calculation takes place. Style is recalculated whenever the node/link changes.

The style calculation uses multiple steps to compute the final style.
 
* initial style is applied from `settings.style.(node/link)Style`
* node/link data `style` attribute is applied if present
* `settings.style.(node/link)Rules` functions are called

The style rule functions are called in lexicographic order.
Style function receive node/link object and can change any property to it.

Radius limits
===

To prevent excessive object size radius is limited after styling

* `settings.style.nodeRadiusExtent[min, max]` limits node size, defaults to `[5,100]`.
* `settings.style.linkRadiusExtent[min, max]` limits link size,  defaults to `[0.2,10]`.