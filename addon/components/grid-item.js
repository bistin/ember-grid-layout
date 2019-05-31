import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { throttle } from '@ember/runloop';

function getScrollParent(el) {
    let returnEl;
    if (el == null) {
        returnEl = null;
    } else if (el.scrollHeight > el.clientHeight) {
        returnEl = el;
    } else {
        returnEl = getScrollParent(el.parentNode);
    }
    return returnEl;
}

export default Component.extend({
    //layout,
    tagName: "",

    init() {
        this._super();
        this.set('tmpY', null);
        this.dragMove = e => throttle(this, this._dragMove, e, 80, false)
    },

    styleText: computed('pos.{x,y,w,h}', 'grid.containerWidth', function() {
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

    updateScrollPosition(el, distance) {
        // is widget in view?
        // console.log(el)
        var rect = el.getBoundingClientRect();
        //var scrollEl = getScrollParent(el);
        var innerHeightOrClientHeight = (window.innerHeight || document.documentElement.clientHeight);
        if ((rect.bottom < rect.height) ||
            rect.bottom + rect.height / 2 > innerHeightOrClientHeight
           ) {
            // set scrollTop of first parent that scrolls
            // if parent is larger than el, set as low as possible
            // to get entire widget on screen
            var offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            var offsetDiffUp = rect.top;
            var scrollEl = getScrollParent(el);

            if (scrollEl != null) {
                // var prevScroll = scrollEl.scrollTop;
                if ((rect.bottom < rect.height) && distance < 0) {
                    // moving up
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    } else {
                        scrollEl.scrollTop += Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                    }
                } else if (distance > 0) {
                    // moving down
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    } else {
                        scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                    }
                }
                // move widget y by amount scrolled
                // el.top += scrollEl.scrollTop - prevScroll;
                // const deltaY = scrollEl.scrollTop - prevScroll;
                // if(deltaY != 0) {
                //     this.grid.updateReferencePoint(deltaY);
                // }
            }
        }
    },


    actions: {
        remove() {
            this.grid.remove(this.pos);
        },

        dragStartAction(e) {
            const newPosition = { top: 0, left: 0 };
            this.set('startPoint', {
                x: e.clientX,
                y: e.clientY
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

        dragMoveAction(e) {
            if(!this.tmpY) {
                this.tmpY = e.clientY;
            }
            const distance = e.clientY - this.tmpY;
            this.updateScrollPosition(e.target.children[0], distance);
            this.tmpY = e.clientY;
        },

        dragEndAction() {
            this.grid.onDragStop();
            this.tmpY = null;
        }
    }



});
