Loading overview 
--
Net Chart features dynamic data loading and caching.

Each node and link has a unique identified that is used to request data on specific object.
The identifiers are arbitrary strings specified by the user. 

When created the chart requests initial set of nodes as specified in the configuration.
Net Chart requests a list of nodes and expects the server to return all neighbor nodes and links to them.  

For example a single node request must yield the following result: 

![One node request](images/initialS.png)

If user clicks on a node, additional data is fetched for that node.
Both data sets are merged together to form a single network. 

![One node request](images/expanded.png)


The server must set `expanded=true` for nodes that has all links listed. 
Failing to do so will make Net Chart request data on that node again. 

Server can return more data than requested by marking more nodes with `expanded`.
Data will be stored in cache and used without performing additional server requests.  
  

Data request
--

Data is requested via a data `url` or `function(nodeList, success,error)` specified in settings.
This function is called whenever new data is needed. 

URL parameters:

* `nodeList`- list of node identifiers as comma separated string. Eg: "node1,node2,node3".  

Function parameters: 

* `nodeList`- list of node identifiers, array if strings.
* `success(data)` - callback function when data arrived.
* `error()` - callback function on failure to get data. 

`nodeList` can be null. Null value means "return all the nodes you have".

The function must return immediately and use `success()` and `error()` callbacks to return data. Calling `success()` immediately is also okay.

Data response
--
The response is formatted in JSON, with the following fields:
 
* `nodes` - array of node objects.
* `links` - array of link objects.

Each node object must have the following fields:

* `id` - string uniquely identifying the node object.
* `expanded=true` - for all nodes that have it's neighbors loaded.

Each link object must have the following fields:

* `id` - string uniquely identifying the link object.
* `from` - node id the link connects to 
* `to` - second node id the link connects to

Nodes and links can contain any other fields that can be used later by the user.
See [style](style.html) on how to customize node and link look from data. 


The nodes array should contain all the nodes that where requested, but it's not strictly required. It can contain more nodes, they will be cached for later use. 

Links array must contain all links connecting to the requested nodes.


Merging data
--
Links and nodes can repeat over multiple requests.
The data is merged, newer result taking precedence over the older.
Response with `expanded=true` is considered authoritative and will not be overridden by responses without the expanded flag set.

For example if first request returned node:

      {"id":"nJoe", "name":"Joe-needsMoreLoading","balance":null}

and the second one returned:

      {"id":"nJoe", "name":"Joe", "balance":1000}
the resulting data is:
	  
      {"id":"nJoe", "name":"Joe", "balance":1000}


Static data
--

If you do not need dynamic data loading, you can specify static data, using the `data.preloaded` setting. 
 
For example:

    chart = new TimeChart({
      data:{
	      preloaded: {
			nodes: [...],
			links: [...]
	      }
      }
    });
