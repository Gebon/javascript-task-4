'use strict';

function toArray(arrayLikeObject) {
    return [].slice.apply(arrayLikeObject);
}

function deepCopy(arrayLikeObject) {
    return [].slice.apply(arrayLikeObject)
        .map(function (entry) {
            return Object.assign({}, entry);
        });
}

function assignRankToFunction(func, rank) {
    func.rank = rank;

    return func;
}

function getDistinctValues(collection) {
    var uniqueKeys = {};
    collection.forEach(function (entry) {
        uniqueKeys[JSON.stringify(entry)] = true;
    });

    return Object.keys(uniqueKeys)
        .map(function (jsonEntry) {
            return JSON.parse(jsonEntry);
        });
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
    var collection = deepCopy(toArray(args.shift()));
    args.sort(function (a, b) {
        return a.rank - b.rank;
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

    return assignRankToFunction(function (collection) {
        return collection.map(function (entry) {
            var result = {};
            fields.forEach(function (field) {
                if (entry.hasOwnProperty(field)) {
                    result[field] = entry[field];
                }
            });

            return result;
        });
    }, 4);
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} field – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (field, values) {
    return assignRankToFunction(function (collection) {
        return collection.filter(function (entry) {
            return values.indexOf(entry[field]) !== -1;
        });
    }, 0);
};

/**
 * Сортировка коллекции по полю
 * @param {String} field – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (field, order) {
    return assignRankToFunction(function (collection) {
        return toArray(collection).sort(function (a, b) {
            return (a[field] - b[field]) * (order === 'asc' ? 1 : -1);
        });
    }, 1);
};

/**
 * Форматирование поля
 * @param {String} field – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Array}
 */
exports.format = function (field, formatter) {
    return assignRankToFunction(function (collection) {
        return collection.map(function (entry) {
            var copy = {};
            Object.assign(copy, entry);
            copy[field] = formatter(copy[field]);

            return copy;
        });
    }, 3);
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Array}
 */
exports.limit = function (count) {
    return assignRankToFunction(function (collection) {
        return collection.slice(0, count);
    }, 2);
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.or = function () {
        var args = toArray(arguments);

        return assignRankToFunction(function (collection) {
            var result = [];
            args.forEach(function (filterInFunc) {
                result = result.concat(filterInFunc(collection));
            });

            return getDistinctValues(result);
        }, -1);
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Array}
     */
    exports.and = function () {
        var args = toArray(arguments);

        return assignRankToFunction(function (collection) {
            var result = toArray(collection);
            args.forEach(function (filterInFunc) {
                result = filterInFunc(result);
            });

            return result;
        }, -2);
    };
}
