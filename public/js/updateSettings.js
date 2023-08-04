/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Updated ${type.toUpperCase()} Successfully`);

      // Reload window
      location.reload(true);

      return res.status(200).render('account', {
        title: 'Your Account',
      });
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
