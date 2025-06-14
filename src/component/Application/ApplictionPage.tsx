import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { Header } from '../Base/Header';
import { Application, Status, Vacancies } from '../../types';

const ApplicationsPage = () => {
    const [studentId, setStudentId] = useState<number | null>(null); // Initialize with null
    const [applications, setApplications] = useState<Application[]>([]);
    const [vacancies, setVacancies] = useState<{ [key: number]: Vacancies[] }>({}); // Use an object to map vacancies by ID
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [error, setError] = useState<string>('');
    const token = Cookies.get('token');

    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/auth/me/?token=${token}`);
                setStudentId(response.data.student_id); // Ensure student_id is fetched correctly
            } catch (error) {
                message.error('Ошибка при получении данных студента');
            }
        };

        fetchStudentId();
    }, [token]);

    useEffect(() => {
        if (studentId) {
            const fetchApplications = async () => {
                try {
                    const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/applications/?id_student=${studentId}`);
                    setApplications(response.data); // Ensure applications are fetched correctly
                } catch (error) {
                    message.error('Ошибка при получении заявок');
                }
            };

            fetchApplications();
        }
    }, [studentId]);

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
        if (applications.length > 0) {
            const fetchVacancies = async () => {
                const vacancyPromises = applications.map(async (application) => {
                    const vacancyId = application.id_vacancy; // Ensure vacancy ID is correct
                    try {
                        const response = await axios.get(import.meta.env.VITE_BASE_URL + `api/vacancies/?id=${vacancyId}`);
                        return { ...application, vacancy: response.data }; // Add vacancy data to application
                    } catch (error) {
                        message.error(`Ошибка при получении вакансии для заявки с ID: ${application.id}`);
                        return application; // Return application without vacancy data
                    }
                });

                const vacanciesData = await Promise.all(vacancyPromises);
                const vacanciesMap: { [key: number]: Vacancies[] } = {};
                vacanciesData.forEach((item) => {
                    vacanciesMap[item.id] = item.vacancy; // Store vacancies by application ID
                });
                setVacancies(vacanciesMap);
            };

            fetchVacancies();
        }
    }, [applications]);


    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header />
            <h1>Отправленные заявки на вакансии</h1>
            {applications.length === 0 ? (
                <p>Нет отправленных заявок.</p>
            ) : (
                <ul>
                    {applications.map(application => {
                        const status = statuses.find(s => s.id === application.id_status);

                        return (
                            <li key={application.id}>
                                {vacancies[application.id] && (
                                    <div>
                                        <h2>Название: {vacancies[application.id][0].post}</h2>
                                        <p>Описание: {vacancies[application.id][0].description}</p>
                                        <p>Статус: {status ? status.name : 'Неизвестный статус'}</p>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ApplicationsPage;
