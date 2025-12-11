
import { instance } from "../utils/razorpay.js";

export const capturePayment = async (req, res) => {
//   const { courses } = req.body
//   const userId = req.user.id
console.log("here");
  // Convert rupees to paise (Razorpay expects amount in paise)
  // ₹1 = 100 paise, so multiply by 100
  const amountInRupees = Number(req.body.amount);
  console.log("Amount received from frontend (in rupees):", amountInRupees);
  let total_amount = amountInRupees * 100;
  console.log("Amount converted to paise:", total_amount);

  const options = {
    amount: total_amount,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log("here is error",error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}
