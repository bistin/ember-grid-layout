import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | update-width', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        this.set('inputValue', '1234');

        await render(hbs`{{update-width inputValue}}`);

        const text = this.element.textContent;
        if(text) {
            assert.equal(text.trim(), '1234');
        }
    });
});
