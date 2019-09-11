import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import { setProperties, action, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { compact, moveElement, bottom, correctBounds } from 'ember-grid-layout/utils';

@classic
@tagName('')
export default class GridLayoutComponent extends Component {
    positionKey = null; // in case the input array is not pure position array, we provide an item key
    scrollElement = null;
    autoSize = true;
    cols = 2;
    // width = this.width || 800;
    draggableHandle = '';
    draggableCancel = '';
    containerPadding = [10, 10];
    rowHeight = 35;
    maxRows = 500; // infinite vertical growt
    margin = [10, 10];
    isDraggable = true;
    isResizable = true;
    useCSSTransforms = true;
    verticalCompact = true;
    preventCollision = false;
    compactType = 'vertical';
    breakpointWidth = this.breakpointWidth || 300;

    init() {
        super.init(...arguments);
        this.width = this.width || 800;
        this.updateNewLayoutToModel(this.layoutModel.map(
            d => d[this.positionKey]));
    }

    cloneToLayoutObj() {
        if (this.positionKey) {
            return this.layoutModel.map((d) => ({ ...d[this.positionKey] })).toArray();
        }
        return this.layoutModel.map((d) => ({ ...d }));
    }

    getPositionByIndex(index) {
        if (this.positionKey) {
            return this.layoutModel[index][this.positionKey];
        }
        return this.layoutModel[index];
    }

    @action
    onResize(element) {
        // console.log('div resized!', element);
        const width = element.offsetWidth;
        this.set('width', width);
        this.widthObserver(width);
    }

    calcXY(top, left) {
        const { margin, cols, rowHeight, maxRows } = this;
        const { w, h } = this.getPositionByIndex(this.dragIndex);
        const colWidth = this.calcColWidth();
        let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        let y = Math.round((top - margin[1]) / (rowHeight + margin[1]));
        // Capping
        x = Math.max(Math.min(x, cols - w), 0);
        y = Math.max(Math.min(y, maxRows - h), 0);
        return { x, y };
    }

    calcColWidth() {
        const { margin, containerPadding, width, cols } = this;
        return (width - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
    }

    updateNewLayoutToModel(newLayout) {
        if (this.positionKey) {
            this.layoutModel.forEach((d, i) => {
                setProperties(d[this.positionKey], newLayout[i]);
            });
        } else {
            this.layoutModel.forEach((d, i) => {
                setProperties(d, newLayout[i]);
            });
        }

        const position = this.calcPosition(0, bottom(newLayout), 0, 0);
        this.set('containerHeight', position.top);
    }

    widthObserver(width) {
        if (width < this.breakpointWidth) {
            this.set('cols', 1);
        } else {
            this.set('cols', 2);
        }
        const tmpArr = this.cloneToLayoutObj();
        const layout2 = compact(
            correctBounds(tmpArr, { cols: this.cols }),
            this.compactType,
            this.cols,
        );
        this.updateNewLayoutToModel(layout2);
    }

    calcPosition(x, y, w, h) {
        const { margin, containerPadding, rowHeight } = this;
        const colWidth = this.calcColWidth();

        const out = {
            left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
            top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
            // 0 * Infinity === NaN, which causes problems with resize constraints;
            // Fix this if it occurs.
            // Note we do it here rather than later because Math.round(Infinity) causes deopt
            width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
            height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1]),
        };

        return out;
    }

    // containerHeight
    @computed('containerHeight')
    get containerStyle() {
        return htmlSafe(`height:${this.containerHeight}px;`);
    }

    dragoveraction(e) {
        const deltaX = e.clientX - this.startPoint.x;
        const deltaY = e.clientY - this.startPoint.y;
        const left = this.startPosition.left + deltaX;
        const top = this.startPosition.top + deltaY;
        const deltaTop = this.scorllElememt ? this.scorllElememt.scrollTop - this.tmp : 0;

        const pos = this.calcXY(top + deltaTop, left);
        this.onDrag(pos.x, pos.y, this.dragIndex);
    }

    onDrag(x, y, index) {
        if (!this.tmpLayout) {
            return;
        }
        const tmpArr = [...this.tmpLayout].map((d) => ({ ...d }));
        const newL = tmpArr[index];
        const isUserAction = true;

        const layout = moveElement(
            tmpArr,
            newL,
            x,
            y,
            isUserAction,
            this.preventCollision,
            this.compactType,
            this.cols,
        );

        const layout2 = compact(layout, this.compactType, this.cols);

        this.tmpLayout = layout2;
        this.updateNewLayoutToModel(layout2);
    }

    @action
    onDragStart(startPosition, x, y, dragIndex, scrollElement) {
        this.tmpLayout = this.cloneToLayoutObj();
        this.set('startPosition', startPosition);
        this.set('startPoint', { x, y });
        this.set('dragIndex', dragIndex);
        if (scrollElement) {
            this.scorllElememt = scrollElement;
            this.tmp = scrollElement.scrollTop;
        }
    }

    @action
    onDragStop() {
        this.tmpLayout = null;
        this.tmp = null;
    }

    @action
    remove(item) {
        this.layoutModel.removeObject(item);
        const tmpArr = this.cloneToLayoutObj();
        const layout2 = compact(tmpArr, this.compactType, this.cols);
        this.updateNewLayoutToModel(layout2);
    }
}

// onLayoutChange: noop,
// onDragStart: noop,
// onDrag: noop,
// onDragStop: noop,
// onResizeStart: noop,
// onResize: noop,
// onResizeStop: noop
