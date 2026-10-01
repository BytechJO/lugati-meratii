import api from "./axios";

export const getMyClass = async () => {    
  const res = await api.get("/class/getMuClass/StudentClass");
  return res.data; 
};


export const getMyClassApi = async (token: string) => {
  const res = await api.get("/class/getMuClass/StudentClass", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
};

export const getAllClasses = async () => {
  return api.get("/class/getAllClass"); // عدّلي المسار حسب الباك إند
};
