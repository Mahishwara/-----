import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, message, Space, Table } from "antd";
import axios from "axios";
import { User, Vacancies, LevelSkill } from "../../types"; // Ensure LevelSkill type is imported correctly
import { Header } from "../Base/Header";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";



const { Column } = Table;

export const VacancyList: React.FC = () => {
    const [userData, setUserData] = useState<User>();
    const [skills, setSkills] = useState<{ [key: string]: LevelSkill | null }>({});
    const [error, setError] = useState<string>('');
    const token = Cookies.get('token');

    // Fetch vacancies
    const { data: resources } = useQuery({
        queryKey: ["resources"],
        queryFn: async () => {
            const res = await axios.get<Vacancies[]>(import.meta.env.VITE_BASE_URL + "api/vacancies");
            
            return res.data;
        },
        refetchInterval: 500000,
    });

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                console.log(import.meta.env.VITE_BASE_URL + `api/auth/me/?token=${token}`)
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/auth/me/?token=${token}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setUserData(response.data);
            } catch (err) {
                setError('Не удалось загрузить данные профиля.');
                console.error("Ошибка при получении данных пользователя:", err);
            }
        };
        fetchUserData();
    }, [token]);

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

    // Mutation for posting application
    const { mutate: postApplication } = useMutation({
        mutationFn: async (resource: Vacancies) => {
            if (userData && userData.student_id != null) {
                const applicationData = { "id_student": userData.student_id, "id_vacancy": resource.id };
                try {
                    const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/applications/?id_vacancy=${resource.id}&id_student=${userData.student_id}`);
                    if (response.data.length > 0) {
                        message.info('Вы уже подали заявку на данную вакансию');
                    } else {
                        await axios.post(import.meta.env.VITE_BASE_URL + `api/applications/add/`, applicationData);
                        message.info('Вы подали заявку');
                    }
                } catch (err) {
                    console.error("Ошибка при отправке заявки:", err);
                }
            } else {
                message.info('Вы не можете отправить заявку. Требуется роль "Студент"');
            }
        }
    });

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header />
            <Table<Vacancies> dataSource={resources}>
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
                    render={(_: any, record: Vacancies) => (
                        <Space size="middle">
                            <Button onClick={() => postApplication(record)}>
                                Отправить заявку
                            </Button>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};
