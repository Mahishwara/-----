import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Student, User, LevelSkill } from '../../types';

export const StudentData = () => {
    const [userData, setUserData] = useState<User>();
    const [skills, setSkills] = useState<LevelSkill[]>([]);
    const [error, setError] = useState<string>('');
    const token = Cookies.get('token');
    const navigate = useNavigate();

    
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

   
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get<LevelSkill[]>(import.meta.env.VITE_BASE_URL + `api/skills`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setSkills(response.data);
            } catch (err) {
                setError('Не удалось загрузить данные уровней навыков.');
                console.error("Ошибка при получении данных навыков:", err);
            }
        };
        fetchSkills();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (!userData) {
        return <div>Загрузка...</div>;
    }

    const onFinish = async (values: Student) => {
        values.ability = '123';
        try {
            await axios.post(import.meta.env.VITE_BASE_URL + `api/students/add/?token=${token}`, values);
            message.success('Данные успешно отправлены!');
            navigate('/profile');
        } catch {
            message.error('Произошла ошибка при отправке данных.');
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1>Введите данные студента</h1>
            <Form
                name="student_data"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="ФИО"
                    name="fio"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваше ФИО!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Должность"
                    name="post"
                    rules={[{ required: true, message: 'Пожалуйста, введите вашу должность!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Уровень навыков"
                    name="level_skill"
                    rules={[{ required: true, message: 'Пожалуйста, укажите уровень навыков!' }]}
                >
                    <Select placeholder="Выберите уровень навыков">
                        {skills.map(skill => (
                            <Select.Option key={skill.id} value={skill.id}>
                                {skill.level}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Специальность"
                    name="speciality"
                    rules={[{ required: true, message: 'Пожалуйста, введите вашу специальность!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Курс"
                    name="course"
                    rules={[{ required: true, message: 'Пожалуйста, укажите курс!' }]}
                >
                    <InputNumber min={1} max={5} />
                </Form.Item>

                <Form.Item
                    label="Описание навыков"
                    name="ability"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваши навыки!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Отправить
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default StudentData;
