'use strict';

describe('Logins E2E Tests:', function () {
  describe('Test Logins page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/logins');
      expect(element.all(by.repeater('login in logins')).count()).toEqual(0);
    });
  });
});
