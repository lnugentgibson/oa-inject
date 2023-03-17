const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  ArrayLib
} = require('./array.js');

describe('array.js', function() {
  describe('ArrayLib', function() {
    describe('clone', function() {
      it('works', function() {
        let arr = [2,5,7,2,9,3,0,4];
        let c = ArrayLib.clone(arr);
        expect(c).to.not.equal(arr);
        expect(c).to.deep.equal(arr);
      });
    });
    describe('dedupe', function() {
      it('works', function() {
        let arr = [2,5,7,2,9,3,0,4];
        let c = ArrayLib.dedupe(arr, (a,b) => a - b);
        expect(c).to.not.equal(arr);
        expect(c).to.deep.equal([0,2,3,4,5,7,9]);
      });
    });
    describe('union', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let u = ArrayLib.union(arr1, arr2, (a,b) => a - b);
        expect(u).to.not.equal(arr1);
        expect(u).to.not.equal(arr2);
        expect(u).to.deep.equal([0,2,3,4,5,7,9,11,17]);
      });
    });
    describe('intersection', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let i = ArrayLib.intersection(arr1, arr2, (a,b) => a - b);
        expect(i).to.not.equal(arr1);
        expect(i).to.not.equal(arr2);
        expect(i).to.deep.equal([0,3,5]);
      });
    });
    describe('subtract', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let s = ArrayLib.subtract(arr1, arr2, (a,b) => a - b);
        expect(s).to.not.equal(arr1);
        expect(s).to.not.equal(arr2);
        expect(s).to.deep.equal([2,2,4,7,9]);
      });
    });
  });
});
