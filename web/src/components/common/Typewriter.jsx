/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 50, delay = 0, loop = false }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeoutId;
    let intervalId;

    const startTyping = () => {
      setIsTyping(true);
      let i = 0;
      setDisplayText('');

      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);

          if (loop) {
            timeoutId = setTimeout(() => {
              setDisplayText('');
              startTyping();
            }, 2000);
          }
        }
      }, speed);
    };

    timeoutId = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay, loop]);

  return (
    <span className="typewriter-text">
      {displayText}
      <span className={`typewriter-cursor ${isTyping ? 'typing' : ''}`}>|</span>
    </span>
  );
};

export default Typewriter;