import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios, { type AxiosError } from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ProblemDetails, RegisterData } from "../../types";
import { HeaderExtension } from "../Base/HeaderExtensions";
import { Header } from "../Base/Header";


export const RegisterForm: React.FC = () => {

	const navigate = useNavigate();
	const [form] = Form.useForm();

	const queryClient = useQueryClient();
	const { mutate: registerFC } = useMutation({
		mutationFn: async (resource: RegisterData) => {
			await axios({
				method: "POST",
				url: import.meta.env.VITE_BASE_URL + `api/auth/register/`,
				data: resource,
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource"] });
			navigate("/login");
		},
		onError(error, context) {
			const c = context as { errorHandled?: boolean };
			if (c?.errorHandled) return;
			const axiosError = error as AxiosError;
			const problemDetails = axiosError.response?.data as ProblemDetails;
			if (problemDetails?.errors) {
				for (const p in problemDetails?.errors)
					form.setFields([
						{
							name: p,
							errors: problemDetails.errors[p],
						},
					]);
				return;
			}
			throw error;
		},
	});
	


	return (
		<div>
			<Header />
			<HeaderExtension>
				<Typography.Text strong>
					Окно входа в аккаунт
				</Typography.Text>
			</HeaderExtension>
			<Form
				form={form}
				style={{ padding: 10 }}
				onFinish={async (data) => {
					registerFC(data);
                    navigate("/login");
				}}
			>
				<Form.Item
					name="email"
					label="Введите эллектронную почту"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="password"
					label="Введите пароль"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="phone_number"
					label="Введите мобильный телефон"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Зарегистрироваться
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};