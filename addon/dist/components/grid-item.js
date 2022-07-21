import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from '../applyDecoratedDescriptor-8565840b.js';
import { _ as _defineProperty } from '../defineProperty-f419f636.js';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import { computed, action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

var TEMPLATE = hbs("{{!-- template-lint-disable  --}}\n<div\n    draggable={{this.canDrag}}\n    {{did-insert this.insertAction}}\n    {{position this.itemPosition}}\n    {{on \"dragstart\" this.dragStartAction}}\n    {{on \"drag\" this.dragMoveAction}}\n    {{on \"dragend\" this.dragEndAction}}\n    {{on \"mouseover\" this.mouseOverAction}}\n    {{on \"mouseleave\" this.mouseLeaveAction}}\n    class=\"grid-item\" >\n    {{yield}}\n</div>\n\n\n");

var _dec, _class, _descriptor;

function getScrollParent(el) {
  let returnEl;

  if (el == null) {
    return null;
  } else if (el.scrollHeight > el.clientHeight) {
    returnEl = el;
  } else {
    returnEl = getScrollParent(el.parentNode);
  }

  return returnEl;
}
/**
  A component served as grid layout container.
  ```hbs
    <GridItem
        @grid={{grid}}
        @pos={{get item "position"}}
        @index={{index}}
        @handle= {{array ".dragHandle" ".dragHandle2"}}
        @scrollContainerSelector="html">
    </GridItem>
  ```
  @class GridItem
  @public
*/


let GridItem = (_dec = computed('args.pos.{x,y,w,h}', 'args.grid.containerWidth'), (_class = class GridItem extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "tmpY", null);

    _defineProperty(this, "scrollContainer", null);

    _defineProperty(this, "handle", this.args.handle);

    _initializerDefineProperty(this, "canDrag", _descriptor, this);
  }

  get itemPosition() {
    if (!this.args.pos) {
      return '';
    }

    const {
      x,
      y,
      w,
      h
    } = this.args.pos;
    return this.calcPosition(x, y, w, h);
  }

  insertAction() {
    let scrollContainer = this.args.scrollContainerSelector ? document.querySelector(this.args.scrollContainerSelector) : getScrollParent(document.querySelector('.grid-layout').parentNode);

    if (scrollContainer) {
      this.scrollContainer = scrollContainer;
    }
  }

  calcPosition(x, y, w, h) {
    const {
      margin,
      containerPadding,
      rowHeight,
      containerWidth,
      cols
    } = this.args.grid;
    const colWidth = (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
    return {
      left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
      top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
      // 0 * Infinity === NaN, which causes problems with resize constraints;
      // Fix this if it occurs.
      // Note we do it here rather than later because Math.round(Infinity) causes deopt
      width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
      height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1])
    };
  }

  updateScrollPosition(pointerY, distance) {
    const innerHeightOrClientHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollEl = this.scrollContainer;
    if (!scrollEl) return;

    if (pointerY < 100 && distance <= 0) {
      scrollEl.scrollTop += (pointerY - 100) / 3;
    }

    if (pointerY > innerHeightOrClientHeight - 100 && distance >= 0) {
      scrollEl.scrollTop += (innerHeightOrClientHeight - pointerY) / 5;
    }
  }

  dragStartAction(e) {
    e.dataTransfer.setData('text/plain', 'handle'); //e.dataTransfer.dropEffect = "move"

    const newPosition = {
      top: 0,
      left: 0
    };
    let node = e.target;
    const {
      offsetParent
    } = node; // node = node.children[0];

    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    newPosition.left = clientRect.left - parentRect.left + offsetParent.scrollLeft;
    newPosition.top = clientRect.top - parentRect.top + offsetParent.scrollTop;
    this.args.grid.onDragStart(newPosition, e.clientX, e.clientY, this.args.index, this.scrollContainer);
    return false;
  }

  dragMoveAction(e) {
    //console.log(e.target)
    e.target.style.display = 'none';

    if (!this.tmpY) {
      this.tmpY = e.clientY;
    }

    const distance = e.clientY - this.tmpY;
    this.updateScrollPosition(e.clientY, distance);
    this.tmpY = e.clientY;
  }

  dragEndAction(e) {
    this.args.grid.onDragStop();
    this.tmpY = null;
    e.target.style.display = '';
  }

  mouseOverAction(e) {
    if (!this.handle) {
      return;
    }

    const canDrag = Array.isArray(this.handle) ? this.handle.some(handle => e.target.matches(handle)) : e.target.matches(this.handle);
    this.canDrag = canDrag;
  }

  mouseLeaveAction() {
    if (!this.handle) {
      return;
    }

    this.canDrag = false;
  }

}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "canDrag", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return !this.args.handle;
  }
}), _applyDecoratedDescriptor(_class.prototype, "itemPosition", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "itemPosition"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "insertAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "insertAction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dragStartAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "dragStartAction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dragMoveAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "dragMoveAction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dragEndAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "dragEndAction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "mouseOverAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "mouseOverAction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "mouseLeaveAction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "mouseLeaveAction"), _class.prototype)), _class));
setComponentTemplate(TEMPLATE, GridItem);

export { GridItem as default };
