import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    //load stripe
    const stripe = await loadStripe(
      'pk_test_51PJsg2SBZfcuMUBYYaSK5cXZ7MEDGJ5BxUoybtn7OYzLBRMbHOZTrbm9z12AGKd4l8iaRn8xPEvSQfcq9Ci06LJZ00yxLZrhpC'
    );

    //1)get checkoutsession from api

    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    //2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
