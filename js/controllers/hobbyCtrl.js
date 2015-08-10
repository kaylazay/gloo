
/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the hobbyStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('hobbymvc')
	.controller('hobbyCtrl', function hobbyCtrl($scope, $routeParams, $filter, store) {
		'use strict';

		var hobby = $scope.hobby = store.hobby;

		$scope.newhobby = '';
		$scope.editedhobby = null;

		$scope.$watch('hobby', function () {
			$scope.remainingCount = $filter('filter')(hobby, { completed: false }).length;
			$scope.completedCount = hobby.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};
		});

		$scope.addhobby = function () {
			var newhobby = {
				title: $scope.newhobby.trim(),
				completed: false
			};

			if (!newhobby.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newhobby)
				.then(function success() {
					$scope.newhobby = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.edithobby = function (hobby) {
			$scope.editedhobby = hobby;
			// Clone the original hobby to restore it on demand.
			$scope.originalhobby = angular.extend({}, hobby);
		};

		$scope.saveEdits = function (hobby, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// hobby edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			hobby.title = hobby.title.trim();

			if (hobby.title === $scope.originalhobby.title) {
				$scope.editedhobby = null;
				return;
			}

			store[hobby.title ? 'put' : 'delete'](hobby)
				.then(function success() {}, function error() {
					hobby.title = $scope.originalhobby.title;
				})
				.finally(function () {
					$scope.editedhobby = null;
				});
		};

		$scope.revertEdits = function (hobby) {
			hobby[hobby.indexOf(hobby)] = $scope.originalhobby;
			$scope.editedhobby = null;
			$scope.originalhobby = null;
			$scope.reverted = true;
		};

		$scope.removehobby = function (hobby) {
			store.delete(hobby);
		};

		$scope.savehobby = function (hobby) {
			store.put(hobby);
		};

		$scope.toggleCompleted = function (hobby, completed) {
			if (angular.isDefined(completed)) {
				hobby.completed = completed;
			}
			store.put(hobby, hobby.indexOf(hobby))
				.then(function success() {}, function error() {
					hobby.completed = !hobby.completed;
				});
		};

		$scope.clearCompletedhobby = function () {
			store.clearCompleted();
		};

		$scope.markAll = function (completed) {
			hobby.forEach(function (hobby) {
				if (hobby.completed !== completed) {
					$scope.toggleCompleted(hobby, completed);
				}
			});
		};
	});
