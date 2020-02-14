import React from 'react';
// import LiveAnnouncer from '../components/federated-solr-faceted-search.js'
import Enzyme, { shallow } from 'enzyme';
// import Adapter from "enzyme-adapter-react-16";

// Enzyme.configure({ adapter: new Adapter() });

describe("Filter function", () => {
	const input = [
		{ id: 1, url: "https://www.url1.dev" },
		{ id: 2, url: "https://www.url2.dev" },
		{ id: 3, url: "https://www.link3.dev" }
	];

	const output = [{ id: 3, url: "https://www.link3.dev" }];

	expect(filterByTerm(input, "link")).toEqual(output);
});
