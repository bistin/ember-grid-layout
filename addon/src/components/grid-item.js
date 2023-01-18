import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';

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

export default class GridItem extends Component {
    tmpY = null;
    scrollContainer = null;
    handle = this.args.handle;
    @tracked canDrag = !this.args.handle;

    @cached
    get itemPosition() {
        if (!this.args.pos) {
            return '';
        }
        const { x, y, w, h } = this.args.pos;
        return this.calcPosition(x, y, w, h);
    }

    @action
    insertAction() {
        let scrollContainer = this.args.scrollContainerSelector
            ? document.querySelector(this.args.scrollContainerSelector)
            : getScrollParent(document.querySelector('.grid-layout').parentNode);
        if (scrollContainer) {
            this.scrollContainer = scrollContainer;
        }
    }

    calcPosition(x, y, w, h) {
        const { margin, containerPadding, rowHeight, containerWidth, cols } = this.args.grid;
        const colWidth = (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;

        return {
            left: Math.round((colWidth + margin[0]) * x + containerPadding[0]),
            top: Math.round((rowHeight + margin[1]) * y + containerPadding[1]),
            // 0 * Infinity === NaN, which causes problems with resize constraints;
            // Fix this if it occurs.
            // Note we do it here rather than later because Math.round(Infinity) causes deopt
            width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
            height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1]),
        };
    }

    updateScrollPosition(pointerY, distance) {
        const innerHeightOrClientHeight =
            window.innerHeight || document.documentElement.clientHeight;

        const scrollEl = this.scrollContainer;
        if (!scrollEl) return;
        if (pointerY < 100 && distance <= 0) {
            scrollEl.scrollTop += (pointerY - 100) / 3;
        }

        if (pointerY > innerHeightOrClientHeight - 100 && distance >= 0) {
            scrollEl.scrollTop += (innerHeightOrClientHeight - pointerY) / 5;
        }
    }

    @action
    dragStartAction(e) {
        e.dataTransfer.setData('text/plain', 'handle');
        //e.dataTransfer.dropEffect = "move"
        const newPosition = { top: 0, left: 0 };
        let node = e.target;
        const { offsetParent } = node;
        // node = node.children[0];
        if (!offsetParent) return;
        const parentRect = offsetParent.getBoundingClientRect();
        const clientRect = node.getBoundingClientRect();
        newPosition.left = clientRect.left - parentRect.left + offsetParent.scrollLeft;
        newPosition.top = clientRect.top - parentRect.top + offsetParent.scrollTop;

        this.args.grid.onDragStart(
            newPosition,
            e.clientX,
            e.clientY,
            this.args.index,
            this.scrollContainer,
        );
        return false;
    }

    @action
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

    @action
    dragEndAction(e) {
        this.args.grid.onDragStop();
        this.tmpY = null;
        e.target.style.display = '';
    }

    @action
    mouseOverAction(e) {
        if (!this.handle) {
            return;
        }
        const canDrag = Array.isArray(this.handle)
            ? this.handle.some((handle) => e.target.matches(handle))
            : e.target.matches(this.handle);
        this.canDrag = canDrag;
    }

    @action
    mouseLeaveAction() {
        if (!this.handle) {
            return;
        }
        this.canDrag = false;
    }
}
