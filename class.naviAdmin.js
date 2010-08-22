/*
---

script: class.naviAdmin.js

description: Class for creating a drag and drop sorting and nesting items interface for lists of items.

license: MIT-style license

authors:
- Anton Pawlik

requires:
- /Drag.Move

...
*/
var naviAdmin = new Class({
	
	Implements: [Options, Events],
	
	options: {/*
		onItemDropped: $empty(item, parent, itemId, parentId),*/
		elemTree: null,
		dragSpan: new Element('span', {'class': 'drag'}),
		pos_helper: new Element('li', {'class': 'pos_helper'})
	},
	
	elemTree: null,
	lis: [],
	droppablePlaceholder: [],
	drag: null,
	
	initialize: function(_options) {
		var opts = ($type(_options) != 'object' ? {'elemTree': _options} : _options);
		if (!$defined(opts.elemTree)) { alert('naviAdmin - no object'); return; }
		this.setOptions(opts);
		
		this.elemTree = this.options.elemTree;
		
		this.createPosHelper();
		
		this.lis.each(function(elem){
			this.options.dragSpan.clone()
				.inject(elem.getElement('div'), 'top')
				.addEvent('mousedown', this.initDrag.bind(this))
				.addEvent('click', this.initDrag.bind(this));
		}.bind(this));
	},
	
	createPosHelper: function(){
		this.lis = this.elemTree.getElements('li').addClass('item');
		
		this.elemTree.getElements('.pos_helper').dispose();
		
		this.droppablePlaceholder = [];
		this.lis.each(function(elem){
			this.droppablePlaceholder.push(
				this.options.pos_helper.clone().inject(elem, 'after')
			);
		}.bind(this));
		
		this.elemTree.getElements('ol').concat(this.elemTree).each(function(elem){
			this.droppablePlaceholder.push(
				this.options.pos_helper.clone().inject(elem, 'top')
			);
		}.bind(this));
	},
	
	initDrag: function(event){
		var current_li = event.target.getParent('li');
		var dropAndMoveAsChild = [];
		this.lis.each(function(li){
			if (current_li !== li) dropAndMoveAsChild.push(li);
		});
	
		this.drag = new Drag.Move(current_li, {
			handle: event.target,
			droppables: dropAndMoveAsChild.concat(this.droppablePlaceholder),
			onStart: function(element, hoverElement){
				element
					.addClass('moved')
					.getNext('li').dispose();
			},
			onEnter: function(element, hoverElement){
				hoverElement.addClass('hover');
			},
			onLeave: function(element, hoverElement){
				hoverElement.removeClass('hover');
			},
			onDrop: this.liDropped.bind(this)
		});
		this.elemTree.addClass('drag_active');
		this.drag.start(event);
	},
	
	liDropped: function(element, hoverElement, event){
		this.elemTree.removeClass('drag_active');
		this.drag.detach();
		if (hoverElement) {
			var parentLiId, parentLi, ol;
			var li = element.erase('style').removeClass('moved').dispose();
			
			if (hoverElement.hasClass('pos_helper')) {
				parentLi = hoverElement.getParent('li');
				parentLiId = (parentLi) ? this.getId(parentLi.get('id')).id : 0;
				
				li.inject(hoverElement, 'after');
			}
			else {
				ol = hoverElement.getElement('ol');
				if( ! ol){
					ol = new Element('ol').inject(hoverElement);
				}
				li.inject(ol);
				
				parentLiId = this.getId(hoverElement.get('id')).id;
			}
			
			this.fireEvent('itemDropped', [
				li, hoverElement, 
				this.getId(li.get('id')).id,
				parentLiId
			]);
			
			hoverElement.removeClass('hover');
		}
		else {
			element.erase('style').removeClass('moved');
		}
		this.createPosHelper();
	},
	getId: function(str){
		var nameId;
		var output = {'name': null, 'id': null};
		
		if ( ! str) return output;
		
		nameId = str.match(/(.+)[-=_](.+)/);
		if ( ! nameId) return output;
		
		output.name = nameId[1];
		output.id = nameId[2];
		
		return output;
	},
	
	serialize: function(){
		var idsPosition = [];
		this.elemTree.getElements('li.item').each(function(el) {
			var nameId = this.getId(el.get('id'));
			if (nameId) {
				idsPosition.push(nameId.name+'[]='+nameId.id);
			}
		}.bind(this));
		return idsPosition.join('&');
	}
});