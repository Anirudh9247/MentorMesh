import React, { useState } from 'react';
import client from '../api/client';

export default function IntentForm({ mentorId, mentorName, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    answer_1: '',
    answer_2: '',
    answer_3: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const questions = [
    {
      id: 'answer_1',
      question: "What specifically do you want to learn or achieve?",
      guidance: "Try to be specific (e.g., specific technologies or concepts) so mentors can help effectively.",
      placeholder: "e.g., I want to understand how to design scalable database schemas for a high-traffic chat app."
    },
    {
      id: 'answer_2',
      question: "What have you already tried or explored on your own?",
      guidance: "Mention any research, articles, tutorials, or code you've already attempted. This helps filter low-effort requests!",
      placeholder: "e.g., I read the SQLAlchemy docs, tried setting up composite indexes, but I'm unsure if my schema scales."
    },
    {
      id: 'answer_3',
      question: "What is your concrete ask for the first session?",
      guidance: "Define a clear, actionable goal for your first meeting.",
      placeholder: "e.g., I would like a 30-minute review of my database models and advice on composite index design."
    }
  ];

  const currentQuestion = questions[step - 1];
  const currentValue = answers[currentQuestion.id];
  const isValid = currentValue.trim().length >= 10;

  const handleNext = () => {
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    if (step < 3) {
      handleNext();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await client.post('/requests', {
        mentor_id: parseInt(mentorId),
        answer_1: answers.answer_1,
        answer_2: answers.answer_2,
        answer_3: answers.answer_3
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit connection request.');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-dark-950/85 backdrop-blur-md transition-opacity duration-350" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-dark-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-lg w-full relative z-10 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer p-1.5 rounded-lg bg-slate-950/20 hover:bg-slate-900 border border-transparent hover:border-slate-800"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white">Request Sent!</h3>
            <p className="text-slate-450 text-sm">
              Your connection request to <strong className="text-slate-200">{mentorName}</strong> was submitted successfully and is now pending.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="text-primary-400 text-xs font-bold uppercase tracking-wider">
                Question {step} of 3
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Request Connection
              </h3>
              <p className="text-slate-450 text-sm">
                Sending request to <span className="text-slate-200 font-semibold">{mentorName}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/40 h-2 rounded-full overflow-hidden border border-slate-900">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Question Text Area */}
            <div className="space-y-3">
              <label className="block text-slate-200 font-bold text-base leading-snug">
                {currentQuestion.question}
              </label>
              
              <div className="text-slate-400 text-xs italic">
                {currentQuestion.guidance}
              </div>

              <textarea
                value={currentValue}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder={currentQuestion.placeholder}
                rows={5}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-2xl p-4 text-slate-100 text-sm placeholder-slate-650 transition-all duration-300 focus:outline-none resize-none"
                required
              />
              
              <div className="flex justify-between items-center text-xs">
                <span className={`${isValid ? 'text-emerald-400' : 'text-amber-500/90'} font-semibold`}>
                  {currentValue.trim().length} / 10 characters minimum
                </span>
                {!isValid && currentValue.trim().length > 0 && (
                  <span className="text-slate-500">Keep typing...</span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                    isValid 
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-md' 
                      : 'bg-slate-800/50 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                    isValid && !submitting
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white shadow-md shadow-primary-600/10' 
                      : 'bg-slate-800/50 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
