export const apiFetch = async (url, options = {}) => {
	const { body, ...rest } = options;

	const res = await fetch(url, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
		...rest,
	});

	let json;
	try {
		json = await res.json();
	} catch {
		json = null;
	}

	if (!res.ok || !json?.success) {
		const error = new Error(json?.message || res.statusText);
		error.status = res.status;
		error.errors = json?.errors || null;
		throw error;
	}
	console.log(json.data,"hooooo");
	return json.data;
};
