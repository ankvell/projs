
(function() {
    var app = angular.module('submit', []);

    app.controller('MainCtrl', function($scope, queryService) {

        $scope.textValue = '';
        $scope.canSubmit = false;
        $scope.isInProcess = false;
        $scope.errorMessage = '';
        $scope.successMessage = '';

        $scope.onClick = function() {
            $scope.isInProcess = true;
            queryService.testQuery($scope.textValue)
                .then(onTestSuccess, onTestFailure);
        };
        $scope.onTextChange = function() {
            $scope.canSubmit = false;
        };
        function onTestSuccess(response) {
            $scope.canSubmit = true;
            $scope.isInProcess = false;
            $scope.successMessage = response.MESSAGE;
        }
        function onTestFailure(response) {
            $scope.isInProcess = false;
            $scope.errorMessage = response.MESSAGE;
        }
    });

    app.service('queryService', function($q) {
        return {
            testQuery: function(query) {

                /* emulate server response */
                return $q(function(resolve, reject) {
                    setTimeout(function() {
                        if (query.length > 5) {
                            resolve({
                                'TEST_RESULT': 'OK',
                                'MESSAGE': 'Well done! Checking passed successfully. Please press "SUBMIT"'
                            });
                        } else {
                            reject({
                                'TEST_RESULT': 'KO',
                                'MESSAGE': 'Failed to invoke the service. Possible causes: The service is offline or inaccessible; Please try again'
                            });
                        }
                    }, 3000);
                });
            }
        };
    });

})();
