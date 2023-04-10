import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from '../applyDecoratedDescriptor-8565840b.js';
import { _ as _defineProperty } from '../defineProperty-f419f636.js';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, setProperties } from '@ember/object';
import { bottom, compact, correctBounds, moveElement } from '../utils/index.js';
import { debounce } from '@ember/runloop';

var TEMPLATE = hbs("<div \r\n    class=\"grid-layout\" \r\n    {{on \"dragover\" this.dragoveraction}}\r\n    {{on \"drop\"  this.dropaction}}\r\n    {{did-insert this.updateHeight this.containerHeight}}\r\n    {{did-insert this.widthObserver this.width}}\r\n    {{did-update this.updateHeight this.containerHeight}}\r\n    {{did-update this.widthObserver this.width}}\r\n    {{did-update this.colsObserver this.cols}}\r\n    {{did-update this.contentObserber this.layoutModel.length}}\r\n>\r\n    {{yield (hash\r\n      containerWidth=this.width\r\n      margin=this.margin\r\n      rowHeight=this.rowHeight\r\n      containerPadding=this.containerPadding\r\n      cols=this.cols\r\n      maxRows=this.maxRows\r\n      onDragStart=(fn this.onDragStart)\r\n      onDragStop=(fn this.onDragStop)\r\n      remove=(fn this.remove)\r\n      modifyShape=(fn this.modifyShape)\r\n      ) this.layoutModel}}\r\n</div>\r\n");

var _class, _descriptor, _descriptor2;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/**
  A component served as grid layout container.
  ```hbs
    <GridLayout
      @layoutModel={{this.wrappedLayout}}
      @positionKey="position"
      @width={{this.width}}
      @rowHeight={{40}}
      @updatePosition={{fn this.updatePosition}} as |grid layoutModel|>
      {{#each layoutModel as |item index|}}
        <GridItem
            @grid={{grid}}
            @pos={{get item "position"}}
            @index={{index}}
            @handle= {{array ".dragHandle" ".dragHandle2"}}
            @scrollContainerSelector="html">
        </GridItem>
      {{/each}}
    </GridLayout>
  ```
  @class GridLayout
  @yield {grid} grid pass to GridItem
  @yield {layoutModel} layoutModel
  @public
*/

