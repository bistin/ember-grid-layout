import Controller from '@ember/controller';
import { compact, moveElement } from "ember-grid/utils";
import { setProperties } from "@ember/object";

let i = 10;
const layout = [
    {"x":0,"y":0,"w":2,"h":4,"i":"0","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"1","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"2","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"3","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"4","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"5","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"6","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"7","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"8","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"9","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"10","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"11","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"12","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"13","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"14","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"15","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"16","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"17","static":false},
    {"x":0,"y":0,"w":1,"h":4,"i":"18","static":false},
    {"x":1,"y":0,"w":1,"h":4,"i":"19","static":false}
];

export default Controller.extend({
    init() {
        this._super();
        this.set("layout",
                 compact(
                     layout,
                     "vertical",
                     12
                 ));
        this.setProperties({
            compactType: "vertical",
            preventCollision: true,
            cols: 2,
            width: 500
        });
    },
    layout,

    actions : {
        changeWidth() {
            this.set('width', this.width * 0.8);
        },

        add() {
            i = i + 1;
            let newX = i % 2;
            let newY = -0.1;
            const newL = {
                "x":newX,
                "y":newY,
                "w":1,
                "h":2,
                "i":i.toString(),
                "static":false
            };
            
            const tmpArr = [...this.layout, newL].map(d => ({ ...d }));
            const isUserAction = true;
            const layout = moveElement(
                tmpArr,
                newL,
                newX,
                newY,
                isUserAction,
                this.preventCollision,
                this.compactType,
                this.cols
            );

            let layout2 = compact(
                layout,
                'vertical',
                this.cols );
            //let layout2 = layout;


            this.layout.pushObject(layout2[layout2.length -1]);
            this.layout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });



        }
    }

});
