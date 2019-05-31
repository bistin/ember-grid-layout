import Component from '@ember/component';
import { setProperties, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { htmlSafe } from '@ember/string';
import { compact, moveElement, bottom, correctBounds } from "ember-grid/utils"; 

export default Component.extend({
    tagName: '',
    init() {
        this._super();
        this.setProperties({
            autoSize: true,
            cols: 2,
            className: "",
            style: {},
            width: this.width || 800,
            draggableHandle: "",
            draggableCancel: "",
            containerPadding: [10, 10],
            rowHeight: 35,
            maxRows: 500, // infinite vertical growth
            margin: [10, 10],
            isDraggable: true,
            isResizable: true,
            useCSSTransforms: true,
            verticalCompact: true,
            preventCollision: false,
            compactType: "vertical",
            breakpointWidth: this.breakpointWidth || 300,
            
        });
    },

    innerLayout: alias("layoutModel"),
    calcXY(top, left) {
        const { margin, cols, rowHeight, maxRows } = this;
        const { w, h } = this.innerLayout[this.dragIndex];
        const colWidth = this.calcColWidth();
        let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        let y = Math.round((top - margin[1]) / (rowHeight + margin[1]));
        // Capping
        x = Math.max(Math.min(x, cols - w), 0);
        y = Math.max(Math.min(y, maxRows - h), 0);
        return { x, y };
    },

    calcColWidth() {
        const { margin, containerPadding, width, cols } = this;
        return (
            (width - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
        );
    },

    widthObserver(width) {
        if(width < this.breakpointWidth) {
            this.set('cols', 1);
            const tmpArr = [...this.innerLayout].map(d => ({ ...d }));

            const layout2 = compact(correctBounds(tmpArr, { cols: this.cols }), this.compactType, this.cols);
            this.innerLayout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });
        }
    },

    calcPosition(x, y, w, h) {
        const { margin, containerPadding, rowHeight } = this;
        const colWidth = this.calcColWidth();

        const out = {
            left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
            top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
            // 0 * Infinity === NaN, which causes problems with resize constraints;
            // Fix this if it occurs.
            // Note we do it here rather than later because Math.round(Infinity) causes deopt
            width:
            w === Infinity
                ? w
                : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
            height:
            h === Infinity
                ? h
                : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1])
        };

        return out;
    },

    containerStyle: computed('innerLayout.@each.{x,y,h,w}', function() {
        const position = this.calcPosition(0, bottom(this.innerLayout), 0, 0);
        return htmlSafe(`height:${position.top}px;`);
    }),

    dragoveraction(e) {
        const deltaX = e.clientX - this.startPoint.x;
        const deltaY = e.clientY - this.startPoint.y;
        const left = this.startPosition.left + deltaX;
        const top = this.startPosition.top + deltaY;
        const pos = this.calcXY(top, left);

        this.onDrag(pos.x, pos.y, this.dragIndex);
    },

    onDrag(x, y, index) {
        if(!this.tmpLayout) { return;}
        const tmpArr = [...this.tmpLayout].map(d => ({ ...d }));
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
            this.cols
        );

        const layout2 = compact(layout, this.compactType, this.cols);

        this.tmpLayout = layout2;
        this.innerLayout.forEach((d, i) => {
            setProperties(d, layout2[i]);
        });

    },

    actions: {
        onDragStart(startPosition, x, y, dragIndex) {
            this.tmpLayout = this.innerLayout.toArray().map(d => ({ ...d }));
            this.set('startPosition', startPosition);
            this.set('startPoint',{ x, y });
            this.set('dragIndex', dragIndex);
        },

        onDragStop() {
            this.tmpLayout = null;
        },

        updateReferencePoint(deltaY) {
            this.set('startPoint.y', this.startPoint.y + deltaY)
        },

        remove(item) {
            this.innerLayout.removeObject(item);

            const tmpArr = [...this.innerLayout].map(d => ({ ...d }));
            const layout2 = compact(tmpArr, this.compactType, this.cols);

            this.innerLayout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });
        },

    }

});


// onLayoutChange: noop,
// onDragStart: noop,
// onDrag: noop,
// onDragStop: noop,
// onResizeStart: noop,
// onResize: noop,
// onResizeStop: noop
