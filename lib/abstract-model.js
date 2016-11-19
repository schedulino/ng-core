/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
export class AbstractModel {
    constructor(resource) {
        this.item = {};
        this.collection = [];
        this.resource = resource;
    }

    initItem(id, params, cache) {
        if(id) {
            return this.resource.get(id, params, cache).then(item => this.item = item);
        } else {
            this.item = {};
            /*
             return and resolve helper promise to assure
             consistent API of method so that we can always
             use .then() method when calling initItem
             */
            return Promise.resolve();
        }
    }

    initCollection(params, cache) {
        return this.resource.getList(params, cache).then(collection => this.collection = collection);
    }

    getItemById(id) {
        return this.collection.find(item => item.id === id);
    }

    getItem() {
        return this.item;
    }

    setItem(item) {
        this.item = item;
    }

    getCollection() {
        return this.collection;
    }

    setCollection(collection) {
        this.collection = collection;
    }

    save(item, params) {
        // update existing item if model contains id
        if (item.id) {
            return this.resource.update(item, params).then(itemRespond => {
                item.updated = itemRespond.updated;

                for (let i = 0; i < this.collection.length; i++) {
                    if(this.collection[i].id === item.id) {
                        // Object.assign(this.collection[i], item);
                        this.collection[i] = item;
                    }
                }
            });
        } else {
            return this.resource.create(item, params).then(itemRespond => {
                if(itemRespond && itemRespond.id) {
                    item.id = itemRespond.id;
                }
                if(itemRespond && itemRespond.updated) {
                    item.updated = itemRespond.updated;
                }
                if(itemRespond && itemRespond.created) {
                    item.created = itemRespond.created;
                }
                this.collection.push(item);
            });
        }
    }

    delete(item, params) {
        return this.resource.delete(item.id, params).then(() => {
            const index = this.collection.findIndex(i => i.id === item.id);
            this.collection.splice(index, 1);
        });
    }

    isUnique(item, attribute) {
        return !this.collection.find(i => i[attribute].toLowerCase() === item[attribute].toLowerCase() && (item.id ? i.id !== item.id : true));
    }
}
