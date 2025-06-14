import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input} from "antd";
import axios, { type AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProblemDetails, User, Vacancies } from "../../types";
import { Header } from "../Base/Header";
import Cookies from "js-cookie";


export const VacancyForm: React.FC<{
	resourceId?: number;
}> = React.memo(({ resourceId }) => {
	const [userData, setUserData] = useState<User>();
	const [error, setError] = useState(String);
	const isNew = !resourceId;
	const token = Cookies.get('token');

	const navigate = useNavigate();
	const [form] = Form.useForm();

	const { data: resource } = useQuery({
		queryKey: ["resource", resourceId],
		enabled: !isNew,
		queryFn: async () => {
			const res = await axios.get<Vacancies>(import.meta.env.VITE_BASE_URL + `api/vacancies/${resourceId}`);
			return res.data;
		},
	});


	useEffect(() => {
			const fetchUserData = async () => {
				try {
					const response = await axios({
						method: 'GET',
						headers: { 'Content-Type': 'application/json' },
						url: import.meta.env.VITE_BASE_URL + `api/auth/me/?token=${token}`
					});
					setUserData(response.data);
				} catch (err) {
					setError('Не удалось загрузить данные профиля.');
					console.error("Ошибка при получении данных пользователя:", err);
				}
			};
			fetchUserData();
		}, [token]);

	const queryClient = useQueryClient();
	const { mutate: saveResource } = useMutation({
		mutationFn: async (resource: Vacancies) => {
			await axios({
				method: isNew ? "POST" : "PUT",
				url: import.meta.env.VITE_BASE_URL + `api/vacancies/${isNew ? "add/" : "update/" + resourceId}`,
				data: resource,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resource"] });
			navigate("..");
		},
		onError(error,context) {
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

	useEffect(() => {
		if (resource) {
			form.setFieldsValue(resource);
		}
	}, [resource, form]);
	if (error) {
        return <div>{error}</div>;
    }

	return (
		<>
			<Header />
			<Form
				form={form}
				style={{ padding: 10 }}
				onFinish={async (data) => {
					if (userData){
					data.id_employer = userData.employer_id;
					}
					saveResource(data);
				}}
			>
				<Form.Item
					name="post"
					label="Наименование вакансии"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="description"
					label="Описание вакансии вакансии"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="date_begin"
					label="Дата начала стажировки в формате ГГГГ-ММ-ДД"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="date_end"
					label="Дата конца стажировки в формате ГГГГ-ММ-ДД"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="salary"
					label="Зарплата в тысячах рублей"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="level_skill"
					label="Требуемый уровень навыков (1-Junior, 2-Middle, 3-Senior)"
					rules={[{ required: true, message: "Обязательное поле" }]}
				>
					<Input />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Сохранить
					</Button>
				</Form.Item>
			</Form>
		</>
	);
});