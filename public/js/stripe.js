/* eslint-disable */
import axios from "axios";

export const bookTour = async tourId => {
    const stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

    try {
        // 1. Get checkout session from the API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        // 2. Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert("error", err);
    }
};
