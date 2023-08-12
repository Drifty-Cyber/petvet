/* eslint-disable */
/* eslint-disable */
import Stripe from 'stripe';
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NUvj3BmDFQCANgGMpuxwdr6DzCoHw4A1X6VeWLUW2Bkt2qBOB6X3xiSRrnQw7FW6mumFtisBG1OKN4fwgM08rPo009y5lQwo4'
);

export const buyPet = async (petId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${petId}`);
    // console.log(session);

    // 2) Create checkout form + charge card  (REDIRECT TO CHECKOUT PAGE)
    // Redirect User to checkout page thorough generated session url
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
