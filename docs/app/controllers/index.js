import Controller from '@ember/controller';
import { compact } from 'ember-grid-layout/utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';
import 'ember-grid-layout/styles/grid-layout.css';

let i = 10;
let layout = [
    { x: 0, y: 0, w: 2, h: 4, i: '0', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '1', static: false },
    { x: 0, y: 0, w: 1, h: 4, i: '2', static: false },
    { x: 1, y: 0, w: 1, h: 4, i: '3', static: false },
];

layout = compact(layout, 'vertical', 12);

class Layout {
    @tracked position;
    data = null;
    constructor(position, data) {
        this.data = data;
        this.position = position;
    }
}

const wrappedLayout = layout.map((d, i) => new Layout(d, i));

export default class IndexController extends Controller {
    compactType = 'vertical';
    preventCollision = true;
    cols = 2;
    @tracked width = 555;
    wrappedLayout = wrappedLayout;

    @action
    updatePosition(newLayout, moving) {
        next(this, function () {
            this.wrappedLayout.forEach((d, i) => {
                d.position = newLayout[i];
            });
        });
    }

    @action
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
    }

    @action
    changeWidth() {
        this.width = this.width * 0.8;
    }
}
