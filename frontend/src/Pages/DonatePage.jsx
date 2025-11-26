import React, { useState } from 'react';
import { api } from '../axios.config.js';
import { 
  DollarSign, 
  Book, 
  ShirtIcon as Shirt, 
  ToyBrick,
  Heart,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';
import { MakePayment } from '../payment/razorpay.js';

const DonatePage = () => {
  const [activeTab, setActiveTab] = useState('money');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state for different donation types
  const [loading,setLoading]=useState(false);
  const [donorInfo, setDonorInfo] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorAddress: ''
  });

  const [moneyDonation, setMoneyDonation] = useState({
    amount: '',
    paymentMethod: 'online',
    transactionId: ''
  });

  const [itemDonation, setItemDonation] = useState({
    itemDescription: '',
    quantity: '',
    condition: 'good'
  });

  const [selectedImages, setSelectedImages] = useState([]);

  const donationTypes = [
    { id: 'money', name: 'Money', icon: DollarSign, color: 'green' },
    { id: 'books', name: 'Books', icon: Book, color: 'blue' },
    { id: 'clothes', name: 'Clothes', icon: Shirt, color: 'purple' },
    { id: 'toys', name: 'Toys', icon: ToyBrick, color: 'orange' }
  ];

 async function handlepayment(){
  if(!moneyDonation.amount|| moneyDonation.amount==0){
    return;
  }
       setLoading(true);
    const value=  await MakePayment(donorInfo,moneyDonation.amount,setSubmitSuccess);
      // console.log(value.code);
      setLoading(false);
      // if(value.code!="BAD_REQUEST_ERROR"){
      
      // setSubmitSuccess(true)
      // }
      // else setSubmitSuccess(false);
  }

  const handleDonorInfoChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleMoneyDonationChange = (e) => {
    setMoneyDonation({
      ...moneyDonation,
      [e.target.name]: e.target.value
    });
  };

  const handleItemDonationChange = (e) => {
    setItemDonation({
      ...itemDonation,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!donorInfo.donorName || !donorInfo.donorEmail || !donorInfo.donorPhone) {
      setError('Please fill in all required donor information');
      return false;
    }

    if (activeTab === 'money') {
      if (!moneyDonation.amount || moneyDonation.amount <= 0) {
        setError('Please enter a valid donation amount');
        return false;
      }
    } else {
      if (!itemDonation.itemDescription || !itemDonation.quantity || itemDonation.quantity <= 0) {
        setError('Please provide item description and quantity');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add donor info
      Object.keys(donorInfo).forEach(key => {
        if (donorInfo[key]) {
          formData.append(key, donorInfo[key]);
        }
      });

      // Add donation type
      formData.append('donationType', activeTab);

      // Add specific donation data
      if (activeTab === 'money') {
        formData.append('amount', moneyDonation.amount);
        formData.append('paymentMethod', moneyDonation.paymentMethod);
        if (moneyDonation.transactionId) {
          formData.append('transactionId', moneyDonation.transactionId);
        }
      } else {
        formData.append('itemDescription', itemDonation.itemDescription);
        formData.append('quantity', itemDonation.quantity);
        formData.append('condition', itemDonation.condition);
      }

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      // Debug: Log form data
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await api.post('/donations/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Donation response:', response.data);
      setSubmitSuccess(true);
      
      // Reset form
      setDonorInfo({
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        donorAddress: ''
      });
      setMoneyDonation({
        amount: '',
        paymentMethod: 'online',
        transactionId: ''
      });
      setItemDonation({
        itemDescription: '',
        quantity: '',
        condition: 'good'
      });
      setSelectedImages([]);

    } catch (err) {
      console.error('Error submitting donation:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loading){
    return (<div >
      Loading...
    </div>)
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Making a Difference!</h2>
          <p className="text-gray-600 mb-6">
            Your generous donation will help shape a better future for over 100 children in our aanganwadis. Together, we&apos;re building brighter tomorrows and creating lasting impact in young lives!
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support AanganAsha
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your generosity helps us provide better care, education, and support to children in aanganwadis across the country. Every donation makes a difference.
          </p>
        </div>

        {/* Donation Type Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {donationTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                    activeTab === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="font-medium">{type.name}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={donorInfo.donorName}
                  onChange={handleDonorInfoChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="donorEmail"
                  value={donorInfo.donorEmail}
                  onChange={handleDonorInfoChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={donorInfo.donorPhone}
                  onChange={handleDonorInfoChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="donorAddress"
                  value={donorInfo.donorAddress}
                  onChange={handleDonorInfoChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Donation Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'money' ? 'Donation Amount' : `${donationTypes.find(t => t.id === activeTab)?.name} Details`}
              </h3>

              {activeTab === 'money' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={moneyDonation.amount}
                      onChange={handleMoneyDonationChange}
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={moneyDonation.paymentMethod}
                      onChange={handleMoneyDonationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="online">Online Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID (if applicable)
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={moneyDonation.transactionId}
                      onChange={handleMoneyDonationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Description *
                    </label>
                    <textarea
                      name="itemDescription"
                      value={itemDonation.itemDescription}
                      onChange={handleItemDonationChange}
                      required
                      rows={3}
                      placeholder={`Describe the ${activeTab} you're donating...`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={itemDonation.quantity}
                      onChange={handleItemDonationChange}
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={itemDonation.condition}
                      onChange={handleItemDonationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload for physical items */}
            {activeTab !== 'money' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos (Optional)</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Upload photos of your donation</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition duration-200"
                    >
                      Choose Images
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Maximum 5 images</p>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center pt-6">
              {activeTab === 'money' ? (
                <button
                  onClick={(e)=>{
                    e.preventDefault();
                    handlepayment();
                  }}
                  type="button"
                  disabled={isSubmitting || loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition duration-200 flex items-center gap-2 mx-auto"
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition duration-200 flex items-center gap-2 mx-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      Submit Donation
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Impact Statement */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">₹500</h4>
              <p className="text-sm text-gray-600">Feeds 10 children for a week</p>
            </div>
            <div className="text-center">
              <Book className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Books</h4>
              <p className="text-sm text-gray-600">Enhance learning experiences</p>
            </div>
            <div className="text-center">
              <Shirt className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Clothes</h4>
              <p className="text-sm text-gray-600">Keep children warm and comfortable</p>
            </div>
            <div className="text-center">
              <ToyBrick className="h-12 w-12 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900">Toys</h4>
              <p className="text-sm text-gray-600">Support healthy development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;