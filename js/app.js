/*global angular */

/**
 * The main hobbyMVC app module
 *
 * @type {angular.Module}
 */
angular.module('hobbymvc', ['ngRoute'])
	.config(function ($routeProvider) {
		'use strict';

		var routeConfig = {
			controller: 'hobbyCtrl',
			templateUrl: 'hobbymvc-index.html',
			resolve: {
				store: function (hobbyStorage) {
					// Get the correct module (API or localStorage).
					return hobbyStorage.then(function (module) {
						module.get(); // Fetch the hobby records in the background.
						return module;
					});
				}
			}
		};

		$routeProvider
			.when('/', routeConfig)
			.when('/:status', routeConfig)
			.otherwise({
				redirectTo: '/'
			});
	});
