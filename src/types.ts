/*public record ResourceDto(Guid Id, string Address, ResourceCheckMethodDto[] Checks);

public record ResourceCheckMethodDto(Guid Id, CheckMethodType Type, ResourceCheckResultDto? Result);

public record ResourceCheckResultDto(Guid Id, bool Healthy, DateTime Time, string? Error);*/

export type Resource = {
	id: string;
	address: string;
	checks: Check[];
};

export type Vacancies = {
	date_begin: string;
	date_end: string;
	description: string;
	id: number;
	id_employer: number;
	is_active: boolean;
	level_skill: string;
	post: string;
	salary:number;
};

export type Student = {
	id: number;
	fio: string;
	post: string;
	level_skill: number;
	speciality: string;
	course: number;
	ability: string;
}

export type Employer = {
	id: number;
	name: string;
	organization: string;
	description: string;
}

export type Status = {
	id: number;
	name: string;
	description: string;
}


export type Token ={
	token: string;
};
	export type LoginData = {
	email: string;
	password: string;
}

export type RegisterData = {
	email: string;
	password: string;
	phone: string;
}

export type LevelSkill = {
	id: number;
	level: string;
}

export type Application = {
	id: number;
	id_student: number;
	id_vacancy: number;
	date: string;
	id_status: number;
	vacancy: any
};

export type ApplicationAdd = {
	id_student: number;
	id_vacancy: number;
}

export type CheckMethodType = "Http" | "Ping";

export type Check = {
	id: string;
	type: CheckMethodType;
	result?: CheckResult;
};

export type CheckResult = {
	id: string;
	healthy: boolean;
	time: string;
	error?: string;
};

export type User = {
	id: string;
	name: string;
	email: string;
	phone_number: string;
	student_id: number | null;
	employer_id: number | null;
};

export type ProblemDetails = {
	type: string;
	title: string;
	status: number;
	detail: string;
	errors?: Record<string, string[]>;
	traceId: string;
};
