import axios from "axios";
import Cookies from 'js-cookie';
import { Header } from "../Base/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Employer, Student, User, LevelSkill } from "../../types"; 

export const Profile: React.FC = () => {
    const [userData, setUserData] = useState<User>();
    const [studentData, setStudentData] = useState<Student>();
    const [employerData, setEmployerData] = useState<Employer>();
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
                const response = await axios.get<LevelSkill[]>(`https://karasevmikhail.pythonanywhere.com/api/skills`, {
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

    
    useEffect(() => {
        if (userData) {
            if (userData.student_id) {
                const fetchStudentData = async () => {
                    try {
                        const response = await axios({
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                            url: `https://karasevmikhail.pythonanywhere.com/api/students/${userData.student_id}`
                        });
                        setStudentData(response.data);
                    } catch (err) {
                        setError('Не удалось загрузить данные студента.');
                        console.error("Ошибка при получении данных студента:", err);
                    }
                };
                fetchStudentData();
            }
            if (userData.employer_id) {
                const fetchEmployerData = async () => {
                    try {
                        const response = await axios({
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                            url: import.meta.env.VITE_BASE_URL + `api/employers/${userData.employer_id}`
                        });
                        setEmployerData(response.data);
                    } catch (err) {
                        setError('Не удалось загрузить данные работодателя.');
                        console.error("Ошибка при получении данных работодателя:", err);
                    }
                };
                fetchEmployerData();
            }
        }
    }, [userData]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!userData) {
        return <div>Загрузка...</div>;
    }

    
    const getSkillLevelName = (id: number) => {
        const skill = skills.find(skill => skill.id === id);
        return skill ? skill.level : 'Не указан'; 
    };

    const handleStudentRedirect = () => {
        navigate('/student-data'); 
    };

    const handleEmployerRedirect = () => {
        navigate('/employer-data'); 
    };

    return (
        <div className="profile">
            <Header />
            {studentData && (
                <div>
                    <h2>Данные студента</h2>
                    <p><strong>ФИО:</strong> {studentData.fio}</p>
                    <p><strong>Должность:</strong> {studentData.post}</p>
                    <p><strong>Уровень навыков:</strong> {getSkillLevelName(studentData.level_skill)}</p>
                    <p><strong>Специальность:</strong> {studentData.speciality}</p>
                    <p><strong>Курс:</strong> {studentData.course}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <strong>Телефон:</strong> {userData.phone_number}
                </div>
            )}

            {employerData && (
                <div>
                    <h2>Данные работодателя</h2>
                    <p><strong>ФИО:</strong> {employerData.name}</p>
                    <p><strong>Название организации:</strong> {employerData.organization}</p>
                    <p><strong>Описание:</strong> {employerData.description}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <strong>Телефон:</strong> {userData.phone_number}
                </div>
            )}
            {!employerData && !studentData && (
                <div className="button-container">
                    <p>Выберите роль</p>
                    <button onClick={handleStudentRedirect}>Выбрать роль студента</button>
                    <button onClick={handleEmployerRedirect}>Выбрать роль работодателя</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
