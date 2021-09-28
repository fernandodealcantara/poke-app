import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { io } from "socket.io-client";

let socket;

const Room = () => {
  const location = useLocation();
  const ENDPOINT = "localhost:5000";
  
  useEffect(() => {
    const data = queryString.parse(location.search);
    console.log(data);
    socket = io(ENDPOINT);
    console.log(socket);

    return () => {
      socket.emit('disconnect');
    };

  }, [ENDPOINT, location.search]);

  return <div>Room</div>
};

export default Room;