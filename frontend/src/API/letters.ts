import api from "./axios";

export const getAllLetters = async () => {
  return api.get("/letters/getAllLetter");
};