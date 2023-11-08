import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';

function Simple() {
  const [questions, setQuestions] = useState([]);
  const [lastSwipe, setLastSwipe] = useState({ direction: null, question: null });
  const [swipeCounts, setSwipeCounts] = useState({});
  const [numSwipes, setNumSwipes] = useState(0); // Track number of swipes
  const [email, setEmail] = useState(''); // To store the user's email
  const [submittedEmail, setSubmittedEmail]= useState(false);
  const [swipedQuestions, setSwipedQuestions] = useState([]);


  // Fetch questions from the server
  const fetchQuestions = () => {
    fetch('https://serene-retreat-30408-99289cbf5919.herokuapp.com//api/questions')
      .then(response => response.json())
      .then(data => {
        console.log()
        console.log(data)
        setQuestions(data);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });
  };

  // Fetch swipe counts from the server
  const fetchSwipeCounts = () => {
    fetch('https://serene-retreat-30408-99289cbf5919.herokuapp.com//api/swipe-counts')
      .then(response => response.json())
      .then(data => {
        setSwipeCounts(data);
      })
      .catch(error => {
        console.error('Error fetching swipe counts:', error);
      });
  };

  useEffect(() => {
    fetchQuestions();
    fetchSwipeCounts();
  }, []);

const swiped = (direction, question) => {
  console.log('answered: ' + question);
  setLastSwipe({ direction, question });
  setNumSwipes(numSwipes + 1); // Increase swipe count
  setSwipedQuestions(prev => [...prev, question]);
    // Send the swipe data to the server
    fetch('https://serene-retreat-30408-99289cbf5919.herokuapp.com//api/record-swipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, direction }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Swipe recorded', data);
      fetchSwipeCounts();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const submitEmail = () => {
    fetch('https://serene-retreat-30408-99289cbf5919.herokuapp.com//api/store-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Email stored', data);
      setSubmittedEmail(true);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const outOfFrame = (question) => {
    console.log(question + ' left the screen!');
  };

  return (
    <div>
      <h1>Yes or no?</h1>
       {numSwipes === 2 && !submittedEmail && (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to continue"
          />
          <button onClick={submitEmail}>Submit</button>
        </div>
      )}
      {(numSwipes !== 2 || submittedEmail) && <div className='cardContainer'>
        {questions.filter(item => !swipedQuestions.includes(item.question)).map((item, index) =>
          <TinderCard
            className='swipe'
            key={index}
            onSwipe={(dir) => swiped(dir, item.question)}
            onCardLeftScreen={() => outOfFrame(item.question)}
          >
            {/* Inline style added for background opacity */}
            <div style={{ backgroundImage: `url(${item.image_url})`}} className='card'>
              <h3>{item.question} <a href={item.video_url} target="_blank" rel="noopener noreferrer">Video</a></h3>
            </div>
          </TinderCard>
        )}
      </div>}
      {lastSwipe.question && swipeCounts[lastSwipe.question] ? (
        <div>
        <div className='infoText'>
          <h2>You swiped {lastSwipe.direction} on "{lastSwipe.question}"</h2>
        </div>
        <div className='infoText'> <h2>Left swipes: {swipeCounts[lastSwipe.question].left} Right swipes: {swipeCounts[lastSwipe.question].right}</h2></div>
        </div>
      ) : (
        <h2 className='infoText'>Swipe on a card to see results</h2>
      )}
    </div>
  );
}

export default Simple;
