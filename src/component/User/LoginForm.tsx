import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Typography } from "antd";
import axios, { type AxiosError } from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import { Header } from "../Base/Header";
import { LoginData, ProblemDetails } from "../../types";

export const LoginForm: React.FC = () => {

	const navigate = useNavigate();
	const [form] = Form.useForm();

	const queryClient = useQueryClient();
	const { mutate: loginFC } = useMutation({
		mutationFn: async (resource: LoginData) => {
			const responce = await axios({
				method: "POST",
				url: import.meta.env.VITE_BASE_URL + `api/auth/login/`,
				data: resource,
			});
            if (responce.status === 200) {
                const token = responce.data.access_token;
                Cookies.set('token', token, {
                    path: '/',
                    secure: true
                });
            }
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource"] });
            navigate("/profile")
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
		<>
            <Header />
			
				<Typography.Text strong>
					Окно входа в аккаунт
				</Typography.Text>

			<Form
				form={form}
				style={{ padding: 10 }}
				onFinish={async (data) => {
					loginFC(data);
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
				
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Войти
					</Button>
				</Form.Item>
                <Form.Item>
					<Button type="link" href="/register">
						Зарегистрироваться можно здесь
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};
