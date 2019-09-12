import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
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

@classic
@tagName('')
export default class GridItemComponent extends Component {
    init() {
        super.init();
        this.set('tmpY', null);
        this.dragMove = (e) => throttle(this, this._dragMove, e, 80, false);
        this.scrollParent = null;
    }

    @computed('pos.{x,y,w,h}', 'grid.containerWidth')
    get styleText() {
        if (!this.pos) {
            return '';
        }
        const { x, y, w, h } = this.pos;
        const p = this.calcPosition(x, y, w, h);
        return htmlSafe(`height:${p.height}px;left:${p.left}px;width:${p.width}px;top:${p.top}px`);
    }

    calcPosition(x, y, w, h) {
        const { margin, containerPadding, rowHeight } = this.grid;
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

    calcColWidth() {
        const { margin, containerPadding, containerWidth, cols } = this.grid;
        return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
    }

    updateScrollPosition(el, distance) {
        // is widget in view?
        const rect = el.getBoundingClientRect();
        const innerHeightOrClientHeight =
            window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < 30 || rect.bottom > innerHeightOrClientHeight) {
            // set scrollTop of first parent that scrolls
            // if parent is larger than el, set as low as possible
            // to get entire widget on screen
            const offsetDiffDown = rect.bottom - innerHeightOrClientHeight;
            const offsetDiffUp = rect.top;
            const scrollEl = getScrollParent(el);

            if (scrollEl != null) {
                if (rect.top < 30 && distance < 0) {
                    // moving up
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    } else {
                        scrollEl.scrollTop +=
                            Math.abs(offsetDiffUp) > Math.abs(distance) ? distance : offsetDiffUp;
                    }
                } else if (distance > 0) {
                    // moving down
                    if (el.offsetHeight > innerHeightOrClientHeight) {
                        scrollEl.scrollTop += distance;
                    } else {
                        scrollEl.scrollTop += offsetDiffDown > distance ? distance : offsetDiffDown;
                    }
                }
            }
        }
    }

    @action
    dragStartAction(e) {
        const newPosition = { top: 0, left: 0 };
        this.set('startPoint', {
            x: e.clientX,
            y: e.clientY,
        });

        let node = e.target;
        const { offsetParent } = node;
        node = node.children[0];
        if (!offsetParent) return;
        const parentRect = offsetParent.getBoundingClientRect();
        const clientRect = node.getBoundingClientRect();
        newPosition.left = clientRect.left - parentRect.left + offsetParent.scrollLeft;
        newPosition.top = clientRect.top - parentRect.top + offsetParent.scrollTop;

        this.set('dragging', newPosition);
        this.scrollParent = getScrollParent(e.target.children[0]);
        this.grid.onDragStart(newPosition, e.clientX, e.clientY, this.index, this.scrollParent);
    }

    @action
    dragMoveAction(e) {
        if (!this.tmpY) {
            this.tmpY = e.clientY;
        }
        const distance = e.clientY - this.tmpY;
        this.updateScrollPosition(e.target.children[0], distance);
        this.tmpY = e.clientY;
    }

    @action
    dragEndAction() {
        this.grid.onDragStop();
        this.tmpY = null;
    }
}
