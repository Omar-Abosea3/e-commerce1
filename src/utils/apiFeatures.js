// class of filters and pagination .

import paginationFunction from "./pagination.js";

// productModel.find() => mongooseQuery.
export class ApiFeatures{
    constructor(mongooseQuery , queryData){
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }

    // pagination.
    pagination(){
        const {page , size} = this.queryData;
        const {limit , skip} = paginationFunction({page , size});
        this.mongooseQuery.limit(limit).skip(skip);
        return this;
    }

    //sort.
    sort(){
        this.mongooseQuery.sort(this.queryData.sort?.replaceAll(',' , ' '));
        return this;
    }
    // filters.
    filters(){
        const queryInistance = {...this.queryData};
        const excludedKeys = ['sort' , 'select' , 'search' , 'size' , 'page'];
        excludedKeys.forEach((key)=>delete queryInistance[key]);
        const filters = JSON.parse(JSON.stringify(queryInistance).replace(/gt|gte|lt|lte|eq|in|nin|neq|regex/g,
        (match) => `$${match}`));
        this.mongooseQuery.find(filters);
        return this
    }

    // select.
}