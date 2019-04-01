import Controller from '@ember/controller';
import { compact, moveElement } from "ember-grid/utils";
import { setProperties } from "@ember/object";

const layout = [
    {"x":0,"y":0,"w":2,"h":2,"i":"0","static":false},
    // {"x":0,"y":0,"w":4,"h":3,"i":"2","static":false},
    // {"x":0,"y":0,"w":2,"h":2,"i":"4","static":false},
    // {"x":0,"y":0,"w":2,"h":2,"i":"5","static":false},
    // {"x":0,"y":3,"w":2,"h":3,"i":"6","static":false},
    // {"x":0,"y":2,"w":2,"h":2,"i":"7","static":false},
    // {"x":0,"y":3,"w":2,"h":3,"i":"8","static":false},
    // {"x":0,"y":3,"w":2,"h":3,"i":"9","static":false},
    // {"x":0,"y":3,"w":2,"h":3,"i":"10","static":false},
    // {"x":0,"y":6,"w":2,"h":3,"i":"14","static":false},
    // {"x":0,"y":6,"w":2,"h":3,"i":"15","static":false},
    {"x":2,"y":0,"w":2,"h":4,"i":"1","static":false},
    // {"x":0,"y":12,"w":2,"h":4,"i":"19","static":false},
    // {"x":2,"y":12,"w":2,"h":4,"i":"20","static":false},
    // {"x":0,"y":6,"w":2,"h":2,"i":"21","static":false},
    // {"x":2,"y":6,"w":2,"h":2,"i":"22","static":false},
    // {"x":2,"y":12,"w":2,"h":4,"i":"23","static":false},
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


    },
    layout,

    actions : {
        add() {
            const i = this.layout.length;


            let newX = i % 2 * 2;
            let newY = 0;
            const newL = {
                "x":newX,
                "y":newY,
                "w":2,
                "h":2,
                "i":i.toString(),
                "static":false
            };
            const tmpArr = [newL,...this.layout].map(d => ({ ...d }));
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

            this.layout.unshiftObject(layout2[0]);
            this.layout.forEach((d, i) => {
                setProperties(d, layout2[i]);
            });



        }
    }

});
