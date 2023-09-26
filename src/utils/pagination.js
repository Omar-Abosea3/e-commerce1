const paginationFunction = ({page = 1 , size = 1}) => {
    if(page < 1) page = 1;
    if(size < 1) size = 1;

    const limit = size;
    const skip = (page - 1) * size ;

    return { limit , skip};
}

export default paginationFunction;