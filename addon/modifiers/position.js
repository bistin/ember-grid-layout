import { modifier } from 'ember-modifier';

export default modifier(function position(element, [position]/*, hash*/) {
    element.style.height = `${position.height}px`;
    element.style.width = `${position.width}px`;
    element.style.left = `${position.left}px`;
    element.style.top = `${position.top}px`;
});
