import React from 'react';
import FeedbackDisplay from '../../Components/Common/FeedbackDisplay';
import FeedbackDisplayAdmin from '../../Components/Common/FeedbackDisplayAdmin';
import axios from 'axios';
import { useEffect } from 'react';

const FeedbackPage = () => {
    return (
        <div className="feedback-page">
             <FeedbackDisplay />
        </div>
    );
};

export default FeedbackPage;