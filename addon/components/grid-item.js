import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/grid-item';
import { compact } from "ember-grid/utils";
import { setProperties } from "@ember/object";
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
    layout,
    tagName: "",

    styleText: computed('pos.{x,y,w,h}', function() {
        if(!this.pos){ return "";}
        const {x, y, w, h} = this.pos;
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
    calcXY(top, left) {
        const { margin, cols, rowHeight, maxRows } = this.grid;
        const { w, h } = this.pos;
        const colWidth = this.calcColWidth();

        let x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        let y = Math.round((top - margin[1]) / (rowHeight + margin[1]));

        // Capping
        x = Math.max(Math.min(x, cols - w), 0);
        y = Math.max(Math.min(y, maxRows - h), 0);
        return { x, y };
    },

    calcColWidth() {
        const { margin, containerPadding, containerWidth, cols } = this.grid;
        return (
            (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
        );
    },

    _dragMove: task(function* (e) {
        if(e.pageX === 0 && e.pageY === 0) {
            return;
        }
        const newPosition = { top: 0, left: 0 };
        const {x, y} = this.startPoint;
        const deltaX = e.pageX - x;
        const deltaY = e.pageY - y;

        this.set('startPoint', {
            x: e.pageX,
            y: e.pageY
        });

        newPosition.left = this.dragging.left + deltaX;
        newPosition.top = this.dragging.top + deltaY;

        this.set("dragging", newPosition);
        const pos = this.calcXY(newPosition.top, newPosition.left);
        this.grid.onDrag(pos.x, pos.y, this.pos, this.index);
        yield timeout(80);
    }).drop(),

    actions: {
        remove() {
            this.layoutModel.removeObject(this.pos);

            const tmpArr = [...this.layoutModel].map(d => ({ ...d }));
            let layout2 = compact(
                tmpArr,
                'vertical',
                12 );

            this.layoutModel.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });
        },

        dragMoveAction(e) {
            // add throttle
            this._dragMove.perform(e);
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
            //debugger
            this.set("dragging", newPosition);
            this.grid.onDragStart();
        },

        dragEndAction() {
            // const newPosition = { top: 0, left: 0 };
            // newPosition.left = this.dragging.left;
            // newPosition.top = this.dragging.top;
            // this.set("dragging", null);
            // const pos = this.calcXY(newPosition.top, newPosition.left);
            // //if(pos.x !== 0 || pos.y !== 0){
            // this.grid.onDrag(pos.x, pos.y, this.pos, this.index)
            // //}
            // this.set("dragging", null);
            this.grid.onDragStop();
        }
    }



});
