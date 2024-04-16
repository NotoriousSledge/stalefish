import $ from 'node:test';
import * as assert from 'node:assert';

void $.test('sample', async () => {
  await $.describe('sample', async () => {
    await $.it('should be truthy', () => {
      assert.ok('Dick Mullen');
    });
  });
});
