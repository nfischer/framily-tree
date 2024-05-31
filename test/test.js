/* globals beforeEach, describe, it */

var should = require('should');

var main = require('../main');

describe('framily-tree', function () {
  it('can parse actual JSON data without error', function () {
    main.createNodesHelper();
  });

  describe('search function', function () {
    var state = {};

    beforeEach(function () {
      var brothers = [
        {
          'name': 'Joe Smith',
          'graduated': true,
          'familystarted': 'Family One'
        },
        {
          'name': 'Alex Brown',
          'big': 'Joe Smith',
          'graduated': true
        },
        {
          'name': 'Joe NotSmith',
          'big': 'Joe Smith',
          'graduated': true
        },
      ];
      var output = main.createNodes(brothers);
      state.nodes = output[0];
      state.edges = output[1];
    });

    it('returns undefined if no match', function () {
      var result = main.findBrother('This will not match', state.nodes);
      should(result).equal(undefined);
    });

    it('can find exact match', function () {
      var result = main.findBrother('Joe Smith', state.nodes);
      result.name.should.equal('Joe Smith');
      result = main.findBrother('Alex Brown', state.nodes);
      result.name.should.equal('Alex Brown');
    });

    it('can find case-insensitive match', function () {
      var result = main.findBrother('JoE SmItH', state.nodes);
      result.name.should.equal('Joe Smith');
      result = main.findBrother('AlEx bRoWn', state.nodes);
      result.name.should.equal('Alex Brown');
    });

    it('can match by first name', function () {
      var result = main.findBrother('Joe', state.nodes);
      result.name.should.equal('Joe Smith');
      result = main.findBrother('Alex', state.nodes);
      result.name.should.equal('Alex Brown');
    });

    it('can match by substring', function () {
      var result = main.findBrother('Joe S', state.nodes);
      result.name.should.equal('Joe Smith');
      result = main.findBrother('Al', state.nodes);
      result.name.should.equal('Alex Brown');
    });

    it('will advance through multiple matches', function () {
      var result = main.findBrother('Joe', state.nodes);
      result.name.should.equal('Joe Smith');
      // Advance to the next match.
      result = main.findBrother('Joe', state.nodes, result);
      result.name.should.equal('Joe NotSmith');
      // And it also wraps around to the start of the matches.
      result = main.findBrother('Joe', state.nodes, result);
      result.name.should.equal('Joe Smith');
    });
  });
});
