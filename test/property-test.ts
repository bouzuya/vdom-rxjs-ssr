import assert from 'power-assert';
import { Property } from '../src/property';

describe('proimsed-state', function() {
  it('works', function() {
    const state = { name: 'aiueo' };
    const property = new Property(state);
    return property
      .update((state) => {
        return { name: state.name + '!' };
      })
      .then((state) => {
        assert.deepEqual(state, { name: 'aiueo!' });
      });
  });

  it('works', function() {
    const state = { name: 'aiueo' };
    const property = new Property(state);
    return Promise.all([
      property
        .update((state) => {
          return { name: state.name + '!' };
        })
        .then((state) => {
          assert.deepEqual(state, { name: 'aiueo!' });
        }),
      property
        .update((state) => {
          return { name: state.name + '?' };
        })
        .then((state) => {
          assert.deepEqual(state, { name: 'aiueo!?' });
        })
    ]);
  });
});
