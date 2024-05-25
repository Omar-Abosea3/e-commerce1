const paginationFunction = ({page = 1 , size = 10}) => {
    const limit = Math.max(size, 1); // ensure size is at least 1
    const skip = (Math.max(page, 1) - 1) * limit; // ensure page is at least 1
    return { limit, skip };
}

export default paginationFunction;