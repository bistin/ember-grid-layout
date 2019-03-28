import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
    tagName: "",

    // didInsertElement() {
    //     const pos = this.calcPosition();
    //     console.log(pos)
    //     this.setProperties(pos);
    // },


    styleText: computed('pos.{x,y,w,h}', function() {
        if(!this.pos){ return "";}
        const {x, y, w, h} = this.pos;
        const p = this.calcPosition(x, y, w, h, null)
        return htmlSafe(`height:${p.height}px;width:${p.width}px;left:${p.left}px;top:${p.top}px`);
    }),

    calcPosition(x, y, w, h, state) {
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
    
        // if (state && state.resizing) {
        //   out.width = Math.round(state.resizing.width);
        //   out.height = Math.round(state.resizing.height);
        // }
    
        // if (state && state.dragging) {
        //   out.top = Math.round(state.dragging.top);
        //   out.left = Math.round(state.dragging.left);
        // }
        return out;
    },
    calcXY(top, left) {
        const { margin, cols, rowHeight, maxRows } = this.grid;
        const { w, h } = this.pos;
        const colWidth = this.calcColWidth();
    
        // left = colWidth * x + margin * (x + 1)
        // l = cx + m(x+1)
        // l = cx + mx + m
        // l - m = cx + mx
        // l - m = x(c + m)
        // (l - m) / (c + m) = x
        // x = (left - margin) / (coldWidth + margin)
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
    actions: {
        dragMoveAction(e) {
            const newPosition = { top: 0, left: 0 };
            const {x, y} = this.startPoint;
            const deltaX = e.originalEvent.pageX - x;
            const deltaY = e.originalEvent.pageY - y;
        
            this.set('startPoint', {
                x: e.originalEvent.pageX, 
                y: e.originalEvent.pageY
            });

            newPosition.left = this.dragging.left + deltaX;
            newPosition.top = this.dragging.top + deltaY;
            //const { x, y , w, h } = this.pos;
           
            //console.log(newPosition)
            this.set("dragging", newPosition);
            const pos = this.calcXY(newPosition.top, newPosition.left);
            //console.log(pos)
            this.grid.onDrag(pos.x, pos.y, this.pos, this.index)
        },
        dragStartAction(e) {
            //console.log(e)
            const newPosition = { top: 0, left: 0 };
            this.set('startPoint', {
                x: e.originalEvent.pageX, 
                y: e.originalEvent.pageY
            });
            let node = e.originalEvent.target
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
        }
    }



});
