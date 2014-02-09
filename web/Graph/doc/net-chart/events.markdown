Events
==

Network Chart provides a set of events for your application to use.

- `onClick(this=chart, event)` - function to be called on click.
- `onRightClick(this=chart, event)` - function to be called on right click or long press.
- `onDoubleClick(this=chart, event)` - function to be called on double click.
- `onSelectionChanged(this=chart, event)` - function to be called after user has selected or deselected some data.


Specifying event handlers
--
The event handlers can be specified using settings or added dynamically.

Using settings:

    new NetworkChart({
      ...
      events:{
        onClick: function(event){...},
        onTimeChange: function(event){...}
      },
      ...
    });

Dynamically use `chart.on(event, handler)` and `chart.off(event,handler)` functions. In this case skip the "on" part in event name: `onClick` becomes `click`.

Default behavior
--
To disable default behavior, implement event handler and call `event.preventDefault()`.

- Right click event has default behavior of opening context menu.
- Double click event has default behavior of zooming in on clicked area.

Event properties
--

Events have the following properties

- `clickedLink, clickedNode` - object clicked on - for click events only.
- `clientX`, `clientY` - mouse coordinates - for click events only.
- `origin` - event origin, one of '"init"`, '"api"' or `"user"' - for selection change event only.

And the follwing functions

- `preventDefault()` - prevent default behavior.
