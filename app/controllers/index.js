import Controller from '@ember/controller';
import { set } from '@ember/object'; 

const layout = [
    {"x":2,"y":0,"w":2,"h":2,"i":"0","static":false},
    {"x":8,"y":0,"w":2,"h":2,"i":"1","static":false},
    {"x":0,"y":0,"w":2,"h":3,"i":"2","static":false},
    {"x":10,"y":0,"w":2,"h":3,"i":"3","static":false},
    {"x":0,"y":0,"w":2,"h":2,"i":"4","static":false},
    {"x":0,"y":0,"w":2,"h":2,"i":"5","static":false},
    {"x":2,"y":3,"w":2,"h":3,"i":"6","static":false},
    {"x":2,"y":2,"w":2,"h":2,"i":"7","static":false},
    {"x":2,"y":3,"w":2,"h":3,"i":"8","static":false},
    {"x":2,"y":3,"w":2,"h":3,"i":"9","static":false},
    {"x":0,"y":3,"w":2,"h":3,"i":"10","static":false},
    {"x":8,"y":3,"w":2,"h":3,"i":"11","static":false},
    {"x":8,"y":4,"w":2,"h":2,"i":"12","static":false},
    {"x":6,"y":8,"w":2,"h":4,"i":"13","static":false},
    {"x":0,"y":6,"w":2,"h":3,"i":"14","static":false},
    {"x":2,"y":6,"w":2,"h":3,"i":"15","static":false},
    {"x":8,"y":10,"w":2,"h":5,"i":"16","static":false},
    {"x":8,"y":4,"w":2,"h":2,"i":"17","static":false},
    {"x":2,"y":12,"w":2,"h":4,"i":"18","static":false},
    {"x":0,"y":12,"w":2,"h":4,"i":"19","static":false},
    {"x":2,"y":12,"w":2,"h":4,"i":"20","static":false},
    {"x":0,"y":6,"w":2,"h":2,"i":"21","static":false},
    {"x":2,"y":6,"w":2,"h":2,"i":"22","static":false},
    {"x":2,"y":12,"w":2,"h":4,"i":"23","static":false},
    {"x":8,"y":20,"w":2,"h":5,"i":"24","static":false}];

export default Controller.extend({
    layout,
    actions: {
        test() {
            set(this.layout[1],'x',5)
        }
    }
});
