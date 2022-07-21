import { modifier } from 'ember-modifier';

var position = modifier(function position(element, [pos]
/*, hash*/
) {
  element.style.height = `${pos.height}px`;
  element.style.width = `${pos.width}px`;
  element.style.left = `${pos.left}px`;
  element.style.top = `${pos.top}px`;
}, {
  eager: false
});

export { position as default };
