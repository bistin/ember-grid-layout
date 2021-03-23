import { action, computed } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { IPos } from '../utils';

function getScrollParent(el: HTMLElement|null): HTMLElement|null {
    let returnEl;
    if (el == null) {
        return null;
    } else if (el.scrollHeight > el.clientHeight) {
        returnEl = el;
    } else {
        returnEl = getScrollParent(el.parentNode as HTMLElement);
    }
    return returnEl;
}

interface Args {
    handle: string;
    pos: IPos;
    index: number;
    scrollContainerSelector: string;
    grid: {
        containerWidth: number;
        margin: [number,number];
        rowHeight: number;
        containerPadding: [number,number];
        cols: number;
        maxRows: number;
        onDragStart: Function; 
        onDragStop: Function;
        remove:Function;
        modifyShape: Function;
    };
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
export default class GridItem extends Component<Args> {
    scrollContainer: HTMLElement|null = null;
    handle: string | null = this.args.handle;
    tmpY: number | null = null;
    @tracked canDrag = !this.args.handle;

    

    @computed('args.pos.{x,y,w,h}', 'grid.containerWidth')
    get itemPosition() {
        if (!this.args.pos) {
            return '';
        }
        const { x, y, w, h } = this.args.pos;
        return this.calcPosition(x, y, w, h);
    }

    calcPosition(x: number, y: number, w: number, h: number) {
        const { margin, containerPadding, rowHeight, containerWidth, cols } = this.args.grid;
        const colWidth = (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;

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

    @action
    insertAction() {
        let scrollContainer = this.args.scrollContainerSelector
            ? document.querySelector(this.args.scrollContainerSelector)
            : getScrollParent(document.querySelector('.grid-layout')?.parentNode as HTMLElement);
        if(scrollContainer) {
            this.scrollContainer = scrollContainer as HTMLElement;
        }
    }

    updateScrollPosition(pointerY: number, distance: number) {
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
    dragStartAction(e: DragEvent) {
        e.dataTransfer && e.dataTransfer.setData('text/plain', 'handle');
        //e.dataTransfer.dropEffect = "move"
        const newPosition = { top: 0, left: 0 };
        let node = e.target as HTMLElement;
        const { offsetParent } = node;
        // node = node.children[0];
        if (!offsetParent) return;
        const parentRect = offsetParent.getBoundingClientRect();
        const clientRect = node?.getBoundingClientRect();
        newPosition.left = clientRect.left - parentRect.left + offsetParent.scrollLeft;
        newPosition.top = clientRect.top - parentRect.top + offsetParent.scrollTop;
        console.log('drag start')
        this.args.grid.onDragStart(newPosition, e.clientX, e.clientY, this.args.index, this.scrollContainer);
        return false;
    }

    @action
    dragMoveAction(e: DragEvent) {
        if(e.target) {
            const style = (e.target as HTMLElement).style;
            if(style){
                style.display = 'none';
            }
        }
        if (!this.tmpY) {
            this.tmpY = e.clientY;
        }
        const distance = e.clientY - this.tmpY;
        this.updateScrollPosition(e.clientY, distance);
        this.tmpY = e.clientY;
    }

    @action
    dragEndAction(e: DragEvent) {
        this.args.grid.onDragStop();
        this.tmpY = null;
        if(e.target) {
            //(e.target as HTMLElement).style.display = '';
            const style = (e.target as HTMLElement).style;
            if(style){
                style.display = '';
            }
        }
    }

    @action
    mouseOverAction(e: MouseEvent) {
        if (!this.handle) {
            return;
        }
        const canDrag = Array.isArray(this.handle)
            ? this.handle.some((handle) => (e.target as HTMLElement).matches(handle))
            : (e.target as HTMLElement).matches(this.handle);
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
