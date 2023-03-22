const {
  expect
} = require('chai');
const sinon = require('sinon');

const {
  Comparator,
  ArrayLib,
  SortedArray
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
        let c = ArrayLib.dedupe(arr, Comparator.Difference);
        expect(c).to.not.equal(arr);
        expect(c).to.deep.equal([0,2,3,4,5,7,9]);
      });
    });
    describe('union', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let u = ArrayLib.union(arr1, arr2, Comparator.Difference);
        expect(u).to.not.equal(arr1);
        expect(u).to.not.equal(arr2);
        expect(u).to.deep.equal([0,2,3,4,5,7,9,11,17]);
      });
    });
    describe('intersection', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let i = ArrayLib.intersection(arr1, arr2, Comparator.Difference);
        expect(i).to.not.equal(arr1);
        expect(i).to.not.equal(arr2);
        expect(i).to.deep.equal([0,3,5]);
      });
    });
    describe('subtract', function() {
      it('works', function() {
        let arr1 = [2,5,7,2,9,3,0,4];
        let arr2 = [11,3,5,0,17];
        let s = ArrayLib.subtract(arr1, arr2, Comparator.Difference);
        expect(s).to.not.equal(arr1);
        expect(s).to.not.equal(arr2);
        expect(s).to.deep.equal([2,2,4,7,9]);
      });
    });
    describe('binarySearch', function() {
      it('exists', function() {
        //const arr = [2,6,4,8,1,64,34,72,983,12,47,26];
        //console.log(ArrayLib.sorted(arr, Comparator.Difference));
        const arr = [1, 2, 4, 6, 8, 12, 26, 34, 47, 64, 72, 983];
        expect(ArrayLib.binarySearch(arr, 2, Comparator.Difference)).to.equal(1);
        expect(ArrayLib.binarySearch(arr, 26, Comparator.Difference)).to.equal(6);
        expect(ArrayLib.binarySearch(arr, 8, Comparator.Difference)).to.equal(4);
        expect(ArrayLib.binarySearch(arr, 34, Comparator.Difference)).to.equal(7);
        expect(ArrayLib.binarySearch(arr, 47, Comparator.Difference)).to.equal(8);
        expect(ArrayLib.binarySearch(arr, 64, Comparator.Difference)).to.equal(9);
        expect(ArrayLib.binarySearch(arr, 72, Comparator.Difference)).to.equal(10);
        expect(ArrayLib.binarySearch(arr, 983, Comparator.Difference)).to.equal(11);
      });
      it('does not exist', function() {
        //const arr = [2,6,4,8,1,64,34,72,983,12,47,26];
        //console.log(ArrayLib.sorted(arr, Comparator.Difference));
        const arr = [1, 2, 4, 6, 8, 12, 26, 34, 47, 64, 72, 983];
        expect(ArrayLib.binarySearch(arr, .5, Comparator.Difference)).to.equal(0);
        expect(ArrayLib.binarySearch(arr, 1.5, Comparator.Difference)).to.equal(1);
        expect(ArrayLib.binarySearch(arr, 3, Comparator.Difference)).to.equal(2);
        expect(ArrayLib.binarySearch(arr, 5, Comparator.Difference)).to.equal(3);
        expect(ArrayLib.binarySearch(arr, 7, Comparator.Difference)).to.equal(4);
        expect(ArrayLib.binarySearch(arr, 10, Comparator.Difference)).to.equal(5);
        expect(ArrayLib.binarySearch(arr, 16, Comparator.Difference)).to.equal(6);
        expect(ArrayLib.binarySearch(arr, 32, Comparator.Difference)).to.equal(7);
        expect(ArrayLib.binarySearch(arr, 40, Comparator.Difference)).to.equal(8);
        expect(ArrayLib.binarySearch(arr, 50, Comparator.Difference)).to.equal(9);
        expect(ArrayLib.binarySearch(arr, 70, Comparator.Difference)).to.equal(10);
        expect(ArrayLib.binarySearch(arr, 100, Comparator.Difference)).to.equal(11);
        expect(ArrayLib.binarySearch(arr, 1000, Comparator.Difference)).to.equal(12);
      });
    });
  });
  
  describe('sortedArray', function() {
    it('test1', function() {
      const arr = new SortedArray();
      arr.push(4);
      arr.push(7);
      arr.push(1);
      arr.push(2);
      arr.push(9);
      arr.push(11);
      arr.push(6);
      const expected = [1,2,4,6,7,9,11];
      expect(arr.array).to.deep.equal(expected);
    });
    it('test1 neg', function() {
      const arr = new SortedArray();
      arr.push(4);
      arr.push(7);
      arr.push(1);
      arr.push(2);
      arr.push(9);
      arr.push(11);
      arr.push(6);
      const expected = [1,2,4,6,7,9,11];
      expected.reverse();
      expect(arr.reverse().array).to.deep.equal(expected);
    });
    it('test2', function() {
      const arr = new SortedArray();
      arr.push('4');
      arr.push('7');
      arr.push('1');
      arr.push('2');
      arr.push('9');
      arr.push('11');
      arr.push('6');
      expect(arr.array).to.deep.equal(['1','11','2','4','6','7','9']);
    });
    it('test2 neg', function() {
      const arr = new SortedArray();
      arr.push('4');
      arr.push('7');
      arr.push('1');
      arr.push('2');
      arr.push('9');
      arr.push('11');
      arr.push('6');
      const expected = ['1','11','2','4','6','7','9'];
      expected.reverse();
      expect(arr.reverse().array).to.deep.equal(expected);
    });
  });
});
