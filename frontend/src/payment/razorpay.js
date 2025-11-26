

import axios from "axios"
import { toast } from "react-hot-toast"
import { api } from "../axios.config"


function loadScript(src) {
  console.log("in script")
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
} 


export async function MakePayment(
  donorInfo,
  amount,
  setSubmitSucess,
  navigate,
  dispatch
) {
  let user_details={};
  user_details.name=donorInfo.donorName;
  user_details.email=donorInfo.donorEmail;
  const toastId = toast.loading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    console.log("at first step")
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      toast.error(
        "Razorpay SDK failed to load. Check your Internet Connection."
      )
      return
    }

    // Initiating the Order in Backend
    const orderResponse = await api.post('/payment/capture',{amount});

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }
    console.log(" before creating the options...")
    console.log("it cant bePAYMENT RESPONSE FROM BACKEND............", orderResponse.data)

    // Opening the Razorpay SDK
    console.log("creating the options...")
    const options = {
      key: "rzp_test_FygXdONEKJQmc4",
      currency: orderResponse.data.data.currency,
      amount: `${orderResponse.data.data.amount*10}`,
      order_id: orderResponse.data.data.id,
      name: "AnganAsha",
      description: "Thank you for Donating",
      // image: rzpLogo,
      prefill: {
        name: `${user_details.name}`,
        email: user_details.email,
      },
      handler: function (response) {
        sendPaymentSuccessEmail(setSubmitSucess)
        verifyPayment()
      },
    }
    console.log(options)
    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      toast.error(" Payment Failed.")
      console.log(response.error)
      setSubmitSucess(false);
    })
    return 1;
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}

function sendPaymentSuccessEmail(setSubmitSucess){
  setSubmitSucess(true);
  // window.location.href('/')
}

function verifyPayment(){
  window.location.href('/')
}
