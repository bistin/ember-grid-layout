import Component from '@ember/component';
import { compact, moveElement, LayoutItem, Layout} from "../utils"; 
import { setProperties } from "@ember/object";
import { alias } from "@ember/object/computed";
//import layout from '../templates/components/grid-layout';

export default Component.extend({
    //layout,
    tagName: '',
    init() {
        this._super();
        this.setProperties({
            autoSize: true,
            cols: 2,
            className: "",
            style: {},
            width: 400,
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

        // this.set("innerLayout",
        //          compact(
        //              this.layoutModel,
        //              this.compactType,
        //              this.cols
        //          ));
    },

    innerLayout: alias("layoutModel"),

    actions: {
        onDragStart() {
            this.tmpLayout = this.innerLayout.toArray().map(d => ({ ...d }));
        },

        onDragStop() {
            this.tmpLayout = null;
        },

        onDrag(x, y, l, index) {
            //const tmpArr = this.tmpLayout
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

            let layout2 = compact(
                layout,
                'vertical',
                this.cols );

            this.tmpLayout = layout2;
            this.innerLayout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });

        }
    }

});
