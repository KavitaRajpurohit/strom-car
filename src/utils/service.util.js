const getQueryOptions = query => {
	const page = query.page * 1 || 1;
	const limit = query.limit * 1 || 100;
	const skip = (page - 1) * limit;

	let sort = {};
	if (query.sortBy) {
		const parts = query.sortBy.split(':');
		// console.log(parts[1]);
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	} else {
		sort = { 'createdAt': -1 };
	}
	// console.log("Limit", limit, "Skip :", skip, "Sort :", sort, "page: ", page);
	return { limit, skip, sort, page };
};

module.exports = {
	getQueryOptions
};
