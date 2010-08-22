naviAdmin
===========

Class for creating a drag and drop sorting and nesting items interface for lists of items, written in [MooTools](http://mootools.net/).

### [Demo](http://labs.antpaw.org/naviAdmin/).


How to Use
----------

	new naviAdmin({
		elemTree: $('tree'),
		onItemDropped: function(item, parent, itemId, parentId){
			console.log(this.serialize());
			console.log(itemId, parentId);
		}
	});