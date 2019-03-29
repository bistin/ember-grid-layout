import Component from '@ember/component';
import { compact, moveElement } from "../utils"; 
import { setProperties } from "@ember/object"; 
export default Component.extend({
    tagName: '',
    init() {
        this._super();
        this.setProperties({
            autoSize: true,
            cols: 12,
            className: "",
            style: {},
            width: 900,
            draggableHandle: "",
            draggableCancel: "",
            containerPadding: [10, 10],
            rowHeight: 35,
            maxRows: 500, // infinite vertical growth
            // layoutModel: [],
            margin: [10, 10],
            isDraggable: true,
            isResizable: true,
            useCSSTransforms: true,
            verticalCompact: true,
            compactType: "vertical",
            preventCollision: false,
            // onLayoutChange: noop,
            // onDragStart: noop,
            // onDrag: noop,
            // onDragStop: noop,
            // onResizeStart: noop,
            // onResize: noop,
            // onResizeStop: noop
        });
        //console.log(this.attrs.layoutModel)
        //this.set("innerLayout", this.layoutModel);
        this.set("innerLayout", 
                 compact(
                     this.layoutModel, 
                     this.verticalCompact, 
                     this.cols 
                 ));
    },


    actions: {
        onDragStart() {
            this.tmpLayout = this.innerLayout.toArray().map(d => ({ ...d }));
        },

        onDragStop() {
        },

        onDrag(x, y, l, index) {
            //console.log(x,y,l)
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
                "vertical",  //this.compactType(),
                this.cols
            );

            let layout2 = compact(
                layout,
                this.verticalCompact,
                this.cols );


            // this.tmpLayout = layout2;
            this.innerLayout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });

        }
    }

});
