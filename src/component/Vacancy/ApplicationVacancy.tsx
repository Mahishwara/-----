import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Radio, Space, Table } from "antd";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { Application, ProblemDetails, Status, Student, LevelSkill } from "../../types"; // Ensure Skill type is imported
import { Header } from "../Base/Header";
import { useEffect, useState } from "react";
import React from "react";

const { Column } = Table;

export const VacancyApplications: React.FC<{
    resourceId?: number;
}> = React.memo(({ resourceId }) => {
    const [applicationsData, setApplicationData] = useState<Application[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [students, setStudents] = useState<{ [key: number]: Student | null }>({});
    const [skills, setSkills] = useState<{ [key: number]: LevelSkill | null }>({});
    const [error, setError] = useState<string>('');
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchApplicationData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/applications?id_vacancy=${resourceId}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setApplicationData(response.data);

                // Fetch student data for each application
                const studentPromises = response.data.map(async (application: Application) => {
                    const studentResponse = await axios.get(import.meta.env.VITE_BASE_URL + `api/students/${application.id_student}`);
                    return { id: application.id_student, data: studentResponse.data };
                });

                const studentsData = await Promise.all(studentPromises);
                const studentsMap: { [key: number]: Student | null } = {};
                studentsData.forEach(student => {
                    studentsMap[student.id] = student.data;
                });
                setStudents(studentsMap);
            } catch (err) {
                setError('Не удалось загрузить данные заявок.');
                console.error("Ошибка при получении данных заявок:", err);
            }
        };
        fetchApplicationData();
    }, [resourceId]);

    useEffect(() => {
        const fetchStatusesData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/statuses/`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setStatuses(response.data);
            } catch (err) {
                setError("Не удалось загрузить данные статусов.");
                console.error("Ошибка при получении данных статусов:", err);
            }
        };
        fetchStatusesData();
    }, []);

    useEffect(() => {
        const fetchSkillsData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/skills`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const skillsMap: { [key: number]: LevelSkill} = {};
                response.data.forEach((skill: LevelSkill) => {
                    skillsMap[skill.id] = skill; // Assuming skill has an id and level properties
                });
                setSkills(skillsMap);
            } catch (err) {
                setError("Не удалось загрузить данные навыков.");
                console.error("Ошибка при получении данных навыков:", err);
            }
        };
        fetchSkillsData();
    }, []);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate: updateResource } = useMutation({
        mutationFn: async (resource: Application) => {
            await axios.put(import.meta.env.VITE_BASE_URL + `api/applications/update/${resource.id}`, resource);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resource"] });
            navigate("/my-vacancies");
        },
        onError(error, context) {
            const c = context as { errorHandled?: boolean };
            if (c?.errorHandled) return;
            const axiosError = error as AxiosError;
            const problemDetails = axiosError.response?.data as ProblemDetails;
            if (problemDetails?.errors) {
                for (const p in problemDetails.errors)
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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header />
            <Table<Application> dataSource={applicationsData}>
                <Column title="Студенты" key="students" render={(record: Application) => {
                    const student = students[record.id_student];
                    if (student) {
                        const skill = skills[student.level_skill]; // Assuming level_skill is the skill ID
                        return (
                            <ul>
                                <li>ФИО: {student.fio}</li> {/* Adjust according to the actual property name */}
								<li>Роль: {student.post}</li>
                                {skill && <li>Уровень навыка: {skill.level}</li>} {/* Display the skill level */}
								<li>Описание навыков: {student.ability}</li>
								<li>Специальность обучения: {student.speciality}</li>
								<li>Курс: {student.course}</li>
                            </ul>
                        );
                    }
                    return <p>Загрузка данных студента...</p>;
                }} />
                <Column title="Текущий статус" key="id_status" render={(record: Application) => {
                    const status = statuses.find(s => s.id === record.id_status);
                    return status ? status.name : 'Неизвестный статус';
                }} />
                <Column
                    title="Action"
                    key="action"
                    render={(_: any, record: Application) => (
                        <Space size="middle">
                            <Form
                                form={form}
                                style={{ padding: 10 }}
                                onFinish={async (data) => {
                                    data.id = record.id;
                                    updateResource(data);
                                }}
                            >
                                <Form.Item
                                    name="id_status"
                                    label="Новый статус"
                                    rules={[{ required: true, message: "Обязательное поле" }]}
                                >
                                    <Radio.Group block options={statuses.map(status => ({ label: status.name, value: status.id.toString() }))} defaultValue={record.id_status} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Изменить статус
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
});
