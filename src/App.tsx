import {
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { message } from "antd";
import type { AxiosError } from "axios";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import { ProblemDetails } from "./types";
import { VacancyList } from "./component/Vacancy/VacancyList";
import { VacancyForm } from "./component/Vacancy/VacancyForm";
import { Profile } from "./component/User/Profile";
import { LoginForm } from "./component/User/LoginForm";
import { RegisterForm } from "./component/User/RegisterForm";
import { Layout } from "./component/Base/Layout";
import StudentData from "./component/Student/StudentData";
import EmployerData from "./component/Employer/EmployerData";
import ApplicationsPage from "./component/Application/ApplictionPage";
import { MyVacancies } from "./component/Vacancy/MyVacancies";
import { VacancyApplications } from "./component/Vacancy/ApplicationVacancy";


const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
		mutations: {
			retry: false,
			onError: (error) => {
				console.error(error);
			},
		},
	},
	mutationCache: new MutationCache({
		onError: (error, variables, context, mutation) => {
			try {
				if (mutation.options.onError)
					mutation.options.onError(error, variables, context);
			} catch (e) {
				const axiosError = error as AxiosError;
				const problemDetails = axiosError.response?.data as ProblemDetails;
				if (problemDetails.title)
					message.error({ content: problemDetails.title });
				else {
					
				}
			} finally {
				mutation.state.context = mutation.state.context || {};
				const c = mutation.state.context as { errorHandled?: boolean };
				c.errorHandled = true;
			}
		},
	}),
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route path="/" element={<VacancyList />} />
						<Route path="/new" element={<VacancyForm />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/login" element={<LoginForm />} />
						<Route path="/register" element={<RegisterForm />} />
						<Route path="/student-data" element={<StudentData />} />
						<Route path="/employer-data" element={<EmployerData />} />
						<Route path="/applications" element={<ApplicationsPage />} />
						<Route path="/my-vacancies" element={<MyVacancies />} />
						<Route path="/vac-application/:id" element={
							<WithParams<{ id: number }>
									render={(p) => <VacancyApplications resourceId={p.id} />}
								/>} />
						<Route
							path="/:id"
							element={
								<WithParams<{ id: number }>
									render={(p) => <VacancyForm resourceId={p.id} />}
								/>
							}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

function WithParams<T>({
	render,
}: {
	render: (params: T) => React.ReactNode;
}) {
	const params = useParams();
	return render(params as never);
}

export default App;
