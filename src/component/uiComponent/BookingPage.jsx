import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingModal from '../uiComponent/BookingModal';
import '../../css/bookingModal.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref'); // optional tracking param, e.g. /book?ref=lead123

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="booking-page">
      <BookingModal isOpen={true} onClose={handleClose} ref={ref} />
    </div>
  );
};

export default BookingPage;