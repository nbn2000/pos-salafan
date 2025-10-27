export interface ILoginPost {
  username: string;
  password: string;
}

export interface IRegisterPost extends ILoginPost {
  phone_number: string;
  full_name: string;
}
// Again push that shit
export interface IBothResponse {
  message: string;
  access: string;
  refresh: string;
}

export interface IUserUpdate {
  username: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
}

export type IUserData = {
  user: {
    id: string;
    username: string;
    role: string;
    createdAt: string; // ISO format date
    updatedAt: string; // ISO format date}
  };
};
