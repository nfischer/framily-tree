/* globals describe, it */

var main = require('../main');

describe('framily-tree', function () {
  it('can parse all nodes without error', function () {
    main.createNodes();
  });
});
