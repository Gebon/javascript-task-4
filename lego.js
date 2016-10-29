'use strict';

var FUNCTION_PRIORITY = ['and', 'or', 'filterIn', 'sortBy', 'limit', 'format', 'select'];

function toArray(arrayLikeObject) {
    return [].slice.apply(arrayLikeObject);
}

function deepCopy(arrayLikeObject) {
    return arrayLikeObject.map(function (entry) {
        return Object.assign({}, entry);
    });
}

function getFunctionPriority(func) {
    return FUNCTION_PRIORITY.indexOf(func.name);
}

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function () {
    var args = toArray(arguments);
    var collection = deepCopy(args.shift());
    args.sort(function (a, b) {
        return getFunctionPriority(a) - getFunctionPriority(b);
    })
    .forEach(function (queryFunc) {
        collection = queryFunc(collection);
    });

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var fields = toArray(arguments);

    return function select(collection) {
        return collection.map(function (entry) {
            var result = {};
            fields.forEach(function (field) {
                if (entry.hasOwnProperty(field)) {
                    result[field] = entry[field];
                }
            });

            return result;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} field – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (field, values) {
    return function filterIn(collection) {
        return collection.filter(function (entry) {
            return values.indexOf(entry[field]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} field – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (field, order) {
    return function sortBy(collection) {
        return toArray(collection).sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    };
};

/**
 * Форматирование поля
 * @param {String} field – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (field, formatter) {
    return function format(collection) {
        return collection.map(function (entry) {
            var copy = Object.assign({}, entry);
            copy[field] = formatter(copy[field]);

            return copy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.or = function () {
        var filterInFuncs = toArray(arguments);

        return function or(collection) {
            return collection.filter(function (entry) {
                return filterInFuncs.some(function (filterInFunc) {
                    return filterInFunc(collection).indexOf(entry) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        var filterInFuncs = toArray(arguments);

        return function and(collection) {
            return collection.filter(function (entry) {
                return filterInFuncs.every(function (filterInFunc) {
                    return filterInFunc(collection).indexOf(entry) !== -1;
                });
            });
        };
    };
}
