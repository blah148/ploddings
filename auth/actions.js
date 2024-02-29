// actions.js
export const loginUser = (userId) => {
  return {
    type: 'LOGIN',
    payload: {
      userId,
    },
  };
};

export const logoutUser = () => {
  return {
    type: 'LOGOUT',
  };
};

