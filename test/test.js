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
          'name': 'Joe Smithson',
          'big': 'Joe Smith',
          'graduated': true
        },
        {
          'name': 'Joe Grandsmith',
          'big': 'Joe Smithson',
          'graduated': true
        },
        {
          'name': ' \xA0Matt    Trailingwhitespace ', // Intentional trailing whitespace
          'big': 'Joe Smith',
          'graduated': true
        },
        {
          'name': 'Matt Little',
          'big': 'Matt\t\xA0\tTrailingwhitespace', // Also weird whitespace, but different than above
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

    it('advances through multiple matches (default = FORWARD)', function () {
      var result = main.findBrother('Joe', state.nodes, '');
      result.name.should.equal('Joe Smith');
      // Advance to the next match.
      result = main.findBrother('Joe', state.nodes, result);
      result.name.should.equal('Joe Grandsmith');
      // Advance to the next match.
      result = main.findBrother('Joe', state.nodes, result);
      result.name.should.equal('Joe Smithson');
      // And it also wraps around to the start of the matches.
      result = main.findBrother('Joe', state.nodes, result);
      result.name.should.equal('Joe Smith');
    });

    it('advances backward through multiple matches', function () {
      var BACKWARD = main.DIRECTION.BACKWARD;
      var result = main.findBrother('Joe', state.nodes, '', BACKWARD);
      result.name.should.equal('Joe Smith');
      // Advance to the previous match (wrap around to the end).
      result = main.findBrother('Joe', state.nodes, result, BACKWARD);
      result.name.should.equal('Joe Grandsmith');
      // Advance to the previous match.
      result = main.findBrother('Joe', state.nodes, result, BACKWARD);
      result.name.should.equal('Joe Smithson');
      // Advance back to the first match.
      result = main.findBrother('Joe', state.nodes, result, BACKWARD);
      result.name.should.equal('Joe Smith');
    });

    it('normalizes names and handles whitespace', function () {
      var result = main.findBrother('Matt Trailingwhitespace', state.nodes);
      result.name.should.equal('Matt Trailingwhitespace');

      result = main.findBrother('Matt Little', state.nodes);
      result.big.name.should.equal('Matt Trailingwhitespace');
    });
  });
});
