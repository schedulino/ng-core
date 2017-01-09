'use strict';

/**
 * Moveable modal
 * @see https://gist.github.com/madhums/7d8377498b34933ebb18
 *
 * You need to set the options of the provider.
 *
 * Requirements:
 *
 *    You need angular-ui/bootstrap module
 *
 * Usage:
 *
 *    var mymodule = angular.module('mymodule', [
 *      'moveable-modal'
 *    ]);
 *
 *    mymodule.config(['moveableModalProvider', function (moveableModal) {
 *      moveableModal.options = {
 *        elSelector: '.modal-header',      // selector to select/click
 *        targetSelector: '.modal-content'  // selector to be moved
 *      };
 *    }])
 */

angular.module('moveable-modal', [
    'ui.bootstrap.modal'
])

    .provider('moveableModal', ['$provide', function ($provide) {

        var moveableModal = {
            options: {
                elSelector: '',
                targetSelector: ''
            },
            $get: function () {
                var startX = 0;
                var startY = 0;
                var x = 0;
                var y = 0;

                if (!moveableModal.options.elSelector &&
                    !moveableModal.options.targetSelector) {
                    return;
                }

                var $document = angular.element(document);
                var element = angular.element(moveableModal.options.elSelector);
                var target = angular.element(moveableModal.options.targetSelector);

                function mousemove (event) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                    target.css({
                        top: y + 'px',
                        left:  x + 'px'
                    });
                }

                function mouseup () {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }

                element.css({
                    position: 'relative',
                    cursor: 'move'
                });

                element.on('mousedown', function (event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });
            }
        };

        $provide.decorator('$uibModal', ['$delegate', function ($delegate) {
            var $modal = angular.copy($delegate);

            $delegate.open = function (options) {
                var instance = $modal.open(options);
                instance.opened.then(function () {
                    setTimeout(function () {
                        moveableModal.$get();
                    }, 100);
                });
                return instance;
            };

            return $delegate;
        }]);

        return moveableModal;
    }]);