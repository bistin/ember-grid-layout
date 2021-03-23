import { setProperties, action } from '@ember/object';
import {
    compact,
    moveElement,
    bottom,
    correctBounds,
    Layout,
    LayoutItem,
    LPPosition,
    IPos,
} from 'ember-grid-layout/utils';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Args {
    breakpointWidth?: number | null;
    layoutModel: Layout;
    positionKey?: keyof LayoutItem | null;
    width: number;
    rowHeight: number;
    updatePosition: Function;
}

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

export default class GridLayout extends Component<Args> {
    scrollElement: HTMLElement | null = null;
    /**
        padding, default [10, 10]
        @argument containerPadding
        @type {[number, number]?}
    */
    containerPadding = [10, 10];
    maxRows = 500; // infinite vertical growt

    /**
        margin, default [10, 10]
        @argument margin
        @type {[number, number]?}
    */
    margin = [10, 10];
    preventCollision = false;
    /**
        compactType: default to vertical
        @argument cols
        @type {'vertical'|'horizontal'?}
    */
    compactType: 'vertical' | 'horizontal' = 'vertical';
    breakpointWidth = this.args.breakpointWidth || null;

    /**
        columns, default to 2
        @argument cols
        @type {number?} 
    */
    cols: number = 2;

    /**
        array of layout object
        @argument layoutModel
        @type {layoutModel}
    */
    layoutModel = this.args.layoutModel; // in case the input array is not pure position array, we provide an item key

    /**
        object key of postion in layoutObject  
        @argument positionKey
        @type {string?}
    */
    positionKey: keyof LayoutItem | null = this.args.positionKey || null; // in case the input array is not pure position array, we provide an item key

    /**
        layout width
        @argument width
        @type {number}
    */
    width = this.args.width ? Number(this.args.width) : 800;

    /**
        height basic unit
        @argument rowHeight
        @type {number}
    */
    rowHeight = this.args.rowHeight ? Number(this.args.rowHeight) : 40;

    /**
        function that received new layout, if not privided, system will use temp function 
        @argument updatePosition
        @type {function?(newPostion: layoutModel, isProgress :boolean)}
    */
    updatePosition = this.args.updatePosition || null;

    @tracked containerHeight = 0;
    tmp: number | null = null;
    tmpLayout: Layout | null = null;

    constructor(owner: any, args: Args) {
        super(owner, args);
        this._updatePosition();
    }

    cloneToLayoutObj() {
        const {positionKey} = this;
        if (positionKey) {
            return this.layoutModel.map((d) => ({ ...d[positionKey] })).toArray();
        }
        return this.layoutModel.map((d) => ({ ...d }));
    }

    getPositionByIndex(index: number) {
        if (this.positionKey) {
            return this.layoutModel[index][this.positionKey];
        }
        return this.layoutModel[index];
    }

    @action
    contentObserber() {
        this._updatePosition();
    }

    calcXY(top: number, left: number) {
        const { margin, cols, rowHeight, maxRows, dragIndex } = this;
        const { w, h } = this.getPositionByIndex(dragIndex);
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

    updateNewLayoutToModel(newLayout: Layout) {
        newLayout.forEach((d) => (d.y = Math.round(d.y)));
        if (this.updatePosition) {
            this.updatePosition(newLayout, this.tmp != null);
        } else {
            const { positionKey } = this;
            if (positionKey) {
                this.layoutModel.forEach((d, i) => {
                    setProperties(d[positionKey], newLayout[i]);
                });
            } else {
                this.layoutModel.forEach((d, i) => {
                    setProperties(d, newLayout[i]);
                });
            }
        }
        const position = this.calcPosition(0, bottom(newLayout), 0, 0);
        this.containerHeight = position.top;
    }

    // TODO pass from outside
    @action
    widthObserver() {
        if (!this.breakpointWidth) {
            return;
        }
        const width = this.width;
        const prevCols = this.cols;
        if (width < this.breakpointWidth) {
            this.cols = 1;
        } else {
            this.cols = 2;
        }
        const tmpArr = this.cloneToLayoutObj();
        let layout2 = compact(
            correctBounds(tmpArr, { cols: this.cols }),
            this.compactType,
            this.cols,
        );

        if (prevCols === 1 && this.cols === 2) {
            layout2.forEach((pos, i) => {
                if (i % 2 === 1) {
                    pos.x = 1;
                }
            });
            layout2 = compact(layout2, this.compactType, this.cols);
        }
        this.updateNewLayoutToModel(layout2);
    }

    calcPosition(x: number, y: number, w: number, h: number) {
        const { margin, containerPadding, rowHeight } = this;
        console.log(margin, containerPadding, rowHeight);

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

    updateHeight(element: HTMLElement, [containerHeight]: [number]) {
        element.style.height = `${containerHeight}px`;
    }

    @action
    dragoveraction(e: DragEvent) {
        e.preventDefault();
        if (!this.startPoint || !this.startPosition || this.tmp  === null || this.dragIndex === null) {
            return;
        }
        const deltaX = e.clientX - this.startPoint.x;
        const deltaY = e.clientY - this.startPoint.y;
        const left = this.startPosition.left + deltaX;
        const top = this.startPosition.top + deltaY;
        const deltaTop = this.scrollElement ? this.scrollElement.scrollTop - this.tmp : 0;
        const pos = this.calcXY(top + deltaTop, left);
        this.onDrag(pos.x, pos.y, this.dragIndex);
    }

    @action
    dropaction(e: DragEvent) {
        e.preventDefault();
    }

    onDrag(x: number, y: number, index: number) {
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

    startPosition: LPPosition | null = null;
    startPoint: { x: number; y: number } | null = null;
    dragIndex: number = -1;

    @action
    onDragStart(
        startPosition: LPPosition,
        x: number,
        y: number,
        dragIndex: number,
        scrollElement: HTMLElement,
    ) {
        this.tmpLayout = this.cloneToLayoutObj();
        this.startPosition = startPosition;
        this.startPoint = { x, y };
        this.dragIndex = dragIndex;
        if (scrollElement) {
            this.scrollElement = scrollElement;
            this.tmp = scrollElement.scrollTop;
        }
    }

    @action
    onDragStop() {
        this.tmpLayout = null;
        this.tmp = null;
        if (this.updatePosition) {
            this.updatePosition(this.cloneToLayoutObj(), false);
        }
    }

    @action
    remove(item: LayoutItem) {
        this.layoutModel.removeObject(item);
        debounce(this, this._updatePosition, 100);
    }

    _updatePosition(tmpArr = this.cloneToLayoutObj()) {
        //const tmpArr = this.cloneToLayoutObj();
        const layout2 = compact(tmpArr, this.compactType, this.cols);
        const layout3 = correctBounds(layout2, { cols: this.cols });
        const layout4 = compact(layout3, this.compactType, this.cols);
        this.updateNewLayoutToModel(layout4);
    }

    @action
    modifyShape(item: LayoutItem, position: Partial<IPos>) {
        const index = this.layoutModel.indexOf(item);
        const tmpArr = this.cloneToLayoutObj();
        console.log(item);
        position.y = item.position.y - 0.001;
        setProperties(tmpArr[index], position);
        this._updatePosition(tmpArr);
        //debounce(this, this._updatePosition, 100);
    }
}
