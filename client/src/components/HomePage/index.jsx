import React, {useEffect, useState} from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import socketIOClient from "socket.io-client";

import {Topbar} from '../Topbar';
import { StateSaver } from '../StateSaver';
import Cursor from '../Cursor';

import { Container } from '../subcomponents/Container';
import { Text } from '../subcomponents/Text';

const ENDPOINT = "http://127.0.0.1:3000";

let prevMouseX, prevMouseY, x, y;

const HomePage = () => {
  const [cursors, setCursors] = useState({}); 

  useEffect(() => {
    // Update mouse move
    document.addEventListener('mousemove', e => {
      x = e.offsetX;
      y = e.offsetY;
    });
    document.addEventListener('drag', e => {
      console.log('test');
      x = e.pageX;
      y = e.pageY;
    });
    document.addEventListener('mouseleave', e => {
      x = 5000;
      y = 0;
    });

    // Send mouse movement
    const socket = socketIOClient(ENDPOINT);
    const intervalID = window.setInterval(function(){
      if (prevMouseX !== x || prevMouseY !== y) {
        prevMouseX = x;
        prevMouseY = y;
        socket.emit('mousemove', {mx : x, my : y});
      }
   }, 20);

    // Handle another mouse movement
    socket.on("mousemove", data => {
      const newCursors = {...cursors};
      newCursors[data.id] = {
        mx: data.mx,
        my: data.my,
        number: Object.keys(cursors).length + 1
      }
      setCursors(newCursors);
    });
  }, []);

  return (
    <div>
      <Editor
        resolver={{
          Text,
        }}
      >
        <Frame>
          <Element
            canvas
            is={Container}
            width="40%"
            minHeight="800px"
            padding={['40', '40', '40', '40']}
            background="rgba(255, 255, 255, 1)"
            >
            <Text fontSize={20} text="Hi world!" />
          </Element>
        </Frame>
        <Topbar />
        <StateSaver />
      </Editor>
      {
        Object.values(cursors).map((cursor) => {
          return (
            <Cursor x={cursor.mx} y={cursor.my} number={cursor.number % 3}/>
          )
        }) 
      }
    </div>
  );
}

export default HomePage;