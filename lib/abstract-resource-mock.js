/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import URI from 'urijs';

const HEADER_API_VERSION = 'application/json';

export class AbstractResourceMock {
    init($httpBackend, localStorageService, route, mockData, mockListData, errorField){
        const patternBase = new RegExp(`\/${route}`);
        const patternGet = new RegExp(`\/${route}\/[a-z]*`);
        const patternId = new RegExp(`\/${route}\/(\\d+|[a-z]*)`);
        const key = route.slice(0, -1);
        const patternLocalStorage = new RegExp(`${key}_(\\d+|[a-z]*)`);

        mockListData.forEach(function (data) {
            localStorageService.set(`${key}_${data.id}`, data);
        });

        $httpBackend.whenGET(patternGet)
            .respond( (method, url, data, headers) => {
                console.log('GET',url);
                headers['Content-Type'] = HEADER_API_VERSION;
                const id = url.match(patternId)[1];
                const dataLocal = localStorageService.get(`${key}_${id}`);

                if(id === '404') {
                    return [404];
                } else if(id === '500') {
                    return [500];
                }

                return [200, dataLocal ? dataLocal : mockData];
            });

        $httpBackend.whenGET(patternBase)
            .respond( (method, url, data, headers) => {
                console.log('GET',url);
                headers['Content-Type'] = HEADER_API_VERSION;
                const result = URI.parse(url);
                const queryString = URI.parseQuery(result.query);
                let dataListLocal = localStorageService.findLocalStorageItems(patternLocalStorage);

                let tmpList = [];
                if(queryString.status) {
                    dataListLocal.forEach(item => {
                        if(queryString.status.includes(',')) {
                            const values = queryString.status.split(',');
                            if(item.status === values[0] || item.status === values[1]) {
                                tmpList.push(item);
                            }
                        } else {
                            if(item.status === queryString.status) {
                                tmpList.push(item);
                            }
                        }
                    });

                    dataListLocal = tmpList;
                }

                if(queryString.fields) {
                    tmpList = [];
                    const fields = queryString.fields.split(',');
                    dataListLocal.forEach(item => {
                        let tmpObject = {};
                        fields.forEach(field => {
                            if(item.hasOwnProperty(field)) {
                                tmpObject[field] = item[field];
                            }
                        });

                        tmpList.push(tmpObject);
                    });

                    dataListLocal = tmpList;
                }

                return [200, dataListLocal.length > 0 ? dataListLocal : mockListData];
            });

        $httpBackend.whenPOST(patternBase)
            .respond( (method, url, data, headers) => {
                console.log('POST',url);
                headers['Content-Type'] = HEADER_API_VERSION;
                data = JSON.parse(data);

                if(data[errorField] === '500') {
                    return [500];
                } else if(data[errorField] === '409') {
                    return [409];
                }

                data.id = Math.floor(Date.now() / 1000).toString();
                localStorageService.set(`${key}_${data.id}`, data);

                return [201, {id: data.id}];
            });

        $httpBackend.whenPUT(patternBase)
            .respond( (method, url, data, headers) => {
                console.log('PUT',url);
                headers['Content-Type'] = HEADER_API_VERSION;
                data = JSON.parse(data);

                if(data[errorField] === '404') {
                    return [404];
                } else if(data[errorField] === '409') {
                    return [409];
                } else if(data[errorField] === '500') {
                    return [500];
                }

                localStorageService.set(`${key}_${data.id}`, data);

                return [200, data];
            });

        $httpBackend.whenDELETE(patternBase)
            .respond( (method, url, data, headers) => {
                console.log('DELETE',url);
                headers['Content-Type'] = HEADER_API_VERSION;
                const id = url.match(patternId)[1];

                if(id === '404') {
                    return [404];
                } else if(id === '500') {
                    return [500];
                }

                localStorageService.remove(`${key}_${id}`);

                return [204];
            });
    }
}
