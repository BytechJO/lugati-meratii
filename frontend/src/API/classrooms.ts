import api from "./axios";

export async function joinClassroomByCode(code: string) {
  const response = await api.post("/class/class/join", {
    code,
  });

  return response.data;
}

export const getTeacherClasses = () => {
  return api.get("/class/getClassByTeacherId");
};


export const getStudentsByClassId = (classId: number) => {
  return api.get(`/class/student/${classId}`);
};
export const getClassById = (id: number) => {
  return api.get(`/class/getClassById/${id}`);
};
export const createClass = (name: string) => {
  return api.post("/class/createNewClass", { name });
};

export const deleteClassById = (classId: number) => {
  return api.delete(`/class/deleteClass/${classId}`);
};