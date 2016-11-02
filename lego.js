'use strict';

function objectAssign(target, source) {
    Object.keys(source).forEach(function (property) {
        target[property] = source[property];
    });

    return target;
}

var FUNC_PRIORITY = ['and', 'or', 'filterIn', 'sortBy', 'limit', 'format', 'select'];

function toArray(arrayLikeObject) {
    return [].slice.apply(arrayLikeObject);
}

function clone(arrayLikeObject) {
    return arrayLikeObject.map(function (entry) {
        return objectAssign({}, entry);
    });
}

function getFuncPriority(func) {
    return FUNC_PRIORITY.indexOf(func.name);
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
    var collection = clone(args.shift());

    return args.sort(function (a, b) {
        return getFuncPriority(a) - getFuncPriority(b);
    })
    .reduce(function (acc, queryFunc) {
        return queryFunc(acc);
    }, collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = toArray(arguments);

    return function select(collection) {
        return collection.map(function (entry) {
            return properties.reduce(function (result, property) {
                if (entry.hasOwnProperty(property)) {
                    result[property] = entry[property];
                }

                return result;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (entry) {
            return values.indexOf(entry[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return toArray(collection).sort(function (a, b) {
            return (a[property] > b[property] ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (entry) {
            var copy = objectAssign({}, entry);
            copy[property] = formatter(copy[property]);

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
