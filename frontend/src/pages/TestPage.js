// import React, { useRef } from 'react';

// const ScrollToDivExample = () => {
//   const divRef1 = useRef(null);
//   const divRef2 = useRef(null);

//   const scrollToDiv = (ref) => {
//     if (ref.current) {
//       ref.current.scrollIntoView({ behavior: 'smooth',
//         block: 'end',
//         inline: 'center' });
//     }
//   };

//   return (
//     <div>
//       <button onClick={() => scrollToDiv(divRef1)}>Scroll to First Div</button>
//       <button onClick={() => scrollToDiv(divRef2)}>Scroll to Second Div</button>
//       <div style={{ height: '100vh', backgroundColor: '#f0f0f0' }}></div>
//       <div ref={divRef1} style={{ height: '200px', backgroundColor: '#d0f0c0' }}>
//         <h2>This is the first div</h2>
//       </div>
//       <div ref={divRef2} style={{ height: '200px', backgroundColor: '#c0d0f0' }}>
//         <h2>This is the second div</h2>
//       </div>
//       <div style={{ height: '100vh', backgroundColor: '#f0c0c0' }}></div>
//     </div>
//   );
// };

// export default ScrollToDivExample;

import React, { useRef, useState, useEffect } from 'react';

const ScrollToDivExample = () => {
  const divRef1 = useRef(null);
  const divRef2 = useRef(null);
  const lastDivRef = useRef(null);
  const [showLastDiv, setShowLastDiv] = useState(false);
  const [targetRef, setTargetRef] = useState(null);

  const scrollToDiv = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
    } else {
      // Store the target ref if it is not rendered yet
      setTargetRef(ref);
      // Trigger rendering of the last div if needed
      setShowLastDiv(true);
    }
  };

  useEffect(() => {
    // If a targetRef is stored and it is now rendered, scroll to it
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'center' });
      setTargetRef(null); // Clear the targetRef once scrolled
    }
  }, [showLastDiv, targetRef]);

  return (
    <div>
      <button onClick={() => scrollToDiv(divRef1)}>Scroll to First Div</button>
      <button onClick={() => scrollToDiv(divRef2)}>Scroll to Second Div</button>
      <button onClick={() => scrollToDiv(lastDivRef)}>Scroll to Last Div</button>
      
      <div style={{ height: '100vh', backgroundColor: '#f0f0f0' }}></div>
      
      <div ref={divRef1} style={{ height: '200px', backgroundColor: '#d0f0c0' }}>
        <h2>This is the first div</h2>
      </div>
      
      <div ref={divRef2} style={{ height: '200px', backgroundColor: '#c0d0f0' }}>
        <h2>This is the second div</h2>
      </div>
      
      {/* Conditionally render the last div */}
      {showLastDiv && (
        <div ref={lastDivRef} style={{ height: '200px', backgroundColor: '#f0c0c0' }}>
          <h2>This is the last div</h2>
        </div>
      )}
      
      <div style={{ height: '100vh', backgroundColor: '#e0e0e0' }}></div>
    </div>
  );
};

export default ScrollToDivExample;
