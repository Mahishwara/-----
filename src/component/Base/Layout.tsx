import {Flex} from "antd";
import axios from "axios";
import React from "react";
import { Outlet } from "react-router-dom";
import { HeaderExtensions } from "./HeaderExtensions";

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (401 === error.response.status) {
			location.href = "/login";
		}
		return Promise.reject(error);
	},
);

export const Layout: React.FC = React.memo(() => {

	return (
		<div>
			<Flex
				align="baseline"
				justify="space-between"
				style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", padding: 4 }}
			>
				<HeaderExtensions />
			</Flex>
			<Outlet />
		</div>
	);
});
