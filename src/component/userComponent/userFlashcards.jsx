// This file has been deleted. Please refer to the git history for its contents.
// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Zap, Loader2 } from 'lucide-react';
// import userApiService, { storage } from '../../apiServices/userDashboardApiService';
// import '../../css/flashcards.css';

// const Flashcards = () => {
//     const [cards, setCards] = useState([]);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [isFlipped, setIsFlipped] = useState(false);
//     const [visible, setVisible] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const load = async () => {
//             try {
//                 const token = storage.get('token');
//                 const res = await userApiService.fetchFlashcards(token);
//                 setCards(res.cards || []);
//             } catch (err) {
//                 setError('Failed to load flashcards.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         load();
//         const t = setTimeout(() => setVisible(true), 50);
//         return () => clearTimeout(t);
//     }, []);

//     useEffect(() => {
//         setCurrentIndex(0);
//         setIsFlipped(false);
//     }, []);

//     if (loading) return (
//         <div className="fc-loading">
//             <Loader2 className="animate-spin" size={28} />
//         </div>
//     );

//     if (error) return <div className="fc-loading">{error}</div>;
//     if (!cards.length) return <div className="fc-loading">No flashcards available yet.</div>;

//     const card = cards[currentIndex];
//     const progress = ((currentIndex + 1) / cards.length) * 100;

//     const handleNext = () => {
//         if (currentIndex < cards.length - 1) {
//             setIsFlipped(false);
//             setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
//         }
//     };

//     const handlePrev = () => {
//         if (currentIndex > 0) {
//             setIsFlipped(false);
//             setTimeout(() => setCurrentIndex(prev => prev - 1), 300);
//         }
//     };

//     return (
//         <div className={`fc-page ${visible ? 'fc-visible' : ''}`}>

//             {/* Header */}
//             <div className="fc-header">
//                 <div className="fc-badge">
//                     <Lightbulb size={11} /> Daily Flashcards
//                 </div>
//                 <h1 className="fc-title">{card.title}</h1>
//                 <p className="fc-subtitle">
//                     Card {currentIndex + 1} of {cards.length}
//                 </p>
//             </div>

//             {/* Flashcard */}
//             <div className="fc-card-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
//                 <div className={`fc-card-inner ${isFlipped ? 'fc-flipped' : ''}`}>

//                     {/* Front — shows tagline */}
//                     <div className="fc-card fc-front">
//                         <div className="fc-card-badge">
//                             <Lightbulb size={11} /> Card {currentIndex + 1}
//                         </div>
//                         <p className="fc-front-text">{card.tagline}</p>
//                         <div className="fc-divider" />
//                         <p className="fc-hint">Click to flip</p>
//                     </div>

//                     {/* Back — shows full content */}
//                     <div className="fc-card fc-back">
//                         <div className="fc-card-badge fc-card-badge--light">
//                             <Zap size={11} /> Key Learning
//                         </div>
//                         <p className="fc-back-text">"{card.content}"</p>
//                     </div>

//                 </div>
//             </div>

//             {/* Progress Bar */}
//             <div className="fc-progress-track">
//                 <div className="fc-progress-fill" style={{ width: `${progress}%` }} />
//             </div>

//             {/* Controls */}
//             <div className="fc-controls">
//                 <button
//                     className={`fc-nav-btn ${currentIndex === 0 ? 'fc-nav-btn--disabled' : ''}`}
//                     onClick={handlePrev}
//                     disabled={currentIndex === 1}
//                 >
//                     <ChevronLeft size={20} />
//                 </button>
//                 <span className="fc-counter">{currentIndex + 1} / {cards.length}</span>
//                 <button
//                     className={`fc-nav-btn ${currentIndex === cards.length - 1 ? 'fc-nav-btn--disabled' : ''}`}
//                     onClick={handleNext}
//                     disabled={currentIndex === cards.length - 1}
//                 >
//                     <ChevronRight size={20} />
//                 </button>
//             </div>

//             {/* Restart */}
//             <button
//                 className="fc-restart-btn"
//                 onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
//             >
//                 <RotateCcw size={14} /> Restart Deck
//             </button>

//         </div>
//     );
// };

// export default Flashcards;