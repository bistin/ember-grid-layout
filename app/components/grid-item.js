import Component from '@ember/component';
import { computed } from '@ember/object';

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
        return `height:${p.height}px;width:${p.width}px;left:${p.left}px;top:${p.top}px`;
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

    

    calcColWidth() {
        const { margin, containerPadding, containerWidth, cols } = this.grid;
        return (
          (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
        );
    },
    actions: {
        test() {
            const {x, y, w, h} = this.pos;
           this.calcPosition(x, y, w, h, null)
        }
    }



});
