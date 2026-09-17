/**
 * Expanding Hover Menu — click selection
 */

(function () {
  'use strict';

  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      menuItems.forEach(function (el) {
        el.classList.remove('selected');
      });
      item.classList.add('selected');
    });
  });
})();
