import Controller from '@ember/controller';
import { compact, moveElement } from 'ember-grid-layout/utils';
import { setProperties } from '@ember/object';

let i = 10;
let layout = [
    { x: 0, y: 0, w: 2, h: 4, i: '0', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '1', static: false },
    { x: 0, y: 0, w: 1, h: 4, i: '2', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '3', static: false },
];

layout = compact(layout, 'vertical', 12);

const wrappedLayout = layout.map((d, i) => ({
    data: i,
    position: d,
}));

export default Controller.extend({
    init() {
        this._super();
        this.setProperties({
            compactType: 'vertical',
            preventCollision: true,
            cols: 2,
            width: 500,
        });
    },

    wrappedLayout: wrappedLayout,

    actions: {
        changeWidth() {
            this.set('width', this.width * 0.8);
        },

        add() {
            i = i + 1;
            let newX = i % 2;
            let newY = -0.1;
            const newL = {
                position: {
                    x: newX,
                    y: newY,
                    w: 1,
                    h: 2,
                    i: i.toString(),
                    static: false,
                },
                data: i,
            };
            this.wrappedLayout.pushObject(newL);
        },
    },
});
