'use strict';

describe('Signups E2E Tests:', function () {
  describe('Test Signups page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/signups');
      expect(element.all(by.repeater('signup in signups')).count()).toEqual(0);
    });
  });
});
