import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Space, Table } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Vacancies, User, LevelSkill } from "../../types"; // Ensure LevelSkill type is imported correctly
import { Header } from "../Base/Header";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const { Column } = Table;

export const MyVacancies: React.FC = () => {
    const [userData, setUserData] = useState<User | undefined>(undefined);
    const [skills, setSkills] = useState<{ [key: string]: LevelSkill | null }>({});
    const [error, setError] = useState<string>('');
    const token = Cookies.get('token');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/auth/me/?token=${token}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setUserData(response.data);
            } catch (err) {
                setError("Не удалось загрузить данные профиля.");
                console.error("Ошибка при получении данных пользователя:", err);
            }
        };
        fetchUserData();
    }, [token]);

    // Fetch vacancies based on employer ID
    const { data: resources } = useQuery<Vacancies[]>({
        queryKey: ["resources"],
        queryFn: async () => {
            if (userData && userData.employer_id != null) {
                const res = await axios.get<Vacancies[]>(import.meta.env.VITE_BASE_URL + `api/vacancies/?id_employer=${userData.employer_id}`);
                return res.data;
            }
            return []; // Return an empty array if no employer_id
        },
        refetchInterval: 5000,
    });

    // Fetch skills data
    useEffect(() => {
        const fetchSkillsData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/skills`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const skillsMap: { [key: number]: LevelSkill | null } = {};
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

    const { mutate: delVacancy } = useMutation({
        mutationFn: async (resource: Vacancies) => {
            try {
                await axios.delete(import.meta.env.VITE_BASE_URL + `api/vacancies/delete/${resource.id}`);
            } catch (err) {
                console.error("Ошибка при удалении вакансии:", err);
            }
        }
    });

    const navigate = useNavigate();
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header />
            <Button onClick={() => navigate("/new")}>
                Добавить вакансию
            </Button>
            <Table<Vacancies> dataSource={resources || []} rowKey="id">
                <Column title="Вакансия" dataIndex="post" key="post" />
                <Column title="Описание" dataIndex="description" key="description" />
                <Column title="Начало стажировки" dataIndex="date_begin" key="date" />
                <Column title="Конец стажировки" dataIndex="date_end" key="date" />
                <Column title="Оплата" dataIndex="salary" key="salary" />
                <Column
                    title="Уровень навыков"
                    key="level"
                    render={(record: Vacancies) => {
                        const skill = skills[record.level_skill]; // Assuming level_skill is the skill ID
                        return skill ? skill.level : 'Неизвестный уровень'; // Display level or a fallback message
                    }}
                />
                <Column
                    title="Action"
                    key="action"
                    render={(_, record: Vacancies) => (
                        <Space size="middle">
                            <Button onClick={() => navigate(`/${record.id}`)}>
                                Редактировать
                            </Button>
                            <Button onClick={() => delVacancy(record)}>
                                Удалить вакансию
                            </Button>
                            <Button onClick={() => navigate(`/vac-application/${record.id}`)}>
                                Получить заявки
                            </Button>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};
