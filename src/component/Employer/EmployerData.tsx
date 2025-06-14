import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { User, LevelSkill } from '../../types';

export const EmployerData = () => {
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
                setError("Не удалось загрузить данные профиля.");
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
                setSkills(response.data); // Assuming response.data is an array of LevelSkill
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

    const onFinish = async (values: any) => {
        try {
            values.user_id = userData.id;
            await axios.post(import.meta.env.VITE_BASE_URL + `api/employers/add/?token=${token}`, values);
            
            message.success('Данные успешно отправлены!');
            navigate('/profile');
        } catch (error) {
            message.error('Произошла ошибка при отправке данных.');
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1>Введите данные работодателя</h1>
            <Form
                name="employer_data"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="Имя"
                    name="name"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Организация"
                    name="organization"
                    rules={[{ required: true, message: 'Пожалуйста, введите название организации!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Описание"
                    name="description"
                    rules={[{ required: true, message: 'Пожалуйста, введите описание!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label="Уровень навыков"
                    name="level_skill"
                    rules={[{ required: true, message: 'Пожалуйста, выберите уровень навыков!' }]}
                >
                    <Select placeholder="Выберите уровень навыков">
                        {skills.map(skill => (
                            <Select.Option key={skill.id} value={skill.id}>
                                {skill.level} {/* Assuming 'level' is the property to display */}
                            </Select.Option>
                        ))}
                    </Select>
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

export default EmployerData;