let GridLayout = (_class = class GridLayout extends Component {
  /**
      padding, default [10, 10]
      @argument containerPadding
      @type {[number, number]?}
  */
  // infinite vertical growt

  /**
      margin, default [10, 10]
      @argument margin
      @type {[number, number]?}
  */

  /**
      compactType: default to vertical
      @argument cols
      @type {'vertical'|'horizontal'?}
  */

  /**
      columns, default to 2
      @argument cols
      @type {number?}
  */

  /**
      array of layout object
      @argument layoutModel
      @type {layoutModel}
  */
  get layoutModel() {
    return this.args.layoutModel; // in case the input array is not pure position array, we provide an item key
  }
  /**
      object key of postion in layoutObject
      @argument positionKey
      @type {string?}
  */


  // in case the input array is not pure position array, we provide an item key

  /**
      layout width
      @argument width
      @type {number}
  */
  get width() {
    return this.args.width ? Number(this.args.width) : 800;
  }
  /**
      height basic unit
      @argument rowHeight
      @type {number}
  */


  constructor() {
    super(...arguments);

    _defineProperty(this, "scrollElement", null);

    _defineProperty(this, "containerPadding", this.args.containerPadding || [10, 10]);

    _defineProperty(this, "maxRows", this.args.maxRows || 500);

    _defineProperty(this, "margin", this.args.margin || [10, 10]);

    _defineProperty(this, "preventCollision", false);

    _defineProperty(this, "compactType", this.args.compactType || 'vertical');

    _initializerDefineProperty(this, "cols", _descriptor, this);

    _defineProperty(this, "prevCols", this.args.cols || 2);

    _defineProperty(this, "positionKey", this.args.positionKey || null);

    _defineProperty(this, "rowHeight", this.args.rowHeight ? Number(this.args.rowHeight) : 40);

    _defineProperty(this, "dragIndex", null);

    _initializerDefineProperty(this, "containerHeight", _descriptor2, this);

    this._updatePosition();
  }

  cloneToLayoutObj() {
    if (this.positionKey) {
      return this.layoutModel.map(d => _objectSpread({}, d[this.positionKey]));
    }

    return this.layoutModel.map(d => _objectSpread({}, d));
  }

  getPositionByIndex(index) {
    if (this.positionKey) {
      return this.layoutModel[index][this.positionKey];
    }

    return this.layoutModel[index];
  }

  contentObserber() {
    this._updatePosition();
  }

  calcXY(top, left) {
    const {
      margin,
      cols,
      rowHeight,
      maxRows
    } = this;
    const {
      w,
      h
    } = this.getPositionByIndex(this.dragIndex);
    const colWidth = this.calcColWidth();
    let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
    let y = Math.round((top - margin[1]) / (rowHeight + margin[1])); // Capping

    x = Math.max(Math.min(x, cols - w), 0);
    y = Math.max(Math.min(y, maxRows - h), 0);
    return {
      x,
      y
    };
  }

  calcColWidth() {
    const {
      margin,
      containerPadding,
      width,
      cols
    } = this;
    return (width - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
  }

  updateNewLayoutToModel(newLayout) {
    newLayout.forEach(d => d.y = Math.round(d.y));

    if (this.args.updatePosition) {
      this.args.updatePosition(newLayout, this.tmp != null);
    } else {
      if (this.positionKey) {
        this.layoutModel.forEach((d, i) => {
          setProperties(d[this.positionKey], newLayout[i]);
        });
      } else {
        this.layoutModel.forEach((d, i) => {
          setProperties(d, newLayout[i]);
        });
      }
    }

    const position = this.calcPosition(0, bottom(newLayout), 0, 0);
    this.containerHeight = position.top;
  } // TODO pass from outside


  widthObserver() {
    if (!this.args.breakpointWidth) {
      return;
    }

    const width = this.width;

    if (width < this.args.breakpointWidth) {
      this.cols = 1;
    } else {
      this.cols = 2;
    }
  }

  colsObserver() {
    if (this.prevCols === this.cols) {
      return;
    }

    const tmpArr = this.cloneToLayoutObj();
    let layout2 = compact(correctBounds(tmpArr, {
      cols: this.cols
    }), this.compactType, this.cols);

    if (this.prevCols === 1 && this.cols === 2) {
      layout2.forEach((pos, i) => {
        if (i % 2 === 1) {
          pos.x = 1;
        }
      });
      layout2 = compact(layout2, this.compactType, this.cols);
    }

    this.prevCols = this.cols;
    this.updateNewLayoutToModel(layout2);
  }

  calcPosition(x, y, w, h) {
    const {
      margin,
      containerPadding,
      rowHeight
    } = this;
    const colWidth = this.calcColWidth();
    const out = {
      left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
      top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
      // 0 * Infinity === NaN, which causes problems with resize constraints;
      // Fix this if it occurs.
      // Note we do it here rather than later because Math.round(Infinity) causes deopt
      width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
      height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1])
    };
    return out;
  }

  updateHeight(element, [containerHeight]) {
    element.style.height = `${containerHeight}px`;
  }

  dragoveraction(e) {
    e.preventDefault();
    const deltaX = e.clientX - this.startPoint.x;
    const deltaY = e.clientY - this.startPoint.y;
    const left = this.startPosition.left + deltaX;
    const top = this.startPosition.top + deltaY;
    const deltaTop = this.scorllElememt ? this.scorllElememt.scrollTop - this.tmp : 0;
    const pos = this.calcXY(top + deltaTop, left);
    this.onDrag(pos.x, pos.y, this.dragIndex);
  }

  dropaction(e) {
    e.preventDefault();
  }

  onDrag(x, y, index) {
    if (!this.tmpLayout) {
      return;
    }

    const tmpArr = [...this.tmpLayout].map(d => _objectSpread({}, d));
    const newL = tmpArr[index];
    const isUserAction = true;
    const layout = moveElement(tmpArr, newL, x, y, isUserAction, this.preventCollision, this.compactType, this.cols);
    const layout2 = compact(layout, this.compactType, this.cols);
    this.tmpLayout = layout2;
    this.updateNewLayoutToModel(layout2);
  }

  onDragStart(startPosition, x, y, dragIndex, scrollElement) {
    this.tmpLayout = this.cloneToLayoutObj();
    this.startPosition = startPosition;
    this.startPoint = {
      x,
      y
    };
    this.dragIndex = dragIndex;

    if (scrollElement) {
      this.scorllElememt = scrollElement;
      this.tmp = scrollElement.scrollTop;
    }
  }

  onDragStop() {
    this.tmpLayout = null;
    this.tmp = null;

    if (this.args.updatePosition) {
      this.args.updatePosition(this.cloneToLayoutObj(), false);
    }
  }

  remove(item) {
    this.layoutModel.removeObject(item);
    debounce(this, this._updatePosition, 100);
  }

  _updatePosition(tmpArr = this.cloneToLayoutObj()) {
    //const tmpArr = this.cloneToLayoutObj();
    const layout2 = compact(tmpArr, this.compactType, this.cols);
    const layout3 = correctBounds(layout2, {
      cols: this.cols
    });
    const layout4 = compact(layout3, this.compactType, this.cols);
    this.updateNewLayoutToModel(layout4);
  }

  modifyShape(item, position) {
    const index = this.layoutModel.indexOf(item);
    const tmpArr = this.cloneToLayoutObj();
    position.y = item.position.y - 0.001;
    setProperties(tmpArr[index], position);

    this._updatePosition(tmpArr);
  }

}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "cols", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.args.cols || 2;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "containerHeight", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
}), _applyDecoratedDescriptor(_class.prototype, "contentObserber", [action], Object.getOwnPropertyDescriptor(_class.prototype, "contentObserber"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "widthObserver", [action], Object.getOwnPropertyDescriptor(_class.prototype, "widthObserver"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "colsObserver", [action], Object.getOwnPropertyDescriptor(_class.prototype, "colsObserver"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dragoveraction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "dragoveraction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "dropaction", [action], Object.getOwnPropertyDescriptor(_class.prototype, "dropaction"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "onDragStart", [action], Object.getOwnPropertyDescriptor(_class.prototype, "onDragStart"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "onDragStop", [action], Object.getOwnPropertyDescriptor(_class.prototype, "onDragStop"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "remove", [action], Object.getOwnPropertyDescriptor(_class.prototype, "remove"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "modifyShape", [action], Object.getOwnPropertyDescriptor(_class.prototype, "modifyShape"), _class.prototype)), _class);
setComponentTemplate(TEMPLATE, GridLayout);

export { GridLayout as default };
