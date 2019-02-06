import someFunction from './someFile';

const callback = () => {
  someFunction(
    document.getElementById('q').value,
    document.getElementById('filter').value
  );
  return false;
};

document.addEventListener('DOMContentLoaded', callback);

const ele = document.getElementById('for');

if (ele.addEventListener) {
  ele.addEventListener('submit', callback); //Modern browsers
} else if (ele.attachEvent) {
  ele.attachEvent('onsubmit', callback); //Old IE
}
