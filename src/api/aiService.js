import API from "./api";


export const sendMessage = async (message) => {
  try {
    const response = await API.post("/ai/chat", {
      message,
    });

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const getChatHistory = async () => {
  try {
    const response = await API.get("/ai/history");

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};