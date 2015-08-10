/*global angular */

/**
 * Services that persists and retrieves hobbies from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('hobbymvc')
	.factory('hobbyStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

	.factory('api', function ($http) {
		'use strict';

		var store = {
			hobby: [],

			clearCompleted: function () {
				var originalHobby = store.hobby.slice(0);

				var completeHobby = [];
				var incompleteHobby = [];
				store.hobby.forEach(function (hobby) {
					if (hobby.completed) {
						completeHobby.push(hobby);
					} else {
						incompleteHobby.push(hobby);
					}
				});

				angular.copy(incompleteHobby, store.hobby);

				return $http.delete('/api/hobby')
					.then(function success() {
						return store.hobby;
					}, function error() {
						angular.copy(originalHobby, store.hobby);
						return originalHobby;
					});
			},

			delete: function (hobby) {
				var originalHobby = store.hobby.slice(0);

				store.hobby.splice(store.hobby.indexOf(hobby), 1);

				return $http.delete('/api/hobby/' + hobby.id)
					.then(function success() {
						return store.hobby;
					}, function error() {
						angular.copy(originalHobby, store.hobby);
						return originalHobby;
					});
			},

			get: function () {
				return $http.get('/api/hobby')
					.then(function (resp) {
						angular.copy(resp.data, store.hobby);
						return store.hobby;
					});
			},

			insert: function (hobby) {
				var originalHobby = store.hobby.slice(0);

				return $http.post('/api/hobby', hobby)
					.then(function success(resp) {
						hobby.id = resp.data.id;
						store.hobby.push(hobby);
						return store.hobby;
					}, function error() {
						angular.copy(originalHobby, store.hobby);
						return store.hobby;
					});
			},

			put: function (hobby) {
				var originalHobby = store.hobby.slice(0);

				return $http.put('/api/hobby/' + hobby.id, hobby)
					.then(function success() {
						return store.hobby;
					}, function error() {
						angular.copy(originalHobby, store.hobby);
						return originalHobby;
					});
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'hobby-angularjs';

		var store = {
			hobby: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (hobby) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(hobby));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var completehobby = [];
				var incompletehobby = [];
				store.hobby.forEach(function (hobby) {
					if (hobby.completed) {
						completehobby.push(hobby);
					} else {
						incompletehobby.push(hobby);
					}
				});

				angular.copy(incompletehobby, store.hobby);

				store._saveToLocalStorage(store.hobby);
				deferred.resolve(store.hobby);

				return deferred.promise;
			},

			delete: function (hobby) {
				var deferred = $q.defer();

				store.hobby.splice(store.hobby.indexOf(hobby), 1);

				store._saveToLocalStorage(store.hobby);
				deferred.resolve(store.hobby);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.hobby);
				deferred.resolve(store.hobby);

				return deferred.promise;
			},

			insert: function (hobby) {
				var deferred = $q.defer();

				store.hobby.push(hobby);

				store._saveToLocalStorage(store.hobby);
				deferred.resolve(store.hobby);

				return deferred.promise;
			},

			put: function (hobby, index) {
				var deferred = $q.defer();

				store.hobby[index] = hobby;

				store._saveToLocalStorage(store.hobby);
				deferred.resolve(store.hobby);

				return deferred.promise;
			}
		};

		return store;
	});
