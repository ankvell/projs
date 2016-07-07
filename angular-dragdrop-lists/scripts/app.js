(function() {
    var app = angular.module('dropbox', ['ngDragDrop']);

    app.controller('MainCtrl', function($scope, $http, beerService, cartService) {
        $scope.beers = beerService.getBeers();
        $scope.cart = cartService.getProducts();

        $scope.dropSuccessHandler = function($event, index, array) {
            beerService.addToCart(filterData(array)[index]);
        };

        $scope.onDrop = function(event, data) {
            cartService.addToCart(data);
        };

        $scope.remove = function(array, index) {
            cartService
                .removeFromCart(array[index])
                .then(function(beer) {
                    beerService.removeFromCart(beer);
                });
        };
    });

    function filterData(beers) {
        return beers.filter(function(beer) {
            return !beer.inBasket;
        });
    }
    app.filter('notInBasket', function() {
        return filterData;
    });

    app.service('beerService', function($http) {
        var beers = [{
            "country": "USA",

            "brands": [{
                "id": "1",
                "brand": "Budweiser"
            }, {
                "id": "2",
                "brand": "Miller High Life"
            }, {
                "id": "3",
                "brand": "Keystone Light"
            }, {
                "id": "4",
                "brand": "Pabst Blue Ribbon"
            }]
        }, {
            "country": "Japan",

            "brands": [{
                "id": "5",
                "brand": "Kirin Ichiban"
            }, {
                "id": "6",
                "brand": "Sapporo"
            }, {
                "id": "7",
                "brand": "Asahi"
            }, {
                "id": "8",
                "brand": "Precious"
            }]
        }, {
            "country": "Iceland",

            "brands": [{
                "id": "9",
                "brand": "Einstok"
            }, {
                "id": "10",
                "brand": "Viking Light"
            }, {
                "id": "11",
                "brand": "Gull"
            }, {
                "id": "12",
                "brand": "Miltextrakt"
            }]
        }, {
            "country": "Deutschland",

            "brands": [{
                "id": "13",
                "brand": "Weihenstephan"
            }, {
                "id": "14",
                "brand": "Warsteiner"
            }, {
                "id": "15",
                "brand": "Franziskaner"
            }, {
                "id": "16",
                "brand": "Erdinger Weissbier"
            }]
        }, {
            "country": "Czech",

            "brands": [{
                "id": "17",
                "brand": "Gambrinus"
            }, {
                "id": "18",
                "brand": "Krusovice"
            }, {
                "id": "19",
                "brand": "Černá Hora"
            }, {
                "id": "20",
                "brand": "Erdinger Weissbier"
            }]
        }];
        return {
            getBeers: function() {
                return beers;
            },

            addToCart: function(beer) {
                this._toggleInCart(beer, true);
            },

            removeFromCart: function(beer) {
                this._toggleInCart(beer, false);
            },

            _toggleInCart: function(beer, isInCart) {
                this.getBeers().forEach(function(country) {
                    country.brands.forEach(function(brand) {
                        if (brand.id === beer.id) {
                            brand.inBasket = isInCart;
                        }
                    });
                });
            }
        };
    });

    app.service('cartService', function($http, $q) {
        var products = [];
        return {
            getProducts: function() {
                return products;
            },

            addToCart: function(item) {
                return $http({
                    method: 'POST',
                    url: 'http://127.0.0.1:8080/',
                    params: {
                        action: 'add',
                        id: item.id
                    }
                }).success(function() {
                    this.getProducts().push(item);
                }.bind(this));
            },

            removeFromCart: function(item) {
                var self = this;

                return $q(function(resolve) {
                    $http({
                        method: 'POST',
                        url: 'http://127.0.0.1:8080/',
                        params: {
                            action: 'del'
                        }
                    }).success(function() {
                        var products = self.getProducts();
                        var itemPosition = products.indexOf(item);
                        var removedItem = products.splice(itemPosition, 1)[0];

                        resolve(removedItem);
                    });
                });
            }
        };
    });
})();
