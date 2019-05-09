import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { throttle } from '@ember/runloop';

export default Component.extend({
    //layout,
    tagName: "",

    init() {
        this._super();
        this.dragMove = e => throttle(this, this._dragMove, e, 80, false)
    },

    styleText: computed('pos.{x,y,w,h}', function() {
        if(!this.pos){ return "";}
        const { x, y, w, h } = this.pos;
        const p = this.calcPosition(x, y, w, h)
        return htmlSafe(`height:${p.height}px;width:${p.width}px;left:${p.left}px;top:${p.top}px`);
    }),

    calcPosition(x, y, w, h) {
        const { margin, containerPadding, rowHeight } = this.grid;
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


    calcColWidth() {
        const { margin, containerPadding, containerWidth, cols } = this.grid;
        return (
            (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
        );
    },

    actions: {
        remove() {
            this.grid.remove(this.pos);
        },

        dragStartAction(e) {
            const newPosition = { top: 0, left: 0 };
            this.set('startPoint', {
                x: e.pageX,
                y: e.pageY
            });

            let node = e.target
            const { offsetParent } = node;
            node = node.children[0];
            if (!offsetParent) return;
            const parentRect = offsetParent.getBoundingClientRect();
            const clientRect = node.getBoundingClientRect();
            newPosition.left =
                clientRect.left - parentRect.left + offsetParent.scrollLeft;
            newPosition.top =
                clientRect.top - parentRect.top + offsetParent.scrollTop;

            this.set("dragging", newPosition);
            this.grid.onDragStart(newPosition, e.clientX, e.clientY, this.index);
        },

        dragEndAction() {
            this.grid.onDragStop();
        }
    }



});
