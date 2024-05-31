import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);

      if (type === 'data') {
        document.querySelector('.form__user-photo').src = `/img/users/${
          res.data.data.user.photo
        }?${new Date().getTime()}`;
      }
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};